resource "azurerm_user_assigned_identity" "aks" {
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location

  name = "ID-AKS"
  tags = {Name = "AKS"}
}


resource "azurerm_user_assigned_identity" "appgw" {
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location

  name = "KV-APPGW"
  tags = {Name = "KeyVault"}
}

