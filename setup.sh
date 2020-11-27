#!/bin/bash

shopt -s expand_aliases

echo $1

alias awsd='docker run --rm -ti -v ~/.aws:/root/.aws -v $(pwd):/aws amazon/aws-cli'

awsd configure set profile.localstack.aws_access_key_id dummy
awsd configure set profile.localstack.aws_secret_access_key dummy
awsd configure set profile.localstack.region ap-northeast-1
awsd configure set profile.localstack.format json

sed -i "2ialias awsd='docker run --rm -ti -v ~/.aws:/root/.aws -v $(pwd):/aws amazon/aws-cli'" ~/.profile
sed -i "2ialias awsdl='awsd --endpoint-url=http://$1:4566 --profile=localstack'" ~/.profile

source ~/.profile

LOCALHOST_IP_ADDRESS=$1 docker-compose up -d

exit 0
