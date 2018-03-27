"use strict";

class GameMsgHandler {
    constructor(game_main) {
        this._game_main = game_main;
        this._msg_handlers = new Map();
    }

    _registerMsgHandler(msg_type, handler) {
        var self = this;
        this._msg_handlers.set(msg_type, handler);
    }

    handleMessage(message) {
        var type = message.type;
        var handler = this._msg_handlers.get(type);
        if (undefined === handler) {
            throw ("InGameLogic: Unknow message type " + type);
        }
        handler(message);
    }
}

export { GameMsgHandler };