// Preveri, če je uporabnik prijavljen
import { redirect } from "react-router-dom";
import api from "./api";

export async function requireAuth() {
	try {
		const { data: ok } = await api.get<boolean>("/check");
		if (ok) return null;

		return redirect("/login");
	} catch {
		return redirect("/login");
	}
}
