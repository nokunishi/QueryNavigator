import {InsightError} from "../controller/IInsightFacade";
import * as zip from "jszip";
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
				// console.log("INDEX", document);
				if (document) {
					console.log(
						findAttribute(
							document?.childNodes?.find((node) => node.nodeName === "html"),
							"tbody"
						)
					);
				}
			}
		});
		return Promise.resolve(rooms);
	} catch (err) {
		return Promise.reject(new InsightError());
	}
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
