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
            return obj;
        }
    },

    // query with a given criteria statically
    heuristicQuery: async (params)=>{

        //TODO: implement query logic to query heuristics for this set of parameters

        //DEPTH IN THIS CASE MEANS ONLY n messages for each of the segments

        let lang = params.lang;
        // console.log(params);

        let query = "SELECT @rid,text,entities, message_id,service, createdAt, lang, updatedAt, in('tokenin').include('name','type') AS tokens, first(in('reply')) as reply, first(in('author')).exclude('_raw') AS author \
            FROM message \
            WHERE processed=true";
            if (lang)
                query+=" AND lang='"+lang+"'";

            let tokens = _.groupBy(params.query,'name');
            tokens = _.mapValues(tokens,(t)=>{
                return _.pluck(t,'query');
            });

            for (let token in tokens)
            {
                // query+=" AND in('tokenin') contains first((SELECT FROM token WHERE name IN [" + _.map(tokens[token],(v)=>"'"+v+"'").join(',') + "] AND type = '"+ token +"'))";
                query+=" AND in('tokenin') contains (name IN [" + _.map(tokens[token],(v)=>"'"+v+"'").join(',') + "] AND type = '"+ token +"')";
            }

            query += " LIMIT "+params.depth;
            query += " FETCHPLAN author:1 reply:1";

            // console.log(query);
        let data = await Message.query(query);
        data = _.map(data,(o)=>_.omit(o,['@version','@type']));
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