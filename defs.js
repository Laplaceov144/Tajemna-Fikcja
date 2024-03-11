// Format soundcloud url
const formattedSCsrc = (inputURL) => 'https://w.soundcloud.com/player/?url=https%3A' + inputURL.slice(6) + '&auto_play=true';

// Available media
const availableMedia = ['YouTube', 'soundcloud', 'plik audio'];

// YouTube API stuff
var YTframe = document.createElement('div');
YTframe.setAttribute('id', 'player');
var tag = document.createElement('script');
var player;
tag.src = "./yt-api.js";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);


// Necessary global variables
let playBtns, trackForm, navBtns, pauseBtn, playing, isBeingSwapped, isVJSAudioRendered;

// Recover data from local storage (excluding local audio files)
let INITIAL_LIST = [];
if(localStorage.getItem('playlist')) {
  const retrieved = JSON.parse(localStorage.getItem('playlist'));
  const filtered = retrieved != null ? retrieved.filter(item => {
    return item.media != 'plik audio';
  }) : [];
  INITIAL_LIST = filtered;
}

// Reorder list items after mouse drop
const reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    localStorage.setItem('playlist', JSON.stringify(list));
    
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

// Reload page when logic breaks down
const mayday = (curr) => {
    const retrieved = JSON.parse(localStorage.getItem('playlist'));
    const currentTrack = curr.querySelector('span');
    if(currentTrack.dataset.media == 'plik audio') {
        location.reload();
    }
    let currentTrackToList = {
        id: '1',
        media: currentTrack.dataset.media,
        trackUrl: currentTrack.dataset.trackUrl,
        fileName: null
    }
    let newList = retrieved.filter((item) => item.trackUrl != currentTrack.dataset.trackUrl);
    newList.unshift(currentTrackToList);
    newList = newList.map((item,index) => {
        return {
            id: (index + 1).toString(),
            media: item.media,
            trackUrl: item.trackUrl,
            fileName: null
        }
    });
    localStorage.setItem('playlist', JSON.stringify(newList));
    location.reload();        
}

// Additional pause button functionality
window.onload = () => {
    navBtns = document.querySelectorAll('.nav-btn');
    pauseBtn = document.querySelector('.pause-btn');
    navBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        pauseBtn.style.color = 'rgba(87, 79, 36, 0.799)';
        playing = false;
      });
    });
    if(document.querySelector('audio')) {
      const audioPlayer = document.querySelector('audio');
      pauseBtn.addEventListener('click', () => {
        if(audioPlayer.play()) {
          audioPlayer.pause();
          pauseBtn.style.color = 'burlywood';
          playing = false;
        } else {
          audioPlayer.play();
          pauseBtn.style.color = 'rgba(87, 79, 36, 0.799)';
          playing = true;
        }
      });
    }
  }