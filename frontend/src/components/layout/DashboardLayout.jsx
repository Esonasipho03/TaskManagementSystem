import Sidebar from "./Sidebar";
import TopNavbar from "./TopNavbar";

export default function DashboardLayout({children}){

return(

<div>

<Sidebar/>

<div
style={{
marginLeft:"260px",
background:"#F4F6FA",
minHeight:"100vh"
}}
>

<TopNavbar/>

<div
style={{
padding:"30px"
}}
>

{children}

</div>

</div>

</div>

)

}