import * as fs from "fs-extra";
import {Section} from "./Section";
import * as zip from "jszip";
import {InsightDatasetKind, InsightError, InsightDataset} from "../controller/IInsightFacade";
import {assert} from "console";

export class Dataset {
	public id: string; // TODO: maybe change visibility?
	public file: string;
	public kind: InsightDatasetKind;
	public numRows?: number;

	// file: zip file in base64
	// id: new id of the dataset
	constructor(id: string, file: string, kind: InsightDatasetKind) {
		this.id = id;
		this.file = file;
		this.kind = kind;
	}

	// return a list of all courses in one list
	public async getAllCourses(): Promise<string[]> {
		try {
			let promises: Array<Promise<string> | undefined> = [];
			let courseNames: string[] = [];
			let sections: string[] = [];

			await zip.loadAsync(this.file, {base64: true}).then((unzip) => {
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

	// getSectionsJson must be called first
	// set the total number of rows in the dataset
	public getNumRows(courses: any): number {
		let sum = 0;

		courses.forEach((course: string) => {
			sum += course.length;
		});

		return sum;
	}

	public async isValidDataSet(): Promise<boolean> {
		try {
			let courses = await this.getAllCourses();
			let valid = false;

			for (const course of courses) {
				for (const section of course) {
					console.log(section);
					let sectionObj = new Section(section);

					if (sectionObj.isValid()) {
						valid = true;
					}
				}
			}

			return Promise.resolve(valid);
		} catch (err) {
			return Promise.reject(new InsightError());
		}
	}
}
