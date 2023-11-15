import Server from "../../src/rest/Server";
import InsightFacade from "../../src/controller/InsightFacade";

import {expect} from "chai";
import request, {Response, SuperTest} from "supertest";
import {clearDisk} from "../TestUtil";
import * as fs from "fs-extra";
import {InsightDatasetKind} from "../../src/controller/IInsightFacade";

describe("Facade D3", function () {
	let facade: InsightFacade;
	let server: Server;
	let pair: Buffer;
	let campus: Buffer;
	let query: any;

	const SERVER_URL = "http://localhost:4321";

	before(async function () {
		clearDisk();

		pair = fs.readFileSync("test/resources/archives/pair.zip");
		campus = fs.readFileSync("test/resources/archives/campus.zip");
		let queryFile = fs.readFileSync("test/resources/queries_aggregate/query1.json").toString();
		query = JSON.parse(queryFile)["input"];

		facade = new InsightFacade();

		server = new Server(4321);

		// TODO: start server here once and handle errors properly
		try {
			await server.start();
		} catch (err) {
			console.log("failed to start server");
		}
	});

	after(function () {
		// TODO: stop server here once!
		server.stop();
	});

	beforeEach(function () {
		// might want to add some process logging here to keep track of what is going on
	});

	afterEach(function () {
		// might want to add some process logging here to keep track of what is going on
	});

	it("PUT test for courses dataset", function () {
		try {
			return request(SERVER_URL)
				.put("/dataset/pair/sections")
				.send(pair)
				.set("Content-Type", "application/x-zip-compressed")
				.then(function (res: Response) {
					// console.log(res);
					expect(res.status).to.be.equal(200);
				})
				.catch(function (err) {
					// console.log(err);
					expect.fail();
				});
		} catch (err) {
			// console.log(err);
			// and some more logging here!
		}
	});

	// Sample on how to format PUT requests
	it("GET test for courses dataset", async function () {
		try {
			return request(SERVER_URL)
				.get("/datasets")
				.then(function (res: Response) {
					expect(res.status).to.be.equal(200);
				})
				.catch(function (err) {
					expect.fail();
				});
		} catch (err) {
			// console.log(err);
			// and some more logging here!
		}
	});

	it("fail: PUT test for courses dataset", function () {
		try {
			return request(SERVER_URL)
				.put("/dataset/pair/sections")
				.send(pair)
				.set("Content-Type", "application/x-zip-compressed")
				.then(function (res: Response) {
					// console.log(res);
					expect(res.status).to.be.equal(400);
				})
				.catch(function (err) {
					// console.log(err);
					expect.fail();
				});
		} catch (err) {
			// console.log(err);
			// and some more logging here!
		}
	});

	it("fail: POST test for courses dataset", async function () {
		try {
			return request(SERVER_URL)
				.post("/query")
				.send(query)
				.then(function (res: Response) {
					expect(res.status).to.be.equal(400);
				})
				.catch(function (err) {
					console.log(err);
					expect.fail();
				});
		} catch (err) {
			// console.log(err);
			// and some more logging here!
		}
	});

	it("PUT test for courses dataset", function () {
		try {
			return request(SERVER_URL)
				.put("/dataset/sections/sections")
				.send(pair)
				.set("Content-Type", "application/x-zip-compressed")
				.then(function (res: Response) {
					// console.log(res);
					expect(res.status).to.be.equal(200);
				})
				.catch(function (err) {
					// console.log(err);
					expect.fail();
				});
		} catch (err) {
			// console.log(err);
			// and some more logging here!
		}
	});

	it("POST test for courses dataset", async function () {
		try {
			return request(SERVER_URL)
				.post("/query")
				.send(query)
				.then(function (res: Response) {
					expect(res.status).to.be.equal(200);
				})
				.catch(function (err) {
					// console.log(err);
					expect.fail();
				});
		} catch (err) {
			// console.log(err);
			// and some more logging here!
		}
	});

	it("fail with InsightError: REMOVE test for courses dataset", async function () {
		try {
			return request(SERVER_URL)
				.delete("/dataset/invalid_id")
				.then(function (res: Response) {
					expect(res.status).to.be.equal(400);
				})
				.catch(function (err) {
					expect.fail();
				});
		} catch (err) {
			// console.log(err);
			// and some more logging here!
		}
	});

	// Sample on how to format PUT requests
	it("REMOVE test for courses dataset", async function () {
		try {
			return request(SERVER_URL)
				.delete("/dataset/pair")
				.then(function (res: Response) {
					expect(res.status).to.be.equal(200);
				})
				.catch(function (err) {
					expect.fail();
				});
		} catch (err) {
			// console.log(err);
			// and some more logging here!
		}
	});

	it("fail with NotFoundError: REMOVE test for courses dataset2", async function () {
		try {
			return request(SERVER_URL)
				.delete("/dataset/pair")
				.then(function (res: Response) {
					expect(res.status).to.be.equal(404);
				})
				.catch(function (err) {
					// console.log(err);
					expect.fail();
				});
		} catch (err) {
			// console.log(err);
			// and some more logging here!
		}
	});

	// The other endpoints work similarly. You should be able to find all instructions at the supertest documentation
});
