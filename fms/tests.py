from django.test import TestCase
from .models import *
from django.urls import reverse
from .views import * 
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.test import APIClient
from django.utils import timezone
from datetime import timedelta


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
    
     





#Testing security rules on registration, password change and kicking players
class SecurityTest(TestCase):

    def setUp(self):
        self.client = APIClient()
        self.password = '1X<ISRUkw+tuK'
        self.host = User.objects.create_user(username='host', password=self.password)
        self.player = User.objects.create_user(username='player', password=self.password)
        self.other = User.objects.create_user(username='other', password=self.password)
        game = Game.objects.create(game_short_name="Apex", game_name="Apex Legends", description="desc", image_path="img.jpg")
        self.session = GameSession.objects.create(created_by=self.host, game=game, max_players=3, session_name="s", description="d", instructions="i")
        self.session.players.add(self.player)

    def login(self, user):
        token = RefreshToken.for_user(user).access_token
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

    #Register response must not contain the password, and the stored password must be hashed
    def test_register_does_not_return_password(self):
        resp = self.client.post('/api/register-user', {'username': 'new', 'email': 'new@example.com', 'password': self.password}, format='json')
        self.assertEqual(resp.status_code, 201)
        self.assertNotIn('password', resp.data)
        self.assertTrue(User.objects.get(username='new').check_password(self.password))

    #Register rejects weak passwords
    def test_register_rejects_weak_password(self):
        resp = self.client.post('/api/register-user', {'username': 'new', 'email': 'new@example.com', 'password': '1234'}, format='json')
        self.assertEqual(resp.status_code, 400)
        self.assertIn('password', resp.data)

    #Only the host can kick players
    def test_non_host_cannot_kick(self):
        self.login(self.other)
        resp = self.client.put('/api/create-session', {'action': 2, 'session_id': self.session.id, 'player_id': self.player.id}, format='json')
        self.assertEqual(resp.status_code, 403)
        self.assertIn(self.player, self.session.players.all())

    def test_host_can_kick(self):
        self.login(self.host)
        resp = self.client.put('/api/create-session', {'action': 2, 'session_id': self.session.id, 'player_id': self.player.id}, format='json')
        self.assertEqual(resp.status_code, 200)
        self.assertNotIn(self.player, self.session.players.all())

    #Password change requires the current password
    def test_update_password_requires_old_password(self):
        self.login(self.player)
        resp = self.client.post('/api/update-password', {'old_password': 'wrong', 'new_password': 'N3w-Strong-Pass!'}, format='json')
        self.assertEqual(resp.status_code, 400)
        self.player.refresh_from_db()
        self.assertTrue(self.player.check_password(self.password))

    def test_update_password_rejects_weak_password(self):
        self.login(self.player)
        resp = self.client.post('/api/update-password', {'old_password': self.password, 'new_password': '1234'}, format='json')
        self.assertEqual(resp.status_code, 400)

    def test_update_password_success(self):
        self.login(self.player)
        resp = self.client.post('/api/update-password', {'old_password': self.password, 'new_password': 'N3w-Strong-Pass!'}, format='json')
        self.assertEqual(resp.status_code, 200)
        self.player.refresh_from_db()
        self.assertTrue(self.player.check_password('N3w-Strong-Pass!'))


#Testing gamer tags on profiles and in session data
class GamerTagsTest(TestCase):

    def setUp(self):
        self.client = APIClient()
        self.host = User.objects.create_user(username='host', password='1X<ISRUkw+tuK')
        self.player = User.objects.create_user(username='player', password='1X<ISRUkw+tuK')
        game = Game.objects.create(game_short_name="Apex", game_name="Apex Legends", description="desc", image_path="img.jpg")
        self.session = GameSession.objects.create(created_by=self.host, game=game, max_players=3, session_name="s", description="d", instructions="i")
        self.session.players.add(self.player)

    def login(self, user):
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {RefreshToken.for_user(user).access_token}')

    def test_requires_login(self):
        resp = self.client.get('/api/gamer-tags')
        self.assertEqual(resp.status_code, 401)

    def test_get_defaults_to_empty(self):
        self.login(self.player)
        resp = self.client.get('/api/gamer-tags')
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.data, {'psn': '', 'xbox': '', 'steam': '', 'riot': '', 'ea': '', 'activision': ''})
        self.assertFalse(GamerTags.objects.filter(user=self.player).exists())

    def test_update_and_partial_update(self):
        self.login(self.player)
        resp = self.client.put('/api/gamer-tags', {'psn': '  PlayerOne ', 'riot': 'Player#EUW'}, format='json')
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.data['psn'], 'PlayerOne')

        self.client.put('/api/gamer-tags', {'psn': ''}, format='json')
        tags = GamerTags.objects.get(user=self.player)
        self.assertEqual(tags.psn, '')
        self.assertEqual(tags.riot, 'Player#EUW')

    def test_rejects_too_long(self):
        self.login(self.player)
        resp = self.client.put('/api/gamer-tags', {'xbox': 'x' * 51}, format='json')
        self.assertEqual(resp.status_code, 400)

    def test_tags_shown_to_squad_members(self):
        GamerTags.objects.create(user=self.host, steam='HostSteam')
        GamerTags.objects.create(user=self.player, psn='PlayerPSN')
        self.login(self.player)
        session = self.client.get(f'/api/session/{self.session.id}').data
        self.assertEqual(session['hostGamerTags'], {'steam': 'HostSteam'})
        self.assertEqual(session['players'][0]['gamerTags'], {'psn': 'PlayerPSN'})

    def test_sessions_without_tags(self):
        self.login(self.host)
        session = self.client.get(f'/api/session/{self.session.id}').data
        self.assertEqual(session['hostGamerTags'], {})
        self.assertEqual(session['players'][0]['gamerTags'], {})


