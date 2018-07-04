var socket=io();
socket.on('connect',()=>{
  console.log('connected');
  socket.emit('camID');
});
var room='stic';
var localStream,pc=[],no=0;
// socket.emit('join',room);
var localVideo = document.querySelector('#localVideo');
//var remoteVideo = document.querySelector('#remoteVideo');
navigator.mediaDevices.getUserMedia({
    audio: false,
   video: true
})
.then(gotStream)
.catch(function(e) {
    alert('getUserMedia() error: ' + e.name);
});

function gotStream(stream) {
  console.log('Adding local stream.');
  localStream = stream;
  localVideo.srcObject = stream;
}

socket.on('channelReady',(client)=>{
  console.log('got it');
  no=client-1;
  console.log('no:',no);
  createPeerConnection();
  pc[no].addStream(localStream);
  doCall();
});
socket.on('message', function(message) {
  console.log('Client received message:', message);
 if (message.type === 'offer') {
   console.log('getting offer');
    pc[no].setRemoteDescription(new RTCSessionDescription(message));
    console.log(message);
    // doAnswer();
  } else if (message.type === 'answer') {
    console.log('got answer');
    pc[no].setRemoteDescription(new RTCSessionDescription(message));
  } else if (message.type === 'candidate') {
    var candidate = new RTCIceCandidate({
      sdpMLineIndex: message.label,
      candidate: message.candidate
    });
    pc[no].addIceCandidate(candidate);
  } //else if (message === 'bye' && isStarted) {
  //   handleRemoteHangup();
  // }
});

function doCall() {
  console.log('Sending offer to peer');
  pc[no].createOffer(setLocalAndSendMessage, handleCreateOfferError);
}

function createPeerConnection() {
  try {
    var p = new RTCPeerConnection(null);
    console.log('p:---',p);
    console.log('no create:-',no);
    pc.push(p);
    console.log('pc[0]:-',pc[0]);
    console.log('pc[1]:-',pc[1]);
    pc[no].onicecandidate = handleIceCandidate;
    // pc[no].onaddstream = handleRemoteStreamAdded;
    // pc[no].onremovestream = handleRemoteStreamRemoved;
    console.log('Created RTCPeerConnnection');
  } catch (e) {
    console.log('Failed to create PeerConnection, exception: ' + e.message);
    alert('Cannot create RTCPeerConnection object.');
    return;
  }
}

function handleIceCandidate(event) {
  console.log('icecandidate event: ', event);
  if (event.candidate) {
    sendMessage({
      type: 'candidate',
      label: event.candidate.sdpMLineIndex,
      id: event.candidate.sdpMid,
      candidate: event.candidate.candidate
    });
  } else {
    console.log('End of candidates.');
  }
}

function setLocalAndSendMessage(sessionDescription) {
  console.log('Inside local description');
  pc[no].setLocalDescription(sessionDescription);
  console.log('setLocalAndSendMessage sending message', sessionDescription);
  sendMessage(sessionDescription);
}

function handleCreateOfferError(event) {
  console.log('createOffer() error: ', event);
}

function doAnswer() {
  console.log('Sending answer to peer.');
  pc[no].createAnswer().then(
    setLocalAndSendMessage,
    onCreateSessionDescriptionError
  );
}
function onCreateSessionDescriptionError(error) {
  trace('Failed to create session description: ' + error.toString());
}

function sendMessage(message) {
  console.log('Client sending message: ', message);
  socket.emit('message', message);
}
