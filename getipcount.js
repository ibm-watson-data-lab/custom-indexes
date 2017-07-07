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
    client.pfcount('ipcount_' + datestr, function(err, data) {
      if (err) {
        return reject(new Error(err));
      }
      client.end(true);
      resolve({ count: data, datestr: datestr });
    });
  });
};
