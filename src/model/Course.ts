import {Section} from "./Section";
import * as zip from "jszip";

export class Course {
	private sections: Section[] = [];

	constructor(sections: Section[]) {
		this.sections = sections;
	}

	// returns JSON object of a course ("result"), all sections
	public async getSectionsJSON(name: string, file: string): Promise<any> {
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
			return Promise.resolve(JSON.parse(course).result);
		} else {
			return Promise.reject("course not found");
		}
	}

	public async setSections(array: any[]) {
		this.sections = array;
	}

	public async isValid(name: string, file: string): Promise<boolean> {
		let sections = await this.getSectionsJSON(name, file);

		sections.forEach((sectionJSON: any) => {
			const section = new Section(sectionJSON);

			if (section.isValid()) {
				return Promise.resolve(true);
			}
		});

		return Promise.reject(false);
	}
}
