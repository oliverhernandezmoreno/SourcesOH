#/bin/bash
# sed -i 's/1-7-1/1-6-1/g' "deploy.sh"
sudo rm -f /home/avalencia/.kube/config

az aks get-credentials --resource-group RESOURCES-AKS --name Tranque-AKS

sudo docker login fundacionchile.azurecr.io -u fundacionchile -p 0goBShWcjjVpkKkAZIXNI+DFGke36o0x

az aks update -n Tranque-AKS -g RESOURCES-AKS --attach-acr acrsngm

sudo az acr login -n acrsngm

