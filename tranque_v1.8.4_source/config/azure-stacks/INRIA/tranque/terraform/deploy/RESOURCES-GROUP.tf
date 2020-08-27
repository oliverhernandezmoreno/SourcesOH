resource "azurerm_resource_group" "db" {
  name     = var.db_rg_name
  location = var.location
}

resource "azurerm_resource_group" "web" {
  name     = var.web_rg_name
  location = var.location
}

resource "azurerm_resource_group" "rg" {
  name     = var.rg_name
  location = var.location
}

resource "azurerm_resource_group" "aks" {
  name     = var.aks_rg_name
  location = var.location
}

/*resource "azurerm_resource_group" "els" {
  name     = var.els_rg_name
  location = var.location
}*/
