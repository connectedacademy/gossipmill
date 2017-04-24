let _ = require('lodash');

// orientdb connection
let OrientDB = require('orientjs');

let server = OrientDB({
    host:       process.env.ORIENTDB_HOST,
    port:       process.env.ORIENTDB_PORT,
    username:   process.env.ORIENTDB_USERNAME,
    password:   process.env.ORIENTDB_PASSWORD
});
console.log("Connected to " + process.env.ORIENTDB_HOST);
let db = server.use(process.env.ORIENTDB_DB);




//EVERY N SECONDS, PUSH A NEW 'TWEET'

let messages = require('./messages.json');

// let getMessage = function(raw)
// {
//     delete raw._raw;

//     let newmessage = {};

//     newmessage.message_id = raw.id_str;
//     newmessage._raw = raw;
//     newmessage.text = raw.text;
//     newmessage.service = 'twitter';
//     newmessage.createdAt = new Date(raw.createdAt);
//     newmessage.entities = raw.entities;
//     newmessage.user = raw.user;
//     newmessage.lang = raw.lang;
//     newmessage.replyto = raw.replyto;
//     return newmessage;
// }

let sendMessage = function(msg)
{
    //publish to redis pubsub
    db.update('message')
    .set(msg)
    .upsert()
    .where({
        message_id: msg.message_id
    })
    .return('AFTER')
    .one()
    .then(function(result){
        console.log("Message Written " + result.id);
    }).catch(function(err){
        console.log(err);
    });
}

setInterval(function()
{
    let raw = _.sample(messages);
    raw.createdAt = new Date(raw.createdAt);
    delete raw.rid;
    delete raw['@rid'];
    // let msg = getMessage(raw);
    console.log("Injecting " + JSON.stringify(raw));
    sendMessage(raw);
},5000);
