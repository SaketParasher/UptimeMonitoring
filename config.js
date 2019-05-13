var environment = {};

environment.staging = {
  httpPort: 4000,
  httpsPort: 4001,
  envName: "staging",
  hashingSecret: "thisIsAHashingSecret",
  maxChecks: 5,
  twilio:{
    accountSid:'AC0b723a7697819beddc78a9a84867c31c',
    authToken:'d2bd82d2e5471457706d33c65b3fd12c',
    fromPhone:'+917019609525'
  }
};

environment.production = {
  httpPort: 5000,
  httpsPort: 5001,
  envName: "production",
  hashingSecret: "thisIsAanotherHashingSecret",
  maxChecks: 5,
  twilio:{
    accountSid:'AC0b723a7697819beddc78a9a84867c31c',
    authToken:'d2bd82d2e5471457706d33c65b3fd12c',
    fromPhone:'+917019609525'
  }
};

var runEnv =
  typeof environment[process.env.NODE_ENV] != "undefined"
    ? process.env.NODE_ENV
    : "staging";

var envToExport = environment[runEnv];

console.log(runEnv, envToExport);

module.exports = envToExport;
