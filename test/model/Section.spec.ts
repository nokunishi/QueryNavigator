import {folderTest} from "@ubccpsc310/folder-test";
import {expect, use} from "chai";
import chaiAsPromised from "chai-as-promised";
import {clearDisk, getContentFromArchives} from "../TestUtil";
import {Dataset} from "../../src/model/Dataset";
import {math120} from "../resources/archives/math120";
import {Section} from "../../src/model/Section";

use(chaiAsPromised);

describe("Section", function () {
	it("should resolve: section valid", async function () {
		let validSection = {
			id: "id",
			uuid: "uuid",
			title: "title",
			instructor: "gregor",
			dept: "cpsc",
			year: 2000,
			avg: 80,
			pass: 300,
			fail: 30,
			audit: 10,
		};

		let section = new Section(validSection);

		expect(section.isValid()).to.be.equal(true);
	});

	it("should reject: section invalid", async function () {
		let invalidSection = {
			id: "id",
			uuid: "uuid",
			title: "title",
			instructor: "gregor",
			dept: "cpsc",
			year: undefined,
			avg: 80,
			pass: 300,
			fail: 30,
			audit: 10,
		};

		let invalidSection2 = {
			id: "id",
			uuid: "uuid",
			title: "title",
			dept: "cpsc",
			year: 9000,
			avg: 80,
			pass: 300,
			fail: 30,
			audit: 10,
		};

		let invalidSection3 = {
			id: "id",
			uuid: "uuid",
			title: "title",
			instructor: "gregor",
			dept: "cpsc",
			year: 9000,
			pass: 300,
			fail: 30,
			audit: 10,
		};

		let section1 = new Section(invalidSection);
		let section2 = new Section(invalidSection2);
		let section3 = new Section(invalidSection3);

		expect(section1.isValid()).to.be.equal(false);
		expect(section2.isValid()).to.be.equal(false);
		expect(section3.isValid()).to.be.equal(false);
	});
});
