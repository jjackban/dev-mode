#!/bin/bash

cd $GOPATH/src/dev-mode/basic-network/docker

echo "노드 컨테이너 실행"

export COMPOSE_PROJECT_NAME=fabric
export IMAGE_TAG=2.2.2
export SYS_CHANNEL=system-channel

if [ "$1" == "dev" ]; then
  docker-compose -f docker-compose-test-net.yaml up -d cli
  docker-compose -f docker-compose-test-net.yaml up -d orderer.example.com
elif [ "$1" == "prod" ]; then
  docker-compose -f docker-compose-prod.yaml up -d cli
  docker-compose -f docker-compose-prod-org3.yaml up -d cli-org3
  docker-compose -f docker-compose-prod.yaml up -d orderer.example.com orderer2.example.com
else
  echo -n "unknown parameter"
  exit 1
fi

docker ps
