var lineMargins = {top: 2, right: 25, bottom: 18, left: 16};
var lineWidth = document.getElementById("lineGraph").clientWidth - (lineMargins.left), 
lineHeight = document.getElementById("lineGraph").clientHeight;// - (lineMargins.top + lineMargins.bottom);

var selectedRate  = 0;

// x-axis
var xLine = d3.scale.linear()
	// from 1 to 250
	.domain([0, 250])
	.range([0, lineWidth - (lineMargins.right + lineMargins.left)])
	.nice();

// y-axis
var yLine = d3.scale.linear()
	// for each of the 218 routers:
	.domain([1, 218])
	.range([lineHeight, lineMargins.bottom]);


//
var xAxisLine = d3.svg.axis().scale(xLine).orient("bottom"),
yAxisLine = d3.svg.axis().scale(yLine).orient("left");


//  svg
var svgLine = d3.select("#lineGraph").append("svg")
// .attr("width", lineWidth)
// .attr("height", lineHeight)
.attr("id", "svgLine")


// svgLine.append("rect")
// .attr("id", "lineContext")
.attr("width", lineWidth)
.attr("height", lineHeight)
.attr("x", lineMargins.left)
.attr("y", -18)
// .attr("fill", "#ccc")
.attr("transform", "translate("+lineMargins.left+", -17)")
// .attr("stroke", "#222")
// .attr("stroke-weight", 1)
.on("mouseover", mouseEnter)
.on("mousemove", scrubLine)
.on("mouseout", mouseLeave)
.on("click", clickLine);

stackChart = svgLine.append("g").attr("class", "stackChartG")


scrubFeedback = svgLine.append("text")
.attr("class", "feedback")
.attr("id", "lineGraphFeedback")
.attr("fill", "#22D")
.attr("visibility", "hidden");

injectionIndicator = svgLine.append("line")
.attr("id", "injectionIndicator")
.attr("stroke", "#2D2")
.attr("stroke-weight", 2)
// updateInjectionIndicator();

scrubIndicator = svgLine.append("line")
.attr("id", "scrubIndicator")
.attr("stroke", "#22D")
.attr("stroke-weight", 1)
.attr("visibility", "hidden")
.style("stroke-dasharray", ("3, 1"));



var configurations = {};

d3.json(DATASET+"/configurations.json", function(err, config) {
	if (err) {
		console.log(err)
	}
	configurations = config;
	currentConfig = configurations.files[configIndex];
	updateInjectionIndicator();
}); 


// var svgLine = d3.select("body").append("svg")
// .attr("width", width + margin.left + margin.right)
// .attr("height", height + margin.top + margin.bottom)
// .append("g")
// .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var averages = d3.json(DATASET+"/averages.json", function(error, data) {
	if (error) {throw error;}
	averages = data;
	console.log("loaded averages")
	drawStackedChart();
});


function drawStackedChart() {
	
		// console.log(data[currentConfig][0])
		d3.selectAll(".average").remove()
		var xMax = (configurations.maxRates[configIndex])/configurations.increment;
		xLine.domain([0, xMax]);
		var average = stackChart.selectAll(".average")
		.data(averages[currentConfig])
		.enter().append("g")
		.attr("class", "average")
		.attr("transform", function(d, i) { return "translate(" + xLine(i) + ",0)"; });
		// console.log(data[currentConfig][0])
		

		strokeWidth = width/(averages[currentConfig].length) - 1;

		average.selectAll("line")
		.data(function(d, i) {
			// console.log(i)
			// console.log(d)
			var r = [];
			r[0] = {y0: 0, y1: d.X};
			r[1] = {y0: d.X, y1: (d.X + d.C)};
			r[2] = {y0: (d.X + d.C), y1: (d.C + d.X + d.U)};
			return r;
		})
		.enter()
		.append("line")
		.attr("stroke-width", strokeWidth)
		.attr("x1", function () {
			// return -strokeWidth/2;
			return 0;
		})
		.attr("y1", function(d) {
			return yLine(d.y0);
		})
		.attr("x2", function() {
			// return -strokeWidth/2;
			return 0;
		})
		.attr("y2", function(d) {
			return yLine(d.y1);
		})
		.style("stroke", function(d, i) {
			// return color(i);
			return occupancyScale(occupancyDomain[i]);
		})
		// .style("z-index", "-1")
		.on("mouseover", function(d) {
			// console.log(d);
		});
	// console.log(data[currentConfig][0])
	// });
}







function mouseEnter() {
	// console.log("enter")
	// this always runs before mousemove 
	slectedRate = injectionRate;

	scrubFeedback.attr("visibility", "visible");
	scrubIndicator.attr("visibility", "visible");
}


function scrubLine() {
	// console.log("scrub");
	var xMax = configurations.maxRates[configIndex]/configurations.increment;
	xLine.domain([0, xMax]);
	var xPosLine = Math.round(xLine.invert(d3.mouse(this)[0]));
	// console.log(xPosLine);
	if (xPosLine > 0 && xPosLine <= xMax) {
		updateInjection(xPosLine);

		
		scrubFeedback.text((xPosLine*configurations.increment)+1)
		.attr("x", function() {
			return xLine(xPosLine);
		})
		.attr("y", 30);

		scrubIndicator
		.attr("x1", xLine(xPosLine))
		.attr("y1", 0)
		.attr("x2", xLine(xPosLine))
		.attr("y2", lineHeight);
		// .attr("transform", "translate("+lineMargins.right+", 0)");
	}
}

function mouseLeave() {

	updateInjection(selectedRate);

	scrubFeedback.attr("visibility", "hidden");
	scrubIndicator.attr("visibility", "hidden");
}

function clickLine() {
	var xMax = configurations.maxRates[configIndex]/configurations.increment;
	xLine.domain([0, xMax]);
	var xPosLine = Math.round(xLine.invert(d3.mouse(this)[0]));

	if (xPosLine > 0 && xPosLine <= xMax){
		if (xPosLine !== selectedRate){
			selectedRate = xPosLine;
			updateInjection(xPosLine);
			updateInjectionIndicator();
			updateMultiples();
		}
	}
}


function updateInjectionIndicator() {
	var xMax = configurations.maxRates[configIndex]/configurations.increment;
	xLine.domain([0, xMax]);
	injectionIndicator
	.attr("x1", xLine(injectionRate+1))
	.attr("y1", 0)
	.attr("x2", xLine(injectionRate+1))
	.attr("y2", lineHeight);
	
	xMax = configurations.maxRates[configIndex];
	xLine.domain([0, xMax]);
	svgLine.selectAll(".x").remove();
	svgLine.append("g")
	.attr("class", "x axis")
	.attr("transform", "translate(0," + lineHeight + ")")
	.call(xAxisLine);
}