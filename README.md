live-status-website [![Build Status](https://travis-ci.com/bittorrent/live-status-website.svg?token=qNZpQ37RsPih5TkYecTG&branch=master)](https://travis-ci.com/bittorrent/live-status-website)
==

This server provides status reports.

development
--

To get set up:

* Install [Vagrant](https://www.vagrantup.com/).
* `vagrant up` from the top directory.
* Add "192.168.74.100 status.btlive.local" to your hosts file.

This will boot up a fully functional server, accessible from http://status.btlive.local.

You can SSH into the server via `vagrant ssh`, suspend the server via `vagrant suspend`, and destroy the server via `vagrant destroy`.
