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

let dIntScales = {// for each column, specify a function from value to number
	// TODO
}

let dColScales = {// for each column, specify a function from value to color
	// TODO
}

// load data
d3.csv("data.csv", (error, tData) => {
	if (error) throw error

	// set up contents of dropdowns
	// TODO include a null
	d3.select("#config").selectAll("select")
		.selectAll("option")
		.data(tData.columns)
		.enter()
		.append("option")
		.attr("value", d => {return d})
		.text(d => {return d})

	// Now the SVG part
	// draw nodes
	let eNodes = eSvg.append("g")
		.attr("class", "nodes")
		.selectAll("circle")
		.data(tData)
		.enter()
		.append("circle")
		.attr("r", 5)
		.attr("fill", d => {
			return dColScales[eColorConf.value](d[eColorConf.value])})

	eColorConf.onchange = () => {
		eNodes.transition().attr("fill", d => {
			return dColScales[eColorConf.value](d[eColorConf.value])})}

	// TODO hover labelling
	// TODO click for details-in-sidebar

	// deletion
	eNodes.exit().remove()

	// calculate links
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

	// draw links
	let eLink = eSvg.append("g")
		.attr("class", "links")
		.selectAll("line")
	// data will be added later

	// adding
	eLink.enter().append("line")

	// removing
	eLink.exit().remove()


	// forces
	let simulation = d3.forceSimulation().nodes(tData)

	let fX = d3.forceX((node, _index) => {
		return dIntScales[eXConf.value](node[eXConf.value])})

	let fY = d3.forceX((node, _index) => {
		return dIntScales[eYConf.value](node[eYConf.value])})

	let fLink = d3.forceLink()

	eLinkConf.onchange = () => {
		let aLinks = calcLinks()
		fLink.links(aLinks)
		eLink.data(aLinks)}

	simulation.force("fCharge", d3.forceManyBody())
		.force("fCenter", d3.forceCenter(dWidth/2, dHeight/2))
		.force("fX", fX).force("fY", fY).force("fLink", fLink)

	function mid(lo, hi, un) {
		return Math.max(lo, Math.min(un, hi)) }

	function onTick() {
		// copy position updates from simnode to svg element
		// but bound
		eNodes.attr("cx", d => {return mid(0, dWidth, d.x)})
			.attr("cy", d => {return mid(0, dHeight, d.y)})

		// and the same for links
		eLink.attr("x1", d => {return d.source.x})
			.attr("y1", d => {return d.source.y})
			.attr("x2", d => {return d.target.x})
			.attr("y2", d => {return d.target.y})}

	simulation.on("tick", onTick)

	// TODO CANDY automatic cluster labels?
})
