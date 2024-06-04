from rest_framework import serializers 
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import *

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):

	@classmethod
	def get_token(cls, user):
		token = super(MyTokenObtainPairSerializer, cls).get_token(user)

		# Add custom claims
		token['username'] = user.username
		return token

class UserSerializer(serializers.ModelSerializer):
	class Meta:
		model  = User
		fields = ['id', 'username', 'email', 'password']

class PlayerSerializer(serializers.ModelSerializer):
	userID   = serializers.SerializerMethodField('get_id')
	username = serializers.SerializerMethodField('get_username')

	class Meta:
		model  = User
		fields = ('userID', 'username')

	def get_id(self, obj):
		return obj.id

	def get_username(self, obj):
		return obj.username

class SessionSerializer(serializers.ModelSerializer):
	id                 = serializers.SerializerMethodField('get_id')
	hostID             = serializers.SerializerMethodField('get_host_id')
	hostUsername       = serializers.SerializerMethodField('get_host_username')
	gameID             = serializers.SerializerMethodField('get_game_id')
	gameImagePath      = serializers.SerializerMethodField('get_game_imagepath')
	sessionName        = serializers.SerializerMethodField('get_name')
	sessionDescription = serializers.SerializerMethodField('get_description')
	joinDescription    = serializers.SerializerMethodField('get_instructions')
	full               = serializers.SerializerMethodField('is_full')
	maxPlayers         = serializers.SerializerMethodField('get_max_players')
	players            = serializers.SerializerMethodField('get_players')
	gameShortName      = serializers.SerializerMethodField('get_game_short_name')

	class Meta:
		model  = GameSession
		exclude = ('max_players', 'session_name', 'description', 'instructions', 
		'created_by', 'game')

	def get_id(self, obj):
		return obj.id

	def get_host_id(self, obj):
		return obj.created_by.id

	def get_host_username(self, obj):
		return obj.created_by.username

	def get_game_id(self, obj):
		return obj.game.id

	def get_game_imagepath(self, obj):
		return obj.game.image_path
	
	def get_name(self, obj):
		return obj.session_name

	def get_description(self, obj):
		return obj.description

	def get_instructions(self, obj):
		return obj.instructions

	def is_full(self, obj):
		return obj.is_full()

	def get_max_players(self, obj):
		return obj.max_players
	
	def get_game_short_name(self, obj):
		return obj.game.game_short_name

	def get_players(self, obj):
		return PlayerSerializer(obj.players, many=True).data

class GameSerializer(serializers.ModelSerializer):
	id                 = serializers.SerializerMethodField('get_id')
	gameShortName      = serializers.SerializerMethodField('get_game_short_name')
	gameName           = serializers.SerializerMethodField('get_game_name')
	gameDescription    = serializers.SerializerMethodField('get_game_description')
	imagePath          = serializers.SerializerMethodField('get_image_path')

	class Meta:
		model = Game
		fields = ['id','gameShortName','gameName','gameDescription','imagePath']
	
	def get_id(self, obj):
		return obj.id

	def get_game_short_name(self, obj):
		return obj.game_short_name

	def get_game_name(self, obj):
		return obj.game_name

	def get_game_description(self, obj):
		return obj.description

	def get_image_path(self, obj):
		return obj.image_path

class ForumSerializer(serializers.ModelSerializer):
	id                 = serializers.SerializerMethodField('get_id')
	tag                = serializers.SerializerMethodField('get_tag')
	title              = serializers.SerializerMethodField('get_title')
	description        = serializers.SerializerMethodField('get_description')
	posts              = serializers.SerializerMethodField('get_posts')

	class Meta:
		model  = Forum
		fields = ('id', 'title', 'description', 'posts','tag')

	def get_id(self, obj):
		return obj.id

	def get_title(self, obj):
		return obj.title

	def get_description(self, obj):
		return obj.description

	def get_tag(self,obj):
		return obj.tag

	def get_posts(self, obj):
		return PostSerializer(obj.posts, many=True).data


class PostSerializer(serializers.ModelSerializer):
	id   = serializers.SerializerMethodField('get_id')
	username = serializers.SerializerMethodField('get_username')
	text = serializers.SerializerMethodField("get_text")
	reported = serializers.SerializerMethodField("get_reported")

	class Meta:
		model  = ForumPost
		fields = ('id', 'username','text','reported')

	def get_id(self, obj):
		return obj.id

	def get_username(self, obj):
		return obj.posted_by.username

	def get_text(self,obj):
		return obj.text
	
	def get_reported(self,obj):
		return obj.reported