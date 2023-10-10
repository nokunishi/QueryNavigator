/**
 * Dataset class
 * @param {string} id id of the dataset
 * @param {Array<{[key: string]: any}>} data data in JSON
 */
export class Dataset {
	public id: string;
	public data: Array<{[key: string]: any}>;

	constructor(id: string, data: Array<{[key: string]: any}>) {
		this.id = id;
		this.data = data;
	}

	public getID(): string {
		return this.id;
	}

	public getData(): Array<{[key: string]: any}> {
		return this.data;
	}
}
