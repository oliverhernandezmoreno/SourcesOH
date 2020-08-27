#!/bin/bash

#######################
## MOUNT AZURE FILE  ##
#######################

sudo apt install cifs-utils -y
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash

az login --service-principal --username bb1a6566-5771-49fe-ae7d-54f491fc540c --password XLB4_M~isB58WOb5Rb6S0YOtz5NO.qs7jp --tenant 1015b94a-449a-432d-8b3e-80b8e2d3a790

resourceGroupName="RESOURCES-GENERAL"
storageAccountName="storagesngm"
fileShareName="minio"

mntPath="/mnt/$storageAccountName"

sudo mkdir -p $mntPath

httpEndpoint=$(sudo az storage account show \
    --resource-group $resourceGroupName \
    --name $storageAccountName \
    --query "primaryEndpoints.file" | tr -d '"')
smbPath=$(echo $httpEndpoint | cut -c7-$(expr length $httpEndpoint))$fileShareName

storageAccountKey=$(sudo az storage account keys list \
    --resource-group $resourceGroupName \
    --account-name $storageAccountName \
    --query "[0].value" | tr -d '"')

sudo mkdir /etc/smbcredentials
sudo bash -c 'echo "username='$storageAccountName'" >> /etc/smbcredentials/storagetraque.cred'
sudo bash -c 'echo "password='$storageAccountKey'" >> /etc/smbcredentials/storagetraque.cred'
sudo chmod 600 /etc/smbcredentials/storagetraque.cred

sudo bash -c 'echo "'$smbPath' '$mntPath'  cifs nofail,vers=3.0,credentials=/etc/smbcredentials/storagetraque.cred,dir_mode=0777,file_mode=0777,serverino" >> /etc/fstab'

sudo mount -a

sudo mkdir -p $mntPath/smc

########################
## INSTALACIÓN DOCKER ##
########################

sudo apt-get remove docker docker-engine docker.io containerd runc

sudo apt-get install \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg-agent \
    software-properties-common -y

curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -

sudo apt-key fingerprint 0EBFCD88

sudo add-apt-repository \
   "deb [arch=amd64] https://download.docker.com/linux/ubuntu \
   $(lsb_release -cs) \
   stable"

sudo apt-get update

sudo apt-get install docker-ce docker-ce-cli containerd.io -y

################################
## INSTALACIÓN DOCKER-COMPOSE ##
################################

sudo curl -L "https://github.com/docker/compose/releases/download/1.25.5/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

sudo chmod +x /usr/local/bin/docker-compose

sudo ln -s /usr/local/bin/docker-compose /usr/bin/docker-compose

#######################
## INSTALACIÓN MINIO ##
#######################

sudo wget https://storagesngm.blob.core.windows.net/codigo/docker-compose.yml -O /opt/docker-compose.yml

sudo docker-compose -f /opt/docker-compose.yml up -d
