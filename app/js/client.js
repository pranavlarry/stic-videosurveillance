var pc;
var socket=io();
socket.on('connect',()=>{
  console.log('connected');
  socket.emit('clientID');
});
var room='stic';
// socket.emit('join',room);
  var remoteVideo = document.querySelector('#remoteVideo');
  // var testvideo=document.querySelector('#test');
  socket.emit('channelReady');
  socket.on('channelReady',(client)=>{
    console.log('got it');
    createPeerConnection();
  });
  socket.on('message', function(message) {
    console.log('Client received message:', message);
   if (message.type === 'offer') {
     console.log('getting offer');
      pc.setRemoteDescription(new RTCSessionDescription(message));
      console.log(message);
      doAnswer();
    } else if (message.type === 'answer') {
      console.log('got answer');
      pc.setRemoteDescription(new RTCSessionDescription(message));
    } else if (message.type === 'candidate') {
      var candidate = new RTCIceCandidate({
        sdpMLineIndex: message.label,
        candidate: message.candidate
      });
      pc.addIceCandidate(candidate);
    } //else if (message === 'bye' && isStarted) {
    //   handleRemoteHangup();
    // }
  });

  function createPeerConnection() {
    try {
      pc = new RTCPeerConnection(null);
      pc.onicecandidate = handleIceCandidate;
      pc.onaddstream = handleRemoteStreamAdded;
      pc.onremovestream = handleRemoteStreamRemoved;
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

  function handleRemoteStreamAdded(event) {
    console.log('Remote stream added.');
    var remoteStream = event.stream;
    remoteVideo.srcObject = remoteStream;
    testvideo.srcObject=remoteStream;
  }

  function handleRemoteStreamRemoved(event) {
    console.log('Remote stream removed. Event: ', event);
  }

  function setLocalAndSendMessage(sessionDescription) {
    console.log('Inside local description');
    pc.setLocalDescription(sessionDescription);
    console.log('setLocalAndSendMessage sending message', sessionDescription);
    sendMessage(sessionDescription);
  }

  function handleCreateOfferError(event) {
    console.log('createOffer() error: ', event);
  }

  function doAnswer() {
    console.log('Sending answer to peer.');
    pc.createAnswer().then(
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
