import { Component } from "react";
import { infoText } from "../../res/defs";
import IDBPlaylistConnection from "../../res/idb";

export class ManageSection extends Component {
    constructor(props) {
        super(props);
        this.state = {
            playlistTitles: [],
            actionMode: 'save'
        }
        this.idbConn = new IDBPlaylistConnection();
    }

    componentDidMount() {
        let retrievedKeys = [];
        const retrievePromise = new Promise(resolve => {
            retrievedKeys = this.idbConn.retrieveKeysFromStore();
            resolve(retrievedKeys);
        });
        retrievePromise.then(retrievedKeys => {
            this.setState({
                ...this.state,
                playlistTitles: retrievedKeys.filter(item => item != 'playlist00')
            });
        });
    }

    setLoadMode = () => {
        this.setState({
            ...this.state,
            actionMode: 'load'
        });
    }
    setSaveMode = () => {
        this.setState({
            ...this.state,
            actionMode: 'save'
        });
    }
    setOverwriteMode = () => {
        this.setState({
            ...this.state,
            actionMode: 'overwrite'
        });
    }

    savePlaylistToIDB = async (title) => {
        if(this.state.playlistTitles.length > 9) {
            alert("Maksymalna ilość to 10 plejlist!");
            return false;
        }
        if(!title && title == null) {
            alert("Wpisz nazwę plejlisty!");
            return false;
        } 
        try {
            const dbConn = await this.idbConn.openIndexedDB();
            console.log(await this.idbConn.saveListToIndexedDB(dbConn, this.props.list, title));
            const updatedTitles = [...this.state.playlistTitles
                    .filter(item => item != title), title];
            this.setState({
                ...this.state,
                playlistTitles: updatedTitles
            });
            setTimeout(dbConn.close(), 3500);
        } catch(error) {
            alert("Zapisanie nie powiodło się, kod błędu: " + error);
        }
    }

    loadPlaylistFromIDB = (title) => {
        if(!title && title == null) {
            alert("Wybierz plejlistę do wczytania!");
            return false;
        }
        let fetchedList = [];
        const resultPromise = new Promise(resolve => {
            fetchedList = this.idbConn.retrieveListFromIDB(title, true);
            resolve(fetchedList);
        }); 
        resultPromise.then(fetchedList => this.props.onDataFetch(fetchedList))
            .then(this.props.onClose());
    }

    handleSubmit = (event) => {
        event.preventDefault();

        const radioBoxes = document.querySelectorAll('.radio-box');
        let pickedBox, pickedTitle;
        if(radioBoxes.length) pickedBox = [...radioBoxes].find(input => input.checked);
        if(pickedBox) pickedTitle = pickedBox.value;

        switch(this.state.actionMode) {
            case 'save':
                const typedTitle = document.querySelector('#title-input').value;
                this.savePlaylistToIDB(typedTitle);
                event.target.reset();
                break;
            
            case 'load':
                this.loadPlaylistFromIDB(pickedTitle);
                event.target.reset();
                break;
            
            case 'overwrite':
                this.savePlaylistToIDB(pickedTitle);
                event.target.reset();
                break;
        }
    }

    deletePlaylist = (title) => {
        this.idbConn.deletePlaylistFromIDB(title);
        this.setState({
            ...this.state,
            playlistTitles: this.state.playlistTitles.filter(item => item != title)
        });
    }

    checkRadioBox = (event) => {
        const thisBox = event.target.querySelector('input');
        if(thisBox) thisBox.checked = true;
    }
 
    render() {
        const titles = this.state.playlistTitles;
        
        return(
            <div id="mng-form">
                <h3 className="window-caption">
                        {titles.length 
                            ? "Twoje zapisane plejlisty"
                            : "Nie masz żadnych zapisanych plejlist."}
                </h3>
                <form onSubmit={this.handleSubmit}>
                    <ul className="stored-lists">
                        {titles.length 
                            ? titles.map((item) => {
                                return <li className="stored-item"
                                        onClick={(event) => this.checkRadioBox(event)}>
                                    <input type="radio" name="playlist-title"
                                        value={item} className="radio-box"></input>
                                    <label className={item.length < 18 ? "label-short" : "label-long"}
                                        for="playlist-title">{item}
                                    </label>
                                    <button className="delete-btn" 
                                        onClick={() => this.deletePlaylist(item)}>
                                        <i className="fa fa-trash-o trash-btn"></i>
                                    </button> 
                                </li>
                            })
                            : ""}
                    </ul>
                    <span id="mng-btns-bar"
                        className={titles.length ? "block" : "none"}>
                        <button id="load-btn" type="submit"
                            onClick={this.setLoadMode}>wczytaj</button>
                        <button id="overwrite-btn" type="submit"
                            onClick={this.setOverwriteMode}>nadpisz</button>
                    </span>
                    <span className="window-caption">Podaj nazwę plejlisty</span>
                    <section id="action-section">
                        <span id="save-bar">
                            <input id="title-input" type="text" name="title-input"
                                placeholder="...wpisz nazwę"></input>
                            <button id="save-btn" type="submit"
                                onClick={this.setSaveMode}>zapisz</button>
                        </span>
                    </section>
                </form>
            </div>
        );    
    }
}

export const AlertWindow = (props) => {
    return(
        <div id="alert" className={props.display}>
            <div className="alert-text">{props.alertText}</div>
            <button className="alert-btn"
                onClick={props.onClose}>OK</button>
        </div>
    );
}

export const HashLinkWindow = (props) => {
    const computedLink = window.location.href + props.hashCode;
    return(
        <div id="hashLink" className={props.display}>
            <h3>Wygenerowano link:</h3>
            <span id="hash-response"><h4>{computedLink}</h4></span>
            <button className="alert-btn hash-btn"
                onClick={props.onClose}>OK</button>
        </div>
    );
}

export const InfoWindow = () => {
    return(
        <div>
            <ul id="info-topics">
                {infoText.map(item => {
                    return <li className="info-point"><p>{item}</p></li>;
                })}
            </ul>
        </div>
    );
}

export const Overlay = (props) => {
    return(
      <div id="overlay" className={props.display}></div>
    );
}