// Function to get all 'mp3' files from IndexedDB
async function getAllMp3Files(dbName, storeName, playlistID) {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(dbName);
        request.onerror = event => reject(event.target.error);

        request.onsuccess = event => {
            const db = event.target.result;
            const transaction = db.transaction(storeName, 'readonly');
            const store = transaction.objectStore(storeName);
            const query = store.get(playlistID);

            query.onerror = event => reject(event.target.error);
            query.onsuccess = event => {
                // Filter mp3 files from results
                const mp3Files = event.target.result.filter(item => {
                    return item.fileName != null;
                    }).map(item => {
                        return item.trackUrl;
                    });
                resolve(mp3Files);
            };
        };
    });
}


async function saveMp3FilesToFolder() {
    try {
        // Get the handle to the directory
        const dirHandle = await window.showDirectoryPicker();
        
        // Retrieve the mp3 files from IndexedDB
        const dbName = ourDBName;
        const storeName = storeID;
        const mp3Files = await getAllMp3Files(dbName, storeName, 'playlist00');
        console.log(mp3Files);
        
        // Save each mp3 file to the selected directory
        for (const file of mp3Files) {
            const fileHandle = await dirHandle.getFileHandle(file.name, { create: true });
            const writableStream = await fileHandle.createWritable();
            await writableStream.write(file); // Assuming file stored as blob in IndexedDB
            await writableStream.close();
        }
        
        alert('Operacja eksportowania zakończona sukcesem!');
    } catch (error) {
        console.error(error);
        alert('Operacja eksportu została przerwana.');
    }
}
