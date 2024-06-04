from django.urls import path
from .views import * 
from rest_framework_simplejwt.views import TokenObtainPairView


urlpatterns = [
    path('' , index, name="index"),
    path('register-user' , RegisterUserView.as_view()),
    path('forum', CreateForumView.as_view()),
	path('get-forums', GetForumsView.as_view()),
    path('create-session', SessionView.as_view()),
	path('get-sessions', GetSessionsView.as_view()),
    path('game-info', GameInfoView.as_view()),
    path('forum-post', PostView.as_view()),
    path('friend-requests', FriendRequestsView.as_view()),
    path('friends', FriendsView.as_view()),
    path('profile-bio', ProfileBioView.as_view()),
    path('profile-image', ProfileImageView.as_view()),
    path('update-password', UpdatePasswordView.as_view()),
    path('token', LoginView.as_view()),
	path('user-check', CurrentUserCheck.as_view()),
]