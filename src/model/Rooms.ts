import {InsightError} from "../controller/IInsightFacade";
import JSZip, * as zip from "jszip";
import * as parse5 from "parse5";
import * as http from "http";

interface Node {
	nodeName: string;
	childNodes?: Node[];
	namespaceURI?: string;
	attrs?: any[];
	sourceCodeLocation?: any;
	data?: any;
}

interface GeoResponse {
	lat?: number;
	lon?: number;
	error?: string;
}

interface Room {
	FullName: string;
	ShortName: string;
	Number: number;
	Name: string;
	Address: string;
	Lon: number;
	Lat: number;
	Seats: string;
	Furniture: string;
	Type: string;
	Link: string;
}

export async function readRoomsZipFile(file: string): Promise<any[]> {
	let result: any[] = [];
	try {
		await zip.loadAsync(file, {base64: true}).then(async (unzip) => {
			const indexFile = unzip.file("index.htm");
			if (indexFile) {
				const data = await indexFile.async("string");
				const document = parse5.parse(data);
				const tableData = findAttribute(
					document?.childNodes?.find((node) => node.nodeName === "html"),
					"table"
				);
				if (tableData) {
					result = await parseTable(tableData, unzip);
				}
			}
		});
		if (result.length === 0) {
			return Promise.reject(new InsightError());
		} else {
			return Promise.resolve(result);
		}
	} catch (err) {
		return Promise.reject(new InsightError());
	}
}

async function parseTable(table: Node, unzip: JSZip): Promise<Room[]> {
	try {
		if (table.childNodes) {
			let headings: string[] = [];
			table.childNodes.forEach(async (node) => {
				if (node.nodeName === "thead") {
					for (const child of node.childNodes?.find((node2) => node2.nodeName === "tr")?.childNodes || []) {
						if (child.nodeName === "th") {
							headings.push((child.childNodes?.at(0) as any).value.replace(/^\n|\n$/g, "").trim());
						}
					}
				}
			});
			const tableBody = table.childNodes.find((node) => node.nodeName === "tbody");
			if (tableBody) {
				let bodyData = await parseTableBody(tableBody, headings, unzip);
				// console.log("RESULTS:::", bodyData);
				return Promise.resolve(addBuildingDataToRoom(bodyData));
			}
		}
		return Promise.reject(new InsightError());
	} catch (err) {
		return Promise.reject(new InsightError());
	}
}

/**
 * Parse the options of the query
 * @param link - The data to parse
 * @param title - true for title, false for link
 */
function parseLink(link: any, title: boolean): string {
	// title
	if (title) {
		return link.find((href: any) => href.nodeName === "a").childNodes[0].value;
	}
	// link
	return link.find((href: any) => href.nodeName === "a").attrs[0].value;
}

function parseText(text: any): string {
	return text[0].value.replace(/^\n|\n$/g, "").trim();
}

async function parseTableBody(node: Node, headings: string[], unzip: JSZip): Promise<any[]> {
	let result: any[] = [];
	if (node.nodeName === "tbody" && node.childNodes) {
		let columnDataPromises: Array<Promise<any>> = [];
		let locationDataPromises: Array<Promise<any>> = [];
		node.childNodes.forEach(async (child) => {
			let row: Array<{[key: string]: any}> = [];
			if (child.childNodes) {
				for (const column of child.childNodes) {
					if (column.nodeName === "td" && column.childNodes) {
						let h = headings[row.length];
						if (headings[row.length] === "Building") {
							row.push({[h]: parseLink(column.childNodes, true)});
							const buildingLink = parseLink(column.childNodes, false);
							const columnDataPromise = parseBuilding(buildingLink, unzip);
							columnDataPromises.push(columnDataPromise);
						} else {
							if (headings[row.length] === "Address") {
								let locProm = getBuildingLocation(encodeURIComponent(parseText(column.childNodes)));
								locationDataPromises.push(locProm);
							}
							row.push({[h]: parseText(column.childNodes)});
						}
					}
				}
				result.push(row);
			}
		});
		const columnDataResults = await Promise.all(columnDataPromises);
		const locationDataResults = await Promise.all(locationDataPromises);
		for (let i = 0; i < result.length; i++) {
			const buildingData = columnDataResults[i];
			const locationData = locationDataResults[i];
			result[i][4] = {Detail: buildingData};
			result[i][5] = {lat: locationData.lat};
			result[i][6] = {lon: locationData.lon};
		}
	}
	return Promise.resolve(result);
}

