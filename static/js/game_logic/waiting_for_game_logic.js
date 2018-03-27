"use strict";

import { GameConfig } from "../game_config.js";
import { GameMsgHandler } from "./game_msg_handler.js";

class WaitingForGameLogic extends GameMsgHandler {
    constructor(game_main, game_view) {
        super(game_main);
        this._state = "WaitingForGame";
        this.config = GameConfig;
        this._game_view = game_view;

        this._game_view._game_scene.on_start_clicked = () => { this.startGame(); }

        this._registerMsgHandler("EnteredRoom", (msg) => { this._onEnteredRoom(msg); });
        this._registerMsgHandler("EnteredRoomNtf", (msg) => { this._onEnteredRoomNtf(msg); });
        this._registerMsgHandler("StartGameNtf", (msg) => { this._onStartGameNtf(msg); });
        this._registerMsgHandler("PlayerLeaveNtf", (msg) => { this._onPlayerLeaveNtf(msg); });
    }

    startGame() {
        this._game_main.sendMessage({
            type: 'StartGame'
        });
    }

    checkAndShowStartBtn() {
        if (2 <= this._game_main.players.size &&
            0 == this._game_main.my_position) {

            this._game_view.game_scene.start_button.setVisible(true);
        } else {
            this._game_view.game_scene.start_button.setVisible(false);
        }
    }

    _onStartGameNtf() {
        this._game_main.startGame();
    }

    _onEnteredRoom(msg) {
        console.log('WaitingGame onenteredroom');
        var my_position = msg.position;
        var other_player = msg.other_player;
        var game_scene = this._game_view.game_scene;

        this._game_main.setPlayer(msg.position, msg.name, true);
        game_scene.setPlayerName(msg.position, msg.name);
        game_scene.showPlayer(msg.position, true);

        other_player.forEach((elem) => {
            this._game_main.setPlayer(elem.position, elem.name, false);
            game_scene.setPlayerName(elem.position, elem.name);
            game_scene.showPlayer(elem.position, true);
        });

        this._game_main._on_entered_room();
        this.checkAndShowStartBtn();
    }

    _onEnteredRoomNtf(msg) {
        console.log('WaitingGame onenteredroomntf');
        var game_scene = this._game_view.game_scene;

        this._game_main.setPlayer(msg.position, msg.name, false);
        game_scene.setPlayerName(msg.position, msg.name);
        game_scene.showPlayer(msg.position, true);

        this.checkAndShowStartBtn();
    }

    _onPlayerLeaveNtf(msg) {
        var game_scene = this._game_view.game_scene;


        game_scene.setPlayerName(msg.position, "");
        game_scene.showPlayer(msg.position, false);

        this._game_main.onOpponentLeave(msg.position);
    }

};

export { WaitingForGameLogic };