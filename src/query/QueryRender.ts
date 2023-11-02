import {InsightError, ResultTooLargeError} from "../controller/IInsightFacade";
import {Options, parseWhereField, valid_mfield, valid_sfield} from "./QueryParser";
import {Section} from "../model/Section";
import {parse} from "path";

const num = ["Year", "Lon", "Lat", "Seats"];
/**
 * This parses the entire 'OPTIONS' clause of query
 * @param obj
 * @returns
 */
export async function parseOptions(options: Options, d: any[], apply?: string[]): Promise<any[]> {
	if (Object.keys(options).some((key) => key !== "COLUMNS" && key !== "ORDER")) {
		throw new InsightError("Invalid keys in OPTIONS");
	}
	// Parsing columns
	let columns = options.COLUMNS;
	let order = options.ORDER;
	let result: any[] = [];

	if (!apply || (apply && apply.length === 0)) {
		result = renderColumns(d, columns);
	} else {
		result = renderApply(d, columns);
	}

	if (result.length > 5000) {
		return Promise.reject(new ResultTooLargeError());
	}

	if (!order) {
		return Promise.resolve(result);
	} else {
		// console.log(processOrder(result, order, columns));
		return Promise.resolve(processOrder(result, order, columns));
	}
}

function processOrder(result: any[], order: string, columns: string[]): any[] {
	if (!(order as any)["dir"] && !columns.includes(order)) {
		throw new InsightError("ORDER key must be in COLUMNS");
	} else if ((order as any)["dir"] && (order as any)["dir"] !== "UP" && (order as any)["dir"] !== "DOWN") {
		throw new InsightError("invalid dir");
	} else if ((order as any)["dir"] && !(order as any)["keys"]) {
		throw new InsightError("ORDER missing KEYS (when DIR present)");
	} else if ((order as any)["keys"]) {
		let i = 0;
		(order as any)["keys"].forEach((k: any) => {
			i++;
			if (!columns.includes(k)) {
				throw new InsightError("invalid keys in ORDER KEYS");
			}
		});
		// can't call ["keys"].length
		if (i === 0) {
			throw new InsightError("invalid keys in ORDER KEYS");
		}
	}

	if ((order as any)["dir"] === "DOWN") {
		return result.sort((a, b) => tieBreaker(b, a, (order as any)["keys"]));
	} else if ((order as any)["dir"] === "UP") {
		return result.sort((a, b) => tieBreaker(a, b, (order as any)["keys"]));
	}
	// default
	return result.sort((a, b) => (a[order || ""] > b[order || ""] ? 1 : -1));
}

// return 1 if a > b
function tieBreaker(a: any, b: any, order: string[]): number {
	for (const o of order) {
		if (a[o] > b[o]) {
			return 1;
		} else if (a[o] < b[o]) {
			return -1;
		}
	}

	return 0;
}

function renderColumns(d: any[], columns: string[]): Array<{[key: string]: string | number}> {
	let result: Array<{[key: string]: string | number}> = [];
	Object.keys(d).forEach((section) => {
		let row = (d as any)[section];
		let rowResult: {[key: string]: string | number} = {};
		for (const col of columns) {
			let parsedWhereField = parseWhereField(col);
			if (parsedWhereField === "id") {
				rowResult[col] = (row as any)[parsedWhereField].toString() || "";
			} else if (parsedWhereField === "Year") {
				rowResult[col] = Number.parseInt((row as any)[parsedWhereField], 10) || 0;
			} else if (parsedWhereField === "Seats") {
				rowResult[col] = Number((row as any)[parsedWhereField]) || 0;
			} else {
				rowResult[col] = (row as any)[parsedWhereField];
			}
		}
		result.push(rowResult);
	});
	return result;
}

function renderApply(d: any[], columns: string[]): Array<{[key: string]: string | number}> {
	let result: Array<{[key: string]: string | number}> = [];
	Object.keys(d).forEach((sections) => {
		let s = (d as any)[sections];
		let rowResult: {[key: string]: string | number} = {};
		for (const row of s) {
			for (const col of columns) {
				if (col.includes("_")) {
					let parsedWhereField = parseWhereField(col);
					if (parsedWhereField === "id") {
						rowResult[col] = (row as any)[parsedWhereField].toString() || "";
					} else if (parsedWhereField === "Year") {
						rowResult[col] = Number.parseInt((row as any)[parsedWhereField], 10) || 0;
					} else if (parsedWhereField === "Seats") {
						rowResult[col] = Number((row as any)[parsedWhereField]) || 0;
					} else {
						rowResult[col] = (row as any)[parsedWhereField];
					}
				} else {
					rowResult[col] = Number(s[col]);
				}
			}
		}
		result.push(rowResult);
	});

	return result;
}
