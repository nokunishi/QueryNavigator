import {getDatasetList, queryResult} from "@/services/api";
import {useRef, useState} from "react";
import {useMutation, useQuery} from "react-query";
import Results from "./Results";
import "../assets/styles/app.css";
import Header from "./Header";
import {AxiosError} from "axios";
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert";
import Student from "./stories/Student";
import DHead from "./stories/DHead";

export default function Home() {
	const queryBoxRef = useRef<HTMLTextAreaElement>(null);
	const [storyError, setStoryError] = useState("");
	const [currentDataset, setCurrentDataset] = useState("");
	const mutation = useMutation((query: string) => {
		if (isJSON(query)) {
			return queryResult(query);
		} else {
			return Promise.reject("Invalid JSON");
		}
	});

	function handleQuerySubmit() {
		if (queryBoxRef.current) mutation.mutate(queryBoxRef.current?.value);
	}

	function handleStudentQuerySubmit(studentQuery: string) {
		mutation.mutate(studentQuery);
	}

	function isJSON(str: any) {
		try {
			JSON.parse(str);
		} catch (e) {
			return false;
		}
		return true;
	}

	function errorAlert(alert: string) {
		return (
			<Alert variant="destructive">
				<AlertTitle>❌ Error</AlertTitle>
				<AlertDescription className="pl-5">{alert}</AlertDescription>
			</Alert>
		);
	}

	return (
		<div className="container mx-auto">
			<Header setDataset={setCurrentDataset} />
			{mutation.data ? (
				mutation.data.data.result.length === 0 ? (
					errorAlert("No results found")
				) : (
					<Results data={mutation.data.data.result} />
				)
			) : (
				<div>
					{mutation.isError ? (
						<div>
							{typeof mutation.error === "string"
								? errorAlert(JSON.stringify(mutation.error))
								: errorAlert(
										JSON.stringify(((mutation.error as AxiosError).response?.data as any)["error"])
								  )}
						</div>
					) : (
						<></>
					)}
					{storyError !== "" ? errorAlert(storyError) : <></>}
					<div className="grid grid-cols-2 gap-8 my-6 min-h-[calc(100vh-150px)]">
						<div className="flex flex-col">
							<h1 className="text-3xl py-3">User Stories</h1>
							<div className="bg-[#f4f4f4] rounded-lg mt-4 flex-1">
								<div className="p-6">
									<Student
										queryFunction={handleStudentQuerySubmit}
										setStoryError={setStoryError}
										dataset={currentDataset}
									/>
									<div className="flex justify-center my-2">
										<div className="divider-icon"></div>
									</div>
									<DHead
										queryFunction={handleStudentQuerySubmit}
										setStoryError={setStoryError}
										dataset={currentDataset}
									/>
								</div>
							</div>
						</div>
						<div className="flex flex-col">
							<h1 className="text-3xl py-3">Create your own query</h1>
							<form
								className="mt-4 flex-1 flex gap-2 flex-col"
								onSubmit={(e) => {
									e.preventDefault();
									handleQuerySubmit();
								}}
							>
								<textarea
									className="flex-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
									ref={queryBoxRef}
									name="query"
									id="query_input"
									placeholder="Enter your query"
								/>
								<div>
									<input
										className="bg-zinc-900 py-2 px-6 text-white rounded-full cursor-pointer hover:bg-primary-blue transition-all duration-300 disabled:opacity-20 disabled:pointer-events-none"
										type="submit"
										disabled={currentDataset.length <= 0}
										value="Query"
									/>
								</div>
							</form>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
