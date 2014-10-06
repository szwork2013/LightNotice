/**
 * @file 通知
 *  明确的消息被发送，则转发
 * @author r2space@gmail.com
 */

"use strict";

var light     = require("light-framework")
  , _         = light.util.underscore
  , io        = light.util.socket()
  , conf      = light.util.config.server
  , async     = light.util.async
  , log       = light.framework.log
  , storage   = require("./storage")
  , constant  = require("./constant")
  ;

var notice = {

  initialize: function() {
    this.listen();
  },

  /**
   * 监听客户的连接请求
   */
  listen: function() {
    var self = this;

    io.on("connection", function(socket) {

      // 从服务器连接，则想客户端转发通知
      var server = socket.handshake.query.server;
      if (server) {

        socket.on(constant.TAG_PUSH, function (data) {
          log.debug(data.tag, data.uid);

          // 发送通知
          self.emit(data.uid, data.tag, data.message);

          // 接受通知，切断与客户端的连接
          socket.disconnect();
        });

        return;
      }

      // 保存客户端连接
      self.join(socket);

      // 客户端断开连接，删除连接
      socket.on("disconnect", function() {
        self.leave(socket);
      });

    });

    io.listen(conf.port);
    log.debug("WebSocket server listening on port " + conf.port);
  },

  /**
   * 客户端接入
   * @param socket
   */
  join: function(socket) {
    var self = this
      , address = socket.handshake.address
      , uid = socket.handshake.query.uid;

    // TODO: To obtain the user ID from session
    storage.join(socket.id, uid, address, function(err, result) {

      // 当有新客户端接入时，获取未发送的消息
      storage.list(uid, function(err, result) {
        async.forEachSeries(result, function(item, loop) {
          self.emit(item.uid, item.tag, item.message);
          storage.remove(uid, loop);
        });
      });
    });
  },

  /**
   * 客户端离开
   * @param socket
   */
  leave: function(socket) {
    storage.leave(socket.id, function(err, result) {
      if (err) {
        log.error(err);
      }
    });
  },

  /**
   * 给指定的用户发通知
   * @param uid
   * @param tag
   * @param message
   */
  emit: function(uid, tag, message) {
    storage.clients(uid, function(err, sockets) {

      // 非活跃客户端，先保存到数据库
      if (sockets.length <= 0) {
        storage.save(uid, tag, message, function(err) {
          if (err) {
            return log.error(err);
          }
          log.debug("Message successfully saved. " + tag)
        });
        return;
      }

      // 如果客户端是活跃的，则发送消息
      _.each(sockets, function(socket) {
        io.sockets.connected[socket.sid].emit(tag, message);
      });
      log.debug("Message is successfully sent. " + tag)
    });
  }
};

exports = module.exports = notice;
