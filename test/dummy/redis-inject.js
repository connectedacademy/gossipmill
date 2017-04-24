let Redis = require("ioredis");
let _ = require('lodash');

let redis = new Redis(process.env.REDIS_PORT, process.env.REDIS_HOST);

redis.on('connect', function () {
    console.log("Redis Connected");        
});

redis.on('error', function (error) {
    console.log(error);
});


//EVERY N SECONDS, PUSH A NEW 'TWEET'

let messages = require('./messages.json');

let getMessage = function(raw)
{
    delete raw._raw;

    let newmessage = {};

    newmessage.message_id = raw.id_str;
    newmessage._raw = raw;
    newmessage.text = raw.text;
    newmessage.service = 'twitter';
    newmessage.createdAt = raw.createdAt;
    newmessage.entities = raw.entities;
    newmessage.user = raw.user;
    newmessage.lang = raw.lang;
    newmessage.replyto = raw.replyto;
    return newmessage;
}

let sendMessage = function(msg)
{
    //publish to redis pubsub
    redis.publish('messages', JSON.stringify(msg));
}

setTimeout(function()
{
    let raw = _.sample(messages);
    let msg = getMessage(raw);
    console.log("Injecting " + JSON.stringify(msg));
    sendMessage(msg);
},5000);


// let newmessage = {};

// newmessage.message_id = message.id_str;
// newmessage._raw = message;

// newmessage.text = message.text;
// newmessage.service = 'twitter';
// newmessage.createdAt = new Date(message.created_at);
// newmessage.entities = message.entities;
// newmessage.user = message.user.id;
// newmessage.lang = message.lang;
// newmessage.replyto = message.in_reply_to_status_id;

// logger.verbose(JSON.stringify(newmessage));

