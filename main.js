let width = 500;
let height = 500;
let radius = Math.min(width, height) / 2;

d3.text("fed-og.csv", function(text){
	let csv = d3.csvParse(text);
	console.log(csv);

	let json = buildHierarchy(csv);
})

// parse through the CSV and create a JSON hierarchy for d3 to use
function buildHierarchy(csv){
	let root = {"name": "root", "children": []};

	for (let i = 0; i < csv.length; i++){
		let children = root["children"];
		let { agency_name, budget_function, budget_subfunction, federal_account_name } = csv[i]
		let budgetTotal = csv[i].status_of_budgetary_resources_total;
		let index = hasChild(children, agency_name)
		if(index > -1){
			children = children[index]["children"];
			index = hasChild(children, budget_function)
			if(index > -1){
				children = children[index]["children"];
				index = hasChild(children, budget_subfunction);
				if(index > -1){
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
			} else {
			}
		}
		console.log("Life is a lie");
		return -1
	}

	function pushChild(parent, child, budgetTotal){
		let i = child.length;
		if(i == 4){
			parent.push({"name": child[0], "children": []})
			parent = parent[parent.length - 1]["children"]
			parent.push({"name": child[1], "children": []})
			parent = parent[parent.length - 1]["children"]
			parent.push({"name": child[2], "children": []})
			parent = parent[parent.length - 1]["children"]
			parent.push({"name": child[3], "budget": budgetTotal})
		}
		if(i == 3){
			parent = parent[parent.length - 1]["children"]
			parent.push({"name": child[1], "children": []})
			parent = parent[parent.length - 1]["children"]
			parent.push({"name": child[2], "children": []})
			parent = parent[parent.length - 1]["children"]
			parent.push({"name": child[3], "budget": budgetTotal})
		}
		if (i == 2){
			parent = parent[parent.length - 1]["children"]
			parent.push({"name": child[2], "children": []})
			parent = parent[parent.length - 1]["children"]
			parent.push({"name": child[3], "budget": budgetTotal})
		}
		if (i == 1){
			parent.push({"name": child[3], "budget": budgetTotal})
		}
	}
	console.log(JSON.stringify(root));
	return root;
}
