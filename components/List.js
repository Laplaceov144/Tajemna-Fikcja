import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { randomColor } from '../res/defs';

const Item = ({ index, item, playBtn, deleteBtn }) => (
    <Draggable index={index} draggableId={item.id}>
      {(provided, snapshot) => (
        <li
          className={randomColor(item.id)}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          ref = {provided.innerRef}>
          <button onClick={() => playBtn(item)} className="item-btn play-btn"><i className="arrow right"></i>
          </button>
          <span className="item-text" data-media={item.media}>
            {item.media == 'plik audio' ? item.fileName : item.trackUrl}
          </span>
          <button onClick={() => deleteBtn(item)} className=" item-btn delete-btn">X</button>
        </li>
      )}
    </Draggable>
  );

export const List = ({ list, onDragEnd, playFunction, deleteFunction }) => (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="droppable">
        {(provided) => (
          <ul className="list-group" 
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