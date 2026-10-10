from django.shortcuts 			import render
from django.contrib.auth 		import authenticate, login, password_validation
from django.core.exceptions 	import ValidationError
from django.core.validators 	import URLValidator
from django.db.models 			import Count, Q
from django.shortcuts 			import get_object_or_404
from django.utils 				import timezone
from datetime 					import timedelta

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
			serializer.save()
			return Response(serializer.data, status=status.HTTP_201_CREATED)
		return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class GetSessionsView(APIView):
	permission_classes = (permissions.AllowAny,)
	serializer_class = SessionSerializer
	
	def get(self, request, format=None):
		GameSession.close_expired()
		sessions = GameSession.objects.select_related(
			'game', 'created_by__gamer_tags'
		).prefetch_related('players__gamer_tags')
		response_data = self.serializer_class(sessions, many=True).data

		return Response(response_data, status=status.HTTP_200_OK)

class SessionDetailView(APIView):
	permission_classes = (permissions.AllowAny,)
	serializer_class = SessionSerializer

	# Get one session; squad members also get the join instructions and gamer tags
	def get(self, request, session_id, format=None):
		GameSession.close_expired()
		session = get_object_or_404(
			GameSession.objects.select_related('game', 'created_by__gamer_tags').prefetch_related('players__gamer_tags'),
			id=session_id
		)
		private = request.user.is_authenticated and session.has_member(request.user)
		response_data = self.serializer_class(session, context={'private': private, 'user': request.user}).data
		return Response(response_data, status=status.HTTP_200_OK)

def bad_request(message):
	return Response({'detail': message}, status=status.HTTP_400_BAD_REQUEST)

def int_or_none(value):
	try:
		return int(value)
	except (TypeError, ValueError):
		return None

def in_any_session(user):
	# Hosting a room or playing in one
	return GameSession.objects.filter(created_by=user).exists() or GameSession.objects.filter(players=user).exists()

class SessionView(APIView):
	JOIN, LEAVE, KICK, EXTEND = 0, 1, 2, 3

	def initial(self, request, *args, **kwargs):
		super().initial(request, *args, **kwargs)
		GameSession.close_expired()

	# Create Session
	def post(self, request, format=None):
		if in_any_session(request.user):
			return bad_request('You are already in a room. Leave it before creating a new one.')

		serializer = CreateSessionSerializer(data=request.data)
		if not serializer.is_valid():
			return bad_request(first_error(serializer.errors))

		new_session = GameSession.objects.create(
			created_by   = request.user,
			game         = serializer.validated_data['game'],
			max_players  = serializer.validated_data['max_players'],
			session_name = serializer.validated_data['session_name'],
			description  = serializer.validated_data['description'],
			instructions = serializer.validated_data['instructions'],
			min_rank     = serializer.validated_data['min_rank'],
			max_rank     = serializer.validated_data['max_rank'],
			expires_at   = timezone.now() + timedelta(hours=serializer.validated_data['duration_hours']),
			platform     = serializer.validated_data['platform'],
			region       = serializer.validated_data['region'],
			voice        = serializer.validated_data['voice'],
		)
		return Response({'id': new_session.id}, status=status.HTTP_201_CREATED)

	# Join, leave or kick, depending on 'action'
	def put(self, request, format=None):
		current_user = request.user
		action = int_or_none(request.data.get('action'))
		session_id = int_or_none(request.data.get('session_id'))
		if session_id is None:
			return bad_request('session_id is required.')
		current_session = get_object_or_404(GameSession, id=session_id)

		if action == self.JOIN:
			if in_any_session(current_user):
				return bad_request('You are already in a room.')
			if current_session.is_full():
				return bad_request('This room is full.')
			member_ids = [current_session.created_by_id] + list(current_session.players.values_list('id', flat=True))
			if Block.objects.filter(blocker_id__in=member_ids, blocked=current_user).exists():
				return bad_request("You can't join this room.")
			current_session.players.add(current_user)
			return Response({}, status=status.HTTP_200_OK)

		if action == self.LEAVE:
			if current_session.created_by == current_user:
				# the host leaving closes the room
				current_session.delete()
				return Response({}, status=status.HTTP_200_OK)
			if not current_session.players.filter(id=current_user.id).exists():
				return bad_request('You are not in this room.')
			current_session.players.remove(current_user)
			return Response({}, status=status.HTTP_200_OK)

		if action == self.KICK:
			if current_session.created_by != current_user:
				return Response({}, status=status.HTTP_403_FORBIDDEN)
			player = current_session.players.filter(id=int_or_none(request.data.get('player_id'))).first()
			if player is None:
				return bad_request('That player is not in this room.')
			current_session.players.remove(player)
			return Response({}, status=status.HTTP_200_OK)

		if action == self.EXTEND:
			if current_session.created_by != current_user:
				return Response({}, status=status.HTTP_403_FORBIDDEN)
			current_session.extend(hours=1)
			return Response({'expiresAt': current_session.expires_at}, status=status.HTTP_200_OK)

		return bad_request('action must be 0 (join), 1 (leave), 2 (kick) or 3 (extend).')

