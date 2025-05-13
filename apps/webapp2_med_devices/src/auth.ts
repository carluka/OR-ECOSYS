// src/auth.ts
import { redirect } from "react-router-dom";
import api from "./api";

export async function requireAuth() {
	try {
		const { data: ok } = await api.get<boolean>("/check");
		if (ok) return null;
		// frontier case: 200 + false
		return redirect("/login");
	} catch {
		// network error or 401
		return redirect("/login");
	}
}
