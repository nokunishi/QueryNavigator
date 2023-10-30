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
): Promise<any[]> {
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

	let groups = await data.then((sections) => {
		return groupSections(sections, keys);
	});

	// console.log(groups.size);

	if (apply.length === 0) {
		return Promise.resolve(processApply(apply, groups));
	}
	return Promise.resolve(["hello"]);
}

function groupSections(sections: Section[], keys: string[]): Map<any[], Section[]> {
	let groups: Map<any[], Section[]> = new Map();

	for (const section of sections) {
		let s = new Section(section);
		let values: any[] = [];

		keys.forEach((key) => {
			let value = s.getValue(key);
			values.push(value);
		});

		let contains = true;
		for (const key of groups.keys()) {
			for (let i = 0; i++; i < key.length) {
				if (key[i] !== values[i]) {
					contains = false;
					break;
				}
			}

			if (contains) {
				console.log("hello");
			} else {
				groups.set(values, [section]);
			}
		}
	}

	return groups;
}

function processApply(apply: string[], groups: Map<any[], Section[]>): Section[] {
	let sections: Section[] = [];

	if (apply.length === 0) {
		groups.forEach((group) => {
			sections.push(group[0]);
		});
	}

	// console.log(sections);
	return sections;
}
