resource "azurerm_role_assignment" "ra1" {
  scope                = azurerm_subnet.kubesubnet.id
  role_definition_name = "Network Contributor"
  principal_id         = var.aks_object_id

  depends_on = ["azurerm_virtual_network.test"]
}

resource "azurerm_role_assignment" "ra2" {
  scope                = azurerm_user_assigned_identity.aks.id
  role_definition_name = "Managed Identity Operator"
  principal_id         = var.aks_object_id
  depends_on           = ["azurerm_user_assigned_identity.aks"]
}

resource "azurerm_role_assignment" "ra3" {
  scope                = azurerm_application_gateway.appgw.id
  role_definition_name = "Contributor"
  principal_id         = azurerm_user_assigned_identity.aks.principal_id
  depends_on           = ["azurerm_user_assigned_identity.aks", "azurerm_application_gateway.appgw"]
}

resource "azurerm_role_assignment" "ra4" {
  scope                = azurerm_resource_group.aks.id
  role_definition_name = "Reader"
  principal_id         = azurerm_user_assigned_identity.aks.principal_id
  depends_on           = ["azurerm_user_assigned_identity.aks", "azurerm_application_gateway.appgw"]
}
