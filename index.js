/**
 * index.js for our API
 */

// Dependencies
const http = require("http");
const https = require("https");
const url = require("url");
const fs = require("fs");
const stringDecoder = require("string_decoder").StringDecoder;
const config = require("./config");
const lib = require("./Libs/libs");
const helper = require("./Libs/helpers");
const handler = require("./Libs/handler");

// @TODO Delete it later
/*lib.create("users", "second", { secKey: "secVal" }, result => {
  console.log(result);
});*/
/*lib.delete("users", "second", result => {
  console.log(result);
});*/

let trimPath = function(pathName) {
  let splittedPath = pathName.split("/");
  if (splittedPath[0] == "") splittedPath.splice(0, 1);
  if (splittedPath[splittedPath.length - 1] == "")
    splittedPath.splice(splittedPath.length - 1, 1);

  return splittedPath.join("/");
};

const httpsServerCOnfig = {
  key: fs.readFileSync("./Https/key.pem"),
  cert: fs.readFileSync("./Https/cert.pem")
};

const httpServer = http.createServer((req, res) => {
  //console.log("Inside http server");
  unifiedServer(req, res);
});

const httpsServer = https.createServer(httpsServerCOnfig, (req, res) => {
  //console.log("Inside https server");
  unifiedServer(req, res);
});

const unifiedServer = function(req, res) {
  // Get the URL and parse it. true as second arg to get the query string using queryString Module
  var parsedUrl = url.parse(req.url, true);

  // Get the method
  var method = req.method.toLocaleLowerCase();

  // Get the query string as an object
  var queryStringObj = parsedUrl.query;

  // Get the request header
  var headers = req.headers;

  //console.log(headers);

  const decoder = new stringDecoder("utf-8");
  var buffer = "";

  // Get the payload if any ie data of post request
  req.on("data", data => {
    buffer += decoder.write(data);
  });

  req.on("end", () => {
    buffer += decoder.end();

    let data = {
      pathName: trimPath(parsedUrl.pathname),
      method: method,
      queryString: queryStringObj,
      payload: helper.JSONtoObject(buffer)
    };

    let trimmedPath = trimPath(parsedUrl.pathname);

    let handlerToCall =
      router[trimmedPath] != undefined ? router[trimmedPath] : router.notFound;

    handlerToCall(data, function(statusCode, payload) {
      let payloadToSend = payload != undefined ? payload : {};
      res.setHeader("Content-Type", "application/json");
      res.writeHead(statusCode);

      //data["handlerResp"] = payload;
      res.end(JSON.stringify(payloadToSend));
    });
  });
};

// router object which contains the routes
var router = {
  "": handler.home,
  ping: handler.ping,
  sample: handler.sample,
  "api/sample": handler.api,
  users: handler.users,
  notFound: handler.notFound
};

httpsServer.listen(config.httpsPort, () => {
  console.log(
    `Server is listening on port ${config.httpsPort} in ${
      config.envName
    } Environment`
  );
});

httpServer.listen(config.httpPort, () => {
  console.log(
    `Server is listening on port ${config.httpPort} in ${
      config.envName
    } Environment`
  );
});
