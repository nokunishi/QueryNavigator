import * as fs from "fs-extra";
import {Dataset} from "./Dataset";
import {InsightDatasetKind, InsightError, InsightDataset, InsightResult} from "../controller/IInsightFacade";

// list of valid datasets
export class Database {
	constructor() {
		if (!fs.existsSync("./data")) {
			fs.mkdirSync("./data");
		}
	}

	public getAllIds(): string[] {
		return fs.readdirSync("./data/");
	}

	public invalidId(id: string): boolean {
		return id === "" || id.includes("_") || id === " ";
	}

	// add the base64 content of zip file to ./data dir
	// file name = id of dataset
	// TODO: refactor to not-async fn
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
