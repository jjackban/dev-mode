#!/bin/bash
cd $GOPATH/src/dev-mode/explorer

echo "Explorer 컨테이너 실행"
docker-compose up -d
