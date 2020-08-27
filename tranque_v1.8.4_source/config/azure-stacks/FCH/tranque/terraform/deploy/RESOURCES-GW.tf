locals {
# Datos GW
  gw_ip                          = "AppGW-IP"  
  gw_port_http                   = "port_80"
  gw_port_https                  = "port_443"

# Backend PUBLICO
  backend_public                 = "PUBLIC"
  http_public                    = "HTTP"
  listener_http                  = "HTTP-PUBLIC"
  listener_https                 = "HTTPS-PUBLIC"
  rule_public                    = "HTTP-REDIRECT"
  rule_https                     = "HTTPS"
# Backend minIO
  backend_minio                  = "MINIO"
  http_minio                     = "HTTP-MINIO"
  listener_minio                 = "LIST-MINIO"
  rule_minio                     = "RULE-MINIO"

# Backend ADMIN
  backend_admin                  = "ADMIN"
  http_admin                     = "HTTP-ADMIN"
  listener_admin                 = "LIST-ADMIN"
  rule_admin                     = "RULE-ADMIN"

# Backend API  
  backend_api                    = "HTTPS"
  http_api                       = "HTTPS"
  listener_api                   = "LIST-HTTPS"
  rule_api                       = "RULE-HTTPS"

# Backend STATIC
  backend_static                 = "STATIC"
  http_static                    = "HTTPS-STATIC"
  listener_static                = "LIST-STATIC"
  rule_static                    = "RULE-STATIC"
}

