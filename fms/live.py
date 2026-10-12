"""Push events to everyone connected to a room's live chat (see fms/consumers.py)."""
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

from .consumers import group_name


def _send(session_id, event):
    layer = get_channel_layer()
    if layer is not None:
        async_to_sync(layer.group_send)(group_name(session_id), event)


def chat_message(session_id, message_data, sender_id):
    _send(session_id, {'type': 'chat.message', 'message': message_data, 'sender_id': sender_id})


def member_removed(session_id, user_id):
    _send(session_id, {'type': 'member.removed', 'user_id': user_id})


def blocks_changed(session_id, user_id):
    _send(session_id, {'type': 'blocks.changed', 'user_id': user_id})


def session_closed(session_id):
    _send(session_id, {'type': 'session.closed'})
