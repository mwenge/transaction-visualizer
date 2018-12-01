// Based on https://codepen.io/mr_brunocastro/pen/GJRqJa?editors=0010#0

var values = [150,50,62,34,45,190,230,220,170,150,73,54,240,214,210,240,214,210,92];
var points = [];
var difference =[];


function drawGrid(chart) {
  var width = chart.width;
  var column = width / (width / 4);
  var line = chart.height / (chart.height / 4);
  var ctx = document.getElementById(chart.id + '-chart').getContext('2d');
  ctx.globalAlpha = 0.5;
  ctx.fillStyle ="#040404";
  ctx.strokeStyle ="#222";
  ctx.save();
  ctx.fillRect(0, 0, width, chart.height);
  ctx.save();
  for (var c=1; c < (width / column); c++) {
    ctx.beginPath();
    ctx.moveTo(c * column, 0);
    ctx.lineTo(c * column, chart.height);
    ctx.stroke();
  }
  for (var l=1; l < (chart.height / line); l++) {
    ctx.beginPath();
    ctx.moveTo(0, l * line);
    ctx.lineTo(width, l * line);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  ctx.fillStyle ="#fff";
  ctx.font = '10px Orbitron';
  ctx.fillText(chart.id, width - 50, 10);
}

function addInterval(chart, auth, sparkline, height, addLabel) {
  var lineContainer = document.createElement("span");
  lineContainer.className = 'index';
  sparkline.appendChild(lineContainer);
  var line = document.createElement("span");
  line.className = 'count ' + chart.id + '-count';
  line.style.height = height + "%";
  if (addLabel) {
    line.style.width = "1px";
  }
  lineContainer.appendChild(line);

  if (auth.auths > chart.max && addLabel) {
    var label = document.createElement("div");
    label.className = 'sparkline-label';
    label.textContent = auth.authTime.substr(-8) + " (" + auth.auths + ")";
    label.style.top = "-" + (line.clientHeight - lineContainer.clientHeight) + "px";
    label.style.transform = "rotate(-45deg)";
    console.log("placing label", auth.auths, chart.max, line.clientHeight, height, lineContainer.clientHeight);
    lineContainer.appendChild(label);
  }
}

function addLine(chart, auth, toHeight) {
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

  var minimumTicks = 4;
  var increment = Math.max(0, difference / minimumTicks);
  if (auth.auths > chart.max) {
    console.log(auth.auths, chart.max, difference, increment, fromHeight, toHeight);
  }
  for (var i = 0; i < minimumTicks; i++) {
    if (fromHeight > toHeight) {
      fromHeight -= increment;
    } else {
      fromHeight += increment;
    }
    var addLabel = i == (minimumTicks - 1);
    addInterval(chart, auth, sparkline, fromHeight, addLabel);
  }

}

function setUpChart(chart) {
  chart.width = screen.width / 2;
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

  drawGrid(chart);

  var sparklist = document.createElement("div");
  sparklist.className = 'sparklist';
  container.appendChild(sparklist);

  var sparkline = document.createElement("span");
  sparkline.className = 'sparkline';
  sparkline.id = chart.id + '-sparkline';
  container.appendChild(sparkline);
}
