// external modules
var redis = require("redis");

// pad
function pad(number) {
  return ("0"+number).slice(-2); 
}

// entry point for OpenWhisk
var main = function(opts) {

  // connect to Redis
  var redisurl = opts.REDIS_URL;
  var client = redis.createClient(redisurl);

  return new Promise(function(resolve, reject) {
    var d = new Date();
    var datestr = d.getUTCFullYear() + '-' + (pad(d.getUTCMonth()+1));
    var args =  ['leaderboard_' + datestr, +Infinity, 0, 'withscores', 'limit', 0, 10];
    client.zrevrangebyscore(args, function(err, data) {
      if (err) {
        return reject(new Error(err));
      }
      var obj= {};
      for(var i=0; i < data.length; i += 2) {
        obj[data[i]] = data[i+1];
      }
      client.end(true);
      resolve({ top_ten: obj, datestr: datestr });
    });
  });
};
