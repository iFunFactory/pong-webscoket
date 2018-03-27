import jwt
import datetime
import copy

jwt_opt = {
    'key': 'pong',
    'algorithm': 'HS256'
}

def encode_jwt(data, decode_utf8=True, expire_sec=60*5):
    p = copy.deepcopy(data)
    p['exp'] = datetime.datetime.now().timestamp() + expire_sec
    ret= jwt.encode(
        data, **jwt_opt)
    if decode_utf8:
        ret = ret.decode('utf-8')

    return ret


def decode_jwt(token):
    return jwt.decode(token, **jwt_opt)