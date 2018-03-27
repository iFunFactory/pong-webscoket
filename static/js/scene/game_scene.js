"use strict";

import { GameConfig } from "../game_config.js";
import { Button } from "./button.js";


class GameScene {
    constructor(url_base) {
        this._player_blocks = Array(2);
        this._player_names = Array(2);
        this._player_scores = Array(2);
        this._ball = null;
        this.edges = Object();
        this._my_position = -1;
        this._url_base = url_base;

        this._on_edge_overlapped = function(player_position) {}

        this._on_start_clicked = undefined;

        this._update_block_pos_evt = undefined;
        this._on_update_block_pos = () => {};
        this._on_my_block_and_ball_collide = () => {};

        this._in_round = false;
    }

    get config() {
        return GameConfig
    }

    set my_position(pos) {
        this._my_position = pos;
    }

    set on_edge_overlapped(func) {
        if (func) {
            this._on_edge_overlapped = func;
        } else {
            this._on_edge_overlapped = () => {};
        }
    }

    set on_start_clicked(func) {
        this._on_start_clicked = func;
    }

    set on_block_pos_sync_timer(func) {
        if (func) {
            this._on_update_block_pos = func;
        } else {
            this._on_update_block_pos = () => {};
        }
    }

    set on_my_block_and_ball_collide(func) {
        if (func) {
            this._on_my_block_and_ball_collide = func;
        } else {
            this._on_my_block_and_ball_collide = () => {};
        }
    }

    get start_button() {
        return this._start_button;
    }

    get key() {
        return 'game';
    }

    showPlayer(position, val) {
        this._player_blocks[position].setVisible(val);
        this._player_names[position].setVisible(val);
    }

    onBlockPosSync() {
        if (this._on_update_block_pos) {
            var block = this._player_blocks[this._my_position];
            this._on_update_block_pos(
                block.x);
        }
    }

    onPlayerBlockAndBallCollide(ball, block, pos) {
        if (this._my_position == pos) {
            this._on_my_block_and_ball_collide(ball.x, ball.y, block.x);
        }
    }

    setPlayerBlockPos(position, x) {
        var block = this._player_blocks[position];
        block.setX(x);
    }

    setBallPos(x, y) {
        this._ball.setX(x);
        this._ball.setY(y);
    }

    setPlayerName(position, name) {
        this._player_names[position].setText(name);
    }

    setScoreVisible(val) {
        this._player_scores.forEach((e) => {
            e.setVisible(val);
        });
    }

    setScores(score_info) {
        this._player_scores[0].setText(score_info[0].toString());
        this._player_scores[1].setText(score_info[1].toString());
    }

    getSceneConfig() {
        return {
            key: this.key,
            preload: this.preload,
            create: this.create,
            update: this.update
        }
    }

    get preload() {
        var self = this;
        return function() {
            var this_scene = this;
            var base_url = self._url_base + '/static/';
            this_scene.load.setBaseURL(base_url);

            this_scene.load.spritesheet('button', 'assets/ui/flixel-button.png', {
                frameWidth: 80,
                frameHeight: 20
            });
            this_scene.load.bitmapFont('shortStack', 'assets/fonts/bitmap/shortStack.png', 'assets/fonts/bitmap/shortStack.xml');

            this_scene.load.image('sky', 'assets/skies/sky.png');
            this_scene.load.image('ball', 'assets/sprites/aqua_ball.png');
            this_scene.load.image('red', 'assets/particles/red.png');
            this_scene.load.image('block', 'assets/sprites/crate.png');
        }
    }

    get create() {
        var self = this;
        return function() {
            var this_scene = this;
            // Create world
            this_scene.add.image(400, 300, 'sky');

            self.createBall(this_scene);
            self.createPlayerBlocks(this_scene);
            self.createScoreBoard(this_scene);
            self.createEdges(this_scene);

            self.initCollider(this_scene);
            self.initOverlap(this_scene);

            self.cursors = this_scene.input.keyboard.createCursorKeys();

            var screen_size = self.config.screen_size;
            var x = (screen_size.width / 2);
            var y = (screen_size.height / 2);
            self._start_button = new Button(this_scene, 'Start', 'Start', 300, y, function() {
                self._on_start_clicked();
            });
            self._start_button.setVisible(false);

            this_scene.time.addEvent({
                delay: 20,
                loop: true,
                callback: () => {
                    self.onBlockPosSync();
                }
            });

            self.resetRound();
        }
    }

    get update() {
        var self = this;
        return function() {
            var this_scene = this;
            var player_block = self._player_blocks[self._my_position];
            if (self._in_round) {
                if (self.cursors.left.isDown && 0 < player_block.x) {
                    player_block.setVelocityX(-350);

                } else if (self.cursors.right.isDown &&
                    (player_block.x + player_block.displayWidth) < self.config.screen_size.width) {
                    player_block.setVelocityX(350);
                } else {
                    player_block.setVelocityX(0);
                }
            } else {
                player_block.setVelocityX(0);
            }
        }
    }

