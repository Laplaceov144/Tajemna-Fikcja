from django.contrib.auth.models import User
from django.db import models

class Track(models.Model):
    # Track information
    url = models.URLField(max_length=200)
    title = models.TextField(max_length=50, blank=True)

    def __str__(self):
        return f"{self.url}"

class Playlist(models.Model):
    # Basic playlist information
    date_submitted = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField()
    users_device_info = models.TextField(blank=True)
    tracks = models.ManyToManyField(Track, blank=True, related_name='playlist_tracks')

    def __str__(self):
        return f"Playlist {self.id} ({self.date_submitted})"

class TrackBinding(models.Model):
    playlist = models.ForeignKey(Playlist, related_name='playlist_tracks', on_delete=models.CASCADE)
    track = models.ForeignKey(Track, related_name='on_playlists', on_delete=models.CASCADE)
    number_on_pl = models.IntegerField()

    class Meta:
        unique_together = ('playlist', 'track', 'number_on_pl')

    def __str__(self):
        return f"{self.track.url} in Playlist {self.playlist.id} as track number {self.number_on_pl}"

class UserPlaylist(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    playlist = models.ForeignKey(Playlist, on_delete=models.CASCADE)

    class Meta:
        unique_together = ('user', 'playlist')  # Ensures a user can't have the same playlist twice
