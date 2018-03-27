import logging
from common.errors import RoomError, ProtocolError
from logic.room.msg_handler import MsgHandlerBase
from logic.room.in_game_logic import InGameLogic
from common.message import *


LOG = logging.getLogger(__name__)

class Room(MsgHandlerBase):
    def __init__(self, room_no):
        super().__init__()
        self._players = {0: None, 1: None}
        self._room_no = room_no

        self._in_game_logic = InGameLogic(self)
        self._in_game_logic.clear()

        self._register_handler(CSMessageTypes.start_game, self._onStartGame)

    @property
    def room_no(self):
        return self._room_no

    def is_joinable(self):
        return None is not self._find_empty_player_slot()

    def _find_empty_player_slot(self):
        for k,v in self._players.items():
            if None is v:
                return k
        return None

    def add_player(self, player):
        empty_slot = self._find_empty_player_slot()
        if None is empty_slot:
            LOG.warning('Room is fool. room info : {}'.foirmat(str(self)))
            return False

        self._players[empty_slot] = player
        player.position = empty_slot

        def msg_handler(pl, msg):
            self.handle_message(pl, msg)

        player.set_msg_handler(msg_handler)
        player.register_room(self)

        other_player = [{'position': p.position,'name': p.name}
                        for _, p in self._players.items()
                        if p is not None and p is not player]

        player.send_msg(
            build_response(
                SCMessageTypes.entered_room,
                'ok',{'position': player.position,
                      'name': player.name,
                      'other_player' :other_player})
        )

        self.broadcast(build_notify(SCMessageTypes.enter_room_ntf, {
                    'name': player.name, 'position': player.position
                }), player)
        return True

    def remove_player(self, player):
        LOG.debug('Remoe player {} from {}'.format(player, self))
        position = player.position
        if None is self._players[position]\
            or self._players[player.position] is not player:
            LOG.debug('Error on removeplayer')
            raise RoomError(
                self,
                'Removeplayer err. Cannot find player {}'.format(player))

        self._players[position] = None
        self._in_game_logic.clear()

        player.on_exited_room()
        LOG.debug('Send Leaveplayerntf...')
        self.broadcast(build_notify(
            SCMessageTypes.player_leave_ntf,
            {
                'position': position
            }
        ))

    @property
    def player_count(self):
        return len([p for k, p in self._players.items() if p is not None])

    def handle_message(self, player, msg):
        LOG.debug('Msg recved from {} : {}'.format(player, msg))
        if MsgReservedField.type_field not in msg:
            raise ProtocolError(msg, 'Type field is missing')

        if self._in_game_logic.is_in_game:
            return self._in_game_logic.handle_message(player, msg)
        else:
            self._msg_handlers[msg[MsgReservedField.type_field]](player, msg)

    def broadcast(self, msg, except_player=None):
        for pos, player in self._players.items():
            if player and player is not except_player:
                player.send_msg(msg)

    def _onStartGame(self, player, msg):
        if self.player_count < 2:
            raise RoomError(self, 'Cannot start game. Room is not full')

        if self._in_game_logic.is_in_game:
            raise RoomError(self, 'Game has been started already')

        self._in_game_logic.start_game()


    def __str__(self):
        info = {
            'room_no': self._room_no,
            'players': { pos: str(player)
                         for pos, player in self._players.items() }
        }
        return json.dumps(info)