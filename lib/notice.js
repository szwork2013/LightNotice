
var light   = require("light-framework")
  , _       = light.util.underscore
  , io      = light.util.socket()
  , conf    = light.util.config.server
  , log     = light.framework.log
  , storage = require("./storage")
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

      // 从服务器连接
      var server = socket.handshake.query.server;
      if (server) {

        console.log("------------------", server, socket.id);
        socket.on("light.push", function (data) {
          // TODO: Save notice data to storage

          console.log(data);

          // 接受通知，切断与客户端的连接
          socket.disconnect();
        });

        return;
      }

      // 保存客户端连接
      var address = socket.handshake.address
        , uid = socket.handshake.query.uid;

      // TODO: To obtain the user ID from session
      storage.join(socket.id, uid, address, function(err, result) {
        // TODO: Gets the unsent messages
self.emit("53fdcab84253280000cf6a59", "light.poke", "hello");
        console.log(result);
      });

      // 客户端断开连接，删除连接
      socket.on("disconnect", function() {
        storage.leave(socket.id, function(err, result) {
          if (err) {
            log.error(err);
          }
          console.log(result);
        });
      });

    });

    io.listen(conf.port);
  },

  /**
   * 给指定的用户发通知
   * @param uid
   * @param notice
   * @param message
   */
  emit: function(uid, notice, message) {

    // TODO: get socketid;
    storage.clients(uid, function(err, sockets) {console.log(sockets);
      _.each(sockets, function(socket) {console.log("------", socket);
        io.sockets.connected[socket.sid].emit(notice, message);
      });
    });
  }

};

exports = module.exports = notice;
