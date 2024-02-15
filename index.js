const React = window.React;
const ReactDOM = window.ReactDOM;
const { DragDropContext, Draggable, Droppable } = window.ReactBeautifulDnd;
// import { DragDropContext, Draggable, Droppable } from "./react-dnd.js";

function getId(url) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);

  return (match && match[2].length === 11)
    ? match[2]
    : null;
}
const videoId = getId('https://youtu.be/tX55HEX0hb0');
const iframeMarkup = '<iframe width="560" height="315" src="//www.youtube.com/embed/' 
  + videoId + '" frameborder="0" allowfullscreen></iframe>';
console.log('iframe html: ' +iframeMarkup);



const INITIAL_LIST = [
    {
      id: '1',
      firstName: 'RobinXXXDD',
      lastName: 'Wieruch',
    },
    {
      id: '2',
      firstName: 'Aiden',
      lastName: 'Kettel',
    },
    {
      id: '3',
      firstName: 'Jannet',
      lastName: 'Layn',
    },
    {
        id: '4',
        firstName: 'mhmh',
        lastName: 'Wdsasdsa',
      },
      {
        id: '5',
        firstName: 'Asdasaden',
        lastName: 'Ketasdasdasasdtel',
      },
      {
        id: '6',
        firstName: 'Jansadasdasdt',
        lastName: 'Ldsadasdasdayn',
      },
      {
        id: '7',
        firstName: 'Rob4342343in',
        lastName: 'Wi213123123eruch',
      },
      {
        id: '8',
        firstName: 'Aiwqeqweden',
        lastName: 'Kewqeqwettel',
      },
      {
        id: '9',
        firstName: 'Jandwq2232net',
        lastName: 'Lfededayn',
      },
];


const reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
  
    return result;
  };

const Item = ({ index, item }) => (
  <Draggable index={index} draggableId={item.id}>
    {(provided, snapshot) => (
      <li
        class="list-group-item list-group-item-primary"
        {...provided.draggableProps}
        {...provided.dragHandleProps}
        ref = {provided.innerRef}
      >
        {item.firstName} {item.lastName}
      </li>
    )}
  </Draggable>
);

const List = ({ list, onDragEnd }) => (
  <DragDropContext onDragEnd={onDragEnd}>
    <Droppable droppableId="droppable">
      {(provided) => (
        <ul class="list-group" 
        {...provided.placeholder} {...provided.droppableProps}
        ref = {provided.innerRef}>
          {list.map((item, index) => (
            <Item key={item.id} index={index} item={item} />
          ))}
        </ul>
      )}
    </Droppable>
  </DragDropContext>
);

function App() {
    const [list, setList] = React.useState(INITIAL_LIST);
    const [state, setState] = React.useState({
        num1: 1,
        num2: 2,
        response: "",
        score: 0,
        wrong: false
    });

    const handleDragEnd = ({ destination, source }) => {
        if (!destination) return;
    
        setList(reorder(list, source.index, destination.index));
    };

    return(
        <div>
            <nav>
        <ul class="pagination justify-content-center">
          <li class="page-item">
            <button class="page-link">YouTube</button>
          </li>
          <li class="page-item"><button class="page-link">soundcloud</button></li>
          <li class="page-item"><button class="page-link">bandcamp</button></li>
          <li class="page-item"><button class="page-link">plik audio</button></li>
          
        </ul>
      </nav>

      <form class="pagination justify-content-center">
        <input id="link-input" type="text" />
        <button type="submit">dodaj</button>
      </form>

      <div class="row">

  <div class="column">
  <iframe 
  referrerpolicy="no-referrer-when-downgrade"
  width="560" height="315" src="//www.youtube.com/embed/tX55HEX0hb0" frameborder="0" allowfullscreen></iframe>
  </div>

  <div class="column">

  <List list={list} onDragEnd={handleDragEnd} /> 
  

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
       
      
      
      
      
        </div>
    );
}

ReactDOM.render(<App />, document.querySelector('#app'));

