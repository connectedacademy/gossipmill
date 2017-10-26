let redis = require('redis');
let RedisIO = require('ioredis');
let redisIO = new RedisIO(process.env.REDIS_PORT, process.env.REDIS_HOST,{
    db:2
}); //new Redis(6379, '192.168.1.1')

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

    removeMatching: function (keyPattern) {
        return new Promise((resolve, reject) => {
            redisIO.keys(`${keyPattern}:*`).then(function (keys) {
                // Use pipeline instead of sending
                // one command each time to improve the
                // performance.
                var pipeline = redisIO.pipeline();
                keys.forEach(function (key) {
                    pipeline.del(key);
                });
                resolve(pipeline.exec());
            });
        });
    }
}