function addBuildingDataToRoom(buildings: any[]): Room[] {
	let allRooms: Room[] = [];
	buildings.forEach((building) => {
		const buildingData: any[] = [];
		const buildingCode = building.find((item: {Code: string}) => item.Code)?.Code;
		buildingData.push(buildingCode);
		const buildingName = building.find((item: {Building: string}) => item.Building)?.Building;
		buildingData.push(buildingName);
		const buildingAddress = building.find((item: {Address: string}) => item.Address)?.Address;
		buildingData.push(buildingAddress);
		const buildingLongitude = building.find((item: {lon: number}) => item.lon)?.lon;
		buildingData.push(buildingLongitude);
		const buildingLatitude = building.find((item: {lat: number}) => item.lat)?.lat;
		buildingData.push(buildingLatitude);
		// console.log("CODE - ", buildingCode);
		// console.log("NAME - ", buildingName);
		// console.log("ADDRESS - ", buildingAddress);
		// console.log("LONGITUDE - ", buildingLongitude);
		// console.log("LATITUDE - ", buildingLatitude);
		const rooms = building.find((item: {Detail: any[]}) => item.Detail)?.Detail;
		// console.log("ROOMS - ", rooms);
		// console.log("------------------");
		allRooms = [...createRoomObject(buildingData, rooms), ...allRooms];
	});
	return allRooms;
	// console.log("ALL ROOMS - ", allRooms);
}

function createRoomObject(buildingData: any[], rooms: any[]) {
	let buildingRooms: Room[] = [];
	if (rooms) {
		for (const room of rooms) {
			let roomObject: Room = {
				FullName: buildingData[1],
				ShortName: buildingData[0],
				Number: room.Room,
				Name: buildingData[0] + "_" + room.Room,
				Address: buildingData[2],
				Lon: buildingData[3],
				Lat: buildingData[4],
				Seats: room.Capacity,
				Furniture: room["Furniture type"],
				Type: room["Room type"],
				Link: room.Link,
			};
			buildingRooms.push(roomObject);
		}
	}
	return buildingRooms;
}

async function getBuildingLocation(buildingAddress: string): Promise<GeoResponse> {
	return new Promise((resolve, reject) => {
		const reqURL = "http://cs310.students.cs.ubc.ca:11316/api/v1/project_team232/";
		http.get(reqURL + buildingAddress, (res) => {
			let location = "";
			res.on("data", (chunk) => {
				location += chunk;
			});
			res.on("end", () => {
				// console.log("location", location);
				resolve(JSON.parse(location));
				reject(new InsightError("Error getting location"));
			});
		});
	});
}

async function parseBuilding(buildingLink: string, unzip: JSZip): Promise<any> {
	// console.log(buildingLink);
	try {
		const roomFile = unzip.file(buildingLink.substring(2));
		if (roomFile) {
			const data = await roomFile.async("string");
			const document = parse5.parse(data);
			const tableData = findAttribute(
				document?.childNodes?.find((node) => node.nodeName === "html"),
				"table"
			);
			if (tableData) {
				const roomsData = parseBuildingTable(tableData);
				return Promise.resolve(roomsData);
			}
		}
	} catch (err) {
		return Promise.reject(new InsightError());
	}
}

function parseBuildingTable(table: Node): any {
	let headings = [];
	let result = [];
	if (!table.childNodes) {
		return [];
	}
	for (const node of table.childNodes) {
		if (node.nodeName === "thead") {
			for (const child of node.childNodes?.find((node2) => node2.nodeName === "tr")?.childNodes || []) {
				if (child.nodeName === "th") {
					headings.push((child.childNodes?.at(0) as any).value.replace(/^\n|\n$/g, "").trim());
				}
			}
		}
		if (node.nodeName === "tbody" && node.childNodes) {
			// Get row
			for (const child of node.childNodes) {
				// Get column
				let row: {[key: string]: string} = {};
				if (child.childNodes) {
					for (const column of child.childNodes) {
						// Get building
						if (column.nodeName === "td" && column.childNodes) {
							let num = Object.keys(row).length;
							if (headings[num] === "") {
								row["Link"] = parseLink(column.childNodes, false);
							} else if (headings[num] === "Room") {
								row[headings[num]] = parseLink(column.childNodes, true);
							} else {
								row[headings[num]] = parseText(column.childNodes);
							}
						}
					}
					result.push(row);
				}
			}
		}
	}
	return result;
}

function findAttribute(json: Node | undefined, attribute: string): Node | null {
	if (!json) {
		return null;
	}
	// if the current node has the attribute, return it
	if (json.childNodes && json.childNodes.find((node) => node.nodeName === attribute)) {
		return json.childNodes.find((node) => node.nodeName === attribute) as Node;
	} else {
		if (json.childNodes) {
			let result: Node | null = null;
			for (const node of json.childNodes) {
				if (node.childNodes) {
					result = findAttribute(node, attribute);
				}
				if (result?.nodeName === attribute) {
					return result;
				}
			}
		}
		return null;
	}
}
