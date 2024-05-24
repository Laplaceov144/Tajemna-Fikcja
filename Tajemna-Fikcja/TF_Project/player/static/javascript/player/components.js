
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


// List item component  
const Item = ({ index, item, playBtn, deleteBtn }) => (
  <Draggable index={index} draggableId={item.id}>
    {(provided, snapshot) => (
      <li
        className={randomColor(item.id)}
        {...provided.draggableProps}
        {...provided.dragHandleProps}
        ref = {provided.innerRef}>
        <button onClick={() => playBtn(item)} class="item-btn play-btn"><i class="arrow right"></i>
        </button>
        <span class="item-text" data-media={item.media}>
          {item.media == 'plik audio' ? item.fileName : item.trackUrl}
        </span>
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
      <button class="nav-btn next-btn">
        <i class="arrow right" onClick={props.nextBtn} ></i>
      </button>
    </section>
  );
}

// Save playlist window
const SaveForm = ({display, saveFunc, xFunc}) => {
  return(
    <div id="save-form" className={display}>
      <button class="close-window" onClick={xFunc}>X</button>
      <form onSubmit={saveFunc}>
        <span class="window-caption">Podaj nazwę playlisty</span>
        <span>
          <input id="title-input" type="text" name="title-input" placeholder="...wpisz nazwę"></input>
        </span>
        <span id="save-btn"><button type="submit">zapisz</button></span>
      </form>
    </div>
  );
}


// Load playlist window
const LoadForm = (props) => {
  const playlistTitles = props.titles;
  const caption = playlistTitles.length 
        ? "Twoje zapisane plejlisty"
        : "Nie masz żadnych zapisanych plejlist.";
  return(
    <div id="load-form" className={props.display}>
      <button class="close-window" onClick={props.xFunc}>X</button>
      <div id="load-heading">
        <h3 class="window-caption">{caption}</h3>
      </div>
      <form onSubmit={props.loadFunc}>
        <ul class="stored-lists">
          {playlistTitles.map((item) => {
            return <li class="stored-item">
                    <input type="radio" name="playlist-title" value={item} class="radio-box"></input>
                    <label for="playlist-title">{item}</label>
                    <button class="delete-btn" onClick={props.deleteFunc}>X</button>
                  </li>;
            })}
        </ul>
        <button class="load-btn" type="submit">wczytaj</button>
      </form>
    </div>
  );
}

// Overlay tool
const Overlay = (props) => {
  return(
    <div id="overlay" className={props.display}></div>
  );
}