class GameInfoView(APIView):
	permission_classes = (permissions.AllowAny,)
	serializer_class = GameSerializer
	
	def get(self, request, format=None):
		serializer = self.serializer_class(Game.objects.all(), many=True)
		return Response(serializer.data, status=status.HTTP_200_OK)

class GetForumsView(APIView):
	permission_classes = (permissions.AllowAny,)
	serializer_class = ForumSerializer
	
	def get(self, request, format=None):
		response_data = self.serializer_class(
			Forum.objects.prefetch_related('posts__posted_by'),
			many=True
		).data

		return Response(response_data,status=status.HTTP_200_OK)

class CreateForumView(APIView):
	serializer_class = ForumSerializer
	
	# Create a post in a forum
	def post(self, request, format=None):
		current_forum = get_object_or_404(Forum, tag=request.data.get('tag', ''))
		text = str(request.data.get('text', '')).strip()
		if not text:
			return bad_request('Post cannot be empty.')
		if len(text) > ForumPost._meta.get_field('text').max_length:
			return bad_request('Post must be 300 characters or fewer.')

		new_post = ForumPost.objects.create(posted_by=request.user, text=text)
		current_forum.posts.add(new_post)
		return Response({'tag': current_forum.tag}, status=status.HTTP_201_CREATED)

class PostView(APIView):
	serializer_class = PostSerializer

	# Report a post for admin review
	def put(self, request, format=None):
		current_post = get_object_or_404(ForumPost, id=int_or_none(request.data.get('post_id')))
		current_post.reported = True
		current_post.save()
		return Response({}, status=status.HTTP_200_OK)

class FriendRequestsView(APIView):
	ACCEPT, DECLINE = 0, 1

	# Get Friend Requests 
	def get(self, request, format=None):
		requests = FriendRequests.objects.filter(receiver=request.user).select_related('sender')
		return Response([{'username': req.sender.username} for req in requests], status=status.HTTP_200_OK)

	# Send Friend Request 
	def post(self, request, format=None):
		current_user  = request.user
		receiver_user = get_object_or_404(User, username=request.data.get('rec_username', ''))

		if receiver_user == current_user:
			return bad_request("You can't send a friend request to yourself.")
		if Block.between(current_user, receiver_user):
			return bad_request("You can't send a friend request to this user.")
		if FriendRequests.objects.filter(sender=current_user, receiver=receiver_user).exists():
			return bad_request('Request already sent.')
		if are_friends(current_user, receiver_user):
			return bad_request('Already friends.')

		FriendRequests.objects.create(sender=current_user, receiver=receiver_user)
		Notification.objects.create(user=receiver_user, actor=current_user, kind=Notification.FRIEND_REQUEST,
		                            text=current_user.username + ' sent you a friend request.', link='/profile-page')
		return Response({}, status=status.HTTP_200_OK)

	# Accept or decline a friend request
	def put(self, request, format=None):
		current_user = request.user
		friend_user  = get_object_or_404(User, username=request.data.get('friend_username', ''))
		action       = int_or_none(request.data.get('action'))

		if action not in (self.ACCEPT, self.DECLINE):
			return bad_request('action must be 0 (accept) or 1 (decline).')
		if are_friends(current_user, friend_user):
			return bad_request('Already friends.')

		friend_req = get_object_or_404(FriendRequests, sender=friend_user, receiver=current_user)
		friend_req.delete()

		if action == self.ACCEPT:
			Friends.objects.create(user=current_user, friend=friend_user)
			Notification.objects.create(user=friend_user, actor=current_user, kind=Notification.FRIEND_ACCEPTED,
			                            text=current_user.username + ' accepted your friend request.', link='/profile-page')

		return Response({}, status=status.HTTP_200_OK)

def are_friends(user, other):
	return Friends.objects.filter(Q(user=user, friend=other) | Q(user=other, friend=user)).exists()

