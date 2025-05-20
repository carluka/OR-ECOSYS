import { Link } from "react-router-dom";
import "../App.css";

export default function NotFoundPage() {
	return (
		<div className="not-found-page">
			<h1>404 Not Found</h1>
			<Link className="return-button" to="/">
				Go to Home
			</Link>
		</div>
	);
}
