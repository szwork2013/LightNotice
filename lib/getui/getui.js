/**
 * @file 个推推送
 *   依赖Google的protobuf，需要安装
 *   for Linux: $ npm install node-protobuf
 *   for Mac: $ brew install protobuf
 *   参考: https://github.com/fuwaneko/node-protobuf
 * @author r2space@gmail.com
 */

"use strict";

var light     = require("light-framework")
  , _         = light.util.underscore
  , crypto    = require("crypto")
  , request   = light.util.request
  , Template  = require("./template")
  , constant  = require("../constant")
  ;

/**
 * 认证
 * @param callback
 */
exports.auth = function(callback) {

  var template = new Template()
    , sign = md5(template.appKey + new Date().getTime() + template.masterSecrt);

  request.post(constant.GETUI_PUSH_URL, {
    json: {
      action    : "connect",
      appkey    : template.appKey,
      timeStamp : timeStamp,
      sign      : sign,
      version   : "3.0.0.0"
    }
  }, function (err, response, body) {
    if (!err && response.statusCode == 200) {
      callback(err, body);
    }
  });
};

/**
 * 推送
 * @param token
 * @param option
 * {
 *   title: "消息内容"
 *   message: ""
 *   type: NotifyMsg | TransmissionMsg
 * }
 * @param callback
 */
exports.push = function(token, option, callback){

  var template = new Template(option.type, option.title, option.message);
  request.post(constant.GETUI_PUSH_URL, {
    json: {
      appkey              : template.appKey,
      appId               : template.appId,
      pushType            : template.pushType,
      clientData          : template.getTransparent(),
      transmissionContent : option.message,
      action              : "pushMessageToSingleAction",
      pushNetWorkType     : 0,
      type                : 2,
      clientId            : token,
      alias               : "",
      offlineExpireTime   : 360000,
      version             : "3.0.0.0",
      isOffline           : "true"
    }
  }, function (err, response, body) {
    return callback(err, body);
  });
};

/**
 * 推送给多个用户
 * @param tokens
 * @param option
 * @param callback
 */
exports.pushAll = function(tokens, option, callback){

  var template = new Template(option.type, option.title, option.message)
    , json = getJsonStructure(template);

  json.transmissionContent = option.message;
  json.action = "getContentIdAction";
  json.taskGroupName = "";

  // 获取群发的contentId
  request.post(constant.GETUI_PUSH_URL, { json: json }, function (err, response, body) {

    if (err || response.statusCode != 200) {
      return callback(err || response.statusCode);
    }

    var contentId = body.contentId
      , targetList = [];

    // 生成发送对象列表
    _.each(tokens, function(token) {
      targetList.push({ alias: "", clientId: token, appId: template.appId });
    });

    json = {
      appkey      : template.appKey,
      contentId   : contentId,
      needDetails : "true",
      version     : "3.0.0.0",
      action      : "pushMessageToListAction",
      type        : 2,
      targetList  : targetList
    };

    // 发送消息
    request.post(constant.GETUI_PUSH_URL, { json: json }, function (err, response, body) {
      return callback(err, body);
    });

  });
};

function md5(text) {
  return crypto.createHash("md5").update(text).digest("hex");
}

function getJsonStructure(template) {
  return {
    appkey              : template.appKey,
    pushType            : template.pushType,
    clientData          : template.getTransparent(),
    pushNetWorkType     : 0,
    type                : 2,
    offlineExpireTime   : 360000,
    version             : "3.0.0.0",
    isOffline           : "true"
  }
}
