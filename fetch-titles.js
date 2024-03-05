
function extractSoundcloudTrackTitle(url) {
    const lastPart = url.split('/').pop();
    const titleWithSpaces = lastPart.replace(/[-_]+/g, ' ');
    return titleWithSpaces;
}


const YTtitleFromUrl = async (trackURL) => {
    try {
      const vidID = getID(trackURL);
      const jxurl = `http://www.youtube.com/oembed?url=http://www.youtube.com/watch?v=${vidID}&format=json`;
      const response = await fetch(jxurl);
  
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
  
      const data = await response.json();
      return data.title;
  
    } catch (error) {
      console.error('Fetching failed:', error);
      return trackURL; 
    }
  };

function handleMultipleURLs() {
    [...document.querySelectorAll('.item-text')].forEach(item => {
        switch(item.dataset.media) {
            case 'YouTube':
                YTtitleFromUrl(item.innerText).then(title => {
                    item.innerText = title;
                    if(!item.innerText.includes('[YouTube]')) {
                        item.innerText += ' [YouTube]';
                    }
                });
                break;
            case 'soundcloud':
                item.innerText = extractSoundcloudTrackTitle(item.innerText);
                item.style.textTransform = 'capitalize';
                if(!item.innerText.includes('[Soundcloud]')) {
                    item.innerText += ' [Soundcloud]'; 
                }
                break;
            default:
                return false;
        }
    });
}


setTimeout(() => {
    handleMultipleURLs();
    
    // NIE DZIAŁA -> issue do rozwiązania (??)
    // const makeTitlesUpdateOnFormSubmit = document.querySelector('form');
    // makeTitlesUpdateOnFormSubmit.addEventListener('submit', () => {
    //     handleMultipleURLs();
    // });
}, 2000);

setInterval(handleMultipleURLs, 5000);

