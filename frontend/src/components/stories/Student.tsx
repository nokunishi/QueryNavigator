import {useRef} from "react";
import "../../assets/styles/app.css";

type Props = {
	queryFunction: (query: string) => void;
	setStoryError: (error: string) => void;
	dataset: string;
};

export default function Student(props: Props) {
	const deptRef = useRef<HTMLInputElement>(null);
	const courseRef = useRef<HTMLInputElement>(null);
	const fieldsRef = useRef<HTMLInputElement>(null);

	function checkStudentInputs(): boolean {
		if (typeof deptRef.current?.value !== "string") {
			return false;
		}
		if (courseRef.current?.value && isNaN(Number(courseRef.current?.value))) {
			return false;
		}
		if (typeof fieldsRef.current?.value !== "string") {
			return false;
		}
		return true;
	}

	function handleQuery() {
		if (!checkStudentInputs()) {
			props.setStoryError("Invalid input");
			return;
		}
		let studentQuery = {
			WHERE: {
				AND: [
					{IS: {[props.dataset + "_dept"]: deptRef.current?.value}},
					{EQ: {[props.dataset + "_id"]: Number(courseRef.current?.value)}},
				],
			},
			OPTIONS: {
				COLUMNS: fieldsRef.current?.value
					?.replace(/\s+/g, "")
					.split(",")
					.map((field) => {
						console.log(props.dataset + "_" + field);
						return props.dataset + "_" + field;
					}),
				ORDER: props.dataset + "_avg",
			},
		};
		console.log(studentQuery);
		const studentQueryJSON = JSON.stringify(studentQuery);
		props.queryFunction(studentQueryJSON);
	}

	return (
		<div>
			<p className="text-lg pb-2">
				As a <b>student</b>,<br /> I want to check the average of
			</p>
			<div className="flex gap-6 py-2 w-full">
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
				<div className="flex-1">
					<label htmlFor="courseId" className="text-[#707070] text-sm">
						Course ID
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
				<label htmlFor="fields" className="text-[#707070] text-sm">
					Fields
				</label>
				<input
					type="text"
					ref={fieldsRef}
					id="fields"
					placeholder="e.g. avg, year, instructor"
					className="block px-2 w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-primary-blue sm:text-sm sm:leading-6"
				/>
			</div>
			<div className="py-2">
				<button
					className="bg-zinc-900 py-2 px-6 text-white rounded-full cursor-pointer hover:bg-primary-blue transition-all duration-300 disabled:opacity-20 disabled:pointer-events-none"
					onClick={handleQuery}
					disabled={props.dataset.length <= 0}
				>
					Check
				</button>
			</div>
		</div>
	);
}
