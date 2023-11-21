import {FRONTEND_ENDPOINT} from "@/config";
import React from "react";

type Props = {};

export default function Header() {
	return (
		<div className="pt-6 mb-[50px]">
			<div className="flex justify-between">
				<div className="text-3xl cursor-pointer">
					<a href={FRONTEND_ENDPOINT}>
						Insight<b>UBC</b>
					</a>
				</div>
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
	);
}
