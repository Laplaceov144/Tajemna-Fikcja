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


// YouTube
const getID = (url) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);

  return (match && match[2].length === 11)
    ? match[2]
    : null;
}
const formattedYTsrc = (url) => '//www.youtube.com/embed/' + getID(url) + '?&autoplay=1';





// soundcloud
const formattedSCsrc = (inputURL) => 'https://w.soundcloud.com/player/?url=https%3A' + inputURL.slice(6) + '&auto_play=true';

// Media select component
const availableMedia = ['YouTube', 'soundcloud', 'plik audio'];
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


// YouTube API stuff
var YTframe = document.createElement('div');
YTframe.setAttribute('id', 'player');
var tag = document.createElement('script');
var player;
tag.src = "./yt-api.js";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

// Necessary global variables
let playBtns, trackForm, navBtns, pauseBtn, playing;

// Main player component
const TrackFrame = ({url, media, fName}) => {
  
  switch(media) {
    case 'YouTube':
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

      // Necassary YT stuff
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
  
    break; 


    case 'soundcloud':

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
    

    return(
    <div id={media}>
      <iframe className={media} frameborder="no" allow="autoplay" 
      src={media == "soundcloud" ? formattedSCsrc(url) : 
           media == 'YouTube' ? formattedYTsrc(url) : url} 
      scrolling="no"
      referrerpolicy="no-referrer-when-downgrade"
     seamless>

    </iframe>
    </div>
    );

    case 'plik audio':
      console.log(url);
      if(document.querySelector('audio')) {
        document.querySelector('audio').remove();
      }
      setTimeout(function() {
        const audioElement = document.getElementById('myAudio');
        audioElement.play().catch(function(error) {
          console.log("AUTOPLAY BLOCKED ! !!!  ! !  H IO I  HELLLOO");
        });
      }, 2000);
      return(
        <div id={media.slice(0,3)}>
          <audio id="myAudio" controls autoplay>
            <source src={url} type="audio/mpeg"/>
          </audio>
        </div>
      );
    default:
      console.log("default media XFJWDIARFADHFIEQWJF!!!");
  }

}

// Recover data from local storage
let INITIAL_LIST = [];
if(localStorage.getItem('playlist')) {
  const retrieved = JSON.parse(localStorage.getItem('playlist'));
  INITIAL_LIST = retrieved != null ? retrieved : [];
}


// Reorder list items after mouse drop
const reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
  
    return result;
  };

// Pseudo-randomize list-item background color
const randomColor = (id) => {
  let clr = parseInt(id) % 8;
  switch(clr) {
    case 0:
      clr = "info";
      break;
    case 1:
      clr = "secondary";
      break;
    case 2:
      clr = "success";
      break;
    case 3:
      clr = "danger";
      break;
    case 4:
      clr = "warning";
      break;
    case 5:
      clr = "primary";
      break;
    case 6:
      clr = "light";
      break;
    case 7:
      clr = "dark";
      break;
    default:
      clr = "primary";
  }
  return "list-group-item list-group-item-" + clr;
};


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
    const [selectedFile, setSelectedFile] = React.useState(null);

    const [state, setState] = React.useState({
      submitMedia: null,
      frameMedia: frameCheck(list)[0],
      submitUrl: null,
      frameUrl: frameCheck(list)[1],
      popUpText: "",
      popUpDisplay: "none"
    }); 
    console.log(state.frameUrl);

    const selectMedia = (event) => {
      setState({
        ...state,
        submitMedia: event.target.textContent
      });
      console.log(state.submitMedia);
    }

    const submitTrack = (event) => {
      event.preventDefault();
      let submittedLink = event.target.querySelector('#link-input').value;
      let fileName = null;
      const radioSelect = state.submitMedia;
      // For local audio file
      if(radioSelect == 'plik audio') {
        submittedLink = URL.createObjectURL(event.target.querySelector('#file-input').files[0]);
        fileName = event.target.querySelector("#file-input").value.split("fakepath").pop().slice(1);
        setState({
          ...state,
          submitUrl: submittedLink
        });
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

    const handleDragEnd = ({ destination, source }) => {
        if (!destination) return;
    
        setList(reorder(list, source.index, destination.index));
    }

    // Play track from list
    const playFromList = (item) => {
      const itemIndex = list.indexOf(item);
      console.log(item.trackUrl);
      setState({
        ...state,
        frameMedia: item.media,
        frameUrl: item.trackUrl,
      });

      // Outline the style of a played item
      const items = document.querySelectorAll('.list-group-item');
      let i = 0;
      for(item of items) {
        if(i == itemIndex) {
          item.classList.add('bolded-item');
        } else {
          item.classList.remove('bolded-item');
        }
        i++;
      }
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

    const prevTrack = () => {
      const prevItem = list[list.indexOf(list.find(item => state.frameUrl.includes(item.trackUrl))) - 1];
      playFromList(prevItem);
    }

    const nextTrack = () => { 
      const nextItem = list[list.indexOf(list.find(item => state.frameUrl.includes(item.trackUrl))) + 1];
      playFromList(nextItem);
    }

    

    return(
      <div>
           <TrackNav 
            prevBtn={prevTrack} nextBtn={nextTrack}
           />
          <Nav fName={selectMedia} mediaList={availableMedia}/>

            <form class="pagination justify-content-center" onSubmit={submitTrack}>
              <input id="link-input" type="text"  
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
                <a class="page-link">zapisz playlistę</a>
              </li>
              <li class="page-item"><a class="page-link">importuj playlistę</a></li>
          
            </ul>
          </section>


          <div id="alert" className={state.popUpDisplay}>{state.popUpText} <br></br>
            <button onClick={hideAlert}>OK</button></div>
       
      
      
      
      </div>

    );
}




ReactDOM.render(<App />, document.querySelector('#app'));



// Additional pause button functionality
window.onload = () => {
  navBtns = document.querySelectorAll('.nav-btn');
  pauseBtn = document.querySelector('.pause-btn');
  navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      pauseBtn.style.color = 'rgba(87, 79, 36, 0.799)'
      playing = false;
    });
  });
}