#Testing room chat permissions, polling and limits
class SessionChatTest(TestCase):

    def setUp(self):
        self.client = APIClient()
        self.host = User.objects.create_user(username='host', password='1X<ISRUkw+tuK')
        self.player = User.objects.create_user(username='player', password='1X<ISRUkw+tuK')
        self.outsider = User.objects.create_user(username='outsider', password='1X<ISRUkw+tuK')
        game = Game.objects.create(game_short_name="Apex", game_name="Apex Legends", description="desc", image_path="img.jpg")
        self.session = GameSession.objects.create(created_by=self.host, game=game, max_players=3, session_name="s", description="d", instructions="i")
        self.session.players.add(self.player)
        self.url = f'/api/session-chat/{self.session.id}'

    def login(self, user):
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {RefreshToken.for_user(user).access_token}')

    def post(self, text):
        return self.client.post(self.url, {'text': text}, format='json')

    def test_requires_login(self):
        self.assertEqual(self.client.get(self.url).status_code, 401)

    def test_outsider_cannot_read_or_post(self):
        self.login(self.outsider)
        self.assertEqual(self.client.get(self.url).status_code, 403)
        self.assertEqual(self.post('hi').status_code, 403)

    def test_unknown_session(self):
        self.login(self.host)
        self.assertEqual(self.client.get('/api/session-chat/9999').status_code, 404)

    def test_host_and_player_can_chat(self):
        self.login(self.host)
        resp = self.post('  hello squad  ')
        self.assertEqual(resp.status_code, 201)
        self.assertEqual(resp.data['text'], 'hello squad')
        self.assertEqual(resp.data['username'], 'host')

        self.login(self.player)
        self.post('hey')
        texts = [m['text'] for m in self.client.get(self.url).data]
        self.assertEqual(texts, ['hello squad', 'hey'])

    def test_after_returns_only_newer(self):
        self.login(self.host)
        first = self.post('one').data['id']
        self.post('two')
        resp = self.client.get(self.url, {'after': first})
        self.assertEqual([m['text'] for m in resp.data], ['two'])
        self.assertEqual(self.client.get(self.url, {'after': 'abc'}).status_code, 400)

    def test_first_load_returns_latest_messages_in_order(self):
        for i in range(55):
            ChatMessage.objects.create(session=self.session, sender=self.host, text=str(i))
        self.login(self.host)
        texts = [m['text'] for m in self.client.get(self.url).data]
        self.assertEqual(len(texts), 50)
        self.assertEqual(texts[0], '5')
        self.assertEqual(texts[-1], '54')

    def test_rejects_empty_and_too_long(self):
        self.login(self.host)
        self.assertEqual(self.post('   ').status_code, 400)
        self.assertEqual(self.post('x' * 501).status_code, 400)

    def test_rate_limit(self):
        self.login(self.player)
        for i in range(5):
            self.assertEqual(self.post(str(i)).status_code, 201)
        self.assertEqual(self.post('too fast').status_code, 429)

    def test_kicked_player_loses_access(self):
        self.session.players.remove(self.player)
        self.login(self.player)
        self.assertEqual(self.client.get(self.url).status_code, 403)

    def test_messages_deleted_with_session(self):
        ChatMessage.objects.create(session=self.session, sender=self.host, text='bye')
        self.session.delete()
        self.assertFalse(ChatMessage.objects.exists())

    def test_report_message(self):
        message = ChatMessage.objects.create(session=self.session, sender=self.host, text='rude')
        self.login(self.player)
        resp = self.client.post(self.url + '/report', {'message_id': message.id}, format='json')
        self.assertEqual(resp.status_code, 200)
        message.refresh_from_db()
        self.assertTrue(message.reported)
        self.assertEqual(self.client.post(self.url + '/report', {'message_id': 'x'}, format='json').status_code, 400)

    def test_outsider_cannot_report(self):
        message = ChatMessage.objects.create(session=self.session, sender=self.host, text='hi')
        self.login(self.outsider)
        resp = self.client.post(self.url + '/report', {'message_id': message.id}, format='json')
        self.assertEqual(resp.status_code, 403)


