import * as fs from "fs-extra";
import {Section} from "./Section";
import * as zip from "jszip";
import {InsightDatasetKind, InsightError, InsightDataset} from "../controller/IInsightFacade";
import {assert} from "console";

export class Dataset {
	public id: string; // TODO: maybe change visibility?

	// file: zip file in base64
	// id: new id of the dataset
	constructor(id: string) {
		this.id = id;
	}

	// return a list of all courses in one list
	public async getAllCourses(file: string): Promise<string[]> {
		try {
			let promises: Array<Promise<string> | undefined> = [];
			let courseNames: string[] = [];
			let sections: string[] = [];

			await zip.loadAsync(file, {base64: true}).then((unzip) => {
				unzip.folder("courses")?.forEach((course) => {
					if (course !== ".DS_Store") {
						promises.push(unzip.folder("courses")?.file(course)?.async("string"));
					}
				});
			});

			return Promise.all(promises).then((arrCourses) => {
				arrCourses.forEach((course) => {
					if (course != null && course !== undefined) {
						let courseResult = JSON.parse(course).result;
						sections.push(courseResult);
					}
				});
				return sections;
			});
		} catch (err) {
			return Promise.reject(new InsightError());
		}
	}
}
