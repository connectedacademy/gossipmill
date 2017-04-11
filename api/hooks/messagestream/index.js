module.exports = function(sails)
{
    return {
        initialize:(cb)=>{

            let tokens = require('../../../config/settings.json');
            sails.tokens = tokens;
            sails.log.verbose('Messaging Tokens Loaded'); 

            sails.on('hook:orm:loaded', function() {

                return cb();


                Message.getDB().liveQuery('LIVE SELECT FROM message')
                .on('live-update',async function(data){
                    await processMessage(Message,'UPDATE', data.content);
                })
                .on('live-insert',async function(data){
                    await processMessage(Message,'INSERT', data.content);
                })
                .on('live-delete',async function(data){
                    await processMessage(Message,'DELETE', data.content);
                });

                //TODO: setup streaming connection to orientdb, on receipt of new record, process and add relationships based on criteria in the config
                
                //batch update existing messages in the db (in case the relationships have changed)
                



            });
        }
    }
}

var processMessage = async function(model, operation, message)
{
    //for each rule in settings
    sails.log.verbose("Process Message",operation,message.id);
    //for each rule:

    //build relationship with rule:
    _.each(sails.tokens,(token)=>{

    });

    //process for each subscriber:
    await SubscriptionManager.processNewMessageForSubscribers(message);

    return;
}