/**
 * BASIC HEURISTIC RULES:
 * 
 * Apply query (i.e. course, hub, language)
 * 
 * Then apply the following:
 * 
 * 1. Things I have posted
 * 2. Things in reply to things I have posted
 * 3. Reply chains on these things (limited by depth)
 * 
 */

module.exports = {
    attributes:{
        toJSON:function() {
            let obj = this.toObject();
            delete obj._raw;
            delete obj.rid;
            delete obj.user_from;
            delete obj['_raw'];
            delete obj['@type'];
            delete obj['@class'];
            delete obj['@version'];
            return obj;
        }
    },

    // query with a given criteria statically
    heuristicQuery: async (params)=>{
        
        //TODO: implement query logic to query heuristics for this set of parameters

        // let data = await Message.find({}).limit(params.limit);
        let data = await Message.query("select text,entities, message_id,service, createdAt,lang,remessageto,updatedAt, first(in('author')) as author from message limit "+params.limit+" FETCHPLAN author:1");
        //select *, first(in('author')) as author from message limit 1 FETCHPLAN author:1
        return Message.removeCircularReferences(data);
    },

    heuristicGroup: async (params)=>{
        
        //TODO: implement query logic to query heuristics for this set of parameters

        let data = await Message.find({
            select:['id']
        });
        return Message.removeCircularReferences(data);
    },

    /**
     * For use for getting 'mentions' or 'likes' from content.
     * 
     * Used for matching a particular url that can be provided as a token in the query
     * 
     */
    heuristicTotal: async (params)=>{
        
        //TODO: implement query logic to query heuristics for this set of parameters

        let data = await Message.query("SELECT COUNT(id) as total FROM message");
        // console.log(data);
        return {
            total:_.first(data).total
        };
    },

    heuristicInMemory: async (params, message)=>{
        return message;
    }
}