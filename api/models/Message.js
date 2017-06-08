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

let omitDeep = require('omit-deep-lodash');

let applyUsers = function(data,users)
{
    for (let o of data)
    {
        if (_.isObject(o))
        {
            if (!_.isObject(o.user) && !_.isEmpty(o.user))
            {
                o.user = _.find(users,{'id':o.user});
            }
            applyUsers(_.without(_.pluck(o.in_reply,'out'),null),users);
        }
    }
}

let removeEdges = function(messages)
{
    for(let message of messages)
    {
        if (_.isObject(message))
        {
            message.in_reply = _.map(message.in_reply,(m)=>{
                return m.out;
            });

            removeEdges(message.in_reply);
        }
    }
}

let recurseUser = function(obj)
{
    let result = [];

    for (let o of obj)
    {
        if (_.isObject(o))
        {
            if (!_.isObject(o.user) && !_.isEmpty(o.user))
            {
                result.push(o.user);
            }

            result = result.concat(recurseUser(_.without(_.pluck(o.in_reply,'out'),null)));
        }
    }
    return result;
}

module.exports = {

    schema: false,
    attributes: {
        user: {
            model: 'user'
        },
        toJSON: function () {
            let obj = Message.removeCircularReferences(this).toObject();
            return obj;
        }
    },

    // query with a given criteria statically
    heuristicQuery: async (params) => {

        let lang = params.lang;

        let tokens = _.groupBy(params.query, 'name');
        tokens = _.mapValues(tokens, (t) => {
            return _.pluck(t, 'query');
        });

        let query = "SELECT @rid.asString(), text, list(inE('reply')) as in_reply, entities, message_id,service, " + _.keys(tokens).join(',') + ", createdAt, lang, updatedAt \
            FROM message \
            WHERE processed=true \
            AND replyto is null";

        if (lang)
        {
            query += " AND lang=:lang";
        }

        let safe_params = {
            lang: lang
        };

        for (let token in tokens) {
            if (_.size(tokens[token]) == 1) {
                query += " AND " + token + " = '" + _.first(tokens[token]) + "'";
            }
            else {
                query += " AND " + token + " IN [" + _.map(tokens[token], (v) => "'" + v + "'").join(',') + "]";
            }
        }

        query += " ORDER BY createdAt DESC";
        query += " LIMIT " + params.depth;
        query += " FETCHPLAN *:-1 [*]user:-2 [*]out_reply:-2 [*]in:-2";

        let data = await Message.query(query,
            {
                params: safe_params
            });

        Message.removeCircularReferences(data);

        let userlist = _.uniq(recurseUser(data));
        let users = await User.query('SELECT @rid.asString() as id, account, service, account_number, name, profile, link FROM ['+userlist.join(',')+']');
        applyUsers(data,users);
        removeEdges(data);

        data = omitDeep(data,['@version','@type','_raw','@class','credentials','account_credentials','replyto','user_from','out_reply','in','replytolink']);


        return data;
    },

    /**
     * For visualisation / linear timeline of data
     */
    heuristicGroup: async (params) => {

        // console.log(params);
        let lang = params.lang;
        let grouper = params.group_by.name;

        let query = "SELECT count(*), " + grouper + " \
            FROM message \
            WHERE processed=true \
            AND "+grouper+" IS NOT null";
        if (lang)
            query += " AND lang=:lang";

        let tokens = _.groupBy(params.filter_by, 'name');
        tokens = _.mapValues(tokens, (t) => {
            return _.pluck(t, 'query');
        });

        let safe_params = {
            lang: lang
        };

        for (let token in tokens) {
            if (_.size(tokens[token]) == 1) {
                query += " AND " + token + " = '" + _.first(tokens[token]) + "'";
            }
            else {
                query += " AND " + token + " IN [" + _.map(tokens[token], (v) => "'" + v + "'").join(',') + "]";
            }
        }

        query += " GROUP BY " + grouper;
        query += " ORDER BY " + grouper + " ASC";

        let data = await Message.query(query,
            {
                params: safe_params
            });

            // console.log(query);

        data = _.map(data, (o) => _.omit(o, ['@version', '@type']));
        return Message.removeCircularReferences(data);
    },

    /**
     * For use for getting 'mentions' or 'likes' from content.
     *
     * Used for matching a particular url that can be provided as a token in the query
     *
     */
    heuristicTotal: async (params) => {

        let query = "SELECT COUNT(@rid) as total, " + params.group_by.name + " \
            FROM message \
            WHERE processed=true AND " + params.group_by.name + " <> ''";

        let tokens = _.groupBy(params.filter_by, 'name');
        tokens = _.mapValues(tokens, (t) => {
            return _.pluck(t, 'query');
        });

        for (let token in tokens) {
            if (_.size(tokens[token]) == 1) {
                query += " AND " + token + " = '" + _.first(tokens[token]) + "'";
            }
            else {
                query += " AND " + token + " IN [" + _.map(tokens[token], (v) => "'" + v + "'").join(',') + "]";
            }
        }

        query += " GROUP BY " + params.group_by.name;
        // query += " ORDER BY " + params.group_by.name + " ASC";
        // console.log(query);

        let data = await Message.query(query);

        Message.removeCircularReferences(data);
        let newobj = {};
        _.each(data, (d) => {
            newobj[d[params.group_by.name]] = d.total;
        });
        return newobj;
    },


    //TODO: Bubble up the 'most interesting thing' in the segment query
    heuristicSummary: async (params) => {
        let lang = params.lang;

        let tokens = _.groupBy(params.query, 'name');
        tokens = _.mapValues(tokens, (t) => {
            return _.pluck(t, 'query');
        });

        let query = "SELECT FROM (SELECT $ismine as ismine, @rid,text,entities, message_id,service," + _.keys(tokens).join(',') + ", createdAt, lang, updatedAt, user.exclude('_raw','credentials','account_credentials') AS author \
            FROM message \
            LET $ismine = if(eval(\"user.account='"+params.account+"' AND user.service='"+params.service+"'\"),1,0)";

        let where = "WHERE processed=true";

        if (lang)
            where += " AND lang=:lang";

        let safe_params = {
            lang: lang,
            account: params.account,
            service: params.service
        };

        for (let token in tokens) {
            if (_.size(tokens[token]) == 1) {
                where += " AND " + token + " = '" + _.first(tokens[token]) + "'";
            }
            else {
                where += " AND " + token + " IN [" + _.map(tokens[token], (v) => "'" + v + "'").join(',') + "]";
            }
        }

        query += where;
        query += ") ORDER BY ismine DESC";
        query += " LIMIT 1";
        query += " FETCHPLAN author:1";

        let data = Message.query(query,
            {
                params: safe_params
            });
        let hashtags = Message.query("SELECT count(hashtags) as count, hashtags as hashtag FROM (SELECT entities.hashtags.text as hashtags FROM message " + where + " UNWIND hashtags) GROUP BY hashtags ORDER BY count DESC LIMIT 5",
            {
                params: safe_params
            });
        let total = Message.query("SELECT count(@rid) as total FROM message " + where,
            {
                params: safe_params
            });
        let contributors = Message.query("SELECT COUNT(user_from.id_str) as count, user.exclude('_raw','credentials','account_credentials') AS author FROM message " + where + " GROUP BY user_from.id_str ORDER BY count DESC LIMIT 5 FETCHPLAN author:1 ",
            {
                params: safe_params
            });
        let result = await Promise.all([data, hashtags, total, contributors]);

        data = _.omit(_.first(result[0]), ['@version', '@type']);

        return Message.removeCircularReferences({
            info: {
                hashtags: _.map(result[1], (f) => _.omit(f, ['@version', '@type'])),
                total: _.first(result[2]).total,
                contributors: _.map(result[3], (f) => {
                    return {
                        author: _.omit(f.author, ['@version', '@type', '@class']),
                        count: f.count
                    }
                })
            },
            message: data
        });
    },

    heuristicInMemory: (params, message) => {

        //in range etc
        if (message.service != params.service)
            return false;
        if (message.lang != params.lang)
            return false;

        let tokens = _.groupBy(params.filter_by, 'name');
        tokens = _.mapValues(tokens, (t) => {
            return _.pluck(t, 'query');
        });

        for (let token in tokens) {
            if (!_.contains(tokens[token], message[token]))
                return false;
        }

        return true;
    }
}