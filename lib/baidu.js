/**
 * @file 百度推送
 *   需要在配置文件里设定两个参数，可以在百度开发者管理平台获取
 *     secretKey:
 *     apiKey:
 *   百度推送的RESTApi参考
 *     http://developer.baidu.com/wiki/index.php?title=docs/cplat/push/api
 * Created by luohao on 14/10/28.
 */

var light    = require("light-framework")
  , crypto   = require("crypto")
  , request  = require("request")
  , constant = require("./constant")
  , _        = light.util.underscore
  , conf     = light.util.config.push;

/**
 * 给指定的Tag发送消息
 * Tag与用户的关联在管理画面指定
 * @param tag
 * @param message
 * {
 *   title:
 *   description:
 *   custom_content: {
 *     type:
 *     notifyid:
 *   }
 * }
 * @param callback
 */

exports.pushTag = function(tag, message, callback) {

  var meta = getMessageBody("2", message);
  meta.tag = tag;
  post(meta, callback);
};

/**
 * 推送给所有人
 * @param tag
 * @param message
 * @param callback
 */
exports.pushAll = function(tag, message, callback) {

  var meta = getMessageBody("3", message);
  post(meta, callback);
};

/**
 * 推送给指定的人
 * @param userId
 * @param channelId 指定用户的特定设备
 * @param message
 * @param callback
 */
exports.push = function(userId, channelId, message, callback) {

  var meta = getMessageBody("1", message);
  meta.user_id = userId;
  if (channelId) {
    meta.channel_id = channelId;
  }

  post(meta, callback);
};

/**
 * 获取消息本体结构
 * @param type
 * @param message
 * @returns {{}}
 */
function getMessageBody(type, message) {

  var meta = {};
  meta.method = "push_msg";
  meta.apikey = conf.baidu.apiKey;
  meta.push_type = type;     // 1:单个人 2:一群人 3:所有用户
  meta.message_type = "1";  // 0:消息 1:通知
  meta.timestamp = Math.round(new Date().getTime() / 1000) + "";

  meta.messages = JSON.stringify(message);
  meta.sign = sign(message);
  meta.msg_keys = message.custom_content.notifyid;

  return meta;
}

/**
 * 获取调用参数签名值
 * @param stuff
 * @returns {*}
 */
function sign(stuff) {

  var part = "POST" + constant.PUSH_URL;
  part += _.map(_.keys(stuff).sort(), function (key) {
    return key + "=" + stuff[key];
  }).join("");
  part += conf.baidu.secretKey;

  return md5(encodeURIComponent(part))
}

function md5(stuff) {
  return crypto.createHash("md5").update(stuff, "utf8").digest("hex");
}

/**
 * 进行推送数据
 * @param data
 * @param callback
 */
function post(data, callback) {

  request.post({ url: constant.PUSH_URL, form: data }, function (err, response) {
    if (err) {
      return callback(err);
    }

    if (response.statusCode != 200) {
      return callback({code: "PUSH_ERROR", data: response});
    }

    return callback(null);
  });
}
