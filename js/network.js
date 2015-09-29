var injectionRate = 5;
var configIndex = 0;
var currentConfig = 0;

// var currentConfig = configurations.files[configIndex];

var networkData = 0;


// max value for progress needs to be hard coded
var loadingValue = 105703334;

var globalFreeze = false;

var width = 1080,
height = 900;

groupDomain = [1, 2, 3, 4, 5];
// var color = d3.scale.category20();
var color = d3.scale.linear()
.domain(groupDomain)
.range([
	// "#e78ac3",
	// "#8da0cb",
	// "#a6d854",
	// "#e5c494",
	// "#66c2a5"

// "#dadaeb","#bcbddc","#9e9ac8","#756bb1","#54278f"
// purple 
// "#54278f","#756bb1","#9e9ac8","#bcbddc","#dadaeb"

// purple/green 
// "#7b3294","#c2a5cf","#f0f0f0","#a6dba0","#008837"

// blue
// "#08306b","#08519c","#2171b5","#4292c6","#6baed6"
// "#08519c","#4292c6","#9ecae1","#c6dbef","#f7fbff"

// qualitative
"#1f78b4",
"#33a02c",
"#b2df8a",
"#cab2d6",
// "#6a3d9a",
"#a6cee3"
// "#b15928"
]);


var routerQueueDomain = [0, 10, 100, 1000, 10000, 100000, 1000000];
var colourScale = d3.scale.linear()
.domain(routerQueueDomain)
.range([

	// "#ffffd4",
	// "#fee391",
	// "#fec44f",
	// "#fe9929",
	// "#ec7014",
	// "#cc4c02",
	// "#8c2d04"

	"#fed976",
	"#feb24c",
	"#fd8d3c",
	"#fc4e2a",
	"#e31a1c",
	"#bd0026",
	"#800026"


	]);

occupancyDomain = ["X", "C", "U"];
var occupancyScale = d3.scale.ordinal()

.domain(occupancyDomain)
// .range(colorbrewer.YlOrRd[3]);
// .range([
// 	// "#e6550d", "#fdae6b", "#fee6ce"
// 	// "#a63603","#fd8d3c","#fdd0a2"
// 	// "#ff7f00", "#fdbf6f", "#ffeda0"
// 	// "#222222",
// 	"#b15928", 
// 	"#ff0000",
// 	// "#ff7f00", 
// 	"#fdbf6f"
// 	// "#3355ff"
.range(["#800026","#fc4e2a", "#ffeda0"])

// 	]);




// network backbone router coordinates
// relative to 23x16 map
backbone = [
	{"x": 2, "y":13},
	{"x": 1, "y":9},
	{"x": 7, "y":13},
	{"x": 3, "y":5},
	{"x": 6, "y":3},
	{"x": 11, "y":5},
	{"x": 12, "y":2},
	{"x": 11, "y":13},
	{"x": 14, "y":15},
	{"x": 17, "y":12},
	{"x": 21, "y":15},
	{"x": 21, "y":10},
	{"x": 18, "y":8},
	{"x": 22, "y":7},
	{"x": 20, "y":5},
	{"x": 19, "y":1}
];









var force = d3.layout.force()
.charge(-250)
.linkDistance(40)
.chargeDistance(200)
.gravity(0)
.size([width, height]);
// .gravity(1);

var svg = d3.select("body").append("svg")
.attr("width", width)
.attr("height", height)
.attr("id", "vis");




var networkTooltip = d3.select("body").append("div")
.attr("class", "tooltip")
.attr("id", "networkTooltip")
.style("opacity", "0");


var queueLegend = svg.append("g")
.attr("class", "legend");


var groupLegend = svg.append("g")
.attr("class", "legend");

var occupancyLegend = svg.append("g")
.attr("class", "legend");


