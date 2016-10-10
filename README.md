Sitrep [![Build Status](https://travis-ci.org/bittorrent/sitrep.svg?branch=master)](https://travis-ci.org/bittorrent/sitrep) [![Apache 2.0 License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](https://raw.githubusercontent.com/bittorrent/sitrep/master/LICENSE)
==

Sitrep receives status reports from infrastructure components, and presents them in an informative dashboard.

Configuration
--

Configuration is done via JSON file.

For a minimal configuration, you just need two keys:

```
{
    "api_token": "yMhyfJoNI2fTyp3rStK1A0B6u8ZhMJUJ60M3y0qB",
    "database": "mysql://<user>@<your_ip_address>/status_server"
}
```

* `api_token` should be a random, securely generated string. It is the key that infrastructure components will use to submit their status.
* `database` is the URL for the database you've set up.

You'll pass the path of the settings file to the application via the `STATUS_SETTINGS` environment variable. It can be stored anywhere, but the examples here will assume you've named this *config/settings.json*, which has been .gitignore'd for your convenience.

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

`docker build -t sitrep .`

Before running, you'll need to make sure your database schema is up to date. [Flask-Migrate](https://flask-migrate.readthedocs.io/en/latest/) is used for this, so you can run the migrations with something like this:

`docker run -v $(cd config && pwd):/mnt/config -e 'STATUS_SETTINGS=/mnt/config/settings.json' -p 8000:80 --entrypoint python sitrep -m app db upgrade`

Once the database is up-to-date, you can start the application like this:

`docker run -v $(cd config && pwd):/mnt/config -e 'STATUS_SETTINGS=/mnt/config/settings.json' -p 8000:80 sitrep`

The docker image uses [NGINX](https://www.nginx.com/) and [Gunicorn](http://gunicorn.org/), so you may want to review the options available for them. For example, the `WEB_CONCURRENCY` environment variable sets the number of Gunicorn worker processes to create.

If you installed MYSQL through homebrew there may be some configuration settings that stop you from connecting to the database. Make sure you give your database user permission to connect from your machine.

API
--

To be documented. In the meantime, you can find usage examples in *tests/test_application.py*.

Development
--

The most efficient way to develop is by running a Flask development server.

Make sure you have `pip`, and run `pip install -r requirements-dev.txt`. Then you can run the development server like this:

`STATUS_SETTINGS=config/settings.json python -m app runserver --debug`

You can also run a seed command to pre-populate the database with filler data like this:
`python -m app seed-db`

The seed file itself is located in:
`app/dev/seed.py`

Deployment
--

If you're deploying to AWS, see the *aws* directory for a CloudFormation stack that can get you started quickly. Otherwise, you can deploy with your mechanism of choice for Docker or Flask applications.




