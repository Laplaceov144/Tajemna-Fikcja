from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import Track, Playlist, TrackBinding
from datetime import datetime
from .titles import get_track_title
import json

# Create your views here.
def index(request):
    return render(request, "player/index.html")

@csrf_exempt
def submit_playlist(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body.decode('utf-8'))
            ip_address = request.META['REMOTE_ADDR']
            device_info = data.get('deviceInfo')
            the_list = data.get('list', [])
            
            should_create_playlist = False
            tracks_to_add = [] 
            
            for item in the_list:
                track_url = item['trackURL']
                title = get_track_title(track_url)
                
                track, created = Track.objects.get_or_create(url=track_url, defaults={'title': title})
                
                binding_exists = TrackBinding.objects.filter(
                    track=track,
                    number_on_pl=item['id']
                ).exists()
                
                if not binding_exists:
                    should_create_playlist = True
                    tracks_to_add.append((track, item['id']))
            
            if should_create_playlist:
                now = datetime.now()
                playlist = Playlist.objects.create(date_submitted=now, ip_address=ip_address,
                                                   users_device_info=device_info)
                for track, number_on_pl in tracks_to_add:
                    binding = TrackBinding.objects.create(
                        playlist=playlist,
                        track=track,
                        number_on_pl=number_on_pl
                    )
                    playlist.tracks.add(track)
                    
                return JsonResponse({'status': 'success'}, status=200)
            else:
                return JsonResponse({'status': 'empty_playlist', 'message': 'No new tracks to add'}, status=400)

        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)
