// Import Firebase modules from Google CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc, collection, getDocs, query, limit, startAfter, startAt, where } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getAnalytics, logEvent } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js";

(function (global) {

    /**
     * Event types for user authentication
     */
    const USER_EVENTS = {
        LOGIN: 'USER_LOGIN',
        LOGOUT: 'USER_LOGOUT',
        REGISTER: 'USER_REGISTER',
        REFRESH: 'USER_REFRESH'
    };

    /**
     * Publish user event to all components
     * @param {string} event - Type of event
     * @param {Object} data - User data object
     */
    function publish(event, data={}) {
        const message = {
            type: event,
            timestamp: Date.now(),
            ...data
        };

        // Broadcast to parent window (if in iframe)
        if (window.parent && window.parent !== window) {
            window.parent.postMessage(message, '*');
        }

        // Broadcast to current window
        window.postMessage(message, window.location.origin);

        console.log(`Broadcasted user event: ${event}`, message);
    }

    /**
     * Initializes the firebase using firebase config
     */
    async function init() {
        try{
            const config = await (await fetch("firebase-config.json")).json();
            // Initialize Firebase
            console.log('Loading Firebase: ',config);
            this.app = initializeApp(config);
            this.db = getFirestore(this.app);
            this.auth = getAuth(this.app);
            this.analytics = getAnalytics(this.app);
            this.user = null;
            this.userData = null;
            // Listen for auth state changes
            onAuthStateChanged(this.auth, async (user) => {
                this.user = user;
                if (user && user.email) {
                    console.log("Auth state: user and email present", user.email);
                    // Fetch user object from Firestore 'users' collection by email
                    try {
                        const userDocRef = doc(this.db, 'users', user.uid);
                        const userDocSnap = await getDoc(userDocRef);
                        if (userDocSnap.exists()) {
                            this.userData = { id: userDocSnap.id, ...userDocSnap.data() };
                            this.log('USER_LOGIN', { email: user.email });
                            // Broadcast user login event
                            this.publish(USER_EVENTS.REFRESH, this.userData);
                        } else {
                            // Create user object if it doesn't exist
                            const newUser = {
                                id: user.uid,
                                email: user.email,
                                name: user.displayName || '',
                                image: user.photoURL || '',
                                contact: user.phoneNumber || '',
                                role: 'USER'
                            };
                            await setDoc(userDocRef, newUser);
                            this.userData = newUser;
                            console.log("Created new user in Firestore:", newUser);
                            this.log(USER_EVENTS.REGISTER, this.userData);
                            // Broadcast user registration event
                            this.publish(USER_EVENTS.REFRESH, this.userData);
                           
                        }
                        console.log("User signed in:", user, "User data:", this.userData);
                    } catch (err) {
                        this.userData = null;
                        console.error("Failed to fetch or create user data from Firestore:", err);
                    }
                } else {
                    this.log(USER_EVENTS.LOGOUT, this.userData);
                    this.userData = null;
                    console.log("User signed out");
                    // Broadcast logout event
                    this.publish(USER_EVENTS.REFRESH, null);
                }
            });
            console.log("Loaded Database: ",this.db);
            console.log("Loaded Auth: ",this.auth);
            console.log("Loaded Analytics: ",this.analytics);
        }catch(err){
            console.error(err);
        }
        
    }

    /**
     * Login with Google using Firebase Auth
     */
    async function loginWithGoogle() {
        if (!this.auth) throw new Error("Firebase Auth not initialized");
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(this.auth, provider);
            // user object will be updated by onAuthStateChanged
            return result.user;
        } catch (err) {
            console.error("Google login failed", err);
            throw err;
        }
    }

    /**
     * Logout user
     */
    async function logout() {
        if (!this.auth) throw new Error("Firebase Auth not initialized");
        try {
            await signOut(this.auth);
            // Logout event will be handled by onAuthStateChanged
        } catch (err) {
            console.error("Logout failed", err);
            throw err;
        }
    }

    /**
     * Get the current user data object from Firestore
     */
    function getUser() {
        return this.userData;
    }

    /**
     * Read data from Firestore
     * @param {string} collectionName - Firestore collection name
     * @param {Object} [options] - Query options
     * @param {string} [options.docId] - Document ID to fetch a single document
     * @param {number} [options.size=20] - Number of documents per page when fetching collection
     * @param {Object} [options.lastDoc] - Last document from previous page for pagination
     * @param {Object} [options.search] - Search options
     * @param {string} [options.search.key] - Field name to search in
     * @param {any} [options.search.value] - Value to search for
     * @returns {Promise<{data: Array<{id: string, [key: string]: any}>, hasMore: boolean, lastDoc: Object}>} Returns paginated data with the following properties:
     * - data: Array of documents with their IDs and data
     * - hasMore: Indicates if there are more documents available
     * - lastDoc: Last document from current page for pagination
     */
    async function read(collectionName, options = {docId: null, size: 20, lastDoc: null, search: { key: null, value: null }}) {
        if (options.docId) {
            const docRef = doc(this.db, collectionName, options.docId);
            const docSnap = await getDoc(docRef);
            const docData = docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
            return {
                data: docData ? [docData] : [],
                hasMore: false,
                lastDoc: docData
            };
        } 
        else {
            const collectionRef = collection(this.db, collectionName);
            const pageSize = Math.max(1, Math.min(options.size, 100)); // Limit page size between 1 and 100
            
            let q;
            if (!options.lastDoc) {
                // First page
                if (options.search?.key && options.search?.value !== null) {
                    q = query(collectionRef, 
                        where(options.search.key, '==', options.search.value),
                        limit(pageSize + 1)
                    );
                } else {
                    q = query(collectionRef, limit(pageSize + 1));
                }
            } else {
                // Subsequent pages using the last document as cursor
                if (options.search?.key && options.search?.value !== null) {
                    q = query(collectionRef, 
                        where(options.search.key, '==', options.search.value),
                        startAfter(options.lastDoc),
                        limit(pageSize + 1)
                    );
                } else {
                    q = query(collectionRef, 
                        startAfter(options.lastDoc),
                        limit(pageSize + 1)
                    );
                }
            }
            
            const querySnapshot = await getDocs(q);
            const docs = querySnapshot.docs.slice(0, pageSize);
            const hasMore = querySnapshot.docs.length > pageSize;
            
            return {
                data: docs.map(doc => ({ id: doc.id, ...doc.data() })),
                hasMore,
                lastDoc: docs[docs.length - 1] || null
            };
        }
    }

    /**
     * Write data to Firestore
     * @param {string} collectionName - Firestore collection name
     * @param {string} docId - Document ID
     * @param {Object} data - Data to write
     * @returns {Promise<void>}
     */
    async function write(collectionName, docId, data) {
        const docRef = doc(this.db, collectionName, docId);
        await setDoc(docRef, data, { merge: true });
    }

    /**
     * Log an event to Firebase Analytics
     */
    function log(eventName, params) {
        if (this.analytics) {
            logEvent(this.analytics, eventName, params);
        } else {
            console.warn('Analytics not initialized');
        }
    }

    // Expose the library
    global.Firebase = {
        init,
        read,
        write,
        loginWithGoogle,
        logout,
        getUser,
        log,
        publish
    };

})(window);
