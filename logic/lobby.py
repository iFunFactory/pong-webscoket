from .room import Room
from common import jwt_token
from common import errors

class Lobby():
    def __init__(self):
        self._rooms = list()
        for i in range(0,10):
            self._rooms.append(Room(i))

    @property
    def rooms(self):
        return self._rooms

    def create_room(self):
        room_no = len(self._rooms)
        r = Room(room_no)
        self._rooms.append(r)
        return r

    def get_joinable_room(self):
        rooms = [ r for r in self._rooms if r.is_joinable()]
        if rooms:
            return rooms[0]
        else:
            return self.create_room()

    def process_enter_room(self, player, room_no, token):
        tok_info = jwt_token.decode_jwt(token)
        if tok_info['room_no'] != room_no:
            raise errors.LobbyError('Invalid token')

        room = self._rooms[room_no]
        # ToDo : 방이 꽉 차 있으면 에러 전달
        room.add_player(player)
        return True;



