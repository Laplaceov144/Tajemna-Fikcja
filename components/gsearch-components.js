import { availableMedia, filterResults } from "../res/defs";

export const SearchBtns = ({fName}) => {
    return(
      <nav>
          <ul id="search-btns" className="pagination justify-content-center">
            {availableMedia.map((item) => (
              <li className="page-item"><button className="page-link" 
                  onClick={() => fName(item)}>{item}</button></li>
            ))}
          </ul>
      </nav>
    );
  }

export const SearchResults = (props) => {
  let itemsToDisplay = props.results;
  if (!itemsToDisplay || itemsToDisplay.length === 0) return false;
  itemsToDisplay = filterResults(itemsToDisplay, props.media);

  return(
    <ul className="results-section">
      {itemsToDisplay.map((item) => {
        return <li className="result-item">
          <button className="add-button" onClick={() => props.addTrack(item, props.media, false)}>+</button>
          <button className="top-button" onClick={() => props.addTrack(item, props.media, true)}>
              <i className="arrow up"></i></button>
          <img className="shrinkable" src={item.pagemap.cse_thumbnail[0].src}></img>
          <h3 className="shrinkable"><a href={item.link} target="_blank">{item.title}</a></h3>
          <p className="shrinkable">{item.snippet}</p>
        </li>;
      })}
    </ul>
  );
}
