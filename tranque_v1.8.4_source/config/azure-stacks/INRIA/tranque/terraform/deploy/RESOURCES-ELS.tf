resource "azurerm_network_interface" "els" {
  name                = var.network_els_name
  location            = azurerm_resource_group.db.location
  resource_group_name = azurerm_resource_group.db.name

  ip_configuration {
    name                          = "IP-ELS"
    subnet_id                     = azurerm_subnet.subnet4.id
    private_ip_address_allocation = "Static"
    private_ip_address            = "172.30.4.36"
    #public_ip_address_id          = azurerm_public_ip.iprabbit.id

  }
  tags = {Name = "ELS"}

  timeouts {
    create = "5m"
    delete = "10m"
  }
}

resource "azurerm_virtual_machine" "els" {
  name                  = var.server_els_name
  location              = azurerm_resource_group.db.location
  resource_group_name   = azurerm_resource_group.db.name
  network_interface_ids = [azurerm_network_interface.els.id]
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
    name              = "els-hd"
    caching           = "ReadWrite"
    create_option     = "FromImage"
    managed_disk_type = "Standard_LRS"
  }
  os_profile {
    computer_name  = "els"
    admin_username = var.els_user
    admin_password = var.els_passw
  }
  os_profile_linux_config {
    disable_password_authentication = false
  }
  tags = {Name =  "ELS"}  
}

resource "azurerm_network_security_group" "nsg2" {
  name                = "ELS-NSG"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
}

resource "azurerm_network_interface_security_group_association" "nsgasoc2" {
  network_interface_id      = azurerm_network_interface.els.id
  network_security_group_id = azurerm_network_security_group.nsg2.id
}

resource "azurerm_virtual_machine_extension" "shell2" {
  name                 = "script2"
  virtual_machine_id   = azurerm_virtual_machine.els.id
  publisher            = "Microsoft.Azure.Extensions"
  type                 = "CustomScript"
  type_handler_version = "2.0"

  settings = <<SETTINGS
    {
        "fileUris":["https://storagetraque.blob.core.windows.net/codigo/script2.sh"],
        "commandToExecute": "sudo sh script2.sh"

    }
  SETTINGS
}
