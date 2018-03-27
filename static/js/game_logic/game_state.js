"use strict";

class GameState {
    constructor() {
        this._round = 0;
        this._scores = [0, 0];
    }

    clear() {
        this._round = 0;
        this.resetScores();
    }

    get scores() {
        return this._scores
    }

    set scores(val) {
        this._scores = val;
    }

    resetScores() {
        this._scores = [0, 0];
    }

    setScores(score) {
        this._scores = score;
    }
}

export { GameState };