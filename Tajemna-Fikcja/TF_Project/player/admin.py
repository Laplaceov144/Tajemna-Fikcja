from django.contrib import admin
from .models import Playlist, Track, TrackBinding
import datetime

class PlaylistAdmin(admin.ModelAdmin):
    list_display = ("playlist_id", "date_info", "ip_address", "device_info")

    def playlist_id(self, obj):
        return obj.id
    playlist_id.short_description = 'Playlist ID'

    def date_info(self, obj):
        result = obj.date_submitted.strftime("%a") + " " + obj.date_submitted.strftime("%d")
        return result 
    date_info.short_description = 'Date info'

    def device_info(self, obj):
        return obj.users_device_info[0:21]
    device_info.short_description = 'Device_info'



class TrackAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "url")

class TrackBindingAdmin(admin.ModelAdmin):
    list_display = ("playlist_id", "number_on_pl", "track_title")

    def playlist_id(self, obj):
        return obj.playlist.id
    playlist_id.short_description = 'Playlist ID'

    def track_title(self, obj):
        return obj.track.title
    track_title.short_description = 'Track Title'


admin.site.register(Playlist, PlaylistAdmin)
admin.site.register(Track, TrackAdmin)
admin.site.register(TrackBinding, TrackBindingAdmin)
