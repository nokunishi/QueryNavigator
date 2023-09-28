import {
	IInsightFacade,
	InsightDatasetKind,
	InsightError,
	InsightResult,
	ResultTooLargeError,
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
	let sections: string;
	let cpsc110: string;
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
		sections = getContentFromArchives("pair.zip");
		cpsc110 = getContentFromArchives("cpsc110.zip");
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

	describe("Add/  Dataset", function () {
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

		it("should resolve", function () {
			const result = facade.addDataset("id1", sections, InsightDatasetKind.Sections);
			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});

		it("should reject with duplicate id", async function () {
			await facade.addDataset(
				"some-id",
				sections, // cpsc110,
				InsightDatasetKind.Sections
			);

			try {
				await facade.addDataset("some-id", sections, InsightDatasetKind.Sections);
				expect.fail("should have failed");
			} catch (err) {
				expect(err).to.be.instanceOf(InsightError);
			}
		});

		it("add: crash-consistency", async function () {
			await facade.addDataset("some", sections, InsightDatasetKind.Sections);

			const newFacade = new InsightFacade();

			try {
				await newFacade.addDataset("some", sections, InsightDatasetKind.Sections);

				expect.fail("should have failed");
			} catch (err) {
				expect(err).to.be.instanceOf(InsightError);
			}
		});

		it("add: crash-consistency 2", async function () {
			await facade.addDataset("some90", sections, InsightDatasetKind.Sections);

			const newFacade = new InsightFacade();

			const result2 = await newFacade.addDataset("some91", sections, InsightDatasetKind.Sections);

			expect(result2).have.deep.members(["some90", "some91"]);
		});

		it("should resolve with two unique id", async function () {
			await facade.addDataset("id1", sections, InsightDatasetKind.Sections);

			const add2 = await facade.addDataset("id2", sections, InsightDatasetKind.Sections);

			expect(add2).have.deep.members(["id1", "id2"]);
		});

		it("should resolve with two different datasets", async function () {
			await facade.addDataset("id1", sections, InsightDatasetKind.Sections);

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
			const result = facade.addDataset("one course", validOneCourse, InsightDatasetKind.Sections);

			return expect(result).to.eventually.deep.members(["one course"]);
		});

		it("should resolve: valid fields", function () {
			const result = facade.addDataset("valid-field", validField, InsightDatasetKind.Sections);

			return expect(result).to.eventually.deep.members(["valid-field"]);
		});
	});

	/*
	 * This test suite dynamically generates tests from the JSON files in test/resources/queries.
	 * You should not need to modify it; instead, add additional files to the queries directory.
	 * You can still make tests the normal way, this is just a convenient tool for a majority of queries.
	 */
	describe("PerformQuery", () => {
		before(function () {
			console.info(`Before: ${this.test?.parent?.title}`);

			facade = new InsightFacade();

			// Load the datasets specified in datasetsToQuery and add them to InsightFacade.
			// Will *fail* if there is a problem reading ANY dataset.
			const loadDatasetPromises = [facade.addDataset("sections", sections, InsightDatasetKind.Sections)];

			return Promise.all(loadDatasetPromises);
		});

		after(function () {
			console.info(`After: ${this.test?.parent?.title}`);
			clearDisk();
		});

		type PQErrorKind = "ResultTooLargeError" | "InsightError";

		folderTest<unknown, Promise<InsightResult[]>, PQErrorKind>(
			"Dynamic InsightFacade PerformQuery tests",
			(input) => facade.performQuery(input),
			"./test/resources/queries",
			{
				assertOnResult: (actual, expected) => {
					// TODO add an assertion!
				},
				errorValidator: (error): error is PQErrorKind =>
					error === "ResultTooLargeError" || error === "InsightError",
				assertOnError: (actual, expected) => {
					// TODO add an assertion!
				},
			}
		);
	});
});
