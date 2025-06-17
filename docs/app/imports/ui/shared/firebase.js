// Import Firebase modules from Google CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc, collection, getDocs, query, limit, startAfter, startAt } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

(function (global) {

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
            console.log("Loaded Database: ",this.db);
        }catch(err){
            console.error(err);
        }
        
    }

    /**
     * Read data from Firestore
     * @param {string} collectionName - Firestore collection name
     * @param {Object} [options] - Query options
     * @param {string} [options.docId] - Document ID to fetch a single document
     * @param {number} [options.size=20] - Number of documents per page when fetching collection
     * @param {Object} [options.lastDoc] - Last document from previous page for pagination
     * @returns {Promise<{data: Array<{id: string, [key: string]: any}>, hasMore: boolean, lastDoc: Object}>} Returns paginated data with the following properties:
     * - data: Array of documents with their IDs and data
     * - hasMore: Indicates if there are more documents available
     * - lastDoc: Last document from current page for pagination
     */
    async function read(collectionName, options = {docId: null, size: 20, lastDoc: null}) {
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
                q = query(collectionRef, limit(pageSize + 1));
            } else {
                // Subsequent pages using the last document as cursor
                q = query(collectionRef, startAfter(options.lastDoc), limit(pageSize + 1));
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

    // Expose the library
    global.Firebase = {
        init,
        read,
        write,
    };

})(window);
