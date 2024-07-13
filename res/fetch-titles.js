export default function handleMultipleURLs() {

  
  // Extract Soundcloud title
  function extractSoundcloudTrackTitle(url) {
    const splitResult = url.split("/");
    const titleWithSpaces = splitResult[splitResult.length - 1].replace(
      /[-_]+/g,
      " "
    );
    const pseudoArtist = splitResult[splitResult.length - 2].replace(
      /[-_]+/g,
      " "
    );
    if (titleWithSpaces.includes("campaign=social")) {
      return pseudoArtist + " - " + titleWithSpaces.split("?")[0];
    }
    return pseudoArtist + " - " + titleWithSpaces;
  }

  // Extract YouTube ID
  const getYouTubeID = (url) => {
    if (url.includes("watch")) {
      const result = url.split("watch?v=")[1];

      return result;
    } else {
      const regExp =
        /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const lowered =
        url.split("e/")[0].toLowerCase() + "e/" + url.split("e/")[1];
      const match = lowered.match(regExp);

      return match && match[2].length === 11 ? match[2] : null;
    }
  };

  // Extract YT track title
  const YTtitleFromUrl = async (trackURL) => {
    try {
      const vidID = getYouTubeID(trackURL);
      const jxurl = `https://www.youtube.com/oembed?url=http://www.youtube.com/watch?v=${vidID}&format=json`;
      const response = await fetch(jxurl);

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      return data.title;
    } catch (error) {
      console.error("Fetching failed:", error);
      return trackURL;
    }
  };

  // Extract Spotify track title
  const extractSpotifyTitle = async (trackURL) => {
    try {
      const jxurl = `https://open.spotify.com/oembed?url=${trackURL}`;
      const response = await fetch(jxurl);

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      return data.title;
    } catch (error) {
      console.error("Fetching failed:", error);
      return trackURL;
    }
  };

  // Extract Google Drive file title
  async function fetchGoogleDriveFileTitle(fileUrl) {
    const extractedID = fileUrl.split("/d/")[1].split("/")[0];
    const API_KEY = "AIzaSyCkGcZKS_iPM9zP8SxsM_W_sdUOU4VwF3w";
    const url = `https://www.googleapis.com/drive/v3/files/${extractedID}?fields=name&key=${API_KEY}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Network response was not ok " + response.statusText);
      }
      const data = await response.json();
      return await data.name;
    } catch (error) {
      console.error("There was a problem with the fetch operation:", error);
    }
  }

  // For Mixcloud
  function formatMixcloudUrl(url) {
    const regex = /https:\/\/www\.mixcloud\.com\/[^\/]+\/([^\/]+)/;
    const match = url.match(regex);

    if (match && match[1]) {
        const words = match[1].split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        );
        
        return words.join(' ');
    } else {
        return "Invalid URL";
    }
}


  // Capitalize words in a title
  const capitalizeFirstLetter = (str) => {
    if (!str.includes(" ")) {
      return str;
    } else {
      return str
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    }
  };




  // Function driver code
  [...document.querySelectorAll(".item-text")].forEach((item) => {

    // YouTube
    if (
      item.innerText.includes("outube.") ||
      item.innerText.includes("outu.")
    ) {
      YTtitleFromUrl(item.innerText).then((title) => {
        item.dataset.trackUrl = item.innerText;
        item.innerText = title;
        if (!item.innerText.includes("[YouTube]")) {
          item.innerText += " [YouTube]";
        }
      });
    }

    // Soundcloud
    if (item.innerText.includes("soundcloud.com")) {
      item.dataset.trackUrl = item.innerText;
      item.innerText = extractSoundcloudTrackTitle(item.innerText);
      item.innerText = capitalizeFirstLetter(item.innerText);
      if (!item.innerText.includes("[Soundcloud]")) {
        item.innerText += " [Soundcloud]";
      }
    }

    // Mixcloud
    if (item.innerText.includes('mixcloud.com')) {
      item.dataset.trackUrl = item.innerText;
      item.innerText = formatMixcloudUrl(item.innerText);
      if (!item.innerText.includes("[Mixcloud]")) {
        item.innerText += " [Mixcloud]";
      }
    }

    // Spotify
    if (item.innerText.includes("spotify.com")) {
      extractSpotifyTitle(item.innerText).then((title) => {
        item.dataset.trackUrl = item.innerText;
        item.innerText = title;
        if (!item.innerText.includes("[Spotify]")) {
          item.innerText += " [Spotify]";
        }
      });
    }

    // Google Drive
    if (item.innerText.includes("drive.google.com")) {
      fetchGoogleDriveFileTitle(item.innerText).then((title) => {
        item.dataset.trackUrl = item.innerText;
        item.innerText = title;
        if (!item.innerText.includes("[dysk Google]")) {
          item.innerText += " [dysk Google]";
        }
      });
    }

  });
}
