import * as fs from "fs-extra";
import {Section} from "./Section";
import * as zip from "jszip";
import {getContentFromArchives} from "../../test/TestUtil";
import {Dataset} from "./Dataset";
import {InsightDatasetKind, InsightError} from "../controller/IInsightFacade";

// list of valid datasets
export class Database {
	constructor() {
		if (!fs.existsSync("./data")) {
			fs.mkdirSync("./data");
		}
	}

	// read file and convert sinto a Dataset obj
	public readDataset(id: string): Dataset {
		let file = fs.readFileSync("./data/" + id).toString();

		return new Dataset(id, file, InsightDatasetKind.Sections);
	}

	public getAllIds(): string[] {
		return fs.readdirSync("./data/");
	}

	public invalidId(id: string): boolean {
		return id === "" || id.includes("_") || id === " ";
	}

	// add the base64 content of zip file to ./data dir
	// file name = id of dataset
	public async addValidDataset(dataset: Dataset): Promise<string[]> {
		try {
			if (!fs.pathExistsSync("./data/" + dataset.id)) {
				fs.writeFileSync("./data/" + dataset.id, dataset.file);
			} else {
				return Promise.reject(new InsightError());
			}

			return Promise.resolve(this.getAllIds());
		} catch (err) {
			return Promise.reject(new InsightError());
		}
	}
}
