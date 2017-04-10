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

    subscribe: (req,res)=>{
        //initiate subscribe

        //when new messages come in, needs to run the subscribe filter and send to the right people

        return res.end();
    },

    list: async (req,res) => {
        //TODO: implement proper query
        return res.end();
       
    },

    totals: (req, res)=>{
        return res.end();

    },

    visualisation: (req,res)=>{
        return res.end();

    }
}