const Twitter = require('twitter');
const uuid = require('uuid');

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
            newmessage.id = uuid();
            // newmessage._raw = response;

            let thisuser = await User.findOne({
                'credentials.token':credentials.token,
                'credentials.tokenSecret':credentials.tokenSecret
            });

            newmessage.text = msg.text;
            newmessage.service = 'twitter';
            newmessage.createdAt = new Date();
            //generate entities

            //manually parse entities

            //parse out all links

            //parse out hashtags

            let entities = {
                urls: [
                    {
                        display_url: "sZ5x.flirtnation.cf",
                        indices: [
                            87,
                            110
                        ],
                        expanded_url: "http://sZ5x.flirtnation.cf",
                        url: "https://t.co/cM7Oix4r8s"
                    }
                ],
                hashtags: [
                    {
                        indices: [
                            29,
                            33
                        ],
                        text: "wppfca17"
                    },
                ],
                user_mentions: [

                ],
                symbols: [

                ]
            }

            newmessage.entities = entities;
            newmessage.user = thisuser;
            newmessage.lang = 'en';

            Message.create(newmessage,function(err,nmsg){
                return nmsg;
            })
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