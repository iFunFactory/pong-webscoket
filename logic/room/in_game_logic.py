from common.message import *
from common.errors import ProtocolError
from logic.room.msg_handler import MsgHandlerBase
import logging
from config import Config

LOG = logging.getLogger(__name__)


class InGameState:

    def __init__(self, room):
        self._room = room

        self.clear()

    def clear(self):
        self._scores = [0, 0]
        self._round = 0

    @property
    def scores(self):
        return self._scores

    def update_score(self, loser_pos):
        pos = 0 if 1 == loser_pos else 1
        self._scores[pos] = self._scores[pos] + 1

    def is_game_end(self):
        return Config.GameScore <= max(self._scores)


    def get_winner(self):
        if not self.is_game_end():
            return None

        return 0 if Config.GameScore <= self._scores[0] else 1



class InGameLogic(MsgHandlerBase):
    def __init__(self, room):
        super().__init__()
        self._room = room
        self._game_state = InGameState(room)
        self._game_state.clear()
        self._is_in_game = False

        self._register_handler(
            CSMessageTypes.sync_block_pos, self._on_block_pos_sync)

        self._register_handler(
            CSMessageTypes.ball_block_collide, self._on_ball_block_collide)

        self._register_handler(
            CSMessageTypes.round_end, self._on_round_end)

    @property
    def is_in_game(self):
        return self._is_in_game

    @is_in_game.setter
    def is_in_game(self, val):
        self._is_in_game = val

    def clear(self):
        self.is_in_game = False
        self._game_state.clear()

    def start_game(self):

        self.clear()
        self.is_in_game = True
        self._room.broadcast(
            build_notify(
                SCMessageTypes.start_game_ntf,
                {}
            )
        )

    def _on_game_end(self):
        self.clear()

    # msg handlers

    def _on_block_pos_sync(self, player, msg):
        self._room.broadcast(build_notify(
            SCMessageTypes.block_pos_ntf,
            {
                'position': player.position,
                'x': msg['x']
            }
        ), player)

    def _on_ball_block_collide(self, player, msg):
        msg['position'] = player.position
        self._room.broadcast(build_notify(
            SCMessageTypes.ball_block_collide_ntf,
            {
                'position': player.position,
                'ball_pos': msg['ball_pos'],
                'block_x': msg['block_x']
            }
        ), player)

    def _on_round_end(self, player, msg):
        loser_pos = msg['loser_pos']

        self._game_state.update_score(loser_pos)

        winner = None
        if self._game_state.is_game_end():
            winner = self._game_state.get_winner()
        score_info = self._game_state.scores

        if None is not winner:
            LOG.debug('Game end')
            self._on_game_end()


        self._room.broadcast(
            build_notify(
                SCMessageTypes.round_end_ntf,
                {
                    'score_info': score_info,
                    'winner': winner
                }
            )
        )


