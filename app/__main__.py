from .application import create_app
from flask_migrate import Migrate, MigrateCommand
from flask_script import Manager

if 'LIVE_STATUS_SETTINGS' not in os.environ:
    raise RuntimeError('settings must be provided via LIVE_STATUS_SETTINGS')

with open(os.environ['LIVE_STATUS_SETTINGS'], 'r') as f:
    settings = json.load(f)

application = create_app(settings)

manager = Manager(application)
manager.add_command('db', MigrateCommand)

migrate = Migrate(application, application.database)

if __name__ == '__main__':
    manager.run()
