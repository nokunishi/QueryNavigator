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
	let rooms: Buffer;
	let query: any;
	let queryRoom: any;

	const SERVER_URL = "http://localhost:4321";

	before(async function () {
		clearDisk();

		pair = fs.readFileSync("test/resources/archives/pair.zip");
		rooms = fs.readFileSync("test/resources/archives/campus.zip");
		let queryFile = fs.readFileSync("test/resources/queries_aggregate/query1.json").toString();
		query = JSON.parse(queryFile)["input"];

		let queryRoomFile = fs.readFileSync("test/resources/rooms/valid_room_lat.json").toString();
		queryRoom = JSON.parse(queryRoomFile)["input"];

		facade = new InsightFacade();

		server = new Server(4321);

		// TODO: start server here once and handle errors properly
		try {
			await server.start();
		} catch (err) {
			console.log("failed to start server");
		}
	});

	after(async function () {
		// TODO: stop server here once!
		try {
			await server.stop();
			clearDisk();
		} catch (err) {
			console.log("failed to stop server");
		}
	});

	beforeEach(function () {
		// might want to add some process logging here to keep track of what is going on
	});

	afterEach(function () {
		// might want to add some process logging here to keep track of what is going on
	});

	describe("test 1", function () {
		it("PUT test for courses dataset", function () {
			try {
				return request(SERVER_URL)
					.put("/dataset/pair/sections")
					.send(pair)
					.set("Content-Type", "application/x-zip-compressed")
					.then(function (res: Response) {
						expect((res.body["result"] as any[]).includes("pair"));
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
				let lists = await facade.listDatasets();
				return request(SERVER_URL)
					.get("/datasets")
					.then(function (res: Response) {
						expect((res.body["result"] as any[]).includes(lists[0]));
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
						expect(res.body["error"]).to.be.an("string");
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
						expect(res.body["error"]).to.be.an("string");
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

		it("PUT test for courses dataset", async function () {
			try {
				return request(SERVER_URL)
					.put("/dataset/sections/sections")
					.send(pair)
					.set("Content-Type", "application/x-zip-compressed")
					.then(function (res: Response) {
						expect(res.body["result"]).includes("pair");
						expect(res.body["result"]).includes("sections");
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
				let result = await facade.performQuery(query);

				return request(SERVER_URL)
					.post("/query")
					.send(query)
					.then(function (res: Response) {
						for (const r of result) {
							expect((res.body["result"] as any[]).includes(r));
						}
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
						expect(res.body["error"]).to.be.an("string");
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
						expect(res.body["result"]).to.be.an("string").equals("pair");
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
						expect(res.body["error"]).to.be.an("string");
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
	});

	describe("test 2", function () {
		it("Room: PUT test for courses dataset", function () {
			try {
				return request(SERVER_URL)
					.put("/dataset/rooms/rooms")
					.send(rooms)
					.set("Content-Type", "application/x-zip-compressed")
					.then(function (res: Response) {
						expect(res.body["result"]).includes("sections");
						expect(res.body["result"]).includes("rooms");
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

		it("Room: POST test for courses dataset", async function () {
			try {
				await server.stop();
			} catch (err) {
				console.log("failed to stop server");
			}
			try {
				server = new Server(4321);
				await server.start();
			} catch (err) {
				console.log("failed to restart server");
			}
			try {
				let result = await facade.performQuery(queryRoom);
				return request(SERVER_URL)
					.post("/query")
					.send(queryRoom)
					.then(function (res: Response) {
						for (const r of result) {
							expect((res.body["result"] as any[]).includes(r));
						}
						expect(res.status).to.be.equal(200);
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
	});

	// The other endpoints work similarly. You should be able to find all instructions at the supertest documentation
});
