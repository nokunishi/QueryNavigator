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
	private dataBase: Database;

	constructor() {
		this.dataBase = new Database();
		console.log("InsightFacadeImpl::init()");
	}

	public async addDataset(id: string, content: string, kind: InsightDatasetKind): Promise<string[]> {
		if (this.dataBase.invalidId(id)) {
			return Promise.reject(new InsightError());
		}

		if (kind === InsightDatasetKind.Rooms) {
			return Promise.reject(new InsightError());
		}

		/* let dataset = new Dataset(id, content);

		if (await dataset.isValidDataSet()) {
			return Promise.resolve(this.dataBase.addValidDataset(dataset));
		} else {
			return Promise.reject(new InsightError());
		} */

		return Promise.resolve(["id"]);
	}

	public removeDataset(id: string): Promise<string> {
		return Promise.reject("Not implemented.");
	}

	public performQuery(query: unknown): Promise<InsightResult[]> {
		return Promise.reject("Not implemented.");
	}

	public listDatasets(): Promise<InsightDataset[]> {
		return Promise.reject("Not implemented.");
	}
}
