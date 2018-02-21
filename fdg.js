'use strict';
// DOM references and other script-globals
let eSvg = d3.select("svg"),
	dWidth = +svg.attr("width"),
	dHeight = +svg.attr("height)

let eConfig = document.getElementById("config")
let eLinkConf = eConfig.elements['link-sel']
let eColorConf = eConfig.elements['color-sel']
let eXConf = eConfig.elements['x-sel']
let eYConf = eConfig.elements['y-sel']

let dRanges = {// for each column, specify a min and max
	// TODO
}

let dMappings = {// for each column, specify a function mapping value to a number
	// TODO
}

let tData = d3.csv("data.csv", function(error, data) {
	if error {throw error}
	data.forEach(function(d) {
		??? // TODO any input-specific processing here
	})})

// TODO set up links based on same field values

// Now the SVG part
// draw nodes
let eNodes = svg.append("g")
	.attr("class", "nodes")
	.selectAll("circle")
	.data(tData)
	.attr("r", 5) // TODO dynamic size
	.attr("fill", "red") // TODO dynamic color

// TODO hover labelling
// TODO click-for-details in sidebar

// new node drawing
eNodes.enter().append("circle")

// deletion
eNodes.exit().remove()

// draw links
let eLink = svg.append("g")
	.attr("class", "links")
	.selectAll("line")
	.data(aLinks)

// adding
eLink.enter().append("line")

// removing
eLink.exit().remove()

let simulation = d3.forceSimulation().nodes(tData)

// add forces
function mid(lo, hi, un) {
	return Math.max(lo, Math.min(un, hi))
}

simulation
	.force("fCharge", d3.forceManyBody())
	.force("fCenter", d3.forceCenter(dWidth/2, dHeight/2))

// TODO x and y forces for field-based positioning


function onTick() {
	// copy position updates from simnode to svg element
	// but bound
	eNodes
		.attr("cx", d => {return mid(0, dWidth, d.x)})
		.attr("cy", d => {return mid(0, dHeight, d.y)})

	// and the same for links
	eLinks
		.attr("x1", d => {return d.source.x})
		.attr("y1", d => {return d.source.y})
		.attr("x2", d => {return d.target.x})
		.attr("y2", d => {return d.target.y})
}
simulation.on("tick", onTick)

// TODO CANDY automatic cluster labels?
