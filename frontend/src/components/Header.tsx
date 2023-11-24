import {FRONTEND_ENDPOINT} from "@/config";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuShortcut,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "@/components/ui/dialog";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {useToast} from "@/components/ui/use-toast";
import {Toaster} from "@/components/ui/toaster";

import {useMutation, useQuery, useQueryClient} from "react-query";
import {addData, getDatasetList} from "@/services/api";
import React from "react";
import {AxiosError} from "axios";
import {Button} from "./ui/button";
import {ToggleGroup, ToggleGroupItem} from "@/components/ui/toggle-group";
type Props = {
	setDataset: React.Dispatch<React.SetStateAction<string>>;
};

export default function Header(props: Props) {
	const {toast} = useToast();
	const datasets = useQuery(["datasets"], () => getDatasetList());
	const [currSet, setCurrSet] = React.useState("");
	const [currDatasetType, setCurrDatasetType] = React.useState<"sections" | "rooms">("sections");
	const [dialogOpen, setDialogOpen] = React.useState(false);
	const datasetNameRef = React.useRef<HTMLInputElement>(null);
	const datasetZipRef = React.useRef<HTMLInputElement>(null);
	const queryClient = useQueryClient();

	const sendDataset = useMutation({
		mutationFn: (payload: {name: string; type: string; zip: any}) => {
			return addData(payload["name"], payload["type"], payload["zip"]);
		},
		onSuccess: (data: any) => {
			setDialogOpen(false);
			toast({
				title: "Successful!",
				description: 'Dataset "' + datasetNameRef.current?.value + '" added',
			});
			queryClient.invalidateQueries("datasets");
			if (data.data.result.length === 1) props.setDataset(data.data.result[0]);
		},
		onError: (error: AxiosError) => {
			// Handle error here
			console.log(error);
		},
	});

	async function sendDatasetToBackend() {
		if (checkFields() && datasetNameRef.current?.value && datasetZipRef.current?.files) {
			await sendDataset.mutate({
				name: datasetNameRef.current?.value,
				type: currDatasetType,
				zip: datasetZipRef.current?.files[0],
			});
		}
	}

	function checkFields(): boolean {
		if (!datasetNameRef.current?.value || !datasetZipRef.current?.files) {
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
				<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
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
								<Input className="w-full col-span-3" ref={datasetZipRef} id="filezip" type="file" />
							</div>
							<div className="grid grid-cols-4 items-center gap-4">
								<Label htmlFor="setname" className="text-right">
									Name
								</Label>
								<Input
									id="setname"
									ref={datasetNameRef}
									placeholder="h3ll0_w0r1d"
									className="col-span-3"
								/>
							</div>
							<div className="grid grid-cols-4 items-center gap-4">
								<Label htmlFor="setType" className="text-right">
									Type
								</Label>
								<div className="col-span-3">
									<ToggleGroup
										type="single"
										variant="outline"
										defaultValue="sections"
										className="grid grid-cols-2"
									>
										<ToggleGroupItem
											value="sections"
											aria-label="Toggle sections"
											onClick={() => {
												setCurrDatasetType("sections");
											}}
										>
											Sections
										</ToggleGroupItem>
										<ToggleGroupItem
											value="rooms"
											aria-label="Toggle rooms"
											onClick={() => {
												setCurrDatasetType("rooms");
											}}
										>
											Rooms
										</ToggleGroupItem>
									</ToggleGroup>
								</div>
							</div>
						</div>
						<DialogFooter>
							<Button disabled={sendDataset.isLoading} type="submit" onClick={sendDatasetToBackend}>
								Upload
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
				{/* Select dataset */}

				<div className="flex items-center gap-4">
					<DropdownMenu>
						<DropdownMenuTrigger>
							<Button>
								{currSet.length > 0 ? currSet : "Datasets"}
								<span className="ic-base expand-icon ml-2 ic-invert"></span>
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent className="w-56">
							<DropdownMenuLabel>Available datasets</DropdownMenuLabel>
							<DropdownMenuSeparator />
							{datasets.data?.data.result.map(
								(dataset: {id: string; kind: string; numRows: number}) => (
									<DropdownMenuItem
										key={dataset.id}
										onClick={() => {
											props.setDataset(dataset.id);
											setCurrSet(dataset.id);
											toast({
												title: "Successful!",
												description: `Current dataset changed to ${dataset.id}`,
											});
										}}
									>
										<span>{dataset.id}</span>
										<DropdownMenuShortcut>{dataset.kind}</DropdownMenuShortcut>
									</DropdownMenuItem>
								)
							)}
							<DropdownMenuSeparator />
							<DropdownMenuItem onClick={() => setDialogOpen(true)}>
								<span className="ic-base add-icon mr-2"></span>
								<span>Add Dataset</span>
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
					{/* Github */}
					<a
						href="https://github.students.cs.ubc.ca/CPSC310-2023W-T1/project_team232"
						target="_blank"
						className="inline-block px-4 font-medium h-10 py-2 text-sm border rounded-md hover:bg-zinc-100 cursor-pointer"
					>
						Github
					</a>
				</div>
			</div>
		</div>
	);
}
