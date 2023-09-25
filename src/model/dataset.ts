import * as fs from "fs-extra";
import Section from "./sections";
import * as zip from "jszip";

// change visibility

export class Dataset {
	private database: Section[];

	constructor() {
		this.database = [];
	}

	// should always resolve
	private async getAllCourseNames(): Promise<string[]> {
		let promises: string[];
		let path = fs.readFileSync("./test/resources/archives/courses_48.zip");
		promises = [];

		await zip.loadAsync(path).then((unzip) => {
			unzip.folder("courses")?.forEach((course) => {
				promises.push(course);
			});
		});

		return promises;
	}

	// returns JSON course object
	private async getCourseResult(index: number): Promise<any> {
		let path = fs.readFileSync("./test/resources/archives/courses_48.zip");
		let promises = await this.getAllCourseNames();

		let course = await zip
			.loadAsync(path)
			.then((unzip) => {
				return unzip.folder("courses")?.file(promises[index])?.async("string");
			})
			.then((str) => {
				return str;
			});

		if (course != null) {
			return Promise.resolve(JSON.parse(course).result);
		} else {
			return Promise.reject("course not found at index");
		}
	}

	public async isValidCourse(index: number): Promise<boolean> {
		let course = await this.getCourseResult(index);

		console.log(course);

		return Promise.resolve(true);
	}
}
