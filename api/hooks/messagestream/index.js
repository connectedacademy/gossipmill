let Redis = require('ioredis');
let redis = new Redis(process.env.REDIS_PORT, process.env.REDIS_HOST); //new Redis(6379, '192.168.1.1')

module.exports = function(sails)
{
    return {
        initialize:(cb)=>{

            sails.on('hook:orm:loaded', async function() {

                redis.subscribe('messages', function (err, count) {
                    sails.log.info('Subscribed to messages channel on Redis');
                });

                redis.on('message', async function (channel, message) {
                    switch (channel)
                    {
                        case 'messages':
                            // let msg = JSON.parse(message);
                            sails.log.verbose('PubSub Message',message);
                            processMessage('UPDATE',message);
                            break;
                    }

                });

                cb();
            });
        }
    }
}

var processMessage = async function(operation, message)
{
    //for each rule in settings
    sails.log.verbose("Process Message",operation,message.id);

    if (operation == 'DELETE')
    {
        //TODO: deal with deleted messages (we get them from twitter?)

    }

    if (operation == 'UPDATE')
    {
        // Should not need to do anything here
        await SubscriptionManager.processNewMessageForSubscribers(message);
    }
    return;
}