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

let messages = require('./messages.json');

let sendMessage = function(msg)
{
    msg.entities.urls = [{
        expanded_url:"https://testclass.connectedacademy.io/5/submission"
    }];
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

//initial load:
for (i=0;i<100;i++)
{
    let raw = messages.pop();
    raw.createdAt = new Date(raw.createdAt);
    delete raw.rid;
    delete raw['@rid'];
    console.log("Injecting " + JSON.stringify(raw));
    sendMessage(raw);
}

setInterval(function()
{
    let raw = messages.pop();
    raw.createdAt = new Date(raw.createdAt);
    delete raw.rid;
    delete raw['@rid'];
    // let msg = getMessage(raw);
    console.log("Injecting " + JSON.stringify(raw));
    sendMessage(raw);
},5000);
