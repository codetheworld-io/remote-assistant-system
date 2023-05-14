'use strict';
// Connect to socket server
const socket = io();
// Create RTC Peer connection object
const peer = new RTCPeerConnection();

// Listen to track event
const video = document.getElementById('client-screen');
peer.addEventListener('track', (track) => {
  // display client screen shared
  video.srcObject = track.streams[0];
});

// listen to `offer` event from client (actually from server)
socket.on('offer', async (clientSDP) => {
  await peer.setRemoteDescription(clientSDP);

  // create an answer and send the answer to client
  const sdp = await peer.createAnswer();
  await peer.setLocalDescription(sdp);
  socket.emit('answer', peer.localDescription);
});

/** Exchange ice candidate */
peer.addEventListener('icecandidate', (event) => {
  if (event.candidate) {
    // send the candidate to client
    socket.emit('icecandidate', event.candidate);
  }
});
socket.on('icecandidate', async (candidate) => {
  // get candidate from client
  await peer.addIceCandidate(new RTCIceCandidate(candidate));
});
