import * as fs from "fs-extra";
import {Section} from "./Section";
import * as zip from "jszip";
import {getContentFromArchives} from "../../test/TestUtil";
import {Dataset} from "./Dataset";
import {InsightError} from "../controller/IInsightFacade";

// list of valid datasets
export class Database {
	public readDataset(id: string): Dataset {
		let file = fs.readFileSync("src/resources/database/" + id).toString();

		return new Dataset(id, file);
	}

	public invalidId(id: string): boolean {
		return id === "" || id.includes("_") || id === " ";
	}

	public addValidDataset(dataset: Dataset): Promise<string[]> {
		try {
			fs.pathExists("src/resources/databse/" + dataset.id, (exists) => {
				if (!exists) {
					fs.writeFileSync("src/resources/database/" + dataset.id, dataset.file);
				} else {
					return Promise.reject(new InsightError());
				}
			});

			return Promise.resolve([dataset.id]);
		} catch (err) {
			return Promise.reject(new InsightError());
		}
	}
}
