import {FRONTEND_ENDPOINT} from "@/config";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	DialogFooter,
} from "@/components/ui/dialog";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {useToast} from "@/components/ui/use-toast";
import {Toaster} from "@/components/ui/toaster";

import {useMutation, useQuery} from "react-query";
import {addData, getDatasetList} from "@/services/api";
import React from "react";
import JSZip from "jszip";
import * as fs from "fs-extra";
type Props = {
	setDataset: React.Dispatch<React.SetStateAction<string>>;
};

export default function Header(props: Props) {
	const {toast} = useToast();
	const datasets = useQuery("datasets", () => getDatasetList());
	const [currSet, setCurrSet] = React.useState("");
	const datasetNameRef = React.useRef<HTMLInputElement>(null);
	const datasetTypeRef = React.useRef<HTMLInputElement>(null);
	const datasetZipRef = React.useRef<HTMLInputElement>(null);

	const sendDataset = useMutation("sendDataset", async () => {
		if (checkFields()) {
			if (
				datasetNameRef.current?.value &&
				datasetTypeRef.current?.value &&
				datasetZipRef.current?.files
			) {
				// console.log(datasetZipRef);
				// const zipFile = datasetZipRef.current?.files?.[0];
				// const zip = new JSZip();
				// const zipData = await zip.loadAsync(zipFile);
				// const zipData: Buffer = fs.readFileSync(datasetZipRef.current?.value);
				// return addData(datasetNameRef.current?.value, datasetTypeRef.current?.value, zipData);
			}
		}
	});

	async function sendDatasetToBackend() {
		if (
			datasetNameRef.current?.value &&
			datasetTypeRef.current?.value &&
			datasetZipRef.current?.files
		) {
			await sendDataset.mutate();
		}
	}

	function checkFields(): boolean {
		if (
			!datasetNameRef.current?.value ||
			!datasetTypeRef.current?.value ||
			!datasetZipRef.current?.files
		) {
			toast({
				title: "Error",
				description: "Please fill in all fields",
			});
			return false;
		}
		if (datasetZipRef.current?.files[0].type !== "application/zip") {
			toast({
				title: "Error",
				description: "Please upload a zip file",
			});
			return false;
		}
		if (datasetTypeRef.current?.value !== "sections" && datasetTypeRef.current?.value !== "rooms") {
			toast({
				title: "Error",
				description: "Please enter a valid type",
			});
			return false;
		}
		return true;
	}

	return (
		<div className="pt-6 mb-[50px]">
			<Toaster />
			<div className="flex justify-between">
				<div className="text-3xl cursor-pointer">
					<a href={FRONTEND_ENDPOINT}>
						Insight<b>UBC</b>
					</a>
				</div>
				{/* Add dataset */}
				<div className="flex items-center gap-4">
					<Dialog>
						<DialogTrigger asChild>
							<button className="bg-zinc-900 py-2 px-4 text-white rounded-lg cursor-pointer hover:bg-primary-blue transition-all duration-300 disabled:opacity-20 disabled:pointer-events-none">
								Add Dataset
							</button>
						</DialogTrigger>
						<DialogContent className="sm:max-w-[425px]">
							<DialogHeader>
								<DialogTitle>Upload dataset</DialogTitle>
								<DialogDescription>
									Choose the zip file and give dataset a unique name. Click upload when you're done.
								</DialogDescription>
							</DialogHeader>
							<div className="grid gap-4 py-4">
								<div className="grid grid-cols-4 w-full items-center gap-4">
									<Label htmlFor="filezip" className="text-right">
										Zip file
									</Label>
									<Input
										className="w-full col-span-3"
										ref={datasetZipRef}
										id="filezip"
										type="file"
									/>
								</div>
								<div className="grid grid-cols-4 items-center gap-4">
									<Label htmlFor="setname" className="text-right">
										Name
									</Label>
									<Input
										id="setname"
										ref={datasetNameRef}
										placeholder="sections"
										className="col-span-3"
									/>
								</div>
								<div className="grid grid-cols-4 items-center gap-4">
									<Label htmlFor="setType" className="text-right">
										Type
									</Label>
									<Input
										id="setType"
										ref={datasetTypeRef}
										placeholder="sections / rooms"
										className="col-span-3"
									/>
								</div>
							</div>
							<DialogFooter>
								<button type="submit" onClick={sendDatasetToBackend}>
									Upload
								</button>
							</DialogFooter>
						</DialogContent>
					</Dialog>
					{/* Select dataset */}
					<div>
						<DropdownMenu>
							<DropdownMenuTrigger>
								<button className="bg-white dataset-button py-2 px-4 border-[1px] active:border-zinc-600 text-black rounded-lg cursor-pointer hover:bg-zinc-100 transition-all duration-300 focus-visible:outline-zinc-600">
									{currSet.length > 0 ? currSet : "Datasets"}
								</button>
							</DropdownMenuTrigger>
							<DropdownMenuContent>
								<DropdownMenuLabel>Available datasets</DropdownMenuLabel>
								<DropdownMenuSeparator />
								{datasets.data?.data.result.map(
									(dataset: {id: string; kind: string; numRows: number}) => (
										<DropdownMenuItem key={dataset.id}>
											<button
												onClick={() => {
													props.setDataset(dataset.id);
													setCurrSet(dataset.id);
													toast({
														title: "Successful!",
														description: 'Current dataset changed to "' + dataset.id + '"',
													});
												}}
											>
												{dataset.id}: {dataset.kind}
											</button>
										</DropdownMenuItem>
									)
								)}
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
					{/* Github */}
					<div className="hover:underline underline-offset-4 cursor-pointer">
						<a
							href="https://github.students.cs.ubc.ca/CPSC310-2023W-T1/project_team232"
							target="_blank"
						>
							Github
						</a>
					</div>
				</div>
			</div>
		</div>
	);
}
