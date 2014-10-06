/**
 * @file 存储
 * @author r2space@gmail.com
 */

var light = require("light-framework")
  , conn  = light.framework.mongoconn
  , _     = light.util.underscore
  ;

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

/**
 * 获取指定用户的通知一览
 * @param uid
 * @param callback
 */
exports.list = function(uid, callback) {
  conn.nativedb("LightDB").open(function(err, db) {
    db.collection("notice").find({uid: uid}).toArray(function(err, result) {
      db.close();
      console.log(result);
      callback(err, result);
    });
  });
};

/**
 * 保存通知
 * @param uid
 * @param tag
 * @param message
 * @param callback
 */
exports.save = function(uid, tag, message, callback) {
  conn.nativedb("LightDB").open(function(err, db) {
    var data = {
      uid: uid,
      tag: tag,
      message: message,
      valid: 1,
      createAt: new Date(),
      createBy: uid
    };
    db.collection("notice").insert(data, {w: 1}, function(err, result) {
      db.close();
      callback(err, result);
    });
  });
};

/**
 * 删除通知
 * @param uid
 * @param callback
 */
exports.remove = function(uid, callback) {
  conn.nativedb("LightDB").open(function(err, db) {
    db.collection("notice").remove({uid: uid}, {w: 1}, function(err, result) {
      db.close();
      callback(err, result);
    });
  });
};
