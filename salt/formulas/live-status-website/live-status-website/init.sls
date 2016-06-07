{% set server = pillar.get('live-status-website', {}) -%}
{% set root = server.get('root', None) -%}
{% set settings = server.get('settings', {}) -%}
{% set dev_environment = server.get('dev_environment', False) -%}

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

/opt/live-status-website:
    virtualenv.managed:
        - system_site_packages: False
        - requirements: {{ root }}/requirements{{ '-dev' if dev_environment else '' }}.txt

/opt/live-status-website/settings.json:
    file.serialize:
        - template: jinja
        - dataset_pillar: live-status-website:settings
        - formatter: json
        - mode: 0600
        - user: live-status

gunicorn:
    pip.installed:
        - name: gunicorn>=19.0.0,<20.0.0
        - bin_env: /opt/live-status-website

/etc/init/live-status-website.conf:
    file.managed:
        - source: salt://live-status-website/files/live-status-website.conf.jinja
        - template: jinja
        - context:
            root: {{ root|yaml_encode }}

service live-status-website restart:
    cmd.run
