from .application import Application
from flask_migrate import Migrate, MigrateCommand
from flask_script import Manager

application = Application.create(Application.environment_settings())

manager = Manager(application)
manager.add_command('db', MigrateCommand)

migrate = Migrate(application, application.database)

if __name__ == '__main__':
    manager.run()
