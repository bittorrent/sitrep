from .application import application
from flask_migrate import Migrate, MigrateCommand
from flask_script import Manager

manager = Manager(application)
manager.add_command('db', MigrateCommand)

migrate = Migrate(application, application.database)

if __name__ == '__main__':
    manager.run()
