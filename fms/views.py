from django.shortcuts 			import render
from django.contrib.auth 		import authenticate, login

from rest_framework.views 		import APIView
from rest_framework.response 	import Response 
from rest_framework 			import status, permissions
from rest_framework_simplejwt.views import TokenObtainPairView

from .serializers 				import *
from .models 					import *


def index(request):
	return render(request, "fms/index.html")

class LoginView(TokenObtainPairView):
	permission_classes = (permissions.AllowAny,)
	serializer_class = MyTokenObtainPairSerializer

class CurrentUserCheck(APIView):
	# Get Current User 
	def get(self, request, format=None):
		return Response({"username": request.user.username}, status=status.HTTP_200_OK)

class RegisterUserView(APIView):
	permission_classes = (permissions.AllowAny,)
	serializer_class = UserSerializer
	
	# Register User 
	def post(self, request, format=None):
		serializer = self.serializer_class(data=request.data)

		if serializer.is_valid():
			username = serializer.data.get('username')
			email 	 = serializer.data.get('email')
			password = serializer.data.get('password')
			user = User.objects.create_user(username=username, email=email, password=password)
			return Response(serializer.data, status=status.HTTP_201_CREATED)
		return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class GetSessionsView(APIView):
	permission_classes = (permissions.AllowAny,)
	serializer_class = SessionSerializer
	
	def get(self, request, format=None):
		response_data = self.serializer_class(
			GameSession.objects.all(),
			many=True
		).data

		return Response(response_data, status=status.HTTP_200_OK)

class SessionView(APIView):
	serializer_class = SessionSerializer
		
	def post(self, request, format=None):
		current_user = request.user

		if current_user:
			session_exists = GameSession.objects.filter(created_by=current_user).exists()

			# if user already has a session
			if session_exists:
				return Response({}, status=status.HTTP_400_BAD_REQUEST)

			# if user is part of another session 
			all_sessions = GameSession.objects.all()
			for game_session in all_sessions:
				if current_user in game_session.players.all():
					return Response({}, status=status.HTTP_400_BAD_REQUEST)

			game = Game.objects.get(id=request.data['game_id'])
			new_session = GameSession(
				created_by   = current_user,
				game         = game,
				max_players  = request.data['max_players'],
				session_name = request.data['session_name'],
				description  = request.data['description'],
				instructions = request.data['instructions'],
			)
			new_session.save()
			return Response({'id': new_session.id}, status=status.HTTP_201_CREATED)
		else:
			return Response({}, status=status.HTTP_401_UNAUTHORIZED)

	def put(self, request, format=None):
		current_user = request.user

		if current_user:
			action = request.data['action']
			current_session = GameSession.objects.get(id=request.data['session_id'])

			if action == 0:
				# Join Session
				session_exists = GameSession.objects.filter(created_by=current_user).exists()
				
				# if user already has a session
				if session_exists:
					return Response({}, status=status.HTTP_400_BAD_REQUEST)
				
				if current_session.is_full():
					return Response({}, status=status.HTTP_400_BAD_REQUEST)

				# if user is part of another session 
				all_sessions = GameSession.objects.all()
				for game_session in all_sessions:
					if current_user in game_session.players.all():
						return Response({}, status=status.HTTP_400_BAD_REQUEST)

				current_session.players.add(current_user)
				current_session.save()
				return Response({}, status=status.HTTP_200_OK)

			elif action == 1:
				# Leave Session
				if current_session.created_by.username == current_user.username:
					# Host Leaving
					print('SESSION DELETED')
					current_session.delete()
					return Response({}, status=status.HTTP_200_OK)

				current_session.players.remove(current_user)
				current_session.save()
				return Response({}, status=status.HTTP_200_OK)
			
			elif action == 2:
				# Kick From Session
				user_to_kick = User.objects.get(id=request.data['player_id'])
				print(user_to_kick)
				current_session.players.remove(user_to_kick)
				current_session.save()
				return Response({}, status=status.HTTP_200_OK)

		else:
			# You are not logged in 
			return Response({}, status=status.HTTP_401_UNAUTHORIZED)

