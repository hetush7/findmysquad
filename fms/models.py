from django.db import models
from django.contrib.auth.models import User

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

    def __str__(self):
        return self.game_name

class GameSession(models.Model):
    created_by   = models.ForeignKey(User, on_delete=models.CASCADE, related_name='my_session')
    game         = models.ForeignKey(Game, on_delete=models.CASCADE)
    max_players  = models.IntegerField()
    session_name = models.CharField(max_length=100)
    description  = models.CharField(max_length=300)
    instructions = models.CharField(max_length=300)
    players      = models.ManyToManyField(User)

    def __str__(self):
        return str(self.created_by) + ": " + self.session_name

    def is_full(self):
        if self.players.count() < self.max_players:
            return False
        return True

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
