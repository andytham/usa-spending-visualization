let width = 500;
let height = 500;
let radius = Math.min(width, height) / 2;
let year = 2018; // setup to be able to swap years
d3.select("#title")
	.text("How Did the U.S. Spend Its Money? (" + year + ")")
function changeYear(e){
	year = e.target.innerHTML;
	d3.select("#title")
	.text("How Did the U.S. Spend Its Money? (" + year + ")")
	d3.select('#container').select("path").remove();

	d3.text(year + ".csv").then((text) => {
		let csv = d3.csvParse(text);
		let json = buildHierarchy(csv);
		createVisualization(json);
	})
}


let totalSize = 0; 
let visualization = d3.select("#chart").append("svg:svg")
	.attr("width", width)
	.attr("height", height)
	.append("svg:g")
	.attr("id", "container")
	.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

let partition = d3.partition()
	.size([2 * Math.PI, radius * radius]);

let arc = d3.arc()
	.startAngle(function(d){ return d.x0; })
	.endAngle(function(d){ return d.x1; })
	.innerRadius(function(d){ return Math.sqrt(d.y0); })
	.outerRadius(function(d){ return Math.sqrt(d.y1); });


d3.text(year + ".csv").then((text) => {
	let csv = d3.csvParse(text);
	let json = buildHierarchy(csv);
	createVisualization(json);
})




// parse through the CSV and create a JSON hierarchy for d3 to use
// there should be a way to make this cleaner
function buildHierarchy(csv){
	let root = {"name": "root", "children": []};

	for (let i = 0; i < csv.length; i++){
		let children = root["children"];
		let { agency_name, budget_function, budget_subfunction, federal_account_name } = csv[i] || "N/A"
		let budgetTotal = csv[i].status_of_budgetary_resources_total;
		let index = hasChild(children, agency_name)
		if(index != -1){ // has same agency name?
			children = children[index]["children"];
			index = hasChild(children, budget_function)
			if(index != -1){ // has same budget function?
				children = children[index]["children"];
				index = hasChild(children, budget_subfunction);
				if(index != -1){ // has same budget sub function?
					children = children[index]["children"];
					pushChild(children, [federal_account_name], budgetTotal);
				} else {
					pushChild(children, [budget_subfunction, federal_account_name], budgetTotal);
				}
			} else {
				pushChild(children, [budget_function, budget_subfunction, federal_account_name], budgetTotal);
			}
		} else {
			pushChild(children, [agency_name, budget_function, budget_subfunction, federal_account_name], budgetTotal);
		}
		
	}
	function hasChild(children, nameCheck){
		for (let j = 0; j < children.length; j++){
			if(children[j]["name"] == nameCheck){
				return j;
			}
		}
		return -1
	}

	function pushChild(parent, child, budgetTotal){
		let i = child.length;
		if(i == 4){ //agency name
			parent.push({"name": child[0], "children": []})
			parent = parent[parent.length - 1]["children"]
			parent.push({"name": child[1], "children": []})
			parent = parent[parent.length - 1]["children"]
			parent.push({"name": child[2], "children": []})
			parent = parent[parent.length - 1]["children"]
			parent.push({"name": child[3], "spending": budgetTotal})
		}
		if(i == 3){ // budget function
			parent.push({"name": child[0], "children": []})
			parent = parent[parent.length - 1]["children"]
			parent.push({"name": child[1], "children": []})
			parent = parent[parent.length - 1]["children"]
			parent.push({"name": child[2], "spending": budgetTotal})
		}
		if (i == 2){ //budget sub function
			parent.push({"name": child[0], "children": []})
			parent = parent[parent.length - 1]["children"]
			parent.push({"name": child[1], "spending": budgetTotal})
		}
		if (i == 1){
			parent.push({"name": child[0], "spending": budgetTotal})
		}
	}
	// console.log(JSON.stringify(root));
	return root;
}

// create the actual visualization
var root;
function createVisualization(json){
	let sum = d3.hierarchy(json)
	.sum(d => d.spending)

	d3.select("#total")
		.text("Total Money Spent: " + parseNum(sum.value))

	breadcrumbs.initialize();

	// this was interfering with clicking the circle
	// visualization.append("svg:circle")
	// 	.attr("r", radius)
	// 	.style("opacity", 0);

	//hierarchy off the json we created
	root = d3.hierarchy(json)
		.sum(function(d){ return d.spending; }) // use spending as criteria
		.sort(function(a, b){ return b.value - a.value}); //order by descending
	console.log(root);
	let nodes	= partition(root).descendants()
		.filter(function(d) {
			return (d.x1 - d.x0 > 0.001); // radians lower limit?
		});
console.log(nodes);
		// console.log(sum);
	// draws the "blocks"
	//there are 95 children but are too small to see, 30 is about all that is visible
	let colors = {
		"2017": d3.scaleOrdinal(d3.quantize(d3.interpolateHcl("#fafa6e", "#2A4858"), 30)),
		"2018": d3.scaleOrdinal(d3.quantize(d3.interpolateHcl("#bf265b", "#2A4858"), 30))
	}
	let color;
	if (year == "2017"){
		color = d3.scaleOrdinal(d3.quantize(d3.interpolateHcl("#fafa6e", "#2A4858"), 30))
	} else if (year == "2018"){
	
	}
	var path = visualization.data([json]).selectAll("path")
		.data(nodes)
		// .enter().append("svg:path")
		.join("path")
		.attr("display", function(d){ return d.depth ? null : "none"; })
		.attr("d", (d)=>{ return arc(d)})
		// .attr("fill-rule", "evenodd")
		// .style("fill", function(d) { return colors[d.data.name] || color(d); })
		.style("fill", d => { while (d.depth > 1) d = d.parent; return colors[year](d.data.name)})
		.attr("fill-opacity", d => 2.5 / d.depth)
		.style("opacity", 1)
		.on("mouseover", mouseover)
		.on("mouseleave", mouseleave)
		
		path.filter(d => d.children)
		.style("cursor", "pointer")
		.on("click", clicked)
		// .on("click", ()=>{console.log("click");})
		// .on("click", ()=>{console.log("click2");})

		console.log(path);
	totalSize = path.datum().value;
}

