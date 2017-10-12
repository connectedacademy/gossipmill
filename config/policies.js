module.exports.policies = {
    '*':['psk','jsononly'],
    'message':{
        'root':true,
        'subscribe':['psk','socketonly'] //socketonly
    }
};