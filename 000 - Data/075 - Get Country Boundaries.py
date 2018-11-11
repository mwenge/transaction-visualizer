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

