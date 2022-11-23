const BASE_URL = "http://127.0.0.1:8000/api";

// Helper functions
const addElement = (tagName, parent, textContent = "", classConditions = [], id = "") => {
	const element = document.createElement(tagName);
	element.textContent = textContent;

	classConditions.forEach(
		([condition, className]) => {
			if (condition) {
				element.classList.add(className);
			}
		}
	)

	if (id) {
		element.id = id;
	}

	parent.appendChild(element);

	return element;
};

const addTextNode = (parent, data, id = "") => {
	const textNode = document.createTextNode(data);

	if (id) {
		textNode.id = id;
	}

	parent.appendChild(textNode);

	return textNode;
};

// Request functions
const getResponseBody = async (urlPath, method = "GET", body = null) => {
	const requestBody = {
		method: method,
		headers: {
			"Content-Type": "application/json",
			"Accept": "application/json"
		},
		body: body ? JSON.stringify(body) : null
	};
	console.log(requestBody);

	const response = await fetch(
		`${BASE_URL}${urlPath}/`, requestBody
	).catch(error => console.log(error));

	const items = await response.json();
	console.log(method, urlPath, items);

	return items;
}

// Frontend display functions
const showItem = () => {
	const handleEventListener = input => {
		const onSave = async () => {
			const field = input.id;
			const textContent = input.textContent;
			const index = items.findIndex(item => item.id === itemId);

			if (textContent !== items[index][field]) {
				const urlPath = `/products/${itemId}`;
				const body = {};
				body[field] = textContent;
				const x = await getResponseBody(urlPath, "PATCH", body);
				console.log(x);

				items[index][field] = textContent;

				const cell = document.getElementById(`${field}-${itemId}`);
				cell.textContent = textContent || "empty";

				if (textContent) {
					cell.classList.remove("empty");
				} else {
					cell.classList.add("empty");
				}
			}
		}

		const onBlur = () => {
			console.log(input.id, "blur");

			// Remove text highlight
			window.getSelection().removeAllRanges();

			// Preprocess required inputs
			if (itemConfig.nameFields.includes(input.id) && !input.textContent) {
				input.textContent = lastValue;
			}

			// Preprocess numeric input
			if (input.classList.contains("numeric") || input.classList.contains("currency")) {
				const value = parseFloat(input.textContent) || 0;
				input.textContent = value.toFixed(2);
			}

			// Preprocess select input
			if (input.classList.contains("option-box")) {
				input.textContent = "";

				const selectBox = input.parentElement;
				selectBox.classList.remove("focus");

				const optionContainer = selectBox.getElementsByClassName("option-container")[0];
				const option = optionContainer.firstChild;
				const classConditions = [[true, "option"]];
				addElement("div", input, option.textContent, classConditions, input.id);
				input.classList.remove("large-font");
			}

			onSave(input.id).then();

			input.addEventListener("mousedown", onMouseDown, {once: true});
		}

		const onInput = () => {
			const commonCount = (string, keyword) => {
				const chars = string.split("");
				let commonCount = 0;

				for (let keyChar of keyword) {
					const index = chars.indexOf(keyChar);

					if (index > -1) {
						commonCount++;
						chars.splice(index, 1);
					}
				}

				return commonCount / keyword.length;
			}

			const similarityScores = (string, keyword) => {
				string = string.toLowerCase();
				keyword = keyword.toLowerCase();

				const scores = [];
				scores[0] = string === keyword ? 1
					: keyword.startsWith(string) ? 0.75
					: keyword.endsWith(string) ? 0.5
					: keyword.includes(string) ? 0.25
					: 0;

				if (scores[0] !== 1) {
					scores[1] = scores[0]
						? -string.length
						: commonCount(string, keyword);
				}

				return scores;
			}

			if (input.classList.contains("option-box")) {
				console.log(input.id, "input");

				const sortFunction = (a, b) => {
					const scoresA = choicesSimilarities[a];
					const scoresB = choicesSimilarities[b];

					return scoresA[0] !== scoresB[0]
						? scoresB[0] - scoresA[0]
						: scoresB[1] - scoresA[1];
				}

				const inputFieldChoices = fieldChoices[input.id];
				const choicesSimilarities = inputFieldChoices.reduce(
					(obj, choice) => {
						obj[choice] = similarityScores(input.textContent, choice)
						return obj;
					},
					{}
				);

				inputFieldChoices.sort(sortFunction);

				const selectBox = input.parentElement;
				const optionContainer = selectBox.getElementsByClassName("option-container")[0];
				optionContainer.textContent = "";

				inputFieldChoices.forEach(
					fieldChoice => addOptionBox(fieldChoice, optionContainer)
				)
			}
		}

		const onFocus = () => {
			console.log(input.id, "focus");
			input.classList.remove("active");
			lastValue = input.textContent;

			if (input.classList.contains("option-box")) {
				input.classList.add("large-font");
				input.parentElement.classList.add("focus");

				const option = input.getElementsByClassName("option")[0];
				input.textContent = option.textContent;
			}

			// Highlight input text
			const range = document.createRange();
			range.selectNodeContents(input);
			window.getSelection().removeAllRanges();
			window.getSelection().addRange(range);

			input.removeEventListener("mouseout", onMouseOut, {once: true});
			input.addEventListener("blur", onBlur, {once: true});
		}

		const onMouseOut = () => {
			console.log(input.id, "out");
			input.classList.remove("active");
			input.blur();

			input.removeEventListener("mouseup", onFocus, {once: true});
			input.addEventListener("mousedown", onMouseDown, {once: true});
		}

		const onMouseDown = () => {
			console.log(input.id, "down");
			input.classList.add("active");

			input.addEventListener("mouseout", onMouseOut, {once: true});
			input.addEventListener("mouseup", onFocus, {once: true});
		}

		const onPaste = e => {
			e.preventDefault();
			const text = e.clipboardData.getData("text/plain");
			document.execCommand("insertText", false, text);
		}

		let lastValue = "";
		input.addEventListener("mousedown", onMouseDown, {once: true});
		input.onfocus = () => {
			if (!input.classList.contains("active")) {
				onFocus();
			}
		}
		input.onkeydown = e => {
			if (e.key === "Enter") {
				input.blur();
			}
		}
		input.onpaste = onPaste;
		input.oninput = onInput;
	}

	const addOptionBox = (fieldChoice, optionContainer) => {
		let classConditions = [[true, "option-box"]];
		const optionBox = addElement("div", optionContainer, "", classConditions);
		optionBox.onmousedown = () => {
			const selectBox = optionContainer.parentElement;
			const input = selectBox.getElementsByClassName("input")[0];
			const option = optionBox.getElementsByClassName("option")[0];
			input.textContent = option.textContent;
			input.oninput();
			input.blur();
		}

		classConditions = [[true, "option"]];
		addElement("div", optionBox, fieldChoice, classConditions);
	}

	const addInput = (key, field, fieldArea, isSelectInput) => {
		let classConditions = [[isSelectInput, "select-box"]];
		const parent = isSelectInput
			? addElement("div", fieldArea, "", classConditions)
			: fieldArea;
		classConditions = [
			[true, "input"],
			[!isSelectInput || item[field] === "", "large-font"],
			[isSelectInput, "option-box"],
			[itemConfig.numericFields.includes(key), "numeric"],
			[itemConfig.currencyFields.includes(key), "currency"],
			[!itemConfig.hiddenFields.includes(key), "editable"]
		];
		const textContent = isSelectInput ? "" : item[field];
		const input = addElement("div", parent, textContent, classConditions, field);
		input.setAttribute("placeholder", itemConfig.placeholders[field]);
		handleEventListener(input);

		if (isSelectInput) {
			if (item[field] !== "") {
				addElement("div", input, item[field], [[true, "option"]]);
			}

			const classConditions = [[true, "option-container"]];
			const optionContainer = addElement("div", parent, "", classConditions);

			fieldChoices[field].forEach(
				fieldChoice => addOptionBox(fieldChoice, optionContainer)
			)
		}

		return input;
	}

	const itemConfig = pageConfig.itemConfig;
	const fieldChoices = pageConfig.fieldChoices;

	const item = items.find(item => item.id === Number(itemId));
	section2Header.textContent = "";
	inputContainer.textContent = "";

	itemConfig.nameFields.forEach(
		(field) => {
			const classConditions = [
				[true, "input"],
				[true, "required"],
				[!itemConfig.hiddenFields.includes(field), "editable"]
			];
			const input = addElement("div", section2Header, item[field], classConditions, field);
			input.setAttribute("placeholder", itemConfig.placeholders[field]);
			handleEventListener(input);
		}
	)

	Object.entries(itemConfig.fieldMapping).forEach(
		([key, fields]) => {
			const classConditions = [
				[itemConfig.hiddenFields.includes(key), "hidden"]
			];
			const fieldArea = addElement("div", inputContainer, "", classConditions);
			addElement("label", fieldArea, key + ":");

			fields.forEach(
				field => addInput(key, field, fieldArea, fieldChoices[field])
			)
		}
	)

	section2.classList.remove("zero-opacity");
}

