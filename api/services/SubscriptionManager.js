let queryStore = {};

module.exports = {

    //subscribe to a given query
    subscribe: async (req, subscription)=>{

        let roomname = 'query-'+subscription.socketid;

        // console.log(subscription);

        queryStore[roomname] = subscription;

        sails.log.verbose('Attempting subscribe to / update', roomname);

        sails.sockets.join(req.socket, roomname, ()=>{
            sails.log.verbose('Subscribed to room', roomname, subscription);
        });

        return roomname;
    },

    unsubscribe: async(socketid)=>{
        let roomname = 'query-'+socketid;
        delete queryStore[roomname];
        console.log("unsubscribe:" + roomname);
        sails.sockets.leave(roomname,(err)=>{
            sails.log.error(err);
            sails.log.verbose('Left room',roomname);
        });
    },

    // process a live incoming message for all known subscribers
    processNewMessageForSubscribers: async (msg)=>{
        sails.log.verbose('Publishing message to pending subscriptions', msg.message_id);

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
                sails.log.verbose('Message sent to', message.message_id, q);
            }
            else
            {
                sails.log.verbose('Message not matching heuristic', message.message_id, query);
            }
        }
        return;
    }
}