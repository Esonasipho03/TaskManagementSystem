import "../../styles/cards.css";

export default function StatCard({

title,

value,

color,

icon

}){

return(

<div className="stat-card">

<div>

<h6>

{title}

</h6>

<h2>

{value}

</h2>

</div>

<div
className="stat-icon-chip"
style={{
color:color,
background:`${color}1A`,
}}
>

{icon}

</div>

</div>

)

}