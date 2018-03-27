from common.message import *
from common.errors import ProtocolError


class MsgHandlerBase:
    def __init__(self):
        self._msg_handlers = dict()

    def _register_handler(self, msg_type, handler):
        self._msg_handlers[msg_type] = handler

    def handle_message(self, player, msg):
        if MsgReservedField.type_field not in msg:
            raise ProtocolError(msg, 'Type field is missing')

        msg_type = msg[MsgReservedField.type_field]

        if msg_type not in self._msg_handlers:
            raise ProtocolError(msg, 'Cannot find msg handler')

        self._msg_handlers[msg_type](player, msg)