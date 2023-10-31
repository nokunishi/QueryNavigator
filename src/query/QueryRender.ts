import {InsightError, ResultTooLargeError} from "../controller/IInsightFacade";
import {Options, valid_mfield, valid_sfield} from "./QueryParser";

/**
 * This parses the entire 'OPTIONS' clause of query
 * @param obj
 * @returns
 */
export async function parseOptions(options: Options, data: Promise<any[]>, apply?: string[]): Promise<any[]> {
	if (options === null || options.COLUMNS === null) {
		throw new InsightError("Empty options or columns");
	}
	if (Object.keys(options).some((key) => key !== "COLUMNS" && key !== "ORDER")) {
		throw new InsightError("Invalid keys in OPTIONS");
	}
	let res = await data.then((d) => {
		// Parsing columns
		let columns = options.COLUMNS;
		let order = options.ORDER;
		if (!columns) {
			throw new InsightError("missing COLUMNS");
		}
		let result: any[] = [];

		if (!apply || apply.length === 0) {
			result = renderColumns(d, columns);
		} else {
			result = renderApply(d, columns);
		}
		// parsing order
		if (!order) {
			return result;
		}
		if (!(order as any)["dir"] && !columns.includes(order)) {
			throw new InsightError("ORDER key must be in COLUMNS");
		} else {
			if ((order as any)["dir"] && (order as any)["dir"] === "DOWN") {
				return result.sort((a, b) => (a[order || ""] < b[order || ""] ? 1 : -1));
			} else if ((order as any)["dir"] && (order as any)["dir"] !== "UP" && (order as any)["dir"] !== "DOWN") {
				throw new InsightError("invalid dir");
			}

			return result.sort((a, b) => (a[order || ""] > b[order || ""] ? 1 : -1));
		}
	});
	return res;
}

function renderColumns(d: any[], columns: string[]): Array<{[key: string]: string | number}> {
	let result: Array<{[key: string]: string | number}> = [];
	Object.keys(d).forEach((section) => {
		let row = (d as any)[section];
		let rowResult: {[key: string]: string | number} = {};

		for (const col of columns) {
			let parsedWhereField = col.split("_")[1];
			if (col.includes("uuid")) {
				rowResult[col] = row.getValue(parsedWhereField || "").toString();
			} else if (col.toLowerCase().includes("year")) {
				rowResult[col] = Number.parseInt(row.getValue(parsedWhereField || "0"), 10);
			} else if (valid_mfield().includes(parsedWhereField) || valid_sfield().includes(parsedWhereField)) {
				rowResult[col] = row.getValue(parsedWhereField);
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
				let parsedWhereField = col.split("_")[1];
				if (col.includes("uuid")) {
					rowResult[col] = row.getValue(parsedWhereField || "").toString();
				} else if (col.toLowerCase().includes("year")) {
					rowResult[col] = Number.parseInt(row.getValue(parsedWhereField || "0"), 10);
				} else if (valid_mfield().includes(parsedWhereField) || valid_sfield().includes(parsedWhereField)) {
					rowResult[col] = row.getValue(parsedWhereField);
				} else if (s[col]) {
					rowResult[col] = Number(s[col]);
				} else {
					throw new InsightError("invalid col key");
				}
			}
		}
		result.push(rowResult);
	});

	return result;
}
