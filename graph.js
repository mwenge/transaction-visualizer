// Based on https://codepen.io/mr_brunocastro/pen/GJRqJa?editors=0010#0

var values = [150,50,62,34,45,190,230,220,170,150,73,54,240,214,210,240,214,210,92];
var points = [];
var difference =[];


function drawGrid(id, width, height, column, line) {
  var ctx = document.getElementById(id + '-chart').getContext('2d');
  ctx.fillStyle ="#050505";
  ctx.strokeStyle ="#333";
  ctx.save();
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

function addInterval(sparkline, height) {
  var lineContainer = document.createElement("span");
  lineContainer.className = 'index';
  sparkline.appendChild(lineContainer);
  var line = document.createElement("span");
  line.className = 'count';
  line.style.height = height + "%";
  lineContainer.appendChild(line);
}

function addLine(chart, toHeight) {
  var sparkline = document.getElementById(chart.id + "-sparkline");

  var lastLine = sparkline.lastChild;
  var fromHeight = toHeight;
  if (lastLine) {
    fromHeight = lastLine.firstChild.style.height;
    fromHeight = parseInt(fromHeight.replace(/[^\d\.\-]/g, ''), 10);
  }

  var difference = Math.abs(fromHeight - toHeight);
  while (sparkline.childNodes.length >= (chart.width - 2) * 2) {
      sparkline.removeChild(sparkline.firstChild);
  }

  var increment = Math.max(1, difference / 4);
  if (fromHeight >= toHeight) {
    for (var i = fromHeight; i >= toHeight; i -= increment) {
      addInterval(sparkline, i);
    }
    return;
  }
  for (var i = fromHeight; i <= toHeight; i += increment) {
    addInterval(sparkline, i);
  }
}

function setUpChart(chart) {
  var container = document.createElement("div");
  container.className = 'sparkline-container';
  container.id = chart.id + "-container";
  container.style.right = chart.right + 'px'; 
  container.style.bottom = chart.bottom + 'px'; 
  container.style.width = chart.width + 'px';
  container.style.height = chart.height + 'px';
  container.style.backgroundColor = 'black';
  container.style.zIndex = chart.zindex;
  document.body.appendChild(container);

  var canvasElement = document.createElement("canvas");
  canvasElement.id = chart.id + "-chart";
  canvasElement.width = chart.width;
  canvasElement.height = chart.height;
  container.appendChild(canvasElement);

  drawGrid(chart.id, chart.width, chart.height, chart.width / 50, chart.height / 14);

  var sparklist = document.createElement("div");
  sparklist.className = 'sparklist';
  container.appendChild(sparklist);

  var sparkline = document.createElement("span");
  sparkline.className = 'sparkline';
  sparkline.id = chart.id + '-sparkline';
  container.appendChild(sparkline);
}
