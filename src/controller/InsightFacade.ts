import {
	IInsightFacade,
	InsightDataset,
	InsightDatasetKind,
	InsightError,
	InsightResult,
	NotFoundError,
} from "./IInsightFacade";

import {Database} from "../model/Database";
import {Dataset} from "../model/Dataset";
import * as fs from "fs-extra";

/**
 * This is the main programmatic entry point for the project.
 * Method documentation is in IInsightFacade
 *
 */
export default class InsightFacade implements IInsightFacade {
	private database: Database;

	constructor() {
		this.database = new Database();
		console.log("InsightFacadeImpl::init()");
	}

	public async addDataset(id: string, content: string, kind: InsightDatasetKind): Promise<string[]> {
		try {
			if (this.database.invalidId(id)) {
				return Promise.reject(new InsightError());
			}

			if (kind === InsightDatasetKind.Rooms) {
				return Promise.reject(new InsightError());
			}

			let dataset = new Dataset(id);
			let isValid = await dataset.isValidDataSet(content);

			if (isValid) {
				return this.database.addValidDataset(dataset, content);
			} else {
				return Promise.reject(new InsightError());
			}
		} catch (err) {
			return Promise.reject(new InsightError());
		}
	}

	public removeDataset(id: string): Promise<string> {
		if (this.database.invalidId(id)) {
			return Promise.reject(new InsightError());
		} else if (!fs.existsSync("./data/" + id)) {
			return Promise.reject(new NotFoundError());
		} else {
			fs.rmSync("./data/" + id, {recursive: true, force: true});
			return Promise.resolve(id);
		}
	}

	public performQuery(query: unknown): Promise<InsightResult[]> {
		return Promise.reject("Not implemented.");
	}

	// not sure if we're allowed to have this async either
	public async listDatasets(): Promise<InsightDataset[]> {
		return Promise.reject("Not implemented.");
		// return this.database.toInsightDataset();
	}
}
