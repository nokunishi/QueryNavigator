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

			let dataset = new Dataset(id, content, kind);
			let isValid = await dataset.isValidDataSet();

			if (isValid) {
				return await this.database.addValidDataset(dataset);
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
			fs.unlinkSync("./data/" + id);
			return Promise.resolve(id);
		}
	}

	public performQuery(query: unknown): Promise<InsightResult[]> {
		return Promise.reject("Not implemented.");
	}

	public async listDatasets(): Promise<InsightDataset[]> {
		let insightDatasetList: InsightDataset[] = [];
		/*
		let ids = this.database.getAllIds();


		for await (const id of ids) {
			let dataset = this.database.readDataset(id);
			let numRows = await dataset.countNumRows();

			let obj: InsightDataset = {
				id: id,
				kind: dataset.kind,
				numRows: numRows,
			};

			insightDatasetList.push(obj);
		}
		*/

		return Promise.resolve(insightDatasetList);
	}
}
