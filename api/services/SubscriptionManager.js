let queryStore = {};



module.exports = {

    //subscribe to a given query
    subscribe: async (req, subscription)=>{

        let roomname = 'query-'+req.session.id;

        queryStore[roomname] = subscription;

        sails.log.verbose('Attempting subscribe to', roomname);

        sails.sockets.join(req.socket, roomname, ()=>{
            sails.log.verbose('Subscribed to room', roomname);
        });
    },

    // unsubscribe for a given query
    unsubscribe: async (req,res)=>{
        let roomname = 'query-'+req.session.id;
        delete queryStore[roomname];
        sails.sockets.leave(roomname);
        sails.log.verbose('Leaving room', roomname);        
        return;
    },


    // process a live incoming message for all known subscribers
    processNewMessageForSubscribers: async (msg)=>{
        sails.log.verbose('Publishing message to pending subscriptions', msg);

        for (let q in queryStore)
        {
            let roomname = q;
            let query = queryStore[q];

            if (Message.heuristicInMemory(query, msg))
            {
                sails.socket.broadcast(q, msg);
                sails.log.verbose('Message sent to', msg, query);
            }
            else
            {
                sails.log.verbose('Message not matching heuristic', msg, query);
            }
        }
        return;
    }
}