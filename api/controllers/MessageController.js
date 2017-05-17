let pjson = require('../../package.json');
let os = require('os');


let filter_schema = {
    'filter_by':{
        notEmpty: true,
        isArray: true,
        isFilter: true
    }
};

let group_schema = {
    'group_by.name':{
        notEmpty: true
    }
};

module.exports = {

    /**
     * Done
     */
    root: (req,res) =>{
        return res.json({
            msg:'Gossipmill Running',
            version: pjson.version,
            host: os.hostname(),
            uptime: process.uptime()
        })
    },

    /**
     * Done
     */
    tokens: (req,res)=>{
        return res.json(sails.tokens);
    },

    /**
     * Done
     */
    services: async (req,res)=>{
        try
        {
            sails.log.verbose('List services')
            let results = await Message.query("SELECT DISTINCT(service) FROM message LIMIT 20;");
            let normalised = _.map(results,(r)=>{
                return {
                    name:_.capitalize(r.DISTINCT),
                    tag: r.DISTINCT
                }
            });
            return res.json(normalised);
        }
        catch (e)
        {
            return res.serverError(e);
        }
    },

    subscribe: async (req,res)=>{

        //TODO: -- validation is not working on socker connections

        //initiate subscribe

        //when new messages come in, needs to run the subscribe filter and send to the right people

        let user_service = req.param('service'); //i.e. twitter
        let user_account = req.param('user');// i.e. @tombartindale

        sails.log.verbose('Subscribe to messages')

        let params = req.body;

        params.account = user_account;
        params.service = user_service;

        try
        {
            let roomname = await SubscriptionManager.subscribe(req, params);
            return res.json({
                scope: params,
                room: roomname,
                msg: 'Subscription Updated'
            });
        }
        catch (e)
        {
            return res.serverError(e);
        }
    },

    summary: async (req,res) =>{

        req.checkBody(filter_schema);
        req.checkBody('lang').notEmpty();
        req.checkParams('service').notEmpty();
        req.checkParams('user').notEmpty();
        req.checkBody('whitelist').notEmpty().isBoolean();

        try
        {
            let result = await req.getValidationResult();
            result.throw();
        }
        catch (e)
        {
            return res.badRequest(e.mapped());
        }


        let user_service = req.param('service'); //i.e. twitter
        let user_account = req.param('user');// i.e. @tombartindale


        let params = {
            query: req.body.filter_by
        }

        params.account = user_account;
        params.service = user_service;
        params.whitelist = req.param('whitelist');
        params.lang = req.param('lang');

        sails.log.verbose('Query messages', params);

        try
        {
            let messages = await Message.heuristicSummary(params);
            // console.log(messages);

            params.query = _.groupBy(params.query,'name');
            params.query = _.mapValues(params.query,(t)=>{
                return _.pluck(t,'query');
            });

            return res.json({
                scope: params,
                data: messages
            });
        }
        catch (e)
        {
            return res.serverError(e);
        }
    },

    list: async (req,res) => {

        req.checkBody('depth').isInt();
        req.checkBody(filter_schema);
        req.checkBody('lang').notEmpty();
        req.checkParams('service').notEmpty();
        req.checkParams('user').notEmpty();
        req.checkBody('whitelist').notEmpty().isBoolean();

        try
        {
            let result = await req.getValidationResult();
            result.throw();
        }
        catch (e)
        {
            return res.badRequest(e.mapped());
        }


        let user_service = req.param('service'); //i.e. twitter
        let user_account = req.param('user');// i.e. @tombartindale


        let depth = req.body.depth || process.env.DEFAULT_DEPTH;

        let params = {
            depth: depth,
            query: req.body.filter_by
        }

        params.account = user_account;
        params.service = user_service;
        params.whitelist = req.param('whitelist');

        sails.log.verbose('Query messages', params);

        try
        {
            let messages = await Message.heuristicQuery(params);
            // console.log(messages);

            params.query = _.groupBy(params.query,'name');
            params.query = _.mapValues(params.query,(t)=>{
                return _.pluck(t,'query');
            });

            return res.json({
                scope: _.merge(params,{
                    length: messages.length
                }),
                data: messages
            });
        }
        catch (e)
        {
            return res.serverError(e);
        }

    },

    /**
     * Done
     */
    totals: async (req, res)=>{

        req.checkBody(filter_schema);
        req.checkBody(group_schema);

        try
        {
            let result = await req.getValidationResult();
            result.throw();
        }
        catch (e)
        {
            return res.badRequest(e.mapped());
        }

        let query = req.body;

        try
        {
           sails.log.verbose('Total', query);
           let data = await Message.heuristicTotal(query);
           return res.json(data);
        }
        catch (e)
        {
            return res.serverError(e);
        }
    },

    /**
     * Done
     */
    visualisation: async (req,res)=>{

        req.checkBody(group_schema);
        req.checkBody(filter_schema);
        req.checkBody('whitelist').notEmpty().isBoolean();

        try
        {
            let result = await req.getValidationResult();
            result.throw();
        }
        catch (e)
        {
            return res.badRequest(e.mapped());
        }

        let query = req.body;

        try
        {
           sails.log.verbose('Visualisation', query.group_by.name, query.filter_by);
           let data = await Message.heuristicGroup(query);
           return res.json(data);
        }
        catch (e)
        {
            return res.serverError(e);
        }
    },

    /**
     * Done
     */
    create: async (req,res)=>{

        req.checkBody('credentials.service').notEmpty();
        req.checkBody('credentials.secret').notEmpty();
        req.checkBody('credentials.key').notEmpty();
        req.checkBody('credentials.token').notEmpty();
        req.checkBody('credentials.tokenSecret').notEmpty();
        req.checkBody('text').notEmpty().isLength({min:2});
        req.checkBody('replyto').optional().notEmpty();
        req.checkBody('remessageof').optional().notEmpty();

        try
        {
            let result = await req.getValidationResult();
            result.throw();
        }
        catch (e)
        {
            return res.badRequest(e.mapped());
        }

        //send social media message:
        try {

            let service = req.body.credentials.service;
            let credentials = req.body.credentials;

            let msg = {
                text: req.body.text
            };

            if (service == 'twitter')
            {
                sails.log.verbose('Creating message',msg);

                let newmessage = await Twitter.newmessage(credentials, msg);

                // Message.findOrCreate({message_id:newmessage.message_id},newmessage).exec((err, message)=>{
                    // return res.ok('Message Created');
                newmessage.user = {
                    account_number: newmessage.user_from.id_str,
                    service: newmessage.service,
                    account: newmessage.user_from.screen_name,
                    profile: newmessage.user_from.profile_image_url_https,
                    name: newmessage.user_from.name
                }
                return res.json(_.omit(newmessage,'user_from'));
                // });
            }
            else
            {
                sails.log.verbose('Invalid service requested ' + service)
                return res.badRequest('Only Twitter is supported right now');
            }
        }
        catch (error) {
            return res.serverError(error);
        }
    }
}