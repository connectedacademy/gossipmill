module.exports = function(req,res,next){
    if (req.param('psk') == process.env.PRE_SHARED_KEY)
    {
        return next();
    }
    else
    {
        sails.log.verbose('Invalid PSK',req.url);
        return res.forbidden('Invalid Pre-shared-key');
    }
}