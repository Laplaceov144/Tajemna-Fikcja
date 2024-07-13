
export default function embedSpotifyPlayer(inputURL, nextTrackFunc) {

if(document.querySelector('#spotify')) {
    document.querySelector('#spotify').remove();
}

const formattedSpotifySrc = (inputURL) => {
        let trackID = inputURL.split('/').pop();
        if(trackID.includes('?')) {
          trackID = trackID.split('?')[0];
        }
        return trackID;
}

if(spotifyController) {
    spotifyController.destroy();
    spotifyController = null;
}


let spotifyController;
let spotifyPlayer = document.createElement('div');
spotifyPlayer.setAttribute('id', 'embed-iframe');

let parentDiv = document.createElement('div');
parentDiv.setAttribute('id', 'spotify');

if(document.querySelector('section#player')) {
    document.querySelector('section#player').appendChild(parentDiv).appendChild(spotifyPlayer);
  }

    let element = document.getElementById('embed-iframe');
        window.onSpotifyIframeApiReady = IFrameAPI => {

            const options = {
              uri: `spotify:track:${formattedSpotifySrc(inputURL)}`,
              width: '450px',
              height: '250px'
            };
            const callback = EmbedController => {
              spotifyController = EmbedController;
              spotifyController.addListener('ready', () => {
                spotifyController.play();
              });
              spotifyController.addListener('playback_update', event => {
                if(event.data.position == event.data.duration) {
                  nextTrackFunc();
                }
              });
            };
            IFrameAPI.createController(element, options, callback);
        } 
}      











