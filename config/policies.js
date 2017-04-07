var passport = require('passport');
module.exports.policies = {
    '*':['psk','jsononly','cors'],
    'message':{
        'root':true,
        'subscribe':['psk','jsononly','cors','socketonly']
    }
};