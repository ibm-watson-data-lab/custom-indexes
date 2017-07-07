#!/bin/bash

# don't deploy without env variables
if [[ -z "${CLOUDANT_HOST}" ]]; then
  echo "Environment variable CLOUDANT_HOST is required"
  exit 1
fi
if [[ -z "${CLOUDANT_USERNAME}" ]]; then
  echo "Environment variable CLOUDANT_USERNAME is required"
  exit 1
fi
if [[ -z "${CLOUDANT_PASSWORD}" ]]; then
  echo "Environment variable CLOUDANT_PASSWORD is required"
  exit 1
fi
if [[ -z "${CLOUDANT_DB}" ]]; then
  echo "Environment variable CLOUDANT_DB is required"
  exit 1
fi
if [[ -z "${REDIS_URL}" ]]; then
  echo "Environment variable REDIS_URL is required"
  exit 1
fi

# create a package called 'leaderboard' with our credentials 
wsk package create leaderboard --param REDIS_URL "$REDIS_URL" -p username "$CLOUDANT_USERNAME" -p password "$CLOUDANT_PASSWORD" -p host "$CLOUDANT_HOST"

# deploy our stream action to the package
wsk action create leaderboard/onchange onchange.js
wsk action create leaderboard/getipcount getipcount.js --web true
wsk action create leaderboard/getleaderboard getleaderboard.js --web true

# now the changes feed config
# create a Cloudant connection
wsk package bind /whisk.system/cloudant leaderboardCloudant -p username "$CLOUDANT_USERNAME" -p password "$CLOUDANT_PASSWORD" -p host "$CLOUDANT_HOST"

# a trigger that listens to our database's changes feed
wsk trigger create leaderboardTrigger --feed /_/leaderboardCloudant/changes --param dbname "$CLOUDANT_DB" 

# a rule to call our action when the trigger is fired
wsk rule create leaderboardRule leaderboardTrigger leaderboard/onchange


