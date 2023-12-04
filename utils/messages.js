const moment = require("moment");

function formatMessage(username, text) {
  return {
    username,
    message: text, // Use 'message' property for text messages
    time: moment().format("h:mm a"),
  };
}

module.exports = formatMessage;
