resource "azurerm_container_registry" "acr" {
  name                     = var.acr_name
  resource_group_name      = azurerm_resource_group.rg.name
  location                 = azurerm_resource_group.rg.location
  sku                      = "Standard"
  admin_enabled            = true
network_rule_set {
virtual_network = azurerm_virtual_network.test.id
}
  tags = { Name = "Tramque-ACR"}
}
