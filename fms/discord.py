"""Minimal Discord OAuth2 + webhook client (standard library only).

Configured with environment variables; see .env.example. Every function raises
DiscordError on failure so views can turn it into a clean error response.
"""
import json
import os
import urllib.error
import urllib.parse
import urllib.request

TIMEOUT_SECONDS = 10
SCOPES = 'identify email connections'

# Discord connection types -> our gamer tag fields
CONNECTION_FIELDS = {'playstation': 'psn', 'xbox': 'xbox', 'steam': 'steam', 'riotgames': 'riot'}


class DiscordError(Exception):
    pass


def setting(name, default=''):
    return os.environ.get(name, default)


def is_enabled():
    return bool(setting('DISCORD_CLIENT_ID') and setting('DISCORD_CLIENT_SECRET') and setting('DISCORD_REDIRECT_URI'))


def webhook_enabled():
    return bool(setting('DISCORD_LFG_WEBHOOK_URL'))


def api_base():
    return setting('DISCORD_API_BASE', 'https://discord.com/api/v10').rstrip('/')


def authorize_url(state):
    query = urllib.parse.urlencode({
        'client_id': setting('DISCORD_CLIENT_ID'),
        'redirect_uri': setting('DISCORD_REDIRECT_URI'),
        'response_type': 'code',
        'scope': SCOPES,
        'state': state,
        'prompt': 'none',
    })
    return setting('DISCORD_AUTHORIZE_URL', 'https://discord.com/oauth2/authorize') + '?' + query


def _send(request):
    try:
        with urllib.request.urlopen(request, timeout=TIMEOUT_SECONDS) as response:
            body = response.read()
            return json.loads(body) if body else None
    except (urllib.error.URLError, ValueError, TimeoutError) as error:
        raise DiscordError(str(error)) from error


def exchange_code(code):
    data = urllib.parse.urlencode({
        'client_id': setting('DISCORD_CLIENT_ID'),
        'client_secret': setting('DISCORD_CLIENT_SECRET'),
        'grant_type': 'authorization_code',
        'code': code,
        'redirect_uri': setting('DISCORD_REDIRECT_URI'),
    }).encode()
    request = urllib.request.Request(api_base() + '/oauth2/token', data=data,
                                     headers={'Content-Type': 'application/x-www-form-urlencoded', 'Accept': 'application/json'})
    token = _send(request)
    if not token or 'access_token' not in token:
        raise DiscordError('Discord did not return an access token.')
    return token['access_token']


def _get(path, access_token):
    request = urllib.request.Request(api_base() + path,
                                     headers={'Authorization': 'Bearer ' + access_token, 'Accept': 'application/json'})
    return _send(request)


def fetch_user(access_token):
    return _get('/users/@me', access_token)


def fetch_connections(access_token):
    return _get('/users/@me/connections', access_token) or []


def gamer_tags_from_connections(connections):
    # {"psn": "PlayerOne", ...} from verified Discord connections we have fields for
    tags = {}
    for connection in connections:
        field = CONNECTION_FIELDS.get(connection.get('type'))
        if field and connection.get('verified') and connection.get('name'):
            tags[field] = str(connection['name'])[:50]
    return tags


def post_room(embed):
    request = urllib.request.Request(setting('DISCORD_LFG_WEBHOOK_URL'), data=json.dumps({'embeds': [embed]}).encode(),
                                     headers={'Content-Type': 'application/json'})
    _send(request)
