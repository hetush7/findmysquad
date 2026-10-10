// Base address of the Django API. Set REACT_APP_API_URL to point the app at another server.
// An empty value means "same origin" (when nginx serves the app and proxies /api).
const API_URL = (import.meta.env.REACT_APP_API_URL ?? "http://localhost:8000").replace(/\/+$/, "") + "/api";

let redirectingToLogin = false;

function clearTokens() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('current_user');
}

// Called when the server says the user isn't (or is no longer) logged in.
function handleLoggedOut() {
    clearTokens();
    if (!redirectingToLogin) {
        redirectingToLogin = true;
        alert('Please log in to continue.');
        window.location.assign('/login-page');
    }
}

function storeTokens({ access, refresh }) {
    localStorage.setItem('access_token', access);
    if (refresh) {
        localStorage.setItem('refresh_token', refresh);
    }
}

// Access tokens expire after 15 minutes. Get a new one with the refresh token; concurrent
// callers share one refresh request, because each refresh revokes the previous refresh token.
let refreshInFlight = null;
function refreshAccessToken() {
    const refresh = localStorage.getItem('refresh_token');
    if (!refresh) {
        return Promise.resolve(false);
    }
    if (!refreshInFlight) {
        refreshInFlight = fetch(API_URL + '/token/refresh', {
            method: 'POST',
            headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh }),
        })
            .then(async response => {
                if (!response.ok) {
                    return false;
                }
                storeTokens(await response.json());
                return true;
            })
            .catch(() => false)
            .finally(() => { refreshInFlight = null; });
    }
    return refreshInFlight;
}

