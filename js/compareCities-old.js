/**********************
*Barchart to compare cities at various boundaries*
***********************/

var ch = ch || {};

ch.compare = (function(){


  //leave extra space at bottom for x-axis labels
  var setUp = function(targetID){
    var margin = {top: 10, right: 10, bottom: 40, left: 10},
        width = 450 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom,
        textwidth = 4*12 + 5,
        defaultBarWidth = 2000;

    //Create SVG element
    var svg = d3.select(targetID).append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    //Set up scales
    var x = d3.scale.linear()
      .range([0,width]);
    var y = d3.scale.ordinal()
      .rangeRoundBands([0, height], 0.1, 0);

    var settings = {
      margin:margin, width:width, height:height, textwidth:textwidth, 
      svg:svg, x:x, y:y
    }
    return settings;
  }

  var draw = function(settings, data,cityLimit){

    //import settings
    var margin=settings.margin, width=settings.width, height=settings.height, textwidth=settings.textwidth, 
    svg=settings.svg, x=settings.x, y=settings.y;


    //Format data
    function formatData(cityLimit){
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

    var maxData = formatData(maxMiles)
    var cityData = formatData(cityLimit)


    //Set scales
    maxPopulation = d3.max(maxData.map(function(d){
      return d.value
    }))
    y.domain(cityData.map(function(d){
      return d.key;
    }));
    x.domain([0, maxPopulation]);

    //Questioning whether this is necessary
    svg.attr("id","cityComparison")


    var chartRow = d3.select("#cityComparison").selectAll("g")
       .data(cityData)
       .enter()
       .append("g")
       .attr("class", "chartRow")
    
    //Add rectangles
    chartRow.append("rect")
      .attr("class","bar")
      .attr("x", 0)
      .attr("y", function(d) {return y(d.key);})
      .attr("height", y.rangeBand())
      .attr("width", function(d) { return x(d.value); });
    
    //Add Value Labels
    var format = d3.format("0,000")
    chartRow.append("text")
      .attr("class","label")
      .attr("y", function(d) {return y(d.key) + y.rangeBand()/2;})
      .attr("x", 0)
      .attr("dy",".35em")
      .attr("dx","0.5em")
      .text(function(d){return format(d.value)});
    
    //Add Category Labels
    chartRow.append("text")
      .attr("class","category")
      .attr("y", function(d) {return y(d.key) + y.rangeBand()/2;})
      .attr("x",textwidth)
      .attr("dy",".35em")
      .attr("dx","0.5em")
      .text(function(d){return d.key});
  }



  /***************
  *Adjust city comparison chart to reflect current radius*
  Future notes: Click to reset default ring size.  On mouseout, revert to default ring size.  
  ****************/
  var interact = function(settings, cityLimit, data){
    //import settings
    var margin=settings.margin, width=settings.width, height=settings.height, textwidth=settings.textwidth, 
    svg=settings.svg, x=settings.x, y=settings.y;

    //Format data
    function formatData(cityLimit){
      var output = [];
      for (var i = 0; i < numCities; i++) {
        var key = data[i].msa;
        var value = 0;
        for (var j = 0; j < cityLimit; j++) {
          if (value < +data[i].totalPop){
            value+= +data[i][j] * (2*j + 1)
          };
        };
        output.push({key:key, value:value})
      };
      return output
    }

    var newdata = formatData(cityLimit);

    //Reset y domain
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
      .attr("width", function(d) { return x(d.value);})

    //Update bar widths
    rect.transition()
     .attr("width", function(d) { return x(d.value);})
     .duration(300);


    //Bind new data to the value labels
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
    var margin=settings.margin, width=settings.width, height=settings.height, textwidth=settings.textwidth, 
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

  //   //Set scales and sort in descending order of city population
  //   c.x.domain(
  //     cityData
  //       .sort(function(a,b){return b.value - a.value;})
  //       .map(function(d){ return d.key; })
  //   )
  //     .copy()
  //   c.y.domain([0, maxPopulation]);

  //   //Update bar heights
  // d3.select("#cityComparison").selectAll('.cityBar')
  //     .data(cityData, function(d){return d.key})
  //     .transition()
  //     .delay(function(d, i) { return i * 20; })
  //     .attr("y", function(d) { return c.y(d.value); })
  //     .attr("height", function(d) { return c.height - c.y(d.value); })
  //     .attr("x", function(d) {return c.x(d.key); })
  //     .duration(200);
  // }

  return {
    setUp:setUp,
    draw:draw,
    interact:interact
  }
})();