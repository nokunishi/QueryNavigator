import {timeLog} from "console";

type MField = string | undefined;
type SField = number | undefined;

export class Section {
	private readonly id: MField;
	private readonly uuid: MField;
	private readonly title: MField;
	private readonly instructor: MField;
	private readonly dept: MField;
	private readonly year: SField;
	private readonly avg: SField;
	private readonly pass: SField;
	private readonly fail: SField;
	private readonly audit: SField;

	constructor(section: any) {
		this.id = section["id"];
		this.uuid = section["uuid"];
		this.title = section["title"];
		this.instructor = section["instructor"];
		this.dept = section["dept"];
		this.year = section["year"];
		this.avg = section["avg"];
		this.pass = section["pass"];
		this.fail = section["fail"];
		this.audit = section["audit"];
	}

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
}
