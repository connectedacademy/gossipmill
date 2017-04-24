let fs = require('fs-promise');
module.exports.bootstrap = async function(cb) {
  //FOR DEBUG DUMP OF DB:
  // if (!fs.existsSync(__dirname + '/messages.json'))
  // {
  //   let allmessages = await Message.find({}).limit(1000);
  //   let done = await fs.writeFile(__dirname + '/messages.json',JSON.stringify(Message.removeCircularReferences(allmessages)));
  //   console.log("written dummy file");
  // }
  cb();
};
