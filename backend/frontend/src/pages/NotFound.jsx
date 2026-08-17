import { Link } from "react-router-dom";
import { FaExclamationTriangle } from "react-icons/fa";

export default function NotFound() {

    return (

        <div
            className="d-flex flex-column align-items-center justify-content-center text-center"
            style={{ minHeight: "100vh", background: "#FBF3EA" }}
        >

            <FaExclamationTriangle size={54} className="text-warning mb-3" />

            <h1 className="fw-bold">404</h1>

            <p className="text-muted mb-4">

                The page you're looking for doesn't exist.

            </p>

            <Link to="/" className="btn btn-primary">

                Back to Login

            </Link>

        </div>

    );

}
