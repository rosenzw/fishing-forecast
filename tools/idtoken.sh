#!/bin/bash

source ../.env
username="<username>"
password="<password>"
clientid=$EXPO_PUBLIC_AWS_USER_POOL_CLIENT_ID
region="us-west-2"
aws_profile="yampa"

token_request=`aws cognito-idp initiate-auth --auth-flow USER_PASSWORD_AUTH --output json --region $region --client-id $clientid --auth-parameters USERNAME=$username,PASSWORD=$password --profile $aws_profile`

#echo $token_request
# Regular expression to match the IdToken
pattern="\"IdToken.*"

# Find the match
match=$(echo "$token_request" | grep -o "$pattern")

echo $match