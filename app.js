// import React from './react';
// import ReactDOM from './react.dom';
// import { DragDropContext, Draggable, Droppable } from './react-dnd';
// import SC from './sc-api';
const React = window.React;
const ReactDOM = window.ReactDOM;
const { DragDropContext, Draggable, Droppable } = window.ReactBeautifulDnd;
// import { DragDropContext, Draggable, Droppable } from "./react-dnd.js";
const SCAPI = window.SC.Widget;

const autoplay = '?autoplay=1&loop=1&autopause=0';

// Media select component
const Nav = ({fName}) => {
  return(
    <nav>
        <ul class="pagination justify-content-center">
          {availableMedia.map((item) => (
            <li class="page-item"><button class="page-link" onClick={fName}>{item}</button></li>
          ))}
        </ul>
    </nav>
  );
}

// Main player component
const TrackFrame = ({url, media, fName}) => {
  switch(media) {

    // YouTube case
    case 'YouTube':
      if(isBeingSwapped && document.querySelector('audio')) {
        document.querySelector('audio').remove();
      }
      document.body.append(YTframe); 

      function onYouTubeIframeAPIReady() {
        player = new YT.Player('player', {
          height: '300',
          width: '500',
          videoId: getID(url),
          events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
          }
        });
      }

      function onPlayerReady(event) {
        event.target.playVideo();
        playing = true;
        document.querySelector('.pause-btn').style.color = 'rgba(87, 79, 36, 0.799)';
      }

      function onPlayerStateChange(event) {
        if (event.data == 0) {
          event.target.destroy();
          fName();
        }
      }
      
      onYouTubeIframeAPIReady();

      // Make pause button interact with YouTube video
      function bindVideoPausing() {
        pauseBtn = document.querySelector('.pause-btn');
        if(pauseBtn && pauseBtn != null) {
          pauseBtn.addEventListener('click', function() {
            if(player && playing) {
              player.pauseVideo();
              pauseBtn.style.color = 'burlywood';
              playing = false;
            } else if(player && !playing) {
              player.playVideo();
              pauseBtn.style.color = 'rgba(87, 79, 36, 0.799)';
              playing = true;
            }
          });
        }
      }

      // Necessary YT stuff
      function bindDestroyersToBtns(btns) {
        for(let i = 0; i < btns.length; i++) {
          btns[i].addEventListener('click', function() {
            if(player) {
              player.destroy();
              player = null;
            }
          });
        }
      }
      function onLoadBindEventsThatDestroyYTPlayer() {
        trackForm = document.querySelector('form');
        playBtns = document.querySelectorAll('.play-btn');
        navBtns = document.querySelectorAll('.nav-btn');
        if(trackForm && trackForm != null) {
          trackForm.addEventListener('submit', function() {
            playBtns = document.querySelectorAll('.play-btn');
            bindDestroyersToBtns(playBtns);
          });
        }

        if(playBtns && playBtns != null) {
          bindDestroyersToBtns(playBtns);
        }

        if(navBtns && navBtns != null) {
          bindDestroyersToBtns(navBtns);
        }

      };


      onLoadBindEventsThatDestroyYTPlayer();
      bindVideoPausing();
      isBeingSwapped = false;
    break; 

    // Soundcloud case  
    case 'soundcloud':
      if(isBeingSwapped && document.querySelector('audio')) {
        document.querySelector('audio').remove();
      }
      // Soundcloud widget API
      setTimeout(function() {
        const widget1 = SC.Widget(document.querySelector('#player iframe'));
        widget1.bind(SC.Widget.Events.FINISH, function() {
          fName();
        });
        playing = true;

        // Make pause button interact with soundcloud player
        function bindTrackPausing() {
          pauseBtn = document.querySelector('.pause-btn');
          if(pauseBtn && pauseBtn != null) {
            pauseBtn.addEventListener('click', function() {
              if(widget1 && playing) {
                widget1.pause();
                pauseBtn.style.color = 'burlywood';
                playing = false;
              } else if(widget1 && !playing) {
                widget1.play();
                pauseBtn.style.color = 'rgba(87, 79, 36, 0.799)';
                playing = true;
              }
            });
          }
        }
        bindTrackPausing();
      }, 2000);
      isBeingSwapped = false;
    
     
    return(
    <div id={media}>
      <iframe className={media} frameborder="no" allow="autoplay" 
        src={formattedSCsrc(url)} 
        scrolling="no"
        referrerpolicy="no-referrer-when-downgrade"
        seamless>
      </iframe>
    </div>
    );

    // Local audio case
    case 'plik audio':
      setTimeout(function() {
        if(document.querySelector('audio')) {
          const audioPlayer = document.querySelector('audio');
          audioPlayer.addEventListener('ended', (event) => fName());
          document.querySelector('.pause-btn').addEventListener('click', () => {
            if(!audioPlayer.paused) {
              audioPlayer.pause();
              pauseBtn.style.color = 'burlywood';
              playing = false;
            } else {
              audioPlayer.play();
              pauseBtn.style.color = 'rgba(87, 79, 36, 0.799)';
              playing = true;
            }
          });
          const promise = audioPlayer.play();
          if (promise !== undefined) {
            promise.then(_ => {
              console.log("AUTOIPPALY POSZEDŁ");
            }).catch(error => {
              console.log("error atplay !$#$");
              audioPlayer.muted = true;
              audioPlayer.play();
              playing = true;
            });
          }
        }
      }, 1000);

      let audioFrame;
      if(document.querySelector('audio') && isBeingSwapped) {
        document.querySelector('audio').remove(); 
        isVJSAudioRendered = false;
        audioFrame = document.createElement('audio');
        document.querySelector('section#player').appendChild(audioFrame);
        audioFrame.setAttribute('src', url);
        audioFrame.setAttribute('controls', true);
        audioFrame.setAttribute('autoplay', true);
        isVJSAudioRendered = true;
        isBeingSwapped = false;
        break;
      } else if(!isVJSAudioRendered) {
        isBeingSwapped = false;
        return(
        <div id={media.slice(0,3)}>
          <audio id="myAudio" controls autoplay>
            <source src={url} type="audio/mpeg"/>
          </audio>
        </div>
        );
      } 
      
    default:
      console.log("default media case");
  }
}


