let redis = require('redis');
let RedisIO = require('ioredis');

// query cache connection
let redisIO = new RedisIO(process.env.REDIS_PORT, process.env.REDIS_HOST,{
    db:5
});

//subscription cache connection
let rediscache = redis.createClient({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    db:2
});
let Promise = require('bluebird');
Promise.promisifyAll(redis.RedisClient.prototype);

let md5 = require('md5');

module.exports = {
    queryCache: async function (model, hashIn, query, params) {
        sails.log.silly('Attempting Redis Cache for', model, hashIn, query, params);

        // console.log(model.identity);
        let key = `gm:${model.identity}:${md5(hashIn)}:${md5(model + query + params)}`;

        try {
            let resp = await rediscache.getAsync(key);
            if (resp) {
                sails.log.silly('Using redis cache for ' + key);
                return JSON.parse(resp);
            }
            else {
                sails.log.silly('Running query for ' + key);

                let results = await model.query(query, params);

                //if succeeds, put in cache
                rediscache.set(key, JSON.stringify(results)||[]);
                rediscache.expire(key, 1800); // 30 mins
                return results;
            }
        }
        catch (e) {
            sails.log.error(e);
            throw new Error("No live data or cache available for " + key);
        }
    },

    getAllKeys:function(keyPattern)
    {
        // console.log("pattern:" + keyPattern);
        return new Promise((resolve, reject) => {
            let stream = redisIO.scanStream({
                match: keyPattern
            });
            // let results = [];
            stream.on('data', function (keys) {

                if (keys.length) {
                    var pipeline = redisIO.pipeline();
                    keys.forEach(function (key) {
                        pipeline.get(key);
                    });
                    pipeline.exec(function(err,results){
                        resolve(_.map(results,function(obj){
                            return obj[1];
                        }));
                    });
                }
                else
                {
                    resolve([]);
                }
            });
            stream.on('end', function () {

            });
        });
    }
}