var loadingBar = svg.append("line")
.attr("id", "loadingBar")
.attr("stroke-width", 3)
.attr("stroke", "#ccc")
.attr("x1", 25)
.attr("y1", height/2)
.attr("x2", 26)
.attr("y2", height/2);

var loadingBarContext = svg.append("line")
.attr("id", "loadingBarContext")
.attr("stroke-width", 1)
.attr("stroke", "#222")
.attr("x1", 25)
.attr("y1", 4 + height/2)
.attr("x2", width-25)
.attr("y2", 4 + height/2);

var loadingText = svg.append("text")
.attr("id", "loadingText")
.attr("x", 25)
.attr("y", height/2 - 3)
.text("Loading")
.style("font-family", "monospace");

var data = d3.json(DATASET+"/routerData.json")
.on("progress", function() {
	// console.log("progress:" + d3.event.loaded);
	loadingBar.attr("x2", function() {
		percentage = d3.event.loaded/loadingValue;
		dist = width-50;
		return percentage * dist;
	});
})
.on("load", function(json) {
	console.log("loaded routerData");
	routerData = json;

	d3.json("js/networkData.json", function(error, graph) {
		console.log("loaded networkData");
		if (error) {
			console.log(error)
		}



		networkData = graph;

		force
		.nodes(graph.nodes)
		.links(graph.links)
		.start();


		networkTooltip.append("p")
		.attr("id", "tooltipL1");
		networkTooltip.append("p")
		.attr("id", "tooltipL2");
		networkTooltip.append("p")
		.attr("id", "tooltipL3");
		networkTooltip.append("p")
		.attr("id", "tooltipL4")

		var link = svg.selectAll(".link")
		.data(graph.links)
		.enter().append("line")
		.attr("class", "link")
		.style("stroke-width", function(d) { return Math.sqrt(d.value); });

		var nodes = []
		for (var i = 0; i <  networkData.nodes.length; i++) {
			var n = {
				// "radius": 12, 
				x: getX(i),
				y: getY(i),
				fixed: getFixed(i),
				name: i+1,
				index: i,
				group: getGroup(i)
				// class: "node"
			}

			svg.append("circle")
			.data([n])
			// .enter().append("circle")
			.attr("class", "node")
			.attr("r", function(d) {return getRadius(d.group)})
			.attr("id", function(d) {return "c"+d.name})
			// .attr("x", function() {return getX(i);})
			// .attr("y", function() {return getY(i);})
			// .attr("fixed", function() {return getFixed(i);})
			.style("fill", function(d) {return color(d.group); })
			.style("stroke-width", function(d) {return getStrokeWidth(d.group);})
			.on("mouseover", function(d) {
				force.stop()
				drawNetworkTooltip(d)
			})
			.on("mouseout", function(d) {
				networkTooltip.style("opacity", 0);
				if (!globalFreeze){
					force.resume();
				}
			})
			.attr("fixed", function() {return getFixed(i);})
			.attr("up", 0)
			.attr("down", 0)
			.call(force.drag);
			// console.log(n)
			nodes.push([n]);
		}


		var node = svg.selectAll(".node")

		var up = svg.selectAll(".up")
		.data(graph.nodes)
		.enter().append("circle")
		.attr("class", "up")
		.attr("r", 3)
		.style("stroke", "#222")
		.style("stroke-width", 0.25)
		.attr("fill", function (d){
			if (routerData[currentConfig][injectionRate] !== undefined) {
				
				datum = routerData[currentConfig][injectionRate][+d.name -1].Up;
				return colourScale(datum);
			}
			else {return "#222";}
		})
		.attr("pointer-events", "none");


		var down = svg.selectAll(".down")
		.data(graph.nodes)
		.enter().append("circle")
		.attr("class", "down")
		.attr("r", 3)
		.style("stroke", "#222")
		.style("stroke-width", 0.25)
		.attr("fill", function (d){
			if (routerData[currentConfig][injectionRate] !== undefined) {
				datum = routerData[currentConfig][injectionRate][+d.name -1].Down;
				return colourScale(datum);
			}
			else {return "#222";}
		})
		.attr("pointer-events", "none");


		force.on("tick", function(e) {
			// var up = d3.selectAll(".up");

			svg.selectAll(".node")
			.attr("cx", function(d) { 
				if (d.fixed) {
					force.nodes()[d.index].x = d.x;
					return d.x; 
				}
				// return up[0][+d.index].cx.animatedVal.value;
				return force.nodes()[d.index].x;
			})
			.attr("cy", function(d) { 
				
				if (d.fixed) {
					force.nodes()[d.index].y = d.y;
					return d.y;
				}
				// return up[0][+d.index].cy.animatedVal.value;
				return force.nodes()[d.index].y;
			});

			link.attr("x1", function(d) {

				return d.source.x; })
			.attr("y1", function(d) { return d.source.y; })
			.attr("x2", function(d) { return d.target.x; })
			.attr("y2", function(d) { return d.target.y; });




			up.attr("cx", function(d) { return d.x; })
			.attr("cy", function(d) { return d.y-3; })

			down.attr("cx", function(d) { return d.x; })
			.attr("cy", function(d) { return d.y+3; })
		
		});

		updateConfig(0);

			// for (var i = 0; i < backbone.length; i++) {
			// 	svg.append("circle")
			// 	.attr("r", 3)
			// 	.attr("cx", (backbone[i].x/23) * (width * 0.8)+width*0.1)
			// 	.attr("cy", height-(backbone[i].y/16) * (height * 0.8)-height*0.1)
			// 	.style("fill", "green")
			// 	.style("stroke", "none");

			// }

		// LEGENDS

		queueLegend.selectAll("rect")
		.data(routerQueueDomain)
		.enter()
		.append("rect")
		.attr("width", 10)
		.attr("height", 10)
		.attr("x", width - 74)
		.attr("y", function(d, i) {
			return i * 12 + 20;
		})
		.style("fill", function(d){
			return colourScale(d)
		});

		queueLegend.selectAll("text")
		.data(routerQueueDomain)	
		.enter()
		.append("text")
		.attr("x", width - 60)
		.attr("y", function(d, i) {
			return i * 12 + 20 +10;
		})
		.text(function(d){
			return d;
		});

		queueLegend.append("text")
		.attr("x", width - 120)
		.attr("y", 12)
		.text("Router Queue Length");
		
		queueLegend.append("circle")
		.attr("stroke", "#ccc")
		.attr("stroke-width", 1)
		.attr("fill", "#fff")
		.attr("cx", width - 95)
		.attr("cy", 30)
		.attr("r", 12)
		
		queueLegend.append("circle")
		.attr("stroke", "none")
		.attr("stroke-width", 0)
		.attr("fill", "#ccc")
		.attr("cx", width - 95)
		.attr("cy", 25)
		.attr("r", 4)		
		
		queueLegend.append("circle")
		.attr("stroke", "none")
		.attr("stroke-width", 0)
		.attr("fill", "#ccc")
		.attr("cx", width - 95)
		.attr("cy", 35)
		.attr("r", 4);



		groupLegend.selectAll("rect")
		.data(groupDomain)
		.enter()
		.append("rect")
		.attr("width", 10)
		.attr("height", 10)
		.attr("x", 10)
		.attr("y", function(d, i) {
			return i * 12 + 20;
		})
		.attr("title", function(d, i) {
			return configurations.groupFullStrings[i];
		})
		.style("fill", function(d) {
			return color(d);
		});

		groupLegend.selectAll("text")
		.data(configurations.groupStrings)
		.enter()
		.append("text")
		.attr("x", 25)
		.attr("y", function(d, i) {
			return i * 12 + 20 + 10;
		})
		.text(function(d) {
			return d;
		});

		groupLegend.append("text")
		.attr("x", 10)
		.attr("y", 12)
		.text("Group");

		groupLegend.append("circle")
		.attr("stroke", "#ccc")
		.attr("stroke-width", 1)
		.attr("fill", "#ccc")
		.attr("cx", 50)
		.attr("cy", 30)
		.attr("r", 12)
		
		groupLegend.append("circle")
		.attr("stroke", "none")
		.attr("stroke-width", 1)
		.attr("fill", "#fff")
		.attr("cx", 50)
		.attr("cy", 25)
		.attr("r", 4)		
		
		groupLegend.append("circle")
		.attr("stroke", "none")
		.attr("stroke-width", 1)
		.attr("fill", "#fff")
		.attr("cx", 50)
		.attr("cy", 35)
		.attr("r", 4);

		occupancyLegend.selectAll("rect")
		.data(occupancyDomain)
		.enter()
		.append("rect")
		.attr("width", 10)
		.attr("height", 10)
		.attr("x", 10)
		.attr("y", function(d, i) {
			return i * 12 + 20 + 100;
		})
		.attr("title", function (d, i) {
			return configurations.occupancyTitles[i];
		})
		.style("fill", function(d) {
			return occupancyScale(d);
		});
		
		occupancyLegend.append("circle")
		.attr("stroke", "#ccc")
		.attr("stroke-width", 3)
		.attr("fill", "#fff")
		.attr("cx", 50)
		.attr("cy", 140)
		.attr("r", 12)
		
		occupancyLegend.append("circle")
		.attr("stroke", "#ccc")
		.attr("stroke-width", .5)
		.attr("fill", "#fff")
		.attr("cx", 50)
		.attr("cy", 135)
		.attr("r", 4)		
		
		occupancyLegend.append("circle")
		.attr("stroke", "#ccc")
		.attr("stroke-width", .5)
		.attr("fill", "#fff")
		.attr("cx", 50)
		.attr("cy", 145)
		.attr("r", 4);

		occupancyLegend.selectAll("text")
		.data(occupancyDomain)
		.enter()
		.append("text")
		.attr("x", 25)
		.attr("y", function(d, i) {
			return i * 12 + 20 + 10 + 100;
		})
		.text(function(d) {
			return d;
		});

		occupancyLegend.append("text")
		.attr("x", 10)
		.attr("y", 115)
		.text("Occupancy");
		startMultiples();
		updateConfig(currentConfig);
		updateInjection(injectionRate);




	});
	d3.select("#loadingBar").remove();
	d3.select("#loadingBarContext").remove();
	d3.select("#loadingText").remove();

})
.on ("error", function(error) {console.log("Failed to load data", error)})
.get();

