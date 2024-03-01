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
const formattedYTsrc = (url) => {
  const getID = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);

    return (match && match[2].length === 11)
      ? match[2]
      : null;
  }
  const result = '//www.youtube.com/embed/' + getID(url);
  return result;
  
}

// const videoId = getId('https://youtu.be/tX55HEX0hb0');
// const iframeMarkup = '<iframe width="560" height="315" src="//www.youtube.com/embed/' 
//   + videoId + '" frameborder="0" allowfullscreen></iframe>';
//console.log('iframe html: ' +iframeMarkup);

// soundcloud
// const inputURL = 'https://soundcloud.com/whypeopledance/premiere-antoni-maoivvi-velvet-summer-italo-moderni';
const formattedSCsrc = (inputURL) => 'https://w.soundcloud.com/player/?url=https%3A' + inputURL.slice(6) + '&auto_play=true';
//const maiiovi = '<iframe width="100%" height="300" scrolling="no" frameborder="no" allow="autoplay" src="https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/whypeopledance/premiere-antoni-maoivvi-velvet-summer-italo-moderni"></iframe>';

// bandcamp

const availableMedia = ['YouTube', 'soundcloud', 'bandcamp', 'plik audio'];
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

const TrackFrame = ({url, media}) => {
  // <iframe className={media} frameborder="no" allow="autoplay" 
  //     src={media == "soundcloud" ? formattedSCsrc(url) : 
  //          media == 'YouTube' ? formattedYTsrc(url) : url} 
  //     scrolling="no"
  //     referrerpolicy="no-referrer-when-downgrade"
  //    seamless>

  //   </iframe>
  // const widget1         = SC.Widget(document.querySelector('#player iframe'));
  //   widget1.bind(SC.Widget.Events.FINISH, function() {
  //     console.log("finiszzz");

  //   });
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
        <button onClick={() => playBtn(item)} class="item-btn play-btn"><i class="arrow right"></i></button>
        <span class="item-text">{item.trackUrl}</span>
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
      class="previous-btn"><i class="arrow left"
      onClick={props.prevBtn} ></i></button>
      <button class="pause-btn">||</button>
      <button 
      class="next-btn"><i class="arrow right"
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
      currentTrackId: 0,
      popUpText: "",
      popUpDisplay: "none"
    }); 
    
    const selectMedia = (event) => {
      setState({
        ...state,
        submitMedia: event.target.textContent
      });
    }

    const submitTrack = (event) => {
      event.preventDefault();
      const submittedLink = event.target.querySelector('#link-input').value;
      const radioSelect = state.submitMedia;
      // url validation
      if(radioSelect != null) {
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
      } else {
        setState({
          ...state,
          popUpText: "Wybierz którąś z platform!",
          popUpDisplay: "block"
        });
        return false;
      }
      

      setState({
          ...state,
          submitUrl: submittedLink
      });
      
      list.push({
        id: (list.length + 1).toString(),
        media: radioSelect,
        trackUrl: submittedLink
      });
      if(list.length == 1 && state.frameUrl == null) {
        setState({
          ...state,
          frameMedia: radioSelect,
          frameUrl: submittedLink
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
    }

    const handleDragEnd = ({ destination, source }) => {
        if (!destination) return;
    
        setList(reorder(list, source.index, destination.index));
    }

    // Play track from list
    const playFromList = (item) => {
      const itemIndex = list.indexOf(item);
      setState({
        ...state,
        frameMedia: item.media,
        frameUrl: item.trackUrl,
        currentTrackId: itemIndex
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
              <input id="link-input" type="text"   />
              <button type="submit">dodaj</button>
            </form>

          <div class="row">

            <div class="column ">
              <section id="player">
                <TrackFrame media={state.frameMedia} 
                            url={state.frameUrl}/>
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


    const widget1         = SC.Widget(document.querySelector('#player iframe'));
    widget1.bind(SC.Widget.Events.FINISH, function() {
      console.log("finiszzz");

    });
  
// document.querySelector('.right').addEventListener('click', function(event) {
//     console.log("lewa szczałka !!!");
// });


// soundcloud API
// const iframeElement   = document.querySelector('#player iframe');

// //const iframeElementID = iframeElement.id;
// const widget1         = SC.Widget(iframeElement);
//const widget2         = SC.Widget(iframeElementID);

// bandcamp API



