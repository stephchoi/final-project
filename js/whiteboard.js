window.onload = function() {
  var canvas = document.getElementById('myCanvas');
  var context = canvas.getContext("2d");

  context.fillStyle = "#fff";
  context.fillRect(0,0, canvas.width, canvas.height);

  //Mouse Event Handlers
  if(canvas){
    var mouseDown = false;
    var canvasX;
    var canvasY;
 //Stores the x,y coordinates for each point on the line drawn
    var coord = [];

    context.linewidth = 3;

    $(canvas).mousedown(function(e){
      mouseDown = true;
      context.beginPath();
      canvasX = e.pageX - canvas.offsetLeft;
      canvasY = e.pageY - canvas.offsetTop;
      context.lineTo(canvasX, canvasY);
      coord.push([canvasX, canvasY]);
      context.strokeStyle = "#000";
      context.stroke();
    })
    .mousemove(function(e){
      if(mouseDown !== false) {
        canvasX = e.pageX - canvas.offsetLeft;
        canvasY = e.pageY - canvas.offsetTop;
        context.lineTo(canvasX, canvasY);
        coord.push([canvasX, canvasY]);
        context.strokeStyle = "#000";
        context.stroke();
      }
    })
    .mouseup(function(e){
      mouseDown = false;
      //Send the coordinates to the server/other user
      var message = {
        type: "drawing",
        data: coord
      };

      //Checks for every Peer and sends data
      for (var currentPeerId in peer.connections){
        if (!peer.connections.hasOwnProperty(currentPeerId)){
          return;
        }

        var connWithCurrentPeer = peer.connections[currentPeerId]
        // Goes through all data connections with the peer.
        for (var i=0; i<connWithCurrentPeer.length; i++){
          if (connWithCurrentPeer[i].type === "data") {
            connWithCurrentPeer[i].send(message);
          }
        }
      }

      coord = [];
      context.closePath();
    });
  }

// Touch event functions
  var draw = {
    started: false,

    start: function(event) {
      context.beginPath();
      context.moveTo(
        event.touches[0].pageX,
        event.touches[0].pageY
      );
      this.started = true;
    },

    move: function(event) {
      context.lineTo(
        event.touches[0].pageX,
        event.touches[0].pageY
      );

      context.strokeStyle = "#000";
      context.lineWidth = 3;
      context.stroke();
    },

    end: function(event){
      this.started = false;
    }
  };
//Touch event listeners
  canvas.addEventListener('touchstart', draw.start, false);
  canvas.addEventListener('touchend', draw.end, false);
  canvas.addEventListener('touchmove', draw.move, false);

//Disable Page Move
  document.body.addEventListener('touchmove', function(event){
    event.preventDefault();
  }, false);
};
