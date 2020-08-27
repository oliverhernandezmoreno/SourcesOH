cd
tar xzf monolith.tgz
cp ~/fullchain.pem ~/tranque/base/proxy/fullchain.pem
cp ~/privkey.pem ~/tranque/base/proxy/privkey.pem
sh ~/docker-login.sh.secret
cd ~/tranque
./install.sh ~/monolith-keyfile
sed -i "s/NAMESPACE=<to-be-defined>/NAMESPACE=$(cat ~/namespace)/g" config/.env.secrets
./install.sh

while ! docker-compose run --rm archivist check ; do sleep 3 ; done
docker-compose run --rm archivist restore -y latest
docker-compose up -d
