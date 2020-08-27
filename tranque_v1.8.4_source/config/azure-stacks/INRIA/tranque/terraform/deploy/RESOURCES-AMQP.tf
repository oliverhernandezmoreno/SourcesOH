resource "azurerm_network_interface" "rabbit" {
  name                = var.network_rabbit_name
  location            = azurerm_resource_group.db.location
  resource_group_name = azurerm_resource_group.db.name

  ip_configuration {
    name                          = "IP-RABBIT"
    subnet_id                     = azurerm_subnet.subnet4.id
    private_ip_address_allocation = "Static"
    private_ip_address            = "172.30.4.35"
    public_ip_address_id          = azurerm_public_ip.iprabbit.id

  }
  tags = {Name = "RABBIT"}

  timeouts {
    create = "5m"
    delete = "10m"
  }
}

resource "azurerm_virtual_machine" "rabbit" {
  name                  = var.server_rabbit_name
  location              = azurerm_resource_group.db.location
  resource_group_name   = azurerm_resource_group.db.name
  network_interface_ids = [azurerm_network_interface.rabbit.id]
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
    name              = "rabbit-hd"
    caching           = "ReadWrite"
    create_option     = "FromImage"
    managed_disk_type = "Standard_LRS"
  }
  os_profile {
    computer_name  = "rabbit"
    admin_username = var.rabbit_user
    admin_password = var.rabbit_passw
  }
  os_profile_linux_config {
    disable_password_authentication = false
  }
  tags = {Name =  "RABBIT"}  
}

resource "azurerm_network_security_group" "nsg1" {
  name                = "RABBIT-NSG"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  security_rule {
        name                       = "Port_15672"
        priority                   = 1001
        direction                  = "Inbound"
        access                     = "Allow"
        protocol                   = "Tcp"
        source_port_range          = "*"
        destination_port_range     = "15672"
        source_address_prefix      = "*"
        destination_address_prefix = "*"
    }
   security_rule {
        name                       = "Port_5672"
        priority                   = 1002
        direction                  = "Inbound"
        access                     = "Allow"
        protocol                   = "Tcp"
        source_port_range          = "*"
        destination_port_range     = "5672"
        source_address_prefix      = "*"
        destination_address_prefix = "*"
    }
  tags = {Name =  "NSG-RABBIT"}
}

resource "azurerm_network_interface_security_group_association" "nsgasoc1" {
  network_interface_id      = azurerm_network_interface.rabbit.id
  network_security_group_id = azurerm_network_security_group.nsg1.id
}

resource "azurerm_virtual_machine_extension" "shell1" {
  name                 = "script1"
  virtual_machine_id   = azurerm_virtual_machine.rabbit.id
  publisher            = "Microsoft.Azure.Extensions"
  type                 = "CustomScript"
  type_handler_version = "2.0"

  settings = <<SETTINGS
    {
        "fileUris":["https://storagetraque.blob.core.windows.net/codigo/script1.sh"],
        "commandToExecute": "sudo sh script1.sh"

    }
  SETTINGS
}