async function send(path, method, body, withToken) {
    const headers = { 'Accept': 'application/json' };
    const token = localStorage.getItem('access_token');
    if (withToken && token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    if (body !== undefined) {
        headers['Content-Type'] = 'application/json';
    }
    return fetch(API_URL + path, {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
    });
}

/**
 * Shared request helper for every API call.
 * @param path - API path, e.g. "/game-info"
 * @param options.method - HTTP method (default GET)
 * @param options.body - Object sent as JSON
 * @param options.auth - Send the access token, and renew it once if it has expired (default true)
 * @param options.redirectOn401 - Send the user to the login page if they still aren't authorised (default true)
 * @returns { ok, status, data } - status is 0 when the server couldn't be reached
 */
async function request(path, { method = 'GET', body, auth = true, redirectOn401 = true } = {}) {
    let response;
    try {
        response = await send(path, method, body, auth);
        if (response.status === 401 && auth && localStorage.getItem('access_token') && await refreshAccessToken()) {
            response = await send(path, method, body, auth);
        }
    } catch {
        return { ok: false, status: 0, data: { detail: 'Could not reach the server.' } };
    }

    let data = null;
    try {
        data = await response.json();
    } catch {
        // empty or non-JSON body
    }

    if (response.status === 401 && auth) {
        if (redirectOn401) {
            handleLoggedOut();
        } else {
            clearTokens();
        }
    }
    return { ok: response.ok, status: response.status, data };
}

// Turn an error response body into one readable message
function errorMessage(data, fallback) {
    if (!data) {
        return fallback;
    }
    if (data.detail) {
        return String(data.detail);
    }
    return Object.values(data).flat().join(' ') || fallback;
}

export class APIOnline {

    /**
     * A function to get all games
     * @returns A list of all games (empty if they couldn't be loaded)
     */
    async getGames() {
        const { ok, data } = await request('/game-info');
        return ok ? data : [];
    }

    /**
     * A function to get details of a game
     * @param id - The game ID
     * @returns - The full details of the game with matching ID, or undefined
     */
    async getGame(id) {
        const games = await this.getGames();
        return games.find(game => game.id === parseInt(id));
    }

    /**
     * A function to get all sessions that fit all the filter criteria
     * @param filter - An array of filter values: game short names, and/or "friend" for rooms hosted by friends
     * @returns - A list of matching sessions
     */
    async getSessions(filter) {
        const { ok, data } = await request('/get-sessions');
        let sessions = ok ? data : [];

        const gameFilter = filter.filter(value => value !== 'friend');
        if (gameFilter.length > 0) {
            sessions = sessions.filter(session => gameFilter.includes(session.gameShortName));
        }
        if (filter.includes('friend')) {
            const friends = (await this.getFriends()).map(friend => friend.username);
            sessions = sessions.filter(session => friends.includes(session.hostUsername));
        }
        return sessions;
    }

    /**
     * A function to get details of a session. Squad members also get the join
     * instructions and gamer tags.
     * @param id - The session ID
     * @returns - The session, or null if it doesn't exist. Throws on network/server errors.
     */
    async getSession(id) {
        const { status, data } = await request(`/session/${id}`);
        if (status === 200) {
            return data;
        }
        if (status === 404) {
            return null;
        }
        throw new Error(`Could not load session (${status})`);
    }

    /**
     * A function to create a new session
     * @param room - { game, maxPlayers, name, description, instructions, minRank, maxRank, durationHours, platform, region, voice }
     * @returns - { id } of the newly created session, or { error } with a message
     */
    async createSession(room) {
        const { status, data } = await request('/create-session', {
            method: 'POST',
            body: {
                game_id: room.game,
                max_players: room.maxPlayers,
                session_name: room.name,
                description: room.description,
                instructions: room.instructions,
                min_rank: room.minRank || '',
                max_rank: room.maxRank || '',
                duration_hours: room.durationHours || 4,
                platform: room.platform || 'any',
                region: room.region || 'any',
                voice: room.voice || 'any',
            },
        });
        return status === 201 ? { id: data.id } : { error: errorMessage(data, 'Error creating session') };
    }

    /**
     * A function to join a session
     * @returns - Boolean, true if the user joined
     */
    async joinSession(sessionID) {
        const { ok } = await request('/create-session', { method: 'PUT', body: { session_id: sessionID, action: 0 } });
        return ok;
    }

    /**
     * A function to leave a session (the host leaving closes it)
     * @returns - Boolean, true if the user left
     */
    async leaveSession(sessionID) {
        const { ok } = await request('/create-session', { method: 'PUT', body: { session_id: sessionID, action: 1 } });
        return ok;
    }

    /**
     * A function for the host to keep their room open for another hour
     * @returns - The new closing time, or null if it couldn't be extended
     */
    async extendSession(sessionID) {
        const { ok, data } = await request('/create-session', { method: 'PUT', body: { session_id: sessionID, action: 3 } });
        return ok ? data.expiresAt : null;
    }

    /**
     * A function for the host to remove a player from their session
     * @returns - Boolean, true if the player was removed
     */
    async removePlayerFromSession(player_id, sessionID) {
        const { ok } = await request('/create-session', {
            method: 'PUT',
            body: { session_id: sessionID, player_id: player_id, action: 2 },
        });
        return ok;
    }

    /**
     * A function to register a new user
     * @returns - The new user's details, or null if registration failed (errors are shown to the user)
     */
    async registerUser(userName, emailID, pass) {
        const { status, data } = await request('/register-user', {
            method: 'POST',
            body: { username: userName, email: emailID, password: pass },
            auth: false,
        });
        if (status === 201) {
            return data;
        }
        alert(errorMessage(data, 'Registration failed.'));
        return null;
    }

    /**
     * A function to log in. Stores the access and refresh tokens.
     * @returns - The access/refresh tokens, or null if login failed (errors are shown to the user)
     */
    async loginUser(userName, pass) {
        const { status, data } = await request('/token', {
            method: 'POST',
            body: { username: userName, password: pass },
            auth: false,
        });
        if (status === 200) {
            storeTokens(data);
            redirectingToLogin = false;
            return data;
        }
        alert(status === 401 ? 'Authentication Failed! Invalid login details.' : errorMessage(data, 'Something went wrong. Please try again.'));
        return null;
    }

    /**
     * A function to check who is logged in
     * @returns - The username, or false if not logged in
     */
    async currentUserCheck() {
        const { status, data } = await request('/user-check', { redirectOn401: false });
        return status === 200 ? data.username : false;
    }

    /**
     * A function to log out: forgets the tokens locally and revokes the refresh token on the server
     */
    logoutUser() {
        const refresh = localStorage.getItem('refresh_token');
        clearTokens();
        if (refresh) {
            request('/logout', { method: 'POST', body: { refresh }, auth: false });
        }
    }

    /**
     * A function to get all forums with their posts
     * @returns - A list of forums (empty if they couldn't be loaded)
     */
    async getForums() {
        const { ok, data } = await request('/get-forums');
        return ok ? data : [];
    }

    /**
     * A function to get one forum by its tag
     * @returns - The forum, or null if there is no forum with that tag
     */
    async getForum(name) {
        const forums = await this.getForums();
        return forums.find(forum => forum.tag === name) || null;
    }

    /**
     * A function to post in a forum
     * @returns - Boolean, true if the post was created
     */
    async makePost([forumTag, text]) {
        const { status } = await request('/forum', { method: 'POST', body: { tag: forumTag, text: text } });
        return status === 201;
    }

    /**
     * A function to report a forum post for admin review
     * @returns - Boolean, true if the report was recorded
     */
    async reportPost(post_id) {
        const { ok } = await request('/forum-post', { method: 'PUT', body: { post_id: post_id } });
        return ok;
    }

    /**
     * A function to send a friend request
     * @returns - Boolean, true if the request was sent
     */
    async sendFriendRequest(receiver) {
        const { ok } = await request('/friend-requests', { method: 'POST', body: { rec_username: receiver } });
        return ok;
    }

    /**
     * A function to get the friend requests sent to the current user
     * @returns - A list of { username }
     */
    async getFriendRequests() {
        const { ok, data } = await request('/friend-requests');
        return ok ? data : [];
    }

    /**
     * A function to get the current user's friends
     * @returns - A list of { username }
     */
    async getFriends() {
        const { ok, data } = await request('/friends');
        return ok ? data : [];
    }

    /**
     * A function to accept a friend request
     * @returns - Boolean, true if accepted
     */
    async acceptFriendRequest(username) {
        const { ok } = await request('/friend-requests', { method: 'PUT', body: { friend_username: username, action: 0 } });
        return ok;
    }

    /**
     * A function to decline a friend request
     * @returns - Boolean, true if declined
     */
    async declineFriendRequest(username) {
        const { ok } = await request('/friend-requests', { method: 'PUT', body: { friend_username: username, action: 1 } });
        return ok;
    }

    /**
     * A function to remove a friend
     * @returns - Boolean, true if removed
     */
    async removeFriend(username) {
        const { ok } = await request('/friends', { method: 'PUT', body: { friend_username: username } });
        return ok;
    }

    /**
     * A function to get the current user's bio
     * @returns - { bio }, or false on error
     */
    async getUserBio() {
        const { ok, data } = await request('/profile-bio');
        return ok ? data : false;
    }

    /**
     * A function to update the current user's bio
     * @returns - Boolean, true if saved
     */
    async updateUserBio(profile_bio) {
        const { ok } = await request('/profile-bio', { method: 'POST', body: { bio: profile_bio } });
        return ok;
    }

    /**
     * A function to get the current user's gamer tags
     * @returns An object of platform -> tag (empty strings for unset platforms), or false on error
     */
    async getGamerTags() {
        const { ok, data } = await request('/gamer-tags');
        return ok ? data : false;
    }

    /**
     * A function to update the current user's gamer tags
     * @param tags - An object of platform -> tag
     * @returns null on success, otherwise an error message
     */
    async updateGamerTags(tags) {
        const { ok, data } = await request('/gamer-tags', { method: 'PUT', body: tags });
        return ok ? null : errorMessage(data, 'Error');
    }

    /**
     * A function to get the current user's saved ranks
     * @returns - An object of game id -> rank (empty if none, or on error)
     */
    async getMyRanks() {
        const { ok, data } = await request('/my-ranks', { redirectOn401: false });
        return ok ? data : {};
    }

    /**
     * A function to save the current user's ranks
     * @param ranks - An object of game id -> rank ('' clears it)
     * @returns null on success, otherwise an error message
     */
    async updateMyRanks(ranks) {
        const { ok, data } = await request('/my-ranks', { method: 'PUT', body: ranks });
        return ok ? null : errorMessage(data, 'Error');
    }

    /**
     * A function to get the current user's notifications
     * @returns - { unread, items }, or null on error
     */
    async getNotifications() {
        const { ok, data } = await request('/notifications', { redirectOn401: false });
        return ok ? data : null;
    }

    /**
     * A function to mark notifications as read
     * @param which - { ids: [...] } or { all: true }
     * @returns - { unread, items } after the change, or null on error
     */
    async markNotificationsRead(which) {
        const { ok, data } = await request('/notifications', { method: 'POST', body: which });
        return ok ? data : null;
    }

    /**
     * A function to invite a friend to a room
     * @returns null on success, otherwise an error message
     */
    async inviteToSession(sessionID, username) {
        const { ok, data } = await request(`/session/${sessionID}/invite`, { method: 'POST', body: { username } });
        return ok ? null : errorMessage(data, 'Could not send the invite.');
    }

    /**
     * A function to get room chat messages
     * @param sessionID - The session whose chat to read
     * @param afterID - Only return messages newer than this message id (omit for the latest messages)
     * @returns { messages } on success, { error, status } otherwise
     */
    async getChatMessages(sessionID, afterID) {
        const query = afterID ? `?after=${afterID}` : '';
        const { status, data } = await request(`/session-chat/${sessionID}${query}`);
        if (status === 200) {
            return { messages: data };
        }
        return { error: errorMessage(data, 'Could not load messages.'), status };
    }

    /**
     * A function to send a room chat message
     * @param sessionID - The session whose chat to post in
     * @param text - The message text
     * @returns { message } on success, { error } otherwise
     */
    async sendChatMessage(sessionID, text) {
        const { status, data } = await request(`/session-chat/${sessionID}`, { method: 'POST', body: { text: text } });
        return status === 201 ? { message: data } : { error: errorMessage(data, 'Could not send.') };
    }

    /**
     * A function to report a room chat message for admin review
     * @returns - Boolean, true if the report was recorded
     */
    async reportChatMessage(sessionID, messageID) {
        const { ok } = await request(`/session-chat/${sessionID}/report`, { method: 'POST', body: { message_id: messageID } });
        return ok;
    }

    /**
     * A function to get the current user's profile picture URL
     * @returns - { image_url }, or false on error
     */
    async getUserImage() {
        const { ok, data } = await request('/profile-image');
        return ok ? data : false;
    }

    /**
     * A function to update the current user's profile picture URL
     * @returns - Boolean, true if saved
     */
    async updateUserImage(profile_image) {
        const { ok } = await request('/profile-image', { method: 'POST', body: { image_url: profile_image } });
        return ok;
    }

    /**
     * Change the logged-in user's password
     * @returns null on success, otherwise an error message
     */
    async updatePassword(oldPassword, newPassword) {
        const { ok, data } = await request('/update-password', {
            method: 'POST',
            body: { old_password: oldPassword, new_password: newPassword },
        });
        return ok ? null : errorMessage(data, 'Error');
    }
}
