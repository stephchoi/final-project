window.onload = function() {
  var canvas = document.getElementById('myCanvas');
  var context = canvas.getContext("2d");

  context.fillStyle = "#fff";
  context.fillRect(0,0, canvas.width, canvas.height);

  //Draws the line from an array of coordinates
  var drawCoord = function(array) {
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
      //WE'll want to send the coordinates to the server/other user
      console.log(coord);
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
