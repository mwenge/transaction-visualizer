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


