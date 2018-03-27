class PongError(Exception):
    pass


class RoomError(PongError):
    def __init__(self, room, msg, **kwargs):
        err_msg = '{} room info : {}'.format(msg, room)
        super().__init__(err_msg, **kwargs)


class PlayerError(PongError):
    def __init__(self, player, msg, **kwargs):
        err_msg = '{} player info : {}'.format(msg, player)
        super().__init__(err_msg, **kwargs)


class LobbyError(PongError):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)


class ProtocolError(PongError):
    def __init__(self, payload, msg, **kwargs):
        err_msg = '{} message: {}'.format(msg, payload)
        super().__init__(err_msg, **kwargs)


class UnexpectedProtocolError(ProtocolError):
    def __init__(self, payload, expected, **kwargs):
        err_msg = 'Unexpected payload type {}'.format(expected)
        super().__init__(payload, err_msg, **kwargs)