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
	, crypto 		= require("crypto")
	, request 	= light.util.request
	, Template 	= require("./template")
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
			action		: "connect",
			appkey		: template.appKey,
			timeStamp	: timeStamp,
			sign			: sign,
			version		: "3.0.0.0"
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
			appkey							: template.appKey,
			appId								: template.appId,
			pushType						: template.pushType,
			clientData					: template.getTransparent(),
			transmissionContent	: option.content,
			action							: "pushMessageToSingleAction",
			pushNetWorkType			: 0,
			type								: 2,
			clientId						: token,
			alias								: "",
			offlineExpireTime		: 360000,
			version							: "3.0.0.0",
			isOffline						: "true"
		}
	}, function (err, response, body) {
		return callback(err, body);
	});
};

exports.pushAll = function(token, option, callback){

};

function md5(text) {
	return crypto.createHash("md5").update(text).digest("hex");
}
