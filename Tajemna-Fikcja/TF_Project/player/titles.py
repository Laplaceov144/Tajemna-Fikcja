import re
from pip._vendor import requests

def extract_soundcloud_title(url):
    split_result = url.split('/')
    title_with_spaces = split_result[-1].replace('-', ' ').replace('_', ' ')
    pseudo_artist = split_result[-2].replace('-', ' ').replace('_', ' ')
    if 'campaign=social' in title_with_spaces:
        return pseudo_artist + ' - ' + title_with_spaces.split('?')[0]
    return pseudo_artist + ' - ' + title_with_spaces

def get_youtube_id(url):
    if 'watch' in url:
        result = url.split('watch?v=')[1]
        return result
    else:
        reg_exp = re.compile(r'^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*')
        lowered = url.split('e/')[0].lower() + 'e/' + ''.join(url.split('e/')[1:])
        match = reg_exp.match(lowered)
        
        return match.group(2) if match and len(match.group(2)) == 11 else None

def yt_title_from_url(track_url):
    try:
        vid_id = get_youtube_id(track_url)
        jxurl = f"https://www.youtube.com/oembed?url=http://www.youtube.com/watch?v={vid_id}&format=json"
        
        response = requests.get(jxurl)
        if response.status_code != 200:
            raise Exception('Network response was not ok')

        data = response.json()
        return data["title"]

    except Exception as error:
        print(f'Fetching failed: {error}')
        return track_url

def get_spotify_title(track_url):
    try:
        jxurl = f"https://open.spotify.com/oembed?url={track_url}"

        response = requests.get(jxurl)
        if response.status.code != 200:
              raise Exception('Network response was not ok')

        data = response.json()
        return data["title"]

    except Exception as error:
        print(f'Fetching failed: {error}')
        return track_url    
    
def get_track_title(track_url):
    if 'soundcloud.com' in track_url:
        return extract_soundcloud_title(track_url)
    elif 'spotify.com' in track_url:
        return get_spotify_title(track_url)
    elif '.mp3' in track_url:
        return track_url
    else:
        return yt_title_from_url(track_url)
