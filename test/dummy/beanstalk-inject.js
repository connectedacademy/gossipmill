let _ = require('lodash');
let fivebeans = require('fivebeans');
let request = require('request-promise-native');
let yaml = require('js-yaml');
let uuid = require('uuid');
let loremIpsum = require('lorem-ipsum');
let randomWords = require('random-words');

let beanstalk = new fivebeans.client(process.env.BEANSTALK_SERVER, 11300);

let run = async() => {


    let testspec_raw = await request('https://interpretation.connectedacademy.io/course/config/spec.yaml');
    let testspec = yaml.safeLoad(testspec_raw);

    beanstalk.on('error', function (err) {
        console.log(err);
    })
    .on('close', function () {
        console.log("Beanstalk Closed");
    });

    await new Promise((resolve, reject) => {
        beanstalk.on('connect', function () {
            resolve();
        })
            .connect();
    });

    await new Promise((resolve, reject) => {
        beanstalk.use('messages', function (err, tubename) {
            if (err)
                reject(err);
            else
                resolve(tubename);
        });
    });


    let messages = require('./messages.json');
    let raw_single = require('./single.json');
    let all = require('./messages.json');

    let sendMessage = function (newmessage) {

        //insert `submission`
        let rand = Math.random();
        if (rand > 0.8)
        {
            newmessage.entities.urls.push({
                expanded_url: "https://interpretation.connectedacademy.io/#/submission/interpretation/homework"
            });
            newmessage.entities.urls.push({
                expanded_url: "https://connectedacademy.io/test/4c1.html"
            });
            // newmessage.user_from.id_str = "17308978";
        }

        //insert `like`
        rand = Math.random();
        if (rand > 0.8)
        {
            let klass = _.sample(testspec.classes);
            let content = _.sample(klass.content);
            if (content.slug)
                newmessage.entities.urls.push({
                    expanded_url: `https://interpretation.connectedacademy.io/#/course/${klass.slug}/${content.slug}`
                });
        }

        // console.log(newmessage);
        // return;

        //give a mix of whether it is a message that relates to a particular place in the course:
        let klass = _.sample(testspec.classes);
        let content = _.sample(klass.content);
        let seconds = Math.round(Math.random() * 1800);

        if (content.slug)
            newmessage.entities.urls.push({
                expanded_url: `https://testclass.connectedacademy.io/#/course/${klass.slug}/${content.slug}/${seconds}`
            });

        // newmessage.entities.hashtags = [

        // ],
        // newmessage.entities.urls = [{
        //     expanded_url: "https://testclass.connectedacademy.io/submission/week1/intro"
        // },
        // {
        //     expanded_url: "https://testclass.connectedacademy.io/course/week1/liveclass/64"
        // }];
        console.log(newmessage);

        rand = Math.random()
        if (rand > 0.9)
        {
            // let nm = {
            //     message_id:newmessage.message_id
            // }

            let msg = JSON.stringify({ type: 'delete', payload: newmessage });
            console.log(msg);
            beanstalk.put(10, 0, 50000000, msg, function (err, jobid) {
                if (err)
                    console.log(err);
                console.log("Delete Submitted", newmessage.message_id);
            });
        }
        else if (rand > 0.8)
        {
            // let nm = {
            //     message_id:newmessage.message_id
            // }
            let msg = JSON.stringify({ type: 'rmgeo', payload: newmessage });
            beanstalk.put(10, 0, 50000000, msg, function (err, jobid) {
                if (err)
                    console.log(err);
                console.log("RmGeo Submitted", newmessage.message_id);
            });
        }
        else
        {
            console.log(newmessage.user_from.id_str);
            let msg = JSON.stringify({ type: 'message', payload: newmessage });
            beanstalk.put(10, 0, 50000000, msg, function (err, jobid) {
                if (err)
                    console.log(err);
                console.log("Submitted", newmessage.message_id);
            });
        }
    }

    if (false)
    {
        let wrangle = async function(msg)
        {
            let raw = msg;
            raw.createdAt = new Date(raw.createdAt);
            delete raw.rid;
            raw.message_id = uuid();
            delete raw.id;
            delete raw.processed;
            delete raw['@rid'];
            // console.log("Injecting " + JSON.stringify(raw));
            sendMessage(raw);
        }
        //initial load:
        for (let msg of all) {
            wrangle(msg);
        }

        for (let msg of all) {
            wrangle(msg);
        }

        for (let msg of all) {
            wrangle(msg);
        }

        setInterval(function () {
            let raw = messages.pop();
            raw.createdAt = new Date(raw.createdAt);
            delete raw.rid;
            delete raw.id;
            delete raw.processed;
            delete raw['@rid'];
            // let msg = getMessage(raw);
            // console.log("Injecting " + raw);
            sendMessage(raw);
        }, 5000);
    }
    else
    {
        let wrangle = function()
        {
            // let raw = JSON.parse(JSON.stringify(raw_single));
           let raw = {
                message_id: uuid(),
                text: loremIpsum({
                    count:15,
                    units: 'words',
                    format:'plain'
                }),
                service: "twitter",
                createdAt: new Date(),
                entities: {
                    urls: [],
                    hashtags: [],
                    user_mentions: [],
                    symbols: []
                },
                user_from: {
                    screen_name: randomWords(2).join(''),
                    id_str: uuid(),
                    lang: "en",
                    profile_image_url: "http://pbs.twimg.com/profile_images/678016627795890177/QH0Pi3EV_normal.png",
                    name: randomWords(2).join(' ')
                },
                lang: "en"
            };

            // console.log(raw);
            sendMessage(raw);
        }

        for (let i=0;i<1000;i++)
        {
            wrangle();
        }

        setInterval(function () {
           wrangle();
        }, 5000);
    }
};

run();