#Testing rank ranges on games and sessions
class RankRangeTest(TestCase):

    RANKS = ['Rookie', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Master', 'Apex Predator']

    def setUp(self):
        self.client = APIClient()
        self.host = User.objects.create_user(username='host', password='1X<ISRUkw+tuK')
        self.game = Game.objects.create(game_short_name="Apex", game_name="Apex Legends", description="desc", image_path="img.jpg", ranks=self.RANKS)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {RefreshToken.for_user(self.host).access_token}')

    def create(self, **ranks):
        body = {'game_id': self.game.id, 'max_players': 3, 'session_name': 's', 'description': 'd', 'instructions': 'i', **ranks}
        return self.client.post('/api/create-session', body, format='json')

    def test_game_info_includes_ranks(self):
        resp = self.client.get('/api/game-info')
        self.assertEqual(resp.data[0]['ranks'], self.RANKS)

    def test_create_with_rank_range(self):
        resp = self.create(min_rank='Gold', max_rank='Diamond')
        self.assertEqual(resp.status_code, 201)
        session = self.client.get('/api/get-sessions').data[0]
        self.assertEqual((session['minRank'], session['maxRank']), ('Gold', 'Diamond'))

    def test_create_without_rank_range(self):
        self.assertEqual(self.create().status_code, 201)
        session = self.client.get('/api/get-sessions').data[0]
        self.assertEqual((session['minRank'], session['maxRank']), (None, None))

    def test_one_sided_range(self):
        self.assertEqual(self.create(min_rank='Platinum').status_code, 201)
        session = self.client.get('/api/get-sessions').data[0]
        self.assertEqual((session['minRank'], session['maxRank']), ('Platinum', None))

    def test_rejects_rank_from_another_game(self):
        resp = self.create(min_rank='Challenger')
        self.assertEqual(resp.status_code, 400)
        self.assertIn('not a Apex Legends rank', resp.data['detail'])
        self.assertFalse(GameSession.objects.exists())

    def test_rejects_inverted_range(self):
        resp = self.create(min_rank='Diamond', max_rank='Gold')
        self.assertEqual(resp.status_code, 400)
        self.assertFalse(GameSession.objects.exists())

    def test_same_min_and_max(self):
        self.assertEqual(self.create(min_rank='Gold', max_rank='Gold').status_code, 201)



#Testing that join instructions and gamer tags are only shown to squad members
class SessionPrivacyTest(TestCase):

    def setUp(self):
        self.client = APIClient()
        self.host = User.objects.create_user(username='host', password='1X<ISRUkw+tuK')
        self.player = User.objects.create_user(username='player', password='1X<ISRUkw+tuK')
        self.outsider = User.objects.create_user(username='outsider', password='1X<ISRUkw+tuK')
        GamerTags.objects.create(user=self.host, psn='HostPSN')
        GamerTags.objects.create(user=self.player, xbox='PlayerXbox')
        game = Game.objects.create(game_short_name="Apex", game_name="Apex Legends", description="desc", image_path="img.jpg")
        self.session = GameSession.objects.create(created_by=self.host, game=game, max_players=3, session_name="s", description="d", instructions="secret discord link")
        self.session.players.add(self.player)
        self.url = f'/api/session/{self.session.id}'

    def login(self, user):
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {RefreshToken.for_user(user).access_token}')

    def assertPublic(self, data):
        self.assertNotIn('joinDescription', data)
        self.assertNotIn('hostGamerTags', data)
        self.assertNotIn('gamerTags', data['players'][0])
        self.assertNotIn('secret discord link', str(data))

    def test_session_list_is_public_only(self):
        self.login(self.host)
        self.assertPublic(self.client.get('/api/get-sessions').data[0])

    def test_detail_for_anonymous_is_public_only(self):
        resp = self.client.get(self.url)
        self.assertEqual(resp.status_code, 200)
        self.assertPublic(resp.data)
        self.assertEqual(resp.data['sessionName'], 's')

    def test_detail_for_outsider_is_public_only(self):
        self.login(self.outsider)
        self.assertPublic(self.client.get(self.url).data)

    def test_detail_for_host_and_player_is_private(self):
        for user in (self.host, self.player):
            self.login(user)
            data = self.client.get(self.url).data
            self.assertEqual(data['joinDescription'], 'secret discord link')
            self.assertEqual(data['hostGamerTags'], {'psn': 'HostPSN'})
            self.assertEqual(data['players'][0]['gamerTags'], {'xbox': 'PlayerXbox'})

    def test_detail_unknown_session(self):
        self.assertEqual(self.client.get('/api/session/9999').status_code, 404)


#Testing that bad input gets a 4xx response instead of a server error
class InputValidationTest(TestCase):

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username='user', password='1X<ISRUkw+tuK')
        self.other = User.objects.create_user(username='other', password='1X<ISRUkw+tuK')
        self.game = Game.objects.create(game_short_name="Apex", game_name="Apex Legends", description="desc", image_path="img.jpg")
        self.forum = Forum.objects.create(title="Apex Forum", tag="apex", description="d")
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {RefreshToken.for_user(self.user).access_token}')

    def session_body(self, **overrides):
        return {'game_id': self.game.id, 'max_players': 3, 'session_name': 's', 'description': 'd', 'instructions': 'i', **overrides}

    def test_create_session_validation(self):
        bad_bodies = [
            self.session_body(game_id=9999),
            self.session_body(max_players=0),
            self.session_body(max_players=-2),
            self.session_body(max_players=500),
            self.session_body(max_players='lots'),
            self.session_body(session_name=''),
            self.session_body(session_name='x' * 101),
            self.session_body(description='x' * 301),
            {'game_id': self.game.id},
            {},
        ]
        for body in bad_bodies:
            resp = self.client.post('/api/create-session', body, format='json')
            self.assertEqual(resp.status_code, 400, body)
            self.assertIn('detail', resp.data)
        self.assertFalse(GameSession.objects.exists())

    def test_cannot_create_two_sessions(self):
        self.assertEqual(self.client.post('/api/create-session', self.session_body(), format='json').status_code, 201)
        resp = self.client.post('/api/create-session', self.session_body(), format='json')
        self.assertEqual(resp.status_code, 400)

    def test_session_actions_validation(self):
        session = GameSession.objects.create(created_by=self.other, game=self.game, max_players=1, session_name="s", description="d", instructions="i")
        self.assertEqual(self.client.put('/api/create-session', {'action': 0}, format='json').status_code, 400)
        self.assertEqual(self.client.put('/api/create-session', {'action': 0, 'session_id': 9999}, format='json').status_code, 404)
        self.assertEqual(self.client.put('/api/create-session', {'action': 7, 'session_id': session.id}, format='json').status_code, 400)
        self.assertEqual(self.client.put('/api/create-session', {'action': 1, 'session_id': session.id}, format='json').status_code, 400)

        # join, then the room is full for anyone else
        self.assertEqual(self.client.put('/api/create-session', {'action': 0, 'session_id': session.id}, format='json').status_code, 200)
        third = User.objects.create_user(username='third', password='1X<ISRUkw+tuK')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {RefreshToken.for_user(third).access_token}')
        resp = self.client.put('/api/create-session', {'action': 0, 'session_id': session.id}, format='json')
        self.assertEqual(resp.status_code, 400)
        self.assertEqual(resp.data['detail'], 'This room is full.')

    def test_kick_unknown_player(self):
        session = GameSession.objects.create(created_by=self.user, game=self.game, max_players=3, session_name="s", description="d", instructions="i")
        for player_id in (9999, 'abc', None):
            resp = self.client.put('/api/create-session', {'action': 2, 'session_id': session.id, 'player_id': player_id}, format='json')
            self.assertEqual(resp.status_code, 400)

    def test_game_info_empty(self):
        Game.objects.all().delete()
        resp = self.client.get('/api/game-info')
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.data, [])

    def test_forum_post_validation(self):
        self.assertEqual(self.client.post('/api/forum', {'tag': 'nope', 'text': 'hi'}, format='json').status_code, 404)
        self.assertEqual(self.client.post('/api/forum', {'tag': 'apex', 'text': '   '}, format='json').status_code, 400)
        self.assertEqual(self.client.post('/api/forum', {'tag': 'apex', 'text': 'x' * 301}, format='json').status_code, 400)
        self.assertEqual(self.client.post('/api/forum', {'tag': 'apex', 'text': 'hello'}, format='json').status_code, 201)
        self.assertEqual(self.client.put('/api/forum-post', {'post_id': 9999}, format='json').status_code, 404)
        self.assertEqual(self.client.put('/api/forum-post', {}, format='json').status_code, 404)

    def test_friend_request_validation(self):
        self.assertEqual(self.client.post('/api/friend-requests', {'rec_username': 'ghost'}, format='json').status_code, 404)
        self.assertEqual(self.client.post('/api/friend-requests', {'rec_username': 'user'}, format='json').status_code, 400)
        self.assertEqual(self.client.put('/api/friend-requests', {'friend_username': 'other', 'action': 0}, format='json').status_code, 404)
        FriendRequests.objects.create(sender=self.other, receiver=self.user)
        self.assertEqual(self.client.put('/api/friend-requests', {'friend_username': 'other', 'action': 5}, format='json').status_code, 400)
        self.assertEqual(self.client.put('/api/friend-requests', {'friend_username': 'other', 'action': 0}, format='json').status_code, 200)
        self.assertEqual(self.client.get('/api/friends').data, [{'username': 'other'}])
        self.assertEqual(self.client.put('/api/friends', {'friend_username': 'ghost'}, format='json').status_code, 404)
        self.assertEqual(self.client.put('/api/friends', {'friend_username': 'other'}, format='json').status_code, 200)
        self.assertEqual(self.client.get('/api/friends').data, [])

    def test_friend_lists_only_show_own(self):
        third = User.objects.create_user(username='third', password='1X<ISRUkw+tuK')
        Friends.objects.create(user=self.other, friend=third)
        FriendRequests.objects.create(sender=self.other, receiver=third)
        self.assertEqual(self.client.get('/api/friends').data, [])
        self.assertEqual(self.client.get('/api/friend-requests').data, [])

    def test_profile_validation(self):
        self.assertEqual(self.client.post('/api/profile-bio', {}, format='json').status_code, 400)
        self.assertEqual(self.client.post('/api/profile-bio', {'bio': 'x' * 301}, format='json').status_code, 400)
        # saving works even before the profile was ever fetched
        self.assertEqual(self.client.post('/api/profile-bio', {'bio': 'hello'}, format='json').status_code, 200)
        self.assertEqual(self.client.get('/api/profile-bio').data, {'bio': 'hello'})

        for bad_url in ('not a url', 'javascript:alert(1)', 'ftp://example.com/a.png', ''):
            self.assertEqual(self.client.post('/api/profile-image', {'image_url': bad_url}, format='json').status_code, 400, bad_url)
        self.assertEqual(self.client.post('/api/profile-image', {'image_url': 'https://example.com/me.png'}, format='json').status_code, 200)
        self.assertEqual(self.client.get('/api/profile-image').data, {'image_url': 'https://example.com/me.png'})


