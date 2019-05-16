/**
 *  Worker related Tasks 
 */

// Dependencies

const path = require('path');
const fs = require('fs');
const http = require('http');
const https = require('./https');
const url = require('url');
const libs = require('./libs');
const helpers = require('./helpers');

// Instantiate the worker container object
let workers = {};

// Timer to execute the worker-process once per minute
workers.loop = function(){
    setInterval(function(){
        workers.gatherAllChecks();
    },1000*60);
}

// Sanity-Check the check data that we are pulling out of each check
workers.validateCheckData = function(originalCheckData){
    originalCheckData = typeof originalCheckData == 'object' && originalCheckData != null ? originalCheckData : {};
    originalCheckData.id = typeof originalCheckData.id == 'string' && originalCheckData.id.trim().length == 20 ? originalCheckData.id : false;
    originalCheckData.phone = typeof originalCheckData.phone == 'string' && originalCheckData.phone.trim().length == 10 ? originalCheckData.phone : false;
    originalCheckData.protocol = typeof originalCheckData.protocol == 'string' && ['http','https'].indexOf( originalCheckData.protocol) > -1 ? originalCheckData.protocol : false;
    originalCheckData.url = typeof originalCheckData.url == 'string' && originalCheckData.url.trim().length > 0 ? originalCheckData.url.trim() : false;
    originalCheckData.method = typeof originalCheckData.method == 'string' && ['get','post','put','delete'].indexOf( originalCheckData.method) > -1 ? originalCheckData.method : false;
    originalCheckData.successCodes = typeof originalCheckData.successCodes == 'object' &&  originalCheckData.successCodes instanceof Array && originalCheckData.successCodes.length > 0 ? originalCheckData.protocol : false;
    originalCheckData.timeoutSeconds = typeof originalCheckData.timeoutSeconds == 'number' && originalCheckData.timeoutSeconds % 1 === 0 && originalCheckData.timeoutSeconds >= 1 && originalCheckData.timeoutSeconds <= 5 ? originalCheckData.timeoutSeconds : false;

    /* Set the keys that may not be set ( if the workers have never seen this check before)
     * There will e two new keys one is called State that is gonna hold whether the check is currently up or currently down 
     * And the next key is called last checked which is a timestamp indicating the last time that this check was performed.  */

    originalCheckData.state = typeof originalCheckData.state == 'string' && ['up','down'].indexOf( originalCheckData.state) > -1 ? originalCheckData.state : 'down';
    originalCheckData.lastChecked = typeof originalCheckData.lastChecked == 'number' && originalCheckData.lastChecked > 0 ? originalCheckData.lastChecked : false;

    // If all the checks passed , pass the data along to the next step in the process 
    if(originalCheckData.id && originalCheckData.phone && originalCheckData.protocol && originalCheckData.url && originalCheckData.method && originalCheckData.successCodes && originalCheckData.timeoutSeconds){
        // if all the check data is verified and validated then pass the originalCheckData
    }else{
        console.log('Error :- One of the check is not properly Formatted. Skipping It.');
    }
}

// Lookup all the checks, get their data and send that data to a validator
workers.gatherAllChecks = function(){
    // Get all the checks that exists in the system 
    libs.list('checks',(err,checks) => {
        if(!err && checks && checks.length > 0){
            // Iterate all the checks and then read the check data
            for(let check of checks){
                // Read each check data 
                libs.read('checks',check,(err,originalCheckData)=>{
                    if(!err && originalCheckData){
                        // If there is data pass that check data to the validator, and let that function continue or log error
                        workers.validateCheckData(originalCheckData);
                    }else{
                        console.log('Error Reading one of the checks data');
                    }
                });
            }
        }else{
            console.log('Error :- couldn\'t find any checks to process');
        }
    });
}

// Worker init script
workers.init = function(){
    
    // Execute all the checks immediately
    this.gatherAllChecks();

    // set a interval so the checks will execute later on
    this.loop();
}




// export the worker container object
module.exports = workers;
