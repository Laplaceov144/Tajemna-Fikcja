import React, { Component } from 'react';
import ReactPlayer from 'react-player';
import ReactAudioPlayer from 'react-audio-player';
import embedSpotifyPlayer from '../../res/spotify-api';
import { formatGoogleDriveSrc, togglePauseBtn } from '../../res/defs';

export default class TrackFrame extends Component {
    constructor(props) {
        super(props);
        this.state = {
            volume: 0.8
        }
        this.audioUrl = ""
        this.progress = React.createRef();
    }

    componentDidUpdate(prevProps) {
        togglePauseBtn(this.props.playing, this.props.media);
        if(prevProps.media == 'spotify' && this.props.media != 'spotify') {
            document.querySelector('#spotify').remove();
        }
        if(prevProps.media == 'plik audio' && this.props.media != 'plik audio') {
            URL.revokeObjectURL(this.audioUrl);
        }
    }
    shouldComponentUpdate(nextProps) {

        if(nextProps.url == this.props.url && nextProps.media == 'spotify') return false;

        if(nextProps.url == this.props.url && nextProps.playing == this.props.playing
            && nextProps.media == 'plik audio') return false;    

        else return true;
    }

    handleVolumeChange = (event) => {
        this.setState({
            volume: parseFloat(event.target.value)
        });
    }
    jumpForward = (seconds) => {
        if(this.progress.current) {
            const newTime = this.progress.current.getCurrentTime() + seconds;
            this.progress.current.seekTo(newTime, 'seconds');
        }
    }

    render() {
        switch(this.props.media) {
            case 'spotify':
                embedSpotifyPlayer(this.props.url, this.props.onEnded);
                return false;

            case 'google-drive':
                return(
                    <div id="google-drive">
                        <iframe
                            frameborder="2"
                            width="500"
                            height="100"
                            src={formatGoogleDriveSrc(this.props.url)}
                            allow="autoplay">
                        </iframe>
                    </div>
                );
            
            case 'plik audio':
                this.audioUrl = URL.createObjectURL(this.props.url);

                return(
                    <div id="audio-player">
                        <ReactAudioPlayer
                            src={this.audioUrl}
                            autoPlay={this.props.playing}
                            controls
                            onEnded={this.props.onEnded}
                        />
                    </div>
                );

            case null:
                break;
            
            default:
                return (
                    <div id={this.props.media}>
                        <ReactPlayer url={this.props.url}
                                    playing={this.props.playing}
                                    onEnded={this.props.onEnded}
                                    onError={this.props.onError}
                                    onPlay={togglePauseBtn(true, this.props.media)}
                                    onPause={togglePauseBtn(false, this.props.media)}
                                    controls={true}
                                    volume={this.state.volume}
                                    config={{
                                        youtube: {
                                            playerVars: {
                                                height: '250',
                                                width: '400'
                                            }
                                        }
                                    }}
                                    className="react-player"
                                    ref={this.progress}
                        />
                        <input 
                            type="range"
                            id="volume-slider"
                            min="0"
                            max="1"
                            step="0.01"
                            value={this.state.volume}
                            onChange={this.handleVolumeChange}
                        />
                        <button onClick={() => this.jumpForward(30)}
                            id="rp-jump-btn">+30s</button>
                    </div>
                );
        }
    }
}