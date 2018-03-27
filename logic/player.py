import json
import logging
from common.errors import PlayerError

LOG = logging.getLogger(__name__)

class Player:
    def __init__(self, name, ws):
        self._name = name
        self._position = None
        self._room = None
        self._ws = ws

    @property
    def name(self):
        return self._name

    @property
    def position(self):
        return self._position

    @position.setter
    def position(self, pos):
        self._position = pos

    def register_room(self, room):
        LOG.debug('=============register room : {}'.format(room))
        self._room = room

    def exit_room(self):
        LOG.debug('Exiting {}. self : {}'.format(self._room, self))
        if None is self._room:
            LOG.debug('Try to exit room, but room is empty')
            raise PlayerError(self, 'Not in room.')

        self._room.remove_player(self)
        LOG.debug('=============clear room  on exit_room: {}'.format('None'))
        self._room = None

    def on_exited_room(self):
        self._ws.close()

    def send_msg(self, msg):
        self._ws.send(msg)


    def set_msg_handler(self, handler):
        self._handle_msg = handler
        
    def process_message(self, msg):
        if None is self._handle_msg:
            raise ValueError('handle_msg is not set')
        self._handle_msg(self, msg)

    def __str__(self):
        info = {
            'name': self._name,
            'position': self._position,
            'room': self._room.room_no if None is not self._room else 'None'
        }

        return json.dumps(info)
