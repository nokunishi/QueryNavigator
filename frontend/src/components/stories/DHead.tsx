import {useRef} from "react";
import "../../assets/styles/app.css";

type Props = {
	queryFunction: (query: string) => void;
	setStoryError: (error: string) => void;
	dataset: string;
};

export default function DHead(props: Props) {
	const deptRef = useRef<HTMLInputElement>(null);
	const courseRef = useRef<HTMLInputElement>(null);
	const datasetRef = useRef<HTMLInputElement>(null);
	const yearRef = useRef<HTMLInputElement>(null);

	function checkDeptInputs(): boolean {
		if (
			yearRef.current?.value &&
			(Number(yearRef.current?.value) < 1900 ||
				Number(yearRef.current?.value) > new Date().getFullYear())
		) {
			return false;
		}
		return true;
	}

	function filterCourses(): any {
		if (courseRef.current?.value?.includes("all")) {
			return null;
		}

		const courses = courseRef.current?.value
			?.replace(" ", "")
			.split(",")
			.filter((course) => !isNaN(Number(course)))!;

		if (courses.length === 0) {
			return null;
		}

		const courseClauses = courses.map((course) => {
			return {EQ: {[datasetRef.current?.value + "_id"]: Number(course)}};
		});

		const orClause = {OR: courseClauses};
		console.log(JSON.stringify(orClause));
		return orClause;
	}

	function handleQuery() {
		if (!checkDeptInputs()) {
			props.setStoryError("Invalid year input");
			return;
		}

		let deptQuery = {
			WHERE: {
				AND: [
					{IS: {[datasetRef.current?.value + "_dept"]: deptRef.current?.value}},
					{EQ: {[datasetRef.current?.value + "_year"]: Number(yearRef.current?.value)}},
					filterCourses() !== null && filterCourses(),
				],
			},
			OPTIONS: {
				COLUMNS: [
					datasetRef.current?.value + "_id",
					datasetRef.current?.value + "_dept",
					datasetRef.current?.value + "_year",
					datasetRef.current?.value + "_title",
					"maxFailed",
				],
			},
			TRANSFORMATIONS: {
				GROUP: [
					datasetRef.current?.value + "_id",
					datasetRef.current?.value + "_dept",
					datasetRef.current?.value + "_year",
					datasetRef.current?.value + "_title",
				],
				APPLY: [
					{
						maxFailed: {
							MAX: datasetRef.current?.value + "_fail",
						},
					},
				],
			},
		};
		console.log(deptQuery);
		const deptQueryJSON = JSON.stringify(deptQuery);
		props.queryFunction(deptQueryJSON);
	}

	return (
		<div>
			<p className="text-lg py-2">
				As a <b>department head</b>,<br /> I want to see sections with highest number of failures
				from year
			</p>
			<div className="flex gap-6 py-2 w-full">
				<div className="flex-1">
					<label htmlFor="datasetId" className="text-[#707070] text-sm">
						Dataset ID
					</label>
					<input
						type="text"
						ref={datasetRef}
						id="datasetId"
						value={props.dataset}
						placeholder="e.g. sections"
						className="block px-2 w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-primary-blue sm:text-sm sm:leading-6"
					/>
				</div>
				<div className="flex-1">
					<label htmlFor="deptId" className="text-[#707070] text-sm">
						Department
					</label>
					<input
						type="text"
						ref={deptRef}
						id="deptId"
						placeholder="e.g. CPSC"
						className="block px-2 w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-primary-blue sm:text-sm sm:leading-6"
					/>
				</div>
			</div>
			<div className="flex gap-6 py-2 w-full">
				<div className="flex-0">
					<label htmlFor="deptId" className="text-[#707070] text-sm">
						Year
					</label>
					<input
						type="text"
						ref={yearRef}
						id="year"
						placeholder="e.g. 2015"
						className="block max-w-[5rem] px-2 w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-primary-blue sm:text-sm sm:leading-6"
					/>
				</div>
				<div className="flex-1">
					<label htmlFor="courseId" className="text-[#707070] text-sm">
						Course ID's ('all' for all courses)
					</label>
					<input
						type="text"
						ref={courseRef}
						id="courseId"
						placeholder="e.g. 310"
						className="block px-2 w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-primary-blue sm:text-sm sm:leading-6"
					/>
				</div>
			</div>
			<div className="py-2">
				<button
					className="bg-zinc-900 py-2 px-6 text-white rounded-full cursor-pointer hover:bg-primary-blue transition-all duration-300 disabled:opacity-20 disabled:pointer-events-none"
					onClick={handleQuery}
					disabled={props.dataset.length <= 0}
				>
					See
				</button>
			</div>
		</div>
	);
}