#Testing short-lived access tokens, refresh and logout
class TokenTest(TestCase):

    def setUp(self):
        self.client = APIClient()
        self.password = '1X<ISRUkw+tuK'
        User.objects.create_user(username='player', password=self.password)

    def login(self):
        resp = self.client.post('/api/token', {'username': 'player', 'password': self.password}, format='json')
        self.assertEqual(resp.status_code, 200)
        return resp.data

    def test_access_token_is_short_lived(self):
        from rest_framework_simplejwt.tokens import AccessToken
        access = AccessToken(self.login()['access'])
        lifetime = access['exp'] - access['iat']
        self.assertEqual(lifetime, 15 * 60)

    def test_refresh_rotates_and_revokes_old_token(self):
        tokens = self.login()
        resp = self.client.post('/api/token/refresh', {'refresh': tokens['refresh']}, format='json')
        self.assertEqual(resp.status_code, 200)
        self.assertIn('access', resp.data)
        self.assertNotEqual(resp.data['refresh'], tokens['refresh'])

        # the new access token works
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {resp.data['access']}")
        self.assertEqual(self.client.get('/api/user-check').data, {'username': 'player'})

        # the old refresh token was revoked by the rotation
        self.client.credentials()
        self.assertEqual(self.client.post('/api/token/refresh', {'refresh': tokens['refresh']}, format='json').status_code, 401)

    def test_logout_revokes_refresh_token(self):
        tokens = self.login()
        self.assertEqual(self.client.post('/api/logout', {'refresh': tokens['refresh']}, format='json').status_code, 200)
        self.assertEqual(self.client.post('/api/token/refresh', {'refresh': tokens['refresh']}, format='json').status_code, 401)

    def test_refresh_with_garbage_token(self):
        self.assertEqual(self.client.post('/api/token/refresh', {'refresh': 'nonsense'}, format='json').status_code, 401)


#Testing that rooms close themselves when their time runs out
class RoomExpiryTest(TestCase):

    def setUp(self):
        self.client = APIClient()
        self.host = User.objects.create_user(username='host', password='1X<ISRUkw+tuK')
        self.player = User.objects.create_user(username='player', password='1X<ISRUkw+tuK')
        self.game = Game.objects.create(game_short_name="Apex", game_name="Apex Legends", description="desc", image_path="img.jpg")

    def login(self, user):
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {RefreshToken.for_user(user).access_token}')

    def make_session(self, expires_in):
        session = GameSession.objects.create(created_by=self.host, game=self.game, max_players=3, session_name="s",
                                             description="d", instructions="i", expires_at=timezone.now() + expires_in)
        session.players.add(self.player)
        return session

    def body(self, **extra):
        return {'game_id': self.game.id, 'max_players': 3, 'session_name': 's', 'description': 'd', 'instructions': 'i', **extra}

    def test_default_and_chosen_duration(self):
        self.login(self.host)
        resp = self.client.post('/api/create-session', self.body(), format='json')
        expires = GameSession.objects.get(id=resp.data['id']).expires_at
        self.assertAlmostEqual((expires - timezone.now()).total_seconds(), 4 * 3600, delta=60)

        GameSession.objects.all().delete()
        resp = self.client.post('/api/create-session', self.body(duration_hours=12), format='json')
        expires = GameSession.objects.get(id=resp.data['id']).expires_at
        self.assertAlmostEqual((expires - timezone.now()).total_seconds(), 12 * 3600, delta=60)

    def test_rejects_unsupported_duration(self):
        self.login(self.host)
        for hours in (0, 3, 48, 'forever'):
            self.assertEqual(self.client.post('/api/create-session', self.body(duration_hours=hours), format='json').status_code, 400)

    def test_expired_rooms_disappear(self):
        expired = self.make_session(timedelta(minutes=-1))
        self.assertEqual(self.client.get('/api/get-sessions').data, [])
        self.assertEqual(self.client.get(f'/api/session/{expired.id}').status_code, 404)
        self.assertFalse(GameSession.objects.filter(id=expired.id).exists())

    def test_expired_room_does_not_block_new_rooms(self):
        self.make_session(timedelta(minutes=-1))
        self.login(self.player)
        self.assertEqual(self.client.post('/api/create-session', self.body(), format='json').status_code, 201)

    def test_expired_room_chat_is_gone(self):
        expired = self.make_session(timedelta(minutes=-1))
        self.login(self.player)
        self.assertEqual(self.client.get(f'/api/session-chat/{expired.id}').status_code, 404)

    def test_host_can_extend(self):
        session = self.make_session(timedelta(minutes=30))
        self.login(self.host)
        resp = self.client.put('/api/create-session', {'action': 3, 'session_id': session.id}, format='json')
        self.assertEqual(resp.status_code, 200)
        session.refresh_from_db()
        self.assertAlmostEqual((session.expires_at - timezone.now()).total_seconds(), 90 * 60, delta=60)

    def test_extend_is_capped_at_24_hours(self):
        session = self.make_session(timedelta(hours=23, minutes=30))
        self.login(self.host)
        self.client.put('/api/create-session', {'action': 3, 'session_id': session.id}, format='json')
        session.refresh_from_db()
        self.assertLessEqual(session.expires_at, timezone.now() + timedelta(hours=24))

    def test_only_host_can_extend(self):
        session = self.make_session(timedelta(minutes=30))
        self.login(self.player)
        self.assertEqual(self.client.put('/api/create-session', {'action': 3, 'session_id': session.id}, format='json').status_code, 403)

    def test_expires_at_in_session_data(self):
        session = self.make_session(timedelta(hours=2))
        self.assertIn('expiresAt', self.client.get(f'/api/session/{session.id}').data)

    def test_management_command(self):
        from django.core.management import call_command
        from io import StringIO
        expired = self.make_session(timedelta(minutes=-5))
        call_command('close_expired_rooms', stdout=StringIO())
        self.assertFalse(GameSession.objects.filter(id=expired.id).exists())


