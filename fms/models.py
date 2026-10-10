from datetime import timedelta

from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

DEFAULT_ROOM_HOURS = 4
MAX_ROOM_HOURS = 24

PLATFORM_CHOICES = [('any', 'Any platform'), ('pc', 'PC'), ('playstation', 'PlayStation'), ('xbox', 'Xbox'), ('switch', 'Switch')]
REGION_CHOICES = [('any', 'Any region'), ('na', 'North America'), ('sa', 'South America'), ('eu', 'Europe'),
                  ('me', 'Middle East'), ('asia', 'Asia'), ('oce', 'Oceania')]
VOICE_CHOICES = [('any', 'Mic optional'), ('required', 'Mic required'), ('none', 'No mic')]

def default_room_expiry():
    return timezone.now() + timedelta(hours=DEFAULT_ROOM_HOURS)

class ForumPost(models.Model):
    posted_by = models.ForeignKey(User,on_delete=models.CASCADE)
    text = models.CharField(max_length=300)
    reported = models.BooleanField(default = False)

    def __str__(self):
        if(not self.reported):
            return str(self.id)
        return str(self.id) + " (Review Required)"

class Forum(models.Model):
    title           = models.CharField(max_length=100)
    tag             = models.CharField(max_length=5, default = "")
    description     = models.CharField(max_length=300)
    posts           = models.ManyToManyField(ForumPost)

    def __str__(self):
        return self.title

class Game(models.Model):
    game_short_name = models.CharField(max_length=30)
    game_name       = models.CharField(max_length=100)
    description     = models.CharField(max_length=300)
    image_path      = models.CharField(max_length=300)
    ranks           = models.JSONField(default=list, blank=True)  # rank names, lowest first

    def __str__(self):
        return self.game_name

    def rank_range_error(self, min_rank, max_rank):
        # Returns an error message for an invalid rank range, or None. Blank means no limit.
        for rank in (min_rank, max_rank):
            if rank and rank not in self.ranks:
                return '"' + rank + '" is not a ' + self.game_name + ' rank.'
        if min_rank and max_rank and self.ranks.index(min_rank) > self.ranks.index(max_rank):
            return 'Minimum rank cannot be higher than maximum rank.'
        return None

class GameSession(models.Model):
    created_by   = models.ForeignKey(User, on_delete=models.CASCADE, related_name='my_session')
    game         = models.ForeignKey(Game, on_delete=models.CASCADE)
    max_players  = models.IntegerField()
    session_name = models.CharField(max_length=100)
    description  = models.CharField(max_length=300)
    instructions = models.CharField(max_length=300)
    players      = models.ManyToManyField(User)
    min_rank     = models.CharField(max_length=50, blank=True, default='')
    max_rank     = models.CharField(max_length=50, blank=True, default='')
    expires_at   = models.DateTimeField(default=default_room_expiry)
    platform     = models.CharField(max_length=20, choices=PLATFORM_CHOICES, default='any')
    region       = models.CharField(max_length=20, choices=REGION_CHOICES, default='any')
    voice        = models.CharField(max_length=20, choices=VOICE_CHOICES, default='any')

    def __str__(self):
        return str(self.created_by) + ": " + self.session_name

    def is_full(self):
        if self.players.count() < self.max_players:
            return False
        return True

    @classmethod
    def close_expired(cls):
        # Rooms close themselves when their time runs out (their chat goes with them)
        return cls.objects.filter(expires_at__lte=timezone.now()).delete()

    def extend(self, hours=1):
        # Keep the room open longer, but never more than MAX_ROOM_HOURS from now
        latest = timezone.now() + timedelta(hours=MAX_ROOM_HOURS)
        self.expires_at = min(max(self.expires_at, timezone.now()) + timedelta(hours=hours), latest)
        self.save(update_fields=['expires_at'])

    def has_member(self, user):
        # The host or any player who has joined
        return self.created_by_id == user.id or self.players.filter(id=user.id).exists()

class Friends(models.Model):
    user   = models.ForeignKey(User, on_delete=models.CASCADE, related_name='me')
    friend = models.ForeignKey(User, on_delete=models.CASCADE)

    def __str__(self):
        return str(self.user) + " and " + str(self.friend)

class FriendRequests(models.Model):
    sender   = models.ForeignKey(User, on_delete=models.CASCADE)
    receiver = models.ForeignKey(User, on_delete=models.CASCADE, related_name='receivers')

    def __str__(self):
        return str(self.sender) + " to " + str(self.receiver) 

class ProfileBio(models.Model):
    user    = models.ForeignKey(User, on_delete=models.CASCADE)
    bio     = models.CharField(max_length=300, default='YOUR BIO')
    img_url = models.URLField(default='IMAGE_URL')

    def __str__(self):
        return str(self.user) + ": " + self.bio

class GamerTags(models.Model):
    user       = models.OneToOneField(User, on_delete=models.CASCADE, related_name='gamer_tags')
    psn        = models.CharField(max_length=50, blank=True, default='')
    xbox       = models.CharField(max_length=50, blank=True, default='')
    steam      = models.CharField(max_length=50, blank=True, default='')
    riot       = models.CharField(max_length=50, blank=True, default='')
    ea         = models.CharField(max_length=50, blank=True, default='')
    activision = models.CharField(max_length=50, blank=True, default='')

    def __str__(self):
        return str(self.user) + "'s gamer tags"

class ChatMessage(models.Model):
    session    = models.ForeignKey(GameSession, on_delete=models.CASCADE, related_name='messages')
    sender     = models.ForeignKey(User, on_delete=models.CASCADE)
    text       = models.CharField(max_length=500)
    created_at = models.DateTimeField(auto_now_add=True)
    reported   = models.BooleanField(default=False)

    class Meta:
        ordering = ['id']

    def __str__(self):
        label = str(self.sender) + " in " + str(self.session.session_name)
        if self.reported:
            return label + " (Review Required)"
        return label

class PlayerRank(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='ranks')
    game = models.ForeignKey(Game, on_delete=models.CASCADE)
    rank = models.CharField(max_length=50)

    class Meta:
        constraints = [models.UniqueConstraint(fields=['user', 'game'], name='one_rank_per_game')]

    def __str__(self):
        return str(self.user) + ": " + self.rank + " in " + str(self.game)

class Notification(models.Model):
    FRIEND_REQUEST, FRIEND_ACCEPTED, ROOM_INVITE = 'friend_request', 'friend_accepted', 'room_invite'
    KIND_CHOICES = [(FRIEND_REQUEST, 'Friend request'), (FRIEND_ACCEPTED, 'Friend request accepted'), (ROOM_INVITE, 'Room invite')]

    user       = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    actor      = models.ForeignKey(User, on_delete=models.CASCADE, related_name='+', null=True, blank=True)
    kind       = models.CharField(max_length=30, choices=KIND_CHOICES)
    text       = models.CharField(max_length=200)
    link       = models.CharField(max_length=200, blank=True, default='')
    read       = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-id']

    def __str__(self):
        return str(self.user) + ": " + self.text
