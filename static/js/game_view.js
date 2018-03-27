"use strict";

import { GameConfig } from "./game_config.js";
import { GameScene } from "./scene/game_scene.js";
import { UIScene } from "./scene/ui_scene.js";

class GameView {
    constructor(url_base) {
        this.config = GameConfig;
        this._game_scene = new GameScene(url_base);
        this._ui_scene = new UIScene(url_base);
        this._phaser_game = null;
        this._url_base = url_base;
    }

    get game_scene() {
        return this._game_scene;
    }

    get ui_scene() {
        return this._ui_scene;
    }

    get game() {
        return this._phaser_game;
    }

    getPhaserConfig(screen_parent) {
        var screen_size = this.config.screen_size;
        var scene_config = [this.game_scene.getSceneConfig(),
            this.ui_scene.getSceneConfig()
        ];
        return {
            key: 'game',
            type: Phaser.CANVAS,
            parent: screen_parent,
            width: screen_size.width,
            height: screen_size.height,
            debugShowBody: false,
            physics: {
                default: 'arcade',
                arcade: {
                    gravity: {
                        y: 0
                    },
                    debugShowBody: false
                }
            },
            debug: false,
            scene: scene_config,
            callbacks: {
                postBoot: this.postBoot
            }
        };

    }

    get postBoot() {
        var self = this;
        return function() {
            self._phaser_game.scene.start(self.ui_scene.key);
        }
    }

    isActive() {
        if (this.game) {
            var ret = true;
            this.game.scene.scenes.forEach(function(s) {
                ret = ret && s.sys.isActive();
            });
            return ret;
        }

        return false;
    }

    init(screen_canvas) {
        this.destroyPhaser();
        var game = new Phaser.Game(this.getPhaserConfig(screen_canvas));
        this._phaser_game = game;
        this._game_scene.my_position = 0;
    }

    destroyPhaser() {
        if (this._phaser_game) {
            this._phaser_game.destroy();
            this._phaser_game = null;
        }
    }
};


export { GameView };