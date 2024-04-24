
// Main view render
function App() {
    
    // Set initial list and state
    const [list, setList] = React.useState(RETRIEVED_LIST);
    const frameCheck = (list) => {
      list = formatList(list);
      return list.length
        ? [list[0].media, list[0].trackUrl]
        : [null, null];
    };
    const [state, setState] = React.useState({
      submitMedia: null,
      frameMedia: frameCheck(list)[0],
      submitUrl: null,
      frameUrl: frameCheck(list)[1],
      popUpText: [],
      popUpDisplay: "none",
      saveWindowDisplay: "none",
      loadWindowDisplay: "none",
      overlayDisplay: "none",
      shuffle: false,
      savedPlaylistsIDs: []
    }); 

    // Await for playlist to be retrieved from IDB and then re-render
    onLoadConnection.addEventListener('fetch-list', () => {
      const formatted = formatList(RETRIEVED_LIST);
      console.log(formatted);
      setList(list => formatted);
      setState({
        ...state,
        frameMedia: frameCheck(formatted)[0],
        frameUrl: frameCheck(formatted)[1]
      });
    }); 

    // Radio-select from available media
    const selectMedia = (event) => {
      const radioSelect = event.target.textContent;
      setState({
        ...state,
        submitMedia: radioSelect
      });
      preventAudioPlay();
    }

    // What happens after submitting a track
    const submitTrack = (event) => {
      event.preventDefault();
      let submittedLink = event.target.querySelector('#link-input').value;
      let fileName = null;
      const radioSelect = state.submitMedia;

      // For mp3 file
      if(radioSelect == 'plik audio') {
        submittedLink = event.target.querySelector('#file-input').files[0];
        fileName = event.target.querySelector("#file-input").value.split("fakepath").pop().slice(1);   
      }  

      // Validate url pasted by the user
      let popUpText;
      let isValid;
      if(radioSelect && radioSelect != 'plik audio') {
        if(!submittedLink.includes(radioSelect.slice(0,5).toLowerCase())) {
          if(submittedLink && submittedLink != null) {
            popUpText = "Link ma niewłaściwy format lub nie pochodzi ze wskazanej przez Ciebie platformy... Sprawdź czy Twój wybór jest zgodny.";
          }
        } else if(submittedLink.includes('on.s')) {
          popUpText = "Link skrócony z Soundclouda nie zadziała. Wklej go tutaj w standardowej postaci.";
        } else if(submittedLink.includes('spotify') && submittedLink.includes('album')) {
          popUpText = "Link do albumu ze Spotify nie zadziała. Wklej link do pojedynczego tracka.";
        } else isValid = true;

      } else if(radioSelect != 'plik audio') {
        popUpText = "Wybierz którąś z platform!";
      } else isValid = true;

      if(popUpText) {
        popUpText = [popUpText];
        setState({
          ...state,
          popUpText: popUpText,
          popUpDisplay: "alert-block",
          overlayDisplay: "block"
        });
        preventAudioPlay();
      }


      if(submittedLink && isValid) {
        setState({
          ...state,
          submitUrl: submittedLink
        });
        list.push({
          id: (list.length + 1).toString(),
          media: radioSelect,
          trackUrl: submittedLink,
          fileName: fileName
        });
        preventAudioPlay();
      }
      
      
      // When list was empty before, then set the submitted track as player's source
      if(list.length == 1 && state.frameUrl == null) {
        setState({
          ...state,
          frameMedia: radioSelect,
          frameUrl: submittedLink,
        });
      }
      
      if(list.length <= 50) {
        setTimeout(async function() {
          try {
            const db = await openIndexedDB(ourDBName);
            console.log(await saveListToIndexedDB(db, storeID, list, 'playlist00'));
          } catch (error) {
            console.error(error);
          }
        }, 50);
      } else {
        setState({
          ...state,
          popUpText: "Jeśli chcesz stworzyć playlistę zawierającą więcej niż 50 utworów musisz się zalogować.",
          popUpDisplay: "alert-block",
          overlayDisplay: "block"
        });
        preventAudioPlay();
      }
      event.target.querySelector('#link-input').value = null;
      event.target.querySelector('#file-input').value = null;
    }


    // DnD stuff
    const handleDragEnd = ({ destination, source }) => {
        if (!destination) return;
        setList(reorder(list, source.index, destination.index));
    }


    // Play track from list
    const playFromList = (item) => {
      isBeingSwapped = true;
      const itemIndex = list.indexOf(item);
      console.log(item);
      setState({
        ...state,
        frameMedia: item.media,
        frameUrl: item.trackUrl,
      });

      // Outline currently played item's style
      outlineItem(itemIndex);
      const currentItem = outlineItem(itemIndex);

      // Make page reload in case iframe/player is not rendered after 1s
      // (which presumably points to some unknown error)
      setTimeout(function() {
        if(!document.querySelector('.column section #player') && !document.querySelector('section#player iframe') 
        && !document.querySelector('audio')) {
          mayday(currentItem, list);
        }
      }, 2000);
    }

    // Delete item on button click (and save updated playlist to IDB)
    const deleteItem = (target) => {
        const concatted = list.slice(0, list.indexOf(target)).concat(list.slice(list.indexOf(target) + 1));
        setList(list => concatted);
        setTimeout(async function() {
          try {
            const db = await openIndexedDB(ourDBName);
            console.log(await saveListToIndexedDB(db, storeID, concatted, 'playlist00'));
          } catch (error) {
            console.error(error);
          }
        }, 50);
    }

    // Hide alert on click
    const hideAlert = () => {
      setState({
        ...state,
        popUpDisplay: "none",
        overlayDisplay: "none"
      });
      preventAudioPlay();
    }

    // Play previous track
    const prevTrack = () => {
      let prevItem;
      if(state.frameMedia == 'plik audio') {
        const currFromListTitle = document.querySelector('.bolded-item span').innerText;
        prevItem = list[list.indexOf(list.find(item => currFromListTitle == item.fileName)) - 1];
      } else {
        prevItem = list[list.indexOf(list.find(item => state.frameUrl.includes(item.trackUrl))) - 1];
      }
      playFromList(prevItem);
    }

    // Play next track
    const nextTrack = () => { 
      let nextItem;
      if(state.frameMedia == 'plik audio') {
        const currFromListTitle = document.querySelector('.bolded-item span').innerText;
        nextItem = list[list.indexOf(list.find(item => currFromListTitle == item.fileName)) + 1];
        if(state.shuffle) {
          const filteredList = list.filter(item => item != nextItem);
          nextItem = filteredList[parseInt(Math.random() * (filteredList.length - 1))];
        }
      } else if(state.shuffle) {
        const filteredList = list.filter(item => !state.frameUrl.includes(item.trackUrl));
        nextItem = filteredList[parseInt(Math.random() * (filteredList.length - 1))];
      } else {
        nextItem = list[list.indexOf(list.find(item => state.frameUrl.includes(item.trackUrl))) + 1];
      }
      console.log(nextItem);
      playFromList(nextItem);
    }


    // Save playlist window
    const showSaveWindow = () => {
      if(state.savedPlaylistsIDs.length >= 10) {
        setState({
          ...state,
          popUpDisplay: "alert-block",
          popUpText: ["Masz osiągnięty limit dziesięciu playlist. Aby usunąć którąś z nich przejdź do menu 'wczytaj playlistę'."],
          overlayDisplay: "block"
        });
      } else {
        setState({
          ...state,
          saveWindowDisplay: "block",
          overlayDisplay: "block"
        });
      }
      preventAudioPlay();
    }

    // Load playlist window
    const showLoadWindow = () => {
      (async () => {
        try {
           retrievedKeys = await retrieveKeysFromStore();
           setState({
            ...state,
            loadWindowDisplay: "block",
            overlayDisplay: "block",
            savedPlaylistsIDs: retrievedKeys.filter(item => item != 'playlist00')
           });
           preventAudioPlay();
        } catch (error) {
          console.error("Error retrieveing keys from store: ", error);
        }
      })();
    }
    

    // Shuffle button logic
    const shuffle = (event) => {
      const shuffleBtn = event.target;
      if(state.shuffle) {
        setState({
          ...state,
          shuffle: false
        });
        shuffleBtn.textContent = 'shuffle';
        shuffleBtn.style.color = 'black';
      } else {
        setState({
          ...state,
          shuffle: true
        });
        shuffleBtn.textContent = 'shuffle on';
        shuffleBtn.style.color = 'burlywood';
      } 
      preventAudioPlay();
    }

    // Prevent YouTube API from embedding 2 players at the same time
    setInterval(function() {
      if(document.querySelector('#app ~ iframe#player')) {
        const playerSrc = document.querySelector('#app ~ iframe#player').getAttribute('src');
        const extractedID = playerSrc.split('embed/')[1].slice(0,9);
        const foundItem = list.find(item => item.trackUrl.includes(extractedID));
        document.querySelector('#app ~ #player').remove();
        setState({
          ...state,
          frameUrl: foundItem.trackUrl,
          frameMedia: 'YouTube'
        });
      }
    }, 800);

    // Handle playlist saving
    const handlePlaylistSaving = (event) => {
      event.preventDefault();
      const playlistTitle = event.target.querySelector('#title-input').value;
      if(playlistTitle) {
        setTimeout(async function() {
          try {
            const db = await openIndexedDB(ourDBName);
            console.log(await saveListToIndexedDB(db, storeID, list, playlistTitle));
          } catch (error) {
            console.error(error);
          }
        }, 50);
        event.target.querySelector('#title-input').value = null;
        setState({
          ...state,
          saveWindowDisplay: "none",
          overlayDisplay: "none"
        }); 
        preventAudioPlay();
      } else return false;
    }

    // Close save window
    const closeSaveWindow = (event) => {
      setState({
        ...state,
        saveWindowDisplay: "none",
        overlayDisplay: "none"
      });
      preventAudioPlay();
      event.target.nextElementSibling.querySelector('#title-input').value = null;
    }

    // Close load window
    const closeLoadWindow = () => {
      setState({
        ...state,
        loadWindowDisplay: "none",
        overlayDisplay: "none"
      });
      preventAudioPlay();
    }

    // Load selected playlist from IDB
    const loadPlaylist = (event) => {
      event.preventDefault();
      const inputs = event.target.querySelectorAll('.radio-box');
      const pickedTitle = [...inputs].find(input => input.checked).value;
      setState({
        ...state,
        loadWindowDisplay: "none",
        overlayDisplay: "none"
      });
      onLoadConnection.retrieveList(pickedTitle); 
    }

    // Delete playlist from IDB
    const deletePlaylist = (event) => {
      event.preventDefault();
      const playlistTitle = event.target.parentElement.querySelector('label').innerText;
      onLoadConnection.deletePlaylistFromIDB(playlistTitle);
      const filteredTitles = state.savedPlaylistsIDs.filter(item => item != playlistTitle);
      setState({
        ...state,
        savedPlaylistsIDs: filteredTitles
      });
      preventAudioPlay();
    }

    // Show info
    const showInfo = () => {
      setState({
        ...state,
        popUpText: infoText,
        popUpDisplay: "info-text",
        overlayDisplay: "block"
      });
      preventAudioPlay();
    }

    return(
      <div>
           <TrackNav 
            prevBtn={prevTrack} nextBtn={nextTrack}
           />
           <button class="shuffle-btn" onClick={shuffle}>shuffle</button>
          <Nav fName={selectMedia} mediaList={availableMedia}/>

            <form class="pagination justify-content-center" onSubmit={submitTrack}>
              <input id="link-input" type="text" placeholder="wybierz medium i wklej tutaj link..." 
              className={state.submitMedia == 'plik audio' ? 'link-input-hidden' : null} />
              <input type="file" id="file-input" name="audio" accept=".mp3"
              className={state.submitMedia == 'plik audio' ? 'file-input-visible' : 'file-input'}/>
              <button type="submit">dodaj</button>
            </form>

          <div class="row">

            <div class="column">
              <section id="player">
                <TrackFrame media={state.frameMedia} 
                            trackURL={state.frameUrl}
                            nextTrackFunc={nextTrack}/>
              </section>
            </div>

            <div class="column">
             
              <List list={list} onDragEnd={handleDragEnd} 
                playFunction={playFromList} 
                deleteFunction={deleteItem} /> 
  
            </div>
          
          </div>

          <section id="special-buttons">
            <ul>
            <li class="page-item">
              <button class="page-link" onClick={showSaveWindow}>zapisz playlistę</button>
            </li>
            <li class="page-item">
                <button class="page-link clear-btn" onClick={showLoadWindow}>wczytaj playlistę
                </button>
              </li>
            </ul>
          </section>


          <div id="alert" className={state.popUpDisplay}> {state.popUpText.map((item) => {
            return <p>{item}</p>;
                })}
            <button onClick={hideAlert}>OK</button>
          </div>

          <SaveForm display={state.saveWindowDisplay} saveFunc={handlePlaylistSaving}
                    xFunc={closeSaveWindow}>
          </SaveForm>

          <LoadForm display={state.loadWindowDisplay} titles={state.savedPlaylistsIDs}
                    loadFunc={loadPlaylist} xFunc={closeLoadWindow} deleteFunc={deletePlaylist}>
          </LoadForm>

          <Overlay display={state.overlayDisplay}></Overlay>

          <div id="info-btn">
            <button onClick={showInfo}>?</button>
          </div>
       
      </div>

    );
}

ReactDOM.render(<App />, document.querySelector('#app'));