#Testing players' saved ranks per game
class PlayerRankTest(TestCase):

    def setUp(self):
        self.client = APIClient()
        self.host = User.objects.create_user(username='host', password='1X<ISRUkw+tuK')
        self.player = User.objects.create_user(username='player', password='1X<ISRUkw+tuK')
        self.apex = Game.objects.create(game_short_name="Apex", game_name="Apex Legends", description="d", image_path="i", ranks=['Bronze', 'Silver', 'Gold'])
        self.lol = Game.objects.create(game_short_name="LoL", game_name="League of Legends", description="d", image_path="i", ranks=['Iron', 'Gold', 'Challenger'])
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {RefreshToken.for_user(self.player).access_token}')

    def test_save_update_and_clear(self):
        resp = self.client.put('/api/my-ranks', {str(self.apex.id): 'Silver', str(self.lol.id): 'Challenger'}, format='json')
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.data, {str(self.apex.id): 'Silver', str(self.lol.id): 'Challenger'})

        self.client.put('/api/my-ranks', {str(self.apex.id): 'Gold'}, format='json')
        self.client.put('/api/my-ranks', {str(self.lol.id): ''}, format='json')
        self.assertEqual(self.client.get('/api/my-ranks').data, {str(self.apex.id): 'Gold'})

    def test_rejects_invalid_ranks(self):
        self.assertEqual(self.client.put('/api/my-ranks', {str(self.apex.id): 'Challenger'}, format='json').status_code, 400)
        self.assertEqual(self.client.put('/api/my-ranks', {'9999': 'Gold'}, format='json').status_code, 400)
        self.assertEqual(self.client.put('/api/my-ranks', {'abc': 'Gold'}, format='json').status_code, 400)
        self.assertEqual(self.client.put('/api/my-ranks', ['Gold'], format='json').status_code, 400)
        # nothing was saved by a request containing an invalid entry
        self.client.put('/api/my-ranks', {str(self.apex.id): 'Gold', str(self.lol.id): 'Bronze'}, format='json')
        self.assertEqual(self.client.get('/api/my-ranks').data, {})

    def test_ranks_shown_in_room_for_its_game(self):
        session = GameSession.objects.create(created_by=self.host, game=self.apex, max_players=3, session_name="s", description="d", instructions="i")
        session.players.add(self.player)
        PlayerRank.objects.create(user=self.host, game=self.apex, rank='Gold')
        PlayerRank.objects.create(user=self.player, game=self.lol, rank='Iron')  # other game: not shown
        data = self.client.get(f'/api/session/{session.id}').data
        self.assertEqual(data['hostRank'], 'Gold')
        self.assertIsNone(data['players'][0]['rank'])

    def test_requires_login(self):
        self.client.credentials()
        self.assertEqual(self.client.get('/api/my-ranks').status_code, 401)


#Testing platform, region and voice settings on rooms
class RoomOptionsTest(TestCase):

    def setUp(self):
        self.client = APIClient()
        self.host = User.objects.create_user(username='host', password='1X<ISRUkw+tuK')
        self.game = Game.objects.create(game_short_name="Apex", game_name="Apex Legends", description="d", image_path="i")
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {RefreshToken.for_user(self.host).access_token}')

    def create(self, **extra):
        body = {'game_id': self.game.id, 'max_players': 3, 'session_name': 's', 'description': 'd', 'instructions': 'i', **extra}
        return self.client.post('/api/create-session', body, format='json')

    def test_defaults_to_any(self):
        self.assertEqual(self.create().status_code, 201)
        session = self.client.get('/api/get-sessions').data[0]
        self.assertEqual((session['platform'], session['region'], session['voice']), ('any', 'any', 'any'))

    def test_saves_options(self):
        self.assertEqual(self.create(platform='playstation', region='oce', voice='required').status_code, 201)
        session = self.client.get('/api/get-sessions').data[0]
        self.assertEqual((session['platform'], session['region'], session['voice']), ('playstation', 'oce', 'required'))

    def test_rejects_unknown_options(self):
        for extra in ({'platform': 'n64'}, {'region': 'mars'}, {'voice': 'loud'}):
            self.assertEqual(self.create(**extra).status_code, 400, extra)
        self.assertFalse(GameSession.objects.exists())


#Testing notifications for friend requests and room invites
class NotificationTest(TestCase):

    def setUp(self):
        self.client = APIClient()
        self.alice = User.objects.create_user(username='alice', password='1X<ISRUkw+tuK')
        self.bob = User.objects.create_user(username='bob', password='1X<ISRUkw+tuK')
        self.carol = User.objects.create_user(username='carol', password='1X<ISRUkw+tuK')
        game = Game.objects.create(game_short_name="Apex", game_name="Apex Legends", description="d", image_path="i")
        self.session = GameSession.objects.create(created_by=self.alice, game=game, max_players=3, session_name="Night grind", description="d", instructions="i")

    def login(self, user):
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {RefreshToken.for_user(user).access_token}')

    def notifications(self, user):
        self.login(user)
        return self.client.get('/api/notifications').data

    def test_friend_request_and_accept_notify(self):
        self.login(self.alice)
        self.client.post('/api/friend-requests', {'rec_username': 'bob'}, format='json')
        data = self.notifications(self.bob)
        self.assertEqual(data['unread'], 1)
        self.assertEqual(data['items'][0]['text'], 'alice sent you a friend request.')

        self.client.put('/api/friend-requests', {'friend_username': 'alice', 'action': 0}, format='json')
        self.assertEqual(self.notifications(self.alice)['items'][0]['text'], 'bob accepted your friend request.')

    def test_invite_friend_to_room(self):
        Friends.objects.create(user=self.alice, friend=self.bob)
        self.login(self.alice)
        resp = self.client.post(f'/api/session/{self.session.id}/invite', {'username': 'bob'}, format='json')
        self.assertEqual(resp.status_code, 200)
        item = self.notifications(self.bob)['items'][0]
        self.assertEqual(item['kind'], 'room_invite')
        self.assertEqual(item['link'], f'/room-page?id={self.session.id}')
        self.assertIn('Night grind', item['text'])

    def test_repeat_invite_is_not_duplicated_until_read(self):
        Friends.objects.create(user=self.alice, friend=self.bob)
        self.login(self.alice)
        for _ in range(3):
            self.client.post(f'/api/session/{self.session.id}/invite', {'username': 'bob'}, format='json')
        self.assertEqual(self.notifications(self.bob)['unread'], 1)

    def test_invite_rules(self):
        self.login(self.alice)
        # not a friend
        self.assertEqual(self.client.post(f'/api/session/{self.session.id}/invite', {'username': 'carol'}, format='json').status_code, 400)
        # unknown user / room
        self.assertEqual(self.client.post(f'/api/session/{self.session.id}/invite', {'username': 'ghost'}, format='json').status_code, 404)
        self.assertEqual(self.client.post('/api/session/9999/invite', {'username': 'bob'}, format='json').status_code, 404)
        # already in the room
        Friends.objects.create(user=self.alice, friend=self.bob)
        self.session.players.add(self.bob)
        self.assertEqual(self.client.post(f'/api/session/{self.session.id}/invite', {'username': 'bob'}, format='json').status_code, 400)
        # outsiders can't invite
        Friends.objects.create(user=self.carol, friend=self.bob)
        self.login(self.carol)
        self.assertEqual(self.client.post(f'/api/session/{self.session.id}/invite', {'username': 'bob'}, format='json').status_code, 403)

    def test_mark_read(self):
        for i in range(3):
            Notification.objects.create(user=self.bob, kind='friend_request', text=str(i))
        ids = [n['id'] for n in self.notifications(self.bob)['items']]
        resp = self.client.post('/api/notifications', {'ids': ids[:1]}, format='json')
        self.assertEqual(resp.data['unread'], 2)
        resp = self.client.post('/api/notifications', {'all': True}, format='json')
        self.assertEqual(resp.data['unread'], 0)
        self.assertEqual(self.client.post('/api/notifications', {'ids': 'x'}, format='json').status_code, 400)

    def test_only_own_notifications(self):
        Notification.objects.create(user=self.bob, kind='friend_request', text='for bob')
        self.assertEqual(self.notifications(self.alice)['items'], [])
        # marking someone else's notification does nothing
        bob_id = Notification.objects.get(user=self.bob).id
        self.client.post('/api/notifications', {'ids': [bob_id]}, format='json')
        self.assertFalse(Notification.objects.get(id=bob_id).read)


