var winston = require('winston');
var customLogger = new winston.Logger();
let os = require('os');

// A console transport logging debug and above.
customLogger.add(winston.transports.Console, {
  level: 'debug',
  colorize: true
});

//REMOTE LOGGING
if (!process.env.CI && process.env.NODE_ENV=='production')
{
  let logzioWinstonTransport = require('winston-logzio');
  let loggerOptions = {
      token: process.env.LOGZ_TOKEN,
      host: 'listener.logz.io',
      type: 'gossipmill',
      level: 'verbose'
  };
  customLogger.on('error',(err)=>{
    console.error(err);
  });
  customLogger.add(logzioWinstonTransport,loggerOptions);

  let winstonAwsCloudWatch = require('winston-cloudwatch');
  customLogger.add(winstonAwsCloudWatch, {
    logGroupName: 'ConnectedAcademyAPI',
    logStreamName:'gossipmill',
    awsRegion: process.env.AWS_DEFAULT_REGION,
    jsonMessage: true,
    level:'verbose'
  });
}

module.exports.log = {
  // Pass in our custom logger, and pass all log levels through.
  custom: customLogger,
  level: 'silly',

  // Disable captain's log so it doesn't prefix or stringify our meta data.
  inspect: false
};