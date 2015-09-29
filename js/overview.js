// create small multiples
var smWidth = 40,
smHeight = 480;


// append div where they live
d3.select("body").append("div").attr("id", "overview");

var overviewWidth = document.getElementById("overview").clientWidth;
var overviewHeight = document.getElementById("overview").clientHeight;

var smallMultiples = d3.select("#overview").append("svg")
.attr("width", overviewWidth)
.attr("height", overviewHeight);

var configurationString = d3.select("body").append("p")
.attr("x", 5)
.attr("y", 15)
.attr("class", "configFeedback")
.text("foo")


var overviewTooltip = d3.select("body").append("div")
.attr("class", "tooltip")
.attr("id", "overviewTooltip")
.style("opacity", 0)

overviewTooltip.append("p")
.attr("id", "tooltipL1");
overviewTooltip.append("p")
.attr("id", "tooltipL2");
overviewTooltip.append("p")
.attr("id", "tooltipL3");
overviewTooltip.append("p")
.attr("id", "tooltipL4")


var nextRate = d3.select("body").append("div")
.attr("id", "nextRate")
// .text("next")
.attr("title", "Increase Injection Rate")
.on("click", function() {
	var ir = injectionRate+2;
	console.log(ir)
	updateInjection(ir);
	injectionIndicator
	.attr("x1", xLine(ir))
	.attr("y1", 0)
	.attr("x2", xLine(ir))
	.attr("y2", lineHeight);
	updateMultiples();
});

var prevRate = d3.select("body").append("div")
.attr("id", "prevRate")
// .text("prev")
.attr("title", "Decrease Injection Rate")
.on("click", function() {
	var ir = injectionRate + 0;
	console.log(ir);
	updateInjection(ir);
	injectionIndicator
	.attr("x1", xLine(ir))
	.attr("y1", 0)
	.attr("x2", xLine(ir))
	.attr("y2", lineHeight);
	updateMultiples();
});



// make the little charts
function startMultiples() {

	for (var i = 0; i < configurations.files.length; i++) {

		var d = Math.floor(overviewWidth/smWidth);
		var a = Math.floor((i * smWidth) / (overviewWidth - 20));
		var b = a * smHeight + (1 * a);
		var c = ((i * smWidth) % (overviewWidth-20)) + (1 * (i%d));
		


		var nodes = d3.selectAll(".node")[0];
		// for each router (there's 218 of them)
		var yPos = [0, 0, 0, 0, 0];
		for (var j = 0; j < nodes.length; j++) {
			// Draw a line in each file
			var group = nodes[j].__data__.group;
			var g = group - 1;
			yPos[g] += 1;
			var n = nodes[j].__data__.name;
			var o = routerData[configurations.files[i]][injectionRate][n-1].Occ;
			var f = occupancyScale(o)
			
			var w = (smWidth/yPos.length) -1;
			var h = smHeight/configurations.groupSize[g];
			var x = c + (g)*(smWidth/configurations.groupSize.length);
			var y = 4+(b + 14) + (yPos[g])*((smHeight-20)/configurations.groupSize[g]) - h;

			smallMultiples.append("rect")
			.attr("class", "heatmap")
			// .data([o, n])
			.data([{"configFile":i, "id": j}])
			.attr("x", x)
			.attr("y", y)
			.attr("width", w)
			.attr("height", h)
			.attr("stroke", "#fff")
			.attr("fill", f)
			// .on("mouseover", drawOverviewTooltip(j));
			.on("mouseover", function(d) {drawOverviewTooltip(+d.id, +d.configFile)})
			.on("mouseout", function() {
				overviewTooltip.style("opacity", 0);
				d3.selectAll("#indicator").remove();
			})
			.on("mousemove", function(d) {
				overviewTooltip.style("left", (d3.event.pageX - 120) + "px")
				.style("top", (d3.event.pageY - 65) + "px")
			})
			.on("click", function(d) {
				updateConfig(+d.configFile);
			});

		}
		smallMultiples.append("rect")
		.data([i])
		.attr("id", "sm"+i)
		.attr("class", "box")
		.attr("width", smWidth)
		.attr("height", smHeight)
		.attr("x", c)
		.attr("y", b)
		.attr("stroke", "#000")
		.attr("stroke-width", "1px")
		.attr("fill", "none");


		smallMultiples.append("text")
		.attr("class", "sm")
		.attr("x", c + 5)
		.attr("y", b + 12)
		.text(configurations.files[i])

		smallMultiples.append("line")
		.attr("class", "headerLine")
		.attr("x1", c)
		.attr("y1", b + 14)
		.attr("x2", c + smWidth)
		.attr("y2", b + 14)
		.attr("stroke", "#222");

		smallMultiples.append("circle")
		.attr("class", "indicatorDot")
		.attr("id", "smI"+i)
		.attr("cx", c + 3*smWidth/4)
		.attr("cy", b + 7)
		.attr("r", 5)
		.attr("fill", "#2d2")
		.attr("visibility", "hidden");

	}
}


