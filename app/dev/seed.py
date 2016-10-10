from flask_script import Command
import time
import datetime
import flask

class Seed(Command):

    def saveData(self, data, custom_time_stamp):
        db = flask.current_app.database
        update = db.ComponentUpdate()
        update.component = data['label']
        update.label = data['label']
        update.status = data['status']
        update.status_description = data['status_description']
        update.health = int(data['health'])
        update.lifetime = float(data['lifetime'])
        update.time = custom_time_stamp
        db.session.add(update)
        db.session.commit()

    def run(self):
        for i in range(1, 4):
            component_name = 'component-{}'.format(i)
            status_description = 'This is an operational description.'

            data = {
                'label': component_name,
                'status': 'operational',
                'status_description': status_description,
                'health': 100,
                'lifetime': 50.1
            }

            time_stamp = time.time()
            self.saveData(data,time_stamp)

            data = {
                'label': component_name,
                'status': 'offline',
                'status_description': 'This is an unhealthy description.',
                'health': 50,
                'lifetime': 50.1,
            }

            time_stamp += 0.1
            self.saveData(data, time_stamp)

            data = {
                'label': component_name,
                'status': 'operational',
                'status_description': status_description,
                'health': 100,
                'lifetime': 50.1,
            }

            time_stamp += 0.4
            self.saveData(data, time_stamp)

            offset = 1

            for j in range(1, 20):
                status = 'operational'
                health = 100
                status_description = 'This is an operational description.'
                if j % 3 == 0:
                    status = 'offline'
                    health = 0
                    status_description = 'This is an offline description.'

                data = {
                    'label': component_name,
                    'status': status,
                    'status_description': status_description,
                    'health': health,
                    'lifetime': 50.1,
                }

                time_stamp += 1 - offset
                self.saveData(data, time_stamp)
                offset = 0

            status = 'partially operational'
            health = 100
            status_description = 'This is a partially operational description.'
            time_stamp += 20

            for j in range(1, 100):
                data = {
                    'label': component_name,
                    'status': status,
                    'status_description': status_description,
                    'health': health - j,
                    'lifetime': 50.1,
                }

                self.saveData(data, time_stamp)
                time_stamp += 0.2
