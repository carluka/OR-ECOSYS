export interface UserOverview {
	iduporabnik: number;
	ime: string;
	priimek: string;
	email: string;
	TipUporabnika: {
		naziv: string;
	};
}

export interface FullUser {
	iduporabnik: number;
	ime: string;
	priimek: string;
	email: string;
	geslo?: string;
	tip_uporabnika_idtip_uporabnika: number;
}

export interface UserType {
	idtip_uporabnika: number;
	naziv: string;
}
