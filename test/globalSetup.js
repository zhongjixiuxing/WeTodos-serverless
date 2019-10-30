const { spawn, spawnSync, execSync } = require('child_process');
const {assert} = require('chai');
const config = require('./config');
require('jest');


// kill old dynamondb service
function killLocalDynamodbService() {
    const pid = execSync('lsof -nP -iTCP:8000 |grep LISTEN|awk \'{print $2;}\'');
    if (pid.toString() !== '') {
        execSync(`kill -9 ${pid.toString()}`);
    }
}

function startSlsOffline() {
    return new Promise((resolve, reject) => {
        killLocalDynamodbService();

        const slsEnv = Object.create(process.env);
        slsEnv.JWT_PRIVATE_KEY = config.JWT_PRIVATE_KEY;
        slsEnv.JWT_PUBLIC_KEY = config.JWT_PUBLIC_KEY;

        const slsOfflineProcess = spawn("sls", ["offline", "start", '--config', 'serverless.yaml'], {env: slsEnv});

        console.log(`Serverless: Offline started with PID : ${slsOfflineProcess.pid}`);

        slsOfflineProcess.stdout.on('data', (data) => {
            if (data.includes("Offline [HTTP] listening on")) {
                console.log(data.toString().trim());
                resolve(slsOfflineProcess);
            }
        });

        slsOfflineProcess.stderr.on('data', (errData) => {
            console.log(`Error starting Serverless Offline:\n${errData}`);
            reject(errData);
        });
    })
}

module.exports = async () =>  {
    const slsOfflineProcess = await startSlsOffline();
    global.slsPid = slsOfflineProcess.pid;
    return {slsOfflineProcess};
};
