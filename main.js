let width = 500;
let height = 500;
let radius = Math.min(width, height) / 2;

d3.text("fed-og.csv", function(text){
	let csv = d3.csvParse(text);
	console.log(csv);

	// let json = buildHierarchy(csv);
})

// parse through the CSV and create a JSON hierarchy for d3 to use
function buildHierarchy(csv){
	let root = {"name": "root", "children": []};
	for (let i = 0; i < csv.length; i++){
		console.log(csv[i][1]);

	}
}
