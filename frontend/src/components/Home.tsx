import {queryResult} from "@/services/api";
import {useRef, useState} from "react";
import {useMutation, useQuery} from "react-query";
import Results from "./Results";
import "../assets/styles/app.css";

export default function Home() {
	const queryBoxRef = useRef<HTMLTextAreaElement>(null);
	const mutation = useMutation({
		mutationFn: () => {
			return queryResult(queryBoxRef.current?.value);
		},
	});

	async function handleQuerySubmit() {
		// console.log(queryBoxRef.current?.value);
		mutation.mutate();
	}

	return (
		<div className="container mx-auto">
			<div className="flex gap-8">
				<div className="w-full">
					<h1 className="text-3xl py-3">User Stories</h1>
					<div className="min-h-[600px] bg-[#f4f4f4] rounded-lg my-4">
						<div className="text-center">Hello World!</div>
					</div>
				</div>
				<div className="w-full">
					<h1 className="text-3xl py-3">Create your own query</h1>
					<form
						className="my-4"
						onSubmit={(e) => {
							e.preventDefault();
							handleQuerySubmit();
						}}
					>
						<textarea
							className="min-h-[360px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
							ref={queryBoxRef}
							name="query"
							id="query_input"
							placeholder="Enter your query"
						/>
						<input
							className="bg-primary-blue py-2 px-6 text-white rounded-full m-1"
							type="submit"
							value="Query"
						/>
					</form>
					<div>
						{mutation.isLoading ? (
							<>Loding</>
						) : mutation.isError ? (
							<>Error</>
						) : mutation.isSuccess ? (
							<>
								{/* {console.log("LOL", mutation.data.data.result)} */}
								<Results data={mutation.data.data.result} />
							</>
						) : (
							<></>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
