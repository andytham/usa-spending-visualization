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
		if(children.includes(agency_name)){
			children = agency_name["children"];
			if (children.includes(budget_function)){
				children = budget_function["children"];
				if (children.includes(budget_subfunction)){
					children = budget_subfunction["children"];
					let account = {"name": federal_account_name, "budget": budgetTotal}
					children.push(account)
				} else {
					children.push({"name": budget_subfunction, "children": []});
					children = children["children"]
					let account = {"name": federal_account_name, "budget": budgetTotal}
					children.push(account)
				}
			} else {
				children.push({"name": budget_function, "children": []})
				children = children["children"]
				children.push({"name": budget_subfunction, "children": []});
				children = children["children"]
				let account = {"name": federal_account_name, "budget": budgetTotal}
				children.push(account)
			}
		} else {
			children.push({"name": agency_name, "children": []})
			children = children["children"]
			children.push({"name": budget_function, "children": []})
			children = children["children"]
			children.push({"name": budget_subfunction, "children": []});
			children = children["children"]
			let account = {"name": federal_account_name, "budget": budgetTotal}
			children.push(account)
		}
	}
	console.log(root);
	return root;
}
