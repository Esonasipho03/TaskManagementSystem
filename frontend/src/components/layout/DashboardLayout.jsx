import Sidebar from "./Sidebar";
import TopNavbar from "./TopNavbar";

import "../../styles/dashboard.css";

export default function DashboardLayout({ children }) {

    return (

        <div className="dashboard-shell">

            <Sidebar />

            <div className="dashboard-main">

                <TopNavbar />

                <div className="dashboard-content">
                    {children}
                </div>

            </div>

        </div>

    );

}
