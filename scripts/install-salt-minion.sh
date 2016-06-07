#!/bin/sh
ROOT=$(dirname $(dirname $(readlink -f $0)))

# This installs and configures the salt minion.

curl -L https://bootstrap.saltstack.com | sudo sh -s -- -F git v2015.8.8

cat > /etc/salt/minion << MinionConfig
state_verbose: True

file_client: local

file_roots:
    base:
        - $ROOT/salt/state
        - $ROOT/salt/formulas/live-status-website
        - $ROOT/salt/formulas/nginx

pillar_roots:
    base:
        - $ROOT/salt/pillar
MinionConfig

service salt-minion restart