function updateNodes() {
	if (injectionRate < 0) {injectionRate = 0;}

	var upVal = [];
	var downVal = [];
	var strokeVal = [];
	svg.selectAll(".up")
	.attr("fill", function (d){
		if (routerData[currentConfig][injectionRate] !== undefined) {
			datum = routerData[currentConfig][injectionRate][+d.name -1].Up;
			return colourScale(datum);
		}
		else {return "#222";}
});

	svg.selectAll(".down")
	.attr("fill", function (d){ 
		// return colourScale(downVal[+d.name]);
		if (routerData[currentConfig][injectionRate] !== undefined) {
			datum = routerData[currentConfig][injectionRate][+d.name -1].Down;
			return colourScale(datum);
		}
		else {return "#222";}
	})
	
	svg.selectAll(".node")
	.attr("stroke-width", 2.5)
	.attr("stroke", function(d) {
		if (routerData[currentConfig][injectionRate] !== undefined) {
			datum = routerData[currentConfig][injectionRate][+d.name -1].Occ;
			return occupancyScale(datum);
		}
		else {return "#222";}
		// return (occupancyScale(strokeVal[+d.name]))
	})
}


// update(1);
// updateNodes();
d3.select("#setCurrentConfig").on("input", function() {
	updateConfig(+this.value);
})




