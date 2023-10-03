import * as fs from "fs-extra";
import {Section} from "./Section";
import * as zip from "jszip";
import {InsightDatasetKind, InsightError, InsightDataset} from "../controller/IInsightFacade";

export class Dataset {
	public id: string; // TODO: maybe change visibility?

	// file: zip file in base64
	// id: new id of the dataset
	constructor(id: string) {
		this.id = id;
	}

	// return a list of all course names under /courses root dir
	// always return
	public async getAllCourseNames(file: string): Promise<string[]> {
		try {
			let promises: string[];
			promises = [];

			await zip.loadAsync(file, {base64: true}).then((unzip) => {
				unzip.folder("courses")?.forEach((course) => {
					if (course !== ".DS_Store") {
						promises.push(course);
					}
				});
			});

			return promises;
		} catch (err) {
			return Promise.reject(new InsightError());
		}
	}

	// set the total number of rows in the dataset
	// set the total number of rows in the dataset
	public getNumRows(): number {
		let courseNames = fs.readdirSync("./data/" + this.id);
		let sum = 0;

		courseNames.forEach((course) => {
			let courseResult = fs.readFileSync("./data/" + this.id + "/" + course).toString();
			let sections = JSON.parse(courseResult).result;

			console.log(sections);
			sum += sections.length;
			console.log(sum);
		});

		console.log(sum);
		return sum;
	}

	// returns JSON object of a course ("result"), all sections
	// name: Course name
	public async getSectionsJSON(name: string, file: string): Promise<string> {
		try {
			let sections: Section[];
			sections = [];

			let course = await zip
				.loadAsync(file, {base64: true})
				.then((unzip) => {
					return unzip.folder("courses")?.file(name)?.async("string");
				})
				.then((str) => {
					return str;
				});

			if (course != null) {
				return Promise.resolve(course);
			} else {
				return Promise.reject(new InsightError());
			}
		} catch (err) {
			return Promise.reject(new InsightError());
		}
	}

	// Check if 'sections' contain at least one valid course
	// getSectionsJSON should be called first
	public isValidCourse(sections: any): boolean {
		for (const sectionJSON of sections) {
			const section = new Section(sectionJSON);
			if (section.isValid()) {
				return true;
			}
		}

		return false;
	}

	public async isValidDataSet(file: string): Promise<boolean> {
		try {
			let courseNames = await this.getAllCourseNames(file);
			let valid = false;

			for await (const course of courseNames) {
				let courseResult = await this.getSectionsJSON(course, file);
				let sections = JSON.parse(courseResult).result;
				let courseValid = this.isValidCourse(sections);

				if (courseValid) {
					valid = true;
					break;
				}
			}

			return Promise.resolve(valid);
		} catch (err) {
			return Promise.reject(new InsightError());
		}
	}
}
