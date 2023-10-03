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

			return new Dataset(id, file, InsightDatasetKind.Sections);
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
			let insightDatasetList = [];

			for await (const id of ids) {
				if (fs.existsSync("./data/" + id)) {
					let file = fs.readFileSync("./data/" + id).toString();
					let dataset = new Dataset(id, file, InsightDatasetKind.Sections);

					let numRows = await dataset.getNumRows();

					let obj: InsightDataset = {
						id: id,
						kind: dataset.kind,
						numRows: numRows,
					};

					insightDatasetList.push(obj);
				} else {
					return Promise.reject(new InsightError());
				}
			}

			return Promise.resolve(insightDatasetList);
		} catch (err) {
			return Promise.reject(new InsightError());
		}
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
