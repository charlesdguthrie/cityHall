//scatter.js
var ch = ch || {};

ch.top10 = (function(){

	function formatData(data){
		//Sort and slice
		sortedData = data.sort(function(a,b){
				return b.pop - a.pop;
			})
			.slice(0,10);

		var formattedData = [];
		sortedData.forEach(function(d){
			formattedData.push({key:d.city, value:+d.pop})
		});

		return(formattedData)
	}

	function setUp(targetID){
	    var margin = {top: 0, right: 0, bottom: 0, left: 0},
	        width = $(targetID).width() - margin.left - margin.right,
	        height = 200 - margin.top - margin.bottom,
	        textwidth = 5*12 + 5,
	        defaultBarWidth = 200;

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

	function draw(settings,dataset){
		var formattedData = formatData(dataset)
		ch.barChart.draw(settings,formattedData)
	}

	return {
		setUp:setUp,
		draw:draw
	}
})()