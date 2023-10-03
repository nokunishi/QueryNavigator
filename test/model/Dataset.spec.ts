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
import {Dataset} from "../../src/model/Dataset";
import {math321} from "../resources/archives/math321";
import {Section} from "../../src/model/Section";

use(chaiAsPromised);

describe("Dataset", function () {
	let mathData: Dataset;
	let cpsc110Data: Dataset;
	// Declare datasets used in tests. You should add more datasets like this!
	let maths: string;
	let cpsc110: string;

	let mathList = [
		"MATH001",
		"MATH002",
		"MATH100",
		"MATH101",
		"MATH102",
		"MATH103",
		"MATH104",
		"MATH105",
		"MATH110",
		"MATH120",
		"MATH121",
		"MATH152",
		"MATH180",
		"MATH184",
		"MATH190",
		"MATH321",
	];

	let math321Sections = math321;

	before(function () {
		// This block runs once and loads the datasets.
		maths = getContentFromArchives("maths.zip");
		cpsc110 = getContentFromArchives("cpsc110.zip");

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
			mathData = new Dataset("math");
			cpsc110Data = new Dataset("cpsc110");
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
		it("should resolve: List of Courses", async function () {
			let mathCourses = await mathData.getAllCourseNames();

			expect(mathCourses).have.deep.members(mathList);
		});

		it("should resolve: get Course result", async function () {
			let math321SectionsResult = await mathData.getSectionsJSON("MATH321");

			expect(math321SectionsResult).have.deep.members(math321Sections);
		});

		it("should resolve and return true: CPSC110", async function () {
			let sections = await cpsc110Data.getSectionsJSON("CPSC110");
			let result = cpsc110Data.isValidCourse(sections);
			let result2 = await cpsc110Data.isValidDataSet();

			expect(result).to.be.equal(true);
			expect(result2).to.be.equal(true);
		});

		it("should resolve and return true: maths", async function () {
			let result = await mathData.isValidDataSet();

			expect(result).to.be.equal(true);
		}); */
	});
});
