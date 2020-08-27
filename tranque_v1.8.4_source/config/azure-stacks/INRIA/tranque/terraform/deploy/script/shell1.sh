#RABBITMQ
#/bin/bash

sudo apt-get update

sudo apt-key adv --keyserver "hkps.pool.sks-keyservers.net" --recv-keys "0x6B73A36E6026DFCA"

sudo bash -c 'echo "deb https://dl.bintray.com/rabbitmq-erlang/debian bionic erlang 
deb https://dl.bintray.com/rabbitmq/debian bionic main" > /etc/apt/sources.list.d/bintray.rabbitmq.list'
                   
sudo apt-get update

sudo apt-get install rabbitmq-server -y

sudo systemctl start rabbitmq-server.service

sudo systemctl enable rabbitmq-server

sudo ufw allow 15672

sudo rabbitmq-plugins list

sudo rabbitmq-plugins enable rabbitmq_management

sudo rabbitmqctl add_user admin admin

sudo  rabbitmqctl set_user_tags admin administrator

sudo rabbitmqctl set_permissions -p / admin ".*" ".*" ".*"
