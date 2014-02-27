var ch = ch || {};

/************
*SETUP CHART*
*************/

//Chart options
var maxMiles = 60,
  numCities = 20,
  cityLimit = maxMiles;
var innerRingColor = 'white',
  outerRingColor = 'rgb(230,230,230)',
  hoverColor = 'steelBlue',
  defaultBarColor = 'black';

//Color scale
var color = d3.scale.linear()
  .domain([
    0,1,500,1000,2000,5000,10000,20000,30000
  ])
    .range([
      "rgb(240,240,240)",
      "rgb(255,255,217)",
      "rgb(237,248,177)",
      "rgb(199,233,180)",
      "rgb(127,205,187)",
      "rgb(65,182,196)",
      "rgb(29,145,192)",
      "rgb(34,94,168)",
      "rgb(12,44,132)"
    ]);  


//Set up dimensions, x, y, and axes
var barChartSettings = ch.cityBar.setUp(),
    compareSettings = ch.compare.setUp('#compare-div'),
    mapSettings = ch.cityMap.setUp(),
    scatterSettings = ch.scatter.setUp('#scatterplot-div'),
    top10Settings = ch.top10.setUp('#top10pop');

/**********************
**Draw all city charts*
***********************/
function drawCharts(error,data,areaData){
  //get overall y scale
  var maxDensity = 0;
  for (var i = 0; i < numCities; i++) {
    var city=data[i];
    for(var j = 0; j < maxMiles; j++) {
      maxDensity=d3.max([maxDensity,+city[j]])
    };
  };

  //List top 10 cities by population
  ch.top10.draw(top10Settings,areaData)

  //Draw scatter plot
  ch.scatter.draw(scatterSettings,areaData)

  //Draw City comparison chart and slider
  ch.compare.draw(compareSettings, data,cityLimit) //Draw chart
  d3.select('#slidertext').text(maxMiles);

  //On slide, update
  d3.select('#slider').call(
    d3.slider().value(maxMiles).axis(true).min(1).max(maxMiles)
    .on("slide", function(evt, value) {
        d3.select('#slidertext').text(value);
        ch.compare.update(compareSettings, value,data);
      })
  );

  //loop through and draw each city
  var cityMaps = {};
  for (var i = 0; i < 20; i++) {
    cityID = 'city'+i ;
    d3.select("#city-maps").append("div")
      .attr("class","row")
      .attr("id",cityID);
    ch.cityMap.draw(mapSettings,cityID);
    ch.cityBar.draw(barChartSettings, data[i], maxDensity, cityID);
  };


  //Initiate responses to mouse-hover
  interact(data)
};

queue(1)
	.defer(d3.tsv,'data/densities.txt')
  .defer(d3.csv, 'data/pop_v_land_area_full.csv')
	.await(drawCharts)





/********************
*Link rings to bars with hover
*********************/
function colorHoveredCircle(selection,mouseAction,data){
  var selected = d3.select(selection);
  var radius = selected[0][0].__data__ - 0.5;
  var currentColor = selected[0][0].style.stroke;

  //when mousing over, ring and bar becomes blue
  if(mouseAction=='over'){
    var ringColor = hoverColor, barColor = hoverColor;
  } else if(mouseAction=='out'){
    var ringColor = (radius<=cityLimit ? innerRingColor : outerRingColor), 
    barColor = defaultBarColor;
  }

  d3.selectAll('.barchart').selectAll('.bar')
    .style('fill',function(d,i){
      if(i==radius){
        return(barColor)
      }
    })
  selected.style('stroke',ringColor)
}

//This is failing to color the corresponding ring
function colorHoveredBar(selection, mouseAction){
  if(mouseAction=='over'){
    var radius = selection.id
  } else if(mouseAction=='out'){
    var radius = -1
  }
  // d3.selectAll('circle.clear')
  //   .style('stroke',function(d,i){
  //     return i==radius ? hoverColor : (i<cityLimit ? innerRingColor : outerRingColor)
  //   })
  d3.selectAll('.barchart').selectAll('.bar')
    .style('fill',function(d,i){
      return i==radius ? 'steelBlue' : 'black'
    })
}




function interact(data){

  d3.selectAll("circle.clear")
    .on('mouseover',function(){
      colorHoveredCircle(this,'over',data);
    })
    .on('mouseout',function(){colorHoveredCircle(this,'out',data)})
    .on('click',function(){setDefaulCityLimit(this,data)})

  // Also link bars to rings

  d3.selectAll(".invisiBar")
    .on('mouseover',function(){colorHoveredBar(this,'over')})
    .on('mouseout',function(){colorHoveredBar(this,'out')})

};


/*****************
TO DO
Future notes: Click to reset default ring size.  On mouseout, revert to default ring size.  

1. Rotate column chart into a bar chart
  a. Make a slider to control boundary

2. Set of rings superimposed on google map for each city!!!!!!!!!s  FUCK YEAHHH

3. Finish top 10 lists

4. Draw scatter plot

5. Layout and design

6. Add a dropdown for selecting a city
 
Connect it to a current event

"BOOM!  Look at that!  I would love some skittle organizing right now."
-Dai

Don't go one step forward, go three steps forward!


*/
