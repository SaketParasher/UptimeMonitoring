// this is a library for storing and rotating logs

const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

// container for the module
let libs = {};

// Base directory of the logs folder
libs.baseDir = path.join(__dirname, "../.logs/");

// Append a string to a file. create a file if it doesn't exists
libs.append = function(fileName, stringToAppend, callback) {
  let filePath = path.join(this.baseDir, fileName) + ".log";
  fs.open(filePath, "a", (err, fd) => {
    if (!err && fd) {
      // Append the file and close it
      fs.appendFile(fd, stringToAppend + "\n", err => {
        if (!err) {
          fs.close(fd, err => {
            if (!err) {
              callback(false);
            } else {
              callback("Error in closing the file");
            }
          });
        } else {
          callback("Error in appending the file");
        }
      });
    } else {
      callback("could not open the file for appending");
    }
  });
};

// Export the module
module.exports = libs;
