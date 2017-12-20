// var peer = new Peer ({key: 'ex49zhpkv620529'})
var peer = new Peer({host: 'peerjs-server.herokuapp.com', port: 443, secure: true, key: 'peerjs'})

var connectedPeers = {};

navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;


peer.on('open', function() {
  console.log('My PeerJS ID is ' + peer.id)
  document.getElementById('my-id').innerHTML = peer.id
});

// Receive data
peer.on('connection', function(conn) {
  conn.on('data', function(message){
    console.log(message.data);
    if (message.type === "drawing") {
      drawCoord(message.data);
    } else if (message.type === "chat") {
      addMessage(message.data, conn.peer);
    }
  });
});

peer.on('error', function(err){
  console.log(err);
});

peer.on('disconnected', function(){
    peer.reconnect();
});

//Answer call
peer.on('call', function(call) {
    navigator.getUserMedia({video:false, audio: true}, function(stream) {
      call.answer(stream); // Answer the call with an Audio stream.
      call.on('stream', function(remoteStream) {
        playStream(remoteStream);
      });
    }, function(err) {
      console.log('Failed to get local stream' ,err);
    });
});


// Send Call
var startCall = function(){
  var requestedPeer = document.getElementById('other-person').value;
  if(!connectedPeers[requestedPeer]) {
    // Create the connection
    var c = peer.connect(requestedPeer);
    c.on('open', function(){
      console.log('You are now connected to ' + requestedPeer + '.')
    });
    c.on('close', function(){
      alert(c.peer + ' has left the chat.');
      delete connectectedPeers[c.peer]
    });
    c.on('error', function(err){
      alert(err);
    });
    c.on('data', function(message){
      console.log(message.data);
      if (message.type === "drawing") {
        drawCoord(message.data);
      } else if (message.type === "chat") {
        addMessage(message.data, c.peer);
      }
    });
    connectedPeers[requestedPeer] = 1;

    //Connect the audio stream
    navigator.getUserMedia({video:false, audio: true}, function(stream) {
      var options = {
          'constraints': {
              'mandatory': {
                  'OfferToReceiveAudio': true,
                  'OfferToReceiveVideo': true
              }
          }
      };

      var call = peer.call(requestedPeer, stream, options);
      call.on('stream', function(remoteStream) {
        playStream(remoteStream);
      });
    }, function(err) {
      console.log('Failed to get local stream' ,err);
    });
  }
};

function playStream(stream) {
  var audio = $('<audio autoplay />').appendTo('body');
  audio[0].src = (URL || webkitURL || mozURL).createObjectURL(stream);
}


var onSendMessage = function() {
  var message = {
    type: "chat",
    data: messageInput.value
  };

  if (!message) {
    console.log("No message given");
    return;
  }

  console.log(peer.connections);
  for (var currentPeerId in peer.connections){
    if (!peer.connections.hasOwnProperty(currentPeerId)){
      return;
    }

    var connWithCurrentPeer = peer.connections[currentPeerId]
    for (var i=0; i<connWithCurrentPeer.length; i++){
      if (connWithCurrentPeer[i].type === "data") {

      connWithCurrentPeer[i].send(message);
      }
    }
  };

  addMessage(message.data, window.userid, true);

  messageInput.value = "";
};

var onMessageKeyDown = function(event) {
  if (event.keyCode == 13){
    onSendMessage();
  }
};

var addMessage = function(message, userId, self) {
  var messages = messageList.getElementsByClassName("list-group-item");

  // Check for any messages that need to be removed
  var messageCount = messages.length;
  for (var i = 0; i < messageCount; i++) {
    var msg = messages[i];

    if (msg.dataset.remove === "true") {
      messageList.removeChild(msg);
    }
  };

var newMessage = document.createElement("li");
  newMessage.classList.add("list-group-item");

  if (self) {
    newMessage.classList.add("self");
    newMessage.innerHTML = "<span class='badge'>You</span><p>" + message + "</p>";
  } else {
    newMessage.innerHTML = "<span class='badge'>" + userId + "</span><p>" + message + "</p>"
  }

  messageList.appendChild(newMessage);
};

var disableConnectInput = function() {
  channelInput.disabled = true;
  createChannelBtn.disabled = true;
  joinChannelBtn.disabled = true;
};

//Draws the line from an array of coordinates
var drawCoord = function(array) {
  var canvas = document.getElementById('myCanvas');
  var context = canvas.getContext("2d");

  for (i=0; i<array.length; i++){
    if(i===0){
      context.beginPath();
      context.moveTo(array[i][0], array[i][1]);
    } else if(i<array.length-1 && i >0){
      context.lineTo(array[i][0], array[i][1]);
      context.stroke();
    } else {
      context.lineTo(array[i][0], array[i][1]);
      context.stroke();
      context.closePath();
    }
  }
};

window.onunload = window.onbeforeunload = function(e) {
  if (!!peer && !peer.destroyed) {
    peer.destroy();
  }
};

// DOM elements
var createChannelBtn = document.querySelector(".chat-create");
var messageInput = document.querySelector(".chat-message-input");
var sendBtn = document.querySelector(".chat-send");
var messageList = document.querySelector(".chat-messages");
var endCallBtn = document.querySelector(".chat-end");
var otherPerson = document.querySelector(".channel-input");

// Set up DOM listeners
createChannelBtn.addEventListener("click", startCall);
// joinChannelBtn.addEventListener("click", joinCall);
sendBtn.addEventListener("click", onSendMessage);
messageInput.addEventListener("keydown", onMessageKeyDown);
endCallBtn.addEventListener("click", function(){
  //Close the active connection
  for (var currentPeerId in peer.connections){
    if (!peer.connections.hasOwnProperty(currentPeerId)){
      return;
    }

    var connWithCurrentPeer = peer.connections[currentPeerId]
    for (var i=0; i<connWithCurrentPeer.length; i++){
      connWithCurrentPeer[i].close;
    }
  }
});