function updateMultiples() {



	smallMultiples.selectAll("rect").remove();
	// for each file
	for (var i = 0; i < configurations.files.length; i++) {

		var d = Math.floor(overviewWidth/smWidth);
		var a = Math.floor((i * smWidth) / (overviewWidth - 20));
		var b = a * smHeight + (1 * a);
		var c = ((i * smWidth) % (overviewWidth-20)) + (1 * (i%d));
		


		var nodes = d3.selectAll(".node")[0];
		var yPos = [0, 0, 0, 0, 0];
		// for each router (there's 218 of them)
		for (var j = 0; j < nodes.length; j++) {
			var group = nodes[j].__data__.group;
			var g = group - 1;
			yPos[g] += 1;
			var n = nodes[j].__data__.name;

			if (routerData[configurations.files[i]][injectionRate] === undefined) {
				var f = "#ccc"
			}
			else {
				var o = routerData[configurations.files[i]][injectionRate][n-1].Occ;
				var f = occupancyScale(o)
			}
			
			var w = (smWidth/yPos.length) -1;
			var h = smHeight/configurations.groupSize[g];
			var x = c + (g)*(smWidth/configurations.groupSize.length);
			var y = 4+(b + 14) + (yPos[g])*((smHeight-20)/configurations.groupSize[g]) - h;

			smallMultiples.append("rect")
			.data([{"configFile":i, "id": j}])
			.attr("class", "heatmap")
			.attr("x", x)
			.attr("y", y)
			.attr("width", w)
			.attr("stroke", "#fff")
			.attr("height", h)
			.attr("fill", f)
			.on("mouseover", function(d) {drawOverviewTooltip(+d.id, +d.configFile)})
			.on("mouseout", function(d) {
				overviewTooltip.style("opacity", 0);
				d3.selectAll("#indicator").remove();
			})
			.on("mousemove", function(d) {
				overviewTooltip.style("left", (d3.event.pageX - 120) + "px")
				.style("top", (d3.event.pageY - 65) + "px")
			})
			.on("click", function(d) {
				updateConfig(+d.configFile);
			});
		}
		smallMultiples.append("rect")
		// .data([i])
		.attr("id", "sm"+i)
		.attr("class", "box")
		.attr("width", smWidth)
		.attr("height", smHeight)
		.attr("x", c)
		.attr("y", b)
		.attr("stroke", "#222")
		.attr("stroke-width", "1px")
		.attr("fill", "none");

	}
	updateFileSelector(configIndex);
}


function updateFileSelector(config) {
	d3.selectAll(".box").attr("stroke", "#222");
	d3.select("#sm"+config).attr("stroke", "#2d2");
	d3.selectAll(".indicatorDot").attr("visibility", "hidden");
	d3.select("#smI"+config).attr("visibility", "visible");
}


function drawOverviewTooltip(id, config) {
	if (configurations.files[config] !== currentConfig) {
		return;
	}
	if (routerData[configurations.files[config]][injectionRate] !== undefined) {
		// console.log(d.name);
		var up = -1;
		var down = -1;
		var occ = "..."

		up = routerData[configurations.files[config]][injectionRate][id].Up;
		down = routerData[configurations.files[config]][injectionRate][id].Down;
		occ = routerData[configurations.files[config]][injectionRate][id].Occ;
		// console.log(occ)
		displayID = id;
		displayID++;

		overviewTooltip.style("opacity", 0.9)
		// .text("router " + d.name + " up: " + up + " down: " + down)
		.style("left", (d3.event.pageX - 220) + "px")     
		.style("top", (d3.event.pageY - 65) + "px");

		overviewTooltip.select("#tooltipL1")
		.text("router:  " + displayID);
		overviewTooltip.select("#tooltipL2")
		.text("up:  " + up);
		overviewTooltip.select("#tooltipL3")
		.text("down:  " + down)
		overviewTooltip.select("#tooltipL4")
		.text("Occupancy: " + occ);

	}
	else 
	{
		overviewTooltip.style("opacity", 0.9)
		.style("left", (d3.event.pageX - 220) + "px")     
		.style("top", (d3.event.pageY - 65) + "px");

		overviewTooltip.select("#tooltipL1")
		.text("router:  " + displayID);
		overviewTooltip.select("#tooltipL2")
		.text("no data for this injection rate");
		overviewTooltip.select("#tooltipL3")
		.text(" ")
		overviewTooltip.select("#tooltipL4")
		.text(" ");
	}


	// add indicator to node
	nodes = d3.selectAll(".node")[0];

	targetNode = d3.select(nodes[id]);

	svg.append("rect")
	.attr("id", "indicator")
	.attr("width", 28)
	.attr("height", 28)
	// hackey way to get x and y from the node
	.attr("x", targetNode[0][0].cx.baseVal.value - 14)
	.attr("y", targetNode[0][0].cy.baseVal.value - 14)
	.attr("stroke", "#0b0")
	.attr("stroke-width", 4)
	.attr("fill", "none")

}


