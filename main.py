import logging
from flask_sockets import Sockets
from werkzeug.serving import run_with_reloader
from werkzeug.debug import DebuggedApplication
from flask import Flask, render_template
from blueprints.lobby import lobby
from blueprints.room import room


logging.basicConfig(level=logging.DEBUG)
LOG = logging.getLogger('wstest')
LOG.setLevel(logging.DEBUG)

app = Flask(__name__, static_url_path='/static')
app.debug = True

sockets = Sockets(app)

app.register_blueprint(lobby, url_prefix=r'/lobby')
sockets.register_blueprint(room, url_prefix=r'/room')

@app.route('/')
def main():
    return render_template('index.html')

@run_with_reloader
def run_server():
    from gevent import pywsgi
    from geventwebsocket.handler import WebSocketHandler
    http_server = pywsgi.WSGIServer(('', 5000), DebuggedApplication(app), handler_class=WebSocketHandler, log=app.logger)
    http_server.serve_forever()


if __name__ == "__main__":
    run_server()
    test = 1
    from gevent import pywsgi
    from geventwebsocket.handler import WebSocketHandler
    app.debug = True
    app.logger.setLevel(logging.DEBUG)

    server = pywsgi.WSGIServer(('0', 5000), app, handler_class=WebSocketHandler, log=app.logger)


    server.serve_forever()
