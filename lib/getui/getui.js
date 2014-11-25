/**
 * @file 个推推送
 * 	依赖Google的protobuf，需要安装
 * 	for Linux: $ npm install node-protobuf
 * 	for Mac: $ brew install protobuf
 * 	参考: https://github.com/fuwaneko/node-protobuf
 * @author r2space@gmail.com
 */

"use strict";

var light    	= require("light-framework")
	, fs 				= require("fs")
	, crypto 		= require("crypto")
	, Protobuf 	= require("node-protobuf").Protobuf
	, request 	= light.util.request
	, conf     	= light.util.config.push
	, Template 	= require("./TransmissionTemplate")
	, constant  = require("../constant")
	, proto 		= new Protobuf(fs.readFileSync("GtReq.desc"))
	;


/**
 * 认证
 * @param callback
 */
exports.auth = function(callback) {
	var timeStamp = new Date().getTime();
	var sign = md5(conf.getui.appKey + timeStamp + conf.getui.masterSecrt);
	request.post(constant.GETUI_PUSH_URL, {
			json: {
				action: "connect",
				appkey: conf.getui.appKey,
				timeStamp: timeStamp,
				sign: sign,
				version:"3.0.0.0"
			}
		}, function (err, response, body) {
			if (!err && response.statusCode == 200) {
				callback(err, body);
			}
		});
};

/**
 *
 * @param token
 * @param option
 * {
 *   content: "消息内容"
 * }
 * @param callback
 */
exports.push = function(token, option, callback){

	request.post(constant.GETUI_PUSH_URL, {
			json: {
				action: "pushMessageToSingleAction",
				appkey: conf.getui.appKey,
				clientData: getBase64(),
				transmissionContent: option.content,
				isOffline: "false",
				offlineExpireTime: 0,
				appId: conf.getui.appId,
				pushType: "pushTransmissionMsg",
				version:"3.0.0.0",
				clientId: token,
				type: 1
			}
		}, function (err, response, body) {
			if (!err && response.statusCode == 200) {
				callback(err, body);
			}
		});
};

function getBase64() {
	var template = new Template.TransmissionTemplate();
	template.appId = conf.getui.appId;
	template.appKey = conf.getui.appKey;
	template.type = 1;

	return new Buffer(proto.Serialize(template.getTransparent(), "protobuf.Transparent")).toString("base64");
}

function md5(text) {
	return crypto.createHash("md5").update(text).digest("hex");
}