#Testing endorsements between squad members
class EndorsementTest(TestCase):

    def setUp(self):
        self.client = APIClient()
        self.host = User.objects.create_user(username='host', password='1X<ISRUkw+tuK')
        self.player = User.objects.create_user(username='player', password='1X<ISRUkw+tuK')
        self.outsider = User.objects.create_user(username='outsider', password='1X<ISRUkw+tuK')
        game = Game.objects.create(game_short_name="Apex", game_name="Apex Legends", description="d", image_path="i")
        self.session = GameSession.objects.create(created_by=self.host, game=game, max_players=3, session_name="s", description="d", instructions="i")
        self.session.players.add(self.player)

    def login(self, user):
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {RefreshToken.for_user(user).access_token}')

    def endorse(self, username, kind='teammate'):
        return self.client.post('/api/endorse', {'username': username, 'kind': kind, 'session_id': self.session.id}, format='json')

    def test_endorse_squad_member(self):
        self.login(self.player)
        self.assertEqual(self.endorse('host').status_code, 200)
        self.assertEqual(self.endorse('host', 'shotcaller').status_code, 200)
        self.assertEqual(self.endorse('host').status_code, 200)  # repeat is a no-op
        self.assertEqual(self.client.get('/api/endorsements/host').data, {'teammate': 1, 'shotcaller': 1})

    def test_counts_and_given_in_room(self):
        self.login(self.player)
        self.endorse('host')
        data = self.client.get(f'/api/session/{self.session.id}').data
        self.assertEqual(data['hostEndorsements'], 1)
        self.assertEqual(data['players'][0]['endorsements'], 0)
        self.assertEqual(data['myEndorsements'], {'host': ['teammate']})

    def test_rules(self):
        self.login(self.player)
        self.assertEqual(self.endorse('player').status_code, 400)          # yourself
        self.assertEqual(self.endorse('host', 'legend').status_code, 400)  # unknown kind
        self.assertEqual(self.endorse('outsider').status_code, 403)        # not in the room
        self.assertEqual(self.endorse('ghost').status_code, 404)
        self.login(self.outsider)
        self.assertEqual(self.endorse('host').status_code, 403)            # you're not in the room
        self.assertEqual(Endorsement.objects.count(), 0)

    def test_public_counts_for_unknown_user(self):
        self.assertEqual(self.client.get('/api/endorsements/ghost').status_code, 404)
        self.assertEqual(self.client.get('/api/endorsements/host').data, {})


#Testing blocking and reporting users
class BlockReportTest(TestCase):

    def setUp(self):
        self.client = APIClient()
        self.alice = User.objects.create_user(username='alice', password='1X<ISRUkw+tuK')
        self.bob = User.objects.create_user(username='bob', password='1X<ISRUkw+tuK')
        self.game = Game.objects.create(game_short_name="Apex", game_name="Apex Legends", description="d", image_path="i")

    def login(self, user):
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {RefreshToken.for_user(user).access_token}')

    def block(self, blocker, username):
        self.login(blocker)
        return self.client.post('/api/blocks', {'username': username}, format='json')

    def test_block_list_and_unblock(self):
        resp = self.block(self.alice, 'bob')
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.data, [{'username': 'bob'}])
        self.assertEqual(self.client.post('/api/blocks', {'username': 'alice'}, format='json').status_code, 400)
        self.assertEqual(self.client.post('/api/blocks', {'username': 'ghost'}, format='json').status_code, 404)
        self.assertEqual(self.client.post('/api/blocks/remove', {'username': 'bob'}, format='json').data, [])

    def test_block_ends_friendship_and_requests(self):
        Friends.objects.create(user=self.alice, friend=self.bob)
        FriendRequests.objects.create(sender=self.bob, receiver=self.alice)
        self.block(self.alice, 'bob')
        self.assertFalse(Friends.objects.exists())
        self.assertFalse(FriendRequests.objects.exists())
        # neither side can send a new request
        self.assertEqual(self.client.post('/api/friend-requests', {'rec_username': 'bob'}, format='json').status_code, 400)
        self.login(self.bob)
        self.assertEqual(self.client.post('/api/friend-requests', {'rec_username': 'alice'}, format='json').status_code, 400)

    def test_blocked_user_cannot_join_and_is_removed(self):
        session = GameSession.objects.create(created_by=self.alice, game=self.game, max_players=3, session_name="s", description="d", instructions="i")
        session.players.add(self.bob)
        self.block(self.alice, 'bob')
        self.assertFalse(session.players.filter(id=self.bob.id).exists())
        self.login(self.bob)
        resp = self.client.put('/api/create-session', {'action': 0, 'session_id': session.id}, format='json')
        self.assertEqual(resp.status_code, 400)
        self.assertEqual(resp.data['detail'], "You can't join this room.")

    def test_blocked_messages_hidden(self):
        session = GameSession.objects.create(created_by=self.alice, game=self.game, max_players=3, session_name="s", description="d", instructions="i")
        session.players.add(self.bob)
        ChatMessage.objects.create(session=session, sender=self.bob, text='rude')
        ChatMessage.objects.create(session=session, sender=self.alice, text='hi')
        Block.objects.create(blocker=self.alice, blocked=self.bob)  # (host blocking via the API would also remove bob)
        self.login(self.alice)
        self.assertEqual([m['text'] for m in self.client.get(f'/api/session-chat/{session.id}').data], ['hi'])

    def test_cannot_invite_blocked_user(self):
        session = GameSession.objects.create(created_by=self.alice, game=self.game, max_players=3, session_name="s", description="d", instructions="i")
        Friends.objects.create(user=self.alice, friend=self.bob)
        Block.objects.create(blocker=self.bob, blocked=self.alice)
        self.login(self.alice)
        self.assertEqual(self.client.post(f'/api/session/{session.id}/invite', {'username': 'bob'}, format='json').status_code, 400)

    def test_report_user(self):
        self.login(self.alice)
        resp = self.client.post('/api/report-user', {'username': 'bob', 'reason': 'cheating', 'details': 'wallhacks'}, format='json')
        self.assertEqual(resp.status_code, 200)
        report = UserReport.objects.get()
        self.assertEqual((report.reported, report.reason, report.details), (self.bob, 'cheating', 'wallhacks'))
        # repeat within a day doesn't pile up
        self.client.post('/api/report-user', {'username': 'bob', 'reason': 'spam'}, format='json')
        self.assertEqual(UserReport.objects.count(), 1)

    def test_report_validation(self):
        self.login(self.alice)
        self.assertEqual(self.client.post('/api/report-user', {'username': 'alice', 'reason': 'spam'}, format='json').status_code, 400)
        self.assertEqual(self.client.post('/api/report-user', {'username': 'bob', 'reason': 'boring'}, format='json').status_code, 400)
        self.assertEqual(self.client.post('/api/report-user', {'username': 'bob', 'reason': 'other', 'details': 'x' * 501}, format='json').status_code, 400)
        self.assertEqual(self.client.post('/api/report-user', {'username': 'ghost', 'reason': 'spam'}, format='json').status_code, 404)
        self.assertFalse(UserReport.objects.exists())


