/**
 *
 *
 * 证明书生成方法
 *   https://github.com/argon/node-apn/wiki/Preparing-Certificates
 * @type {exports}
 */

var apn = require ("apn");

/**
 * 发送通知
 * @param tokens
 * @param text
 * @param callback
 */
exports.push = function(tokens, text, callback) {

  // 没有token， 什么也不做立即返回
  if (!tokens || tokens.length <= 0) {
    callback();
    return;
  }

  var message = new apn.notification();
  message.setAlertText(text);
  message.badge = 1;

  // 发送通知
  connection().pushNotification(message, tokens);
}

/**
 * 生成连接
 * @returns {exports.connection}
 */
function connection() {

  var service = new apn.connection({ gateway: "gateway.sandbox.push.apple.com" });

  service.on("connected", function() {
    console.log("Connected");
  });

  service.on("transmitted", function(notification, device) {
    console.log("Notification transmitted to:" + device.token.toString("hex"));
  });

  service.on("transmissionError", function(errCode, notification, device) {
    console.error("Notification caused error: " + errCode + " for device ", device, notification);
    if (errCode == 8) {
      console.log("A error code of 8 indicates that the device token is invalid." +
      " This could be for a number of reasons - are you using the correct environment? " +
      "i.e. Production vs. Sandbox");
    }
  });

  service.on("timeout", function () {
    console.log("Connection Timeout");
  });

  service.on("disconnected", function() {
    console.log("Disconnected from APNS");
  });

  service.on("socketError", console.error);
  return service;
}
