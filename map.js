var colors = {}
colors['Decline'] = { hex: '#ff0000'};
colors['Approve'] = { hex: '#7cfc00'};

var events = [];

var min_offset = 1;
var max_offset = 1500000;

function mapSourceToTarget(source, max_target, min_target, max_source, min_source) {
    var ratio = parseFloat(source - min_source) / parseFloat(max_source - min_source);
    var target = parseInt(ratio * (max_target - min_target) + min_target);
    return target;
}

var maxMinLatLong = {};
fillMaxMinLatLong();

function fillMaxMinLatLong() {
  for (const [country_code, coasts] of Object.entries(coastline)) {
    var continent_code = continent[country_code];
    for (var h = 0; h < coasts.length; h++) {
      var coast = coasts[h];
      if (!maxMinLatLong["Default"]) {
        maxMinLatLong["Default"] = { max_latitude: parseFloat(coast[1]),
                                        min_latitude: parseFloat(coast[1]),
                                        max_longitude : parseFloat(coast[0]),
                                        min_longitude : parseFloat(coast[0])};
      }
      if (!maxMinLatLong[country_code]) {
        maxMinLatLong[country_code] = { max_latitude: parseFloat(coast[1]),
                                        min_latitude: parseFloat(coast[1]),
                                        max_longitude : parseFloat(coast[0]),
                                        min_longitude : parseFloat(coast[0])};
      }
      if (!maxMinLatLong[continent_code]) {
        maxMinLatLong[continent_code] = { max_latitude: parseFloat(coast[1]),
                                          min_latitude: parseFloat(coast[1]),
                                          max_longitude : parseFloat(coast[0]),
                                          min_longitude : parseFloat(coast[0])};
      }
      for (var i = 2; i < coast.length; i+=2) {
        var codes = [country_code, continent_code, "Default"]; 
        if (isNaN(parseFloat(coast[i+1]))) {
          break;
        }
        for (var j = 0; j < codes.length; j++) {
          var code = codes[j];
          maxMinLatLong[code].max_latitude = Math.max(maxMinLatLong[code].max_latitude, parseFloat(coast[i+1]));
          maxMinLatLong[code].min_latitude = Math.min(maxMinLatLong[code].min_latitude, parseFloat(coast[i+1]));
          maxMinLatLong[code].max_longitude = Math.max(maxMinLatLong[code].max_longitude, parseFloat(coast[i]));
          maxMinLatLong[code].min_longitude = Math.min(maxMinLatLong[code].min_longitude, parseFloat(coast[i])); 
        }
      }
    }
  }
}

function mapCoordinatesToOffset(latitude, longitude, canvas, country) {
    var coordinates = maxMinLatLong[country];
    if (country == "DB") {
        console.log(coordinates);
    }
    var margin = 20;
    var maxX = canvas.width - margin;
    var minX = margin;
    var maxY = canvas.height - margin;
    var minY = margin;
    
    var x = mapSourceToTarget(longitude, maxX, minX, coordinates.max_longitude, coordinates.min_longitude);
    var y = mapSourceToTarget(latitude, maxY, minY, coordinates.max_latitude, coordinates.min_latitude);
    y = maxY - (y - margin);
    if (country == "DB") {
        console.log(x, y);
    }
    return {x:x, y:y}
}

function addTownLabel(town, x, y, canvas) {
    var div = document.getElementById(town);

    var div = document.createElement('div');
    div.className = 'label town';
    div.id = town;
    div.textContent = town;
    
    div.style.top = y + 'px';
    div.style.left = x + 'px';
    div.style.fontSize = '8px';
    div.style.color = '#ecf0f1';
    canvas.parentNode.appendChild(div); 
    div.addEventListener("animationend", removeElement);
}

function removeElement(evt) {
    var element = evt.target;
    if (element.parentNode) {
      element.parentNode.removeChild(element);
    }
}

function fadeElement(evt) {
    var element = evt.target;
    if (element.parentNode) {
        element.className = 'animation';
    }
    element.addEventListener("animationend", removeElement);
}

function drawEvent() {

    if (events.length < 1) {
        return;
    }

    var evt = events.shift();

    var animation = document.createElement("div");
    animation.className = 'animation animation' + evt.country;
    animation.id = evt.offset + evt.amount;
    animation.addEventListener("animationend", fadeElement);

    animation.style.fontSize = '9px';
    animation.style.color = evt.hex;
    animation.textContent = evt.amount;

    var x = evt.offset.x;
    var y = evt.offset.y;
    animation.style.top = y + 'px';
    animation.style.left = x + 'px';
    
    evt.canvas.parentNode.appendChild(animation);

    addTownLabel(evt.town, x, y - 10, evt.canvas);
    document.getElementById('clock-layer').textContent = evt.authTime;
}

function checkIfFallsIntoArea(latitude, longitude) {
  for (var i = 0; i < areas.length; i++) {
      var max_min = maxMinLatLong[areas[i]];
      if (latitude > max_min.max_latitude) {
          continue;
      }
      if (latitude < max_min.min_latitude) {
          continue;
      }
      if (longitude > max_min.max_longitude) {
          continue;
      }
      if (longitude < max_min.min_longitude) {
          continue;
      }
      return areas[i];
  }
  return ""
}

class ProcessMap {
    /**
     * @param {string} name
     */
    constructor(name) {
        this.name = name;
        this.counter = 0;
        this.prevChunk = ''
    }