#Testing Discord sign-in, linking, gamer tag import and room announcements (Discord itself is mocked)
from unittest import mock
import os

DISCORD_ENV = {'DISCORD_CLIENT_ID': 'client', 'DISCORD_CLIENT_SECRET': 'secret', 'DISCORD_REDIRECT_URI': 'http://localhost:3000/discord-callback'}

@mock.patch.dict(os.environ, DISCORD_ENV)
class DiscordTest(TestCase):

    PROFILE = {'id': '123456', 'username': 'nightowl', 'global_name': 'Night Owl', 'email': 'owl@example.com'}
    CONNECTIONS = [
        {'type': 'playstation', 'name': 'OwlPSN', 'verified': True},
        {'type': 'steam', 'name': 'owl_steam', 'verified': True},
        {'type': 'xbox', 'name': 'NotVerified', 'verified': False},
        {'type': 'github', 'name': 'owl-dev', 'verified': True},
    ]

    def setUp(self):
        self.client = APIClient()
        patcher = mock.patch.multiple('fms.views.discord', exchange_code=mock.DEFAULT, fetch_user=mock.DEFAULT, fetch_connections=mock.DEFAULT)
        self.mocks = patcher.start()
        self.addCleanup(patcher.stop)
        self.mocks['exchange_code'].return_value = 'discord-token'
        self.mocks['fetch_user'].return_value = self.PROFILE
        self.mocks['fetch_connections'].return_value = self.CONNECTIONS

    def state(self, mode='login', user=None):
        if user:
            self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {RefreshToken.for_user(user).access_token}')
        url = self.client.get('/api/discord/authorize', {'mode': mode}).data['url']
        self.client.credentials()
        from urllib.parse import urlparse, parse_qs
        return parse_qs(urlparse(url).query)['state'][0]

    def callback(self, state, code='abc'):
        return self.client.post('/api/discord/callback', {'code': code, 'state': state}, format='json')

    def test_config(self):
        self.assertEqual(self.client.get('/api/discord/config').data, {'enabled': True, 'lfgWebhook': False})
        with mock.patch.dict(os.environ, {'DISCORD_CLIENT_ID': ''}):
            self.assertEqual(self.client.get('/api/discord/config').data['enabled'], False)
            self.assertEqual(self.client.get('/api/discord/authorize').status_code, 503)

    def test_authorize_url(self):
        url = self.client.get('/api/discord/authorize').data['url']
        self.assertTrue(url.startswith('https://discord.com/oauth2/authorize?'))
        self.assertIn('client_id=client', url)
        self.assertIn('scope=identify+email+connections', url)

    def test_first_login_creates_account_and_imports_tags(self):
        resp = self.callback(self.state())
        self.assertEqual(resp.status_code, 200)
        self.assertTrue(resp.data['created'])
        self.assertEqual(resp.data['username'], 'nightowl')
        self.assertEqual(sorted(resp.data['imported']), ['psn', 'steam'])
        user = User.objects.get(username='nightowl')
        self.assertFalse(user.has_usable_password())
        self.assertEqual(user.email, 'owl@example.com')
        self.assertEqual((user.gamer_tags.psn, user.gamer_tags.steam, user.gamer_tags.xbox), ('OwlPSN', 'owl_steam', ''))
        # the returned token works
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {resp.data['access']}")
        self.assertEqual(self.client.get('/api/user-check').data, {'username': 'nightowl'})

    def test_second_login_reuses_account(self):
        self.callback(self.state())
        resp = self.callback(self.state())
        self.assertFalse(resp.data['created'])
        self.assertEqual(User.objects.filter(username__startswith='nightowl').count(), 1)

    def test_username_clash_gets_a_suffix(self):
        User.objects.create_user(username='nightowl', password='1X<ISRUkw+tuK')
        self.assertEqual(self.callback(self.state()).data['username'], 'nightowl2')

    def test_link_existing_account_keeps_typed_tags(self):
        user = User.objects.create_user(username='player', password='1X<ISRUkw+tuK')
        GamerTags.objects.create(user=user, psn='TypedByMe')
        resp = self.callback(self.state('link', user))
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.data['username'], 'player')
        self.assertEqual(resp.data['imported'], ['steam'])
        user.refresh_from_db()
        self.assertEqual((user.discord.username, user.gamer_tags.psn), ('Night Owl', 'TypedByMe'))

    def test_link_requires_login_and_free_discord_account(self):
        self.assertEqual(self.client.get('/api/discord/authorize', {'mode': 'link'}).status_code, 401)
        self.callback(self.state())  # nightowl now owns this Discord account
        other = User.objects.create_user(username='other', password='1X<ISRUkw+tuK')
        self.assertEqual(self.callback(self.state('link', other)).status_code, 400)

    def test_rejects_tampered_or_missing_state(self):
        self.assertEqual(self.callback('forged-state').status_code, 400)
        self.assertEqual(self.callback(self.state() + 'x').status_code, 400)
        self.assertEqual(self.callback(self.state(), code='').status_code, 400)
        self.assertFalse(User.objects.exists())

    def test_discord_failure_returns_502(self):
        from fms.discord import DiscordError
        self.mocks['exchange_code'].side_effect = DiscordError('boom')
        self.assertEqual(self.callback(self.state()).status_code, 502)

    def test_unlink_needs_a_password(self):
        resp = self.callback(self.state())
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {resp.data['access']}")
        self.assertEqual(self.client.get('/api/discord/account').data, {'linked': True, 'username': 'Night Owl'})
        self.assertEqual(self.client.delete('/api/discord/account').status_code, 400)
        # a Discord-only account can set a password without an old one, then unlink
        self.assertEqual(self.client.post('/api/update-password', {'new_password': 'N3w-Strong-Pass!'}, format='json').status_code, 200)
        self.assertEqual(self.client.delete('/api/discord/account').data, {'linked': False, 'username': None})

    def test_room_announced_to_lfg_channel(self):
        host = User.objects.create_user(username='host', password='1X<ISRUkw+tuK')
        game = Game.objects.create(game_short_name="Apex", game_name="Apex Legends", description="d", image_path="i", ranks=['Gold', 'Diamond'])
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {RefreshToken.for_user(host).access_token}')
        body = {'game_id': game.id, 'max_players': 3, 'session_name': 'Ranked grind', 'description': 'Push to Diamond', 'instructions': 'i',
                'min_rank': 'Gold', 'platform': 'pc'}
        with mock.patch('fms.views.discord.post_room') as post_room:
            # not configured: nothing is posted
            self.client.post('/api/create-session', {**body, 'post_to_discord': True}, format='json')
            post_room.assert_not_called()
            GameSession.objects.all().delete()
            with mock.patch.dict(os.environ, {'DISCORD_LFG_WEBHOOK_URL': 'https://discord.example/webhook', 'SITE_URL': 'https://fms.example'}):
                # configured but not ticked
                self.client.post('/api/create-session', body, format='json')
                post_room.assert_not_called()
                GameSession.objects.all().delete()
                resp = self.client.post('/api/create-session', {**body, 'post_to_discord': True}, format='json')
        self.assertEqual(resp.status_code, 201)
        embed = post_room.call_args[0][0]
        self.assertEqual(embed['title'], 'Ranked grind')
        self.assertEqual(embed['url'], f"https://fms.example/room-page?id={resp.data['id']}")
        self.assertEqual(embed['fields'][0]['value'], 'Apex Legends · Gold – Any · PC')

    def test_webhook_failure_does_not_block_room(self):
        from fms.discord import DiscordError
        host = User.objects.create_user(username='host', password='1X<ISRUkw+tuK')
        game = Game.objects.create(game_short_name="Apex", game_name="Apex Legends", description="d", image_path="i")
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {RefreshToken.for_user(host).access_token}')
        with mock.patch.dict(os.environ, {'DISCORD_LFG_WEBHOOK_URL': 'https://discord.example/webhook'}), \
             mock.patch('fms.views.discord.post_room', side_effect=DiscordError('down')):
            resp = self.client.post('/api/create-session', {'game_id': game.id, 'max_players': 3, 'session_name': 's', 'description': 'd',
                                                            'instructions': 'i', 'post_to_discord': True}, format='json')
        self.assertEqual(resp.status_code, 201)


