let libs = require("./libs");
let helper = require("./helpers");
let handler = {};

handler.home = function(data, callback) {
  data["home"] = "Homepage";
  callback(200, data);
};

handler.ping = function(data, callback) {
  data["ping"] = "Server Up";
  callback(200, data);
};

handler.sample = function(data, callback) {
  data["sampleResponse"] = "Sample Handler Response";
  callback(406, data);
};

handler.api = function(data, callback) {
  data["apiData"] = "API Response";
  callback(200, data);
};

handler.notFound = function(data, callback) {
  callback(404);
};

// USERS ROUTE
handler.users = function(data, callback) {
  let allowedMethods = ["get", "post", "put", "delete"];
  if (allowedMethods.indexOf(data.method) != -1) {
    handler._users[data.method](data, callback);
  } else {
    callback(405, { error: "Method not allowed" });
  }
};

// USERS Request Container
handler._users = {};

// Required Fields: - firstNme,lastName,password, phone tosAgreement
handler._users.post = function(data, callback) {
  let userData = data.payload; //JSON.parse(data);
  let firstName =
    typeof userData.firstName == "string" &&
    userData.firstName.trim().length > 0
      ? userData.firstName.trim()
      : false;
  let lastName =
    typeof userData.lastName == "string" && userData.lastName.trim().length > 0
      ? userData.lastName.trim()
      : false;
  let phone =
    typeof userData.phone == "string" && userData.phone.length == 10
      ? userData.phone
      : false;
  let password =
    typeof userData.password == "string" && userData.password.trim().length > 0
      ? userData.password.trim()
      : false;
  let tosAgreement =
    typeof userData.tosAgreement == "boolean" && userData.tosAgreement == true
      ? userData.tosAgreement
      : false;

  if (firstName && lastName && phone && password && tosAgreement) {
    libs.read("users", phone, (err, data) => {
      if (err) {
        // Hash the password before saving it to file system
        let hashedPassword = helper.hash(password);
        if (hashedPassword) {
          let userToSave = {
            firstName: firstName,
            lastName: lastName,
            phone: phone,
            password: hashedPassword,
            tosAgreement: true
          };
          libs.create("users", phone, userToSave, (err, data) => {
            if (!err) {
              callback(200, { response: "User created successfully" });
            } else {
              callback(500, { error: err });
            }
          });
        } else {
          callback(500, { error: "error in hashing the password" });
        }
      } else {
        callback(400, {
          error: `A user with  phone ${data.phone} and name ${data.firstName +
            " " +
            data.lastName} already exists`
        });
      }
    });
  } else {
    callback(400, { error: "Missing Required fields" });
  }
};

// Get the info of all the users in object as phone as a key and name as value
handler._users.get = function(data, callback) {
  libs.readDirectory("users", (err, data) => {
    if (!err) {
      callback(200, data);
    } else {
      callback(404, { response: "No USERS " });
    }
  });
};

// update the userinfo primary key is phone, if no value or not desired value use previous val
handler._users.put = function(data, callback) {
  let userData = data.payload;
  let phone =
    typeof userData.phone == "string" && userData.phone.length == 10
      ? userData.phone
      : null;
  if (phone != null) {
    libs.read("users", phone, (err, data) => {
      if (!err) {
        let firstName =
          typeof userData.firstName == "string"
            ? userData.firstName
            : data.firstName;
        let lastName =
          typeof userData.lastName == "string"
            ? userData.lastName
            : data.lastName;
        let password =
          typeof userData.password == "string"
            ? helper.hash(userData.password)
            : data.password;
        //let tosAgreement  = typeof userData.firstName == 'string' ? userData.firstName : null;
        let updatedUser = {
          phone: phone,
          firstName: firstName,
          lastName: lastName,
          password: password,
          tosAgreement: data.tosAgreement
        };

        libs.update("users", phone, updatedUser, (err, data) => {
          if (!err) {
            callback(200, data);
          } else {
            callback(500, err);
          }
        });
      } else {
        callback(400, { response: "Enter Valid phone number" });
      }
    });
  } else {
    callback(400, "Enter a valid phone");
  }
};

// to delete pass the fileName in querystring
handler._users.delete = function(data, callback) {
  let fileName = data.queryString.phone;
  libs.delete("users", fileName, err => {
    if (!err) {
      callback(200, { response: "File deleted successfully" });
    } else {
      callback(500, { error: err });
    }
  });
};

module.exports = handler;
