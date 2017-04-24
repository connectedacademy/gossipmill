const Twitter = require('twitter');

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
            newmsg.in_reply_to_status_id = replyto

        //make tweet
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