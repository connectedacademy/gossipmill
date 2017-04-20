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

        req.checkBody(filter_schema);
        req.checkBody('limit').isInt();
        req.checkParams('service').notEmpty();
        req.checkParams('user').notEmpty();

        try
        {
            let result = await req.getValidationResult();
            result.throw();
        }
        catch (e)
        {
            return res.badRequest(e.mapped());
        }

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
            let messages = await SubscriptionManager.subscribe(req, params);
            return res.json({
                scope: params,
                msg: 'Subscription Updated'
            });
        }
        catch (e)
        {
            return res.serverError(e);
        }

        return res.end();
    },

    list: async (req,res) => {

        req.checkBody('limit').isInt();
        req.checkBody(filter_schema);
        console.log("DOING LIST");
        req.checkParams('service').notEmpty();
        req.checkParams('user').notEmpty();

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


        let limit = req.query.limit || process.env.DEFAULT_LIMIT;

        let params = {
            limit: limit,
            query: req.body.filter_by
        }

        params.account = user_account;
        params.service = user_service;

        sails.log.verbose('Query messages', params);

        try
        {
            let messages = await Message.heuristicQuery(params);
            console.log(messages);
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

    totals: async (req, res)=>{

        req.checkBody(filter_schema);

        try
        {
            let result = await req.getValidationResult();
            result.throw();
        }
        catch (e)
        {
            return res.badRequest(e.mapped());
        }

        let query = req.body.filter_by;
        
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

    visualisation: async (req,res)=>{

        req.checkBody(group_schema);
        req.checkBody(filter_schema);

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
        req.checkBody('text').notEmpty().isLength({min:2,max:140});

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
                sails.log.verbose('Creating message: ' + req.text);
                
                let newmessage = await Twitter.newmessage(credentials, msg);

                Message.create(newmessage).exec((err, message)=>{
                    return res.ok('Message Sent');
                });
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