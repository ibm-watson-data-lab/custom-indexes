// connect to Cloudant
var cloudant = require('cloudant');
var url = process.env.CLOUDANT_URL || 'http://localhost:5984';
var dbname = process.env.DBNAME || 'pageviews';
var db = cloudant({url:url , plugin: 'promises'}).db.use(dbname);

// connect to Redis
var redis = require("redis");
var redisurl = process.env.REDIS_URL || 'redis://localhost:6379';
var client = redis.createClient(redisurl);
var redis_leaderboard = 'leaderboard';
var redis_ipcount = 'ipcount';

// listen to changes 
var feed = db.follow({since: 'now', include_docs:true});
feed.on('change', function(change) {
  if (change.doc && change.doc.path && change.doc.ip) {
    
    // do multiple Redis commands in 1
    client.multi()
      // increment the leaderboard sorted set
      .zincrby(redis_leaderboard, 1, change.doc.path)
      // add the IP to the HyperLogLog data set
      .pfadd(redis_ipcount, change.doc.ip)
      // execute both actions together
      .exec();
    console.log('change', change.doc.path, change.doc.ip);
  }
});
feed.follow();
