## Introduction and Background

In AIB we have over two million cardholders performing hundreds, sometimes thousands of transactions per minute, both in Ireland and throughout the world. For this project I propose to create a web-based, interactive visualisation of transaction activity on a world map. This visualisation will allow the user to intuit the geographic spread of our card transactions as they happen, to forward and rewind through time and space to focus in on places and times of interest. 

## Requirements Specification and Design

The high level specification for the project is as follows:
    - A set of SQL queries and Python scripts that extract and transform transaction data from the AIB data warehouse. The output will be a set of csv files that a web server can serve to the visualization and which the visualization will then process for display.
    - A set of html, css, and javascript files that constitute the visualization application. This will be hosted on github. I don’t plan to use any pre-packaged javascript frameworks such as d3. The code will be developed completely from scratch.
    - The world map will be drawn using native web technologies using open-source geodata. The javascript application will read in the data files from the web server and process them record by record. For each record it will display the transaction on the world map with an attractive animation.
    - Configuration, options, user commands will all be implemented using javascript.
    - The project will be hosted on github.


## Testing

## Demonstration of Progress

The current state of the visualisation is [available here to view](https://mwenge.github.io/transaction-visualizer/).

Here is an animated screenshot of it in action:

![Transaction visualisation](https://github.com/mwenge/transaction-visualizer/blob/master/report-images/demo.gif "Transaction visualization in action")

## Future Work

    - Create controls on the website that allow the user to filter the display by transaction type.
    - Create a help menu that allows the user to see the available commands for the visualization, accessible using the ‘?’ key.
    - Allow the user to select different days and times of available transaction data. This will allow them to compare activity across different time periods.
    - Allow the user to fast-forward through the real-time activity so that they can watch transcation activity in an accelerated rather than real-time view.
    