    resetGame() {
        this.resetRound();
        this._ball.setMaxVelocity(100, 400);
        this._in_round = false;
        var block_pos_and_size = this.config.player_block_pos_size;
        for (var i = 0; i < block_pos_and_size.length; ++i) {
            var pos_and_size = block_pos_and_size[i];
            this.setPlayerBlockPos(i, pos_and_size.x);
        }

    }

    resetRound() {
        var screen_size = this.config.screen_size;
        this._ball.setVelocity(0, 0);
        this._ball.setBounce(1, 1.03);
        this._ball.setPosition(screen_size.width / 2, screen_size.height / 2);
        this._ball.setVisible(false);
        this._ball_emitter.setVisible(false);
        this._in_round = false;
    }

    startRound() {
        this.resetRound();
        this._ball.setVelocity(200, 200);
        this._ball.setVisible(true);
        this._ball_emitter.setVisible(true);
        this._in_round = true;
    }

    createBall(this_scene) {
        var screen_size = this.config.screen_size;

        var particles = this_scene.add.particles('red');

        var emitter = particles.createEmitter({
            speed: 100,
            scale: {
                start: 1,
                end: 0
            },
            blendMode: 'ADD'
        });

        var ball = this_scene.physics.add.image(
            screen_size.width / 2, screen_size.height / 2, 'ball');

        ball.body.enable = true;
        emitter.startFollow(ball);

        this._ball = ball;
        this._ball_emitter = emitter;
    }

    createPlayerBlocks(this_scene) {
        var block_pos_and_size = this.config.player_block_pos_size;
        for (var i = 0; i < block_pos_and_size.length; ++i) {
            var pos_and_size = block_pos_and_size[i];
            var block = this_scene.physics.add.sprite(
                pos_and_size.x, pos_and_size.y, 'block');
            block.body.enable = true;
            block.body.bounce.y = 1.5;
            block.body.immovable = true;
            block.setOrigin(0, 0);
            block.setDisplaySize(pos_and_size.width, pos_and_size.height);

            // block.setDebug(true, true, true);
            block.setVisible(false);

            this._player_blocks[i] = block;
        }
    }

    createScoreBoard(this_scene) {
        var board_pos_and_size = this.config.scoreboard_pos;
        for (var i = 0; i < board_pos_and_size.length; ++i) {
            var pos_and_size = board_pos_and_size[i].name;
            var name_text = this_scene.add.text(pos_and_size.x, pos_and_size.y, "player", { fontFamily: "Arial Black", fontSize: 25, color: "#660066" });
            name_text.setAlign('center');
            name_text.setWordWrapWidth(pos_and_size.height, false);
            name_text.setVisible(false);

            this._player_names[i] = name_text;

            var pos_and_size = board_pos_and_size[i].score;
            var score_text = this_scene.add.text(pos_and_size.x, pos_and_size.y, "0", {
                fontSize: 18,
                fontFamily: 'Arial',
                color: '#009900'
            });
            score_text.setAlign('center');
            score_text.setWordWrapWidth(pos_and_size.height, false);
            score_text.setVisible(true);

            this._player_scores[i] = score_text;

        }
    }

    createEdges(this_scene) {
        var edges_pos_and_size = this.config.edge_pos_size;

        function createEdge(pos_and_size) {
            var edge = this_scene.physics.add.sprite(pos_and_size.x, pos_and_size.y, 'sky');
            edge.body.enable = true;
            edge.body.immovable = true;
            edge.setOrigin(0, 0);
            edge.setDisplaySize(pos_and_size.width, pos_and_size.height);
            return edge;
        }
        this.edges.left = createEdge(edges_pos_and_size.left);
        this.edges.right = createEdge(edges_pos_and_size.right);
        this.edges.top = createEdge(edges_pos_and_size.top);
        this.edges.bottom = createEdge(edges_pos_and_size.bottom);
    }

    initCollider(this_scene) {
        var ball = this._ball;
        var self = this;
        this._player_blocks.forEach(function(block, pos) {
            this_scene.physics.add.collider(ball, block,
                (ball, block) => { self.onPlayerBlockAndBallCollide(ball, block, pos); },
                null, null
            );
        });
        this_scene.physics.add.collider(ball, this.edges.left);
        this_scene.physics.add.collider(ball, this.edges.right);
    }

    initOverlap(this_scene) {
        var self = this;
        this_scene.physics.add.overlap(this._ball, this.edges.top, function() {
            // player positon 은 아랫쪽이 0
            self._on_edge_overlapped(1);


        });
        this_scene.physics.add.overlap(this._ball, this.edges.bottom, function() {
            // player positon 은 아랫쪽이 0
            self._on_edge_overlapped(0);
        });
    }
};

export { GameScene };