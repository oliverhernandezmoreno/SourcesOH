provider "azurerm" {
  version = "~>2.0"
  features {
  key_vault {
    purge_soft_delete_on_destroy = true
    }
  }
}

provider "kubernetes" {}

terraform {
    backend "azurerm" {}
}
