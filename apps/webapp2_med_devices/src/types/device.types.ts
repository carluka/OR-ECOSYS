export interface DeviceOverview {
	idnaprava: number;
	naprava: string;
	tip_naprave: string;
	soba: string;
	soba_naziv: string;
	soba_lokacija: string;
	soba_idsoba?: number | null;
	servis: boolean;
}

export interface FullDevice {
	idnaprava: number;
	naziv: string;
	tip_naprave_idtip_naprave: number;
	soba_idsoba: number;
	stanje: string;
	servisiran: boolean;
}

export interface Service {
	idservis: number;
	naprava_idnaprava: number;
	datum: string;
	ura: string;
	komentar: string;
}

export interface DeviceType {
	idtip_naprave: number;
	naziv: string;
}
