import {
	IInsightFacade,
	InsightDataset,
	InsightDatasetKind,
	InsightError,
	InsightResult,
	NotFoundError,
} from "./IInsightFacade";

import {Database} from "../model/Database";
import * as fs from "fs-extra";
import {parseQuery, parseWhere} from "../query/QueryParser";
import {parseTransformation} from "../query/QueryAggregate";
import {parseOptions} from "../query/QueryRender";
// import {Query, parseOptions, parseWhere} from "../query/QueryParser";

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
				return Promise.reject(new InsightError("invalid id"));
			}
			if (kind) {
				return this.database.addValidDataset(id, content, kind);
			} else {
				return Promise.reject(new InsightError("kind cannot be null"));
			}
		} catch (err) {
			return Promise.reject(new InsightError());
		}
	}

	public removeDataset(id: string): Promise<string> {
		if (this.database.invalidId(id)) {
			return Promise.reject(new InsightError("invalid id"));
		} else if (!fs.existsSync("./data/" + id)) {
			return Promise.reject(new NotFoundError("dataset with given id is not found"));
		} else {
			fs.unlinkSync("./data/" + id);
			return Promise.resolve(id);
		}
	}

	public performQuery(query: unknown): Promise<InsightResult[]> {
		try {
			let queryObject = parseQuery(query);
			if (!queryObject.WHERE || !queryObject.OPTIONS || !queryObject.OPTIONS.COLUMNS) {
				return Promise.reject(new InsightError("missing WHERE/OPTIONS/COLUMNS"));
			} else if (queryObject.OPTIONS.COLUMNS.length === 0) {
				return Promise.reject(new InsightError("empty COLUMNS"));
			}
			let datasetId = "";
			try {
				if (queryObject.TRANSFORMATIONS) {
					datasetId = queryObject.TRANSFORMATIONS.GROUP[0].split("_")[0];
				} else {
					datasetId = queryObject.OPTIONS.COLUMNS[0].split("_")[0];
				}
				// TODO check if datasetId is valid by checking if it exists in database
			} catch (err) {
				throw new InsightError("invalid dataset id");
			}
			let result = parseWhere(queryObject.WHERE, this.database.readDataset(datasetId), datasetId);

			// aggregate on 'result'
			if (queryObject.TRANSFORMATIONS) {
				if (!queryObject.TRANSFORMATIONS.GROUP || !queryObject.TRANSFORMATIONS.APPLY) {
					return Promise.reject(new InsightError("Missing GROUP or APPLY clause"));
				}
				let resultAggregate = parseTransformation(
					queryObject.OPTIONS,
					queryObject.TRANSFORMATIONS.GROUP,
					queryObject.TRANSFORMATIONS.APPLY,
					result,
					datasetId
				);

				return parseOptions(queryObject.OPTIONS, resultAggregate, queryObject.TRANSFORMATIONS.APPLY);
			} else {
				return parseOptions(queryObject.OPTIONS, result);
			}
		} catch (error) {
			console.log(error);
			return Promise.reject(new InsightError("XD"));
		}
	}

	// not sure if we're allowed to have this async either
	public listDatasets(): Promise<InsightDataset[]> {
		let insightDatasetLists: InsightDataset[] = [];
		let datasetIds = this.database.getAllIds();

		datasetIds.forEach((datasetId) => {
			let datasetString = fs.readFileSync("./data/" + datasetId).toString();
			let dataset = JSON.parse(datasetString);
			let sum = 0;

			// boolean for checking if dataset is rooms or courses
			const checkRoom: boolean = Object.prototype.hasOwnProperty.call(dataset[0], "Lat");

			if (!checkRoom) {
				dataset.forEach((course: any) => {
					sum += course.length;
				});
			} else {
				sum = dataset.length;
			}

			// console.log(sum);

			let insightDataset: InsightDataset = {
				id: datasetId,
				kind: checkRoom ? InsightDatasetKind.Rooms : InsightDatasetKind.Sections,
				numRows: sum,
			};

			insightDatasetLists.push(insightDataset);
		});

		return Promise.resolve(insightDatasetLists);
	}
}
