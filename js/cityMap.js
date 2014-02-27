var ch = ch || {};

ch.cityMap = (function(){

var setUp = function(){
  var margin = {top: 5, right: 0, bottom: 5, left: 0},
      width = (450 - margin.left - margin.right),
      height = (200 - margin.top - margin.bottom);
  var r = d3.scale.linear()
    .domain([0,maxMiles])
    .range([0,width - height/2]);
  var rAxis = d3.svg.axis()
      .scale(r)
      .orient("bottom");
      //.outerTickSize(0);

  return {
    margin:margin, width:width, height:height,
    r:r, 
    rAxis:rAxis, 
  };
}



/***************
*Build map of concentric circles radiating out of city center
****************/
//set up svg
var draw = function(m, cityID){
  var mapsvg = d3.select("#city-maps").select("#"+cityID).append("div")
      .attr("class","col-md-6")
      .append("svg")
      .attr("width", m.width + m.margin.left + m.margin.right)
      .attr("height", m.height + m.margin.top + m.margin.bottom)
    .append("g")
      .attr("transform", "translate(" + m.margin.left + "," + m.margin.top + ")");

  //Add data
  var radii = new Array();
  for(var i=0;i<15;i++){
    radii.push(i)
  }

  var blackRadii = new Array();
  for(var i=0;i<maxMiles/5;i++){
    blackRadii.push(5*i)
  }

  var invisiRadii = new Array();
  for(var i=0;i<maxMiles;i++){
    invisiRadii.push(i+.5)
  }

  var invisiCircles = mapsvg.append('g').selectAll("circle.clear")
              .data(invisiRadii, function(d){return d})
              .enter()
              .append("circle")
              .style("fill","none")
              .style("stroke","white")
              .style("stroke-width",function(){return m.r(1)})
              .attr("cx", m.height/2)
              .attr("cy", m.height/2)
              .attr("r", function(d){return m.r(d)})
              .attr("class","clear");

  var circles = mapsvg.append('g').selectAll("circle.radius")
              .data(radii, function(d){return d})
              .enter()
              .append("circle")
              .style("fill","none")
              .style("stroke","rgb(230,230,230)")
              .attr("cx", m.height/2)
              .attr("cy", m.height/2)
              .attr("r", function(d){return m.r(d)})
              .attr("class","radius");

  var blackCircles = mapsvg.append('g').selectAll("circle.blackRadius")
              .data(blackRadii, function(d){return d})
              .enter()
              .append("circle")
              .style("fill","none")
              .style("stroke","rgb(200,200,200)")
              .attr("cx", m.height/2)
              .attr("cy", m.height/2)
              .attr("r", function(d){return m.r(d)})
              .attr("class","blackRadius");

  //add dot in the center, and arrow at the end
  mapsvg.append("circle")
    .attr("cx", m.height/2)
    .attr("cy", m.height/2)
    .attr("r",m.r(0.4));
  mapsvg.append('path')
    .attr('d', function(d) { 
      var tx = m.width + m.margin.right, ty = m.height/2;
      return 'M ' + tx +' '+ ty + ' l -10 5 l 0 -10 z';
    });

  //axis
  mapsvg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(" + m.height/2 + "," + m.height/2 + ")")
    .call(m.rAxis);

  //City center label
  mapsvg.append("text")
    .attr("x",m.height/2)
    .attr("y",m.height/2 - 10)
    .text("Distance from city center (miles)");


  var circleMap = {
    'circles':circles,
    'invisiCircles':invisiCircles,
    'blackCircles':blackCircles
  }

  return circleMap
}

return {
  setUp:setUp,
  draw:draw
}
})();