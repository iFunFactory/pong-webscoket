from flask import Blueprint
from logic import lobby_instance, Player
from common.message import CSMessageTypes
from common import errors, message
import logging
import json

LOG = logging.getLogger(__name__)


room = Blueprint(r'room', __name__)


@room.route('/')
def handle_room(socket):
    try:
        msg = json.loads(socket.receive())
        LOG.debug('handle_room socket opened. message : {}'.format(msg))
        if not message.MsgReservedField.type_field in msg or\
            CSMessageTypes.enter_room != msg['type']:
            raise errors.ProtocolError(msg, 'Invalid enterroomreq')
        room_no = msg['room_no']
        player = Player(msg['name'], socket)
        token = msg['token']

        if(lobby_instance.process_enter_room(player, room_no, token)):
            while not socket.closed:
                msg = socket.receive()
                if None is msg:
                    raise Exception('Socket closed')

                LOG.info('Message received. player : {} msg: {}'.format(player, msg))
                msg = json.loads(msg)
                player.process_message(msg)
        else:
            raise Exception('Room is full')

    except Exception as e:
        import traceback
        traceback.print_exc()
        err_msg = 'Handling room msg Error : {}'.format(e)
        LOG.error(err_msg)

        LOG.info('{} is leaving room due to error...'.format(player))
        try:
            player.exit_room()
            socket.close()
        except Exception as e:
            LOG.info('exit room error {}'.format(e))
            pass

        return str(e)

