var ch = ch || {};

ch.cityBar = (function(targetID){

var setUp = function(){
  //Width and height
  var margin = {top: 5, right: 0, bottom: 5, left: 50},
      width = 450 - margin.left - margin.right,
      height = 200 - margin.top - margin.bottom;

  var barChartDims = {width:width - height/2, height:height};

  //Scales
  var y = d3.scale.linear()
    .range([height,0]);
  var x = d3.scale.linear()
    .range([0,barChartDims.width]);
  var yAxis = d3.svg.axis()
      .scale(y)
      .orient("left")
      .tickFormat(d3.format(".2s"));


  return {
    margin:margin, width:width, height:height,
    x:x, y:y, yAxis:yAxis, barChartDims:barChartDims
  };
};



/**********************
**Draw one city barchart
***********************/

function draw(dims,data,maxDensity, cityID){

  //convert densities from object to array
  var densities = []
  for (var i = 0; i < maxMiles; i++) {
    densities.push(+data[i])
  };

  dims.x.domain([0,maxMiles]);
  dims.y.domain([0, maxDensity]);

  var svg = d3.select("#city-maps").select("#"+cityID)
    .append("div")
      .attr("class","col-md-6")
    .append("svg")
      .attr("class","barchart")
      .attr("width", dims.width + dims.margin.left + dims.margin.right)
      .attr("height", dims.height + dims.margin.top + dims.margin.bottom)
    .append("g")
      .attr("transform", "translate(" + dims.margin.left + "," + dims.margin.top + ")");

  //Y Axis
  svg.append("g")
      .attr("class", "y axis")
      .call(dims.yAxis)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -40)
      .attr("x",-180)
      .attr("dy", ".71em")
      .style("text-anchor", "start")
      .text(data.msa.substring(0,30)+"...");

  svg.selectAll(".bar")
      .data(densities, function(d,i){return i})
    .enter().append("rect")
      .attr("class", "bar")
      .attr("id", function(d,i) {return i;})
      .attr("x", function(d,i) { return dims.x(i); })
      .attr("width", dims.barChartDims.width/maxMiles)
      .attr("y", function(d) { return dims.y(d); })
      .attr("height", function(d) { return dims.height - dims.y(d); });

  svg.selectAll(".invisiBar")
      .data(densities, function(d,i){return i})
    .enter().append("rect")
      .attr("class", "invisiBar")
      .attr("id", function(d,i) {return i;})
      .attr("x", function(d,i) { return dims.x(i); })
      .attr("width", dims.barChartDims.width/maxMiles)
      .attr("y", 0)
      .attr("height", dims.height)
      .attr('opacity', 0);
};

return {
  setUp:setUp,
  draw:draw
}
})();