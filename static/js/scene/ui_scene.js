"use strict";

import { Button } from "./button.js";

class UIScene {
    constructor(url_base) {
        this._url_base = url_base;
    }

    get key() {
        return 'ui';
    }

    getSceneConfig() {
        return {
            key: this.key,
            create: this.create
        }
    }

    showStatusText(val) {
        this._center_text.setVisible(val);
    }

    setStausText(text) {
        this._center_text.setText(text);
    }

    get create() {
        var self = this;
        return function() {
            var this_scene = this;
            var text = this_scene.add.text(150, 150, "", {
                fill: 'rgba(0,255,0,1)',
                color: '#000066',
                fontSize: 40,
                fixedWidth: 400,
                fixedHeight: 100
            });

            text.setAlign('center');
            text.setWordWrapWidth('400', false);
            text.setVisible(true);
            self._center_text = text;

        }
    }

};

export { UIScene };