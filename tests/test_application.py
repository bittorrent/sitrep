import json

from flask_testing import TestCase

from app.application import Application


class ApplicationTest(TestCase):
    def create_app(self):
        app = Application.create({
            'database': 'sqlite://',
            'api_token': 'test-token',
        })
        app.config['TESTING'] = True
        return app

    def setUp(self):
        self.app.database.create_all()

    def tearDown(self):
        self.app.database.session.remove()
        self.app.database.drop_all()

    def test_server_is_up_and_running(self):
        response = self.client.get('/')
        self.assert_200(response)

    def test_component_update(self):
        response = self.client.post('/api/v1/components/test/updates', headers={
            'X-Live-Status-API-Token': 'test-token'
        }, data={
            'label': 'test component',
            'health': 60,
            'status': 'unstable',
            'status_description': 'this is a test',
            'tags': 'test',
        })
        self.assert_200(response)

        response = self.client.get('/api/v1/components')
        self.assert_200(response)

        components = json.loads(response.data)['components']
        self.assertTrue('test' in components)

        component = components['test']
        self.assertEqual(component['label'], 'test component')
        self.assertEqual(component['health'], 60)
        self.assertEqual(component['status'], 'unstable')
        self.assertEqual(component['status_description'], 'this is a test')
        self.assertEqual(component['tags'], ['test'])

        response = self.client.post('/api/v1/components/test/updates', headers={
            'X-Live-Status-API-Token': 'test-token'
        }, data={
            'label': 'test component',
            'health': 100,
            'status': 'stable',
            'status_description': 'this is a test',
            'tags': 'test',
        })
        self.assert_200(response)

        response = self.client.get('/api/v1/components')
        self.assert_200(response)

        components = json.loads(response.data)['components']
        self.assertTrue('test' in components)

        component = components['test']
        self.assertEqual(component['health'], 100)
        self.assertEqual(component['status'], 'stable')
