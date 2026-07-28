import "./../styles/login.css";

import hero from "../assets/hero.png";

import { FaTasks } from "react-icons/fa";

export default function Login(){

return(

<div className="login-page">

<div className="login-card row g-0">

<div className="col-lg-6 left-side">

<h1 className="fw-bold">

<FaTasks/>

 Task Management

</h1>

<p className="mt-4">

Manage projects.

Track developer progress.

Assign tasks.

Monitor productivity.

All in one place.

</p>

<img

src={hero}

className="img-fluid feature"

alt=""

 />

</div>

<div className="col-lg-6 right-side">

<h2 className="fw-bold">

Welcome Back

</h2>

<p className="text-muted">

Sign in to continue

</p>

<div className="mt-4">

<input

className="form-control mb-3"

placeholder="Username"

/>

<input

type="password"

className="form-control mb-4"

placeholder="Password"

/>

<button className="btn btn-primary btn-login w-100">

Login

</button>

</div>

<div className="text-center mt-5">

<small>

© 2026 Task Management System

</small>

</div>

</div>

</div>

</div>

)

}