let _ = require('lodash');
let fivebeans = require('fivebeans');

let beanstalk = new fivebeans.client(process.env.BEANSTALK_SERVER, 11300);


run = async() => {


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

    let tubename = await new Promise((resolve, reject) => {
        beanstalk.use('messages', function (err, tubename) {
            if (err)
                reject(err);
            else
                resolve(tubename);
        });
    });


    let messages = require('./messages.json');

    let sendMessage = function (newmessage) {


        //every so often, insert submission:
        let rand = Math.random();
        if (rand > 0.9)
        {
            
        }

        newmessage.entities.hashtags = [
            
        ],
        newmessage.entities.urls = [{
            expanded_url: "https://testclass.connectedacademy.io/submission/week1/intro"
        },
        {
            expanded_url: "https://testclass.connectedacademy.io/course/week1/liveclass/64"
        }];

        let msg = JSON.stringify({ type: 'message', payload: newmessage });
        beanstalk.put(10, 0, 50000000, msg, function (err, jobid) {
            if (err)
                console.log(err);
            console.log("Submitted", newmessage.message_id);
        });
    }

    //initial load:
    for (i = 0; i < 100; i++) {
        let raw = messages.pop();
        raw.createdAt = new Date(raw.createdAt);
        delete raw.rid;
        delete raw.id;
        delete processed;
        delete raw['@rid'];
        console.log("Injecting " + JSON.stringify(raw));
        sendMessage(raw);
    }

    setInterval(function () {
        let raw = messages.pop();
        raw.createdAt = new Date(raw.createdAt);
        delete raw.rid;
        delete raw.id;
        delete raw['@rid'];
        // let msg = getMessage(raw);
        console.log("Injecting " + JSON.stringify(raw));
        sendMessage(raw);
    }, 5000);
};

run();