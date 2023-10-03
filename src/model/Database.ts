import * as fs from "fs-extra";
import {Section} from "./Section";
import * as zip from "jszip";
import {getContentFromArchives} from "../../test/TestUtil";
import {Dataset} from "./Dataset";
import {InsightDatasetKind, InsightError, InsightDataset, InsightResult} from "../controller/IInsightFacade";

// list of valid datasets
export class Database {
	constructor() {
		if (!fs.existsSync("./data")) {
			fs.mkdirSync("./data");
		}
	}

	// read file and convert sinto a Dataset obj
	public readDataset(id: string): Dataset {
		if (fs.existsSync("./data/" + id)) {
			let file = fs.readFileSync("./data/" + id).toString();

			return new Dataset(id);
		} else {
			throw new InsightError();
		}
	}

	public getAllIds(): string[] {
		return fs.readdirSync("./data/");
	}

	public invalidId(id: string): boolean {
		return id === "" || id.includes("_") || id === " ";
	}

	public async toInsightDataset(): Promise<InsightDataset[]> {
		try {
			let ids = this.getAllIds();
			let insightDatasetList: InsightDataset[] = [];

			for (const id of ids) {
				let dataset = new Dataset(id);
				let obj = {
					id: id,
					kind: InsightDatasetKind.Sections,
					numRows: dataset.getNumRows(),
				};

				insightDatasetList.push(obj);
			}

			return Promise.resolve(insightDatasetList);
		} catch (err) {
			return Promise.reject(new InsightError());
		}
	}

	// add the base64 content of zip file to ./data dir
	// file name = id of dataset
	// TODO: refactor to not-async fn
	public async addValidDataset(dataset: Dataset, file: string): Promise<string[]> {
		if (!fs.pathExistsSync("./data/" + dataset.id)) {
			let courses = await dataset.getAllCourseNames(file);
			fs.mkdirSync("./data/" + dataset.id);
			let promises: Array<Promise<string>> = [];

			courses.forEach((course) => {
				dataset.getSectionsJSON(course, file).then((courseResult) => {
					fs.writeFileSync("./data/" + dataset.id + "/" + course, courseResult);
				});
			});

			return Promise.resolve(this.getAllIds());
		} else {
			return Promise.reject(new InsightError());
		}
	}
}
