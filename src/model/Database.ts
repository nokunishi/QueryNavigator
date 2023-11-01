import * as fs from "fs-extra";
import {Dataset} from "./Dataset";
import {Section} from "./Section";
import {InsightDatasetKind, InsightError, InsightDataset, InsightResult} from "../controller/IInsightFacade";
import * as zip from "jszip";
import {readRoomsZipFile} from "./Rooms";

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

	// Create

	// add a valid dataset
	// file name = id of dataset
	// TODO: refactor to not-async fn
	public async addValidDataset(id: string, file: string, kind: InsightDatasetKind): Promise<string[]> {
		try {
			let courses: any[] = [];
			let rooms: any[] = [];
			if (kind === InsightDatasetKind.Sections) {
				courses = await this.getAllCoursesInZip(file);
				let valid = false;

				for (const course of courses) {
					let section: any;

					for (section of course) {
						let sectionObj = new Section(section);
						if (section["Section"] === "overall") {
							section["Year"] = 1900;
						}

						if (sectionObj.isValid()) {
							valid = true;
						}
					}
				}
				if (!valid) {
					throw new InsightError();
				}
			} else if (kind === InsightDatasetKind.Rooms) {
				rooms = await readRoomsZipFile(file);
			} else {
				throw new InsightError("Invalid kind of dataset");
			}

			if (!fs.pathExistsSync("./data/" + id)) {
				if (kind === InsightDatasetKind.Sections) {
					fs.writeFileSync("./data/" + id, JSON.stringify(courses));
				} else if (kind === InsightDatasetKind.Rooms) {
					fs.writeFileSync("./data/" + id, JSON.stringify(rooms));
				} else {
					throw new InsightError("Invalid kind of dataset");
				}
			}

			return Promise.resolve(this.getAllIds());
		} catch (err) {
			return Promise.reject(new InsightError());
		}
	}

	/**
	 * This function returns all the courses in a zip file
	 * @param file name of the file example "pair.zip"
	 * @returns {Promise<string[]>} sections
	 */
	public async getAllCoursesInZip(file: string): Promise<string[]> {
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

	// Read
	// THIS FOR GETTING ALL SECTIONS DATASETS NOT ROOMS
	public getAllDatasets(): Dataset[] {
		let datasetIds = this.getAllIds();
		let datasets: Dataset[] = [];

		datasetIds.forEach((datasetId) => {
			let datasetString = fs.readFileSync("./data/" + datasetId).toString();
			let dataset = JSON.parse(datasetString) as any[];
			// Flatten data from all courses to a single array
			datasets.push(new Dataset(datasetId, dataset.flat()));
		});
		return datasets;
	}

	public readDataset(id: string): any[] {
		let datasetString = fs.readFileSync("./data/" + id).toString();
		let dataset = JSON.parse(datasetString) as any[];
		// Flatten data from all courses to a single array
		return dataset.flat();
	}

	// Get room dataset
	public readRoomsDataset(id: string): any[] {
		let datasetString = fs.readFileSync("./data/" + id).toString();
		console.log(datasetString);
		return JSON.parse(datasetString) as any[];
	}
}
