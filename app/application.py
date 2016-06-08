import flask
import hashlib
import json
import os
import sqlalchemy
import time

from functools import wraps
from .database import Database

COMPONENT_UPDATE_HISTORY = 30 * 24 * 60 * 60


class Application(flask.Flask):
    def __init__(self, settings):
        super(Application, self).__init__(__name__)
        self.settings = settings
        self.config['SQLALCHEMY_DATABASE_URI'] = settings['database']
        self.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
        self.database = Database(self)

    def cache(self, seconds=60):
        def inner_decorator(f):
            @wraps(f)
            def wrapper(*args, **kwds):
                resp = f(*args, **kwds)
                if not isinstance(resp, flask.Response):
                    resp = flask.make_response(resp)
                resp.headers['Cache-Control'] = 'public, max-age={}'.format(seconds)
                resp.headers["Expires"] = time.strftime("%a, %d %b %Y %H:%M:%S GMT", time.gmtime(time.time() + seconds))
                resp.add_etag()
                return resp
            return wrapper
        return inner_decorator

    def require_api_token(self, f):
        @wraps(f)
        def wrapper(*args, **kwds):
            token = flask.request.headers.get('X-Live-Status-API-Token')
            if token != self.settings['api_token']:
                resp = flask.make_response(flask.jsonify({}), 403)
            else:
                resp = f(*args, **kwds)
                if not isinstance(resp, flask.Response):
                    resp = flask.make_response(resp)
            resp.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
            resp.headers['Pragma'] = 'no-cache'
            resp.headers['Expires'] = '0'
            return resp
        return wrapper

    @staticmethod
    def environment_settings():
        if 'LIVE_STATUS_SETTINGS' not in os.environ:
            raise RuntimeError('settings must be provided via LIVE_STATUS_SETTINGS')

        with open(os.environ['LIVE_STATUS_SETTINGS'], 'r') as f:
            return json.load(f)

    @staticmethod
    def create(settings):
        application = Application(settings)
        db = application.database

        @application.url_defaults
        def hashed_url_for_static_file(endpoint, values):
            if endpoint == 'static':
                filename = values.get('filename')
                if filename:
                    with open(os.path.join(application.static_folder, filename)) as f:
                        values['v'] = hashlib.sha1(f.read()).hexdigest()

        @application.route('/')
        @application.cache(seconds=5*60)
        def index():
            return flask.render_template('index.html.jinja')

        @application.route('/api/')
        @application.route('/api/v1/')
        @application.cache(seconds=5*60)
        def api():
            return flask.render_template('api.html.jinja')

        @application.route('/api/v1/components')
        @application.cache(seconds=30)
        def components():
            table = db.ComponentUpdate
            max_ids = db.session.query(sqlalchemy.sql.func.max(table.id)).group_by(table.component)
            updates = db.session.query(table).filter(table.id.in_(max_ids)).filter(table.time + table.lifetime >= time.time()).all()
            return flask.jsonify({
                'components': {update.component: {
                    'label': update.label,
                    'status': update.status,
                    'status_description': update.status_description,
                    'health': update.health,
                    'tags': [tag.strip() for tag in update.tags.split(',')]
                } for update in updates}
            })

        @application.route('/api/v1/components/<component>/updates', methods=['POST'])
        @application.require_api_token
        def put_component(component):
            table = db.ComponentUpdate
            update = table()
            update.component = component
            update.label = flask.request.form['label']
            update.status = flask.request.form['status']
            if 'status_description' in flask.request.form:
                update.status_description = flask.request.form['status_description']
            update.health = int(flask.request.form['health'])
            if update.health < 0 or update.health > 100:
                return 'health must be between 0 and 100', 400
            update.time = time.time()
            if 'tags' in flask.request.form:
                update.tags = flask.request.form['tags']
            update.lifetime = int(flask.request.form['lifetime']) if 'lifetime' in flask.request.form else (5 * 60)
            if update.lifetime < 5 or update.lifetime > 24 * 60 * 60:
                return 'lifetime must be between 5 seconds and 24 hours', 400
            db.session.add(update)
            db.session.query(table).filter(table.time + table.lifetime < time.time() - COMPONENT_UPDATE_HISTORY).delete()
            db.session.commit()
            return 'thanks' if update.health == 100 else 'get well soon'

        return application
