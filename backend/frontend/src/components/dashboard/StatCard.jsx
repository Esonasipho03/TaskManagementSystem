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
style={{
color:color,
fontSize:40
}}
>

{icon}

</div>

</div>

)

}