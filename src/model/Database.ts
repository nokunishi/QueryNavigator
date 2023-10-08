import * as fs from "fs-extra";
import {Dataset} from "./Dataset";
import {Section} from "./Section";
import {InsightDatasetKind, InsightError, InsightDataset, InsightResult} from "../controller/IInsightFacade";

// list of valid datasets
export class Database {
	constructor() {
		if (!fs.existsSync("./data")) {
			fs.mkdirSync("./data");
		}
	}

	public getAllIds(): string[] {
		return fs.readdirSync("./data");
	}

	public invalidId(id: string): boolean {
		return id === "" || id.includes("_") || id === " ";
	}

	// add a valid dataset
	// file name = id of dataset
	// TODO: refactor to not-async fn
	public async addValidDataset(dataset: Dataset, file: string): Promise<string[]> {
		try {
			let courses = await dataset.getAllCourses(file);
			let valid = false;

			for (const course of courses) {
				for (const section of course) {
					let sectionObj = new Section(section);

					if (sectionObj.isValid()) {
						valid = true;
					}
				}
			}

			// if no valid section, return InsightError
			if (!valid) {
				throw new InsightError();
			}

			if (!fs.pathExistsSync("./data/" + dataset.id)) {
				fs.writeFileSync("./data/" + dataset.id, JSON.stringify(courses));
			} else {
				return Promise.reject(new InsightError());
			}

			return Promise.resolve(this.getAllIds());
		} catch (err) {
			return Promise.reject(new InsightError());
		}
	}
}
