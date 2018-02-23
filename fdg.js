'use strict';
// DOM references and other script-globals
let eSvg = d3.select("svg"),
	dWidth = +eSvg.attr("width"),
	dHeight = +eSvg.attr("height")

let eConfig = document.getElementById("config")
let eLinkConf = eConfig.elements['link-sel']
let eColorConf = eConfig.elements['color-sel']
let eXConf = eConfig.elements['x-sel']
let eYConf = eConfig.elements['y-sel']

function makeIntScale(...items) {
	let max = items.length + 1
	let lookup = {}
	let mapped = items.forEach((a, i) => {lookup[a] = (i+1)/max})
	return a=>{return lookup[a]}}

let dIntScales = {// for each column, specify a function from value to number in [0,1]
	// TODO data-specific
}

// less typing for up to ten colors
function makeColScale(count) {return d3.scaleOrdinal(d3.schemeCategory10[count])}

let dColScales = {// for each column, specify a function from value to color
	// TODO
}

// set up contents of dropdowns
d3.select("#config").selectAll("select")
	.selectAll("option")
	.data(["---"].concat(Object.keys(dIntScales)))
	.enter()
	.append("option")
	.attr("value", d => {return d})
	.text(d => {return d})

function mid(lo, hi, un) {
	return Math.max(lo, Math.min(un, hi)) }

// node setup
function nodeSetup() {
	let eNodes = eSvg.append("g")
		.attr("class", "nodes")
		.selectAll("circle")
		.data(tData)
		.enter()
		.append("circle")
		.attr("r", 5)
		.attr("fill", d => {
			return dColScales[eColorConf.value](d[eColorConf.value])})
	// TODO hover labelling
	// TODO click for details-in-sidebar

	return eNodes }

// calculate links
function calcLinks(key, eNodes) {
	// for each node
	let bunched = eNodes.nodes().map((n, i, arr) => {
		// only compare to things not yet covered
		arr.slice(i+1)
		// match to each other node with the same value
		// in the field used for linking
			.filter(o => { return o[key] === n[key]})
		// and produce link objects
			.map(o => { return {"source": n, "target": o}})})
	// finally, flatten it
	return [].concat(...bunched)}

function defOnchanges(eNodes, eLinks, sim) {
	eLinkConf.onChange = () => {
		let key = this.value
		if (key === "---") {
			sim.force("fLink", null)
			eLinks.data([]).exit().remove()}
		else {
			let aLinks = calcLinks(this.value, eNodes)
			sim.force("fLink", d3.forceLink(aLinks))
			eLinks.data(aLinks).enter().append("line")}
		sim.alpha(1)
		sim.restart()}

	eColorConf.onchange = () => {
		let key = this.value
		if (key === "---") {
			eNodes.transition().attr("fill", "black")}
		else {
			let mapper = dColScales[key]
			eNodes.transition().attr("fill", d => {
				return mapper(d[key])})}}

	eXConf.onChange = () => {
		let key = this.value
		if (key === "---") {
			sim.force("fX", null)
		} else {
			let mapper = dIntScales[key]
			sim.force("fX", d3.forceX((d) => {
				mapper(d[key]) * dWidth }))}
		}
		sim.alpha(1)
		sim.restart()}

	eYConf.onChange = () => {
		let key = this.value
		if (key === "---") {
			sim.force("fY", null)
		} else {
			let mapper = dIntScales[key]
			sim.force("fY", d3.forceX((d) => {
				mapper(d[key]) * dHeight }))}
		}
		sim.alpha(1)
		sim.restart()} }

// load data and run page
d3.csv("data.csv", (error, tData) => {
	if (error) throw error

	// Now the SVG part
	let eNodes = nodeSetup()

	// deletion
	eNodes.exit().remove()

	// draw links
	let eLinks = eSvg.append("g")
		.attr("class", "links")
		.selectAll("line")
		.enter().append("line")
	// removing
	eLink.exit().remove()
	// data will be added in dropdown onchange

	// make the simulation
	let simulation = d3.forceSimulation().nodes(tData)

	// non-configured forces
	simulation.force("fCharge", d3.forceManyBody())
		.force("fCenter", d3.forceCenter(dWidth/2, dHeight/2))

	// set up onchange for selection boxes
	defOnchanges(eNodes, eLinks, simulation)

	function onTick() {
		// copy position updates from simnode to svg element
		// but bound
		eNodes.attr("cx", d => {return mid(0, dWidth, d.x)})
			.attr("cy", d => {return mid(0, dHeight, d.y)})

		// and the same for links
		eLinks.attr("x1", d => {return d.source.x})
			.attr("y1", d => {return d.source.y})
			.attr("x2", d => {return d.target.x})
			.attr("y2", d => {return d.target.y})}

	simulation.on("tick", onTick)
})
