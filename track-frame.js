const React = window.React;
const ReactDOM = window.ReactDOM;
const { DragDropContext, Draggable, Droppable } = window.ReactBeautifulDnd;
const SCAPI = window.SC.Widget;



// Main player component
const TrackFrame = React.memo((props) => {
    
    switch(props.media) {
  
      // YouTube case
      case 'YouTube':
        if(isVJSAudioRendered && document.querySelector('audio')) {
          document.querySelector('audio').remove();
          isVJSAudioRendered = false;
        }
        if(isBeingSwapped && document.querySelector('#spotify')) {
          document.querySelector('#spotify').remove();
        }
        document.body.append(YTframe); 
  
        // Function to create YT player object with its properties
        function onYouTubeIframeAPIReady() {
          player = new YT.Player('player', {
            height: '300',
            width: '500',
            videoId: getYouTubeID(props.trackURL),
            events: {
              'onReady': onPlayerReady,
              'onStateChange': onPlayerStateChange
            }
          });
        }
  
        // Force autoplay
        function onPlayerReady(event) {
          event.target.playVideo();
          playing = true;
          document.querySelector('.pause-btn').style.color = 'rgba(87, 79, 36, 0.799)';
        }
  
        // Make playlist jump to next track when YT video ends
        function onPlayerStateChange(event) {
          if (event.data == 0) {
            event.target.destroy();
            props.nextTrackFunc();
          }
        }
        
        onYouTubeIframeAPIReady();
  
        // Make pause button interact with YouTube video
        function bindVideoPausing() {
          pauseBtn = document.querySelector('.pause-btn');
          if(pauseBtn) {
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
  
        // Necessary YT stuff
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
          if(trackForm) {
            trackForm.addEventListener('submit', function() {
              playBtns = document.querySelectorAll('.play-btn');
              bindDestroyersToBtns(playBtns);
            });
          }
  
          if(playBtns) {
            bindDestroyersToBtns(playBtns);
          }
  
          if(navBtns) {
            bindDestroyersToBtns(navBtns);
          }
  
        };
  
  
        onLoadBindEventsThatDestroyYTPlayer();
        bindVideoPausing();
        isBeingSwapped = false;
      break; 
  
      // Soundcloud case  
      case 'soundcloud':
  
        // Remove audio or Spotify elements in case they're still there
        if(isVJSAudioRendered && document.querySelector('audio')) {
          document.querySelector('audio').remove();
          isVJSAudioRendered = false;
        }
        if(document.querySelector('#spotify')) {
          document.querySelector('#spotify').remove();
        }
  
        // Soundcloud widget API
        setTimeout(function() {
          const widget1 = SC.Widget(document.querySelector('#player iframe'));
          widget1.bind(SC.Widget.Events.FINISH, function() {
            props.nextTrackFunc();
          });
          playing = true;
  
          // Make pause button interact with soundcloud player
          function bindTrackPausing() {
            pauseBtn = document.querySelector('.pause-btn');
            if(pauseBtn) {
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
        isBeingSwapped = false;
      
       
      return(
      <div id={props.media}>
        <iframe className={props.media} frameborder="no" allow="autoplay" 
          src={formattedSCsrc(props.trackURL)} 
          scrolling="no"
          referrerpolicy="no-referrer-when-downgrade"
          seamless>
        </iframe>
      </div>
      );
      
      // Spotify case
      case 'spotify':

      if(document.querySelector('#spotify')) {
        if(isBeingSwapped) {
          document.querySelector('#spotify').remove(); 
        } else break;
      }

        if(isVJSAudioRendered && document.querySelector('audio')) {
          document.querySelector('audio').remove();
          isVJSAudioRendered = false;
        }

        if(spotifyController) {
          spotifyController.destroy();
          spotifyController = null;
        }
        
        if(document.querySelector('#spotify')) {
          document.querySelector('#spotify').remove();
        }
        
        let parentDiv = document.createElement('div');
        parentDiv.setAttribute('id', 'spotify');

        if(document.querySelector('section#player')) {
          document.querySelector('section#player').appendChild(parentDiv).appendChild(spotifyPlayer);
        }
        
        element = document.getElementById('embed-iframe');
        isBeingSwapped = false;
        
        let element = document.getElementById('embed-iframe');
        window.onSpotifyIframeApiReady = IFrameAPI => {

            const options = {
              uri: `spotify:track:${formattedSpotifySrc(props.trackURL)}`,
              width: '450px',
              height: '250px',
            };
            const callback = EmbedController => {
              spotifyController = EmbedController;
              spotifyController.addListener('ready', () => {
                spotifyController.play();
              });
              spotifyController.addListener('playback_update', event => {
                if(event.data.position == event.data.duration) {
                  props.nextTrackFunc();
                }
              });
            };
            IFrameAPI.createController(element, options, callback);
          };

          // Make pause button interact with spotify player
          function bindTrackPausing() {
            pauseBtn = document.querySelector('.pause-btn');
            if(pauseBtn) {
              pauseBtn.addEventListener('click', function() {
                if(spotifyController && playing) {
                  spotifyController.pause();
                  pauseBtn.style.color = 'burlywood';
                  playing = false;
                } else if(spotifyController && !playing) {
                  spotifyController.play();
                  pauseBtn.style.color = 'rgba(87, 79, 36, 0.799)';
                  playing = true;
                }
              });
            }
          }
          bindTrackPausing();

        


        break;
        

      // Mp3 file case
      case 'plik audio':

        setTimeout(function() {
          if(document.querySelector('audio')) {
            const audioPlayer = document.querySelector('audio');
  
            // Make playlist jump to next track when mp3 track ends
            audioPlayer.addEventListener('ended', () => props.nextTrackFunc());
  
            // Make audio player interact with external pause button
            document.querySelector('.pause-btn').addEventListener('click', () => {
              if(!audioPlayer.paused) {
                audioPlayer.pause();
                pauseBtn.style.color = 'burlywood';
                playing = false;
              } else {
                audioPlayer.play();
                pauseBtn.style.color = 'rgba(87, 79, 36, 0.799)';
                playing = true;
              }
            });
            
            // Force autoplay
            if(!autoplayFalseFlag) {
              const promise = audioPlayer.play();
              if (promise !== undefined) {
                promise.then(_ => {
                  console.log("autoplay forced on audio player");
                }).catch(error => {
                  console.log("failed to force autoplay on audio player");
                  audioPlayer.muted = true;
                  audioPlayer.play();
                  audioPlayer.muted = false;
                  playing = true;
                });
              } 
              autoplayFalseFlag = false;
            }
          }
        }, 1000);
  
        // Vanilla JS algorithm
        let audioFrame;
        if(document.querySelector('audio') && isBeingSwapped) {
          console.log("idzie VJS audio");
          document.querySelector('audio').remove(); 
          isVJSAudioRendered = false;
          audioFrame = document.createElement('audio');
          document.querySelector('section#player').appendChild(audioFrame);
          const audioUrl = URL.createObjectURL(props.trackURL);
          audioFrame.setAttribute('src', audioUrl);
          audioFrame.setAttribute('controls', true);
          audioFrame.setAttribute('autoplay', true);
          isVJSAudioRendered = true;
          isBeingSwapped = false;
          audioFrame.onloadeddata = () => {
            URL.revokeObjectURL(audioUrl);
          }
          break;
  
        } else if(!isVJSAudioRendered) {
          if(document.querySelector('#spotify')) {
            document.querySelector('#spotify').remove();
          }
          
          // React algorithm
          isBeingSwapped = false;
          const audioUrl = URL.createObjectURL(props.trackURL);
          setTimeout(() => {
            const audioFrame = document.querySelector('audio');
            audioFrame.onloadeddata = () => {
              URL.revokeObjectURL(audioUrl);
            }
          }, 2000);
          return(
          <div id={props.media.slice(0,3)}>
            <audio controls autoplay>
              <source src={audioUrl} type="audio/mpeg"/>
            </audio>
          </div>
          );
        } else {
          console.log("audio frame exception");
          break;
        }
        
      default:
        console.log("default media case");
    }
  });