class FriendsView(APIView):

	# Get Friends
	def get(self, request, format=None):
		current_user = request.user
		friendships  = Friends.objects.filter(Q(user=current_user) | Q(friend=current_user)).select_related('user', 'friend')
		response_list = [
			{'username': (f.friend if f.user == current_user else f.user).username}
			for f in friendships
		]
		return Response(response_list, status=status.HTTP_200_OK)

	# Delete Friend
	def put(self, request, format=None):
		current_user = request.user
		friend_user  = get_object_or_404(User, username=request.data.get('friend_username', ''))
		Friends.objects.filter(
			Q(user=current_user, friend=friend_user) | Q(user=friend_user, friend=current_user)
		).delete()
		return Response({}, status=status.HTTP_200_OK)

class MyRanksView(APIView):

	# Get the current user's saved ranks as {game_id: rank}
	def get(self, request, format=None):
		ranks = PlayerRank.objects.filter(user=request.user)
		return Response({str(r.game_id): r.rank for r in ranks}, status=status.HTTP_200_OK)

	# Save ranks: {game_id: rank}; an empty rank clears it
	def put(self, request, format=None):
		if not isinstance(request.data, dict):
			return bad_request('Send an object of game id to rank.')

		changes = []
		for game_id, rank in request.data.items():
			game = Game.objects.filter(id=int_or_none(game_id)).first()
			if game is None:
				return bad_request('Unknown game: ' + str(game_id))
			rank = str(rank or '').strip()
			if rank and rank not in game.ranks:
				return bad_request('"' + rank + '" is not a ' + game.game_name + ' rank.')
			changes.append((game, rank))

		for game, rank in changes:
			if rank:
				PlayerRank.objects.update_or_create(user=request.user, game=game, defaults={'rank': rank})
			else:
				PlayerRank.objects.filter(user=request.user, game=game).delete()
		return self.get(request)

def get_profile(user):
	profile = ProfileBio.objects.filter(user=user).first()
	if profile is None:
		profile = ProfileBio.objects.create(user=user, bio=user.username + "'s bio")
	return profile

class ProfileBioView(APIView):
	
	# Get Bio 
	def get(self, request, format=None):
		return Response({'bio': get_profile(request.user).bio}, status=status.HTTP_200_OK)

	# Update Bio
	def post(self, request, format=None):
		bio = request.data.get('bio')
		if not isinstance(bio, str):
			return bad_request('bio is required.')
		if len(bio) > ProfileBio._meta.get_field('bio').max_length:
			return bad_request('Bio must be 300 characters or fewer.')

		profile = get_profile(request.user)
		profile.bio = bio
		profile.save()
		return Response({}, status=status.HTTP_200_OK)

class ProfileImageView(APIView):
	
	# Get Image 
	def get(self, request, format=None):
		return Response({'image_url': get_profile(request.user).img_url}, status=status.HTTP_200_OK)

	# Update Image URL
	def post(self, request, format=None):
		image_url = str(request.data.get('image_url', '')).strip()
		try:
			URLValidator(schemes=['http', 'https'])(image_url)
		except ValidationError:
			return bad_request('Enter a valid image URL starting with http:// or https://.')
		if len(image_url) > ProfileBio._meta.get_field('img_url').max_length:
			return bad_request('Image URL is too long.')

		profile = get_profile(request.user)
		profile.img_url = image_url
		profile.save()
		return Response({}, status=status.HTTP_200_OK)

class UpdatePasswordView(APIView):

	def post(self, request, format=None):
		current_user = request.user

		if current_user:
			if not current_user.check_password(request.data.get('old_password', '')):
				return Response({'old_password': ['Current password is incorrect.']}, status=status.HTTP_400_BAD_REQUEST)

			new_password = request.data.get('new_password', '')
			try:
				password_validation.validate_password(new_password, user=current_user)
			except ValidationError as e:
				return Response({'new_password': e.messages}, status=status.HTTP_400_BAD_REQUEST)

			current_user.set_password(new_password)
			current_user.save()
			return Response({}, status=status.HTTP_200_OK)

		else:
			# Not logged in 
			return Response({}, status=status.HTTP_401_UNAUTHORIZED)

class GamerTagsView(APIView):

	# Get the current user's gamer tags
	def get(self, request, format=None):
		tags = GamerTags.objects.filter(user=request.user).first() or GamerTags(user=request.user)
		return Response(GamerTagsSerializer(tags).data, status=status.HTTP_200_OK)

	# Update the current user's gamer tags
	def put(self, request, format=None):
		tags, _ = GamerTags.objects.get_or_create(user=request.user)
		serializer = GamerTagsSerializer(tags, data=request.data, partial=True)

		if serializer.is_valid():
			serializer.save()
			return Response(serializer.data, status=status.HTTP_200_OK)
		return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

