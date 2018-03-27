"use strict";

import { GameConfig } from "../game_config.js";
import { GameMsgHandler } from "./game_msg_handler.js";
import { GameState } from "./game_state.js";


class InGameLogic extends GameMsgHandler {
    constructor(game_main, game_view) {
        super(game_main);
        this._state = "InGame";
        this.config = GameConfig;
        this._game_view = game_view;
        this._game_scene = game_view.game_scene;
        this._ui_scene = game_view.ui_scene;
        this._game_state = new GameState();
        this._in_round = false;

        var self = this;
        this._game_scene.on_edge_overlapped = (loser_pos) => {

            if (this._in_round && loser_pos == this._game_main.my_position) {
                this._game_main.sendMessage({
                    type: 'RoundEnd',
                    loser_pos: loser_pos
                })
            }
            this._in_round = false;
        }

        this._last_my_block_pos_x = -100;
        this._registerMsgHandler("BlockPosNtf", (msg) => {
            this._onBlockPosNtf(msg);
        });

        this._registerMsgHandler("BallBlockCollideNtf", (msg) => {
            this._onBallBlockCollideNtf(msg);
        });

        this._registerMsgHandler("RoundEndNtf", (msg) => {
            this._onRoundEndNtf(msg);
        });
        this._registerMsgHandler("PlayerLeaveNtf", (msg) => {
            this._onPlayerLeaveNtf(msg);
        });
    }

    isValidPosition(position) {
        return (0 <= position && position <= 1);
    }

    startGame() {
        this.resetGame();
        this.onGameStarted();
        this._ui_scene.showStatusText(false);
        this._game_scene.setScores(this._game_state.scores);

        this._in_round = true;
        this._game_scene.startRound();

        this._game_scene.on_block_pos_sync_timer = (x) => {
            if (1 < Math.abs(this._last_my_block_pos_x - x)) {
                this._game_main.sendMessage({
                    type: 'SyncBlockPos',
                    x: x
                });
                this._last_my_block_pos_x = x;
            };
        }

        this._game_scene.on_my_block_and_ball_collide =
            (ball_x, ball_y, block_x) => {
                this._game_main.sendMessage({
                    type: 'SyncBallBlockCollide',
                    ball_pos: [ball_x, ball_y],
                    block_x: block_x
                })
            };
    }

    onGameStarted() {

        this._game_scene.start_button.setVisible(false);
    }

    startNextRound() {
        this._in_round = true;
        this._game_scene.startRound();
    }

    processEndGame() {
        this._game_scene.on_block_pos_sync_timer = (x) => {};
        this._game_scene.on_my_block_and_ball_collide = () => {};
        this._game_scene.resetGame();
    }

    resetGame() {
        this._game_state.resetScores();
    }

    //message handlers
    _onBlockPosNtf(msg) {
        this._game_scene.setPlayerBlockPos(msg.position, msg.x);
    }

    _onBallBlockCollideNtf(msg) {
        this._game_scene.setPlayerBlockPos(msg.position, msg.block_x);
        this._game_scene.setBallPos(msg.ball_pos[0], msg.ball_pos[1]);
    }

    _onRoundEndNtf(msg) {
        var is_game_end = msg.winner !== undefined && msg.winner !== null;

        this._game_state.setScores(msg.score_info);
        this._game_scene.setScores(this._game_state.scores);

        if (is_game_end) {
            this.processEndGame();
            var result_text = this._game_main.players.get(msg.winner).name + " Wins!";
            this._ui_scene.setStausText(result_text);
            this._ui_scene.showStatusText(true);
            this._game_main.onEndGame();
        } else {
            this.startNextRound(msg.score_info);
        }
    }

    _onPlayerLeaveNtf(msg) {
        this.processEndGame();
        var game_scene = this._game_view.game_scene;

        game_scene.setPlayerName(msg.position, "");
        game_scene.showPlayer(msg.position, false);
        this._game_main.onOpponentLeave(msg.position);

    }
};

export { InGameLogic };