class DiscordHelpersTest(TestCase):

    def test_gamer_tags_from_connections(self):
        from fms.discord import gamer_tags_from_connections
        tags = gamer_tags_from_connections([
            {'type': 'riotgames', 'name': 'Owl#OCE', 'verified': True},
            {'type': 'xbox', 'name': 'x' * 80, 'verified': True},
            {'type': 'playstation', 'name': 'Hidden', 'verified': False},
        ])
        self.assertEqual(tags, {'riot': 'Owl#OCE', 'xbox': 'x' * 50})


#Testing live chat over WebSockets
from asgiref.sync import async_to_sync, sync_to_async
from channels.testing import WebsocketCommunicator
from django.test import TransactionTestCase
from src.asgi import application


class LiveChatTest(TransactionTestCase):

    def setUp(self):
        self.host = User.objects.create_user(username='host', password='1X<ISRUkw+tuK')
        self.player = User.objects.create_user(username='player', password='1X<ISRUkw+tuK')
        self.outsider = User.objects.create_user(username='outsider', password='1X<ISRUkw+tuK')
        game = Game.objects.create(game_short_name="Apex", game_name="Apex Legends", description="d", image_path="i")
        self.session = GameSession.objects.create(created_by=self.host, game=game, max_players=3, session_name="s", description="d", instructions="i")
        self.session.players.add(self.player)
        # creating tokens writes to the database, so do it here rather than inside the async scenarios
        self.tokens = {user.id: str(RefreshToken.for_user(user).access_token) for user in (self.host, self.player, self.outsider)}

    def token(self, user):
        return self.tokens[user.id]

    def api(self, user):
        client = APIClient()
        client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token(user)}')
        return client

    async def connect(self, user=None, token=None):
        communicator = WebsocketCommunicator(application, f'/ws/session-chat/{self.session.id}/')
        connected, _ = await communicator.connect()
        self.assertTrue(connected)
        await communicator.send_json_to({'type': 'auth', 'token': token if token is not None else self.token(user)})
        return communicator

    async def post(self, user, text):
        return await sync_to_async(lambda: self.api(user).post(f'/api/session-chat/{self.session.id}', {'text': text}, format='json'))()

    def test_member_receives_messages_live(self):
        async def scenario():
            ws = await self.connect(self.player)
            self.assertEqual(await ws.receive_json_from(), {'type': 'ready'})
            resp = await self.post(self.host, 'hello squad')
            self.assertEqual(resp.status_code, 201)
            event = await ws.receive_json_from(timeout=2)
            self.assertEqual(event['type'], 'message')
            self.assertEqual((event['message']['text'], event['message']['username']), ('hello squad', 'host'))
            await ws.disconnect()
        async_to_sync(scenario)()

    def test_outsider_and_bad_token_are_rejected(self):
        async def scenario():
            ws = await self.connect(self.outsider)
            self.assertEqual((await ws.receive_output(timeout=2))['code'], 4403)
            ws = await self.connect(token='not-a-token')
            self.assertEqual((await ws.receive_output(timeout=2))['code'], 4401)
        async_to_sync(scenario)()

    def test_blocked_sender_is_filtered(self):
        Block.objects.create(blocker=self.player, blocked=self.host)
        async def scenario():
            ws = await self.connect(self.player)
            await ws.receive_json_from()
            await self.post(self.host, 'you will not see this')
            self.assertTrue(await ws.receive_nothing(timeout=0.5))
            await ws.disconnect()
        async_to_sync(scenario)()

    def test_kicked_player_is_disconnected(self):
        async def scenario():
            ws = await self.connect(self.player)
            await ws.receive_json_from()
            await sync_to_async(lambda: self.api(self.host).put('/api/create-session', {'action': 2, 'session_id': self.session.id, 'player_id': self.player.id}, format='json'))()
            self.assertEqual((await ws.receive_output(timeout=2))['code'], 4403)
        async_to_sync(scenario)()

    def test_closing_room_disconnects_everyone(self):
        async def scenario():
            ws = await self.connect(self.player)
            await ws.receive_json_from()
            await sync_to_async(lambda: self.api(self.host).put('/api/create-session', {'action': 1, 'session_id': self.session.id}, format='json'))()
            self.assertEqual((await ws.receive_output(timeout=2))['code'], 4403)
        async_to_sync(scenario)()
