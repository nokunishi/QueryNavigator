import {type} from "os";
import {InsightError, ResultTooLargeError} from "../controller/IInsightFacade";
import {Section} from "../model/Section";
import {valid_mfield, valid_sfield} from "./QueryParser";

type ApplyToken = "MAX" | "MIN" | "AVG" | "COUNT" | "SUM";

interface ApplyRule {
	[key: string]: {[key: string]: string};
}
const mfield = valid_mfield();
const sfield = valid_sfield();

export async function parseTransformation(
	groupKeys: string[],
	apply: string[],
	data: Promise<Section[]>
): Promise<any> {
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
	}

	return groups;
}
