/**********************
*Barchart to compare cities at various boundaries*
***********************/

var ch = ch || {};

ch.compare = (function(){

  //Format data
  function formatData(data,cityLimit){
    var output = [];
    for (var i = 0; i < numCities; i++) {
      var key = data[i].msa;
      var value = 0;
      for (var j = 0; j < cityLimit; j++) {
          value+= +data[i][j] * (2*j + 1)
      } ;
      if(cityLimit == maxMiles){
        value = +data[i].totalPop
      }
      output.push({key:key, value:d3.min([value,+data[i].totalPop])})
    };
    return output
  }

  /************
  *SETUP CHART*
  *************/
  //Width and height
  function setUp(targetID){
    var margin = {top: 10, right: 10, bottom: 0, left: 0},
        width = $(targetID).width() - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom,
        textwidth = 5*12 + 5,
        defaultBarWidth = 2000;

    //Create SVG element
    d3.select(targetID).selectAll("svg").remove()
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
      margin:margin, width:width, height:height, textwidth:textwidth,
      svg:svg, x:x, y:y
    }
    return settings
  }

  var draw = function(settings, data,cityLimit){

    //import settings
    var margin=settings.margin, width=settings.width, height=settings.height, textwidth=settings.textwidth, 
    svg=settings.svg, x=settings.x, y=settings.y;

    var maxData = formatData(data,maxMiles)
    var cityData = formatData(data,cityLimit)


    //Set scales
    maxPopulation = d3.max(maxData.map(function(d){
      return d.value
    }))
    y.domain(cityData.map(function(d){
      return d.key;
    }));
    x.domain([0, maxPopulation]);


    //create chart row and move to the correct height
    var chartRow = svg.selectAll("g")
       .data(cityData, function(d){return d.key})
       .enter()
       .append("g")
       .attr("class", "chartRow")
       .attr("transform", function(d){ return "translate(0," + y(d.key) + ")"; });

    //Add rectangles
    chartRow.append("rect")
      .attr("class","bar")
      .attr("x", 0)
      .attr("height", y.rangeBand())
      .attr("width", 0) //initialize width to zero 
    
    var format = d3.format("0,000")

    //Add value labels
    chartRow.append("text")
      .attr("class","label")
      .attr("y", y.rangeBand()/2)
      .attr("x",0)
      .attr("dy",".35em")
      .attr("dx","0.5em")
      .text(0); //initialize labels at 0
    
    //Add category labels
    chartRow.append("text")
      .attr("class","category")
      .attr("text-overflow","ellipsis")
      .attr("y", y.rangeBand()/2)
      .attr("x",textwidth)
      .attr("dy",".35em")
      .attr("dx","0.5em")
      .text(function(d){return d.key});

    update(settings, cityLimit, data)
  }



  /***************
  *Adjust city comparison chart to reflect current radius*
  Future notes: Click to reset default ring size.  On mouseout, revert to default ring size.  
  ****************/
  var update = function(settings, cityLimit, data){
    //import settings
    var margin=settings.margin, width=settings.width, height=settings.height, textwidth=settings.textwidth, 
    svg=settings.svg, x=settings.x, y=settings.y;

    var newdata = formatData(data,cityLimit);

    //Reset y domain
    y.domain(newdata.sort(function(a,b){
      return b.value - a.value;
    })
      .map(function(d) { return d.key; }));

    //Bind new data to chart rows and move to below the bottom of the chart
    var format = d3.format("0,000")

    var chartRow = svg.selectAll("g.chartRow")
      .data(newdata, function(d){ return d.key});

    //Update bar widths
    chartRow.select(".bar").transition()
      .duration(100)
      .attr("width", function(d) { return x(d.value);})
      .attr("opacity",1);

    //Update data labels
    chartRow.select(".label").transition()
      .duration(100)
      .attr("opacity",1)
      .tween("text", function(d) { 
        var i = d3.interpolate(+this.textContent.replace(/\,/g,''), +d.value);
        return function(t) {
          this.textContent = format(Math.round(i(t)));
        };
      });

    /*************
    *REORDER ROWS*
    *************/

    var delay = function(d, i) { return i*30; };

    chartRow.transition()
        .delay(delay)
        .duration(600)
        .attr("transform", function(d){ return "translate(0," + y(d.key) + ")"; });
  };

  return {
    setUp:setUp,
    draw:draw,
    update:update
  }
})();