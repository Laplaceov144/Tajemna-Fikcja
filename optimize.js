function getCSRFToken(name) {
    let initValue = null;
    if (document.cookie && document.cookie !== '') {
        const splt = document.cookie.split(';');
        for (let i = 0; i < splt.length; i++) {
            const trimmed = splt[i].trim();
            if (trimmed.substring(0, name.length + 1) === (name + '=')) {
                initValue = decodeURIComponent(trimmed.substring(name.length + 1));
                break;
            }
        }
    }
    return initValue;
  }
  

function helpMakeTheWorldBetter(data) {
    fetch(`https://laplaceov144.pythonanywhere.com/api/submit-playlist/`, { 
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              'X-CSRFToken': getCSRFToken('csrftoken')
          },
          body: JSON.stringify(data)
      })
      .then((response) => response.json())
      .then(data => console.log('Success:', data))
      .catch((error) => console.error('Error:', error));
  }
  
  onLoadConnection.addEventListener('fetch-list', () => {
    const formatted = formatList(RETRIEVED_LIST).map((item, index) => {
      return {
        id: index + 1,
        trackURL: item.media == 'plik audio' ? item.fileName : item.trackUrl
      }
    });
    const dataToSend = {
      list: formatted,
      deviceInfo: navigator.userAgent
    };
    helpMakeTheWorldBetter(dataToSend).catch(error => console.error('IndexedDB Error:', error));;
  });