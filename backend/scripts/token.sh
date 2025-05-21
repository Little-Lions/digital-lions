#!/bin/bash
# utility script that gets bearer token from auth server and writes it to stdout
URL=https://${AUTH0_SERVER}/oauth/token

TOKEN=$(curl \
  --request POST \
  --url ${URL} \
  --header 'content-type: application/x-www-form-urlencoded' \
  --data "grant_type=password" \
  --data "client_id=${AUTH0_CLIENT_ID}" \
  --data "client_secret=${AUTH0_CLIENT_SECRET}" \
  --data "audience=${AUTH0_AUDIENCE}" \
  --data "username=${USERNAME}" \
  --data "password=${PASSWORD}")

JWT=$(jq -r '.access_token' <<<"$TOKEN")

echo $JWT
