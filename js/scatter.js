//scatter.js
var ch = ch || {};

ch.scatter = (function(){

	function setUp(targetID){

		var margin = {top: 10, right: 60, bottom: 30, left: 80},
		    width = $(targetID).width() - margin.left - margin.right,
		    height = 500 - margin.top - margin.bottom;

		var x = d3.scale.linear()
		    .range([0, width]);

		var y = d3.scale.linear()
		    .range([height, 0]);

		var xAxis = d3.svg.axis()
		    .scale(x)
		    .orient("bottom");

		var yAxis = d3.svg.axis()
		    .scale(y)
		    .orient("left");

		var svg = d3.select(targetID).append("svg")
		    .attr("width", width + margin.left + margin.right)
		    .attr("height", height + margin.top + margin.bottom)
		  .append("g")
		    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	    var settings = {
	      margin:margin, width:width, height:height, xAxis:xAxis, yAxis:yAxis,
	      svg:svg, x:x, y:y
	    }

	    return settings
	}

	function labelCities(data){
		var top = [];
		data.forEach(function(d){
			if(d.label==1){
				top.push(d)
			}
		})
		return top;
	}

	function draw(settings, data){

		var margin=settings.margin, width=settings.width, height=settings.height, xAxis = settings.xAxis, yAxis = settings.yAxis,
	    svg=settings.svg, x=settings.x, y=settings.y;
	
		data.forEach(function(d) { 
			d.land_area = +d.land_area;
			d.pop = +d.pop;
		})

		var labelledCities = labelCities(data);

		x.domain(d3.extent(data, function(d) { return d.land_area; }));
		y.domain(d3.extent(data, function(d) { return d.pop; }));

		//x axis
		svg.append("g")
		  .attr("class", "x axis")
		  .attr("transform", "translate(0," + height + ")")
		  .call(xAxis)
		.append("text")
		  .attr("class", "label")
		  .attr("x", width - 100)
		  .attr("y", -6)
		  .style("text-anchor", "end")
		  .text("Land Area (sq. miles)");

		//y axis
		svg.append("g")
		  .attr("class", "y axis")
		  .call(yAxis)
		.append("text")
		  .attr("class", "label")
		  .attr("transform", "rotate(-90)")
		  .attr("y", 6)
		  .attr("dy", ".71em")
		  .style("text-anchor", "end")
		  .text("Population as of 2010 Census")

		//trendline  svg:line x1="0" y1="0" x2="0" y2="0"
/*		var intercept = 10.8523, slope = 0.4386, xmin = x.domain()[0], xmax = x.domain()[1];
		var yplot = function(x, slope, intercept){ return Math.exp(slope*Math.log(x) + intercept); };
		svg.append("line")
			.attr("x1", x(xmin))
			.attr("y1", y(yplot(xmin,slope,intercept)))
			.attr("x2", x(xmax))
			.attr("y2", y(yplot(xmax, slope, intercept)))
			.attr("class","trendline")*/

		//dots
		svg.selectAll(".dot")
		  .data(data)
		.enter().append("circle")
		  .attr("class", "dot")
		  .attr("r", 5)
		  .attr("cx", function(d) { return x(d.land_area); })
		  .attr("cy", function(d) { return y(d.pop); })

		//label important cities
		svg.selectAll(".value")
		  .data(labelledCities)
		.enter().append("text")
		  .attr("class","value")
		  .attr("x", function(d) { return x(d.land_area); })
		  .attr("y", function(d) { return y(d.pop); })
		  .attr("dy", ".35em")
		  .attr("dx", ".6em")
		  .text(function(d) { return d.city})


	}

  return {
    setUp:setUp,
    draw:draw
  }

})();