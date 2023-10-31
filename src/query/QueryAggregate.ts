import {group} from "console";
import {InsightError, ResultTooLargeError} from "../controller/IInsightFacade";
import {Section} from "../model/Section";
import {valid_mfield, valid_sfield, Options} from "./QueryParser";
import Decimal from "decimal.js";

const ApplyToken = ["MAX", "MIN", "AVG", "COUNT", "SUM"];

interface ApplyRule {
	[key: string]: {[key: string]: string};
}
const mfield = valid_mfield();
const sfield = valid_sfield();

export async function parseTransformation(
	options: Options,
	groupKeys: string[],
	apply: string[],
	data: Promise<Section[]>
): Promise<any> {
	options.COLUMNS.forEach((col) => {
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
	if (groupKeys.length === 0) {
		throw new InsightError("GROUP is an empty array");
	}

	let keys = groupKeys.map((item) => {
		item = item.split("_")[1];
		if (!mfield.includes(item) && !sfield.includes(item)) {
			throw new InsightError("invalid query field");
		}

		return item;
	});

	let sections = await data.then((s) => {
		return s.map((section) => {
			return new Section(section);
		});
	});
	let g = groupSections(sections, keys);
	let result = processApply(apply, g);
	return Promise.resolve(result);
}

function groupSections(sections: any[], keys: string[]): object {
	return sections.reduce(function (acc, item) {
		let values: string[] = [];

		for (const key of keys) {
			let value = item.getValue(key);

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

		if (v && acc[v] === undefined) {
			(acc as any)[v] = [];
		}
		(acc as any)[v].push(item);

		return acc;
	}, {});
}

function processApply(apply: string[], groups: object): any {
	if (apply.length === 0) {
		Object.keys(groups).forEach((g) => {
			(groups as any)[g] = (groups as any)[g][0];
		});
	} else {
		let newCols: string[] = [];
		for (const col of apply) {
			Object.keys(col).forEach((newCol) => {
				if (!newCol || newCol.includes("_")) {
					throw new InsightError("invalid apply key");
				}
				let [applyRule] = Object.entries((col as any)[newCol]);
				processApplyToken(`${applyRule}`, newCol, groups);
			});
		}
	}

	return groups;
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
				sections[colName] = processOp(sections, col, "AVG");
			});
			break;
		case "COUNT":
			for (const key of Object.keys(groups)) {
				let sections = (groups as any)[key];
				let count = groupSections(sections, [col]);
				sections[colName] = Object.keys(count).length.toString();
			}
			break;
		case "SUM":
			Object.keys(groups).forEach((grp) => {
				let sections = (groups as any)[grp];
				sections[colName] = processOp(sections, col, "SUM");
			});
			break;
	}
}

function processOp(sections: any[], col: string, op: string): string | undefined {
	if (valid_sfield().includes(col)) {
		throw new InsightError("invalid key types");
	}
	switch (op) {
		case "MIN":
			{
				let min = Number.MAX_VALUE;
				sections.forEach((s: any) => {
					if (min > Number(s.getValue(col))) {
						min = Number(s.getValue(col));
					}
				});
				return min.toFixed(2);
			}
			break;
		case "MAX":
			{
				let max = 0;
				sections.forEach((s: any) => {
					if (max < Number(s.getValue(col))) {
						max = Number(s.getValue(col));
					}
				});
				return max.toFixed(2);
			}
			break;
		case "SUM":
			{
				let sum = sections.reduce(function (acc: Decimal, s: any) {
					let n = new Decimal(s.getValue(col));
					return Decimal.add(acc, n);
				}, 0);
				return sum.toFixed(2);
			}
			break;

		case "AVG":
			{
				let avg =
					sections.reduce(function (acc: Decimal, s: any) {
						let n = new Decimal(s.getValue(col));
						return Decimal.add(acc, n);
					}, 0) / sections.length;

				return avg.toFixed(2);
			}
			break;
	}
}
