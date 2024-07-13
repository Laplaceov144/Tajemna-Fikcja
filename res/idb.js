function getCSRFToken(name) {
    let initValue = null;
    if (document.cookie && document.cookie !== '') {
        const splt = document.cookie.split(';');
        for (let i = 0; i < splt.length; i++) {
            const trimmed = splt[i].trim();
            if (trimmed.substring(0, name.length + 1) === (name + '=')) {
                initValue = decodeURIComponent(trimmed.substring(name.length + 1));
                break;
            }
        }
    }
    return initValue;
}

export default class IDBPlaylistConnection {
    constructor() {
        this.dbName = 'myDatabase';
        this.storeID = 'tfikcja';
        this.defaultPlaylist = 'playlist00';
    }    

    openIndexedDB() {
        const storeID = this.storeID;
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName);

            request.onupgradeneeded = function(event) {
                const db = event.target.result;
                if(!db.objectStoreNames.contains(storeID)) {
                    db.createObjectStore(storeID);
                }
            }

            request.onerror = function(event) {
                reject('Error opening IndexedDB', event);
            }

            request.onsuccess = function(event) {
                resolve(event.target.result);
            }
        });
    }

    saveListToIndexedDB(dbConn, list, playlistID) {
        const storeName = this.storeID;
        return new Promise((resolve, reject) => {
            const txn = dbConn.transaction(storeName, 'readwrite');
            const store = txn.objectStore(storeName);
            const putRequest = store.put(list, playlistID);

            putRequest.onerror = function(event) {
                reject('Error storing file in IndexedDB', event);
            }

            putRequest.onsuccess = function(event) {
                resolve('Playlist stored in IndexedDB');
            }
        });
    }

    async retrieveListFromIDB(playlistID, isUserLoading) {
        const dbName = this.dbName;
        const storeName = this.storeID;
        try {
            const dbConn = await this.openIndexedDB();
            const txn = dbConn.transaction(storeName, 'readonly');
            const store = txn.objectStore(storeName);

            const resultPromise = new Promise((resolve, reject) => {
                const getRequest = store.get(playlistID);

                getRequest.onerror = () => {
                    reject(new Error('Error retrieving playlist from IndexedDB'));
                }

                getRequest.onsuccess = (event) => {
                    const retrieved = event.target.result;
                    if(retrieved) {
                        let result = retrieved;

                        // Looks like Firefox is not supporting storing audio files in IDB
                        if(navigator.userAgent.includes('Firefox')) {
                            result = result.filter(item => item.media != 'plik audio');
                        }

                        if(isUserLoading) this.savePlaylistAsDefault(result);
                        resolve(result);
                    } else {
                        resolve([]);
                    }
                }

                txn.oncomplete = () => {
                    dbConn.close();
                }
            });

            return await resultPromise;
        } catch {
            console.error("Retrieving from IDB failed");
            return [];
        }
    }

    async retrieveKeysFromStore() {
        const storeName = this.storeID;
        try {
            const dbConn = await this.openIndexedDB();
            const txn = dbConn.transaction(storeName, 'readonly');
            const objectStore = txn.objectStore(storeName);
            
            const resultPromise = new Promise((resolve, reject) => {
                const keysRequest = objectStore.getAllKeys();

                keysRequest.onsuccess = () => {
                    console.log("Keys retrieved successfully: ", keysRequest.result);
                    const result = keysRequest.result;
                    if(result) {
                        resolve(result);
                    } else {
                        resolve([]);
                    }
                }

                keysRequest.onerror = () => {
                    reject(new Error('Error retrieving keys from IndexedDB'));
                }

                txn.oncomplete = () => {
                    dbConn.close();
                }
            });

            return await resultPromise;
        } catch {
            console.error("Failed to retrieve keys.");
            return [];
        }
    }

    async deletePlaylistFromIDB(playlistID) {
        const storeID = this.storeID;
        try {
            const dbConn = await this.openIndexedDB();
            const txn = dbConn.transaction(storeID, 'readwrite');
            const store = txn.objectStore(storeID);
            const deleteRequest = store.delete(playlistID);
            deleteRequest.onsuccess = () => {
                console.log("Successfully deleted: " + deleteRequest.result);
            }
            deleteRequest.onerror = () => {
                console.log("Deletion error: " + deleteRequest.errorCode);
            }
            txn.oncomplete = () => {
                dbConn.close();
            }
        } catch(error) {
            console.error("Deletion failed in 'catch' clause.");
        }
    }

    async savePlaylistAsDefault(list) {
        try {
            const dbConn = await this.openIndexedDB();
            console.log(await this.saveListToIndexedDB(dbConn, list, this.defaultPlaylist));
            setTimeout(dbConn.close(), 3500);
        } catch(error) {
            console.error(error);
        }
    }

    async getAllAudioFiles() {
        const storeName = this.storeID;
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName);
            request.onerror = event => reject(event.target.error);

            request.onsuccess = event => {
                const dbConn = event.target.result;
                const txn = dbConn.transaction(storeName, 'readonly');
                const store = txn.objectStore(storeName);
                const query = store.get('playlist00');

                query.onerror = event => reject(event.target.error);
                query.onsuccess = event => {
                    const audioFiles = event.target.result.filter(item => {
                        return item.media == 'plik audio';
                    }).map(item => {
                        return item.trackUrl;
                    });
                    resolve(audioFiles);
                }
            }
        });
    }

    async saveAudioFilesToFolder() {
        try {
            const dirHandle = await window.showDirectoryPicker();
            const audioFiles = await this.getAllAudioFiles();

            for(const file of audioFiles) {
                const fileHandle = await dirHandle.getFileHandle(file.name, { create: true });
                const writableStream = await fileHandle.createWritable();
                await writableStream.write(file);
                await writableStream.close();
            }

            alert('Operacja eksportowania zakończona sukcesem!');
        } catch(error) {
            console.error(error);
            alert('Operacja eksportu została przerwana.');
        }
    }

    async getHashLinkFromServer(list, isUserSubmitting) {
        
        const formatted = list.map((item, index) => {
            return {
                id: index + 1,
                trackURL: item.media == 'plik audio' ? item.fileName : item.trackUrl,
                medium: item.media
            }
        });
        const dataToSend = {
            list: formatted,
            deviceInfo: navigator.userAgent,
            hashLinkRequest: isUserSubmitting 
        }

        const resultPromise = new Promise((resolve, reject) => {
            fetch(`https://laplaceov144.pythonanywhere.com/api/submit-playlist/`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'X-CSRFToken': getCSRFToken('csrftoken')
                },
                body: JSON.stringify(dataToSend)
    
            }).then((response) => response.json()).then(data => {
    
                if (data.status === 'success' && data.hash_link) {
    
                    if(isUserSubmitting) console.log('Generated Hash Link:', data.hash_link);
                    resolve(data.hash_link);
    
                } else if (data.status === 'empty_playlist') {
    
                    console.warn(data.message);
                    resolve(null);
                }
    
            }).catch((error) => reject(console.error('Error: ', error)));
        });

        return await resultPromise;
    }

    async fetchListFromHashLink(hashLink) {
        const dataToSend = { hashCode: hashLink };
        
        const resultPromise = new Promise((resolve, reject) => {
            fetch(`https://laplaceov144.pythonanywhere.com/api/fetch-playlist/`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'X-CSRFToken': getCSRFToken('csrftoken')
                },
                body: JSON.stringify(dataToSend)
    
            }).then((response) => response.json()).then(data => {
                    const fetchedData = data.playlist;

                    const formattedList = fetchedData.filter(item => item.medium != 'plik audio')
                        .map((item, index) => {
                            return {
                                id: (index + 1).toString(),
                                media: item.medium,
                                trackUrl: item.url,
                                fileName: null
                            }
                        }).reduce((acc, curr) => {   // remove duplicates in case they would occurr
                            return acc.includes(curr)
                                ? acc
                                : [...acc, curr];
                            }, []);
                    resolve(formattedList);

            }).catch(error => reject(console.error('Error: ' + error)));
        });

        return await resultPromise;
    }
}