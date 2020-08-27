provider "azurerm" {
  # The "feature" block is required for AzureRM provider 2.x. 
  # If you are using version 1.x, the "features" block is not allowed.
  version = "~>2.0"
  features {
    #key_vault {
    #  purge_soft_delete_on_destroy =false
    #}
  }
}

terraform {
    backend "azurerm" {}
}

