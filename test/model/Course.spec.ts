import {folderTest} from "@ubccpsc310/folder-test";
import {expect, use} from "chai";
import chaiAsPromised from "chai-as-promised";
import {clearDisk, getContentFromArchives} from "../TestUtil";
import {Dataset} from "../../src/model/Dataset";
import {math120} from "../resources/archives/math120";
import {Section} from "../../src/model/Section";
import {Course} from "../../src/model/Course";

use(chaiAsPromised);

describe("Course", function () {
	it("should resolve: section course", async function () {
		let path = getContentFromArchives("cpsc110.zip");
		// let course = new Course(path);

		// expect(course.isValid(path)).to.be.equal(true);
	});
});