function mouseover(d){
	console.log("mousing over");
	// display percentage of total in center
	let percentage = (100 * d.value / totalSize).toPrecision(3);
	let percentageString = percentage + "%"
	let details = {
		name: d.data.name
	}

	d3.select("#percentage")
		.text(percentageString)
	d3.select("#details")
		.text(details.name)
	d3.select("#cash")
		.text(parseNum(d.value))
		
	d3.selectAll("#details, #cash, #percentage")
		.style("visibility", "")
	
	let sequenceArray = d.ancestors().reverse(); // place the data in reverse order in an array
	sequenceArray.shift(); // remove root
	
  breadcrumbs.update(sequenceArray, percentageString);
	// fade all segments
	d3.selectAll("path")
		.style("opacity", 0.5)
	// highlight mouseover segment and it's parent nodes
	visualization.selectAll("path")
		.filter(function(node){
			return (sequenceArray.indexOf(node) >= 0);
		})
		.style("opacity", 1)

}

function mouseleave(d){
	d3.selectAll("path")
		.style("opacity", 1)
	
	d3.selectAll("#details, #cash, #percentage, #trail")
		.style("visibility", "hidden");
	
}

function clicked(p){
// 	let root = d3.hierarchy(d)
// 	.sum(function(d){ return d.spending; }) // use spending as criteria
// 	.sort(function(a, b){ return b.value - a.value}); //order by descending
// // console.log(root);
// console.log(root);
// let nodes	= partition(root).descendants()
// 	.filter(function(d) {
// 		// return (d.x1 - d.x0 > 0.001); // radians lower limit?
// 		return d;
// 	});
// 	console.log(nodes);
	root.each(d => {
		console.log(d)
			return d.target = {
		x0: Math.max(0, Math.min(1, (d.x0 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
		x1: Math.max(0, Math.min(1, (d.x1 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
		y0: Math.max(0, d.y0 - p.depth),
		y1: Math.max(0, d.y1 - p.depth)
	}});
	let path = d3.select("#container").selectAll("path")
	path = d3.select("#container").selectAll("path")
	
	path
	.attr("d", (d)=>{return arc(d)})
	// .attr("d", arc(d))
	.style("fill", "red")
	.attr("fill-opacity",d.y1 <= 3 && d.y0 >= 1 && d.x1 > d.x0)
	// .style("fill", d => { while (d.depth > 1) d = d.parent; return color(d.data.name)})



}
// Breadcrumb dimensions: width, height, spacing, width of tip/tail.
let b = {
  w: 160, h: 30, s: 3, t: 10
};
function parseNum(num){
	//https://stackoverflow.com/questions/149055/how-can-i-format-numbers-as-dollars-currency-string-in-javascript
	let result = num.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
	return "$" + result
}

// wrap long text https://bl.ocks.org/mbostock/7555321
function wrap(text, width){
	text.each(function(){
		let text = d3.select(this),
		words = text.text().split(/\s+/).reverse(),
		word,
		line = [],
		lineNumber = 0,
		lineHeight = 1.1,
		y = text.attr("y"),
		dy = parseFloat(text.attr("dy")),
		tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
		while (word = words.pop()) {
      line.push(word);
      tspan.text(line.join(" "));
      if (tspan.node().getComputedTextLength() > width) {
        line.pop();
        tspan.text(line.join(" "));
        line = [word];
        tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
      }
    }
	})
}

let breadcrumbs = {
initialize: function () {
	// Add the svg area.
	d3.select("#trail").remove()
  var trail = d3.select("#sequence").append("svg:svg")
      // .attr("width", width * 3)
      // .attr("height", 50)
      .attr("id", "trail");
  // Add the label at the end, for the percentage.
  trail.append("svg:text")
    .attr("id", "endlabel")
    .style("fill", "#000");
},

// The points of the polygon surrounding the label
breadcrumbPoints: function(d, i) {
  var points = [];
  points.push("0,0");
  points.push(b.w + ",0");
  points.push(b.w + "," + b.h);
  points.push("0," + b.h);
  return points.join(" ");
},

// Update the breadcrumb trail to show the current sequence and percentage.
update: function(nodeArray, percentageString) {

  // Data join; key function combines name and depth (= position in sequence).
  var trail = d3.select("#trail")
      .selectAll("g")
      .data(nodeArray, function(d) { return d.data.name + d.depth; });

  // Remove exiting nodes.
  trail.exit().remove();

  // Add breadcrumb and label for entering nodes.
  var entering = trail.enter().append("svg:g");
	
  entering.append("svg:polygon")
  //     .attr("points", breadcrumbs.breadcrumbPoints)
			// .style("fill", function(d) { return color(d.data.name)})

  entering.append("svg:text")
			.attr("x", 0)
			.attr("y", b.h / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", "left")
			.text(function(d) { return d.data.name; })

  // How the subsequent nodes will appear
  entering.merge(trail).attr("transform", function(d, i) {
    return "translate(0,"+ i * (b.h) + ")";
  });

	// In case invisible
	let x = d3.scaleBand()
    .rangeRound([0, width], .1, .3);
  d3.select("#trail")
			.style("visibility", "")
			.selectAll("text")
			.call(wrap, x.bandwidth());
	}
}