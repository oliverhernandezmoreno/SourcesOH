#/bin/bash

#frontend
sudo docker pull registry.gitlab.com/inria-chile/tranque/e700-frontend/smc:{frontend_version}
sudo docker tag registry.gitlab.com/inria-chile/tranque/e700-frontend/smc:{frontend_version} tranqueacr.azurecr.io/tranque/e700-frontend/smc:{frontend_version}
sudo docker push tranqueacr.azurecr.io/tranque/e700-frontend/smc:{frontend_version}

#backend
sudo docker pull registry.gitlab.com/inria-chile/tranque/backend:{backend_version}
sudo docker tag registry.gitlab.com/inria-chile/tranque/backend:{backend_version} tranqueacr.azurecr.io/tranque/backend:{backend_version}
sudo docker push tranqueacr.azurecr.io/tranque/backend:{backend_version}

#backend static-nginx
sudo docker pull registry.gitlab.com/inria-chile/tranque/backend/static-nginx:{backend_version}
sudo docker tag registry.gitlab.com/inria-chile/tranque/backend/static-nginx:{backend_version} tranqueacr.azurecr.io/tranque/backend/static-nginx:{backend_version}
sudo docker push tranqueacr.azurecr.io/tranque/backend/static-nginx:{backend_version}

#enrichment
sudo docker pull registry.gitlab.com/inria-chile/tranque/enrichment:{enrichment_version}
sudo docker tag registry.gitlab.com/inria-chile/tranque/enrichment:{enrichment_version} tranqueacr.azurecr.io/tranque/enrichment:{enrichment_version}
sudo docker push tranqueacr.azurecr.io/tranque/enrichment:{enrichment_version}
