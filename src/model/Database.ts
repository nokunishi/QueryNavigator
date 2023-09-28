import * as fs from "fs-extra";
import {Section} from "./Section";
import * as zip from "jszip";
import {getContentFromArchives} from "../../test/TestUtil";
import {Dataset} from "./Dataset";
import {InsightError} from "../controller/IInsightFacade";

// list of valid datasets
export class Database {
	private dataBase: Dataset[];
	private ids: string[];

	constructor() {
		this.dataBase = [];
		this.ids = [];
	}

	public invalidId(id: string): boolean {
		return id === "" || id.includes("_") || id === " " || this.ids.includes(id);
	}

	public addValidDataset(dataset: Dataset): string[] {
		this.ids.push(dataset.id);
		this.dataBase.push(dataset);

		return this.ids;
	}
}
