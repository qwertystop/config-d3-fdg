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

let ynsScale = makeIntScale('No','Slightly/Special','Yes')

let dIntScales = {// for each column, specify a function from value to number in [0,1]
	"Year of release": d => {return ((d - 1980) / (2018 - 1980))},
	"Primarily vertical or horizontal": makeIntScale('Vertical','Mixed','Horizontal'),
	"Backtracking": ynsScale,
	"Physical structure": makeIntScale('Linear','Mixed','Open'),
	"Jump combat": ynsScale,
	"Melee combat": ynsScale,
	"Ranged combat": ynsScale,
	"2D/3D": makeIntScale('2', '3'),
	"Character progression": ynsScale,
	"Collectables": ynsScale,
	"Power-up": ynsScale,
	"Multiple jump types": ynsScale,
	"Swimming": ynsScale,
	"Air control": makeIntScale('None','Weak','Strong'),
	"Airjump": ynsScale,
	"Walljump": ynsScale,
	"Leeway for Errors": makeIntScale('Little','Lots','Health'),
	"Multiplayer": makeIntScale('No','Co-op','Competitive'),
	"Story": makeIntScale('No','Cue','Yes'),
}

// less typing for up to ten colors
function makeColScale() {return d3.scaleOrdinal(d3.schemeCategory10)}

let dColScales = {// for each column, specify a function from value to color
	"Year of release": d => {return d3.interpolatePlasma(dIntScales['Year of release'](d))},
	"Primarily vertical or horizontal": makeColScale(),
	"Backtracking": makeColScale(),
	"Physical structure": makeColScale(),
	"Jump combat": makeColScale(),
	"Melee combat": makeColScale(),
	"Ranged combat": makeColScale(),
	"2D/3D": makeColScale(),
	"Character progression": makeColScale(),
	"Collectables": makeColScale(),
	"Power-up": makeColScale(),
	"Multiple jump types": makeColScale(),
	"Swimming": makeColScale(),
	"Air control": makeColScale(),
	"Airjump": makeColScale(),
	"Walljump": makeColScale(),
	"Leeway for Errors": makeColScale(),
	"Multiplayer": makeColScale(),
	"Story": makeColScale(),
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

function onNodeClick(data) {
	let pairs = d3.entries(data)
		.filter(item => {
			return ['x','y','vx','vy','i','index'].indexOf(item.key) === -1})
	let dl = d3.select("div.nodeinfo")
		.select('dl')
		.html(new Array(pairs.length + 1).join("<dt><dd/>"))
	let dt = dl.selectAll('dt').append('strong').data(pairs).html(d=>{return d.key+':'})
	let dd = dl.selectAll('dd').data(pairs).html(d=>{return d.value})
	}

// node setup
function nodeSetup(tData) {
	let eNodes = eSvg.append("g")
		.attr("class", "nodes")
		.selectAll("circle")
		.data(tData)
		.enter()
		.append("circle")
		.attr("r", 8)
		.attr("fill", "black")
		.on("click", d => {onNodeClick(d)})

	d3.select("div.nodeinfo")
		.append("dl")

	eNodes.append("svg:title")
		.text(d => { return d.Name })
	// TODO click for details-in-sidebar
	return eNodes }

// calculate links
function calcLinks(key) {
	let data = eSvg.select('g.nodes').selectAll('circle').data()
	// for each node
	let bunched = data.map((n, i, arr) => {
		// only compare to things not yet covered
		let after = arr.slice(i+1)
		// match to each other node with the same value
		// in the field used for linking
		let matching = after.filter(o => { return o[key] === n[key]})
		// and produce link objects
		return matching.map(o => { return {"source": n, "target": o}})})
	// finally, flatten it
	return [].concat(...bunched)}

function defConfiggers(sim) {
	eLinkConf.onchange = function() {
		let key = this.value
		if (key === "---") {
			sim.force("fLink", null)}
		else {
			let aLinks = calcLinks(this.value)
			sim.force("fLink", d3.forceLink(aLinks))}
		sim.alpha(1)
		sim.restart()}

	eColorConf.onchange = function() {
		let eNodes = eSvg.select('g.nodes').selectAll('circle')
		let key = this.value
		if (key === "---") {
			eNodes.transition().attr("fill", "black")}
		else {
			let mapper = dColScales[key]
			eNodes.transition().attr("fill", d => {
				return mapper(d[key])})}}

	eXConf.onchange = function() {
		let key = this.value
		if (key === "---") {
			sim.force("fX", null)
		} else {
			let mapper = dIntScales[key]
			sim.force("fX", d3.forceX(d => {
				return mapper(d[key]) * dWidth }))}
		sim.alpha(1)
		sim.restart()}

	eYConf.onchange = function() {
		let key = this.value
		if (key === "---") {
			sim.force("fY", null)
		} else {
			let mapper = dIntScales[key]
			sim.force("fY", d3.forceY(d => {
				return mapper(d[key]) * dHeight }))}
		sim.alpha(1)
		sim.restart()}

	// reset-to-center button
	// doesn't add any forces, so it just jumbles
	eConfig.elements['reset'].onclick = function() {
		eSvg.select('g.nodes')
			.selectAll('circle')
			.data()
			.forEach(n => {n.x = 0; n.y = 0})
		sim.alpha(1)
		sim.restart()}

	// configurable link strength
	eConfig.elements['link-str'].onclick = function() {
		let dist = this.max - this.value
		let linker = sim.force("fLink")
		if (linker) {
			linker.distance(dist)
			sim.alpha(1)
			sim.restart()}}}


// load data and run page
d3.csv("data.csv", (error, tData) => {
	if (error) throw error

	// Now the SVG part
	let eNodes = nodeSetup(tData)

	// make the simulation
	let simulation = d3.forceSimulation().nodes(tData)

	// non-configured forces
	simulation.force("fCharge", d3.forceManyBody().distanceMax(80))
		.force("fCollide", d3.fCollide)
		.force("fCenter", d3.forceCenter(dWidth/2, dHeight/2))

	// set up onchange for selection boxes
	defConfiggers(simulation)

	// reset-to-center button
	// doesn't add any forces, so it just jumbles
	eConfig.elements['reset'].onclick = function() {
		eSvg.select('g.nodes')
			.selectAll('circle')
			.data()
			.forEach(n => {n.x = 0; n.y = 0})
		simulation.alpha(1)
		simulation.restart()}

	function onTick() {
		// copy position updates from simnode to svg element
		// but bound
		eNodes.attr("cx", d => {return mid(8, dWidth-8, d.x)})
			.attr("cy", d => {return mid(8, dHeight-8, d.y)})}

	simulation.on("tick", onTick)
})
