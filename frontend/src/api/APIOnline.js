
export class APIOnline {

    /**
     * A function to get all games
     * @returns A list of all games
     */
    getGames() {
        return new Promise((resolve) => {
            var responseCode = 0;
            fetch('http://localhost:8000/api/game-info')
                .then(function(response) {
                    responseCode = response.status
                    return response.json()
                })
                .then(function(data) {
                    if (responseCode === 200) { resolve(data) } 
                    else { alert("Invalid Games") } })
        });
    }

    /**
     * A function to get deatils of a game
     * @param id - The game ID
     * @returns - The full details of a game with matching ID
     */
    async getGame(id) {

        // filter the games for matching id
        var games = await this.getGames()
        let path = games.filter(games => {
            return games.id === parseInt(id)
        })

        // if no match, return null
        if (path === undefined) {
            return null;
        }

        // return the first (only) element
        return path[0];
    }

    /**
     * A function to get all sessions that fits all the filter criteria
     * @param filter - An array of filter criteria
     * @returns - A new list of sessions that fits the criteria
     */
    async getSessions(filter) {

        if (filter.length > 0) {
            if(filter.includes('friend')){
                //Filtering on Games and Friends both
                var friends = await this.getFriends();

                return new Promise((resolve) => {
                    let friendsList = []
                    for(var n = 0 ; n < friends.length ; n++){
                        friendsList.push(friends[n].username)
                    }
                    fetch('http://localhost:8000/api/get-sessions')
                        .then(function(response) {
                            return response.json()
                        })
                        .then(function(data) { 
                            let session = data.filter(data => {
                                return filter.includes(data.gameShortName)
                            })
                            session = data.filter(data => {
                                console.log(friendsList)
                                return friendsList.includes(data.hostUsername)
                            })
                            // if no match, return null
                            if (session === undefined) {
                                resolve (null)
                            }
                            resolve(session)  
                        })
            });
            }
            else{
                //Filtering only on games
                return new Promise((resolve) => {
                    fetch('http://localhost:8000/api/get-sessions')
                        .then(function(response) {
                            return response.json()
                        })
                        .then(function(data) { 
                            let session = data.filter(data => {
                                return filter.includes(data.gameShortName)
                            })
                            // if no match, return null
                            if (session === undefined) {
                                resolve (null)
                            }
                            resolve(session) 
                        })
            });
            }
        } else {
            return new Promise((resolve) => {
                fetch('http://localhost:8000/api/get-sessions')
                    .then(function(response) {
                        return response.json()
                    })
                    .then(function(data) { 
                        resolve(data)
                    })
            });
        } 
    }

    /**
     * A function to get details of a session
     * @param id - The session ID
     * @returns - The full details of a session with matching ID
     */
    async getSession(id) {

        // filter the sessions for matching id
        var sessions = await this.getSessions([])
        let session = sessions.filter(sessions => {
            return sessions.id === parseInt(id)
        })

        // if no match, return null
        if (session === undefined) {
            return null;
        }

        // return the first (only) element
        return session[0];
    }

    /**
     * A function to create a new session
     * @param param0 - An array of all form inputs [formGame, formMaxPlayers, formName, formDescription, formHiddenDescription]
     * @returns - The session ID of the newly created session
     */
    createSession([formGame, formMaxPlayers, formName, formDescription, formHiddenDescription]) {

        // 99 max player to simulate error creating by returning 0
        if (formMaxPlayers === 99) {
            return 0;
        } else {
            const requestOptions = {
                method: 'post',
                headers: { 
                  'Accept': 'application/json',
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                },
                body: JSON.stringify({ game_id: formGame,
                                       max_players: formMaxPlayers,
                                       session_name: formName,
                                       description: formDescription,
                                       instructions: formHiddenDescription })
            }
            
            // push data to api and return new id from api
            return new Promise((resolve) => {
                var responseCode = 0;
                fetch('http://localhost:8000/api/create-session', requestOptions)
                    .then(function(response) {
                        responseCode = response.status
                        return response.json()
                    })
                    .then(function(data){
                        if (responseCode === 201) { resolve(data.id) } 
                        else if (responseCode === 401) {
                            alert('YOU ARE LOGGED OUT')
                            window.location.replace('http://localhost:3000/login-page')
                        }
                        else { resolve(0) } })
            });
        }
    }

