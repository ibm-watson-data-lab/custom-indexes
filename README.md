# custom-indexers

This repository contains code that allows a Cloudant database to be indexed using a Redis database, in particular:

- creating a leaderboard of most-viewed blog posts
- creating a counts of distinct IP addresses that visit our site
- grouping both statistics into monthly buckets

## Installing

This is a Node.js project, so ensure have Node.js installed on your computer. Clone the repostory on to your machine:

    git clone https://github.com/ibm-watson-data-lab/custom-indexer
    cd custom-indexer
    npm install

## Creating a simple index

To keep an `leaderboard` and `ipcount` for database that contains documents of this form:

```js
{
  "_id": "96f898f0f6ff4a9baac4503992f31b01",
  "_rev": "1-ff7b85665c4c297838963c80ecf481a3",
  "path": "/blog/post-1.html",
  "date": "2017-07-04 17:15:59 +00:00",
  "mobile": true,
  "browser": "Chrome",
  "ip": "85.25.222.52"
}
```

create environment variables containing the Cloudant and Redis credentials

```sh
export CLOUDANT_URL="https://USER:PASS@HOST.cloudant.com"
export DBNAME="pageviews"
export REDIS_URL="redis://x:PASS@HOST:PORT"
```

If omitted, a local CouchDB and Redis instance will be assumed.

Run the streaming app:

```sh
node stream.js
```

and add documents to your `pageviews` database.

Connect to Redis using the `redis-cli` tool:

```sh
redis-cli -h HOST -p PORT -a PASSWORD
```

and query the leaderboard with:

```
> ZREVRANGEBYSCORE 'leaderboard' +inf -inf WITHSCORES LIMIT 0 5
```

and the ipcount with:

```
> PFCOUNT ipcount
```

## Creating an index in monthly buckets

With the above environment variables still in place, run:

```sh
node stream_monthly.js
```

The Redis keys will be of the form `ipcount_2017-06` and `leaderboard_2017-06`, respectively.

## Deploying to OpenWhisk

Ensure you have the `wsk` command-line tool installed and configured.

Create environment variables:

```sh
export CLOUDANT_HOST="HOST.cloudant.com"
export CLOUDANT_USERNAME="USER"
export CLOUDANT_PASSWORD="PASS"
export CLOUDANT_DB="pageviews"
export REDIS_URL="redis://x:PASS@HOSTNAME:PORT"
```

then run:

```sh
./deploy.sh
```
