let queryStore = {};

module.exports = {

    //subscribe to a given query
    subscribe: async (req, subscription)=>{

        let roomname = 'query-'+subscription.socketid;

        // console.log(subscription);

        queryStore[roomname] = subscription;

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
        delete queryStore[roomname];
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

        for (let q in queryStore)
        {
            // let roomname = q;
            let query = queryStore[q];

            if (Message.heuristicInMemory(query, message))
            {
                message.user = _.omit(message.user,'rid','credentials','account_credentials','_raw');
                sails.sockets.broadcast(q, q, _.omit(message,'rid','_raw','user_from'));
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