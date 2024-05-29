const ourDBName = 'myDatabase';
const storeID = 'tfikcja';

// Open connection to IndexedDB
function openIndexedDB(dbName) {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(dbName);
  
      request.onupgradeneeded = function(event) {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(storeID)) {
          db.createObjectStore(storeID);
        }
      };
  
      request.onerror = function(event) {
        reject('Error opening IndexedDB', event);
      };
  
      request.onsuccess = function(event) {
        resolve(event.target.result);
      };
    });
}
  
// Save list to IndexedDB
  function saveListToIndexedDB(db, storeName, list, playlistID) {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const putRequest = store.put(list, playlistID); 
  
      putRequest.onerror = function(event) {
        reject('Error storing file in IndexedDB', event);
      };
  
      putRequest.onsuccess = function() {
        resolve('Playlist stored in IndexedDB');
      };
    });
  }
  

// Read list from IndexedDB 
  async function retrieveFromIndexedDB(dbName, storeName, playlistID) {
    try {
        const db = await openIndexedDB(dbName);
        const transaction = db.transaction(storeName, 'readonly');
        const store = transaction.objectStore(storeName);

        const resultPromise = new Promise((resolve, reject) => {
          const getRequest = store.get(playlistID);

          getRequest.onerror = () => {
            reject(new Error('Error retrieving playlist from IndexedDB')); 
          };  
          
          getRequest.onsuccess = (event) => {
            const retrieved = event.target.result;
            if (retrieved) {
              const result = retrieved;
              resolve(result);
            } else {
                resolve([]); 
            }
          };

          transaction.oncomplete = () => {
            db.close();
          }
        });
        
        return await resultPromise; 
    } catch {
        console.error("Retrieving from IDB failed.");
        return [];
    } 
  }


// Get playlists' titles as keys from IndexedDB
  async function retrieveKeysFromStore() {
    const dbName = ourDBName;
    const storeName = storeID;
    try {
      const db = await openIndexedDB(dbName);
      const transaction = db.transaction(storeName, 'readonly');
      const objectStore = transaction.objectStore(storeName);
      
      const resultPromise = new Promise((resolve, reject) => {
        const keysRequest = objectStore.getAllKeys();

        keysRequest.onsuccess = () => {
          console.log('Keys retrieved successfully:', keysRequest.result);
          const result = keysRequest.result;
          if(result) {
            resolve(result);
          } else {
            resolve([]);
          } 
        };

        keysRequest.onerror = () => {
          reject(new Error('Error retrieving keys from IndexedDB')); 
        }; 

        transaction.oncomplete = () => {
          db.close();
        }
      });

      return await resultPromise;
    } catch {
      console.error("Failed to retrieve keys.");
      return [];
    }
  }
  
  

// Executive part
let RETRIEVED_LIST = [];
let retrievedKeys = [];

class IDBPlaylistConnection extends EventTarget {
  retrieveList(playlistID, isUserLoading) {
    (async () => {
      try {
          RETRIEVED_LIST = await retrieveFromIndexedDB(ourDBName, storeID, playlistID);
          this.dispatchEvent(new Event('fetch-list'));
          if(isUserLoading) this.savePlaylistAsDefault(RETRIEVED_LIST);
      } catch (error) {
          console.error('An error occurred while retrieving data:', error);
          RETRIEVED_LIST = [];
      }
    })();
  }
  deletePlaylistFromIDB(playlistID) {
    (async () => {
      try {
        const db = await openIndexedDB(ourDBName);
        const txn = db.transaction(storeID, 'readwrite');
        const store = txn.objectStore(storeID);
        const deleteRequest = store.delete(playlistID);
        deleteRequest.onsuccess = () => {
          console.log("Succesfully deleted: " + deleteRequest.result);
        }
        deleteRequest.onerror = () => {
          console.log("Deletion error: " + deleteRequest.errorCode);
        }
        txn.oncomplete = () => {
          db.close();
        }
      } catch (error) {
        console.error("Deletion failed.");
      }
    })();
  }
  savePlaylistAsDefault(list) {
    (async () => {
      try {
        const db = await openIndexedDB(ourDBName);
        console.log(list);
        console.log(await saveListToIndexedDB(db, storeID, list, 'playlist00'));
      } catch (error) {
        console.error(error);
      }
    })();
  }
}
const onLoadConnection = new IDBPlaylistConnection();
onLoadConnection.retrieveList('playlist00', false);



  
