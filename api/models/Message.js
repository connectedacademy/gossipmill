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

    schema: false,
    attributes:{
        toJSON:function() {
            let obj = Message.removeCircularReferences(this).toObject();
            return obj;
        }
    },

    //TODO: Bubble up the 'most interesting thing' in the segment query

    //TODO: Send back summary information (like most used hashtags, users, number of tweets etc)




    // query with a given criteria statically
    heuristicQuery: async (params)=>{

        //TODO: implement query logic to query heuristics for this set of parameters

        //DEPTH IN THIS CASE MEANS ONLY n messages for each of the segments

        let lang = params.lang;

        let tokens = _.groupBy(params.query,'name');
        tokens = _.mapValues(tokens,(t)=>{
            return _.pluck(t,'query');
        });

        let query = "SELECT @rid,text,entities, message_id,service,"+_.keys(tokens).join(',')+", createdAt, lang, updatedAt, first(in('reply')) as reply, first(in('author')).exclude('_raw','out_author','credentials','account_credentials','user_from','remessageto') AS author \
            FROM message \
            WHERE processed=true";
        if (lang)
            query+=" AND lang='"+lang+"'";

        for (let token in tokens)
        {
            query+=" AND "+token+" IN [" + _.map(tokens[token],(v)=>"'"+v+"'").join(',') + "]";
        }

        query += " LIMIT "+params.depth;
        query += " FETCHPLAN author:1 reply:1";

        // console.log(query);
        let data = await Message.query(query);
        data = _.map(data,(o)=>_.omit(o,['@version','@type']));

        return Message.removeCircularReferences(data);
    },

    /**
     * For visualisation / linear timeline of data
     */
    heuristicGroup: async (params)=>{

        // console.log(params);
        let lang = params.lang;
        let grouper = params.group_by.name;

        let query = "SELECT count(*), "+grouper+" \
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
            query+=" AND "+token+" IN [" + _.map(tokens[token],(v)=>"'"+v+"'").join(',') + "]";
        }

        query += " GROUP BY " + grouper;

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

        let query = "SELECT COUNT(@rid) as total, " + params.group_by.name + " \
            FROM message \
            WHERE processed=true AND " + params.group_by.name + " <> ''";

        let tokens = _.groupBy(params.filter_by,'name');
        tokens = _.mapValues(tokens,(t)=>{
            return _.pluck(t,'query');
        });

        for (let token in tokens)
        {
            query+=" AND "+token+" IN [" + _.map(tokens[token],(v)=>"'"+v+"'").join(',') + "]";
        }

        query += " GROUP BY " + params.group_by.name;

        let data = await Message.query(query);

        Message.removeCircularReferences(data);
        let newobj = {};
        _.each(data,(d)=>{
            newobj[d[params.group_by.name]] = d.total;
        });
        return newobj;
    },

    heuristicSummary: async (params) =>{
        let lang = params.lang;

        let tokens = _.groupBy(params.query,'name');
        tokens = _.mapValues(tokens,(t)=>{
            return _.pluck(t,'query');
        });

        let query = "SELECT @rid,text,entities, message_id,service,"+_.keys(tokens).join(',')+", createdAt, lang, updatedAt, first(in('reply')) as reply, first(in('author')).exclude('_raw','out_author','credentials','account_credentials','user_from','remessageto') AS author \
            FROM message ";

        let where = "WHERE processed=true";

        if (lang)
            where+=" AND lang='"+lang+"'";

        for (let token in tokens)
        {
            where+=" AND "+token+" IN [" + _.map(tokens[token],(v)=>"'"+v+"'").join(',') + "]";
        }

        query += where;
        query += " LIMIT 1";
        query += " FETCHPLAN author:1 reply:1";

        let data = Message.query(query);
        let hashtags = Message.query("SELECT count(hashtags) as count, hashtags as hashtag FROM (SELECT entities.hashtags.text as hashtags FROM message "+where+" UNWIND hashtags) GROUP BY hashtags ORDER BY count DESC LIMIT 5");
        let total = Message.query("SELECT count(@rid) as total FROM message " + where);
        let contributors = Message.query("SELECT DISTINCT(user_from.id_str), first(in('author')).exclude('_raw','out_author','credentials','account_credentials','user_from','remessageto') AS author FROM message "+ where +" FETCHPLAN author:1");
        // console.log("SELECT DISTINCT(user_from.id_str), first(in('author')).exclude('_raw','out_author','credentials','account_credentials','user_from','remessageto') AS author FROM message "+ where +" FETCHPLAN author:1");
        let result = await Promise.all([data, hashtags, total, contributors]);
        // console.log(result);

        data = _.omit(_.first(result[0]),['@version','@type']);
        return Message.removeCircularReferences({
            info:{
                hashtags: _.map(result[1],(f)=>_.omit(f,['@version','@type'])),
                total:_.first(result[2]).total,
                contributors: _.map(result[3],(f)=>_.omit(f.author,['@version','@type','@class']))
            },
            message: data
        });
    },

    heuristicInMemory: async (params, message)=>{
        //TODO: perform some of the above logic to determine if this message should be passed to the subscriber
        return message;
    }
}