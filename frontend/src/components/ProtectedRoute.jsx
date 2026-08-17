import { Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {

    const { user, loading } = useContext(AuthContext);

    if (loading) {

        return <h2>Loading...</h2>;

    }

    if (!user) {

        return <Navigate to="/" replace />;

    }

    return children;
}