import {
    FaHome,
    FaProjectDiagram,
    FaTasks,
    FaUsers,
    FaCalendarAlt,
    FaChartBar,
    FaCog,
    FaSignOutAlt
} from "react-icons/fa";

import { NavLink } from "react-router-dom";

import "../../styles/sidebar.css";

export default function Sidebar() {

    const menu = [
        {name:"Dashboard",icon:<FaHome/>,path:"/dashboard"},
        {name:"Projects",icon:<FaProjectDiagram/>,path:"/projects"},
        {name:"Tasks",icon:<FaTasks/>,path:"/tasks"},
        {name:"Calendar",icon:<FaCalendarAlt/>,path:"/calendar"},
        {name:"Team",icon:<FaUsers/>,path:"/team"},
        {name:"Reports",icon:<FaChartBar/>,path:"/reports"},
        {name:"Settings",icon:<FaCog/>,path:"/settings"},
    ];

    return(

<div className="sidebar">

<div className="logo">

Task Manager

</div>

<div className="menu">

{
menu.map(item=>(

<NavLink
key={item.name}
to={item.path}
className="menu-item"
>

{item.icon}

<span>{item.name}</span>

</NavLink>

))
}

</div>

<div className="logout">

<FaSignOutAlt/>

Logout

</div>

</div>

)

}