// connect to Cloudant
var cloudant = require('cloudant');
var url = process.env.CLOUDANT_URL || 'http://localhost:5984';
var dbname = process.env.DBNAME || 'pageviews';
var db = cloudant({url:url , plugin: 'promises'}).db.use(dbname);

// connect to Redis
var redis = require("redis");
var redisurl = process.env.REDIS_URL || 'redis://localhost:6379';
var client = redis.createClient(redisurl);

// pad
function pad(number) {
  return ("0"+number).slice(-2); 
}

// listen to changes 
var feed = db.follow({since: 'now', include_docs:true});
feed.on('change', function(change) {
  if (change.doc && change.doc.date && change.doc.path && change.doc.ip) {
    
    var d = new Date(change.doc.date);
    var datestr = d.getUTCFullYear() + '-' + (pad(d.getUTCMonth()+1));
    var leaderboard = 'leaderboard_' + datestr;
    var ipcount =  'ipcount_' + datestr;

    // do multiple Redis commands in 1
    client.multi()
      // increment the leaderboard sorted set
      .zincrby(leaderboard, 1, change.doc.path)
      // add the IP to the HyperLogLog data set
      .pfadd(ipcount, change.doc.ip)
      // execute both actions together
      .exec();
    console.log('change', change.doc.path, change.doc.ip);
  }
});
feed.follow();