class GameInfoView(APIView):
	permission_classes = (permissions.AllowAny,)
	serializer_class = GameSerializer
	
	def get(self, request, format=None):
		game_data = Game.objects.all()
		if len(game_data) > 0:
			serializer = self.serializer_class(game_data,many=True)
			return Response(serializer.data,status=status.HTTP_200_OK)	
		return Response({}, status=status.HTTP_400_BAD_REQUEST)

class GetForumsView(APIView):
	permission_classes = (permissions.AllowAny,)
	serializer_class = ForumSerializer
	
	def get(self, request, format=None):
		response_data = self.serializer_class(
			Forum.objects.all(),
			many=True
		).data

		return Response(response_data,status=status.HTTP_200_OK)

class CreateForumView(APIView):
	serializer_class = ForumSerializer
	
	def post(self, request, format=None):
		current_user = request.user
		current_forum= Forum.objects.get(tag=request.data['tag'])

		if current_user:
			new_post = ForumPost(
				posted_by   = current_user,
				text  		= request.data['text'],
			)
			new_post.save()
			current_forum.posts.add(new_post)
			current_forum.save()
			return Response({'tag': current_forum.tag}, status=status.HTTP_201_CREATED)
		else:
			return Response({}, status=status.HTTP_401_UNAUTHORIZED)

class PostView(APIView):
	serializer_class = PostSerializer
	def put(self, request, format=None):
		current_user = request.user

		if current_user:
			current_post = ForumPost.objects.get(id=request.data['post_id'])
			current_post.reported = True
			current_post.save()
			return Response({}, status=status.HTTP_200_OK)

		else:
			# Not logged in 
			return Response({}, status=status.HTTP_401_UNAUTHORIZED)

class FriendRequestsView(APIView):
	
	# Get Friend Requests 
	def get(self, request, format=None):
		current_user = request.user

		if current_user:
			friend_reqs   = FriendRequests.objects.all()
			response_list = []

			for req in friend_reqs:
				if req.receiver.username == current_user.username:
					data_to_append = {'username': req.sender.username}
					response_list.append(data_to_append)

			print(response_list)
			return Response(response_list, status=status.HTTP_200_OK)
		
		else:
			# Not logged in 
			return Response({}, status=status.HTTP_401_UNAUTHORIZED)

	# Send Friend Request 
	def post(self, request, format=None):
		current_user = request.user

		if current_user:
			receiver_user  = User.objects.get(username=request.data['rec_username'])
			
			req_check = FriendRequests.objects.filter(sender=current_user, receiver=receiver_user)
			if req_check:
				print('Request already sent.')
				return Response({}, status=status.HTTP_400_BAD_REQUEST)

			friend_check_1 = Friends.objects.filter(user=current_user, friend=receiver_user)
			friend_check_2 = Friends.objects.filter(user=receiver_user, friend=current_user)

			if friend_check_1 or friend_check_2:
				print('Already friends.')
				return Response({}, status=status.HTTP_400_BAD_REQUEST)
			
			# Request sent 
			new_friend_req = FriendRequests(sender=current_user, receiver=receiver_user)
			new_friend_req.save()
			return Response({}, status=status.HTTP_200_OK)

		else:
			# Not logged in 
			return Response({}, status=status.HTTP_401_UNAUTHORIZED)

	def put(self, request, format=None):
		current_user = request.user

		if current_user:
			friend_user    = User.objects.get(username=request.data['friend_username'])

			friend_check_1 = Friends.objects.filter(user=current_user, friend=friend_user)
			friend_check_2 = Friends.objects.filter(user=friend_user, friend=current_user)

			if friend_check_1 or friend_check_2:
				print('Already friends.')
				return Response({}, status=status.HTTP_400_BAD_REQUEST)

			action = request.data['action']

			friend_req = FriendRequests.objects.get(sender=friend_user, receiver=current_user)
			friend_req.delete()

			if action == 0:
				# ACCEPT REQUEST: ADD FRIEND 
				new_friends = Friends(user=current_user, friend=friend_user)
				new_friends.save()
			
			if action == 1:
				# DECLINE REQUEST: DO NOTHING 
				pass 

			return Response({}, status=status.HTTP_200_OK)
		
		else:
			# Not logged in 
			return Response({}, status=status.HTTP_401_UNAUTHORIZED)

