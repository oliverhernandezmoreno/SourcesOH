
data "azurerm_client_config" "current" {}

resource "azurerm_key_vault" "key" {
  name                            = var.key_vault_name
  location                        = azurerm_resource_group.rg.location
  resource_group_name             = azurerm_resource_group.rg.name
  enabled_for_disk_encryption     = true
  tenant_id                       = data.azurerm_client_config.current.tenant_id
  soft_delete_enabled             = true
  purge_protection_enabled        = true
  enabled_for_deployment          = true
  enabled_for_template_deployment = true

  sku_name = "premium"

  access_policy {
    tenant_id = data.azurerm_client_config.current.tenant_id
    object_id = data.azurerm_client_config.current.object_id

    certificate_permissions = ["create","delete","deleteissuers","get","getissuers","import","list",
                               "listissuers","managecontacts","manageissuers","setissuers","update",
                               "recover","backup","restore"]

    key_permissions = ["backup","create","delete","get","list","recover","restore","update","import"]

    secret_permissions = ["backup","delete","get","list","recover","restore","set"]
}

    access_policy {
    tenant_id = data.azurerm_client_config.current.tenant_id
    object_id = azurerm_user_assigned_identity.appgw.principal_id
    
    certificate_permissions = ["Get","List","Update","Create","Import","Delete","Recover","Backup",
                               "Restore","ManageContacts","ManageIssuers","GetIssuers","ListIssuers",
                               "SetIssuers","DeleteIssuers"]

    secret_permissions = ["get","recover"]
}

  network_acls {
    default_action = "Allow"
    bypass         = "AzureServices"
  }

}

 data "azurerm_key_vault_secret" "minio" {
  name         = azurerm_key_vault_certificate.minio.name
  key_vault_id = azurerm_key_vault.key.id
 }
 
 data "azurerm_key_vault_secret" "www" {
  name         = azurerm_key_vault_certificate.www.name
  key_vault_id = azurerm_key_vault.key.id
 }

 data "azurerm_key_vault_secret" "w2" {
  name         = azurerm_key_vault_certificate.w2.name
  key_vault_id = azurerm_key_vault.key.id
 }

 data "azurerm_key_vault_secret" "static" {
  name         = azurerm_key_vault_certificate.static.name
  key_vault_id = azurerm_key_vault.key.id
 }

resource "azurerm_key_vault_certificate" "minio" {
  name         = "bucket"
  key_vault_id = azurerm_key_vault.key.id

  certificate {
    contents = filebase64("./cert/pem/minio.onr.cl/cert-minio.pfx")
    password = ""
  }

  certificate_policy {
    issuer_parameters {
      name = "Unknown"
    }

    key_properties {
      exportable = true
      key_size   = 2048
      key_type   = "RSA"
      reuse_key  = false
    }

    secret_properties {
      content_type = "application/x-pkcs12"
    }
  }
}

resource "azurerm_key_vault_certificate" "w2" {
  name         = "api"
  key_vault_id = azurerm_key_vault.key.id

  certificate {
    contents = filebase64("./cert/pem/w2.onr.cl/cert-w2.pfx")
    password = ""
  }

  certificate_policy {
    issuer_parameters {
      name = "Unknown"
    }

    key_properties {
      exportable = true
      key_size   = 2048
      key_type   = "RSA"
      reuse_key  = false
    }

    secret_properties {
      content_type = "application/x-pkcs12"
    }
  }
}

resource "azurerm_key_vault_certificate" "www" {
  name         = "site-principal"
  key_vault_id = azurerm_key_vault.key.id

  certificate {
    contents = filebase64("./cert/pem/www.onr.cl/cert-www.pfx")
    password = ""
  }

  certificate_policy {
    issuer_parameters {
      name = "Unknown"
    }

    key_properties {
      exportable = true
      key_size   = 2048
      key_type   = "RSA"
      reuse_key  = false
    }

    secret_properties {
      content_type = "application/x-pkcs12"
    }
  }
}

resource "azurerm_key_vault_certificate" "static" {
  name         = "static"
  key_vault_id = azurerm_key_vault.key.id

  certificate {
    contents = filebase64("./cert/pem/static.onr.cl/cert-static.pfx")
    password = ""
  }

  certificate_policy {
    issuer_parameters {
      name = "Unknown"
    }

    key_properties {
      exportable = true
      key_size   = 2048
      key_type   = "RSA"
      reuse_key  = false
    }

    secret_properties {
      content_type = "application/x-pkcs12"
    }
  }
}
