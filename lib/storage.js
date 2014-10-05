
var light = require("light-framework")
  , conn  = light.framework.mongoconn
  , _     = light.util.underscore
  ;

// TODO: save msg to db

var object = {
  uid: "",
  message: "",
  send: false
};

var datas = [];

/**
 * 添加终端连接
 * @param sid
 * @param uid
 * @param address
 * @param callback
 */
exports.join = function(sid, uid, address, callback) {

  datas.push({
    sid: sid,
    uid: uid,
    address: address
  });

  callback(undefined, datas);
};

/**
 * 删除终端连接
 * @param sid
 * @param callback
 */
exports.leave = function(sid, callback) {
  datas = _.without(datas, _.findWhere(datas, {sid: sid}));
  callback(undefined, datas);
};

/**
 * 获取连接连接中得终端
 * @param uid
 * @param callback
 */
exports.clients = function(uid, callback) {

  var result = _.where(datas, function(item) {
    return item.uid == uid;
  });

  callback(undefined, result);
};

exports.save = function(uid, message, callback) {
};

exports.remove = function(uid, callback) {
};
