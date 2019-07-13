## Introduction and Background

In AIB we have over two million cardholders performing hundreds, sometimes thousands of transactions per minute, both in Ireland and throughout the world. For this project I propose to create a web-based, interactive visualisation of transaction activity on a world map. This visualisation will allow the user to intuit the geographic spread of our card transactions as they happen, to forward and rewind through time and space to focus in on places and times of interest. 

## Requirements Specification and Design

The high level specification for the project is as follows:
- A set of SQL queries and Python scripts that extract and transform transaction data from the AIB data warehouse. The output will be a set of csv files that a web server can serve to the visualization and which the visualization will then process for display.
- A set of html, css, and javascript files that constitute the visualization application. This will be hosted on github. I don’t plan to use any pre-packaged javascript frameworks such as d3. The code will be developed completely from scratch.
- The world map will be drawn using native web technologies using open-source geodata. The javascript application will read in the data files from the web server and process them record by record. For each record it will display the transaction on the world map with an attractive animation.
- Configuration, options, user commands will all be implemented using javascript.
- The project will be hosted on github.

### Getting the Country Data

I sourced boundary co-ordinates for all countries from [this site](https://fusiontables.google.com/DataSource?docid=1uL8KJV0bMb7A8-SkrIe0ko2DMtSypHX52DatEE4#rows:id=1).

I then wrote a python [script](https://koordinates.com/layer/1103-world-country-boundaries/?ex=1) to create a javascript array of co-ordinates for each country:

```python
# coding=utf-8
import csv
import os

import xml.etree.ElementTree as ET

countries = {}
continents = {}

output_file = open("080 - CoastLines for Countries.txt", 'w')
with open('070 - World Country Boundaries.csv') as csv_file:
    csv_reader = csv.reader(csv_file, delimiter=',')
    line_count = 0
    for row in csv_reader:
        if row[0] == "geometry":
            continue
        country = row[3]
        geometry = row[0]
        root = ET.fromstring(geometry)
        output_file.write('coastline[\'' + country + '\'] = [')
        arrays = ""
        for coordinate_list in root.iter('coordinates'):
            coordinates = coordinate_list.text.replace(",0 ", ",")
            arrays += '[' + coordinates + '], '
        output_file.write(arrays[:-5] + ']]\n')
```
This output is stored in [geodata.js](https://github.com/mwenge/transaction-visualizer/blob/master/geodata.js).



### Consuming Data in the Visualization

The app consumes data in a simple CSV format, one record at a time. Each record is of the format:

```
729358,2018-10-01,00:00:01,Approve,€1192.86,55,Newtownabbey,54.65983,-5.90858,IE
1496646,2018-10-01,00:00:01,Approve,€943.26,94,Langenzenn,49.49463,10.7923,DE
959417,2018-10-01,00:00:01,Approve,€671.7,67,Thorngumbald,53.721,-0.17175,GB
959417,2018-10-01,00:00:01,Approve,€671.7,67,Thorngumbald,53.721,-0.17175,GB
```

The fields here are:
- Account ID
- Date
- Time
- Transaction Outcome
- Transaction Amount
- Transaction Type
- City transaction tooke place in
- Latitude of Transaction
- Longitude of Transactions
- Country of transaction

The main loop of the app simply paints the world map using the country boundary co-ordinates and starts reading in the CSV file, animating each transaction as it goes:

```javascript
function runGeoMap() {
  for (var i = 0; i < maps.length; i++) {
    setUpMap(maps[i], countries_for_map[i]);
  }

  paintMaps();

  for (var i = 0; i < charts.length; i++) {
    setUpChart(charts[i], screen.width / 2);
  }

  window.setInterval(drawEvent, 50);

  fetch('900-Geo.txt')
  // Retrieve its body as ReadableStream
      .then(response => response.body)
  // Log each fetched Uint8Array chunk
      .then(rs => processTransactionData('Geo Map', rs))
}
```
### Focusing in on countries
Since in the real word visualization we will expect to have more data for certain countries, i.e. Ireland and the UK, I create separate 'focused' maps for Ireland and the UK. I do this, for now, by defining the countries of interest in an array of maps to paint. Since I will ultimately want to do this type of focusing for every country when the user selects a country of interest it will have to be more configurable later. As well as Ireland and the UK, I also configure a separate map for Dublin, as again most transaction traffic is ancticipated to take place here.

```javascript
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

function paintMaps() {
  for (const [code, coasts] of Object.entries(coastline)) {
    var mapCode = code;
    if (!map_for_country.hasOwnProperty(mapCode)) {
      mapCode = "Default";
    }
    var canvasElement = document.getElementById(mapCode + "-layer");
    var ctx = canvasElement.getContext('2d');
    for (var h = 0; h < coasts.length; h++) {
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 0.3;
      ctx.beginPath();

      var coast = coasts[h];
      var offset = mapCoordinatesToOffset(coast[1], coast[0], canvasElement, mapCode); 
      var prevOffset = offset;
      ctx.moveTo(offset.x, offset.y);

      for (var i = 2; i < coast.length; i+=2) {
        offset = mapCoordinatesToOffset(coast[i+1], coast[i], canvasElement, mapCode); 
        ctx.lineTo(offset.x, offset.y);
        prevOffset = offset;
      }
      ctx.stroke();
    }
  }
}

function runGeoMap() {
  for (var i = 0; i < maps.length; i++) {
    setUpMap(maps[i], countries_for_map[i]);
  }

```
![Transaction visualisation](https://github.com/mwenge/transaction-visualizer/blob/master/report-images/countryfocus.gif "Demonstration of country/city focus")

### Graphs

![Transaction visualisation](https://github.com/mwenge/transaction-visualizer/blob/master/report-images/graph.gif "Transaction graphs")

## Testing
In order to test the visualisation I generate a simulated dataset. The data is a simple CSV list of transactions that the visualization will read in and display. The records in the dataset look like this:

```
729358,2018-10-01,00:00:01,Approve,€1192.86,55,Newtownabbey,54.65983,-5.90858,IE
1496646,2018-10-01,00:00:01,Approve,€943.26,94,Langenzenn,49.49463,10.7923,DE
959417,2018-10-01,00:00:01,Approve,€671.7,67,Thorngumbald,53.721,-0.17175,GB
959417,2018-10-01,00:00:01,Approve,€671.7,67,Thorngumbald,53.721,-0.17175,GB
959417,2018-10-01,00:00:01,Approve,€671.7,67,Thorngumbald,53.721,-0.17175,GB
959417,2018-10-01,00:00:01,Approve,€671.7,67,Thorngumbald,53.721,-0.17175,GB
959417,2018-10-01,00:00:01,Approve,€671.7,67,Thorngumbald,53.721,-0.17175,GB
959417,2018-10-01,00:00:01,Approve,€671.7,67,Thorngumbald,53.721,-0.17175,GB
959417,2018-10-01,00:00:01,Approve,€671.7,67,Thorngumbald,53.721,-0.17175,GB
959417,2018-10-01,00:00:01,Approve,€671.7,67,Thorngumbald,53.721,-0.17175,GB
959417,2018-10-01,00:00:01,Approve,€671.7,67,Thorngumbald,53.721,-0.17175,GB
```

The test data is generated by [000-Data/050 - Create Geo Transaction Data.py](https://github.com/mwenge/transaction-visualizer/blob/master/000%20-%20Data/050%20-%20Create%20Geo%20Transaction%20Data.py):

```python
# coding=utf-8
import numpy
import os
import random
from datetime import datetime
from datetime import timedelta

def write_record(auth_date_time, record):
    age_min = 18
    age_max = 95
    upper_range = 1500000
    cust_id = random.randint(1, upper_range)
    if record % random.randint(10, 15) == 0:
        auth_date_time = auth_date_time + timedelta(seconds=1) 
    auth_date = auth_date_time.strftime("%Y-%m-%d")
    auth_time = auth_date_time.strftime("%H:%M:%S")
    response = responses[random.randint(0, 9)]
    currency = currencies[random.randint(0,1)]
    amount = currency + str(round(random.uniform(10.00, 1500.00), 2))
    ratio = numpy.float64(cust_id - 1) / numpy.float64(upper_range - 1)
    age = int(ratio * (age_max - age_min) + age_min)
    if record % 2 == 0:
        geodata = irishtowns[random.randint(0,len(irishtowns) - 1)]
    elif record % 3 == 0:
        geodata = uktowns[random.randint(0,len(uktowns) - 1)]
    else:
        geodata = towns[random.randint(0,len(towns) - 1)]
    town = geodata[0]
    latitude = geodata[1]
    longitude = geodata[2]
    country = geodata[3]
    output_file.write(str(cust_id) + ',' + auth_date + ',' + auth_time + ',' + response + ',' + amount + ',' + str(age) +
                      ',' + town + ',' + latitude + ',' + longitude + ',' + country + '\r\n') 
    return auth_date_time
     
towns = []
irishtowns = []
uktowns = []
input_file = open("010 - cities500.txt", 'r')
while True:
    line = input_file.readline()
    if not line:
        break
    line_array = line.split('\t')
    country = line_array[8]
    timezone = line_array[17][0:6]
    town = line_array[2]
    latitude = line_array[4]
    longitude = line_array[5]
    region = line_array[10].strip()
    population = line_array[14]

    if country == "GB" and region not in ["ENG", "SCT", "WLS", "NIR"]:
        continue;

    if country == "GB" and region == "NIR":
        country = "IE"

    if country == "IE":
        irishtowns.append((town, latitude, longitude, country))
    elif country == "GB":
        uktowns.append((town, latitude, longitude, country))
    else:
        towns.append((town, latitude, longitude, country))

output_file = open(".//..//900-Geo.txt", 'w')

responses = []
for i in range(0, 9):
    responses.append('Approve')
responses.append('Decline')

currencies = ['£', '€']

auth_date_time = datetime(2018,10,1,0,0,0)
records = 30000
for record in range(0, records):
    auth_date_time = write_record(auth_date_time, record)
```

## Demonstration of Progress

The current state of the visualisation is [available here to view](https://mwenge.github.io/transaction-visualizer/).

Here is an animated screenshot of it in action:

![Transaction visualisation](https://github.com/mwenge/transaction-visualizer/blob/master/report-images/demo.gif "Transaction visualization in action")

## Future Work

- Create controls on the website that allow the user to filter the display by transaction type.
- Create a help menu that allows the user to see the available commands for the visualization, accessible using the ‘?’ key.
- Allow the user to select different days and times of available transaction data. This will allow them to compare activity across different time periods.
- Allow the user to fast-forward through the real-time activity so that they can watch transcation activity in an accelerated rather than real-time view.
    
