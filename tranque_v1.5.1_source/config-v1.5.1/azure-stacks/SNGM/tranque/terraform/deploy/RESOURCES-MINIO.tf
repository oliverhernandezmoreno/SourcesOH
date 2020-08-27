resource "azurerm_network_interface" "minio" {
  name                = var.network_name
  location            = azurerm_resource_group.aks.location
  resource_group_name = azurerm_resource_group.aks.name

  ip_configuration {
    name                          = "IP-MINIO"
    subnet_id                     = azurerm_subnet.subnet3.id
    private_ip_address_allocation = "Static"
    private_ip_address            = "172.30.3.4"
    public_ip_address_id          = azurerm_public_ip.ipminio.id

  }
  tags = {Name = "MINIO"}

  timeouts {
    create = "5m"
    delete = "10m"
  }
}

resource "azurerm_virtual_machine" "minio" {
  name                  = var.server_minio_name
  location              = azurerm_resource_group.aks.location
  resource_group_name   = azurerm_resource_group.aks.name
  network_interface_ids = [azurerm_network_interface.minio.id]
  vm_size               = "Standard_A2"

  # Uncomment this line to delete the OS disk automatically when deleting the VM
   delete_os_disk_on_termination = true

  # Uncomment this line to delete the data disks automatically when deleting the VM
   delete_data_disks_on_termination = true

  timeouts {
    create = "5m"
    delete = "10m"
  }

  storage_image_reference {
    publisher = "Canonical"
    offer     = "UbuntuServer"
    sku       = "18.04-LTS"
    version   = "latest"
  }
  storage_os_disk {
    name              = "minio-hd"
    caching           = "ReadWrite"
    create_option     = "FromImage"
    managed_disk_type = "Standard_LRS"
  }
  os_profile {
    computer_name  = "minio"
    admin_username = "sysadmin"
    admin_password = "~Wj248a2b=Tz"
  }
  os_profile_linux_config {
    disable_password_authentication = false
  }
  tags = {Name =  "MINIO"}  
}

resource "azurerm_network_security_group" "nsg" {
  name                = "MINIO-NSG"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
}

resource "azurerm_network_interface_security_group_association" "nsgasoc" {
  network_interface_id      = azurerm_network_interface.minio.id
  network_security_group_id = azurerm_network_security_group.nsg.id
}

resource "azurerm_virtual_machine_extension" "shell" {
  name                 = "script"
  virtual_machine_id   = azurerm_virtual_machine.minio.id
  publisher            = "Microsoft.Azure.Extensions"
  type                 = "CustomScript"
  type_handler_version = "2.0"

  settings = <<SETTINGS
    {
        "fileUris":["https://storagetranque2.blob.core.windows.net/codigo/script.sh"],
        "commandToExecute": "sudo sh script.sh"

    }
  SETTINGS
}
