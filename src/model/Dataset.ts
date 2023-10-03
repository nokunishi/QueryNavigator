import * as fs from "fs-extra";
import {Section} from "./Section";
import * as zip from "jszip";
import {InsightDatasetKind, InsightError, InsightDataset} from "../controller/IInsightFacade";

export class Dataset {
	public id: string; // TODO: maybe change visibility?
	public file: string;
	public kind: InsightDatasetKind;
	public numRows?: number;

	// TODO: should we have this?
	// file: zip file in base64
	// id: new id of the dataset
	constructor(id: string, file: string, kind: InsightDatasetKind) {
		this.id = id;
		this.file = file;
		this.kind = kind;
	}

	public async toInsightDataset(id: string): Promise<InsightDataset> {
		try {
			let numRows = await this.getNumRows();

			let obj = {
				id: id,
				kind: this.kind,
				numRows: numRows,
			};

			return Promise.resolve(obj);
		} catch (err) {
			return Promise.reject(new InsightError());
		}
	}

	// return a list of all course names under /courses root dir
	// always return
	public async getAllCourseNames(): Promise<string[]> {
		try {
			let promises: string[];
			promises = [];

			await zip.loadAsync(this.file, {base64: true}).then((unzip) => {
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
	public async getNumRows(): Promise<number> {
		try {
			let courseNames = await this.getAllCourseNames();
			let sum = 0;

			for await (const course of courseNames) {
				let sections = await this.getSectionsJSON(course);

				sum += sections.length;
			}

			this.numRows = sum;

			return Promise.resolve(this.numRows);
		} catch (err) {
			return Promise.reject(new InsightError());
		}
	}

	// returns JSON object of a course ("result"), all sections
	// name: Course name
	public async getSectionsJSON(name: string): Promise<any> {
		try {
			let sections: Section[];
			sections = [];

			let course = await zip
				.loadAsync(this.file, {base64: true})
				.then((unzip) => {
					return unzip.folder("courses")?.file(name)?.async("string");
				})
				.then((str) => {
					return str;
				});

			if (course != null) {
				return Promise.resolve(JSON.parse(course).result);
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

	public async isValidDataSet(): Promise<boolean> {
		try {
			let courseNames = await this.getAllCourseNames();
			let valid = false;

			for await (const course of courseNames) {
				let sections = await this.getSectionsJSON(course);
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
