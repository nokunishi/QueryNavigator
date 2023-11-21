import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";

interface Props {
	data: any[];
}

export default function Results(props: Props) {
	function parseHeader(key: string) {
		return key.includes("_") ? key.split("_")[1] : key;
	}

	return (
		<div>
			<div>Results</div>
			<div>
				<div className="py-2"></div>
				<div className="m-2 content-center border-2 rounded-lg w-auto">
					<Table>
						<TableHeader>
							<TableRow>
								{Object.keys(props.data[0]).map((col) => (
									<TableHead key={col}>{parseHeader(col)}</TableHead>
								))}
							</TableRow>
						</TableHeader>
						<TableBody>
							{props.data.map((row) => (
								<TableRow>
									{Object.keys(row).map((col) => (
										<TableCell key={row[col]}>{row[col]}</TableCell>
									))}
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
			</div>
		</div>
	);
}
