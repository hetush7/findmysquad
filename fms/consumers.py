"""Live room chat over WebSockets.

The browser connects to /ws/session-chat/<id>/ and sends {"type": "auth", "token": "<access token>"}
as its first message (keeping the token out of URLs and server logs). Squad members then receive
new messages as they are posted through the REST API. Messages are still sent with the REST API,
so validation and rate limits live in one place.
"""
import asyncio

from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import AccessToken

from .models import Block, GameSession

AUTH_TIMEOUT_SECONDS = 10

# close codes the frontend understands
CLOSE_UNAUTHORIZED = 4401  # missing/expired token: refresh and reconnect
CLOSE_FORBIDDEN = 4403     # not (or no longer) in the room


def group_name(session_id):
    return 'session-chat-' + str(session_id)


class SessionChatConsumer(AsyncJsonWebsocketConsumer):

    async def connect(self):
        self.session_id = self.scope['url_route']['kwargs']['session_id']
        self.user_id = None
        self.blocked_ids = set()
        await self.accept()
        self.auth_timeout = asyncio.ensure_future(self.close_if_not_authenticated())

    async def close_if_not_authenticated(self):
        await asyncio.sleep(AUTH_TIMEOUT_SECONDS)
        if self.user_id is None:
            await self.close(code=CLOSE_UNAUTHORIZED)

    async def disconnect(self, code):
        self.auth_timeout.cancel()
        if self.user_id is not None:
            await self.channel_layer.group_discard(group_name(self.session_id), self.channel_name)

    async def receive_json(self, content, **kwargs):
        if self.user_id is not None or content.get('type') != 'auth':
            return
        try:
            user_id = int(AccessToken(str(content.get('token', '')))['user_id'])
        except (TokenError, KeyError, ValueError):
            await self.close(code=CLOSE_UNAUTHORIZED)
            return
        if not await self.is_member(user_id):
            await self.close(code=CLOSE_FORBIDDEN)
            return

        self.user_id = user_id
        self.blocked_ids = await self.get_blocked_ids(user_id)
        await self.channel_layer.group_add(group_name(self.session_id), self.channel_name)
        await self.send_json({'type': 'ready'})

    @database_sync_to_async
    def is_member(self, user_id):
        session = GameSession.objects.filter(id=self.session_id).first()
        return session is not None and (session.created_by_id == user_id or session.players.filter(id=user_id).exists())

    @database_sync_to_async
    def get_blocked_ids(self, user_id):
        return set(Block.objects.filter(blocker_id=user_id).values_list('blocked_id', flat=True))

    # --- events sent to the room's group (see fms/live.py)

    async def chat_message(self, event):
        if event['sender_id'] in self.blocked_ids:
            return
        await self.send_json({'type': 'message', 'message': event['message']})

    async def member_removed(self, event):
        if event['user_id'] == self.user_id:
            await self.close(code=CLOSE_FORBIDDEN)

    async def blocks_changed(self, event):
        if event['user_id'] == self.user_id:
            self.blocked_ids = await self.get_blocked_ids(self.user_id)

    async def session_closed(self, event):
        await self.close(code=CLOSE_FORBIDDEN)
