const pino = require('pino');
const options = {
    base: null, // Set to null to avoid adding pid, hostname and name properties to each log.
    timestamp: () => `, "time": ${new Date().toISOString()}`
};

if (process.env !== 'prod') {
    options.prettyPrint = {
        colorize: true
    };
    options.level = 'trace';
}

// module.exports = pino(options, pino.destination('/Users/anxing/workspace/anxing/serverless/demo1/logs'));
module.exports = pino(options);
