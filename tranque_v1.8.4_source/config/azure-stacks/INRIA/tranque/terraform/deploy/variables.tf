#########################
### VARIABLES GLOBALES ##
#########################

variable "key_vault_name" {
  description = "Name Key Vault.(modificar)"
  default     = "kv-prueba3"
}

variable "acr_name" {
  description = "Name Containers Registries.(modificar)"
  default     = "tranqueacr"
}

variable "resource_group_name" {}

variable "els_rg_name" {
  description = "Name of the resource group."
  default     = "ELS-STACK"
}

variable "db_rg_name" {
  description = "Name of the resource group."
  default     = "RESOURCES-DB" 
}

variable "web_rg_name" {
  description = "Name of the resource group."
  default     = "RESOURCES-WEB"
}

variable "rg_name" {
  description = "Name of the resource group."
  default     = "RESOURCES-GENERAL"
}

variable "aks_rg_name" {
  description = "Name of the resource group."
  default     = "RESOURCES-AKS"
}

variable "location" {
  description = "Golbal Location"
  default     = "Central US"
}

variable "server_db_name" {
  description = "Database Server Name (modificar)"
  default     = "tranque-1" 
}

variable "db_name" {
  description = "Database Name"
  default     = "backend"
}

variable "db_user" {
  description = "Database Username"
  default     = "sysadmin"
}

variable "db_passw" {
  description = "Database Paswword"
  default     = "7kr5SdEdw5IgESh2si_bo1gv3qbS-Cmm"
}

variable "zone_dns_name" {
  description = "Zone DNS Name (modificar)"
  default     = "inriadev.cl"
}

variable "minio_dns_name" {
  description = "Subdomain Name (modificar)"
  default     = "minio"
}

variable "api_dns_name" {
  description = "Subdomain Name (modificar)"
  default     = "w2"
}

variable "static_dns_name" {
  description = "Subdomain Name (modificar)"
  default     = "static"
}

variable "sml_dns_name" {
  description = "Subdomain Name (modificar)"
  default     = "sml"
}

variable "principal_dns_name" {
  description = "Subdomain Name (modificar)"
  default     = "alfa"
}

variable "appgw_name" {
  description = "Application Gateway Name (modificar)"
  default     = "AppGW-Tranque"
}

variable "server_minio_name" {
  description = "Server Name MinIO"
  default     = "MINIO"
} 

variable "minio_user" {
  description = "Username MinIO"
  default     = "sysadmin"
}

variable "minio_passw" {
  description = "Password MinIO"
  default     = "~Wj248a2b=Tz"
}

variable "server_rabbit_name" {
  description = "Server Name RABBIT"
  default     = "RABBIT"
}

variable "rabbit_user" {
  description = "Username RabbitMQ"
  default     = "sysadmin"
}

variable "rabbit_passw" {
  description = "Password RabbitMQ"
  default     = "~Wj248a2b=Tz"
}

variable "server_els_name" {
  description = "Server Name ELS"
  default     = "ELS"
}

variable "els_user" {
  description = "Username ElasticSeacrh"
  default     = "sysadmin"
}

variable "els_passw" {
  description = "Password ElasticSearch"
  default     = "~Wj248a2b=Tz"
}

variable "network_rabbit_name" {
  description = "Network Name RABBIT (modificar)"
  default     = "network-rabbit"
}

variable "network_els_name" {
  description = "Network Name ELS (modificar)"
  default     = "network-els"
}

variable "network_name" {
  description = "Network Name MinIO (modificar)"
  default     = "network-minio"
} 

variable "storage_name" {
  description = "Storage Account Name (modificar)"
  default     = "storagetraque"
} 

variable "vnet_network_name" {
  description = "Vnet Network Name"
  default     = "VNET-Tranque"
}

variable "cdir_address" {
  description = "Vnet Network CDIR"
  default     = "172.30.0.0/16"
}

variable "cdir_subnet1" {
  description = "Subnet1 CDIR"
  default     = "172.30.1.0/24"
}

variable "cdir_subnet2" {
  description = "subnet2 CDIR"
  default     = "172.30.2.0/24"
}

variable "cdir_subnet3" {
  description = "Subnet3 CDIR"
  default     = "172.30.3.0/24"
}

variable "cdir_subnet4" {
  description = "subnet4 CDIR"
  default     = "172.30.4.0/24"
}

variable "cdir_subnetgw" {
  description = "Subnet AppGW CDIR"
  default     = "172.30.6.0/25"
}
###############################################
### VARIABLES PARA SERVICIO KUBERNETES (AKS) ##  
###############################################

variable "aks_app_id" {
  description = "Application ID/Client ID  of the service principal. Used by AKS to manage AKS related resources on Azure like vms, subnets."
}

variable "aks_secret" {
  description = "Secret of the service principal. Used by AKS to manage Azure."
} 

variable "aks_object_id" {
  description = "Secret of the service principal. Used by AKS to manage Azure."
}

variable "virtual_network_name" {
  description = "Virtual network name"
  default     = "AKS-vnet"
}

variable "virtual_network_address_prefix" {
  description = "Containers DNS server IP address."
  default     = "15.0.0.0/8"
}

variable "aks_subnet_name" {
  description = "AKS Subnet Name."
  default     = "kubesubnet"
}

variable "aks_subnet_address_prefix" {
  description = "Containers DNS server IP address."
  default     = "15.0.0.0/16"
}

variable "app_gateway_subnet_address_prefix" {
  description = "Containers DNS server IP address."
  default     = "15.1.0.0/16"
}

variable "aks_name" {
  description = "Name of the AKS cluster."
  default     = "Tranque-AKS"
}
variable "aks_dns_prefix" {
  description = "Optional DNS prefix to use with hosted Kubernetes API server FQDN."
  default     = "aks"
}

variable "aks_agent_os_disk_size" {
  description = "Disk size (in GB) to provision for each of the agent pool nodes. This value ranges from 0 to 1023. Specifying 0 applies the default disk size for that agentVMSize."
  default     = 40
}

variable "aks_agent_count" {
  description = "The number of agent nodes for the cluster."
  default     = 1
}

variable "auto_scaling" {
  description = "The number of agent nodes for the cluster."
  default     = true
}

variable "min_count" {
  description = "The number of agent nodes for the cluster."
  default     = 2
}

variable "max_count" {
  description = "The number of agent nodes for the cluster."
  default     = 10
}

variable "aks_agent_vm_size" {
  description = "The size of the Virtual Machine."
  default     = "Standard_D2as_v4"
}

variable "kubernetes_version" {
  description = "The version of Kubernetes."
  default     = "1.16.10"
}

variable "aks_service_cidr" {
  description = "A CIDR notation IP range from which to assign service cluster IPs."
  default     = "10.0.0.0/16"
}

variable "aks_dns_service_ip" {
  description = "Containers DNS server IP address."
  default     = "10.0.0.10"
}

variable "aks_docker_bridge_cidr" {
  description = "A CIDR notation IP for Docker bridge."
  default     = "172.17.0.1/16"
}

variable "aks_enable_rbac" {
  description = "Enable RBAC on the AKS cluster. Defaults to false."
  default     = "false"
}

variable "vm_user_name" {
  description = "User name for the VM"
  default     = "sysadmin"
}

variable "public_ssh_key_path" {
  description = "Public key path for SSH."
  default     = "./cert/aks.pub"
}
