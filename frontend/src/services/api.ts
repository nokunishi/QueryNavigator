// here goes backend api calls
import {BACKEND_ENDPOINT} from "@/config";
import axios from "axios";

// axios function to make api calls
// this function should take zip file html input and send it to backend
export async function addData(id: string, type: string, dataZip: any) {
	return axios({
		method: "PUT",
		url: `${BACKEND_ENDPOINT}/dataset/${id}/${type}`,
		data: dataZip,
		headers: {
			"Content-Type": dataZip.type,
		},
	});
}

// function to send query to backend
export async function queryResult(query: any): Promise<any> {
	return axios({
		method: "POST",
		url: `${BACKEND_ENDPOINT}/query`,
		data: query,
		headers: {
			"Content-Type": "application/json",
		},
	});
}

// function to load dataset list from backend
export async function getDatasetList(): Promise<any> {
	return axios({
		method: "GET",
		url: `${BACKEND_ENDPOINT}/datasets`,
		headers: {
			"Content-Type": "application/json",
		},
	});
}
