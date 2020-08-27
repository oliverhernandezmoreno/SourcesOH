#!/bin/sh

cd ../../

echo "Input Tranque version:"
read tranque_version

echo "Input frontend version:"
cd ../frontend
git tag
read frontend_version

echo "Input backend version:"
cd ../backend
git tag
read backend_version

echo "Input enrichment version:"
cd ../enrichment
git tag
read enrichment_version

echo "Input stream-snapshot version:"
cd ../stream-snapshot
git tag
read stream_snapshot_version

echo "Input beats-consumer version:"
cd ../beats-consumer
git tag
read beats_consumer_version

echo "Input stats version:"
cd ../stats
git tag
read stats_version

echo "Input archivist version:"
cd ../archivist
git tag
read archivist_version

echo "Input config version:"
cd ../config
git tag
read config_version

cd ../config/release-tools/alpha

echo "Input source branch:"
read branch

date=$(date '+%Y-%m-%d_%H-%M-%S')

echo "Building the Release ${tranque_version} to Alpha..."

# 1. Create tags
./tags.sh ${tranque_version} ${frontend_version} ${backend_version} ${enrichment_version} ${stream_snapshot_version} ${beats_consumer_version} ${stats_version} ${archivist_version} ${config_version} ${branch} ${date}

# 2. Deploy
echo Please, confirm in the following links that the new versions images were registered:
echo https://gitlab.com/Inria-Chile/tranque/e700-frontend/container_registry
echo https://gitlab.com/Inria-Chile/tranque/backend/container_registry
echo https://gitlab.com/Inria-Chile/tranque/enrichment/container_registry
echo https://gitlab.com/Inria-Chile/tranque/stream-snapshot/container_registry
echo https://gitlab.com/Inria-Chile/tranque/beats-consumer/container_registry
echo https://gitlab.com/Inria-Chile/tranque/stats/container_registry
echo https://gitlab.com/Inria-Chile/tranque/archivist/container_registry
echo https://gitlab.com/Inria-Chile/tranque/config/container_registry
echo "Are registered OK (y:yes or n:not)?"
read answer
if [ "$answer" != "${answer#[Yy]}" ] ;then
  ./sml/deploy.sh ${1} ${2} ${3} ${4} ${5} ${6} ${7} ${8} ${9} ${date}
  ./smc/deploy.sh ${1} ${2} ${3} ${4} ${5} ${6} ${7} ${8} ${9} ${date}

  # 3. Restart
  echo "Are OK for re-start SML and SMC (y:yes or n:not)?"
  read answer
  if [ "$answer" != "${answer#[Yy]}" ] ;then
    ./sml/restart.sh ${1} ${date}
    ./smc/restart.sh ${1} ${date}
  else
    echo Restart of SML and SMC were not done.
  fi
else
  echo Deploy of SML and SMC were not done.
fi

curl -X POST --data-urlencode "payload={\"channel\": \"#entregas\", \"username\": \"webhookbot\", \"text\": \"@here SML Alpha Release ${tranque_version} was done.\", \"icon_emoji\": \":ghost:\"}" https://hooks.slack.com/services/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
curl -X POST --data-urlencode "payload={\"channel\": \"#entregas\", \"username\": \"webhookbot\", \"text\": \"@here SMC Alpha Release ${tranque_version} was done.\", \"icon_emoji\": \":ghost:\"}" https://hooks.slack.com/services/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

echo "Release ${tranque_version} was finished"
