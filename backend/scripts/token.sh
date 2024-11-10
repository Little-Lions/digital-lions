#!/bin/bash
# utility script that gets bearer token from auth server,
# copies it to your clipboard, and prints the decoded
# token to the console
URL=https://${OAUTH_DOMAIN}/oauth/token

TOKEN=$(curl \
  --request POST \
  --url ${URL} \
  --header 'content-type: application/x-www-form-urlencoded' \
  --data "grant_type=password" \
  --data "client_id=${OAUTH_CLIENT_ID}" \
  --data "client_secret=${OAUTH_CLIENT_SECRET}" \
  --data "audience=${OAUTH_AUDIENCE}" \
  --data "username=${USERNAME}" \
  --data "password=${PASSWORD}" )

printf "Response: \n $TOKEN \n"

JWT=$(jq -r '.access_token' <<<"$TOKEN")

printf "JWT:\n$JWT \n"

# this function is not production robust but does the job for dev prupose
function jwt-decode() {
  jq -R 'split(".") |.[0:2] | map(@base64d) | map(fromjson)' <<<$1
}

JWT_DECODED=$(jwt-decode $JWT)

printf "JWT decoded: \n $JWT_DECODED\n"

printf "Copying token to clipboard"
echo $JWT | pbcopy

