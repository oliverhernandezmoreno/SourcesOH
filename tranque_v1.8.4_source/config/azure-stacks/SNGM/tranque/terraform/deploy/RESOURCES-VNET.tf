resource "azurerm_virtual_network" "vnet" {
  name                = var.vnet_network_name
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  address_space       = ["${var.cdir_address}"]
  }

resource "azurerm_subnet" "subnet1" {
  name                 = "subnet1"
  resource_group_name  = azurerm_resource_group.rg.name
  virtual_network_name = azurerm_virtual_network.vnet.name
  address_prefixes     = ["${var.cdir_subnet1}"]
  }

resource "azurerm_subnet" "subnet2" {
  name                 = "subnet2"
  resource_group_name  = azurerm_resource_group.rg.name
  virtual_network_name = azurerm_virtual_network.vnet.name
  address_prefixes     = ["${var.cdir_subnet2}"]
  }

resource "azurerm_subnet" "subnet3" {
  name                 = "subnet3"
  resource_group_name  = azurerm_resource_group.rg.name
  virtual_network_name = azurerm_virtual_network.vnet.name
  address_prefixes     = ["${var.cdir_subnet3}"]
  }

resource "azurerm_subnet" "subnet4" {
  name                 = "subnet4"
  resource_group_name  = azurerm_resource_group.rg.name
  virtual_network_name = azurerm_virtual_network.vnet.name
  address_prefixes     = ["${var.cdir_subnet4}"]
  enforce_private_link_endpoint_network_policies = true
  }

resource "azurerm_subnet" "subnetgw" {
  name                 = "Subnet-AppGW"
  resource_group_name  = azurerm_resource_group.rg.name
  virtual_network_name = azurerm_virtual_network.vnet.name
  address_prefixes     = ["${var.cdir_subnetgw}"]
  }

resource "azurerm_virtual_network_peering" "peering-1" {
  name                      = "peering1"
  resource_group_name       = azurerm_resource_group.rg.name
  virtual_network_name      = azurerm_virtual_network.vnet.name
  remote_virtual_network_id = azurerm_virtual_network.test.id
}

resource "azurerm_virtual_network_peering" "peering-2" {
  name                      = "peering2"
  resource_group_name       = azurerm_resource_group.aks.name
  virtual_network_name      = azurerm_virtual_network.test.name
  remote_virtual_network_id = azurerm_virtual_network.vnet.id
}

# Public Ip
resource "azurerm_public_ip" "ipgw" {
  name                         = "PUBLIC-IP-APPGW"
  location                     = azurerm_resource_group.rg.location
  resource_group_name          = azurerm_resource_group.rg.name
  allocation_method            = "Static"
  sku                          = "Standard"
}

resource "azurerm_public_ip" "ipminio" {
  name                         = "PUBLIC-IP-MINIO"
  location                     = azurerm_resource_group.rg.location
  resource_group_name          = azurerm_resource_group.rg.name
  allocation_method            = "Static"
  sku                          = "Standard"
}
