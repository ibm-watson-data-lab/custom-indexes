#!/bin/bash

# clear out
wsk action delete leaderboard/onchange
wsk package delete leaderboard
wsk package delete leaderboardCloudant
wsk trigger delete leaderboardTrigger
wsk rule delete leaderboardRule