    /**
     * A function to join a session for a user
     * @param sessionID - The session id of the session the user is joining to
     * @param username - The username of the user that is joining
     * @returns - Boolean, true if user joins successfully and false otherwise
     */
    joinSession(sessionID) {
        const requestOptions = {
            method: 'put',
            headers: { 
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
            },
            body: JSON.stringify({ session_id: sessionID,
                                   action:    0 })
        };
  
        return new Promise((resolve) => {
            var responseCode = 0;
            fetch('http://localhost:8000/api/create-session', requestOptions)
                .then(function(response) {
                    responseCode = response.status
                })
                .then(function(){
                    if (responseCode === 200) { resolve(true) }
                    else if (responseCode === 401) {
                        alert('YOU ARE LOGGED OUT')
                        window.location.replace('http://localhost:3000/login-page')
                    } 
                    else { resolve(false) } })
        });
    }

    /**
     * A function to leave a session for a user
     * @param sessionID - The session id of the session the user is leaving from
     * @param username - The username of the user that is leaving
     */
    leaveSession(sessionID) {
        const requestOptions = {
            method: 'put',
            headers: { 
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
            },
            body: JSON.stringify({ session_id: sessionID,
                                   action:    1 })
        };
  
        return new Promise((resolve) => {
            var responseCode = 0;
            fetch('http://localhost:8000/api/create-session', requestOptions)
                .then(function(response) {
                    responseCode = response.status
                })
                .then(function(){
                    if (responseCode === 200) { resolve(true) }
                    else if (responseCode === 401) {
                        alert('YOU ARE LOGGED OUT')
                        window.location.replace('http://localhost:3000/login-page')
                    }  
                    else { resolve(false) } })
        });
    }

    removePlayerFromSession(player_id,sessionID){
        const requestOptions = {
            method: 'put',
            headers: { 
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
            },
            body: JSON.stringify({ session_id: sessionID,
                                   player_id: player_id,
                                   action:    2 })
        };
  
        return new Promise((resolve) => {
            var responseCode = 0;
            fetch('http://localhost:8000/api/create-session', requestOptions)
                .then(function(response) {
                    responseCode = response.status
                })
                .then(function(){
                    if (responseCode === 200) { resolve(true) }
                    else if (responseCode === 401) {
                        alert('YOU ARE LOGGED OUT')
                        window.location.replace('http://localhost:3000/login-page')
                    } 
                    else { resolve(false) } })
        });
    }

    /**
     * A function to invite another player to the session
     * @param sessionID - The session id of the session the user is leaving from
     * @param username - The username of the user that is leaving
     * @returns - Boolean, true if the invite is successfully and false otherwise
     */
    invite(username, sessionID) {

        // mocking invite error unless username is true
        if (username==="true") {
            return true;
        } else {
            return false;
        }
    }

    registerUser(userName, emailID, pass) {
        const requestOptions = {
            method: 'post',
            headers: { 
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username: userName,
                                   email:    emailID,
                                   password: pass })
        };
  
