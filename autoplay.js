// Function to enable autoplay
function enableAutoplay() {
    // Set autoplay preference in localStorage
    localStorage.setItem('autoplay', 'true');
  
    // Find all media elements and enable autoplay
    var mediaElements = document.querySelectorAll('audio, iframe');
    mediaElements.forEach(function(element) {
      element.autoplay = true;
      element.load();
    });
  }
  
  function restoreAutoplaySetting() {
    var autoplaySetting = localStorage.getItem('autoplay');
    
    if (autoplaySetting === 'true') {
      enableAutoplay(); 
    }
  }

  
  // Execute
  window.addEventListener('DOMContentLoaded', restoreAutoplaySetting);
  