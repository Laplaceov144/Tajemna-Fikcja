from django.urls import path
from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path('api/submit-playlist/', views.submit_playlist, name='submit_playlist'),
]