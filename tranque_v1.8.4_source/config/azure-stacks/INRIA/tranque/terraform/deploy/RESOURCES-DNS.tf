resource "azurerm_dns_zone" "public" {
  name                = var.zone_dns_name
  resource_group_name = azurerm_resource_group.web.name
}

resource "azurerm_dns_a_record" "minio" {
  name                = var.minio_dns_name
  zone_name           = azurerm_dns_zone.public.name
  resource_group_name = azurerm_resource_group.web.name
  ttl                 = 1
  target_resource_id  = azurerm_public_ip.ipgw.id
}

resource "azurerm_dns_a_record" "api" {
  name                = var.api_dns_name
  zone_name           = azurerm_dns_zone.public.name
  resource_group_name = azurerm_resource_group.web.name
  ttl                 = 1
  target_resource_id  = azurerm_public_ip.ipgw.id
}

resource "azurerm_dns_a_record" "static" {
  name                = var.static_dns_name
  zone_name           = azurerm_dns_zone.public.name
  resource_group_name = azurerm_resource_group.web.name
  ttl                 = 1
  target_resource_id  = azurerm_public_ip.ipgw.id 
}

resource "azurerm_dns_a_record" "www" {
  name                = var.principal_dns_name
  zone_name           = azurerm_dns_zone.public.name
  resource_group_name = azurerm_resource_group.web.name
  ttl                 = 1
  target_resource_id  = azurerm_public_ip.ipgw.id
}

resource "azurerm_dns_a_record" "sml" {
  name                = var.sml_dns_name
  zone_name           = azurerm_dns_zone.public.name
  resource_group_name = azurerm_resource_group.web.name
  ttl                 = 1
  records             = ["104.43.198.74"]
}
