resource "azurerm_virtual_network" "test" {
  name                = var.virtual_network_name
  location            = azurerm_resource_group.aks.location
  resource_group_name = azurerm_resource_group.aks.name
  address_space       = [var.virtual_network_address_prefix]

  tags = {name = "VNET-AKS"}
}

resource "azurerm_subnet" "kubesubnet" {
  name                 = var.aks_subnet_name
  resource_group_name  = azurerm_resource_group.aks.name
  virtual_network_name = azurerm_virtual_network.test.name
  address_prefixes     = [var.aks_subnet_address_prefix]
  enforce_private_link_endpoint_network_policies = true
  }

resource "azurerm_kubernetes_cluster" "k8s" {
  name       = var.aks_name
  location   = azurerm_resource_group.aks.location
  dns_prefix = var.aks_dns_prefix

  resource_group_name = azurerm_resource_group.aks.name

  linux_profile {
    admin_username = var.vm_user_name

    ssh_key {
      key_data = file(var.public_ssh_key_path)
    }
  }

  addon_profile {
    http_application_routing {
      enabled = false
    }
  }

  default_node_pool {
    name                = "agentpool"
    node_count          = var.aks_agent_count
    vm_size             = var.aks_agent_vm_size
    os_disk_size_gb     = var.aks_agent_os_disk_size
    vnet_subnet_id      = azurerm_subnet.kubesubnet.id
    #enable_auto_scaling = var.auto_scaling
    #max_count           = var.max_count
    #min_count           = var.min_count
  }


  service_principal {
    client_id     = var.aks_app_id
    client_secret = var.aks_secret
  }

  network_profile {
    network_plugin     = "azure"
    dns_service_ip     = var.aks_dns_service_ip
    docker_bridge_cidr = var.aks_docker_bridge_cidr
    service_cidr       = var.aks_service_cidr
  }

  depends_on = [azurerm_virtual_network.test, azurerm_application_gateway.appgw]
  tags       = {name = "INRIA-AKS" }
}

