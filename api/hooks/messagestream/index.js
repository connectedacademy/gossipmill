module.exports = function(sails)
{
    return {
        initialize:(cb)=>{

            sails.on('hook:orm:loaded', async function() {

                Message.getDB().liveQuery('LIVE SELECT FROM message WHERE processed = true')
                .on('live-update',async function(data){
                    await processMessage('UPDATE', data.content);
                })
                // .on('live-insert',async function(data){
                //     await processMessage('INSERT', data.content);
                // })
                // .on('live-delete',async function(data){
                //     await processMessage('DELETE', data.content);
                // });
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