from django.test import TestCase
from .models import *
from django.urls import reverse
from .views import * 
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.test import APIClient


#Testing the game model and its requests
class GameTest(TestCase):

    def create_game(self, game_short_name="Apex", game_name="Apex Legends",description="This is my description.",image_path="imgae/path/img.jpg"):
        return Game.objects.create(game_short_name=game_short_name, game_name=game_name, description=description,image_path=image_path)

    #Testing if game model is created correctly
    def test_game_creation(self):
        game = self.create_game()
        self.assertTrue(isinstance(game, Game))
        self.assertEqual(game.__str__(), game.game_name)
    
    #Testing if game list is correctly returned
    def test_game_list_view(self):
        game = self.create_game()
        resp = self.client.get('http://localhost:8000/api/game-info')
        self.assertEqual(resp.status_code, 200)
        self.assertIn(game.game_name,resp.content.decode())

#Testing the session model and its requests
class SessionTest(TestCase):
    
    def create_game(self, game_short_name="Apex", game_name="Apex Legends",description="This is my description.",image_path="imgae/path/img.jpg"):
        return Game.objects.create(game_short_name=game_short_name, game_name=game_name, description=description,image_path=image_path)

    def create_user(self,username='testuser1',email="test@gmail.com",password='1X<ISRUkw+tuK'):
        return User.objects.create_user(username=username,email=email,password=password)
    
    def create_session(self,max_players=3,session_name="Apex Grind",description="Welcome to Apex Grind",instructions="Join Here"):
        game = self.create_game()
        user = self.create_user()
        return GameSession.objects.create(created_by=user,game=game,max_players=max_players,session_name=session_name,description=description,instructions=instructions)

    #Testing if session model is created correctly
    def test_session_creation(self):
        session = self.create_session()
        self.assertTrue(isinstance(session, GameSession))
        self.assertEqual(session.__str__(),str(session.created_by) + ": " + session.session_name)
        self.assertFalse(session.is_full())

     #Testing if session list is correctly returned
    def test_session_list_view(self):
        session = self.create_session()
        resp = self.client.get('http://localhost:8000/api/get-sessions')

        self.assertEqual(resp.status_code, 200)
        self.assertIn(session.session_name,resp.content.decode())
    
     #Testing unautharized session join
    def test_join_if_not_logged_in(self):
        session = self.create_session()
        resp = self.client.put('http://localhost:8000/api/create-session',{'action': 0})
        self.assertEqual(resp.status_code, 401)


#Testing the forum post model and its requests
class ForumPostTest(TestCase):

    def create_user(self,username='testuser1', password='1X<ISRUkw+tuK'):
        return User.objects.create(username=username,password=password)

    def create_forum_post(self,text="Hey",reported=False):
        user = self.create_user()
        return ForumPost.objects.create(posted_by=user,text=text,reported=reported)
    
    #Testing if forum post model is created correctly
    def test_post_creation(self):
        post = self.create_forum_post()
        self.assertTrue(isinstance(post, ForumPost))
        self.assertEqual(post.__str__(), str(post.id))
    
     #Testing if reported post is correctly updated
    def test_post_creation_reported(self):
        post = self.create_forum_post("hey",True)
        self.assertTrue(isinstance(post, ForumPost))
        self.assertEqual(post.__str__(), str(post.id) + " (Review Required)")

#Testing the forum model and its requests
class ForumTest(TestCase):
    
    def create_user(self,username='testuser1', password='1X<ISRUkw+tuK'):
        return User.objects.create(username=username,password=password)
    
    def create_forum_post(self,text="Hey",reported=False):
        user = self.create_user()
        return ForumPost.objects.create(posted_by=user,text=text,reported=reported)
    
    def create_forum(self,title="Apex Forum",tag="apex",description="Welcome"):
        return Forum.objects.create(title=title,tag=tag,description=description)
    
    #Testing if forum model is created correctly
    def test_forum_creation(self):
        forum = self.create_forum()
        self.assertTrue(isinstance(forum, Forum))
        self.assertEqual(forum.__str__(), forum.title)

     #Testing if forums list is correctly returned
    def test_forum_list_view(self):
        forum = self.create_forum()
        resp = self.client.get('http://localhost:8000/api/get-forums')

        self.assertEqual(resp.status_code, 200)
        self.assertIn(forum.title,resp.content.decode())

#Testing the friends model and its requests
class FriendsTest(TestCase):

    def create_user(self,username='testuser1', password='1X<ISRUkw+tuK'):
        return User.objects.create(username=username,password=password)
    
    def create_friend(self):
        user = self.create_user()
        user2 = self.create_user("test2","2X<ISRUkw+tuK")
        return Friends.objects.create(user=user,friend=user2)
    
    #Testing if friend model is created correctly
    def test_friend_creation(self):
        friend = self.create_friend()
        self.assertTrue(isinstance(friend, Friends))
        self.assertEqual(friend.__str__(), str(friend.user) + " and " + str(friend.friend))

#Testing the friends request model and its requests
class FriendRequestTest(TestCase):

    def create_user(self,username='testuser1', password='1X<ISRUkw+tuK'):
        return User.objects.create(username=username,password=password)
    
    def create_friend_request(self):
        user = self.create_user()
        user2 = self.create_user("test2","2X<ISRUkw+tuK")
        return FriendRequests.objects.create(sender=user,receiver=user2)
    
     #Testing if friend request model is created correctly
    def test_friend_request_creation(self):
        friend_request = self.create_friend_request()
        self.assertTrue(isinstance(friend_request, FriendRequests))
        self.assertEqual(friend_request.__str__(), str(friend_request.sender) + " to " + str(friend_request.receiver) )

#Testing the profile bio model and its requests
class ProfileBioTest(TestCase):

    def create_user(self,username='testuser1', password='1X<ISRUkw+tuK'):
        return User.objects.create(username=username,password=password)
    
    def create_profile_bio(self):
        user = self.create_user()
        return ProfileBio.objects.create(user=user,bio="My Bio",img_url="image")
    
     #Testing if profile bio model is created correctly
    def test_friend_request_creation(self):
        bio = self.create_profile_bio()
        self.assertTrue(isinstance(bio, ProfileBio))
        self.assertEqual(bio.__str__(),str(bio.user) + ": " + bio.bio) 
    
     



