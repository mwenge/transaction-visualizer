// Based on https://codepen.io/mr_brunocastro/pen/GJRqJa?editors=0010#0

var values = [150,50,62,34,45,190,230,220,170,150,73,54,240,214,210,240,214,210,92];
var points = [];
var difference =[];


function drawGrid(width, height, column, line) {
  var ctx = document.getElementById('chart').getContext('2d');
  ctx.fillRect(0,0,width,height);
  ctx.save();
  for (var c=1; c<(width/column); c++) {
    ctx.beginPath();
    ctx.moveTo(c*column,0);
    ctx.lineTo(c*column,height);
    ctx.stroke();
  }
  for (var l=1; l<(height/line); l++) {
    ctx.beginPath();
    ctx.moveTo(0,l*line);
    ctx.lineTo(width, l*line);
    ctx.stroke();
  }
}

function drawingLines (width,points,c) {
  var ctx = document.getElementById('chart').getContext('2d');
  ctx.beginPath();
  ctx.globalAlpha = c*0.04;
  ctx.moveTo(((c-1)*width+10),points[c-1]);
  ctx.lineTo(c*width+10,points[c]);
  ctx.lineTo(c*width+10,300);
  ctx.lineTo(((c-1)*width+10),300);
  ctx.lineTo(((c-1)*width+10),points[c-1]);
  ctx.fill();
  ctx.beginPath();
  ctx.globalAlpha = 1;
  ctx.moveTo(((c-1)*width+10),points[c-1]);
  ctx.lineTo(c*width+10,points[c]);
  ctx.stroke();
  ctx.beginPath();
  ctx.save();
  ctx.fillStyle=ctx.strokeStyle;
  ctx.fill();
  ctx.restore();
}


function draw() {
  var ctx = document.getElementById('chart').getContext('2d');

  ctx.fillStyle ="#1d1f20";
  ctx.strokeStyle ="#333";
  ctx.save();
  drawGrid(6500,800,70,80);


  for (var c=0; c<values.length; c++) { 
    if(isNaN(points[c])){
      points[c]=300;
    }
    ctx.lineWidth=1.4;
    larg=480/(values.length -1);
    difference[c]=(300-values[c])-points[c];
    points[c]+=difference[c]/(c+1);

    ctx.strokeStyle ="#0ff";
    ctx.fillStyle="#0ff";    
    drawingLines (larg,points,c);
  }
}

function setUpChart(chart, country) {
  var container = document.createElement("div");
  container.className = 'container';
  container.id = country + "-container";
  container.style.left = chart.left + 'px'; 
  container.style.top = chart.top + 'px'; 
  container.style.width = chart.width + 'px';
  container.style.height = chart.height + 'px';
  container.style.backgroundColor = 'black';
  container.style.zIndex = chart.zindex;
  document.body.appendChild(container);

  var canvasElement = document.createElement("canvas");
  canvasElement.id = "chart";
  canvasElement.width = chart.width;
  canvasElement.height = chart.height;
  container.appendChild(canvasElement);
}
