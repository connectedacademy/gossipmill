let redis = require('redis');
let rediscache = redis.createClient({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    db:5
});
let Promise = require('bluebird');
Promise.promisifyAll(redis.RedisClient.prototype);

module.exports = {

    //subscribe to a given query
    subscribe: async (req, subscription)=>{

        let roomname = 'query-'+subscription.socketid;

        rediscache.set(`gm:subscriptions:${roomname}`,JSON.stringify(subscription)); //  queryStore[roomname] = subscription;

        sails.log.silly('Attempting subscribe to / update', roomname);

        sails.sockets.join(req.socket, roomname, ()=>{
            sails.log.verbose('Subscription',{
                msg: 'Subscribed',
                room: roomname,
                socket:subscription.socketid,
                subscription: subscription
            });
        });

        return roomname;
    },

    unsubscribe: async(socketid)=>{
        let roomname = 'query-'+socketid;

        rediscache.del(`gm:subscriptions:${roomname}`);

        //delete queryStore[roomname];
        // console.log("unsubscribe:" + roomname);
        sails.sockets.leave(roomname,(err)=>{
            sails.log.error(err);
            sails.log.verbose('Subscription',{
                msg: 'Unsubscribes',
                room: roomname,
                socket:socketid
            });
        });
    },

    // process a live incoming message for all known subscribers
    processNewMessageForSubscribers: async (msg)=>{
        sails.log.verbose('Subscription',{msg:'Publishing message to pending subscriptions', msg:msg});

        let message = await Message.findOne({message_id:msg}).populate('user');
        Message.removeCircularReferences(message);

        //Find all keys in redis that match the pattern:
        let queryStore = await Cache.getAllKeys('gm:subscriptions:*');

        // console.log(queryStore);

        for (let q of queryStore)
        {
            // let roomname = q;
            let query = JSON.parse(q);

            if (Message.heuristicInMemory(query, message))
            {
                message.user = _.omit(message.user,'rid','credentials','account_credentials','_raw');
                // console.log(`Sending to query-${query.socketid}`);
                sails.sockets.broadcast(`query-${query.socketid}`, `query-${query.socketid}`, _.omit(message,'rid','_raw','user_from'));
                sails.log.verbose('Subscription',{msg:'Message sent to', message:message.message_id, subscribers: q});
            }
            else
            {
                sails.log.silly('Message not matching heuristic', message.message_id, query);
            }
        }
        return;
    }
}