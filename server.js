// 1. Install express and socket.io to build the signaling server
// 2. Init a simple express server
const express = require('express');
const { Server: SocketServer } = require('socket.io');

const app = express();

// 3. Serve every file in `public` as static files
app.use('/', express.static('public'));

const httpServer = app.listen(3000, () => {
  console.log(`Server started on 3000`);
});

// 4. Init socket.io server
const io = new SocketServer(httpServer);
io.on('connection', (socket) => {
  console.log('new connection from ', socket.id);

  // handle `offer` event: forward to other socket client
  socket.on('offer', (offer) => {
    console.log('new offer from ', socket.id);
    socket.broadcast.emit('offer', offer); // replay message without any change
  });

  // handler `answer` event
  socket.on('answer', (answer) => {
    console.log('new answer from ', socket.id);
    socket.broadcast.emit('answer', answer);
  });

  // forward ice candidate
  socket.on('icecandidate', (candidate) => {
    console.log('new ice candidate from ', socket.id);
    socket.broadcast.emit('icecandidate', candidate);
  });
});