// List item component  
const Item = ({ index, item, playBtn, deleteBtn }) => (
  <Draggable index={index} draggableId={item.id}>
    {(provided, snapshot) => (
      <li
        className={randomColor(item.id)}
        {...provided.draggableProps}
        {...provided.dragHandleProps}
        ref = {provided.innerRef}
      >
        <button onClick={() => playBtn(item)} class="item-btn play-btn"><i class="arrow right"></i>
        </button>
        <span class="item-text" data-media={item.media}>{item.media == 'plik audio' 
                                                          ? item.fileName : item.trackUrl}</span>
        <button onClick={() => deleteBtn(item)} class=" item-btn delete-btn">X</button>
      </li>
    )}
  </Draggable>
);

// DnD list component
const List = ({ list, onDragEnd, playFunction, deleteFunction }) => (
  <DragDropContext onDragEnd={onDragEnd}>
    <Droppable droppableId="droppable">
      {(provided) => (
        <ul class="list-group" 
        {...provided.placeholder} {...provided.droppableProps}
        ref = {provided.innerRef}>
          {list.map((item, index) => (
              <Item key={item.id} index={index} item={item} 
              playBtn={playFunction} 
              deleteBtn={deleteFunction} />
          ))}
        </ul>
      )}
    </Droppable>
  </DragDropContext>
);


// Transport buttons component
const TrackNav = (props) => {
  return(
    <section id="track-nav">
      <button 
      class="nav-btn previous-btn"><i class="arrow left"
      onClick={props.prevBtn} ></i></button>
      <button class="pause-btn">||</button>
      <button 
      class="nav-btn next-btn"><i class="arrow right"
      onClick={props.nextBtn} ></i></button>
    </section>
  );
}



