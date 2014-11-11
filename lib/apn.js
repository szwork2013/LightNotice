/**
 * @file ios设备APN处理
 *  iOS证书使用, 需要使用 .cer 和 .p12 文件进行转换。
 *    https://github.com/argon/node-apn/wiki/Preparing-Certificates
 *
 *    $ openssl x509 -in cert.cer -inform DER -outform PEM -out cert.pem
 *    $ openssl pkcs12 -in key.p12 -out key.pem -nodes
 *
 *    cert.cer是通过Apple开发者账户生成的文件，会有开发版和产品版两个文件
 *     - aps_development.cer
 *     - aps_production.cer
 *
 *    key.p12文件是从Keychain Access工具导出的。在 我的证书 里找到 IOS Push Services
 *    导出子项中得钥匙标志的项目，默认即为.p12文件
 * @type {exports}
 */

var light     = require("light-framework")
  , apn       = require ("apn")
  , conf      = light.util.config
  , log       = light.framework.log;

/**
 * 发送通知
 * @param tokens
 * @param option
 * {
 *   text 通知消息, 必须
 *   expiry 过期时间, 默认1H
 *   badge 提示数, 默认1
 *   sound 设置声音, 默认"ping.aiff"
 *   payload 通知详细
 * {
 */
exports.push = function(tokens, option) {

  // 没有token， 什么也不做立即返回
  if (!tokens || tokens.length <= 0 || !option.text) {
    return;
  }

  var note = new apn.notification();
  note.setAlertText(option.text);
  note.expiry = option.expiry || Math.floor(Date.now() / 1000) + 3600;
  note.badge = option.badge || 1;
  note.sound = option.sound || "ping.aiff";

  if (option.payload) {
    note.payload = { "messageFrom": option.payload };
  }

  // 发送通知
  connection().pushNotification(note, tokens);
}

/**
 * 生成连接
 * @returns {exports.connection}
 */
function connection() {

  var options = {}
    , path = process.cwd();

  if (conf.push && conf.push.apn) {
    if (conf.push.apn.isDevelopment) {
      options.gateway = "gateway.sandbox.push.apple.com";
      options.cert = path + conf.push.apn.certDevelopment;
      options.key = path + conf.push.apn.key;
    } else {
      options.gateway = "gateway.push.apple.com";
      options.cert = path + conf.push.apn.certProduction;
      options.key = path + conf.push.apn.key;
    }
  }

  var service = new apn.connection(options);
  service.on("connected", function() {
    log.debug("Connected.");
  });

  service.on("transmitted", function(notification, device) {
    log.debug("Transmitted to: " + device.token.toString("hex"));
  });

  service.on("transmissionError", function(errCode, notification, device) {
    log.error("Notification caused error: " + errCode + " for device ", device);
  });

  service.on("timeout", function () {
    log.error("Connection Timeout");
  });

  service.on("disconnected", function() {
    log.error("Disconnected from APNS");
  });

  service.on("socketError", function(err) {
    log.error(err);
  });

  return service;
}
