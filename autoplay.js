// Function to enable autoplay
function enableAutoplay() {
    // Set autoplay preference in localStorage
    localStorage.setItem('autoplay', 'true');
  
    // Find all media elements and enable autoplay
    var mediaElements = document.querySelectorAll('audio, iframe');
    mediaElements.forEach(function(element) {
      element.autoplay = true;
      element.load(); // If necessary, reload the media element to apply the autoplay
    });
  }
  
  // Function to check and restore the autoplay setting on page load
  function restoreAutoplaySetting() {
    // Get autoplay preference from localStorage
    var autoplaySetting = localStorage.getItem('autoplay');
    
    if (autoplaySetting === 'true') {
      enableAutoplay(); // Enable autoplay if the setting was saved as true
    }
  }
  
  // Event listener for the button
  //document.addEventListener('click', enableAutoplay);
  
  // Call restoreAutoplaySetting on page load
  window.addEventListener('DOMContentLoaded', restoreAutoplaySetting);
  