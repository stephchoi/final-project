// Initialise DataChannel.js
var datachannel = new DataChannel();

// Set the userid based on what has been defined by DataChannel
datachannel.userid = window.userid;

// Open a connection to Pusher
var pusher = new Pusher('0651fd26a21012b4c813', {
      cluster: 'us2',
      encrypted: true
    });

// Storage of Pusher connection socket ID
var socketId;

// Pusher.log = function(message) {
//   if (window.console && window.console.log) {
//     window.console.log(message);
//   }
// };

// Monitor Pusher connection state
pusher.connection.bind("state_change", function(states) {
  switch (states.current) {
    case "connected":
      socketId = pusher.connection.socket_id;
      break;
    case "disconnected":
    case "failed":
    case "unavailable":
      break;
  }
});

// Set custom Pusher signalling channel
datachannel.openSignalingChannel = function(config) {
  var channel = config.channel || this.channel || "default-channel";
  var xhrErrorCount = 0;

  var socket = {
    send: function(message) {
      console.log(message);
      $.ajax({
        type: "POST",
        url: "/message",
        data: {
          socketId: socketId,
          channel: channel,
          message: message
        },
        timeout: 1000,
        success: function(data) {
          xhrErrorCount = 0;
        },
        error: function(xhr, type) {
          // Increase XHR error count
          xhrErrorCount++;

          // Stop sending signaller messages if it's down
          if (xhrErrorCount > 5) {
            console.log("Disabling signaller due to connection failure");
            datachannel.transmitRoomOnce = true;
          }
        }
      });
    },
    channel: channel
  };

  // Subscribe to Pusher signalling channel
  var pusherChannel = pusher.subscribe(channel);

  // Call callback on successful connection to Pusher signalling channel
  pusherChannel.bind("pusher:subscription_succeeded", function() {
    if (config.callback) config.callback(socket);
  });

  // Proxy Pusher signaller messages to DataChannel
  pusherChannel.bind("message", function(message) {
    config.onmessage(message);
  });

  return socket;
};

var onCreateChannel = function() {
  var channelName = cleanChannelName(channelInput.value);

  if (!channelName) {
    console.log("No channel name given");
    return;
  }

  disableConnectInput();
  datachannel.open(channelName);
};

var onJoinChannel = function() {
  var channelName = cleanChannelName(channelInput.value);

  if (!channelName) {
    console.log("No channel name given");
    return;
  }

  disableConnectInput();
  // Search for existing data channels
  datachannel.connect(channelName);
};

var cleanChannelName = function(channel) {
  return channel.replace(/(\W)+/g, "-").toLowerCase();
};

var onSendMessage = function() {
  var message = {
    type: "chat",
    data: messageInput.value
  };

  if (!message) {
    console.log("No message given");
    return;
  }

  datachannel.send(message);
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


// Demo DOM elements
var channelInput = document.querySelector(".channel-name-input");
var createChannelBtn = document.querySelector(".chat-create");
var joinChannelBtn = document.querySelector(".chat-join");
var messageInput = document.querySelector(".chat-message-input");
var sendBtn = document.querySelector(".chat-send");
var messageList = document.querySelector(".chat-messages");

// Set up DOM listeners
createChannelBtn.addEventListener("click", onCreateChannel);
joinChannelBtn.addEventListener("click", onJoinChannel);
sendBtn.addEventListener("click", onSendMessage);
messageInput.addEventListener("keydown", onMessageKeyDown);

// Set up DataChannel handlers
datachannel.onopen = function (userId) {
  document.querySelector(".connect").classList.add("inactive");
  document.querySelector(".canvas-window").classList.remove("inactive");
  messageInput.focus();
};

datachannel.onmessage = function (message, userId) {
  console.log(message.data);
  if (message.type === "drawing") {
    drawCoord(message.data);
  } else if (message.type === "chat") {
    addMessage(message.data, userId);
  }
};