CHAT_HISTORY_LIMIT = 50                    # messages returned on first load
CHAT_RATE_LIMIT    = 5                     # messages allowed per user...
CHAT_RATE_WINDOW   = timedelta(seconds=10) # ...within this window

class SessionChatView(APIView):
	serializer_class = ChatMessageSerializer

	def get_member_session(self, request, session_id):
		GameSession.close_expired()
		session = get_object_or_404(GameSession, id=session_id)
		if not session.has_member(request.user):
			return None
		return session

	# Get messages: the latest ones, or only those newer than ?after=<message id>
	def get(self, request, session_id, format=None):
		session = self.get_member_session(request, session_id)
		if session is None:
			return Response({'detail': 'Only squad members can read this chat.'}, status=status.HTTP_403_FORBIDDEN)

		blocked_ids = Block.objects.filter(blocker=request.user).values_list('blocked_id', flat=True)
		messages = session.messages.select_related('sender').exclude(sender_id__in=blocked_ids)
		after = request.query_params.get('after')
		if after is not None:
			if not after.isdigit():
				return Response({'after': ['Must be a message id.']}, status=status.HTTP_400_BAD_REQUEST)
			messages = messages.filter(id__gt=int(after))[:CHAT_HISTORY_LIMIT]
		else:
			messages = reversed(messages.order_by('-id')[:CHAT_HISTORY_LIMIT])

		return Response(self.serializer_class(messages, many=True).data, status=status.HTTP_200_OK)

	# Send a message
	def post(self, request, session_id, format=None):
		session = self.get_member_session(request, session_id)
		if session is None:
			return Response({'detail': 'Only squad members can post in this chat.'}, status=status.HTTP_403_FORBIDDEN)

		recent = session.messages.filter(
			sender=request.user,
			created_at__gte=timezone.now() - CHAT_RATE_WINDOW
		).count()
		if recent >= CHAT_RATE_LIMIT:
			return Response({'detail': 'You are sending messages too quickly.'}, status=status.HTTP_429_TOO_MANY_REQUESTS)

		serializer = self.serializer_class(data=request.data)
		if serializer.is_valid():
			serializer.save(session=session, sender=request.user)
			return Response(serializer.data, status=status.HTTP_201_CREATED)
		return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ReportChatMessageView(APIView):

	# Flag a message for admin review
	def post(self, request, session_id, format=None):
		session = get_object_or_404(GameSession, id=session_id)
		if not session.has_member(request.user):
			return Response({}, status=status.HTTP_403_FORBIDDEN)

		message_id = str(request.data.get('message_id', ''))
		if not message_id.isdigit():
			return Response({'message_id': ['Must be a message id.']}, status=status.HTTP_400_BAD_REQUEST)

		message = get_object_or_404(ChatMessage, id=int(message_id), session=session)
		message.reported = True
		message.save()
		return Response({}, status=status.HTTP_200_OK)

class SessionInviteView(APIView):

	# Invite a friend to your room; they get a notification linking to it
	def post(self, request, session_id, format=None):
		GameSession.close_expired()
		session = get_object_or_404(GameSession, id=session_id)
		if not session.has_member(request.user):
			return Response({'detail': 'Only squad members can invite.'}, status=status.HTTP_403_FORBIDDEN)

		friend = get_object_or_404(User, username=request.data.get('username', ''))
		if not are_friends(request.user, friend):
			return bad_request('You can only invite your friends.')
		if Block.between(request.user, friend):
			return bad_request("You can't invite this user.")
		if session.has_member(friend):
			return bad_request(friend.username + ' is already in this room.')

		link = '/room-page?id=' + str(session.id)
		already_invited = Notification.objects.filter(user=friend, kind=Notification.ROOM_INVITE, link=link, read=False).exists()
		if not already_invited:
			Notification.objects.create(
				user=friend, actor=request.user, kind=Notification.ROOM_INVITE, link=link,
				text=request.user.username + ' invited you to ' + session.session_name + ' (' + session.game.game_name + ').',
			)
		return Response({}, status=status.HTTP_200_OK)

