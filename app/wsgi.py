from .application import Application

wsgi_application = None


def application(environ, start_response):
    global wsgi_application
    if wsgi_application is None:
        wsgi_application = Application.create(Application.environment_settings())
    return wsgi_application(environ, start_response)
