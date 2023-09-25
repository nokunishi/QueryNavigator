import {
	IInsightFacade,
	InsightDataset,
	InsightDatasetKind,
	InsightError,
	InsightResult,
	NotFoundError,
} from "./IInsightFacade";

import * as fs from "fs-extra";
import * as zip from "jszip";
import {Dataset} from "../model/dataset";

/**
 * This is the main programmatic entry point for the project.
 * Method documentation is in IInsightFacade
 *
 */
export default class InsightFacade implements IInsightFacade {
	constructor() {
		console.log("InsightFacadeImpl::init()");
	}

	public async addDataset(id: string, content: string, kind: InsightDatasetKind): Promise<string[]> {
		if (id === "" || id.includes("_") || id === " ") {
			return Promise.reject(new InsightError());
		}

		let section = fs.readFileSync("test/resources/archives/cpsc110.zip").toString("base64");
		let dataset = new Dataset();

		dataset.isValidCourse(0);

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
