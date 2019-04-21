var environment = {};

environment.staging = {
  httpPort: 4000,
  httpsPort: 4001,
  envName: "staging",
  hashingSecret: "thisIsAHashingSecret"
};

environment.production = {
  httpPort: 5000,
  httpsPort: 5001,
  envName: "production",
  hashingSecret: "thisIsAanotherHashingSecret"
};

var runEnv =
  typeof environment[process.env.NODE_ENV] != "undefined"
    ? process.env.NODE_ENV
    : "staging";

var envToExport = environment[runEnv];

console.log(runEnv, envToExport);

module.exports = envToExport;
