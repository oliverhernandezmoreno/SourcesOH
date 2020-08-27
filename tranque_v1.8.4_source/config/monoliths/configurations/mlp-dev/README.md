# MLP tranque deployment

## Configure the EF and EMAC indices

Edit the `ef/setup.yml` and `emac/setup.yml` files according to your
needs. Then, to apply the configurations (from the root "tranque"
folder):

```bash
docker-compose run --rm -v $(pwd)/config:/config backend /config/ef/setup.sh
docker-compose run --rm -v $(pwd)/config:/config backend /config/emac/setup.sh
```

## Configure the PI, SGS and DGA data producers

The producers may be configured through their specifications in each
producer's folder:
- _pi-producer_ for the data fetched from PI System
- _sgs-producer_ for the data fetched from the SGS weather service
- _dga-producer_ for the data fetched from the DGA service

After modifying a producer, the corresponding containers need to be
restarted:

```bash
# docker-compose restart <producer>. For example:
docker-compose restart pi-producer
# watch logs with:
docker-compose logs --tail 10 -f pi-producer
```
