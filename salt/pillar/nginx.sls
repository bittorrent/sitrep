{% set root = salt['pillar.get']('live-status-website:root') -%}
nginx:
    ng:
        install_from_ppa: True
        ppa_version: 'stable'

        service:
            enable: True

        server:
            config:
                http:
                    sendfile: {{ ('off' if salt['pillar.get']('live-status-website:dev_environment', False) else 'on')|yaml_encode }}

        vhosts:
            managed:
                default:
                    enabled: True
                    config:
                        - server:
                            - listen:
                                - 80
                            - listen:
                                - '[::]:80'
                            - location /static/:
                                - root: '{{ root }}/app'
                                - try_files: '$uri =404'
                                - expires: '30d'
                            - location /:
                                - proxy_pass: 'http://127.0.0.1:8000'
                                - proxy_set_header: 'Host $host'
                                - proxy_redirect: 'off'
                                - proxy_set_header: 'X-Forwarded-For $proxy_add_x_forwarded_for'
