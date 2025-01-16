export const availableMedia = ['YouTube', 'SoundCloud', 'Spotify', 'Twitch', 'Vimeo', 'Mixcloud', 'DailyMotion'];

export const infoText = [ 'Tajemna Fikcja to nowej jakości odtwarzacz muzyczny pozwalający na odtwarzanie muzyki (lub filmów) z różnych platform oraz tworzenie z nich funkcjonalnych, zintegrowanych plejlist.',
    `Aby wyszukać dany utwór wpisujemy zapytanie w pole tekstowe na górze, a następnie wykonujemy je konkretnym przyciskiem zależnie od platformy, która nas interesuje (YouTube, Soundcloud, Spotify itp.). Utwór możemy dodać do aktualnej plejlisty przyciskiem '+'.`,
    `Możemy też wkleić jego URL bezpośrednio w tenże pasek tekstowy, kliknąć “dodaj url”, a kawałek wtedy też się doda i to nawet jako link z dysku Google.`,
    `Przycisk “plik audio” przenosi nas do trybu dodawania plików audio bezpośrednio z dysku twardego (obsługiwane formaty na ten moment to .mp3 i .wav). Można dodawać w ten sposób wiele plików naraz.`,
    `Aby utwory z serwisu Spotify ładowały się w całości wymagane jest zezwolenie na ciasteczka między stronami (ang. third-party cookies, w przeglądarce Google Chrome ikona z oczkiem) oraz aktywny w sesji login u nich na stronie. Lecz NIE JEST absolutnie wymagana subskrypcja - można po prostu zarejestrować się u nich za pośrednictwem konta Google, FB lub Apple, co zajmuje 30 sekund.`,
    `Przycisk “zarządzaj plejlistami” przenosi nas do trybu zapisywania i wczytywania plejlist. Nie jest do tego wymagana rejestracja, gdyż aplikacja wykorzystuje tutaj na ogół rzadko eksplorowane możliwości pamięci lokalnej przeglądarki (a konkretnie - indexedDB).`,
    `Siłą rzeczy zapisane w ten sposób plejlisty nie będą dostępne na innym urządzeniu chyba, że… skorzystamy z opcji “eksportuj plejlistę” -> “do linku”. Dzięki temu możemy wygenerować unikatowy link do aktualnej plejlisty (acz bez lokalnych plików audio na ten moment). Skorzystanie z tej opcji oznacza oczywiście zgodę na anonimowe przetwarzanie dostarczonych przez użytkownika metadanych - plejlista musi zostać zapisana na serwerze.`,
    `Pochwały i/lub zażalenia można jak najbardziej kierować do administratora serwisu pod adresem: travis7684reaper@proton.me`
]

export function detectMedium(inputString, mediaArray) {
    const mediaToCheck = [...mediaArray, 'youtu.be', 'drive.google'];
    for (let media of mediaToCheck) {
        let regex = new RegExp(media, "i"); 
        if (regex.test(inputString)) {
            if(media == 'YouTube' || media == 'youtu.be') {
              return 'YouTube';
            } else if(media == 'drive.google') {
              return 'google-drive';
            } else return media.toLowerCase();
        }
    }
    return null; 
}

export async function fetchGoogleResults(query) {
  const apiKey = 'AIzaSyA3qJL8I2obWsYE-lQHK7ZsSdE4mOkFmTU';
  const cx = '73ca1a7affd354ceb';
  const jxurl = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(query)}&key=${apiKey}&cx=${cx}`;
  try {
    const response = await fetch(jxurl);
    const data = await response.json();
    return await data.items;
  } catch(error) {
    console.error(error);
  }
}

export const filterResults = (results, media) => {
  let regex = "";
  switch(media) {
    case 'YouTube':
      regex = 'youtube.com/watch';
      break;
    case 'Spotify':
      regex = "open.spotify.com/track";
      break; 
    case 'Soundcloud':
      regex = 'https://soundcloud.com';
      break;
    case 'Twitch':
      regex = "twitch.tv/videos";
    default:
      regex = `${media.toLowerCase()}.com`;
  }
  return results.filter(item => item.link.includes(regex))
            .filter(item => item.pagemap.cse_thumbnail).slice(0,9);
}

export const formatGoogleDriveSrc = (inputUrl) => {
  const baseURL = "https://drive.google.com/file/d/";
  const extractedID = inputUrl.split('/d/')[1].split('/')[0];

  return baseURL + extractedID + "/preview?autoplay=1";
}

export const maydayReorder = (trackURL, list) => {
  const currTrackToTop = list.find(item => item.trackUrl == trackURL);
  const remainingTracks = list.filter(item => item != currTrackToTop);
  
  return [currTrackToTop, ...remainingTracks];
};

export const listItemColor = (medium) => {
    let clr = "primary";
    switch(medium) {
      case 'twitch':
        clr = "info";
        break;
      case 'mixcloud':
        clr = "secondary";
        break;
      case 'spotify':
        clr = "success";
        break;
      case 'YouTube':
        clr = "danger";
        break;
      case 'soundcloud':
        clr = "warning";
        break;
      case 'vimeo':
        clr = "primary";
        break;
      case 'plik audio':
        clr = "light";
        break;
      case 'google-drive':
        clr = "dark";
        break;
      default:
        clr = "primary";
    }
    return "list-group-item list-group-item-" + clr;
};

export const reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    return result;
};

export const returnListElementID = (frameMedium) => {
  if(!frameMedium) {
    return "list-null";
  } else return "list-" + frameMedium.split(' ')[0];
}

export const togglePauseBtn = (isPlaying, frameMedia) => {
  const btnElement = document.getElementById('pause-btn');
  if(btnElement) {
    btnElement.setAttribute("class", `playing-${isPlaying} ${frameMedia}`);
  }
}

export const validateGoogleDriveUrl = (inputUrl) => {
  return inputUrl.includes('drive.google.com');
}

export const validateSpotifyUrl = (inputUrl) => {
  return inputUrl.includes('open.spotify.com/track');
}