function updateConfig(file) {
	d3.select("#setCurrentConfig-value").text(configurations.files[file]);
	d3.select("#setCurrentConfig").property("value", file);
	configIndex = file;
	currentConfig = configurations.files[configIndex];
	updateNodes();
	drawStackedChart();
	updateInjectionIndicator();

	// update display below overview with config details
	configurationString.text(configurations.configurations[configIndex]);
	// update feedback for which configuration is selected
	updateFileSelector(configIndex);
}

d3.select("#setInjectionRate").on("input", function() {
	updateInjection(+this.value);
})




function updateInjection(rate) {
	// newInjectionRate = rate;
	// console.log(newInjectionRate);
	d3.select("#setInjectionRate-value").text(rate);
	d3.select("#setInjectionRate").property("value", rate);
	// console.log(rate);
	injectionRate = rate;
	injectionRate--;
	updateNodes();
}




d3.select("#toggleUp").on("change", function() {
	var type = this.value;
	visibility = this.checked ? "visible" : "hidden";
	svg.selectAll(".up").attr("visibility", visibility);
});

d3.select("#toggleDown").on("change", function() {
	var type = this.value;
	visibility = this.checked ? "visible" : "hidden";
	svg.selectAll(".down").attr("visibility", visibility);
});

d3.select("#toggleOccupancy").on("change", function() {
	var type = this.value;
	var strokeVal = this.checked ? 2.5 : 0;
	d3.selectAll(".node").style("stroke-width", strokeVal);
});