class FriendsView(APIView):

	# Get Friends
	def get(self, request, format=None):
		current_user = request.user

		if current_user:
			friends  = Friends.objects.all()
			response_list = []

			for f in friends:
				if f.user.username == current_user.username:
					data_to_append = {'username': f.friend.username}
					response_list.append(data_to_append)
				elif f.friend.username == current_user.username:
					data_to_append = {'username': f.user.username}
					response_list.append(data_to_append)

			print(response_list)
			return Response(response_list, status=status.HTTP_200_OK)
		
		else:
			# Not logged in 
			return Response({}, status=status.HTTP_401_UNAUTHORIZED)

	# Delete Friend
	def put(self, request, format=None):
		current_user = request.user

		if current_user:
			friend_user  = User.objects.get(username=request.data['friend_username'])
			
			friend_check_1 = Friends.objects.filter(user=current_user, friend=friend_user)
			friend_check_2 = Friends.objects.filter(user=friend_user, friend=current_user)

			if friend_check_1:
				friendship = Friends.objects.get(user=current_user, friend=friend_user)
				friendship.delete()

			if friend_check_2:
				friendship = Friends.objects.get(user=friend_user, friend=current_user)
				friendship.delete()
			
			return Response({}, status=status.HTTP_200_OK)

		else:
			# Not logged in 
			return Response({}, status=status.HTTP_401_UNAUTHORIZED)

class ProfileBioView(APIView):
	
	# Get Bio 
	def get(self, request, format=None):
		current_user = request.user

		if current_user:
			bio_check    = ProfileBio.objects.filter(user=current_user)
			profile_bio  = current_user.username + "'s bio"

			if bio_check:
				new_profile_bio =  ProfileBio.objects.get(user=current_user)
			else:
				new_profile_bio = ProfileBio(user=current_user, bio=profile_bio)
				new_profile_bio.save()
			
			response_bio = {'bio': new_profile_bio.bio}
			return Response(response_bio, status=status.HTTP_200_OK)

		else:
			# Not logged in 
			return Response({}, status=status.HTTP_401_UNAUTHORIZED)

	# Update Bio
	def post(self, request, format=None):
		current_user = request.user

		if current_user:
			bio_check    = ProfileBio.objects.filter(user=current_user)

			if bio_check:
				profile_bio 	= ProfileBio.objects.get(user=current_user)
				print('REC: ' + request.data['bio'])
				profile_bio.bio = request.data['bio'] 
				profile_bio.save()
			
			return Response({}, status=status.HTTP_200_OK)

		else:
			# Not logged in 
			return Response({}, status=status.HTTP_401_UNAUTHORIZED)

class ProfileImageView(APIView):
	
	# Get Image 
	def get(self, request, format=None):
		current_user = request.user

		if current_user:
			bio_check    = ProfileBio.objects.filter(user=current_user)
			profile_bio  = current_user.username + "'s bio"

			if bio_check:
				new_profile_bio =  ProfileBio.objects.get(user=current_user)
			else:
				new_profile_bio = ProfileBio(user=current_user, bio=profile_bio)
				new_profile_bio.save()
			
			response_bio = {'image_url': new_profile_bio.img_url}
			return Response(response_bio, status=status.HTTP_200_OK)

		else:
			# Not logged in 
			return Response({}, status=status.HTTP_401_UNAUTHORIZED)

	# Update Image URL
	def post(self, request, format=None):
		current_user = request.user

		if current_user:
			bio_check    = ProfileBio.objects.filter(user=current_user)

			if bio_check:
				profile_bio 	= ProfileBio.objects.get(user=current_user)
				print('REC: ' + request.data['image_url'])
				profile_bio.img_url = request.data['image_url']
				profile_bio.save()
			
			return Response({}, status=status.HTTP_200_OK)

		else:
			# Not logged in 
			return Response({}, status=status.HTTP_401_UNAUTHORIZED)

class UpdatePasswordView(APIView):

	def post(self, request, format=None):
		current_user = request.user

		if current_user:
			user_to_update = User.objects.get(username=current_user.username) 
			new_password = request.data['new_password']
			user_to_update.set_password(new_password)
			user_to_update.save()
			print(user_to_update.password)
			return Response({}, status=status.HTTP_200_OK)

		else:
			# Not logged in 
			return Response({}, status=status.HTTP_401_UNAUTHORIZED)
