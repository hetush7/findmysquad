from django.urls import path

from .consumers import SessionChatConsumer

websocket_urlpatterns = [
    path('ws/session-chat/<int:session_id>/', SessionChatConsumer.as_asgi()),
]
