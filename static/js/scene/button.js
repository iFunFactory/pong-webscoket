"use strict";

class Button {
    constructor(scene, name, text, x, y, on_click) {
        this.on_click_handler = on_click;
        var button = scene.add.image(x, y, 'button', 1).setInteractive();
        button.name = name;
        button.setScale(4, 3);
        this._button = button;

        var text = scene.add.bitmapText(x - 40, y - 20, 'shortStack', text, 34);
        text.x += (button.width - text.width) / 2;
        this._text = text;

        var btn_group = scene.add.group();
        btn_group.add(button);
        btn_group.add(text);
        this._btn_group = btn_group;

        var self = this;
        scene.input.on('gameobjectover', function(pointer, btn) {
            if (btn.key == self._button.key)
                self.setButtonFrame(0);
        });

        scene.input.on('gameobjectout', function(pointer, btn) {
            if (btn.key == self._button.key)
                self.setButtonFrame(1);
        });
        scene.input.on('gameobjectdown', function(pointer, btn) {
            if (btn.key == self._button.key) {
                self.setButtonFrame(2);
                self.on_click_handler();
            }

        }, scene);
        scene.input.on('gameobjectup', function(pointer, btn) {
            if (btn.key == self._button.key)
                self.setButtonFrame(0);
        });

    }

    setVisible(value) {
        this._btn_group.getChildren().forEach(function(elem) {
            elem.setVisible(value);
        });
    }

    setButtonFrame(frame) {
        this._button.frame = this._button.scene.textures.getFrame('button', frame);
    }
};

export { Button };