resource "azurerm_application_gateway" "appgw" {
  name                = var.appgw_name
  resource_group_name = azurerm_resource_group.web.name
  location            = azurerm_resource_group.web.location
  
  identity {
    type              = "UserAssigned"
    identity_ids      = ["${azurerm_user_assigned_identity.appgw.id}"] 

  }
  
  ssl_certificate {
    name                 = "cert-minio"
    key_vault_secret_id  = data.azurerm_key_vault_secret.minio.id 
  }
  ssl_certificate {
    name                 = "cert-principal"
    key_vault_secret_id  = data.azurerm_key_vault_secret.www.id 
  }
  ssl_certificate {
    name                 = "cert-api"
    key_vault_secret_id  = data.azurerm_key_vault_secret.w2.id 
  }

  ssl_certificate {
    name                 = "cert-static"
    key_vault_secret_id  = data.azurerm_key_vault_secret.static.id
  }

  probe {
    name                = "MinIO"
    protocol            = "Http"
    path                = "/minio/health/ready"
    interval            = 30
    host                = "172.30.3.4"
    timeout             = 30
    unhealthy_threshold = 3
    
    match {
      status_code = ["200-399"] 
    }  
  }
  
  ssl_policy {
    policy_type           = "Custom"
    cipher_suites         = ["TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384", "TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256"]
    min_protocol_version  = "TLSv1_2"

  }
  sku {
    name     = "WAF_v2"
    tier     = "WAF_v2"
    capacity = 2
  }

  waf_configuration {
    enabled          = true
    firewall_mode    = "Detection"
    rule_set_type    = "OWASP"
    rule_set_version = "3.1"
  }

  gateway_ip_configuration {
    name      = "AppGW-Subnet"
    subnet_id = azurerm_subnet.subnetgw.id
  }

  frontend_port {
    name = local.gw_port_http
    port = 80
  }

  frontend_port {
    name = local.gw_port_https
    port = 443
  }

  frontend_ip_configuration {
    name                 = local.gw_ip
    public_ip_address_id = azurerm_public_ip.ipgw.id
  }

  backend_address_pool {
    name          = local.backend_public # service/front-svc
    ip_addresses  = ["15.0.0.67"]
  }
  
  backend_address_pool {
    name          = local.backend_minio
    ip_addresses  = ["172.30.3.4"] 
  }

  backend_address_pool {
    name          = local.backend_api # service/api-svc
    ip_addresses  = ["15.0.0.66"]
  }

  backend_address_pool {
    name          = local.backend_admin # service/admin-svc
    ip_addresses  = ["15.0.0.69"]
  }
 
  backend_address_pool {
    name          = local.backend_static # service/static-svc
    ip_addresses  = ["15.0.0.68"]
  }


  backend_http_settings {
    name                  = local.http_public
    cookie_based_affinity = "Disabled"
    port                  = 80
    protocol              = "Http"
    request_timeout       = 20
  }

  backend_http_settings {
    name                  = local.http_minio
    cookie_based_affinity = "Disabled"
    port                  = 80
    protocol              = "Http"
    request_timeout       = 20
    probe_name            = "MINIO"
  }  

  backend_http_settings {
    name                  = local.http_api
    cookie_based_affinity = "Disabled"
    port                  = 443
    protocol              = "Https"
    request_timeout       = 20
  }

  http_listener {
    name                           = local.listener_http
    frontend_ip_configuration_name = local.gw_ip
    frontend_port_name             = local.gw_port_http
    protocol                       = "Http"
    host_name                      =  "${var.principal_dns_name}.${var.zone_dns_name}" 
  }

  http_listener {
    name                           = local.listener_https
    frontend_ip_configuration_name = local.gw_ip
    frontend_port_name             = local.gw_port_https
    protocol                       = "Https"
    host_name                      = "${var.principal_dns_name}.${var.zone_dns_name}"
    ssl_certificate_name           = "cert-principal"
  }

  http_listener {
    name                           = local.listener_minio
    frontend_ip_configuration_name = local.gw_ip
    frontend_port_name             = local.gw_port_https
    protocol                       = "Https"
    host_name                      = "${var.minio_dns_name}.${var.zone_dns_name}"
    ssl_certificate_name           = "cert-minio"
  }

  http_listener {
    name                           = local.listener_api
    frontend_ip_configuration_name = local.gw_ip
    frontend_port_name             = local.gw_port_https
    protocol                       = "Https"
    host_name                      = "${var.api_dns_name}.${var.zone_dns_name}"
    ssl_certificate_name           = "cert-api"
  }

  http_listener {
    name                           = local.listener_static
    frontend_ip_configuration_name = local.gw_ip
    frontend_port_name             = local.gw_port_https
    protocol                       = "Https"
    host_name                      = "${var.static_dns_name}.${var.zone_dns_name}"
    ssl_certificate_name           = "cert-static"
  }

  request_routing_rule {
    name                        = local.rule_public
    rule_type                   = "Basic"
    http_listener_name          = local.listener_http
    redirect_configuration_name = "redirectrule"
  }

  redirect_configuration {
    name          = "redirectrule"
    redirect_type = "Permanent"
    target_url    = "https://www.trq-dev.cl"
  }

  request_routing_rule {
    name                       = local.rule_minio
    rule_type                  = "Basic"
    http_listener_name         = local.listener_minio
    backend_address_pool_name  = local.backend_minio
    backend_http_settings_name = local.http_minio
  }

  request_routing_rule {
    name                       = local.rule_static
    rule_type                  = "Basic"
    http_listener_name         = local.listener_static
    backend_address_pool_name  = local.backend_static
    backend_http_settings_name = local.http_public
  }

  request_routing_rule {
    name                       = local.listener_https
    rule_type                  = "Basic"
    http_listener_name         = local.listener_https
    backend_address_pool_name  = local.backend_public
    backend_http_settings_name = local.http_public
  }

  request_routing_rule {
    name                       = local.listener_api
    rule_type                  = "PathBasedRouting"
    http_listener_name         = local.listener_api
    backend_address_pool_name  = local.backend_api
    backend_http_settings_name = local.http_public
    url_path_map_name          = "urlmap"
  }
  url_path_map {
    name      = "urlmap"
    default_backend_address_pool_name  = local.backend_api
    default_backend_http_settings_name = local.http_public
    path_rule {
      name                       = "DEFAULT"
      paths                      = ["/*"]
      backend_address_pool_name  = local.backend_api
      backend_http_settings_name = local.http_public
     }
   path_rule {
      name                       = "API"
      paths                      = ["/api*"]
      backend_address_pool_name  = local.backend_api
      backend_http_settings_name = local.http_public
     }
   path_rule {
      name                       = "ADMIN"
      paths                      = ["/admin*"]
      backend_address_pool_name  = local.backend_admin
      backend_http_settings_name = local.http_public
     }
  }
}
