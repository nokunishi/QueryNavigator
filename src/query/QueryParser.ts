import {InsightError, ResultTooLargeError} from "../controller/IInsightFacade";
import {Section} from "../model/Section";

export interface Query {
	WHERE: Where;
	OPTIONS: Options;
	TRANSFORMATIONS?: any;
}

type WhereComparators = "LT" | "GT" | "EQ" | "AND" | "OR" | "IS" | "NOT";
type Dir = "UP" | "DOWN";

const mfield = ["avg", "pass", "fail", "audit", "year"];
const sfield = ["dept", "id", "instructor", "title", "uuid"];
const mfieldRoom = ["lat", "lon", "seats"];
const sfieldRoom = ["fullname", "shortname", "number", "name", "address", "type", "furniture", "href"];

interface Where {
	[key: string]: {[key: string]: Where} | Array<{[key: string]: Where}>;
}

export interface Options {
	COLUMNS: string[];
	ORDER?: string;
}

const enableLogging = false;
const recordId = 36004;

/**
 * This parses the 'where' clause
 * @param whereCondition - This is the 'where' clause of the query
 * @param data - Data to run where clause on
 * @returns - Returns all rows which meet the 'where' clause
 */
export function parseWhere(whereCondition: Where, data: any[]): any[] {
	if (whereCondition === null) {
		throw new InsightError("Empty filters");
	}
	// Filter the data as per where condition
	let log = true;
	let d = data.filter((item) => {
		if (item.id === recordId && enableLogging) {
			console.log(item);
			console.log("wherecondition", JSON.stringify(whereCondition));
		}
		let ps = Object.keys(whereCondition);
		let result = true;
		for (const p of ps) {
			if (item.id === recordId && enableLogging) {
				console.log("p", p);
			}

			try {
				let parseWhereVal = parseWhereComparators(item, whereCondition, p as WhereComparators);
				result = result && parseWhereVal;
			} catch (err) {
				throw new InsightError("failed to parse where");
			}
		}

		if (enableLogging && log && result) {
			console.log(item);
			log = false;
		}
		return result;
	});
	return d;
}

function parseWhereComparators(item: any, whereCondition: Where, comparator: WhereComparators): boolean {
	let result = false;
	switch (comparator.toString()) {
		case "LT":
			checkWrongWhereCondition(whereCondition, "LT");
			Object.keys(whereCondition["LT"]).forEach((key) => {
				result = item[parseWhereField(key) || ""] < (whereCondition["LT"] as any)[key];
			});
			break;
		case "GT":
			checkWrongWhereCondition(whereCondition, "GT");
			Object.keys(whereCondition["GT"]).forEach((key) => {
				result = item[parseWhereField(key) || ""] > (whereCondition["GT"] as any)[key];
			});
			break;
		case "EQ":
			checkWrongWhereCondition(whereCondition, "EQ");
			Object.keys(whereCondition["EQ"]).forEach((key) => {
				result = item[parseWhereField(key) || ""].toString() === (whereCondition["EQ"] as any)[key].toString();
			});
			break;
		case "IS":
			checkWrongWhereCondition(whereCondition, "IS");
			result = processWildcard(whereCondition, item);
			break;
		case "NOT":
			checkWrongWhereCondition(whereCondition, "NOT");
			result = processNOT(whereCondition, item);
			break;
		case "AND":
			checkWrongWhereCondition(whereCondition, "AND");
			result = processAndOR("and", whereCondition["AND"] as [], true, item);
			break;
		case "OR":
			checkWrongWhereCondition(whereCondition, "OR");
			result = processAndOR("or", whereCondition["OR"] as [], result, item);
			break;
		default:
			throw new InsightError("Invalid comparator");
	}
	return result;
}

function processNOT(whereCondition: Where, item: any) {
	let result: boolean = false;
	Object.keys(whereCondition["NOT"]).forEach((key) => {
		result = !parseWhereComparators(
			item,
			whereCondition["NOT"] as any,
			Object.keys(whereCondition["NOT"])[0] as WhereComparators
		);
	});
	return result === undefined ? false : result;
}

