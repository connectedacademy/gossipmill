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

        //TODO: group by and limit per segment:

        let query = "SELECT @rid,text,entities, message_id,service, createdAt, lang, updatedAt, in('tokenin').include('name','type') AS tokens, first(in('reply')) as reply, first(in('author')).exclude('_raw','out_author','credentials','app_credentials','user_from','remessageto') AS author \
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
                query+=" AND in('tokenin') contains (name IN [" + _.map(tokens[token],(v)=>"'"+v+"'").join(',') + "] AND type = '"+ token +"')";
            }

            // query += " LIMIT "+params.depth;
            query += " FETCHPLAN author:1 reply:1";

            console.log(query);
        let data = await Message.query(query);
        data = _.map(data,(o)=>_.omit(o,['@version','@type']));
        return Message.removeCircularReferences(data);
    },

    heuristicGroup: async (params)=>{

        // console.log(params);
        let lang = params.lang;
        let grouper = params.group_by.name;

        let query = "SELECT count(*), "+grouper+".name FROM(SELECT first(in('tokenin')[type='"+grouper+"']) as segment \
            FROM message \
            WHERE processed=true";
        if (lang)
            query+=" AND lang='"+lang+"'";

        let tokens = _.groupBy(params.filter_by,'name');
        tokens = _.mapValues(tokens,(t)=>{
            return _.pluck(t,'query');
        });

        for (let token in tokens)
        {
            query+=" AND in('tokenin') contains (name IN [" + _.map(tokens[token],(v)=>"'"+v+"'").join(',') + "] AND type = '"+ token +"')";
        }

        query += ") GROUP BY segment.name";

        // console.log(query);
        let data = await Message.query(query);
        // console.log(data);

        data = _.map(data,(o)=>_.omit(o,['@version','@type']));
        return Message.removeCircularReferences(data);
    },

    /**
     * For use for getting 'mentions' or 'likes' from content.
     *
     * Used for matching a particular url that can be provided as a token in the query
     *
     */
    heuristicTotal: async (params)=>{

        let query = "SELECT COUNT(@rid) as total \
            FROM message \
            WHERE processed=true";

            let tokens = _.groupBy(params,'name');
            tokens = _.mapValues(tokens,(t)=>{
                return _.pluck(t,'query');
            });

            for (let token in tokens)
            {
                query+=" AND in('tokenin') contains (name IN [" + _.map(tokens[token],(v)=>"'"+v+"'").join(',') + "] AND type = '"+ token +"')";
            }

        let data = await Message.query(query);
        data = _.map(data,(o)=>_.omit(o,['@version','@type']));
        return Message.removeCircularReferences(data);
    },

    heuristicInMemory: async (params, message)=>{
        //TODO: perform some of the above logic to determine if this message should be passed to the subscriber
        return message;
    }
}