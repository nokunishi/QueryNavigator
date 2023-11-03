import {InsightError, ResultTooLargeError} from "../controller/IInsightFacade";
import {Section} from "../model/Section";
import {valid_mfield, valid_sfield, Options, parseWhereField} from "./QueryParser";
import Decimal from "decimal.js";

const ApplyToken = ["MAX", "MIN", "AVG", "COUNT", "SUM"];

interface ApplyRule {
	[key: string]: {[key: string]: string};
}
const mfield = valid_mfield();
const sfield = valid_sfield();

export function parseTransformation(options: Options, groupKeys: string[], apply: string[], data: any[]): any[] {
	options.COLUMNS.forEach((col) => {
		if (groupKeys.length === 0) {
			throw new InsightError("GROUP is an empty array");
		}
		if (!groupKeys.includes(col)) {
			let inApply = false;
			for (const k of apply) {
				let [key] = Object.entries(k);
				if (key[0].includes("_")) {
					throw new InsightError("ApplyKey cannot contain underscore");
				}

				if (key[0] === col) {
					inApply = true;
				}
			}

			if (!inApply) {
				throw new InsightError("COLUMN key not in GROUP/ARRAY");
			}
		}
	});
	let keys = groupKeys.map((item) => {
		item = item.split("_")[1];
		if (!mfield.includes(item) && !sfield.includes(item)) {
			throw new InsightError("invalid query field");
		}
		return item;
	});
	// console.log(await data);
	let g = groupSections(data, keys);
	let result = processApply(apply, g);
	return result;
}

function groupSections(sections: any[], keys: string[]): object {
	return sections.reduce(function (acc, item) {
		let values: string[] = [];

		for (const k of keys) {
			let key = parseWhereField(k);
			let value = (item as any)[key];
			if (typeof value === "number") {
				value.toString();
			}
			values.push(value);
		}

		let v: string = values.reduce(function (value_acc, value) {
			return value_acc + "/" + value;
		});
		if (acc === undefined) {
			acc = new Object();
		}
		if ((acc as any)[v] === undefined) {
			(acc as any)[v] = [];
		}
		if (v) {
			(acc as any)[v].push(item);
		}
		// console.log("ACC", acc);
		return acc;
	}, {});
}

function processApply(apply: string[], groups: object): any[] {
	if (apply.length === 0) {
		Object.keys(groups).forEach((g) => {
			(groups as any)[g] = (groups as any)[g][0];
		});
	} else {
		let duplicates: string[] = [];
		for (const col of apply) {
			Object.keys(col).forEach((newCol) => {
				if (!newCol || newCol.includes("_")) {
					throw new InsightError("invalid apply key");
				}
				if (duplicates.includes(newCol)) {
					throw new InsightError("duplicate apply key");
				}
				duplicates.push(newCol);
				let [applyRule] = Object.entries((col as any)[newCol]);
				processApplyToken(`${applyRule}`, newCol, groups);
			});
		}
	}
	// console.log("GROUPS", groups);
	return groups as any[];
}

function processApplyToken(applyRule: string, colName: string, groups: object) {
	let applyToken = applyRule.split(",")[0];
	let col = applyRule.split(",")[1].split("_")[1];

	switch (applyToken) {
		case "MAX":
			Object.keys(groups).forEach((grp) => {
				let sections = (groups as any)[grp];
				sections[colName] = processOp(sections, col, "MAX");
			});
			break;
		case "MIN":
			Object.keys(groups).forEach((grp) => {
				let sections = (groups as any)[grp];
				sections[colName] = processOp(sections, col, "MIN");
			});
			break;
		case "AVG":
			Object.keys(groups).forEach((grp) => {
				let sections = (groups as any)[grp];
				sections[colName] = processOp(sections, col, "AVG").toFixed(2);
			});
			break;
		case "COUNT":
			for (const key of Object.keys(groups)) {
				let sections = (groups as any)[key];
				let count = groupSections(sections, [col]);
				sections[colName] = parseInt(Object.keys(count).length.toString(), 10);
			}
			break;
		case "SUM":
			Object.keys(groups).forEach((grp) => {
				let sections = (groups as any)[grp];
				sections[colName] = processOp(sections, col, "SUM").toFixed(2);
			});
			break;
		default:
			throw new InsightError("Invalid calculations comparator");
	}
}

function processOp(sections: any[], col_: string, op: string): number {
	if (valid_sfield().includes(col_)) {
		throw new InsightError("invalid key types");
	}
	let result = 0;
	let col = parseWhereField(col_);
	switch (op) {
		case "MIN":
			{
				result = Number.POSITIVE_INFINITY;
				sections.forEach((s: any) => {
					if (result > Number((s as any)[col])) {
						result = Number((s as any)[col]);
					}
				});
			}
			break;
		case "MAX":
			{
				result = Number.NEGATIVE_INFINITY;
				sections.forEach((s: any) => {
					if (result < Number((s as any)[col])) {
						result = Number((s as any)[col]);
					}
				});
			}
			break;
		case "SUM":
			{
				result = sections.reduce(function (acc: Decimal, s: any) {
					let n = new Decimal((s as any)[col]);
					return Decimal.add(acc, n);
				}, 0);
			}
			break;

		case "AVG":
			{
				result =
					sections.reduce(function (acc: Decimal, s: any) {
						let n = new Decimal((s as any)[col]);
						return Decimal.add(acc, n);
					}, 0) / sections.length;
			}
			break;
	}
	return result;
}
