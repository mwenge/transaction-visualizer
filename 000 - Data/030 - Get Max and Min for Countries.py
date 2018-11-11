# coding=utf-8
import os

countries = {}
continents = {}
northernmost = {}
westernmost = {}
southernmost = {}
easternmost = {}

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
    world = "All"

    for entity in [country, continent, world]:
        if entity in northernmost:
            northernmost[entity] = max(latitude, northernmost[entity])
        else:
            northernmost[entity] = latitude

        if entity in southernmost:
            southernmost[entity] = min(latitude, southernmost[entity])
        else:
            southernmost[entity] = latitude

        if entity in easternmost:
            easternmost[entity] = min(longitude, easternmost[entity])
        else:
            easternmost[entity] = longitude

        if entity in westernmost:
            westernmost[entity] = max(longitude, westernmost[entity])
        else:
            westernmost[entity] = longitude

output_file = open("040 - Max and Min for Countries.txt", 'w')
for entities in [countries, continents]:
    for country in entities:
        output_file.write('maxMinLatLong[\'' + country + '\'] = { max_latitude: ' + str(northernmost[country]) + ', max_longitude: '
                + str(westernmost[country]) + ', min_latitude: ' + str(southernmost[country]) + ', min_longitude: '
                + str(easternmost[country]) + '}\n')

country = "All"
output_file.write('maxMinLatLong[\'' + country + '\'] = { max_latitude: ' + str(northernmost[country]) + ', max_longitude: '
        + str(westernmost[country]) + ', min_latitude: ' + str(southernmost[country]) + ', min_longitude: '
        + str(easternmost[country]) + '}\n')
