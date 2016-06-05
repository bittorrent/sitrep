# -*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant.configure(2) do |config|
    config.vm.box = "ubuntu/trusty64"
    config.vm.network "private_network", ip: "192.168.74.100"
    config.vm.hostname = "live-status.local"

    config.vm.provider "virtualbox" do |v|
        v.memory = 1024
    end

    config.vm.synced_folder ".", "/vagrant",
        owner: "vagrant",
        group: "www-data",
        mount_options: ["dmode=775,fmode=664"]

    config.vm.provision "shell",
        inline: "/bin/sh /vagrant/scripts/install-dev-environment.sh"
end
