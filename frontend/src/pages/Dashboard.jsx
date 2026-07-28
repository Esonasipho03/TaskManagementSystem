import DashboardLayout from "../components/layout/DashboardLayout";
import StatCard from "../components/dashboard/StatCard";

import {

FaProjectDiagram,
FaTasks,
FaCheckCircle,
FaClock

} from "react-icons/fa";

export default function Dashboard(){

return(

<DashboardLayout>

<h2 className="mb-4">

Welcome back, Faith 👋

</h2>

<div className="row g-4">

<div className="col-lg-3">

<StatCard

title="Projects"

value="8"

color="#0D6EFD"

icon={<FaProjectDiagram/>}

/>

</div>

<div className="col-lg-3">

<StatCard

title="Tasks"

value="63"

color="#20C997"

icon={<FaTasks/>}

/>

</div>

<div className="col-lg-3">

<StatCard

title="Completed"

value="52"

color="#198754"

icon={<FaCheckCircle/>}

/>

</div>

<div className="col-lg-3">

<StatCard

title="Overdue"

value="4"

color="#DC3545"

icon={<FaClock/>}

/>

</div>

</div>

</DashboardLayout>

)

}