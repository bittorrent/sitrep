{% set server = pillar.get('live-status', {}) -%}
{% set root = server.get('root', None) -%}
{% set settings = server.get('settings', {}) -%}

live-status:
    user.present:
        - createhome: False

python-pip:
    pkg.installed

python-mysqldb:
    pkg.installed

libmysqlclient-dev:
    pkg.installed

virtualenv:
    pip.installed

/opt/live-status:
    virtualenv.managed:
        - system_site_packages: False
        - requirements: {{ root }}/requirements.txt

/opt/live-status/settings.json:
    file.serialize:
        - template: jinja
        - dataset_pillar: live-status:settings
        - formatter: json
        - mode: 0600
        - user: live-status

gunicorn:
    pip.installed:
        - name: gunicorn>=19.0.0,<20.0.0
        - bin_env: /opt/live-status

/etc/init/live-status.conf:
    file.managed:
        - source: salt://live-status/files/live-status.conf.jinja
        - template: jinja
        - context:
            root: {{ root|yaml_encode }}

service live-status restart:
    cmd.run