    /**
     * Called when a chunk is written to the log.
     */
    write(chunk) {

        this.counter += 1;
        var chunkStart = 0
        for (var i = 0; i < chunk.length; i++) {
            if (chunk[i] != 13) {
                continue
            }
            var chunkToDecode = chunk.slice(chunkStart, i);
            var inputString = new TextDecoder("utf-8").decode(chunkToDecode);
            inputString = this.prevChunk + inputString;
            if (inputString == "") {
                continue;
            }

            var stringArray = inputString.split(',');
            var latitude = stringArray[7];
            var longitude = stringArray[8];
            var country = checkIfFallsIntoArea(latitude, longitude);
            if (country == "") {
                country = stringArray[9];
                if (!map_for_country.hasOwnProperty(country)) {
                    country = "Default";
                }
            }
            var canvasID = country + '-layer';
            var canvas = document.getElementById(canvasID);
            if (canvas == null) {
                chunkStart = i + 1;
                this.prevChunk = '';
                i++;
                continue;
            }
            var authTime = stringArray[1] + ' ' + stringArray[2];

            var hex = colors[stringArray[3]].hex;
            var amount = stringArray[4];
            var age = stringArray[5];
            var town = stringArray[6];
            var offset = mapCoordinatesToOffset(latitude, longitude, canvas, country);

            events.push( { authTime: authTime,
                          amount: amount,
                          town: town,
                          latitude: latitude,
                          longitude: longitude,
                          offset: offset,
                          canvas: canvas,
                          country: country,
                          hex: hex } );

            chunkStart = i + 1;
            this.prevChunk = '';
            i++;
        }
        var chunkToDecode = chunk.slice(chunkStart);
        var inputString = new TextDecoder("utf-8").decode(chunkToDecode);
        this.prevChunk = inputString;
    }
    /**
     * Called when the stream is closed.
     */
    close() {
    }
}
function processTransactionData(name, rs) {
    const [rs1, rs2] = rs.tee();
    rs2.pipeTo(new WritableStream(new ProcessMap(name))).catch(console.error);
    return rs1;
}

function setUpMap(map, country) {
  var container = document.createElement("div");
  container.className = 'container';
  container.id = country + "-container";
  container.style.left = map.left + 'px'; 
  container.style.top = map.top + 'px'; 
  container.style.width = map.width + 'px';
  container.style.height = map.height + 'px';
  container.style.backgroundColor = 'black';
  container.style.zIndex = map.zindex;
  document.body.appendChild(container);

  var canvasElement = document.createElement("canvas");
  canvasElement.id = country + "-layer";
  canvasElement.width = map.width;
  canvasElement.height = map.height;
  container.appendChild(canvasElement);

  var label = document.createElement("div");
  label.className = 'label description';
  label.style.zIndex = map.zindex;
  label.textContent = labels_for_map[country];
  container.appendChild(label);

  var animationStartX = (screen.width / 2) - map.left;
  var animationStartY = (screen.height / 2) - map.top;
  var style = document.createElement('style');
  var css =
    ".animation" + country + " {" +
      "animation-duration: 3s;\n" +
      "animation-name: slidein" + country + ";" +
    "}\n" +
    "@keyframes slidein" + country + " {" +
      "from {" +
        "position:absolute;" + 
        "top: " + animationStartY + "px;" +
        "left: " + animationStartX + "px;" +
        "font-size: 50px;" +
      "}" +
      "to {" +
      "}" +
    "}";

  style.innerHTML = css;
  document.head.appendChild(style);
}

var countries_for_map = [];
countries_for_map[0] = ['IE']
countries_for_map[1] = ['GB']
countries_for_map[2] = ['DB']
countries_for_map[3] = ['Default']

var labels_for_map = [];
labels_for_map['IE'] = ['Ireland']
labels_for_map['GB'] = ['Great Britain']
labels_for_map['DB'] = ['Dublin']
labels_for_map['Default'] = ['']

var map_for_country = [];
map_for_country['IE'] = 0;
map_for_country['GB'] = 1;
map_for_country['DB'] = 2;
map_for_country['Default'] = 3;

var maps = [ 
  {
    left: 0,
    top: screen.height - (screen.width / 3),
    zindex:9,
    width: screen.width / 3,
    height: screen.width / 3,
  },
  { 
    width: screen.width / 6,
    height: (screen.width / 6),
    zindex:8,
    top: screen.height - ((screen.width / 3) + (screen.width / 6)),
    left: 0
  },
  { 
    width: screen.width / 4,
    height: (screen.width / 4),
    zindex:8,
    top: screen.height - screen.width / 4,
    left: screen.width / 3
  },
  { 
    width: screen.width,
    height: screen.height,
    zindex: 0,
    left: 0,
    top: 0,
  },
];

function runGeoMap() {
  for (var i = 0; i < maps.length; i++) {
    setUpMap(maps[i], countries_for_map[i]);
  }

  for (const [code, coasts] of Object.entries(coastline)) {
    var map_code = code;
    if (!map_for_country.hasOwnProperty(map_code)) {
      map_code = "Default";
    }
    var canvasElement = document.getElementById(map_code + "-layer");
    var ctx = canvasElement.getContext('2d');
    for (var h = 0; h < coasts.length; h++) {
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 0.3;
      ctx.beginPath();

      var coast = coasts[h];
      var offset = mapCoordinatesToOffset(coast[1], coast[0], canvasElement, map_code); 
      var prevOffset = offset;
      ctx.moveTo(offset.x, offset.y);

      for (var i = 2; i < coast.length; i+=2) {
        offset = mapCoordinatesToOffset(coast[i+1], coast[i], canvasElement, map_code); 
        ctx.lineTo(offset.x, offset.y);
        prevOffset = offset;
      }
      ctx.stroke();
    }
  }

  window.setInterval(drawEvent, 50);

  // Fetch the original image
  fetch('901-Geo.txt')
  // Retrieve its body as ReadableStream
      .then(response => response.body)
  // Log each fetched Uint8Array chunk
      .then(rs => processTransactionData('Geo Map', rs))
}

