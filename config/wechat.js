const process = require('process');

module.exports = {
    url: 'https://api.weixin.qq.com/sns/jscode2session',
    appId: process.env.WX_APPID || 'wechat mini program appid',
    secret: process.env.WX_SECRET || 'wechat mini program secret'
};
