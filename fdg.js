var eSvg = d3.select("svg"),
	dWidth = +svg.attr("width"),
	dHeight = +svg.attr("height)

var tData = ??? // TODO read in data

// TODO menus for user-selecting what fields
// TODO set up links based on same field values

// Now the SVG part
// draw nodes
var eNodes = svg.append("g")
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
var eLink = svg.append("g")
	.attr("class", "links")
	.selectAll("line")
	.data(aLinks)

// adding
eLink.enter().append("line")

// removing
eLink.exit().remove()

var simulation = d3.forceSimulation().nodes(data)

// add forces
simulation
	.force("fCharge", d3.forceManyBody())
	.force("fCenter", d3.forceCenter(dWidth/2, dHeight/2))

// TODO x and y forces for field-based positioning

function onTick() {
	// copy position updates from simnode to svg element
	eNodes
		.attr("cx", function(d) {return d.x})
		.attr("cy", function(d) {return d.y})

	// and the same for links
	eLinks
		.attr("x1", function(d) {return d.source.x})
		.attr("y1", function(d) {return d.source.y})
		.attr("x2", function(d) {return d.target.x})
		.attr("y2", function(d) {return d.target.y})
}
simulation.on("tick", onTick)

// TODO CANDY automatic cluster labels?
