let queryStore = {};
let uuid = require('uuid');

module.exports = {

    //subscribe to a given query
    subscribe: async (req, subscription)=>{

        let roomname = 'query-'+subscription.socketid;

        queryStore[roomname] = subscription;

        sails.log.verbose('Attempting subscribe to / update', roomname);

        sails.sockets.join(req.socket, roomname, ()=>{
            sails.log.verbose('Subscribed to room', roomname);
        });

        return roomname;
    },

    // // unsubscribe for a given query
    // unsubscribe: async (req)=>{
    //     let roomname = 'query-'+req.session.id;
    //     delete queryStore[roomname];
    //     sails.sockets.leave(roomname);
    //     sails.log.verbose('Leaving room', roomname);
    //     return;
    // },


    // process a live incoming message for all known subscribers
    processNewMessageForSubscribers: (msg)=>{
        sails.log.verbose('Publishing message to pending subscriptions', msg.message_id);

        for (let q in queryStore)
        {
            // let roomname = q;
            let query = queryStore[q];

            if (Message.heuristicInMemory(query, msg))
            {
                sails.sockets.broadcast(q, q, msg);
                sails.log.verbose('Message sent to', msg.message_id, query);
            }
            else
            {
                sails.log.verbose('Message not matching heuristic', msg.message_id, query);
            }
        }
        return;
    }
}