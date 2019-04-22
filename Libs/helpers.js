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

helpers.createRandomString = function(strLength){
  strLength = typeof strLength == 'number' && strLength > 0 ? strLength : null;
  if(strLength != null){
    let availableCharacters = "abcdefghijklmnopqrstuvwxyz0123456789";
    let randomString = '';
    for(let i = 0;i<strLength;i++){
      randomString += availableCharacters[Math.floor(Math.random()*availableCharacters.length)];
    }
    return randomString;
  }else{
    return false;
  }
}

module.exports = helpers;
