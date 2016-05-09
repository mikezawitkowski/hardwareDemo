'use strict';
/* jshint globalstrict: true */
/* global dc,d3,crossfilter,colorbrewer */


var hoursChart = dc.barChart('#hours-chart');
var syncChart = dc.barChart('#sync-chart');
var dayOfWeekChart = dc.rowChart('#day-of-week-chart');
var dailyActivesChart = dc.barChart('#dau-chart');
var recordCount = dc.dataCount('#record-data-count');
var unitCount = dc.dataCount('#unit-data-count');
var usaMap = dc.geoChoroplethChart('#us-chart');
var myTable = dc.dataTable('.dc-data-table');


d3.csv('static/data/dayparted_sns.csv', function (data) {

  // Various formatters
  var formatNumber = d3.format(",d");
  var dateFormat = d3.time.format('%Y-%m-%d');
  var numberFormat = d3.format('.1f');

  // Data from a csv file requires formatting
  data.forEach(function (d, i) {
    d.index = i;
    d.date = dateFormat.parse(d.date);
    d.month = d3.time.month(d.date); // pre-calculate month for performance
    d.hours = numberFormat(+d.hours);
    d.hours_in_sync = numberFormat(+d.hours_in_sync);
    });


  function getDateDelta(origin, delta) {
    var x = new Date();
    x.setDate(origin.getDate() + delta);
    return x;
  }

  var minDate = d3.min(data, function(d) { return d.date; });
  var maxDate = d3.max(data, function(d) { return d.date; });
  var sevenDaysAgo = getDateDelta(maxDate, -7);

  var totalEvents =  data.length;

  /* * * * * * * * * * * *
   * Crossfilter Variables
   */

  // We use crossfilter to make dimensions and groups
  var cfd = crossfilter(data);
  var all = cfd.groupAll();

  // Dimension by full date
  var dateDimension = cfd.dimension(function (d) { return d.date; });
  var dateGroup = dateDimension.group();
  var hoursDimension = cfd.dimension(function (d) { return d.hours; });
  var hoursGroup = hoursDimension.group();
  var syncDimension = cfd.dimension(function (d) { return d.hours_in_sync; });
  var syncGroup = syncDimension.group();
  var serialDimension = cfd.dimension(function (d) {return d.serial_number;});
  var serialGroup = serialDimension.group();

  // This is the value that gives me the total serial numbers
  var serialGroupCount = serialDimension.group().reduceCount();

  var dailyHoursGroup = dateDimension.group().reduceSum(function (d) {
    return d.hours;
  });

  var dailyHoursSyncGroup = dateDimension.group().reduceSum(function (d) {
    return d.hours_in_sync;
  });

  // Counts per weekday
  var dayOfWeek = cfd.dimension(function(d) {
    var day = d.date.getDay();
    var name = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    return day + '.' + name[day];
  });

  var dayOfWeekGroup = dayOfWeek.group();

  var states = cfd.dimension(function (d) {
      return d.state;
  });
  var stateHoursSum = states.group().reduceSum(function (d) {
      return d.hours;
  });

  var newCountGroup = dateDimension.group().reduceSum(function (d) {
    if (d.dau_status == 'new') {
      return 1;
    } else {
      return 0;
    }
  });

  var returnCountGroup = dateDimension.group().reduceSum(function (d) {
    if (d.dau_status == 'new') {
      return 0;
    } else {
      return 1;
    }
  });



  /* * * * * * * * * * * * *
   *
   * DEFINE CHARTS
   *
   */

  hoursChart /* dc.barChart('#volume-month-chart', 'chartGroup') */
    .height(190)
    .margins({top: 10, right: 50, bottom: 30, left: 30})
    .dimension(hoursDimension)
    .group(hoursGroup)
    .brushOn(true)
    .elasticY(true)
    .round(d3.time.hours.round)
    .alwaysUseRounding(true)
    .renderHorizontalGridLines(true)
    .renderTitle(true)
    // Customize the filter displayed in the control span
    .filterPrinter(function (filters) {
        var filter = filters[0], s = '';
        s += numberFormat(filter[0]) + ' -> ' + numberFormat(filter[1]) + ' hrs';
        return s;
    })
    .x(d3.scale.linear().domain([0, 24]));


  syncChart /* dc.barChart('#volume-month-chart', 'chartGroup') */
    .height(190)
    .margins({top: 10, right: 50, bottom: 30, left: 30})
    .dimension(syncDimension)
    .group(syncGroup)
    .elasticY(true)
    .alwaysUseRounding(true)
    .brushOn(true)
    .round(d3.time.hours.round)
    .renderHorizontalGridLines(true)
    .renderTitle(true)
    .filterPrinter(function (filters) {
        var filter = filters[0], s = '';
        s += numberFormat(filter[0]) + ' -> ' + numberFormat(filter[1]) + ' hrs';
        return s;
    })
    .x(d3.scale.linear().domain([0, 24]));


    dayOfWeekChart /* dc.rowChart('#day-of-week-chart', 'chartGroup') */
      .width(250)
      .height(180)
      .margins({top: 20, left: 20, right: 10, bottom: 20})
      .dimension(dayOfWeek)
      .group(dayOfWeekGroup)
      .ordinalColors(['#3182bd', '#6baed6', '#9ecae1', '#c6dbef', '#dadaeb'])
      .renderLabel(true)
      .label(function (d) {
          return d.key.split('.')[1];
      })
      .renderTitle(true)
      .title(function (d) {
          return d.key.split('.')[1];
      })
      .elasticX(true);

    // handle axis functions separately
    dayOfWeekChart.xAxis().ticks(4);


  dailyActivesChart /* dc.barChart('#volume-month-chart', 'chartGroup') */
    .width(950)
    .margins({top: 10, right: 50, bottom: 30, left: 25})
    .dimension(dateDimension)
    .transitionDuration(500)
    .group(returnCountGroup, 'Existing Units')
    .valueAccessor(function (d) {
            return d.value;
        })
    .stack(newCountGroup, 'New Activations', function (d) {
                return d.value;
    })
    .elasticY(true)
    .elasticX(false)
    .round(d3.time.day)
    .alwaysUseRounding(true)
    .renderHorizontalGridLines(true)
    .brushOn(true)
    .gap(1)
    .legend(dc.legend().x(45).y(15).itemHeight(13).gap(7))
    .renderTitle(true)
    .title(function (d) {
            var value = d.value.avg ? d.value.avg : d.value;
            if (isNaN(value)) {
                value = 0;
            }
            return dateFormat(d.key) + '\n' + numberFormat(value);
        })
    .x(d3.time.scale().domain([minDate, maxDate]));

    dailyActivesChart.xUnits(function(){return dateGroup.all().length;});


  // Added this to experiment with suppressing bug with usaMap
  // Main map is in next block of code
  usaMap.dimension(states)
        .group(stateHoursSum);


  // Choropleth Map
  d3.json("static/lib/us-states.json", function (error, statesJson) {
    // if (error) return console.warn(error);
    usaMap
      .width(900)
      .height(500)
      .dimension(states)
      .group(stateHoursSum)
      .colors(d3.scale.quantize().range(["#E2F2FF", "#C4E4FF", "#9ED2FF", "#81C5FF", "#6BBAFF", "#51AEFF", "#36A2FF", "#1E96FF", "#0089FF", "#0061B5"]))
      .colorDomain([0, 200])
      .colorCalculator(function (d) { return d ? usaMap.colors()(d) : '#ccc'; })
      .overlayGeoJson(statesJson.features, "state", function (d) {
         return d.properties.name;
       })
       .title(function (d) {
         return "State: " + d.key + "\nTotal Hours: " + numberFormat(d.value ? d.value : 0) + " Hours";
       });

      // dc.renderAll() must be called from within a function like d3.json
      dc.renderAll();
  });

  // Create a data count widget and use the given css selector as anchor. You can also specify an optional chart group for this chart to be scoped within. When a chart belongs to a specific group then any interaction with such chart will only trigger redraw on other charts within the same chart group.
  // var nasdaqCount = dc.dataCount('.dc-data-count');
  //   <div class='dc-data-count'>
  //  <span class='filter-count'></span>
  //  selected out of <span class='total-count'></span> records.
  // </div>
  recordCount /* dc.dataCount('.dc-data-count', 'chartGroup'); */
    .dimension(cfd)
    .group(all)
    // OPTIONAL .html sets different html when some records or all records are selected. .html replaces everything in the anchor with the html given using the following function. %filter-count and %total-count are replaced with the values obtained.
    .html({
      some: 'Displaying <strong>%filter-count</strong> out of <strong>%total-count</strong> records ',
      all: 'All <strong>%total-count</strong> records selected '
    });

  unitCount /* dc.dataCount('.dc-data-count', 'chartGroup'); */
    .dimension(serialGroup)
    .group({value: function() {
        return serialGroup.all().filter(function(kv) {
          return kv.value>0;
        }).length;
    }})
    .html({
      some: '&nbsp; (<strong>%filter-count</strong> out of <strong>%total-count</strong> units)' +
         ' | <a href=\'javascript:dc.filterAll(); dc.renderAll();\'\'>Reset All</a>',
      all: '&nbsp;(<strong>%total-count</strong> units). Please click on a graph to apply filters.'
    });


  myTable /* dc.dataTable('.dc-data-table', 'chartGroup') */
    .dimension(dateDimension)
    // Data table does not use crossfilter group but rather a closure as a grouping function
    .group(function (d) {
          return dateFormat(d.date);
    })
    .size(10)
    .columns([
      {
        label: 'Unit Serial Number',
        format: function(d) {
          return d.serial_number;
        }
      },
      {
         label: 'Hours Powered',
         format: function(d) {
           return d.hours;
         }
      },
      {
        label: 'Hours of Awesome',
        format: function(d) {
          return d.hours_in_sync;
        }
      },
      'state',
      'country'
    ])
    .sortBy(function (d) {
        return +d.hours_in_sync;
    })
    .order(d3.ascending) // or d3.descending
    // This custom renderlet ads the color bar for the date groups, which is much nicer
    .on('renderlet', function (table) {
        table.selectAll('.dc-table-group').classed('info', true);
    })
    .showGroups(true) // set this to false to remove the 'date' sub-grouping of the data
    ;

  // simply call .renderAll() to render all charts on the page
  dc.renderAll();

  /* Once rendered you can call .redrawAll() to update charts incrementally when the data changes, without re-rendering everything */
  dc.redrawAll();
});