function processWildcard(whereCondition: Where, item: any) {
	let result: boolean = false;

	Object.keys(whereCondition["IS"]).forEach((key) => {
		if (typeof (whereCondition["IS"] as any)[key] === "string" && valid_sfield().includes(key.split("_")[1])) {
			let o: any = whereCondition["IS"];
			let tempResult: boolean = false;
			if (o[key][0] === "*" && o[key][o[key].length - 1] === "*") {
				tempResult = item[parseWhereField(key) || ""].includes(o[key].replaceAll("*", ""));
			} else if (o[key][0] === "*") {
				tempResult = item[parseWhereField(key) || ""].endsWith(o[key].substring(1));
			} else if (o[key][o[key].length - 1] === "*") {
				tempResult = item[parseWhereField(key) || ""].startsWith(o[key].substring(0, o[key].length - 1));
			} else if (o[key].includes("*")) {
				throw new InsightError("Invalid comparator");
			} else {
				tempResult = item[parseWhereField(key) || ""].toString() === o[key].toString();
			}
			result = result || tempResult;
		} else {
			throw new InsightError("IS: invalid value type or query field");
		}
	});
	return result === undefined ? false : result;
}

function processAndOR(comparator: "and" | "or", condition: any[], result: boolean, item: any) {
	let r: boolean = result;
	if (condition.length === 0) {
		throw new InsightError("AND/OR array is empty");
	}
	for (const obj of condition) {
		let s = parseWhereComparators(item, obj, Object.keys(obj)[0] as WhereComparators);
		if (comparator === "and") {
			r = r && s;
		} else {
			r = r || s;
		}
		if (item.id === recordId && enableLogging) {
			console.log(comparator, "-par condition:", Object.keys(obj)[0], JSON.stringify(obj));
			console.log("result of", comparator, JSON.stringify(obj), r);
		}
	}
	if (item.id === recordId && enableLogging) {
		console.log("result of processAndOR", r);
	}
	return r;
}

export function parseWhereField(key: string) {
	if (key.includes("_")) {
		key = key.split("_")[1];
	}
	if (key === "avg") {
		return "Avg";
	}
	if (key === "dept") {
		return "Subject";
	}
	if (key === "id") {
		return "Course";
	}
	if (key === "uuid") {
		return "id";
	}
	if (key === "title") {
		return "Title";
	}
	if (key === "instructor") {
		return "Professor";
	}
	if (key === "year") {
		return "Year";
	}
	if (key === "pass") {
		return "Pass";
	}
	if (key === "audit") {
		return "Audit";
	}
	if (key === "fail") {
		return "Fail";
	}
	if (key === "fullname") {
		return "FullName";
	}
	if (key === "shortname") {
		return "ShortName";
	}
	if (key === "href") {
		return "Link";
	}
	if (mfieldRoom.includes(key) || sfieldRoom.includes(key)) {
		// console.log(key.charAt(0).toUpperCase() + key.slice(1));
		return key.charAt(0).toUpperCase() + key.slice(1);
	} else {
		throw new InsightError("invalid query field");
	}
}

function checkWrongWhereCondition(whereCondition: Where, comp: string) {
	if (typeof (whereCondition[comp] as any)[Object.keys(whereCondition[comp])[0]] === "string" && comp !== "IS") {
		throw new InsightError(`Invalid value for ${comp}`);
	}
	if (Object.keys(whereCondition[comp]).length === 0) {
		throw new InsightError(`Empty ${comp} in where condition`);
	}
	if (comp !== "AND" && comp !== "OR") {
		if (Object.keys(whereCondition[comp]).length > 1) {
			throw new InsightError(`Invalid ${comp} in where condition`);
		}
	}
}

export function valid_mfield(): string[] {
	mfield.push("section");
	return mfield.concat(mfieldRoom);
}

export function valid_sfield(): string[] {
	return sfield.concat(sfieldRoom);
}
