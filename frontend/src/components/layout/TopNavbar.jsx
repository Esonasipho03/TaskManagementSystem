import {
FaBell,
FaSearch,
FaUserCircle
} from "react-icons/fa";

import "../../styles/navbar.css";

export default function TopNavbar(){

return(

<div className="top-navbar">

<div>

<h4>

Dashboard

</h4>

</div>

<div className="top-right">

<div className="search-box">

<FaSearch/>

<input
placeholder="Search..."
/>

</div>

<FaBell
className="icon"
/>

<FaUserCircle
size={34}
/>

</div>

</div>

)

}