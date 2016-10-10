from .application import Application
from flask_migrate import Migrate, MigrateCommand
from flask_script import Manager
from .dev.seed import Seed

application = Application.create(Application.environment_settings())

manager = Manager(application)
manager.add_command('db', MigrateCommand)
manager.add_command('seed-db', Seed)

migrate = Migrate(application, application.database)

if __name__ == '__main__':
    manager.run()
