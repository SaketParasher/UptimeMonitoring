let crypto = require("crypto");
let config = require("../config");

let helpers = {};

helpers.hash = function(pass) {
  if (typeof pass == "string" && pass.length > 0) {
    let hash = crypto
      .createHmac("sha256", config.hashingSecret)
      .update(pass)
      .digest("hex");
    return hash;
  } else {
    return false;
  }
};

helpers.JSONtoObject = function(str) {
  try {
    return JSON.parse(str);
  } catch (e) {
    return {};
  }
};

module.exports = helpers;
