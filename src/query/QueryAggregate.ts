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

	let sections = await data.then((s) => {
		return s.map((section) => {
			return new Section(section);
		});
	});

	let group: any = null;

	while (keys.length > 0) {
		if (group !== null) {
			for (const k of Object.keys(group)) {
				let g = groupSections((group as any)[k], keys[keys.length - 1]);
				(group as any)[k] = [];
				(group as any)[k].push(g);
			}
		} else {
			group = groupSections(sections, keys[keys.length - 1]);
		}
		keys.pop();
	}
	console.log(group["garcia, ronald"]);

	if (apply.length === 0) {
		// console.log(groups);
	}
	return Promise.resolve(["hello"]);
}

function groupSections(sections: any[], key: string): object {
	return sections.reduce(function (acc, item) {
		let value = item.getValue(key);

		if (typeof value === "number") {
			value.toString();
		}

		if (!value || typeof value !== "string") {
			return acc;
		}

		if (!(acc as any)[value]) {
			(acc as any)[value] = [];
		}

		(acc as any)[value].push(item);
		return acc;
	}, {});
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
