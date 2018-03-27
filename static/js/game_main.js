"use strict";

import { GameView } from "./game_view.js";
import { InGameLogic } from "./game_logic/in_game_logic.js";
import { WaitingForGameLogic } from "./game_logic/waiting_for_game_logic.js";

``
class Player {
    constructor(position, name) {
        this.name = name;
        this.position = position;
    }
}

class GameMain {
    constructor(url_base, on_con_closed) {
        this._url_base = url_base;
        this._ws = null;
        this._my_position = undefined;
        this._on_con_closed = on_con_closed;
        this.clear();
    }

    clear() {
        this._game_logic = null;
        this._on_entered_room = null;
        this._players = new Map();
    }

    setPlayer(position, name, is_me) {
        this._players.set(position, new Player(position, name));
        if (is_me) {
            this._my_position = position;
            this._game_view.game_scene.my_position = position;
        }
    }

    removePlayer(position) {
        this._players.delete(position);
    }

    get my_position() {
        return this._my_position;
    }

    get players() {
        return this._players;
    }

    initConnection(url) {
        if (null !== this._ws) {
            this._ws.close();
        }

        this._ws = new WebSocket(url);
        this._msg_queue = Array();

        var self = this;
        this._ws.onopen = function() {
            self.onSocketOpen();
        }

        this._ws.onmessage = function(evt) {
            try {
                self.onSocketMessage(JSON.parse(evt.data));
            } catch (e) {
                console.error(e);
            }

        }

        this._ws.onclose = function() {
            self.onSocketClose();
        }

        this._ws.onerror = function(evt) {
            self.onSocketError(evt);
        }
    }

    onSocketOpen() {
        var socket = this._ws;
        this._msg_queue.forEach(function(elem) {
            socket.send(elem);
        });
        this._msg_queue = Array();
    }

    onSocketMessage(msg) {
        this._game_logic.handleMessage(msg);
    }

    onSocketClose() {
        if (this._on_con_closed) {
            this._on_con_closed();
        }
    }

    onSocketError(evt) {
        console.error('Socket error ');
        console.error(evt);
        if (this._on_con_closed) {
            this._on_con_closed();
        }
    }

    sendMessage(message) {
        if (!message) {
            console.error('message is empty');
        }
        var sock_state = this._ws.readyState;
        var msg = message;
        if (typeof message == "object") {
            msg = JSON.stringify(message);
        }

        if (0 == sock_state) {
            this._msg_queue.push(msg);
        } else {
            this._ws.send(msg);
        }
    }

    changeGameLogic(new_state) {
        if ("InGame" == new_state) {
            this._game_logic = new InGameLogic(this, this._game_view);
        } else if ("WaitingForGame" == new_state) {
            this._game_logic = new WaitingForGameLogic(this, this._game_view)
        } else {
            throw ("Invalid game state " + new_state);
        }
    }

    enterRoom(room_no, token, player_name, on_entered_room) {
        var data = {
            type: 'EnterRoom',
            room_no: room_no,
            token: token,
            name: player_name
        }
        this._on_entered_room = on_entered_room;
        this.sendMessage(data);
    }

    exitRoom() {
        this._ws.close();
    }

    isScenesActive() {
        return this._game_view.isActive();
    }

    createGame() {
        this.clear();
        var game_view = new GameView(this._url_base);
        var game_screen = $('div.game-screen')[0];
        game_view.init(game_screen);
        this._game_view = game_view;

        this.changeGameLogic("WaitingForGame");
    }

    startGame() {
        this.changeGameLogic("InGame");
        this._game_logic.startGame()
    }

    onEndGame() {

        this.changeGameLogic("WaitingForGame");
        this._game_logic.checkAndShowStartBtn();
    }

    onOpponentLeave(position) {
        this.removePlayer(position);
        this.onEndGame();
    }

    destroy() {
        this._game_view.destroyPhaser();
    }
}

export { GameMain };