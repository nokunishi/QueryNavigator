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
import {Query, parseWhere} from "../query/QueryParser";
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
				return Promise.reject(new InsightError());
			}

			if (kind === InsightDatasetKind.Rooms) {
				return Promise.reject(new InsightError());
			}

			return this.database.addValidDataset(id, content, kind);
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

	// todo: change to non-async
	public performQuery(query: unknown): Promise<InsightResult[]> {
		try {
			if (query === null) {
				return Promise.reject(new InsightError("Query is null"));
			}

			if (typeof query === "object") {
				query = JSON.stringify(query);
			}

			if (typeof query !== "string") {
				return Promise.reject(new InsightError("Query is not a string"));
			}

			const queryObject: Query = JSON.parse(query);

			if (!queryObject.OPTIONS || !queryObject.OPTIONS.COLUMNS) {
				return Promise.reject(new InsightError("missing OPTIONS/COLUMNS"));
			} else if (queryObject.OPTIONS.COLUMNS.length === 0) {
				return Promise.reject(new InsightError("empty COLUMNS"));
			}

			// Get name of the dataset
			let datasetId = queryObject.OPTIONS.COLUMNS[0].split("_")[0];
			if (!queryObject.WHERE) {
				return Promise.reject(new InsightError("Missing WHERE clause"));
			}
			let result = parseWhere(queryObject.WHERE, this.database.readDataset(datasetId));

			// aggregate on 'result'
			if (queryObject.TRANSFORMATIONS) {
				if (!queryObject.TRANSFORMATIONS.GROUP || !queryObject.TRANSFORMATIONS.APPLY) {
					return Promise.reject(new InsightError("Missing GROUP or APPLY clause"));
				}
				let resultAggregate = parseTransformation(
					queryObject.OPTIONS,
					queryObject.TRANSFORMATIONS.GROUP,
					queryObject.TRANSFORMATIONS.APPLY,
					result
				);

				return parseOptions(queryObject.OPTIONS, resultAggregate, queryObject.TRANSFORMATIONS.APPLY);
			} else {
				return parseOptions(queryObject.OPTIONS, result);
			}
		} catch (error) {
			console.log(error);
			return Promise.reject(new InsightError());
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

			dataset.forEach((course: string) => {
				// course.length = num of sections in each course
				sum += course.length;
			});

			let insightDataset: InsightDataset = {
				id: datasetId,
				kind: InsightDatasetKind.Sections,
				numRows: sum,
			};

			insightDatasetLists.push(insightDataset);
		});

		return Promise.resolve(insightDatasetLists);
	}
}
