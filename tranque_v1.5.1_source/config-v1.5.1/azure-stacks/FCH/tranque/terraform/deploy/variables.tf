#########################
### VARIABLES GLOBALES ##
#########################

variable "key_vault_name" {
  description = "Name Key Vault.(modificar)"
  default     = "Tranque-Key-Vault-3"
}

variable "acr_name" {
  description = "Name Key Vault.(modificar)"
  default     = "TranqueACR3"
}

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
  default     = "tranque-3" 
}

variable "db_name" {
  description = "Database Name"
  default     = "backend"
}

variable "redis_name" {
  description = "Redis Cache Name (modificar)"
  default     = "redis-tranque-3"
}

variable "zone_dns_name" {
  description = "Zone DNS Name (modificar)"
  default     = "trq-dev.cl"
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

variable "principal_dns_name" {
  description = "Subdomain Name (modificar)"
  default     = "www"
}

variable "appgw_name" {
  description = "Application Gateway Name (modificar)"
  default     = "AppGW-Tranque"
}

variable "server_minio_name" {
  description = "Server Name MinIO"
  default     = "MINIO"
} 

variable "network_name" {
  description = "Network Name MinIO (modificar)"
  default     = "network-minio-3"
} 

variable "storage_name" {
  description = "Storage Account Name (modificar)"
  default     = "storagetraque3"
} 

variable "vnet_network_name" {
  description = "Vnet Network Name"
  default     = "VNET-Tranque"
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
  default     = 2
}

variable "aks_agent_vm_size" {
  description = "The size of the Virtual Machine."
  default     = "Standard_D3_v2"
}

variable "kubernetes_version" {
  description = "The version of Kubernetes."
  default     = "1.11.5"
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
