const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const Filter = require("bad-words");
const path = require("path");
const moment = require("moment");
const { addUser, getListUserByRoom, removeUser } = require("./model/user");
const app = express();
// static file
const publicPathDirectory = path.join(__dirname, "../public");
app.use(express.static(publicPathDirectory));
//
const httpServer = createServer(app);
const io = new Server(httpServer, {
  /* options */
});

io.on("connection", (socket) => {
  console.log(` client ${socket.id} connect`);
  //
  socket.on("join-room-client-to-server", ({ room, username }) => {
    socket.join(room);
    const newUser = {
      room,
      username,
      id: socket.id,
    };
    addUser(newUser);
    io.emit("send-user-list-server-to-client", getListUserByRoom(room));

    // xử lý thông báo cho user vừa join vào room
    //  xử lý thông báo cho user trong room biết có user mới

    socket.emit("send-message-server-to-client", {
      username: "ADMIN",
      time: moment(new Date()).format("DD/MM/YYYY - hh:mm:ss "),
      content: `Welcome ${username} to ${room}`,
    });

    socket.broadcast.to(room).emit("send-message-server-to-client", {
      username: "ADMIN",
      time: moment(new Date()).format("DD/MM/YYYY - hh:mm:ss "),
      content: `${username} join ${room}`,
    });

    socket.on("send-message-client-to-server", (message, callback) => {
      const filter = new Filter();
      if (filter.isProfane(message)) {
        return callback("nội dung không hợp lệ");
      }
      const newMessage = {
        username,
        time: moment(new Date()).format("DD/MM/YYYY - hh:mm:ss "),
        content: message,
      };
      io.to(room).emit("send-message-server-to-client", newMessage);
      callback();
    });
    socket.on("share-location", ({ latitude, longitude }) => {
      const urlLocation = `https://www.google.com/maps?q=${latitude},${longitude}`;
      const newMessageLocation = {
        username,
        time: moment(new Date()).format("DD/MM/YYYY - hh:mm:ss "),
        urlLocation,
      };
      io.to(room).emit("share-location-server-client", newMessageLocation);
    });
  });

  //

  socket.on("disconnect", () => {
    console.log(` client ${socket.id} disconnect`);
    removeUser(socket.id);
  });
});
const port = process.env.port || 1710;
httpServer.listen(process.env.PORT || 1710);