// Main view render
function App() {
    const [list, setList] = React.useState(INITIAL_LIST);
    const frameCheck = (list) => {
      return list.length
        ? [list[0].media, list[0].trackUrl]
        : [null, null];
    };
    const [state, setState] = React.useState({
      submitMedia: null,
      frameMedia: frameCheck(list)[0],
      submitUrl: null,
      frameUrl: frameCheck(list)[1],
      popUpText: "",
      popUpDisplay: "none",
      shuffle: false
    }); 

    // Radio-select from available media
    const selectMedia = (event) => {
      const radioSelect = event.target.textContent;
      setState({
        ...state,
        submitMedia: radioSelect
      });
      if(document.querySelector('audio').paused) {
        setTimeout(function() {
          document.querySelector('audio').pause();
        }, 1001);
      }
    }

    // What happens after track submission
    const submitTrack = (event) => {
      event.preventDefault();
      let submittedLink = event.target.querySelector('#link-input').value;
      let fileName = null;
      const radioSelect = state.submitMedia;

      // For local audio file
      if(radioSelect == 'plik audio') {
        submittedLink = URL.createObjectURL(event.target.querySelector('#file-input').files[0]);
        const file = event.target.querySelector('#file-input').files[0];
        fileName = event.target.querySelector("#file-input").value.split("fakepath").pop().slice(1);   
      }  

      // url validation
      if(radioSelect != null && radioSelect != 'plik audio') {
        if(!submittedLink.includes(radioSelect.slice(0,5).toLowerCase())) {
          if(submittedLink && submittedLink != null) {
            setState({
              ...state,
              popUpText: "Link nie pochodzi ze wskazanej przez Ciebie platformy... Sprawdź czy Twój wybór jest zgodny.",
              popUpDisplay: "block"
            });  
            return false;
          } else return false;
        }
      } else if(radioSelect != 'plik audio') {
        setState({
          ...state,
          popUpText: "Wybierz którąś z platform!",
          popUpDisplay: "block"
        });
        return false;
      }
      
      if(submittedLink) {
        setState({
          ...state,
          submitUrl: submittedLink
        });
      }
      
      list.push({
        id: (list.length + 1).toString(),
        media: radioSelect,
        trackUrl: submittedLink,
        fileName: fileName
      });
      
      if(list.length == 1 && state.frameUrl == null) {
        console.log(submittedLink);
        setState({
          ...state,
          frameMedia: radioSelect,
          frameUrl: submittedLink,
        });
      }
      
      if(list.length <= 50) {
        localStorage.setItem('playlist', JSON.stringify(list));
      } else {
        setState({
          ...state,
          popUpText: "Jeśli chcesz stworzyć playlistę zawierającą więcej niż 50 utworów musisz się zalogować.",
          popUpDisplay: "block"
        });
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
      setState({
        ...state,
        frameMedia: item.media,
        frameUrl: item.trackUrl,
      });

      // Outline the style of a played item
      const items = document.querySelectorAll('.list-group-item');
      let currentItem;
      let i = 0;
      for(item of items) {
        if(i == itemIndex) {
          item.classList.add('bolded-item');
          currentItem = item;
        } else {
          item.classList.remove('bolded-item');
        }
        i++;
      }

      // Emergency measures
      setTimeout(function() {
        if(!document.querySelector('.column #player') && !document.querySelector('section#player iframe')
        && !document.querySelector('audio')) {
          mayday(currentItem);
        }
      }, 1000);
    }

    // Delete item on button click
    const deleteItem = (target) => {
        const concatted = list.slice(0, list.indexOf(target)).concat(list.slice(list.indexOf(target) + 1));
        setList(list => concatted);
        localStorage.setItem('playlist', JSON.stringify(concatted));
    }

    // Hide alert on click
    const hideAlert = (event) => {
      setState({
        ...state,
        popUpDisplay: "none"
      });
    }

    // Play previous track
    const prevTrack = () => {
      const prevItem = list[list.indexOf(list.find(item => state.frameUrl.includes(item.trackUrl))) - 1];
      playFromList(prevItem);
    }

    // Play next track
    const nextTrack = () => { 
      let nextItem = list[list.indexOf(list.find(item => state.frameUrl.includes(item.trackUrl))) + 1];
      if(state.shuffle) {
        const filteredList = list.filter(item => !state.frameUrl.includes(item.trackUrl));
        nextItem = filteredList[parseInt(Math.random() * (filteredList.length - 1))];
      }
      playFromList(nextItem);
    }

    // Clear playlist
    const clearList = () => {
      setList(list => []);
      localStorage.setItem('playlist', null);
    }

    // Save playlist info
    const tbaAlert = () => {
      setState({
        ...state,
        popUpText: "Obecnie Twoja aktualna playlista zapisuje się za każdym razem w pamięci lokalnej Twojej przeglądarki (lecz bez lokalnych plików audio). W niedługim czasie planujemy uruchomić możliwość rejestracji i zapisywania większej ilości playlist. Stay tuned...",
        popUpDisplay: "block"
      });
    }

    // Shuffle button
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
    }

    // Prevent YouTube API from embedding 2 players
    window.onload = () => {
      if(state.frameMedia == 'YouTube') {
        const foundItem = list.find(item => item.trackUrl == state.frameUrl);
        playFromList(foundItem);
        setTimeout(function() {
          if(document.querySelector('#app ~ #player')) {
            document.querySelector('#app ~ #player').remove();
          }
        }, 200);
      }
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

            <div class="column ">
              <section id="player">
                <TrackFrame media={state.frameMedia} 
                            url={state.frameUrl}
                            fName={nextTrack}/>
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
              <button class="page-link" onClick={tbaAlert}>zapisz playlistę</button>
            </li>
            <li class="page-item">
                <button class="page-link clear-btn" onClick={clearList}>wyczyść playlistę
                </button>
              </li>
            </ul>
          </section>


          <div id="alert" className={state.popUpDisplay}>{state.popUpText} <br></br>
            <button onClick={hideAlert}>OK</button>
          </div>
       
      </div>

    );
}

ReactDOM.render(<App />, document.querySelector('#app'));







