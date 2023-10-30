import {timeLog} from "console";

type MField = string | undefined;
type SField = number | undefined;

export class Section {
	private readonly id: MField;
	private readonly uuid: MField;
	private readonly title: MField;
	private readonly instructor: MField;
	private readonly dept: MField;
	public year: SField;
	private readonly avg: SField;
	private readonly pass: SField;
	private readonly fail: SField;
	private readonly audit: SField;

	public readonly section: MField; // not really, but it's string | null

	constructor(section: any) {
		this.id = section["id"];
		this.uuid = section["Course"];
		this.title = section["Title"];
		this.instructor = section["Professor"];
		this.dept = section["Subject"];
		this.year = section["Year"];
		this.avg = section["Avg"];
		this.pass = section["Pass"];
		this.fail = section["Fail"];
		this.audit = section["Audit"];

		this.section = section["Section"];
	}

	// check if it's valid, also set year = 1900 if Sections == overall
	public isValid(): boolean {
		return (
			this.id !== undefined &&
			this.uuid !== undefined &&
			this.title !== undefined &&
			this.instructor !== undefined &&
			this.dept !== undefined &&
			this.year !== undefined &&
			this.avg !== undefined &&
			this.pass !== undefined &&
			this.fail !== undefined &&
			this.audit !== undefined
		);
	}

	public getValue(field: string): string | number | undefined {
		switch (field) {
			case "id":
				return this.id;
			case "uuid":
				return this.uuid;
			case "title":
				return this.title;
			case "instructor":
				return this.instructor;
			case "dept":
				return this.dept;
			case "year":
				return this.year;
			case "avg":
				return this.avg;
			case "pass":
				return this.pass;
			case "fail":
				return this.fail;
			case "audit":
				return this.audit;
		}
	}
}
