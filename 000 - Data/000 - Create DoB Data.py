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
    if record % 10 == 0:
        auth_date_time = auth_date_time + timedelta(seconds=1) 
    auth_date = auth_date_time.strftime("%Y-%m-%d")
    auth_time = auth_date_time.strftime("%H:%M:%S")
    response = responses[random.randint(0, 9)]
    currency = currencies[random.randint(0,1)]
    amount = currency + str(round(random.uniform(10.00, 1500.00), 2))
    ratio = numpy.float64(cust_id - 1) / numpy.float64(upper_range - 1)
    age = int(ratio * (age_max - age_min) + age_min)
    output_file.write(str(cust_id) + ',' + auth_date + ',' + auth_time + ',' + response + ',' + amount + ',' + str(age) + '\r\n') 
    return auth_date_time
     
output_file = open(".//..//900-DoB.txt", 'w')

responses = []
for i in range(0, 9):
    responses.append('Approve')
responses.append('Decline')

currencies = ['£', '€']

auth_date_time = datetime(2018,10,1,0,0,0)
records = 30000
for record in range(0, records):
    auth_date_time = write_record(auth_date_time, record)


