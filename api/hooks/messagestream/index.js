let fs = require('fs-promise');

module.exports = function(sails)
{
    return {
        initialize:(cb)=>{



            // let settings = require('../../../config/settings.json');
            // sails.tokens = settings.tokens;
            // sails.log.verbose('Messaging Tokens Loaded'); 

            sails.on('hook:orm:loaded', async function() {                

                // let unprocessed = await Message.find({processed:undefined});
                // sails.log.verbose('Processing ' + _.size(unprocessed) + ' records');
                // for (let msg of unprocessed)
                // {
                //     await processMessage('INSERT', msg);
                // }

                // Message.getDB().liveQuery('LIVE SELECT FROM message WHERE processed <> true')
                // // .on('live-update',async function(data){
                // //     await processMessage('UPDATE', data.content);
                // // })
                // .on('live-insert',async function(data){
                //     await processMessage('INSERT', data.content);
                // });
                // .on('live-delete',async function(data){
                //     await processMessage('DELETE', data.content);
                // });

                Message.getDB().liveQuery('LIVE SELECT FROM message WHERE processed = true')
                .on('live-update',async function(data){
                    await processMessage('UPDATE', data.content);
                });
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

// var linkToken = async function(token, message, field)
// {
//     // try find the token
//     let regex = new RegExp(token.regex.replace("\\\\","\\"));
//     // console.log(regex);

//     let results = regex.exec(field);
//     // console.log(results);
//     if (results)
//     {
//         let result = results[1];
//         // if the token is found, then find or create node for it
//         Token.findOrCreate({ type: token.name, name: result }, { type: token.name, name: result }, async (err, record)=>{
//             // create edge between the token and the message

//             // console.log(message.id);
//             if (message.id && record.id)
//             {
//                 try
//                 {
//                     let res = await Author.query("CREATE EDGE tokenin FROM " + record.id + " TO " + message.id +" SET createdAt = date(\"" + new Date().toISOString() + "\", \"yyyy-MM-dd'T'HH:mm:ss.SSS'Z'\", \"UTC\")");
//                     sails.log.verbose("Edge created", res);
//                 }
//                 catch (e)
//                 {
//                     sails.log.error(e);       
//                 }
//             }

//         });
//     }
//     else
//     {
//         sails.log.silly('Regex not found in string',token.regex,field);
//     }
// }

// var buildReMessageLink = async function(message)
// {
//     if (message.remessageto)
//     {
//     //find author record:
//         let msg = await Message.findOne({ message_id: message.remessageto.id_str, service: message.service });
//         // console.log(msg);
//         //if there is an author record, then link
//         if (msg)
//         {
//             try
//             {
//                 let res = await Reply.query("CREATE EDGE remessage FROM " + message.id + " TO " + msg.id +" SET createdAt = date(\"" + new Date().toISOString() + "\", \"yyyy-MM-dd'T'HH:mm:ss.SSS'Z'\", \"UTC\")");
//                 sails.log.verbose("Remessage (retweet) Linked ", res);
//             }
//             catch (e)
//             {
//                 sails.log.error(e);  
//             }
//         }
//         else{
//             sails.log.verbose('No Message record for building re-message ' + message.remessageto.id_str);
//         }
//     }
//     // });
// }

// var buildReplyLink = async function(message)
// {
//     //find author record:
//     if (message.replyto)
//     {
//         let msg = await Message.findOne({ message_id: message.replyto, service: message.service });
//         // console.log(msg);
//         //if there is an message record, then link
//         if (msg)
//         {
//             try
//             {
//                 let res = await Reply.query("CREATE EDGE reply FROM " + message.id + " TO " + msg.id +" SET createdAt = date(\"" + new Date().toISOString() + "\", \"yyyy-MM-dd'T'HH:mm:ss.SSS'Z'\", \"UTC\")");
//                 sails.log.verbose("Reply Linked ", res);
//             }
//             catch (e)
//             {
//                 sails.log.error(e);       
//             }
//         }
//         else{
//             sails.log.verbose('No message record for ' + message.replyto);
//         }
//     }
//     // });
// }

// var buildAuthorLink = async function(message)
// {
//     //find author record:
//     User.findOrCreate({ account_number: message.user_from.id_str, service: message.service },{ account_number: message.user_from.id_str, service: message.service, account:message.user_from.screen_name, profile:message.user_from.profile_image_url_https, name: message.user_from.name },async (err,user)=>{
        
//         //if there is an author record, then link
//         try
//         {
//             let res = await Author.query("CREATE EDGE author FROM " + user.id + " TO " + message.id +" SET createdAt = date(\"" + new Date().toISOString() + "\", \"yyyy-MM-dd'T'HH:mm:ss.SSS'Z'\", \"UTC\")");
//             sails.log.verbose("Author Linked ", res);
//         }
//         catch (e)
//         {
//             sails.log.error(e);       
//         }
//     });
// }

var processMessage = async function(operation, message)
{
    //for each rule in settings
    sails.log.verbose("Process Message",operation,message.id);

    // if (operation == 'INSERT')
    // {
    //     //link author:
    //     await buildAuthorLink(message);

    //     //link retweet
    //     await buildReMessageLink(message);

    //     //link reply
    //     await buildReplyLink(message);

    //     //build relationship with rule:
    //     for (let token of sails.tokens)
    //     {
    //         // for the body of the message
    //         await linkToken(token,message, message.text);

    //         if (message.entities)
    //         {
    //             //Twitter URLs
    //             if (message.entities.urls)
    //             {
    //                 for (let entity of message.entities.urls)
    //                 {
    //                     await linkToken(token, message, entity.expanded_url);
    //                 }
    //             }

    //             if (message.entities.hashtags)
    //             {
    //                 for (let entity of message.entities.urls)
    //                 {
    //                     await linkToken(token, message, '#' + entity.text);
    //                 }
    //             }
    //         }

    //         //process for each subscriber:
    //     }
    //     await Message.update({id:message.id},{processed:true});
        
    // }

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