import sessions from "./dummyData/sessions.json"
import sessionsFiltered from "./dummyData/sessionsFiltered.json"
import games from "./dummyData/games.json"

let localSave = {
    newSesisonID: sessions.length + 1,
};

export class APIDummy {

    /**
     * A function to get all games
     * @returns A list of all games
     */
    getGames() {
        return games
    }

    /**
     * A function to get deatils of a game
     * @param id - The game ID
     * @returns - The full details of a game with matching ID
     */
    getGame(id) {

        // filter the games for matching id
        let path = this.getGames().filter(games => {
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
    getSessions(filter) {

        // Statement to mock filtered data vs non-filtered data
        if (filter.length > 0) {
            return sessionsFiltered;
        } else {
            return sessions;
        } 
    }

    /**
     * A function to get details of a session
     * @param id - The session ID
     * @returns - The full details of a session with matching ID
     */
    getSession(id) {

        // filter the sessions for matching id
        let session = this.getSessions([]).filter(sessions => {
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

        // simulate different images for different games
        let gameImagePath;
        if (formGame === 1) {
            gameImagePath = "../assets/img/uriel-soberanes.jpg";
        } else {
            gameImagePath = "../assets/img/login-image.jpg";
        }

        // 99 max player to simulate error creating by returning 0
        if (formMaxPlayers === 99) {
            return 0;
        } else {
            let jsonData = {
                "id": localSave.newSesisonID,
                "hostID": 1,
                "hostUsername": "Ken",
                "gameID": formGame,
                "gameImagePath": gameImagePath,
                "sessionName": formName,
                "sessionDescription": formDescription,
                "joinDescription": formHiddenDescription,
                "full": false,
                "maxPlayers": formMaxPlayers,
                "players": [
                    {
                        "userID": 1,
                        "username": "Ken"
                    }
                ]
            }

            // increment sessionID for next create
            localSave.newSesisonID++;
            
            // push data to api and return new id from api
            sessions.push(jsonData)
            return jsonData.id;
        }
    }

    /**
     * A function to join a session for a user
     * @param sessionID - The session id of the session the user is joining to
     * @param username - The username of the user that is joining
     * @returns - Boolean, true if user joins successfully and false otherwise
     */
    joinSession(sessionID, username) {

        // simulate joining session by finding the session with the matching id
        let session = this.getSession(sessionID);

        // if session is full, return false, else true
        if (session.full) {
            return false;
        } else {
            return true;
        }
    }

    /**
     * A function to leave a session for a user
     * @param sessionID - The session id of the session the user is leaving from
     * @param username - The username of the user that is leaving
     */
    leaveSession(sessionID, username) {

        // return null as no return is expected
        return null;
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

}