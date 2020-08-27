resource "azurerm_postgresql_server" "server" {
  name                = var.server_db_name
  location            = azurerm_resource_group.db.location
  resource_group_name = azurerm_resource_group.db.name
  sku_name = "GP_Gen5_2"

  storage_mb                     = 102400
  backup_retention_days          = 7
  geo_redundant_backup_enabled   = false
  auto_grow_enabled              = true
  administrator_login            = var.db_user
  administrator_login_password   = var.db_passw
  version                        = "10"
  public_network_access_enabled  = true
  ssl_enforcement_enabled        = true

tags = {Name = "BD-Tranque"}
}


resource "azurerm_postgresql_virtual_network_rule" "rule" {
  name                                 = "postgresql-vnet-rule"
  resource_group_name                  = azurerm_resource_group.db.name
  server_name                          = azurerm_postgresql_server.server.name
  subnet_id                            = azurerm_subnet.kubesubnet.id
  ignore_missing_vnet_service_endpoint = true
}


resource "azurerm_postgresql_database" "base" {
  name                = var.db_name
  resource_group_name = azurerm_resource_group.db.name
  server_name         = azurerm_postgresql_server.server.name
  charset             = "UTF8"
  collation           = "English_United States.1252"
}

resource "azurerm_private_endpoint" "endpoint" {
  name                = "PRIVATE-LINK"
  location            = azurerm_resource_group.db.location
  resource_group_name = azurerm_resource_group.db.name
  subnet_id           = azurerm_subnet.subnet4.id

  private_service_connection {
    name                           = "link-db"
    private_connection_resource_id = azurerm_postgresql_server.server.id
    subresource_names              = [ "postgresqlServer" ]
    is_manual_connection           = false
  }
}
/*
resource "azurerm_redis_cache" "cache" {
  name                = var.redis_name
  location            = azurerm_resource_group.db.location
  resource_group_name = azurerm_resource_group.db.name
  capacity            = 2
  family              = "P"
  sku_name            = "Premium"
  enable_non_ssl_port = false
  minimum_tls_version = "1.2"
  subnet_id           = azurerm_subnet.subnet4.id
  redis_configuration {
  }
}*/
