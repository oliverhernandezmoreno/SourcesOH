terraform init -backend-config="storage_account_name=deployed" -backend-config="container_name=tfstat" -backend-config="access_key=4yLnNXEa7P2lWUMaSTeWmnE3BrpLNHiyz3epB1wlx/ZRqIEtB7AXKBUwVDiR0ouy5W4WUHSYrABvNCWZzm8S+A==" -backend-config="key=codelab.microsoft.infra"


#terraform import azurerm_application_gateway.appgw /subscriptions/0aba7d2d-cae4-427d-8362-89172ec33307/resourceGroups/RESOURCES-WEB/providers/Microsoft.Network/applicationGateways/AppGW-Tranque
#terraform import azurerm_virtual_machine_extension.minio /subscriptions/0aba7d2d-cae4-427d-8362-89172ec33307/resourceGroups/RESOURCES-AKS/providers/Microsoft.Compute/virtualMachines/MINIO-SVR/extensions/
#terraform import azurerm_virtual_machine.minio /subscriptions/0aba7d2d-cae4-427d-8362-89172ec33307/resourceGroups/RESOURCES-AKS/providers/Microsoft.Compute/virtualMachines/MINIO-SVR
#terraform import azurerm_virtual_network.vnet /subscriptions/0aba7d2d-cae4-427d-8362-89172ec33307/resourceGroups/RESOURCES/Microsoft.Network/virtualNetworks/TRANQUE-vnet
#terraform import azurerm_user_assigned_identity.id /subscriptions/0aba7d2d-cae4-427d-8362-89172ec33307/resourceGroups/RESOURCES/providers/Microsoft.ManagedIdentity/userAssignedIdentities/KV-ID
#terraform import azurerm_dns_a_record.wiki /subscriptions/0aba7d2d-cae4-427d-8362-89172ec33307/resourceGroups/RESOURCES-WEB//providers/Microsoft.Network/dnszones/onr.cl/A/wiki
#terraform import azurerm_user_assigned_identity.static /subscriptions/0aba7d2d-cae4-427d-8362-89172ec33307/resourceGroups/RESOURCES/providers/Microsoft.ManagedIdentity/userAssignedIdentities/KD-ID
