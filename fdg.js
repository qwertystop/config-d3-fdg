'use strict';
// DOM references and other script-globals
let eSvg = d3.select("svg"),
	dWidth = +svg.attr("width"),
	dHeight = +svg.attr("height")

let eConfig = document.getElementById("config")
let eLinkConf = eConfig.elements['link-sel']
let eColorConf = eConfig.elements['color-sel']
let eXConf = eConfig.elements['x-sel']
let eYConf = eConfig.elements['y-sel']

let dIntScales = {// for each column, specify a function from value to number
	// TODO
}

let dColScales = {// for each column, specify a function from value to color
	// TODO
}

let tData = d3.csvParse("data.csv")

// Now the SVG part
// draw nodes
let eNodes = svg.append("g")
	.attr("class", "nodes")
	.selectAll("circle")
	.data(tData)
	.attr("r", 5)
	.attr("fill", d => {
		return dColScales[eColorConv.value](d[eColorConv.value])})}

eColorConf.onchange = () => {
	eNodes.transition().attr("fill", d => {
		return dColScales[eColorConv.value](d[eColorConv.value])})}

// TODO hover labelling
// TODO click for details-in-sidebar

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


// forces
let simulation = d3.forceSimulation().nodes(tData)

let fX = d3.forceX((node, _index) => {
	return dIntScales[eXConf.value](node[eXConf.value])})

let fX = d3.forceX((node, _index) => {
	return dIntScales[eYConf.value](node[eYConf.value])})

function calcLinks() {
	let sLVal = eLinkConf.value
	// for each node
	let bunched = eNodes.map((n, i, arr) => {
		// only compare to things not yet covered
		arr.slice(i+1)
			// match to each other node with the same value
			// in the field used for linking
			.filter(o => { return o[sLVal] === n[sLVal]})
			// and produce link objects
			.map(o => { return {"source": n, "target": o}})})
	// finally, flatten it
	return [].concat(...bunched)}

let fLink = d3.forceLink(calcLinks())

eLinkConf.onchange = () => {fLink.links(calcLinks())}

simulation
	.force("fCharge", d3.forceManyBody())
	.force("fCenter", d3.forceCenter(dWidth/2, dHeight/2))
	.force("fX", fX).force("fY", fY).force("fLink", fLink)

function mid(lo, hi, un) {
	return Math.max(lo, Math.min(un, hi)) }

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
		.attr("y2", d => {return d.target.y})}

simulation.on("tick", onTick)

// TODO CANDY automatic cluster labels?
