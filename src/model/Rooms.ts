import {InsightError} from "../controller/IInsightFacade";
import JSZip, * as zip from "jszip";
import * as parse5 from "parse5";

interface Node {
	nodeName: string;
	childNodes?: Node[];
	namespaceURI?: string;
	attrs?: any[];
	sourceCodeLocation?: any;
	data?: any;
}

export async function readRoomsZipFile(file: string): Promise<any[]> {
	try {
		let rooms: any[] = [];

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
					parseTable(tableData, unzip);
				}
			}
		});
		return Promise.resolve(rooms);
	} catch (err) {
		return Promise.reject(new InsightError());
	}
}

async function parseTable(table: Node, unzip: JSZip) {
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
			let result: any[] = [];
			if (node.nodeName === "tbody" && node.childNodes) {
				let columnDataPromises: Array<Promise<any>> = [];
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
									// row.push({Detail: null});
								} else {
									row.push({[h]: parseText(column.childNodes)});
								}
							}
						}
						result.push(row);
					}
					// console.log(result);
				});
				const columnDataResults = await Promise.all(columnDataPromises);
				for (let i = 0; i < result.length; i++) {
					const buildingData = columnDataResults[i];
					result[i][4] = {Detail: buildingData};
				}
			}
			console.log("RRRR", result);
		});
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
				let row = [];
				if (child.childNodes) {
					for (const column of child.childNodes) {
						// Get building
						if (column.nodeName === "td" && column.childNodes) {
							if (headings[row.length] === "Room") {
								row.push([headings[row.length], parseLink(column.childNodes, true)]);
							} else {
								row.push([headings[row.length], parseText(column.childNodes)]);
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
