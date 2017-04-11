module.exports = {

    // query with a given criteria statically
    query: async (req,res)=>{
        
        return;
    },

    //subscribe to a given query
    subscribe: async (req,res)=>{

        return;
    },

    // unsubscribe for a given query
    unsubscribe: async (req,res)=>{

        return;
    },


    // process a live incoming message for all known subscribers
    processNewMessageForSubscribers: async (msg)=>{
        sails.log.verbose('Publishing message to pending subscriptions');
        return;
    }
}