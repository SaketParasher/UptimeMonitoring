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
/*
handler._users.get = function(data, callback) {
  libs.readDirectory("users", (err, data) => {
    if (!err) {
      callback(200, data);
    } else {
      callback(404, { response: "No USERS " });
    }
  });
};
*/

handler._users.get = function(data, callback) {
  let phone = typeof data.queryString.phone == 'string' && data.queryString.phone.length == 10 ? data.queryString.phone : null;
  if(phone != null){
    let token = typeof data.header.token == 'string' ? data.header.token : null;
    handler._tokens.validateToken(token,phone,(isValid)=>{
      if(isValid){
        libs.read('users',phone,(err,userData)=>{
          if(!err && userData){
            callback(200,userData);
          }else{
            callback(500,{error:err});
          }
        });
      }else{
        callback(500,{error:'Token is not valid'});
      }
    })
  }
};

// update the userinfo primary key is phone, if no value or not desired value use previous val
handler._users.put = function(data, callback) {
  let userData = data.payload;
  let phone =
    typeof userData.phone == "string" && userData.phone.length == 10
      ? userData.phone
      : null;
  if (phone != null) {
    // First get the token from headers to validate the user
    let token = typeof data.header.token == 'string' ? data.header.token :null;
    handler._tokens.validateToken(token,phone,(isValid)=>{
      // if token is valid then only continue otherwise error callback
      if(isValid){
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
      }else{
        callback(400,{Error:'Token is not valid or may be expired'});
      }
    });

  } else {
    callback(400, "Enter a valid phone");
  }
};

// to delete pass the fileName in querystring
handler._users.delete = function(data, callback) {
  let phone = typeof data.queryString.phone == 'string' && data.queryString.phone.length == 10 ? data.queryString.phone : null;
  if(phone != null){
    let token = typeof data.header.token == 'string' ? data.header.token : null;
    handler._tokens.validateToken(token,phone,(isValid)=>{
      if(isValid){
          libs.delete("users", phone, err => {
          if (!err) {
            callback(200, { response: "File deleted successfully" });
          } else {
            callback(500, { error: err });
          }
        });
      }else{
        callback(400,{error:'Please enter a valid token'});
      }
    })
  } else{
    callback(400,{error:'Please enter a valid phone number'});
  }
};

// TOKENS ROUTE
handler.tokens = function(data, callback) {
  let allowedMethods = ["get", "post", "put", "delete"];
  if (allowedMethods.indexOf(data.method) != -1) {
    handler._tokens[data.method](data, callback);
  } else {
    callback(405, { error: "Method not allowed" });
  }
};

// TOKENS CONTAINER
handler._tokens = {};

// TOKENS POST ROUTE --> phone and password are required to create token
handler._tokens.post = function(data,callback){
  let phone = typeof data.payload.phone == 'string' && data.payload.phone.length == 10 ? data.payload.phone : null;
  let password = typeof data.payload.password == 'string' ? data.payload.password : null;

  if(phone != null){
    // check if the user with same phone exisis
    libs.read('users',phone,(err,userData)=>{
      if(!err && userData){
        if(helper.hash(password) == userData.password){
            // If password and phone matches then create tokenId and expiration the create token object and persist it to tokens directory
            let tokenId = helper.createRandomString(20);
            let expiration = Date.now()+ 60*60*1000;
            let tokenObject = {
              phone:phone,
              tokenId:tokenId,
              expiration:expiration
            }
            libs.create('tokens',tokenId,tokenObject,(err,tokenData)=>{
              if(!err && tokenData){
                callback(200,tokenData);
              }else{
                callback(500,{error:'Error in creating Token'});
              }
            })
          }else{
          callback(400,{error:'Password do not matches. Please enter correct password '});
        }
      }else{
        callback(400,{error:'User with specified phone does not exists'});
      }
    })
  }else{
    callback(400,{error:'Please Enter a Valid Phone Number'})
  }
}

// TOKENS GET get the tokenId from queryString
handler._tokens.get = function(data,callback){
  let tokenId = typeof data.queryString.id == 'string' ? data.queryString.id : null;
  if(tokenId != null){
    libs.read('tokens',tokenId,(err,tokenData)=>{
      if(!err && tokenData){
        callback(200,tokenData);
      }else{
        callback(400,{error:err});
      }
    })
  }else{
    callback(400,{error:'Please provide valid string token id'});
  }
}

// UPDATE the token if it is not expired yet. If not expired update it's expiration will be updated to one more hour.
handler._tokens.put = function(data,callback){
  let id = typeof data.payload.id == 'string' ? data.payload.id : null;
  let extend = typeof data.payload.extend == 'boolean' && data.payload.extend == true ? data.payload.extend : null;

  if(id != null && extend != null){
    libs.read('tokens',id,(err,tokenData)=>{
      if(!err && tokenData){
        if(tokenData.expiration > Date.now()){
          tokenData.expiration += 60*60*1000;
          libs.update('tokens',id,tokenData,(err,updatedData)=>{
            if(!err && updatedData){
              callback(200,updatedData);
            }else{
              callback(500,{error:err});
            }
          }); 
        }else{
          callback(500,{error:'Token already expired'});
        }
      }else{
        callback(400,{error:'Please Enter a valid TokenId'})
      }
    })
  }else{
    callback(400,{error:'Please enter valid string id and set extend to true'});
  } 
}

handler._tokens.delete = function(data,callback){
  let id = typeof data.queryString.id == 'string' && data.queryString.id.length == 20 ? data.queryString.id : null;
  if(id != null){
    libs.read('tokens',id,(err,tokenData)=>{
      if(!err && tokenData){
        libs.delete('tokens',id,(err,deleteData)=>{
          if(!err && deleteData){
            callback(200,deleteData);
          }else{
            callback(500,{error:err});
          }
        })
      }else{
        callback(400,{error:err});
      }
    })
  }else{
    callback(400,"Please Enter a valid string ID");
  }
}

// validate the token sent in header with the phone number and check whether token if valid and have not exppired till now
handler._tokens.validateToken = function(token,phone,callback){
  if(token != null){
      libs.read('tokens',token,(err,tokenData)=>{
      if(!err && tokenData){
        if((tokenData.phone == phone) && (tokenData.expiration > Date.now())){
          callback(true);
        }else{
          callback(false);
        }
      }else{
        callback(false);
      }
    });
  }else{
    callback(false);
  }

};


module.exports = handler;
