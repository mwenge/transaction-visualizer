/*
# Copyright (c) 2018 Robert Hogan (robhogan at gmail.com) All rights reserved.
#
# Redistribution and use in source and binary forms, with or without
# modification, are permitted provided that the following conditions are
# met:
#
#    * Redistributions of source code must retain the above copyright
# notice, this list of conditions and the following disclaimer.
#    * Redistributions in binary form must reproduce the above
# copyright notice, this list of conditions and the following disclaimer
# in the documentation and/or other materials provided with the
# distribution.
#    * Neither the name of Google Inc. nor the names of its
# contributors may be used to endorse or promote products derived from
# this software without specific prior written permission.
#
# THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
# "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
# LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
# A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
# OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
# SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
# LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
# DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
# THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
# (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
# OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/
// Based on https://codepen.io/mr_brunocastro/pen/GJRqJa?editors=0010#0

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