class NotificationsView(APIView):
	LIMIT = 30

	# Latest notifications and how many are unread
	def get(self, request, format=None):
		notifications = request.user.notifications.all()
		return Response({
			'unread': notifications.filter(read=False).count(),
			'items': NotificationSerializer(notifications[:self.LIMIT], many=True).data,
		}, status=status.HTTP_200_OK)

	# Mark notifications as read: {"ids": [1, 2]} or {"all": true}
	def post(self, request, format=None):
		notifications = request.user.notifications.filter(read=False)
		if request.data.get('all') is not True:
			ids = request.data.get('ids')
			if not isinstance(ids, list) or not all(isinstance(i, int) for i in ids):
				return bad_request('Send {"ids": [...]} or {"all": true}.')
			notifications = notifications.filter(id__in=ids)
		notifications.update(read=True)
		return self.get(request)

class EndorseView(APIView):

	# Endorse a squad member: {username, kind, session_id}; both must be in that room
	def post(self, request, format=None):
		GameSession.close_expired()
		session = get_object_or_404(GameSession, id=int_or_none(request.data.get('session_id')))
		target = get_object_or_404(User, username=request.data.get('username', ''))
		kind = request.data.get('kind')

		if kind not in dict(Endorsement.KIND_CHOICES):
			return bad_request('kind must be one of: ' + ', '.join(dict(Endorsement.KIND_CHOICES)) + '.')
		if target == request.user:
			return bad_request("You can't endorse yourself.")
		if not (session.has_member(request.user) and session.has_member(target)):
			return Response({'detail': 'You can only endorse players in your room.'}, status=status.HTTP_403_FORBIDDEN)

		Endorsement.objects.get_or_create(from_user=request.user, to_user=target, kind=kind)
		return Response({}, status=status.HTTP_200_OK)

class EndorsementsView(APIView):
	permission_classes = (permissions.AllowAny,)

	# A player's endorsements by kind, e.g. {"teammate": 3, "skilled": 1}
	def get(self, request, username, format=None):
		user = get_object_or_404(User, username=username)
		counts = user.endorsements_received.values('kind').annotate(total=Count('id'))
		return Response({row['kind']: row['total'] for row in counts}, status=status.HTTP_200_OK)

class BlocksView(APIView):

	# Users the current user has blocked
	def get(self, request, format=None):
		blocks = Block.objects.filter(blocker=request.user).select_related('blocked').order_by('blocked__username')
		return Response([{'username': b.blocked.username} for b in blocks], status=status.HTTP_200_OK)

	# Block a user: also ends any friendship and pending friend requests, and removes them from your room
	def post(self, request, format=None):
		target = get_object_or_404(User, username=request.data.get('username', ''))
		if target == request.user:
			return bad_request("You can't block yourself.")

		Block.objects.get_or_create(blocker=request.user, blocked=target)
		Friends.objects.filter(Q(user=request.user, friend=target) | Q(user=target, friend=request.user)).delete()
		FriendRequests.objects.filter(Q(sender=request.user, receiver=target) | Q(sender=target, receiver=request.user)).delete()
		for session in GameSession.objects.filter(created_by=request.user, players=target):
			session.players.remove(target)
		return self.get(request)

class UnblockView(APIView):

	def post(self, request, format=None):
		target = get_object_or_404(User, username=request.data.get('username', ''))
		Block.objects.filter(blocker=request.user, blocked=target).delete()
		return BlocksView().get(request)

class ReportUserView(APIView):
	DETAILS_MAX = UserReport._meta.get_field('details').max_length

	# Report a user to the admins: {username, reason, details?, session_id?}
	def post(self, request, format=None):
		target = get_object_or_404(User, username=request.data.get('username', ''))
		reason = request.data.get('reason')
		details = str(request.data.get('details') or '').strip()

		if target == request.user:
			return bad_request("You can't report yourself.")
		if reason not in dict(UserReport.REASON_CHOICES):
			return bad_request('reason must be one of: ' + ', '.join(dict(UserReport.REASON_CHOICES)) + '.')
		if len(details) > self.DETAILS_MAX:
			return bad_request('Details must be 500 characters or fewer.')

		# one open report per pair per day is enough for the admins to see
		recent = UserReport.objects.filter(reporter=request.user, reported=target, resolved=False,
		                                   created_at__gte=timezone.now() - timedelta(days=1))
		if not recent.exists():
			session = GameSession.objects.filter(id=int_or_none(request.data.get('session_id'))).first()
			UserReport.objects.create(reporter=request.user, reported=target, reason=reason, details=details, session=session)
		return Response({}, status=status.HTTP_200_OK)
