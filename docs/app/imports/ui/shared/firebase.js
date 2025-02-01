// Import Firebase modules from Google CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

var db;

(function (global) {

    /**
     * Initializes the firebase using firebase config
     */
    async function init() {
        try{
            const config = await (await fetch("ui/firebase-config.json")).json();
            // Initialize Firebase
            console.log('Loading Firebase: ',config);
            this.app = initializeApp(config);
            db = getFirestore(app);
        }catch(err){
            console.error(err);
        }
        
    }

    /**
     * Read data from Firestore
     * @param {string} collectionName - Firestore collection name
     * @param {string} docId - (Optional) Document ID to fetch
     * @returns {Promise<Object>} - Returns document data or all collection documents
    */
    async function read(collectionName, docId = null) {
        if (docId) {
            const docRef = doc(db, collectionName, docId);
            const docSnap = await getDoc(docRef);
            return docSnap.exists() ? docSnap.data() : null;
        } else {
            const querySnapshot = await getDocs(collection(db, collectionName));
            return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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
        const docRef = doc(db, collectionName, docId);
        await setDoc(docRef, data, { merge: true });
    }

    // Expose the library
    global.Firebase = {
        init,
        read,
        write,
    };
})(window);
