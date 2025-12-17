import { Component } from 'react'
import ReactPlayer from 'react-player';
import TrackFrame from '../components/TrackFrame/TrackFrame';
import { SearchBtns, SearchResults } from '../components/gsearch-components';
import { List } from '../components/List';
import * as defs from '../res/defs';
import handleMultipleURLs from '../res/fetch-titles';
import IDBPlaylistConnection from '../res/idb';
import { ManageSection, AlertWindow, InfoWindow, HashLinkWindow, Overlay } from '../components/popup-sections/popup-sections';

export default class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            frameTrackID: null,
            frame: {
                medium: null,
                url: null,
                fileName: null
            },
            list: [],
            playing: true,
            searchResults: [],
            resultsDisplay: "none",
            resultsMedia: null,
            inputView: "text",
            mgmtDisplay: "none",
            overlayDisplay: "none",
            alertDisplay: "none",
            alertText: "",
            hashLinkDisplay: "none",
            hashCode: null,
            infoDisplay: "none"
        },
        this.idbConn = new IDBPlaylistConnection();
    }

    setFrame = (ID) => {
        if(!this.state.list.length) return;
        const { media, trackUrl, fileName } = this.state.list[ID];
        this.setState({
            ...this.state,
            frameTrackID: ID,
            frame: {
                medium: media,
                url: trackUrl,
                fileName: fileName
            }
        });
    }
    setList = (newList, callback) => {
        this.setState({ list: newList }, callback);
    }

    componentDidMount() {
        let retrievedList = [];
        const retrievePromise = new Promise(resolve => {
            retrievedList = this.idbConn.retrieveListFromIDB('playlist00', false);;
            resolve(retrievedList);
        });
        retrievePromise.then(retrievedList => {

            // Remove duplicates
            retrievedList = retrievedList.reduce((acc, curr) => {
                return acc.includes(curr)
                    ? acc
                    : [...acc, curr];
                }, []);
            
            if(retrievedList.length) {
                const { media, trackUrl, fileName } = retrievedList[0];
                this.setState({
                    ...this.state,
                    list: retrievedList,
                    frameTrackID: 0,
                    frame: {
                        medium: media,
                        url: trackUrl,
                        fileName: fileName
                    }
                });
                handleMultipleURLs();
            }
        });
        this.attachSpaceKeyEventHandler();
        
        // Handling hash code from window URL
        const hashLink = window.location.href.split('#').pop();
        if(hashLink) {
            let fetchedList = [];
            const fetchPromise = new Promise(resolve => {
                fetchedList = this.idbConn.fetchListFromHashLink(hashLink);
                resolve(fetchedList);
            });
            fetchPromise.then(fetchedList => {

                if(fetchedList.length == 0) {
                    this.throwAlert("Zaimportowana plejlista jest pusta...");
                } else {
                    const { media, trackUrl, fileName } = fetchedList[0];
                    this.setState({
                        ...this.state,
                        list: fetchedList,
                        frameTrackID: 0,
                        frame: {
                            medium: media,
                            url: trackUrl,
                            fileName: fileName
                        }
                    });
                    handleMultipleURLs();
                    this.idbConn.savePlaylistAsDefault(fetchedList);
                    this.throwAlert("Import z linku zakończony powodzeniem!");
                    setTimeout(() => {
                        window.location.href = 'http://tajemnafikcjaplejlisty.netlify.app/';
                    }, 2500);
                }

            }).catch(error => console.error("Error: " + error));
        }
    }

    componentDidUpdate(_, prevState) {
        const { frameTrackID, frame, list } = this.state;
        
        handleMultipleURLs();

        if(list != prevState.list) {
            this.idbConn.savePlaylistAsDefault(list);

            const reorderedList = list.map((item, index) => ({
                ...item,
                id: (index + 1).toString()
            }));
            if (JSON.stringify(list) !== JSON.stringify(reorderedList)) {
                this.setList(reorderedList);
            }

            if(list.length > prevState.list.length
                && !window.location.href.includes('#incognito')
                ) this.idbConn.getHashLinkFromServer(list, false);
        }

        if(frame.medium == 'spotify') {
            setTimeout(() => {
                const iframeElement = document.querySelector('iframe');
                const audioElement = document.querySelector('audio');
                if(!iframeElement && !audioElement) {
                    const reorderedList = defs.maydayReorder(frame.url, list);
                    this.idbConn.savePlaylistAsDefault(reorderedList);
                    location.reload();
                }
            }, 3500);
        }
    }


    // Space key event handling
    handleSpaceKeyEvent = (event) => {
        if(event.code == 'Space') this.togglePlayingState();
    }
    attachSpaceKeyEventHandler = () => {
        window.addEventListener('keydown', this.handleSpaceKeyEvent);
    }
    removeSpaceKeyHandler = () => {
        window.removeEventListener('keydown', this.handleSpaceKeyEvent);
    }

    // Definitions in alphabetical order
    addTrack = (item, media, shouldGoToTop) => {
        const { list, frameTrackID } = this.state;
        if(list.length > 49) {
            this.throwAlert("Plejlista może zawierać maksymalnie 50 utworów!");
            return false;
        }
        const addedTrack = {
            id: (list.length + 1).toString(),
            media: media == 'YouTube' ? media : media.toLowerCase(),
            trackUrl: item.link,
            fileName: null
        }

        if(shouldGoToTop) {
            this.setList([addedTrack, ...list]);
            if(frameTrackID != null) this.setState({ frameTrackID: frameTrackID + 1 })
        } else this.setList([...list, addedTrack]);

        document.querySelector('#link-input').value = null;
        if(this.state.frame.url == null) this.setFrame(0);
    }

    closeWindow = (elementId) => {
        const propName = elementId + "Display";
        this.setState({
            [propName]: "none",
            overlayDisplay: "none" 
        });
    }

    deleteItem = (item) => {
        const { frame, list } = this.state;
        if(list.length == 1) {
            this.setList([]);
            this.setState({ frameTrackID: -1 });
            return;
        }
        const concatted = list.slice(0, list.indexOf(item))
                            .concat(list.slice(list.indexOf(item) + 1));
        this.setList(concatted);
        let newFrameID = concatted.findIndex(item => item.trackUrl == frame.url);
        if(!newFrameID) newFrameID = -1;
        this.setList(concatted);
        this.setState({ frameTrackID: newFrameID });
    }

    exportToFolder = async () => {
        try {
            await this.idbConn.saveAudioFilesToFolder();
        } catch(error) {
            console.error(error);
        }
    }

    generateHashLink = async () => {
        try {
            const fetchedResponse = await this.idbConn.getHashLinkFromServer(this.state.list, true);
            
            this.setState({
                ...this.state,
                hashLinkDisplay: "block",
                overlayDisplay: "block",
                hashCode: fetchedResponse
            });
        } catch(error) {
            console.error(error);
        }
    }

    handleDragEnd = ({ destination, source }) => {
        const { frame, list } = this.state;
        if (!destination) return;

        const reorderedList = defs.reorder(list, source.index, destination.index);
        const updatedFTID = reorderedList.findIndex(item => item.trackUrl == frame.url);

        this.setList(reorderedList);
        this.setState({
            frameTrackID: updatedFTID
        });
    }

    handlePlayerError = () => {
        this.throwAlert("Błąd odtwarzacza. Załadowano następny utwór.");
        setTimeout(this.nextTrack, 2000);
    }

    loadListViaMGMT = (list) => {
        this.setList(list);
        this.setState({
            frameTrackID: -1
        });
    }

    nextTrack = () => {
        const index = this.state.frameTrackID;
        if(index < this.state.list.length) this.setFrame(index + 1);
    }

    performSearch = (platform) => {
        const inputValue = document.querySelector('#link-input').value;
        if(!inputValue || inputValue == '') return false;

        let searchQuery = inputValue + " " + platform;
        let fetchedResults = [];
        if(platform == 'Spotify' || platform == 'SoundCloud') searchQuery += " track";

        const resultPromise = new Promise(resolve => {
            fetchedResults = defs.fetchGoogleResults(searchQuery);
            resolve(fetchedResults);
        });
        resultPromise.then(fetchedResults => {
            this.setState({
                ...this.state,
                searchResults: fetchedResults,
                resultsDisplay: "block",
                resultsMedia: platform 
            });
        });
    }

    playFromList = (item) => {
        const itemIndex = this.state.list.indexOf(item);
        this.setFrame(itemIndex);
    }

    prevTrack = () => {
        const index = this.state.frameTrackID;
        if(index > 0) this.setFrame(index - 1);
    }

    searchInYTByDefault = (event) => {
        event.preventDefault();
        this.performSearch("YouTube");
    }

    showInfo = () => {
        this.setState({
            ...this.state,
            infoDisplay: "block",
            overlayDisplay: "block"
        });
    }

    showMgmtWindow = () => {
        this.setState({
            ...this.state,
            mgmtDisplay: "block",
            overlayDisplay: "block" 
        });
    }

    shuffleList = () => {
        const shuffledList = [...this.state.list].sort(() => Math.random() - 0.5);
        this.setList(shuffledList);
        this.setState({ frameTrackID: -1 });
    }

    submitAudioFiles = () => {
        const inputData = document.getElementById('file-input');
        const audioFiles = [...inputData.files].map((item, index) => {
            return {
                id: (this.state.list.length + index + 1).toString(),
                media: 'plik audio',
                trackUrl: item,
                fileName: item.name.split('.')[0]
            }
        });

        this.setList([...this.state.list, ...audioFiles]);
        this.setState({ inputView: 'text' });

        inputData.value = null;
        if(this.state.frame.url == null) this.setFrame(0);
    }

    submitTrack = () => {
        const list = this.state.list;
        if(list.length > 49) {
            this.throwAlert("Plejlista może zawierać maksymalnie 50 utworów!");
            return false;
        }
        if(this.state.inputView == 'file') {
            this.submitAudioFiles();
            return;
        }
        const inputLink = document.getElementById('link-input').value;
        let linkToSubmit;
        if(ReactPlayer.canPlay(inputLink)
            || defs.validateSpotifyUrl(inputLink)
            || defs.validateGoogleDriveUrl(inputLink)) {

                linkToSubmit = inputLink;
                const medium = defs.detectMedium(linkToSubmit, defs.availableMedia);
                const addedTrack = {
                    id: (list.length + 1).toString(),
                    media: medium,
                    trackUrl: linkToSubmit,
                    fileName: null
                }
                this.setList([...list, addedTrack]);
                if(this.state.frame.url == null) this.setFrame(0);

        } else this.throwAlert(`Nieprawidłowy format linku! Pod przyciskiem "jak to działa?" znajdziesz wytyczne dot. formatów.`);

        document.getElementById('link-input').value = null;
    }

    throwAlert = (text) => {
        this.setState({
            ...this.state,
            overlayDisplay: "block",
            alertDisplay: "block",
            alertText: text
        });
    }

    toggleExportBtns = (val) => {
        if(navigator.userAgentData.mobile) return;
        
        const exportBtns = document.querySelectorAll('.dropdown ~ ul li');
        [...exportBtns].forEach(item => {
            item.className = 'page-item ' + val;
        });
    }

    toggleFileInput = () => {
        const viewToSet = this.state.inputView == 'text'
                    ? 'file'
                    : 'text'
        this.setState({
            ...this.state,
            inputView: viewToSet
        });
    }  
    
    togglePlayingState = () => {
        const frameMedium = this.state.frame.medium;
        let playingState = this.state.playing;

        if(frameMedium == 'spotify') {
            playingState = true;
        } else playingState = !playingState;

        this.setState({ playing: playingState });
        defs.togglePauseBtn(playingState, frameMedium);
    }

    // Render function
    render() {
        const { list, frame } = this.state;
        const searchResultsClass = this.state.resultsDisplay + " results-" + frame.medium;
        const trackNavClass = "track-nav track-nav-" + frame.medium;
        const mgmtClass = this.state.mgmtDisplay + " mgmt-fit-" + frame.medium;
        const hashLinkClass = this.state.hashLinkDisplay + " hash-fit-" + frame.medium;
        const infoClass = this.state.infoDisplay + " info-fit-" + frame.medium;

        return (
            <div id="container">
                <form id="track-form" 

                    //  Gdy wciskamy Enter to domyślnie szuka w YT
                    onSubmit={(event) => this.searchInYTByDefault(event)}>

                    <input id="link-input" type="search" name="gsearch"
                        placeholder='wyszukaj lub wklej url'
                        onFocus={this.removeSpaceKeyHandler}
                        onBlur={this.attachSpaceKeyEventHandler}
                        className={this.state.inputView == 'text' ? "" : "link-input-hidden"}
                    />
                    <input id="file-input" type="file" name="audio" accept=".mp3, .wav" multiple
                        className={this.state.inputView == 'file' ? "file-input-visible" : "file-input"}
                    />
                    <button type="button"
                        onClick={this.submitTrack}>
                        {this.state.inputView == 'text' ? 'dodaj url' : 'dodaj'}
                    </button>
                    <button type="button"
                        onClick={this.toggleFileInput}>
                        {this.state.inputView == 'text' ? 'plik audio' : 'wróć'}
                    </button>
                    <SearchBtns fName={this.performSearch}/>
                </form>

                <section id="special-buttons" className={list.length ? "block" : "none"}
                        onMouseLeave={() => this.toggleExportBtns('hidden-btns')}>
                    <ul>
                        <li className='page-item mgmt-btn'>
                            <button className='page-link'
                                onClick={this.showMgmtWindow}>zarządzaj plejlistami
                            </button>
                        </li>
                        <li className='page-item'>
                            <button className='page-link dropdown'
                                onMouseEnter={() => this.toggleExportBtns('hovered')}
                                // onTouchStart={() => this.generateHashLink}
                                onClick={this.generateHashLink}
                            >eksportuj plejlistę
                            </button>
                            <ul className='hidden-list'>
                                <li className='page-item hidden-btns'>
                                    <button id="folder-btn" className='page-link dd-btn'
                                        onClick={this.exportToFolder}>do folderu
                                    </button>
                                </li>                            
                                <li className='page-item hidden-btns'>
                                    <button id="export-btn" className='page-link dd-btn'
                                        onClick={this.generateHashLink}>do linku

                                    </button>
                                </li>
                            </ul>
                        </li>
                    </ul>
                </section>

                <section id="info-section">
                    <button id="info-btn"
                        onClick={this.showInfo}>jak to działa?</button>
                </section>

                <div className='row'>
                    <div className='transport'>
                        <section id="player">
                            <TrackFrame media={frame.medium}
                                    url={frame.url} 
                                    playing={this.state.playing}
                                    onEnded={this.nextTrack}
                                    onError={this.handlePlayerError} 
                            />
                        </section>
                        <section id="track-nav" className={trackNavClass}>
                            <button id="previous-btn"
                                className='nav-btn previous-btn' onClick={this.prevTrack}>
                                <i className='arrow left'></i>
                            </button>
                            <button id="pause-btn" onClick={this.togglePlayingState}
                                className='playing-true'>II</button>
                            <button id="next-btn"
                                className='nav-btn next-btn' onClick={this.nextTrack}>
                                <i className='arrow right'></i>
                            </button>
                            <button id="shuffle-btn"
                                className="shuffle-btn" 
                                onClick={this.shuffleList}>shuffle
                            </button>
                        </section>
                    </div>

                    <div id={defs.returnListElementID(frame.medium)} 
                    className='column'>
                        <List list={list}
                            onDragEnd={this.handleDragEnd}
                            playFunction={this.playFromList}
                            deleteFunction={this.deleteItem}
                            frameID={this.state.frameTrackID}
                        />
                    </div>

                </div>

                <section id="results" className={searchResultsClass}>
                    <button className='close-search' onClick={() => this.closeWindow('results')}>X</button>
                    <SearchResults results={this.state.searchResults}
                        media={this.state.resultsMedia}
                        addTrack={this.addTrack}
                    />
                </section>

                <section id="mgmt" className={mgmtClass}>
                    <button className='close-search' onClick={() => this.closeWindow('mgmt')}>X</button>
                    <ManageSection list={list}
                        onDataFetch={this.loadListViaMGMT}
                        onClose={() => this.closeWindow('mgmt')}
                    />
                </section>

                <AlertWindow display={this.state.alertDisplay}
                    alertText={this.state.alertText}
                    onClose={() => this.closeWindow('alert')}
                />

                <section id="info" className={infoClass}>
                    <button className='close-search' onClick={() => this.closeWindow('info')}>X</button>
                    <InfoWindow />
                </section>

                <HashLinkWindow display={hashLinkClass}
                    hashCode={'#' + this.state.hashCode}
                    onClose={() => this.closeWindow('hashLink')}
                />
                <Overlay display={this.state.overlayDisplay}/>

            </div>
        );
    }
}
