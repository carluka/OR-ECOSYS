import { Naprava } from "../interfaces/interface";

export const napraveData: Naprava[] = [
	{
		ime: "Aparat za EKG",
		tip: "EKG",
		stanje: "Deluje",
		lokacija: "Soba 101",
		servisiran: true,
	},
	{
		ime: "Infuzijska črpalka",
		tip: "Infuzija",
		stanje: "Okvara",
		lokacija: "Soba 202",
		servisiran: false,
	},
	{
		ime: "Monitor vitalnih funkcij",
		tip: "Monitor",
		stanje: "Deluje",
		lokacija: "Intenzivna",
		servisiran: true,
	},
	{
		ime: "Defibrilator",
		tip: "Reanimacija",
		stanje: "Deluje",
		lokacija: "Urgenca",
		servisiran: false,
	},
	{
		ime: "Ultrazvok",
		tip: "Diagnostika",
		stanje: "Vzdrževanje",
		lokacija: "Soba 303",
		servisiran: true,
	},
];
