'use strict';
const AWS = require('aws-sdk'); // eslint-disable-line import/no-extraneous-dependencies
const logger = require('./logger');

let options = {
    convertEmptyValues: true
};

// connect to local DB if running offline
if (process.env.IS_OFFLINE) {
    Object.assign(options,{
        region: 'localhost',
        endpoint: 'http://localhost:8000',
        accessKeyId: 'DEFAULT_ACCESS_KEY',  // needed if you don't have aws credentials at all in env
        secretAccessKey: 'DEFAULT_SECRET' // needed if you don't have aws credentials at all in env
    });
}

const client = new AWS.DynamoDB.DocumentClient(options);

module.exports = {
    dynamodb: client
};