const hideItem = () => {
	section2.classList.add("zero-opacity");
}

const showItemTable = async () => {
	const onClickRow = row => {
		const cells = mainTable.querySelectorAll("th:not(.important), td:not(.important)");

		if (!itemId || Number(row.id) !== itemId) {
			// Deselect previously selected row and select the row
			const activeRow = mainTable.querySelector("tr.active");

			if (activeRow) {
				activeRow.classList.remove("active");
			}

			row.classList.add("active");
			itemId = Number(row.id);

			// Compress the table
			cells.forEach(
				cell => cell.classList.add("zero-width")
			);

			showItem();
		} else {
			// Deselect the row
			row.classList.remove("active");
			itemId = 0;

			// Expand the table
			cells.forEach(
				cell => cell.classList.remove("zero-width")
			);

			hideItem();
		}
	}

	const addHeaderRow = () => {
		const row = addElement("tr", mainTable);

		for (let field in itemTableConfig.fieldsMapping) {
			const classConditions = [
				[itemTableConfig.importantFields.includes(field), "important"]
			];
			addElement("th", row, field, classConditions);
		}

		addElement("th", row);
	}

	const addRow = item => {
		const row = addElement("tr", mainTable, "", [], item.id);
		row.onclick = () => onClickRow(row);

		Object.entries(itemTableConfig.fieldsMapping).forEach(
			([key, fields]) => {
				const classConditions = [
					[itemTableConfig.importantFields.includes(key), "important"]
				];
				const cell = addElement("td", row, "", classConditions);

				fields.forEach(
					field => {
						// add element to classConditions
						const classConditions = [
							[itemTableConfig.numericFields.includes(key), "numeric"],
							[itemTableConfig.currencyFields.includes(key), "currency"],
							[!item[field], "empty"]
						];
						const textContent = item[field] || "empty";
						addElement("span", cell, textContent, classConditions, `${field}-${item.id}`);
					}
				)
			}
		);

		addElement("td", row);
	}

	const onClickAddItem = async () => {
		const body = pageConfig.itemConfig.nameFields.reduce(
			(body, field) => {
				body[field] = pageConfig.itemConfig.placeholders[field];
				return body;
			},
			{}
		);
		const numericFields = pageConfig.itemConfig.numericFields.concat(
			pageConfig.itemConfig.currencyFields
		);
		numericFields.reduce(
			(body, key) => {
				pageConfig.itemConfig.fieldMapping[key].forEach(
					field => body[field] = 0
				);

				return body;
			},
			body
		)

		const urlPath = `/products`;
		const item = await getResponseBody(urlPath, "POST", body);
		console.log(item);

		items.push(item);

		addRow(item);
		onClickRow(document.getElementById(item.id));
	}

	pageConfig = pageConfigs.find(
		pageConfig => pageConfig.itemName === itemName
	);
	const itemTableConfig = pageConfig.itemTableConfig;

	items = await getResponseBody(itemTableConfig.urlPath);

	// TODO: Sort items by type, meat, index

	document.getElementById("item").textContent = `${itemName} Table`;
	addHeaderRow();
	items.forEach(addRow);

	addItemButton.onclick = onClickAddItem;
}

