module.exports.http = {

  /****************************************************************************
  *                                                                           *
  * Express middleware to use for every Sails request. To add custom          *
  * middleware to the mix, add a function to the middleware config object and *
  * add its key to the "order" array. The $custom key is reserved for         *
  * backwards-compatibility with Sails v0.9.x apps that use the               *
  * `customMiddleware` config option.                                         *
  *                                                                           *
  ****************************************************************************/


  middleware: {

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
          time: res.get('X-Response-Time')
        });
      });
      require('response-time')({suffix:false})(req, res, next);
    }

  }
};
