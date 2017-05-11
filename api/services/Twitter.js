const Twitter = require('twitter');
const uuid = require('uuid');

let beanstalk = null;

if (process.env.BYPASS_TWITTER==='true')
{
    const fivebeans = require('fivebeans');
    beanstalk = new fivebeans.client(process.env.BEANSTALK_SERVER, 11300);
    beanstalk.on('error', function(err)
    {
        sails.log.error(err);
    })
    .on('close', function()
    {
        sails.log.error("Beanstalk Closed");
    })
    .on('connect', function()
    {
        sails.log.info("Beanstalk Connected");
        beanstalk.use('messages', function (err, tubename) {
            if (err)
                sails.log.error(err);
            else
                sails.log.info("Connected to " + tubename);
        });
    });
    beanstalk.connect();
}

module.exports = {

    newmessage: async (credentials, msg) =>
    {
        //get twitter client based on the provided credentials:

        var client = new Twitter({
            consumer_key: credentials.key,
            consumer_secret: credentials.secret,
            access_token_key: credentials.token,
            access_token_secret: credentials.tokenSecret
        });

        //build message
        let newmsg = {
            status: msg.text
        }

        if (msg.replyto)
            newmsg.in_reply_to_status_id = msg.replyto;

        //make tweet
        if (process.env.BYPASS_TWITTER==='true')
        {
            sails.log.verbose('GENERATE FAKE TWITTER MESSAGE');
            let newmessage = {};
            newmessage.message_id = uuid();
            // newmessage._raw = response;

            let thisuser = await User.findOne({
                'credentials.token':credentials.token,
                'credentials.tokenSecret':credentials.tokenSecret
            });

            newmessage.text = msg.text;
            newmessage.service = 'twitter';
            newmessage.createdAt = new Date();
            //generate entities
            let entities = {
                urls:[],
                hashtags:[],
                user_mentions:[],
                symbols:[]
            }


            //manually parse entities
            let links = new RegExp(/(https?:\/\/[\S]*)[\s\S]*?/,'g');
            let urls = newmessage.text.match(links);
            if (urls)
            {
                for (let u of urls)
                {
                    entities.urls.push({
                        display_url: u,
                        indices: [
                            0,
                            0
                        ],
                        expanded_url: u,
                        url: u
                    });
                    newmessage.text = newmessage.text.replace(u, 'http://a.short.link');
                }
            }

            //parse out hashtags
            let hash = new RegExp(/\s#([\S_0-9]+)/,'g');
            let hashtags = newmessage.text.match(hash);
            if (hashtags)
            {
                for (let u of hashtags)
                {
                    entities.hashtags.push({
                        text: u.trim().substring(1),
                        indices: [
                            0,
                            0
                        ]
                    });
                }
            }

            newmessage.entities = entities;
            newmessage.user_from = thisuser['_raw'];
            newmessage.lang = 'en';

            //push this into the beanstalk queue:
            let m = JSON.stringify({type:'message',payload:newmessage});
            beanstalk.put(10, 0, 50000000, m, function(err, jobid) {
                    // console.log(jobid);
                if (err)
                    sails.log.error(err);
            });

            return newmessage;
        }
        else
        {
            let response = await client.post('statuses/update', newmsg);
            let newmessage = {};
            newmessage.id = response.id_str;
            newmessage._raw = response;

            newmessage.text = response.text;
            newmessage.service = 'twitter';
            newmessage.createdAt = new Date(response.created_at);
            newmessage.entities = response.entities;
            newmessage.user = response.user.id;
            newmessage.lang = response.lang;
            newmessage.replyto = response.in_reply_to_status_id;
            return newmessage;
        }
    }
}