d3.select("#toggleFreeze").on("change", function() {
	var type = this.value;
	globalFreeze = this.checked;
	if (this.checked){
		force.stop();
	}
	else {
		force.resume();
	}
});


function drawNetworkTooltip(d) {

	if (routerData[currentConfig][injectionRate] !== undefined) {
		var up = -1;
		var down = -1;
		var occ = "..."

		up = routerData[currentConfig][injectionRate][+d.name-1].Up;
		down = routerData[currentConfig][injectionRate][+d.name-1].Down;
		occ = routerData[currentConfig][injectionRate][+d.name-1].Occ;

		index = +d.name
		group = configurations.groupStrings[(networkData.nodes[index -1].group)-1];


		networkTooltip.style("opacity", 0.9)
		// .text("router " + d.name + " up: " + up + " down: " + down)
		.style("left", (d3.event.pageX) + "px")     
		.style("top", (d3.event.pageY - 65) + "px");

		networkTooltip.select("#tooltipL1")
		.text("router:  " + d.name + " (" + group + ")");
		networkTooltip.select("#tooltipL2")
		.text("up:  " + up);
		networkTooltip.select("#tooltipL3")
		.text("down:  " + down)
		networkTooltip.select("#tooltipL4")
		.text("Occupancy: " + occ);

	}
	else 
	{
		networkTooltip.style("opacity", 0.9)
		.style("left", (d3.event.pageX) + "px")     
		.style("top", (d3.event.pageY - 85) + "px");

		networkTooltip.select("#tooltipL1")
		.text("router:  " + d.name);
		networkTooltip.select("#tooltipL2")
		.text("no data for this injection rate");
	}

}


function getX(i) {
					if (i < backbone.length) {
						
						return (backbone[i].x /23) * (width * 0.8) + width*0.1;
					}
					return 0;
				}
function getY (i) {
					if (i < backbone.length) {
						return height - (backbone[i].y/16) * (height * 0.8)-height*0.1;
					}
					return 0;
				}

function getFixed (i) {
					if (i < backbone.length) {
						return true;
					}
					return false;
				}

function getGroup (i) {
					return networkData.nodes[i].group;
}

function getRadius (i) {
					if (i <= 2) {
						return 12;
					}
					return 8;
}

function getStrokeWidth (i) {
					if (i <= 2) {
						return 3;
					}
					return 2;

}