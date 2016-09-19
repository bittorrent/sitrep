Sitrep
==

Sitrep receives status reports from infrastructure components, and presents them in an informative dashboard.

Prerequisites
--

The server is created with [Flask](http://flask.pocoo.org/), so you'll need to install Python, PIP, and the required modules via `pip install -r requirements.txt`. You'll also need to set up a SQL database somewhere.

Configuration
--

Configuration is done via JSON file.

For a minimal configuration, you just need two keys:

```
{
    "api_token": "yMhyfJoNI2fTyp3rStK1A0B6u8ZhMJUJ60M3y0qB",
    "database": "mysql://root@10.0.1.10/status_server"
}
```

* `api_token` should be a random, securely generated string. It is the key that infrastructure components will use to submit their status.
* `database` is the URL for the database you've set up.

Save this and pass the path to the application via the `STATUS_SETTINGS` environment variable. It can be stored anywhere, but the examples here will assume you've named this *config/settings.json*, which has been .gitignore'd for your convenience.

You can further customize the appearance of the site using the `display` key:

```
{
    ...
    "display": {
        "title": "Our System Status",
        "header_paragraphs": [
            "This is our public dashboard!"
        ],
        "component_groups": [
            {
                "tags": {
                    "type": "our-thing"
                },
                "title": "Thing",
                "description": "Each thing does stuff."
            }
        ]
    }
}
```

Running
--

The easiest thing to do is run the [Docker](https://www.docker.com/) image. You can build it like so:

`docker build -t status-server .`

Before running, you'll need to make sure your database schema is up to date. [Flask-Migrate](https://flask-migrate.readthedocs.io/en/latest/) is used for this, so you can run the migrations with something like this:

`docker run -v $(cd config && pwd):/mnt/config -e 'STATUS_SETTINGS=/mnt/config/settings.json' -p 8000:80 --entrypoint python status-server -m app db upgrade`

Once the database is up-to-date, you can start the application like this:

`docker run -v $(cd config && pwd):/mnt/config -e 'STATUS_SETTINGS=/mnt/config/settings.json' -p 8000:80 status-server`

The docker image uses [NGINX](https://www.nginx.com/) and [Gunicorn](http://gunicorn.org/), so you may want to review the options available for them. For example, the `WEB_CONCURRENCY` environment variable sets the number of Gunicorn worker processes to create.

API
--

To be documented. In the meantime, you can find example usage in *tests/test_application.py*.

Development
--

The most efficient way to develop is by running a Flask development server:

`STATUS_SETTINGS=config/settings.json python -m app runserver --debug`

See [here](http://flask.pocoo.org/docs/0.11/server/) for details.
