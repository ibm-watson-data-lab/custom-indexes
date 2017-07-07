// external modules
var redis = require("redis");
var cloudant = require('cloudant');

// pad
function pad(number) {
  return ("0"+number).slice(-2); 
}

// write data to Redis
var writeToRedis = function(client, doc) {
  return new Promise(function(resolve, reject) {
    
    // parse the date
    var d = new Date(doc.date);
    var datestr = d.getUTCFullYear() + '-' + (pad(d.getUTCMonth()+1));
    var leaderboard = 'leaderboard_' + datestr;
    var ipcount = 'ipcount_' + datestr;

    // do multiple Redis commands in 1
    client.multi()
      // increment the leaderboard sorted set
      .zincrby(leaderboard, 1, doc.path)
      // add the IP to the HyperLogLog data set
      .pfadd(ipcount, doc.ip)
      // execute both actions together
      .exec(function(err, replies) {
        if (err) {
          return reject(err);
        } else {
          return resolve(replies);
        }
      });
  });
};

// entry point for OpenWhisk
var main = function(opts) {
  if (!opts.host || !opts.username || !opts.password || !opts.dbname || !opts.id) {
    return new Error('Missing default parameter');
  }

  // connect to Redis
  var redisurl = opts.REDIS_URL;
  var client = redis.createClient(redisurl);

  // cloudant connection
  var conn = { 
    account: opts.host, 
    username: opts.username, 
    password: opts.password, 
    plugin: 'promises'
  };
  var db = cloudant(conn).db.use(opts.dbname);

  // read the Cloudant doc
  return db.get(opts.id).then(function(doc) {
    if (doc && doc.date && doc.path && doc.ip) {
      // write the data to  Redis
      return writeToRedis(client, doc);
    } else {
      return new Error('Missing date, path or ip attributes');
    }
  }).then(function(replies) {
    return {ok: true};
  });;
};

exports.main = main;