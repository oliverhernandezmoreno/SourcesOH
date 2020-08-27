resource "azurerm_storage_account" "storage" {
  name                      = var.storage_name
  resource_group_name       = azurerm_resource_group.rg.name
  location                  = azurerm_resource_group.rg.location
  account_tier              = "Standard"
  account_kind              = "StorageV2"
  access_tier               = "hot"
  enable_https_traffic_only = "true" 
  account_replication_type  = "LRS"

}

resource "azurerm_storage_account_network_rules" "rules" {
  resource_group_name  = azurerm_resource_group.rg.name
  storage_account_name = azurerm_storage_account.storage.name

  default_action             = "Allow"
  ip_rules                   = ["127.0.0.1"]
  virtual_network_subnet_ids = [ ]
  bypass                     = ["AzureServices"]
}

resource "azurerm_storage_share" "share" {
  name                 = "minio"
  storage_account_name = azurerm_storage_account.storage.name
  quota                = 100
}

resource "azurerm_storage_container" "codigo" {
  name                  = "codigo"
  storage_account_name  = azurerm_storage_account.storage.name
  container_access_type = "container"
}

resource "azurerm_storage_blob" "script" {
  name                   = "script.sh"
  storage_account_name   = azurerm_storage_account.storage.name
  storage_container_name = azurerm_storage_container.codigo.name
  type                   = "Block"
  source                 = "./script/shell.sh"
}

resource "azurerm_storage_blob" "compose" {
  name                   = "docker-compose.yml"
  storage_account_name   = azurerm_storage_account.storage.name
  storage_container_name = azurerm_storage_container.codigo.name
  type                   = "Block"
  source                 = "./script/docker-compose.yml"
}

resource "azurerm_storage_blob" "compose1" {
  name                   = "els-compose.yml"
  storage_account_name   = azurerm_storage_account.storage.name
  storage_container_name = azurerm_storage_container.codigo.name
  type                   = "Block"
  source                 = "./script/els-compose.yml"
}

resource "azurerm_storage_blob" "script1" {
  name                   = "script1.sh"
  storage_account_name   = azurerm_storage_account.storage.name
  storage_container_name = azurerm_storage_container.codigo.name
  type                   = "Block"
  source                 = "./script/shell1.sh"
}

resource "azurerm_storage_blob" "script2" {
  name                   = "script2.sh"
  storage_account_name   = azurerm_storage_account.storage.name
  storage_container_name = azurerm_storage_container.codigo.name
  type                   = "Block"
  source                 = "./script/shell2.sh"
}
