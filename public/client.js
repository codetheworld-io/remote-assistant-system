'use strict';
// Connect to socket server
const socket = io();

// Create RTC Peer connection object
const peer = new RTCPeerConnection();

// Handle need help button click event
const helpButton = document.getElementById('need-help');
helpButton.addEventListener('click', async () => {
  try {
    // Get screen share as a stream
    const stream = await navigator.mediaDevices.getDisplayMedia({
      audio: false,
      video: true,
      preferCurrentTab: true, // this option may only available on chrome
    });

    // add track to peer connection
    peer.addTrack(stream.getVideoTracks()[0], stream);

    // create a offer and send the offer to admin
    const sdp = await peer.createOffer();
    await peer.setLocalDescription(sdp);
    socket.emit('offer', peer.localDescription);
  } catch (error) {
    // Catch any exception
    console.error(error);
    alert(error.message);
  }
});

// listen to `answer` event
socket.on('answer', async (adminSDP) => {
  peer.setRemoteDescription(adminSDP);
});

/** Exchange ice candidate */
peer.addEventListener('icecandidate', (event) => {
  if (event.candidate) {
    // send the candidate to admin
    socket.emit('icecandidate', event.candidate);
  }
});
socket.on('icecandidate', async (candidate) => {
  // get candidate from admin
  await peer.addIceCandidate(new RTCIceCandidate(candidate));
});

