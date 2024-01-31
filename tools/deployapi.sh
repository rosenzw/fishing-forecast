#!/usr/bin/env sh
aws --profile yampa apigateway put-rest-api --rest-api-id tjds2xlbe2 --mode merge --body "fileb://../api/api-spec.yml"