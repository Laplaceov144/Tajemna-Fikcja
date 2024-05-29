// Extract Soundcloud title
function extractSoundcloudTrackTitle(url) {
    const splitResult = url.split('/');
    const titleWithSpaces = splitResult[splitResult.length - 1].replace(/[-_]+/g, ' ');
    const pseudoArtist = splitResult[splitResult.length - 2].replace(/[-_]+/g, ' ');
    if(titleWithSpaces.includes('campaign=social')) {
      return pseudoArtist + ' - ' + titleWithSpaces.split('?')[0];
    }
    return pseudoArtist + ' - ' + titleWithSpaces;
}

// Extract YouTube ID 
const getYouTubeID = (url) => {
    
    if(url.includes('watch')) {
      const result = url.split('watch?v=')[1];
      
      return result;
    } else {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const lowered = url.split('e/')[0].toLowerCase() + 'e/' + url.split('e/')[1];
      const match = lowered.match(regExp);
  
      return (match && match[2].length === 11)
        ? match[2]
        : null;
    }    
}

// Extract YT track title
const YTtitleFromUrl = async (trackURL) => {
    try {
      const vidID = getYouTubeID(trackURL);
      const jxurl = `https://www.youtube.com/oembed?url=http://www.youtube.com/watch?v=${vidID}&format=json`;
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

// Extract Spotify track title
const extractSpotifyTitle = async (trackURL) => {
  try {
    const jxurl = `https://open.spotify.com/oembed?url=${trackURL}`;
    const response = await fetch(jxurl);
    
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();
    return data.title;
  } catch(error) {
    console.error('Fetching failed:', error);
    return trackURL; 
  }
}

// Capitalize words in a title
const capitalizeFirstLetter = (str) => {
  if(!str.includes(' ')) {
    return str;
  } else {
    return str.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  }
}  
  
function handleMultipleURLs() {
    [...document.querySelectorAll('.item-text')].forEach(item => {
        
                if(item.innerText.includes('outube.') || item.innerText.includes('outu.')) {
                    YTtitleFromUrl(item.innerText).then(title => {
                        item.dataset.trackUrl = item.innerText;
                        item.innerText = title;
                        if(!item.innerText.includes('[YouTube]')) {
                            item.innerText += ' [YouTube]';
                        }
                    });
                }
                if(item.innerText.includes('soundcloud.com')) {
                    item.dataset.trackUrl = item.innerText;
                    item.innerText = extractSoundcloudTrackTitle(item.innerText);
                    item.innerText = capitalizeFirstLetter(item.innerText);
                    if(!item.innerText.includes('[Soundcloud]')) {
                        item.innerText += ' [Soundcloud]'; 
                    }
                }
                if(item.innerText.includes('spotify.com')) {
                  extractSpotifyTitle(item.innerText).then(title => {
                    item.dataset.trackUrl = item.innerText;
                    item.innerText = title;
                    if(!item.innerText.includes('[Spotify]')) {
                      item.innerText += ' [Spotify]';
                    }
                  });
                }
      });
}

// Execution
setInterval(handleMultipleURLs, 5000);

