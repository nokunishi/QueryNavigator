import {
	IInsightFacade,
	InsightDatasetKind,
	InsightError,
	InsightResult,
	ResultTooLargeError,
	NotFoundError,
} from "../../src/controller/IInsightFacade";
import InsightFacade from "../../src/controller/InsightFacade";

import {folderTest} from "@ubccpsc310/folder-test";
import {expect, use} from "chai";
import chaiAsPromised from "chai-as-promised";
import {clearDisk, getContentFromArchives} from "../TestUtil";

use(chaiAsPromised);

describe("InsightFacade", function () {
	let facade: IInsightFacade;

	// Declare datasets used in tests. You should add more datasets like this!
	let pair: string;
	let campus: string;
	let sections: string;
	let cpsc110: string;
	let maths: string;
	let cs110And302: string;

	let invalidRootDir: string;
	let invalidCourseNotJson: string;
	let invalidCourseFormat: string;
	let invalidCourse: string;
	let invalidNoId: string;
	let invalidNoAudit: string;
	let validOneCourse: string;
	let validField: string;

	before(function () {
		// This block runs once and loads the datasets.
		pair = getContentFromArchives("pair.zip");
		campus = getContentFromArchives("campus.zip");
		sections = getContentFromArchives("courses100.zip");
		cpsc110 = getContentFromArchives("cpsc110.zip");
		maths = getContentFromArchives("maths.zip");
		cs110And302 = getContentFromArchives("cpsc110_302.zip");

		invalidRootDir = getContentFromArchives("invalid_root.zip");
		invalidCourseNotJson = getContentFromArchives("invalid_course_not_json.zip");
		invalidCourseFormat = getContentFromArchives("invalid_format.zip");

		invalidCourse = getContentFromArchives("invalid_course.zip");

		invalidNoId = getContentFromArchives("missing_id.zip");
		invalidNoAudit = getContentFromArchives("missing_audit.zip");

		validOneCourse = getContentFromArchives("valid_course.zip");
		validField = getContentFromArchives("valid_empty_str.zip");

		// Just in case there is anything hanging around from a previous run of the test suite
		clearDisk();
	});
	describe("AddDataset", function () {
		before(function () {
			console.info(`Before: ${this.test?.parent?.title}`);
		});
		beforeEach(function () {
			// This section resets the insightFacade instance
			// This runs before each test
			console.info(`BeforeTest: ${this.currentTest?.title}`);
			facade = new InsightFacade();
		});
		after(function () {
			console.info(`After: ${this.test?.parent?.title}`);
		});
		afterEach(function () {
			// This section resets the data directory (removing any cached data)
			// This runs after each test, which should make each test independent of the previous one
			console.info(`AfterTest: ${this.currentTest?.title}`);
			clearDisk();
		});
		/*
		// This is a unit test. You should create more like this!
		it("should reject with  an empty dataset id", function () {
			const result = facade.addDataset("", sections, InsightDatasetKind.Sections);
			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});
		it("should reject with  a only whitespace id", function () {
			const result = facade.addDataset(" ", sections, InsightDatasetKind.Sections);
			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});
		it("should reject with id containing underscore", function () {
			const result = facade.addDataset("some_data", sections, InsightDatasetKind.Sections);
			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});
		it("should resolve: unique id", function () {
			const result = facade.addDataset("dataset-no-1", sections, InsightDatasetKind.Sections);
			return expect(result).to.eventually.have.members(["dataset-no-1"]);
		});
		it("should reject with duplicate id", async function () {
			await facade.addDataset("pair zip", sections, InsightDatasetKind.Sections);
			try {
				await facade.addDataset("pair zip", sections, InsightDatasetKind.Sections);
				expect.fail("should have failed");
			} catch (err) {
				expect(err).to.be.instanceOf(InsightError);
			}
		});
		it("add: crash-consistency duplicate id", async function () {
			await facade.addDataset("pair 2", sections, InsightDatasetKind.Sections);
			const newFacade = new InsightFacade();
			try {
				await newFacade.addDataset("pair 2", sections, InsightDatasetKind.Sections);
				expect.fail("should have failed");
			} catch (err) {
				expect(err).to.be.instanceOf(InsightError);
			}
		});
		it("add: crash-consistency two unique ids", async function () {
			await facade.addDataset("some90", sections, InsightDatasetKind.Sections);
			const newFacade = new InsightFacade();
			const result2 = await newFacade.addDataset("some91", sections, InsightDatasetKind.Sections);
			console.log(result2);
			expect(result2).have.deep.members(["some90", "some91"]);
		});
		it("should resolve with two unique ids", async function () {
			await facade.addDataset("cpsc110-1", cpsc110, InsightDatasetKind.Sections);
			const add2 = await facade.addDataset("cpsc110-2", sections, InsightDatasetKind.Sections);
			expect(add2).have.deep.members(["cpsc110-1", "cpsc110-2"]);
		});
		it("should resolve with two different datasets", async function () {
			await facade.addDataset("id1", maths, InsightDatasetKind.Sections);
			const add2 = await facade.addDataset("id2", cpsc110, InsightDatasetKind.Sections);
			expect(add2).have.deep.members(["id1", "id2"]);
		});
		it("should reject with invalid kind", function () {
			const result = facade.addDataset("id1", sections, InsightDatasetKind.Rooms);
			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});
		it("should reject with invalid content", function () {
			const result = facade.addDataset("id1", "some file", InsightDatasetKind.Sections);
			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});
		it("should reject with invalid dataset: wrong root-dir", function () {
			const result = facade.addDataset("id1", invalidRootDir, InsightDatasetKind.Sections);
			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});
		it("should reject with invalid dataset: not json", function () {
			const result = facade.addDataset("id1", invalidCourseNotJson, InsightDatasetKind.Sections);
			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});
		it("should reject with invalid dataset: no valid_section", function () {
			const result = facade.addDataset("id1", invalidCourse, InsightDatasetKind.Sections);
			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});
		it("should reject with invalid dataset: wrong format", function () {
			const result = facade.addDataset("id1", invalidCourseFormat, InsightDatasetKind.Sections);
			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});
		it("should reject with invalid dataset: missing key id", function () {
			const result = facade.addDataset("id1", invalidNoId, InsightDatasetKind.Sections);
			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});
		it("should reject with invalid dataset: missing key audit", function () {
			const result = facade.addDataset("id1", invalidNoAudit, InsightDatasetKind.Sections);
			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});
		it("should resolve: one valid courses", function () {
			const result = facade.addDataset("valid course", validOneCourse, InsightDatasetKind.Sections);
			return expect(result).to.eventually.deep.members(["valid course"]);
		});
		it("should resolve: valid fields", function () {
			const result = facade.addDataset("valid-field", validField, InsightDatasetKind.Sections);
			return expect(result).to.eventually.deep.members(["valid-field"]);
		});
		*/
		it("testing rooms", async function () {
			const result = await facade.addDataset("rooms", campus, InsightDatasetKind.Rooms);
			return expect(result).have.deep.members(["rooms"]);
		});
	});

	/*
	describe("removeDataset", function () {
		before(function () {
			console.info(`Before: ${this.test?.parent?.title}`);
		});
		beforeEach(function () {
			// This section resets the insightFacade instance
			// This runs before each test
			console.info(`BeforeTest: ${this.currentTest?.title}`);
			facade = new InsightFacade();
		});
		after(function () {
			console.info(`After: ${this.test?.parent?.title}`);
		});
		afterEach(function () {
			// This section resets the data directory (removing any cached data)
			// This runs after each test, which should make each test independent of the previous one
			console.info(`AfterTest: ${this.currentTest?.title}`);
			clearDisk();
		});
		it("remove: should reject: id with an underscore: middle", function () {
			const result = facade.removeDataset("invalid_id");
			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});
		it("remove: should reject: id only whitespace", function () {
			const result = facade.removeDataset(" ");
			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});
		it("remove: should reject: id empty-string", function () {
			const result = facade.removeDataset("");
			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});
		it("should reject with non-existing id", function () {
			const result = facade.removeDataset("id1902");
			return expect(result).to.eventually.be.rejectedWith(NotFoundError);
		});
		it("should resolve: remove an existing id", async function () {
			const add = await facade.addDataset("id1", sections, InsightDatasetKind.Sections);
			const remove = await facade.removeDataset("id1");
			expect(remove).to.deep.equal("id1");
		});
		it("remove: crash-consistency", async function () {
			const add = await facade.addDataset("id1", sections, InsightDatasetKind.Sections);
			const newFacade = new InsightFacade();
			const remove = await newFacade.removeDataset("id1");
			expect(remove).to.deep.equal("id1");
		});
		it("remove: crash-consistency should reject with NotFoundError", async function () {
			const add = await facade.addDataset("id1", sections, InsightDatasetKind.Sections);
			const remove = await facade.removeDataset("id1");
			const newFacade = new InsightFacade();
			try {
				await newFacade.removeDataset("id1");
				expect.fail("should have failed");
			} catch (err) {
				expect(err).to.be.instanceof(NotFoundError);
			}
		});
		it("remove: crash-consistency should resolve", async function () {
			const add = await facade.addDataset("id1", sections, InsightDatasetKind.Sections);
			const remove = await facade.removeDataset("id1");
			const newFacade = new InsightFacade();
			const add2 = await newFacade.addDataset("id1", sections, InsightDatasetKind.Sections);
			expect(add2).to.have.deep.members(["id1"]);
		});
		it("remove multiple files", async function () {
			const add = await facade.addDataset("id29", sections, InsightDatasetKind.Sections);
			const add2 = await facade.addDataset("id28", cpsc110, InsightDatasetKind.Sections);
			const remove = await facade.removeDataset("id29");
			const remove2 = await facade.removeDataset("id28");
			expect(remove).to.deep.equal("id29");
			expect(remove2).to.deep.equal("id28");
		});
	});
	*/
	describe("listDataset", function () {
		before(function () {
			console.info(`Before: ${this.test?.parent?.title}`);
		});
		beforeEach(function () {
			// This section resets the insightFacade instance
			// This runs before each test
			console.info(`BeforeTest: ${this.currentTest?.title}`);
			facade = new InsightFacade();
		});
		after(function () {
			console.info(`After: ${this.test?.parent?.title}`);
		});
		afterEach(function () {
			// This section resets the data directory (removing any cached data)
			// This runs after each test, which should make each test independent of the previous one
			console.info(`AfterTest: ${this.currentTest?.title}`);
			clearDisk();
		});
		/*
		it("should resolve: return empty array", function () {
			const result = facade.listDatasets();
			return expect(result).to.eventually.be.empty;
		});
		it("should resolve: retrun empty array after removing", async function () {
			const add = await facade.addDataset("cs110", cpsc110, InsightDatasetKind.Sections);
			const remove = await facade.removeDataset("cs110");
			const result = await facade.listDatasets();
			expect(result).to.be.empty;
		});
		it("should resolve: array with one elem", async function () {
			const add = await facade.addDataset("cs110", cpsc110, InsightDatasetKind.Sections);
			const result = await facade.listDatasets();
			expect(result).have.deep.members([{id: "cs110", kind: InsightDatasetKind.Sections, numRows: 58}]);
		});
		it("should resolve: array with one elem 2", async function () {
			const add = await facade.addDataset("cs110-320", cs110And302, InsightDatasetKind.Sections);
			const result = await facade.listDatasets();
			expect(result).have.deep.members([{id: "cs110-320", kind: InsightDatasetKind.Sections, numRows: 76}]);
		});
		it("should resolve: array with two elems", async function () {
			const add1 = await facade.addDataset("cs110", cpsc110, InsightDatasetKind.Sections);
			const add2 = await facade.addDataset("cs110 & 302", cs110And302, InsightDatasetKind.Sections);
			const result = await facade.listDatasets();
			expect(result).have.deep.members([
				{id: "cs110", kind: InsightDatasetKind.Sections, numRows: 58},
				{id: "cs110 & 302", kind: InsightDatasetKind.Sections, numRows: 76},
			]);
		});
		it("should resolve: array with two elems, same file", async function () {
			const add1 = await facade.addDataset("cpsc110-w1", cpsc110, InsightDatasetKind.Sections);
			const add2 = await facade.addDataset("cpsc110-w2", cpsc110, InsightDatasetKind.Sections);
			const result = await facade.listDatasets();
			expect(result).have.deep.members([
				{id: "cpsc110-w1", kind: InsightDatasetKind.Sections, numRows: 58},
				{id: "cpsc110-w2", kind: InsightDatasetKind.Sections, numRows: 58},
			]);
		});
		it("should resolve: remove one elem", async function () {
			const add1 = await facade.addDataset("cs110", cpsc110, InsightDatasetKind.Sections);
			const add2 = await facade.addDataset("cpsc110, 302", cs110And302, InsightDatasetKind.Sections);
			const remove = await facade.removeDataset("cs110");
			const result = await facade.listDatasets();
			expect(result).have.deep.members([{id: "cpsc110, 302", kind: InsightDatasetKind.Sections, numRows: 76}]);
		});
		it("list: crash-consistency", async function () {
			const add1 = await facade.addDataset("cs110", cpsc110, InsightDatasetKind.Sections);
			const newFacade = new InsightFacade();
			const result = await newFacade.listDatasets();
			expect(result).have.deep.members([{id: "cs110", kind: InsightDatasetKind.Sections, numRows: 58}]);
		});
		it("list: crash-consistency: remove", async function () {
			const add1 = await facade.addDataset("cs110", cpsc110, InsightDatasetKind.Sections);
			const remove = await facade.removeDataset("cs110");
			const newFacade = new InsightFacade();
			const result = await newFacade.listDatasets();
			expect(result).to.be.empty;
		});
		it("list: crash-consistency: remove twice", async function () {
			const add1 = await facade.addDataset("cs110", cpsc110, InsightDatasetKind.Sections);
			const newFacade1 = new InsightFacade();
			const remove = await newFacade1.removeDataset("cs110");
			const newFacade2 = new InsightFacade();
			const result = await newFacade2.listDatasets();
			expect(result).to.be.empty;
		});
		*/
		it("should resolve: array with one elem  of type room", async function () {
			const add = await facade.addDataset("trial", campus, InsightDatasetKind.Rooms);
			const result = await facade.listDatasets();
			expect(result).have.deep.members([{id: "trial", kind: InsightDatasetKind.Rooms, numRows: 364}]);
		});
	});

	/*
	 * This test suite dynamically generates tests from the JSON files in test/resources/queries.
	 * You should not need to modify it; instead, add additional files to the queries directory.
	 * You can still make tests the normal way, this is just a convenient tool for a majority of queries.
	 */

	describe("performQuery", function () {
		type Error = "ResultTooLargeError" | "InsightError";
		before(async function () {
			clearDisk();
			facade = new InsightFacade();
			await facade.addDataset("sections", pair, InsightDatasetKind.Sections);
		});

		function assertResult(actual: unknown, expected: InsightResult[]): void {
			expect(actual).to.have.deep.members(expected);
		}

		function assertResultOrdered(actual: unknown, expected: InsightResult[]): void {
			expect(actual).to.have.deep.equals(expected);
		}

		function assertError(actual: unknown, expected: Error): void {
			if (expected === "ResultTooLargeError") {
				expect(actual).to.be.an.instanceOf(ResultTooLargeError);
			} else if (expected === "InsightError") {
				expect(actual).to.be.an.instanceOf(InsightError);
			} else {
				// this should be unreachable
				expect.fail("UNEXPECTED ERROR");
			}
		}

		function target(input: unknown): Promise<InsightResult[]> {
			return facade.performQuery(input);
		}

		// folderTest<unknown, InsightResult[], Error>("Add Dynamic", target, "./test/resources/queries_c0", {
		// 	assertOnResult: assertResult,
		// 	assertOnError: assertError,
		// });

		folderTest<unknown, InsightResult[], Error>("Add Dynamic", target, "./test/resources/queries_valid_unordered", {
			assertOnResult: assertResult,
			assertOnError: assertError,
		});

		/* folderTest<unknown, InsightResult[], Error>("Add Dynamic", target, "./test/resources/test_ordered", {
			assertOnResult: assertResultOrdered,
			assertOnError: assertError,
		}); */
		/* folderTest<unknown, InsightResult[], Error>("Add Dynamic", target, "./test/resources/test_ordered", {
			assertOnResult: assertResultOrdered,
			assertOnError: assertError,
		});
 */
		/* 		folderTest<unknown, InsightResult[], Error>("Add Dynamic", target, "./test/resources/test", {
			assertOnResult: assertResultOrdered,
			assertOnError: assertError,
		}); */
	});
});
