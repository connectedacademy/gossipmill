let package_info = require('../package.json');

module.exports.http = {

  middleware: {

    version: function(req,res,next)
    {
      res.set('api-version', package_info.version);
      next();
    },

    validator: require('express-validator')({
      customValidators: {
        isArray: function(value) {
            return Array.isArray(value);
        },
        isFilter: function(value)
        {
          if (value)
          {
            for (let f of value)
            {
              if (!f.name || typeof(f.query) === undefined)
                return false;
            }
            return true;
          }
          else
          {
            return false;
          }
        }
      }
    }),

    order: [
      'startRequestTimer',
      'cookieParser',
      'session',
      'bodyParser',
      'validator',
      'responseTimeLogger',
      'handleBodyParserError',
      'compress',
      'methodOverride',
      'poweredBy',
      'version',
      '$custom',
      'router',
      'www',
      'favicon',
      '404',
      '500'
    ],


    responseTimeLogger: function(req, res, next) {
      res.on("finish", function() {
        sails.log.verbose('Endpoint',{
          url: req.method + ' ' + req.path,
          query: req.query,
          params: req.params.all(),
          time: res.get('X-Response-Time'),
          'gossipmill-version':package_info.version
        });
      });
      require('response-time')({suffix:false})(req, res, next);
    }

  }
};
