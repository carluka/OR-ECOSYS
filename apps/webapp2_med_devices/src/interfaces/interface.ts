export interface Naprava {
	ime: string;
	tip: string;
	stanje: string;
	lokacija: string;
	servisiran: boolean;
}

export interface Zaposleni {
	ime: string;
	priimek: string;
	email: string;
	tip_zaposlenega: string;
}
