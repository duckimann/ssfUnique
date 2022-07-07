require("dotenv").config();

const express = require("express"),
	server = express();
const fet = require("node-fetch"), fetch = (url, body) => fet(url, {timeout: 0, ...body}).then((a) => a.json());

const { GOOGLE_API_KEY } = process.env;

const sheetRequiredKeys = [
	"sheet_id",
	"sheet_no",
	"column_no",
	"min",
	"max",
]
function enforceKeys(obj, enforcingKeys = sheetRequiredKeys) {
	let keys = Object.keys(obj);
	let missingKeys = enforcingKeys.filter((name) => !keys.includes(name));

	if (missingKeys.length) {
		throw new Error(`Missing required key(s): ${JSON.stringify(missingKeys)}`);
	}
	keys.map((name) => {
		if (!enforcingKeys.includes(name)) {
			delete obj[name];
		}
	});

	return obj;
}

// Server setup
server.use(express.static(`${__dirname}/dist`));

// Handle requests
// http://localhost/sheet?sheet_id=1dxFfoCj9X6K145D1MBTbgK2dEsFmZ7nhwNIGrVQjzDA&sheet_no=0&column_no=5&min=0&max=1000
server.get("/sheet", (req, res) => {
	try {
		let hasAllRequiredKeys = enforceKeys(req.query);
		let sheet_no = Number(hasAllRequiredKeys.sheet_no);
		let column_no = Number(hasAllRequiredKeys.column_no);
		let min = Number(hasAllRequiredKeys.min);
		let max = Number(hasAllRequiredKeys.max);
		if (
			isNaN(sheet_no) ||
			isNaN(min) ||
			isNaN(max) ||
			isNaN(column_no)
		) {
			throw new Error();
		}
		console.log(hasAllRequiredKeys);
		fetch(`https://sheets.googleapis.com/v4/spreadsheets/${req.query.sheet_id}?includeGridData=true&key=${GOOGLE_API_KEY}`)
			.then((response) => {
				try {
					let data = response.sheets[sheet_no - 1].data[0].rowData
						.map((item) => item.values[column_no - 1].formattedValue)
						.filter((val) => val && val > min && val < max);
					let howFrequent = data.reduce((obj, item) => {
						if (!/^[0-9]+$/g.test(item)) {
							return obj;
						}
						item = Number(item);
						if (!(item in obj)) {
							obj[item] = 0;
						}
						obj[item] += 1;
						return obj;
					}, {});
					let flippedDictionary = {};
					for (let item in howFrequent) {
						let key = howFrequent[item];
						if (!(key in flippedDictionary)) {
							flippedDictionary[key] = [];
						}
						flippedDictionary[key].push(item);
					}
					res.send(flippedDictionary);
				} catch (e) {
					return res.sendStatus(400);
				}
			});
	} catch (e) {
		return res.sendStatus(400);
	}
});

// Start server
server.listen(80, function() {
	let addr = this.address();
	console.log(`Server Started @ ${addr.address}${addr.port}\n`);
});