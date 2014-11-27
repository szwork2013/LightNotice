/**
 * @file 个推推送用的模板
 * @author r2space@gmail.com
 */

"use strict";

var light    	= require("light-framework")
  , fs        = require("fs")
  , conf     	= light.util.config.push
  , p         = require("node-protobuf")
  , proto     = new p(fs.readFileSync(__dirname + "/gt_req.desc"))

/**
 * 构造函数
 * @param pushType 消息类型 TransmissionMsg | NotifyMsg
 * @constructor
 */
function Template(pushType, title, message){
  this.appKey = conf.getui.appKey;
  this.appId = conf.getui.appId;
  this.masterSecrt = conf.getui.masterSecrt;
  this.action = "pushmessage";
  this.pushInfo = null;
  this.pushType = pushType;
  this.title = title;
  this.text = message;
}

/**
 * 生成透过消息本体
 * @returns {*}
 */
function getTransparent() {
  var transmission = {
    appKey              : this.appKey,
    appId               : this.appId,
    action              : this.action,
    pushType            : this.pushType,
    id                  : "",
    taskId              : "",
    messageId           : "",
    pushInfo            : this.getPushInfo(),
    isRing              : true,
    isVibrate           : true,
    logo                : "icon.png",
    text                : this.text,
    title               : this.title,
    transmissionType    : 1,
    transmissionContent : this.text
  };

  var notify = {
    appKey              : this.appKey,
    appId               : this.appId,
    action              : this.action,
    pushType            : this.pushType,
    id                  : "",
    taskId              : "",
    messageId           : "",
    pushInfo            : this.getPushInfo()
  };

  var transparent = (this.pushType == "NotifyMsg") ? notify : transmission
    , buffer = proto.Serialize(transparent, "Transparent")
    , trans  = proto.Parse(buffer, "Transparent")
    , chains = this.getActionChains();
  for (var i = 0; i < chains.length; i++) {
    trans.actionChain[i] = proto.Parse(proto.Serialize(chains[i], "ActionChain"), "ActionChain");
  }

  // 进行base64编码
  return new Buffer(proto.Serialize(trans, "Transparent")).toString("base64");
}
Template.prototype.getTransparent = getTransparent;

/**
 * 设定通知详细
 * @param actionLockey
 * @param badge
 * @param message
 * @param sound
 * @param payload
 * @param locKey
 * @param locArgs
 * @param launchImage
 */
function setPushInfo(actionLockey, badge, message, sound, payload, locKey, locArgs, launchImage) {
  this.pushInfo = {
    actionLocKey  : actionLocKey,
    badge         : badge,
    message       : message,
    sound         : sound,
    payload       : payload,
    locKey        : locKey,
    locArgs       : locArgs,
    launchImage   : launchImage
  };
}
Template.prototype.getPushInfo = setPushInfo;

/**
 * 获取通知详细
 * @returns {}
 */
function getPushInfo() {
  if (this.pushInfo == null) {
    this.pushInfo = {
      "message" : "",
      "actionKey" : "",
      "sound" : "",
      "badge" : ""
    };
  }
  return this.pushInfo;
}
Template.prototype.getPushInfo = getPushInfo;

/**
 * 获取通知用Chain
 * @returns {*[]}
 */
function getNotificationChains(title, text) {

  var start = {
    "actionId" : 1,
    "type" : 0,
    "next" : 10000
  };

  var notification = {
    actionId: 10000,
    type: 1,
    title: title,
    text: text,
    logo: "icon.png",
    logoURL: "",
    ring: true,
    clearable: true,
    buzz: true,
    next: 10010
  };

  var goto = {
    actionId: 10010,
    type: 0,
    next: 10030
  };

  var appstartid = {
    "android" : "",
    "symbia" : "",
    "ios" : ""
  };

  var appStartUp = {
    "actionId" : 10030,
    "type" :3,
    "appid" : "",
    "autostart" : true,
    "appstartid" : appstartid,
    "failedAction" : 100,
    "next" : 100
  }

  var end = {
    "actionId" : 100,
    "type" : 7
  }

  return [start, notification, goto, appStartUp, end];
}

/**
 * 获取透过用Chain
 * @returns {*[]}
 */
function getTransmissionChains() {
  var start = {
    "actionId" : 1,
    "type" : 0,
    "next" : 10030
  };

  var appstartid = {
    "android" : "",
    "symbia" : "",
    "ios" : ""
  };

  var appStartUp = {
    "actionId" : 10030,
    "type" :3,
    "appid" : "",
    "autostart" : true,
    "appstartid" : appstartid,
    "failedAction" : 100,
    "next" : 100
  };

  var end = {
    "actionId" : 100,
    "type" : 7
  };

  var actionChains = [start, appStartUp, end]
  return actionChains
}

/**
 * 获取ActionChains
 * @returns {*}
 */
function getActionChains() {
  if (this.pushType == "NotifyMsg") {
    return getNotificationChains(this.title, this.text);
  }

  if (this.pushType == "TransmissionMsg") {
    return getTransmissionChains();
  }

  return [];
}
Template.prototype.getActionChains = getActionChains;

module.exports = Template;
