var NYTD = NYTD || {};
NYTD.xStream = NYTD.xStream || {};

NYTD.xStream.barChart = (function(color, targetID) {
  /************
  *SETUP CHART*
  *************/
  //Width and height
  function setup(targetID, color){
    var margin = {top: 0, right: 10, bottom: 40, left: 0},
        width = $(targetID).width() - margin.left - margin.right,
        height = $(targetID).height() - margin.top - margin.bottom,
        textwidth = 4*12 + 5,
        defaultBarWidth = 2000,
        color = color;

    //Create SVG element
    var svg = d3.select(targetID).append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
    //Set up scales
    var x = d3.scale.linear()
      .domain([0,defaultBarWidth])
      .range([0,width]);
    var y = d3.scale.ordinal()
      .rangeRoundBands([0, height], 0.1, 0);
    
    var settings = {
      margin:margin, width:width, height:height, textwidth:textwidth, color:color,
      svg:svg, x:x, y:y
    }

    return settings
  }

  //Function to create rows, including rectangles and labels
  function createRows(settings,dataset) {
    //import settings
    var margin=settings.margin, width=settings.width, height=settings.height, textwidth=settings.textwidth, color=settings.color,
    svg=settings.svg, x=settings.x, y=settings.y;

    console.log("Barchart happening")
  
    var chart = svg.append("g")
      .attr("id","chartContent");
    var chartRow = chart.selectAll("g")
       .data(dataset, function(d){return d.key})
       .enter()
       .append("g")
       .attr("class", "chartRow");
    
    //Add rectangles
    chartRow.append("rect")
      .attr("class","bar " + barClass)
      .attr("x", 0)
      .attr("y", function(d) {return y(d.key);})
       .attr("height", y.rangeBand())
       .attr("width", 0) //initiallize bar widths to zero
    
    //Add Labels
    chartRow.append("text")
      .attr("class","label")
      .attr("opacity",0)
      .attr("y", function(d) {return y(d.key) + y.rangeBand()/2;})
      .attr("x",0)
      .attr("dy",".35em")
      .attr("dx","0.5em");
    
    //Add Headlines
    chartRow.append("text")
      .attr("class","category")
      .attr("opacity",0)
      .attr("y", function(d) {return y(d.key) + y.rangeBand()/2;})
      .attr("x",textwidth)
      .attr("dy",".35em")
      .attr("dx","0.5em")
      .text(function(d){return d.key});
  }


  /***********
  *UPDATES****
  ***********/
  
  var update = function(settings, newdata) {
    //populate(function (newdata) {

    //import settings
    var margin=settings.margin, width=settings.width, height=settings.height, textwidth=settings.textwidth, color=settings.color,
    svg=settings.svg, x=settings.x, y=settings.y;

    //Reset domain
    y.domain(newdata.map(function(d) { return d.key; }));

    //Bind new data to the bars
    var rect = svg.selectAll(".bar")
      .data(newdata, function(d){return d.key});

    //Add new bars
    rect.enter().insert("rect")
      .attr("class","bar")
      .attr("x", 0)
      .attr("y", height + margin.top + margin.bottom)
      .attr("height", y.rangeBand())
      .attr("width", 0) //initiallize bar widths to zero
      .attr("fill", color);

    //Update chart range
    var barmax = d3.max(newdata, function(e) {
      return e.value;
    });
    x.domain([0,barmax]);

    //Update bar widths
    rect.transition()
     .attr("width", function(d) { return x(d.value);})
     .duration(300);


    //Bind new data to the labels
    var label = svg.selectAll(".label")
      .data(newdata, function(d){return d.key});

    //Add new labels
    label.enter().insert("text")
      .attr("class","label")
      .attr("opacity",0)
      .attr("y", height + margin.top + margin.bottom)
      .attr("x",0)
      .attr("dy",".35em")
      .attr("dx","0.5em")

    //Update data labels
    label.text(function(d){return d.value})
    .transition()
      .duration(300)
      //.attr("x", function(d) {return x(d.value);})
      .attr("opacity",1);


    //CATEGORIES
    //Bind new data to categories
    var category = svg.selectAll(".category")
      .data(newdata, function(d){return d.key});

    //Add new categories
    category.enter().insert("text")
      .attr("class","category")
      .attr("opacity",0)
      .attr("y", height + margin.top + margin.bottom)
      .attr("x",textwidth)
      .attr("dy",".35em")
      .attr("dx","0.5em")

    //Update categories
    category.text(function(d){return d.key})
    .transition()
      .duration(300)
      .attr("opacity",1);

    //Remove missing data
    rect.exit().remove();
    label.exit().remove();
    category.exit().remove();

    //re-order Chart Rows
    barsort(newdata, settings)
  
    //});
  }
  
  function barsort(dataset, settings) {
    //import settings
    var margin=settings.margin, width=settings.width, height=settings.height, textwidth=settings.textwidth, color=settings.color,
    svg=settings.svg, x=settings.x, y=settings.y;

    var y1 = y.domain(dataset.sort(function(a,b){
      return b.value - a.value;
    })
      .map(function(d) { return d.key; }))
      .copy();

    var transition = svg.transition()
        .delay(300)
        .duration(600),
        delay = function(d, i) { return 300 + i * 30; };

    transition.selectAll(".bar")
        .delay(delay)
        .attr("y", function(d) { return y1(d.key); });

    transition.selectAll(".label")
        .delay(delay)
        .attr("y", function(d) { return y1(d.key) + y.rangeBand()/2;});

    transition.selectAll(".category")
        .delay(delay)
        .attr("y", function(d) { return y1(d.key) + y.rangeBand()/2;});
  };

  return {
    setup:setup,
    update:update
  }
})();