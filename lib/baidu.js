/**
 * @file 百度推送
 * Created by luohao on 14/10/28.
 */

var light    = require("light-framework")
  , crypto   = require("crypto")
  , request  = require("request")
  , constant = require("./constant")
  , _        = light.util.underscore
  , conf     = light.util.config.push;

var apiKey = conf.baidu.apiKey
  , secretKey = conf.baidu.secretKey;

exports.pushTag = function (tag, title, content, type, notifyid, callback) {

  var data = {
    method: "push_msg",
    apikey: apiKey,
    timestamp: Math.round(new Date().getTime() / 1000) + "",
    push_type: "2",
    tag: tag,
    message_type: "1",
    msg_keys: notifyid
  };

  doPush(title, content, type, notifyid, data, callback);
};

exports.pushAll = function (title, content, type, notifyid, callback) {

  var data = {
    method: "push_msg",
    apikey: apiKey,
    timestamp: Math.round(new Date().getTime() / 1000) + "",
    push_type: "3",
    message_type: "1",
    msg_keys: notifyid
  };

  doPush(title, content, type, notifyid, data, callback);
};

function sign(stuff) {
  var part = "POST" + constant.PUSH_URL;
  part += _.map(_.keys(stuff).sort(), function (key) {
    return key + "=" + stuff[key];
  }).join("");
  part += secretKey;
  var base = encodeURIComponent(part);
  return md5(base)
}

function md5(stuff) {
  return crypto.createHash("md5").update(stuff, "utf8").digest("hex");
}

function doPush(title, content, type, notifyid, data, callback) {

  var contentObj = {
    title: title,
    description: content,
    custom_content: {
      type: type,
      notifyid: notifyid
    }
  };

  data.messages = JSON.stringify(contentObj);
  data.sign = sign(data);

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
