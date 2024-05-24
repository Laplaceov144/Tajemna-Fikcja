// Available media
let availableMedia = ['YouTube', 'soundcloud', 'spotify', 'plik audio'];

function isMobileDevice() {
  let userAgent = navigator.userAgent || navigator.vendor || window.opera;

  // Check for Android or iOS devices
  if (/android/i.test(userAgent)) {
      return true; e
  }

  if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
      return true; 
  }

  return false; 
}


// So far Soundcloud API brutally enforces switching to an external app while on mobile device, 
// so Soundcloud will not properly work on a phone here and we disable it
if(isMobileDevice()) {
  availableMedia = availableMedia.filter(item => item != 'soundcloud');
}

// Info text
const infoText = ["Tajemna Fikcja to nowej jakości odtwarzacz muzyczny pozwalający na odtwarzanie muzyki (lub filmów) z różnych mediów oraz tworzenie z nich funkcjonalnych, zintegrowanych plejlist.", 
                  "Aby dodać utwór do plejlisty wystarczy przekopiować jego URL (najlepiej prosto z paska przeglądarki), zaznaczyć, z której platformy pochodzi (YouTube, Soundcloud lub Spotify), następnie wkleić do opisanego okienka i kliknąć “dodaj”. Może to być również i plik mp3, którzy masz na dysku: tutaj użyjesz opcji “plik audio”. Każdy utwór odtwarza się automatycznie jeśli jest wczytany, a gdy się skończy to również i automatycznie odpali się następny na liście.",
                  "Przycisk “<“ odpala poprzedni utwór, przycisk “II” pauzuje lub startuje, przycisk “>” odpala kolejny utwór, a przycisk “shuffle” włącza/wyłącza odtwarzanie w kolejności losowej. Utwory na plejliście można ustawiać w kolejności przeciągając je myszką. Przy każdym z nich widzimy też dodatkowy przycisk “>”, który po kliknięciu załaduje nam utwór prosto do odtwarzacza oraz przycisk “X”, który po kliknięciu usuwa utwór z listy.",
                  "Możesz zapisać do dziesięciu plejlist w pamięci lokalnej swojej przeglądarki (nie wymaga to rejestracji, lecz siłą rzeczy - zapisane w ten sposób plejlisty nie będą dostępne na innych urządzeniach) i wczytywać je kiedy zechcesz."];

// Format Soundcloud url
const formattedSCsrc = (inputURL) => 'https://w.soundcloud.com/player/?url=https%3A//' + inputURL.slice(8) + '&auto_play=true';

// Format spotify url
const formattedSpotifySrc = (inputURL) => {
  let trackID = inputURL.split('/').pop();
  if(trackID.includes('?')) {
    trackID = trackID.split('?')[0];
  }
  return trackID;
}

// YouTube API stuff
var YTframe = document.createElement('div');
YTframe.setAttribute('id', 'player');
var tag = document.createElement('script');
var player;
tag.src = "./yt-api.js";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);


// Spotify API stuff
let spotifyPlayer = document.createElement('div');
spotifyPlayer.setAttribute('id', 'embed-iframe');

// Necessary global variables
let playBtns, trackForm, navBtns, pauseBtn, playing, isBeingSwapped, isVJSAudioRendered, autoplayFalseFlag, spotifyController;
const autoplay = '?autoplay=1&loop=1&autopause=0';

// Reorder list items after mouse drop
const reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    setTimeout(async function() {
      try {
        const db = await openIndexedDB(ourDBName);
        console.log(await saveListToIndexedDB(db, storeID, list, 'playlist00'));
      } catch (error) {
        console.error(error);
      }
    }, 50);


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

// Outline currently played item's style and return it as an HTML element
const outlineItem = (itemIndex) => {
  const items = document.querySelectorAll('.list-group-item');
  let currentItem;
  let i = 0;
  for(item of items) {
    if(i == itemIndex) {
      item.classList.add('bolded-item');
      currentItem = item;
    } else {
      item.classList.remove('bolded-item');
    }
    i++;
  }
  return currentItem;
}


// Reload page when logic breaks down with the fatal track moved to top of the playlist
const mayday = (curr, list) => {
    const currItem = curr.querySelector('span');
    const currTrack = list.find((item) => {
      return currItem.dataset.media == 'plik audio'
        ? item.fileName == currItem.innerText
        : item.trackUrl == currItem.dataset.trackUrl;
    });
    const currIndex = list.findIndex(item => item == currTrack);
    const reorderedList = list.slice(currIndex).concat(list.slice(0, currIndex));

    (async () => {
      try {
        const db = await openIndexedDB(ourDBName);
        const saveListPromise = new Promise((resolve, reject) => {
          resolve(saveListToIndexedDB(db, storeID, reorderedList, 'playlist00'));
        });
        saveListPromise.then(_ => {
          location.reload();
        });
      } catch (error) {
        console.error(error);
      }
    })();
}

// Handle YT frame exception
const handleYTFrameException = () => {
  const appDOM = document.querySelector('#app');
  const unwantedYTPlayer = document.querySelector('iframe#player');
  let fixedList = [];
  if(!appDOM && unwantedYTPlayer) {
    const extractedID = unwantedYTPlayer.getAttribute('src').split('embed/')[1].slice(0,9);
      try {
        const retrievePromise = new Promise((resolve, reject) => {
          fixedList = retrieveFromIndexedDB(ourDBName, storeID, 'playlist00');
        });
        retrievePromise.then(_ => {
          fixedList = fixedList.filter(item => !item.trackUrl.includes(extractedID));
          (async () => {
            try {
              const db = await openIndexedDB(ourDBName);
              const saveListPromise = new Promise((resolve, reject) => {
                resolve(saveListToIndexedDB(db, storeID, fixedList, 'playlist00'));
              });
              saveListPromise.then(_ => {
                location.reload();
              });
            } catch (error) {
              console.error(error);
            }
          })();
        });
      } catch(error) {
        console.log(error);
      }
  } else return false;
}

window.onload = () => {

    // Outline first item from list when page (re)loads
    setTimeout(outlineItem(0), 2500);
    setTimeout(handleYTFrameException, 2500);
}



// Prevent unwanted autoplay on audio element
const preventAudioPlay = () => {
  if(document.querySelector('audio') && document.querySelector('audio').paused) {
    autoplayFalseFlag = true;
  } else autoplayFalseFlag = false;
}

// Format retrieved playlist
const formatList = (list) => {
  if(list) {
    return list.filter(item => item).map((item,index) => {
      return {
        ...item,
        id: (index + 1).toString()
      }
    });
  } else return [];
}