        return new Promise((resolve) => {
            var responseCode = 0;
            fetch('http://localhost:8000/api/register-user', requestOptions)
                .then(function(response) {
                    responseCode = response.status
                    return response.json();
                })
                .then(function(data){
                    if (responseCode !== 201) {
                        if (data.username) { alert(data.username); }
                        if (data.email) { alert(data.email); }
                    } else if (responseCode === 401) {
                        alert('YOU ARE LOGGED OUT')
                        window.location.replace('http://localhost:3000/login-page')
                    } 
                    else { resolve(data) } })
        });

    }

    loginUser(userName, pass) {
        const requestOptions = {
            method: 'post',
            headers: { 
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username: userName,
                                   password: pass })
        };
  
        return new Promise((resolve) => {
            var responseCode = 0;
            fetch('http://localhost:8000/api/token', requestOptions)
                .then(function(response) {
                    responseCode = response.status
                    return response.json();
                })
                .then(function(data){
                    if (responseCode === 401) {
                        alert("Authentication Failed! Invalid login details.")
                    } else if (responseCode === 200) { resolve(data) } 
                    else { alert("Something went wrong. Are you already logged in?") } })
        });
    }

    currentUserCheck() {
        const requestOptions = {
            method: 'get',
            headers: { 
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
            },
        };

        return new Promise((resolve) => {
            var responseCode = 0;
            fetch('http://localhost:8000/api/user-check', requestOptions)
                .then(function(response) {
                    responseCode = response.status
                    return response.json()
                })
                .then(function(data){
                    if (responseCode === 200) { resolve(data.username) }
                    else { resolve(false) } })
                });
    }

    logoutUser() {
        localStorage.removeItem('access_token');
        localStorage.removeItem('current_user');
    }

    getForums(){
        return new Promise((resolve) => {
            fetch('http://localhost:8000/api/get-forums')
                .then(function(response) {
                    return response.json()
                })
                .then(function(data) { 
                    console.log(data)
                    resolve(data) 
                })
        });
    }

    async getForum(name) {

        // filter the sessions for matching id
        var forums = await this.getForums()
        console.log(name)
        let forum = forums.filter(forums => {
            return forums.tag === name
        })

        // if no match, return null
        if (forum === undefined) {
            return null;
        }

        // return the first (only) element
        return forum[0];
    }

    
    makePost([forumTag,text]) {
        const requestOptions = {
            method: 'post',
            headers: { 
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
            },
            body: JSON.stringify({ tag:  forumTag,
                                   text: text })
        };
  
        return new Promise((resolve) => {
            var responseCode = 0;
            fetch('http://localhost:8000/api/forum', requestOptions)
                .then(function(response) {
                    responseCode = response.status
                })
                .then(function(){
                    if (responseCode === 201) {
                        resolve(true)
                    } 
                    else if (responseCode === 401) {
                        alert('YOU ARE LOGGED OUT')
                        window.location.replace('http://localhost:3000/login-page')
                    }
                    else { resolve(false) } })
        });
    }

    reportPost(post_id){
        const requestOptions = {
            method: 'put',
            headers: { 
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
            },
            body: JSON.stringify({ post_id: post_id
                                   })
        };
  
        return new Promise((resolve) => {
            var responseCode = 0;
            fetch('http://localhost:8000/api/forum-post', requestOptions)
                .then(function(response) {
                    responseCode = response.status
                })
                .then(function(){
                    if (responseCode === 200) {
                        resolve(true)
                    } 
                    else if (responseCode === 401) {
                        alert('YOU ARE LOGGED OUT')
                        window.location.replace('http://localhost:3000/login-page')
                    }
                    else { 
                        alert("Please login to report!")
                        resolve(false) 
                    } })
        });
    }

    sendFriendRequest(receiver) {
        const requestOptions = {
            method: 'post',
            headers: { 
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
            },
            body: JSON.stringify({ rec_username: receiver})
        };
  
        return new Promise((resolve) => {
            var responseCode = 0;
            fetch('http://localhost:8000/api/friend-requests', requestOptions)
                .then(function(response) {
                    responseCode = response.status
                })
                .then(function(){
                    if (responseCode === 200) { resolve(true) }
                    else if (responseCode === 401) {
                        alert('YOU ARE LOGGED OUT')
                        window.location.replace('http://localhost:3000/login-page')
                    }
                    else { resolve(false) } 
                })
        });
    }

    getFriendRequests() {
        const requestOptions = {
            method: 'get',
            headers: { 
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
            },
        };

        return new Promise((resolve) => {
            var responseCode = 0;
            fetch('http://localhost:8000/api/friend-requests', requestOptions)
                .then(function(response) {
                    responseCode = response.status
                    return response.json()
                })
                .then(function(data){
                    if (responseCode === 200) { resolve(data) }
                    else if (responseCode === 401) {
                        alert('YOU ARE LOGGED OUT')
                        window.location.replace('http://localhost:3000/login-page')
                    }
                })
        });
    }

    getFriends() {
        const requestOptions = {
            method: 'get',
            headers: { 
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
            },
        };

        return new Promise((resolve) => {
            var responseCode = 0;
            fetch('http://localhost:8000/api/friends', requestOptions)
                .then(function(response) {
                    responseCode = response.status
                    return response.json()
                })
                .then(function(data){
                    if (responseCode === 200) { resolve(data) }
                    else if (responseCode === 401) {
                        alert('YOU ARE LOGGED OUT')
                        window.location.replace('http://localhost:3000/login-page')
                    }
                })
        });
    }

    acceptFriendRequest(username) {
        const requestOptions = {
            method: 'put',
            headers: { 
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
            },
            body: JSON.stringify({  friend_username: username,
                                    action: 0                                   
                                })
        };

        return new Promise((resolve) => {
            var responseCode = 0;
            fetch('http://localhost:8000/api/friend-requests', requestOptions)
                .then(function(response) {
                    responseCode = response.status
                })
                .then(function(){
                    if (responseCode === 200) { resolve(true) }
                    else if (responseCode === 401) {
                        alert('YOU ARE LOGGED OUT')
                        window.location.replace('http://localhost:3000/login-page')
                    }
                    else { resolve(false) }
                })
        });
    }

    declineFriendRequest(username) {
        const requestOptions = {
            method: 'put',
            headers: { 
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
            },
            body: JSON.stringify({  friend_username: username,
                                    action: 1                                   
                                })
        };

        return new Promise((resolve) => {
            var responseCode = 0;
            fetch('http://localhost:8000/api/friend-requests', requestOptions)
                .then(function(response) {
                    responseCode = response.status
                })
                .then(function(){
                    if (responseCode === 200) { resolve(true) }
                    else if (responseCode === 401) {
                        alert('YOU ARE LOGGED OUT')
                        window.location.replace('http://localhost:3000/login-page')
                    }
                    else { resolve(false) }
                })
        });
    }

    removeFriend(username) {
        const requestOptions = {
            method: 'put',
            headers: { 
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
            },
            body: JSON.stringify({ friend_username: username })
        };

        return new Promise((resolve) => {
            var responseCode = 0;
            fetch('http://localhost:8000/api/friends', requestOptions)
                .then(function(response) {
                    responseCode = response.status
                })
                .then(function(){
                    if (responseCode === 200) { resolve(true) }
                    else if (responseCode === 401) {
                        alert('YOU ARE LOGGED OUT')
                        window.location.replace('http://localhost:3000/login-page')
                    }
                    else { resolve(false) }
                })
        });
    }

    getUserBio() {
        const requestOptions = {
            method: 'get',
            headers: { 
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
            },
        };

        return new Promise((resolve) => {
            var responseCode = 0;
            fetch('http://localhost:8000/api/profile-bio', requestOptions)
                .then(function(response) {
                    responseCode = response.status
                    return response.json()
                })
                .then(function(data){
                    if (responseCode === 200) { resolve(data) }
                    else if (responseCode === 401) {
                        alert('YOU ARE LOGGED OUT')
                        window.location.replace('http://localhost:3000/login-page')
                    }
                    else { resolve(false) }
                })
        });
    }

    updateUserBio(profile_bio) {
        const requestOptions = {
            method: 'post',
            headers: { 
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
            },
            body: JSON.stringify({ bio: profile_bio })
        };

        return new Promise((resolve) => {
            var responseCode = 0;
            fetch('http://localhost:8000/api/profile-bio', requestOptions)
                .then(function(response) {
                    responseCode = response.status
                })
                .then(function(){
                    if (responseCode === 200) { resolve(true) }
                    else if (responseCode === 401) {
                        alert('YOU ARE LOGGED OUT')
                        window.location.replace('http://localhost:3000/login-page')
                    }
                    else { resolve(false) }
                })
        });
    }

    getUserImage() {
        const requestOptions = {
            method: 'get',
            headers: { 
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
            },
        };

        return new Promise((resolve) => {
            var responseCode = 0;
            fetch('http://localhost:8000/api/profile-image', requestOptions)
                .then(function(response) {
                    responseCode = response.status
                    return response.json()
                })
                .then(function(data){
                    if (responseCode === 200) { resolve(data) }
                    else if (responseCode === 401) {
                        alert('YOU ARE LOGGED OUT')
                        window.location.replace('http://localhost:3000/login-page')
                    }
                    else { resolve(false) }
                })
        });
    }

    updateUserImage(profile_image) {
        const requestOptions = {
            method: 'post',
            headers: { 
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
            },
            body: JSON.stringify({ image_url: profile_image })
        };

        return new Promise((resolve) => {
            var responseCode = 0;
            fetch('http://localhost:8000/api/profile-image', requestOptions)
                .then(function(response) {
                    responseCode = response.status
                })
                .then(function(){
                    if (responseCode === 200) { resolve(true) }
                    else if (responseCode === 401) {
                        alert('YOU ARE LOGGED OUT')
                        window.location.replace('http://localhost:3000/login-page')
                    }
                    else { resolve(false) }
                })
        });
    }

    updatePassword(updatePassword) {
        const requestOptions = {
            method: 'post',
            headers: { 
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
            },
            body: JSON.stringify({ new_password: updatePassword })
        };

        return new Promise((resolve) => {
            var responseCode = 0;
            fetch('http://localhost:8000/api/update-password', requestOptions)
                .then(function(response) {
                    responseCode = response.status
                })
                .then(function(){
                    if (responseCode === 200) { resolve(true) }
                    else if (responseCode === 401) {
                        alert('YOU ARE LOGGED OUT')
                        window.location.replace('http://localhost:3000/login-page')
                    }
                    else { resolve(false) }
                })
        });
    }
}