#/bin/bash
# sed -i 's/1-7-1/1-6-1/g' "deploy.sh"
sudo rm -f /home/avalencia/.kube/config

az aks get-credentials --resource-group RESOURCES-AKS --name Tranque-AKS

az aks update -n Tranque-AKS -g RESOURCES-AKS --attach-acr tranqueacr

sudo az acr login -n tranqueacr