// HTML Elements
const switchModeButton = document.getElementById("switch-mode");
const section1 = document.getElementById("section-1");
const mainTable = document.getElementById("main-table");
const addItemButton = document.getElementById("add-item-button");
const section2 = document.getElementById("section-2");
const section2Header = document.getElementById("item-name");
const inputContainer = document.getElementById("input-container");

// Configurations
const pageConfigs = [
	{
		itemName: "Product",
		itemTableConfig: {
			urlPath: "/products",
			fieldsMapping: {
				"ID": ["id"],
				"Name": ["name", "chinese_name"],
				"Full Name": ["full_name", "chinese_full_name"],
				"Price": ["price"],
				"Type": ["type"],
				"Meat": ["meat"],
			},
			importantFields: ["ID", "Name", "Price"],
			numericFields: [],
			currencyFields: ["Price"]
		},
		itemConfig: {
			nameFields: ["name", "chinese_name"],
			fieldMapping: {
				"ID": ["id"],
				"Full Name": ["full_name", "chinese_full_name"],
				"Price": ["price"],
				"Type": ["type"],
				"Meat": ["meat"],
			},
			placeholders: {
				"name": "Name",
				"chinese_name": "Chinese Name",
				"full_name": "Full Name",
				"chinese_full_name": "Chinese Full Name",
				"price": "Price",
				"type": "Type",
				"meat": "Meat"
			},
			hiddenFields: ["ID"],
			numericFields: [],
			currencyFields: ["Price"]
		},
		fieldChoices: {
			type: ['Warm', 'Frozen', 'Ingredient'],
			meat: ['Duck', 'Chicken', 'Pork', 'Egg', 'Meatless']
		}
	}
]

// Variables of state
let itemName = "";
let pageConfig = {};

let items = [];
let itemId = 0;

// Main program
itemName = "Product";
showItemTable().catch(console.error);

document.onkeydown = e => {
	if (e.ctrlKey && e.key === 's') {
		e.preventDefault();
		const focusedElement = document.activeElement;

		if (itemId && focusedElement.classList.contains("editable")) {
			focusedElement.blur();
			focusedElement.focus();
		}
	}
}
switchModeButton.onclick = () => {
	const root = document.querySelector(':root');
	root.classList.toggle('dark');
	switchModeButton.className = root.classList.contains('dark')
		? "fa fa-moon-o"
		: "fa fa-sun-o";
	console.log(switchModeButton.className);
}

// https://youtu.be/c708Nf0cHrs?t=22434
