let pjson = require('../../package.json');
let os = require('os');

module.exports = {
    
    root: (req,res) =>{
        return res.json({
            msg:'Gossipmill Running',
            version: pjson.version,
            host: os.hostname(),
            uptime: process.uptime()
        })
    },

    tokens: (req,res)=>{
        return res.json(sails.tokens);
    },

    services: async (req,res)=>{
        try
        {
            let results = await Message.query("SELECT DISTINCT(service) FROM message;");
            let normalised = _.map(results,(r)=>{
                return {
                    name: r.DISTINCT,
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
        //initiate subscribe

        //when new messages come in, needs to run the subscribe filter and send to the right people

        let user_service = req.param('service'); //i.e. twitter
        let user_account = req.param('user');// i.e. @tombartindale

        sails.log.verbose('Subscribe to messages with ' + req.params())

        let limit = req.query.limit || process.env.DEFAULT_LIMIT;

        let params = {
            limit: limit,
            query: req.body
        }

        try
        {
            let messages = await SubscriptionManager.subscribe(params);
            return res.ok('Subscription Updated');
        }
        catch (e)
        {
            return res.serverError(e);
        }

        return res.end();
    },

    list: async (req,res) => {
        //TODO: implement proper query

        let user_service = req.param('service'); //i.e. twitter
        let user_account = req.param('user');// i.e. @tombartindale

        sails.log.verbose('Query messages with ' + req.params())

        let limit = req.query.limit || process.env.DEFAULT_LIMIT;

        let params = {
            limit: limit,
            query: req.body
        }

        try
        {
            let messages = await SubscriptionManager.query(params);
            return res.json({
                scope:{
                    query,
                    length: messages.length
                },
                data: messages
            });
        }
        catch (e)
        {
            return res.serverError(e);
        }
       
    },

    totals: (req, res)=>{
        return res.end();

    },

    visualisation: (req,res)=>{
        return res.end();

    },

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
            let credentials = req.body.credentials; /*  consumer_key: credentials.key,consumer_secret: credentials.secret,access_token_key: credentials.token_key,access_token_secret: credentials.token_secret */

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