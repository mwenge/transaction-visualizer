# coding=utf-8
import os

countries = {}
continents = {}

input_file = open("010 - cities500.txt", 'r')
while True:
    line = input_file.readline()
    if not line:
        break
    line_array = line.split('\t')
    town = line_array[2]
    latitude = float(line_array[4])
    longitude = float(line_array[5])
    country = line_array[8]
    region = line_array[10]
    continent = line_array[17].split('/')[0]

    if country == "GB" and region not in ["ENG", "SCT", "WAL"]:
        continue;

    if country == "GB" and region == "NIR":
        country = "IE"

    continents[continent] = 1
    countries[country] = 1

output_file = open("065 - CoastLines for Countries.txt", 'w')
for country in countries:
    if country != 'IE':
        continue
    westernmost_at_latitude = {}
    easternmost_at_latitude = {}
    northernmost_at_longitude = {}
    southernmost_at_longitude = {}
    input_file = open("010 - cities500.txt", 'r')
    while True:
        line = input_file.readline()
        if not line:
            break
        line_array = line.split('\t')
        this_country = line_array[8]
        if this_country != country:
            continue
        latitude = float(line_array[4])
        longitude = float(line_array[5])

        if latitude in westernmost_at_latitude:
            westernmost_at_latitude[latitude] = max(longitude, westernmost_at_latitude[latitude])
        else:
            westernmost_at_latitude[latitude] = longitude

        if latitude in easternmost_at_latitude:
            easternmost_at_latitude[latitude] = min(longitude, easternmost_at_latitude[latitude])
        else:
            easternmost_at_latitude[latitude] = longitude
        
        if longitude in northernmost_at_longitude:
            northernmost_at_longitude[longitude] = max(latitude, northernmost_at_longitude[longitude])
        else:
            northernmost_at_longitude[longitude] = latitude

        if longitude in southernmost_at_longitude:
            southernmost_at_longitude[longitude] = min(latitude, southernmost_at_longitude[longitude])
        else:
            southernmost_at_longitude[longitude] = latitude

    output_file.write('var coastline[\'' + country + '\'] = [')

    for longitude, latitude in sorted(northernmost_at_longitude.iteritems()):
        output_file.write('{latitude: ' + str(latitude) + ', longitude: ' + str(longitude) + '}, \n')
    for latitude, longitude in sorted(easternmost_at_latitude.iteritems(), reverse=True):
        output_file.write('{latitude: ' + str(latitude) + ', longitude: ' + str(longitude) + '}, \n')
    for longitude, latitude in sorted(southernmost_at_longitude.iteritems(), reverse=True):
        output_file.write('{latitude: ' + str(latitude) + ', longitude: ' + str(longitude) + '}, \n')
    for latitude, longitude in sorted(westernmost_at_latitude.iteritems()):
        output_file.write('{latitude: ' + str(latitude) + ', longitude: ' + str(longitude) + '}, \n')
    output_file.write(']\n')

