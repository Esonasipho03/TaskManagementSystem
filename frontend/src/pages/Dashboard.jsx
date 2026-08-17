import { useContext, useEffect, useMemo, useState } from "react";
import {
    Chart as ChartJS,
    ArcElement,
    BarElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend,
} from "chart.js";
import { Doughnut, Bar } from "react-chartjs-2";

import DashboardLayout from "../components/layout/DashboardLayout";
import StatCard from "../components/dashboard/StatCard";
import ProjectCard from "../components/dashboard/ProjectCard";

import { AuthContext } from "../context/AuthContext";
import { getTasks } from "../api/tasks";
import { getProjects } from "../api/projects";

import {
    FaProjectDiagram,
    FaTasks,
    FaCheckCircle,
    FaClock,
} from "react-icons/fa";

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const STATUS_LABELS = {
    TODO: "To Do",
    IN_PROGRESS: "In Progress",
    REVIEW: "Review",
    DONE: "Done",
};

const STATUS_COLORS = {
    TODO: "#98A2B3",
    IN_PROGRESS: "#E2672E",
    REVIEW: "#FFA500",
    DONE: "#198754",
};

const PRIORITY_COLORS = {
    LOW: "#20C997",
    MEDIUM: "#F5A623",
    HIGH: "#FD7E14",
    CRITICAL: "#DC3545",
};

export default function Dashboard() {

    const { user } = useContext(AuthContext);

    const [tasks, setTasks] = useState([]);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        load();
    }, []);

    async function load() {

        try {

            const [taskData, projectData] = await Promise.all([
                getTasks(),
                getProjects(),
            ]);

            setTasks(taskData);
            setProjects(projectData);

        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }

    }

    const completedCount = useMemo(
        () => tasks.filter((t) => t.status === "DONE").length,
        [tasks]
    );

    const overdueCount = useMemo(() => {

        const today = new Date().toISOString().slice(0, 10);
        return tasks.filter((t) => t.status !== "DONE" && t.due_date && t.due_date < today).length;

    }, [tasks]);

    const statusCounts = useMemo(() => {

        const counts = { TODO: 0, IN_PROGRESS: 0, REVIEW: 0, DONE: 0 };

        tasks.forEach((t) => {
            if (counts[t.status] !== undefined) counts[t.status] += 1;
        });

        return counts;

    }, [tasks]);

    const priorityCounts = useMemo(() => {

        const counts = { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 };

        tasks.forEach((t) => {
            if (counts[t.priority] !== undefined) counts[t.priority] += 1;
        });

        return counts;

    }, [tasks]);

    const doughnutData = {
        labels: Object.keys(statusCounts).map((k) => STATUS_LABELS[k]),
        datasets: [{
            data: Object.values(statusCounts),
            backgroundColor: Object.keys(statusCounts).map((k) => STATUS_COLORS[k]),
            borderWidth: 0,
        }],
    };

    const barData = {
        labels: Object.keys(priorityCounts).map(
            (k) => k.charAt(0) + k.slice(1).toLowerCase()
        ),
        datasets: [{
            label: "Tasks",
            data: Object.values(priorityCounts),
            backgroundColor: Object.keys(priorityCounts).map((k) => PRIORITY_COLORS[k]),
            borderRadius: 8,
        }],
    };

    const barOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
            y: { beginAtZero: true, ticks: { precision: 0 } },
        },
    };

    const doughnutOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: "bottom" } },
    };

    function progressFor(project) {

        const projectTasks = tasks.filter((t) => t.project === project.id);

        if (projectTasks.length === 0) return 0;

        const done = projectTasks.filter((t) => t.status === "DONE").length;

        return Math.round((done / projectTasks.length) * 100);

    }

    const displayName = user?.first_name || user?.username || "there";

    // Everyone can browse every project on the Projects page now, but this
    // widget stays personal - a manager's own oversight, a developer's own
    // memberships.
    const myProjects = user?.role === "MANAGER"
        ? projects
        : projects.filter((p) => p.members.includes(user?.id));

    return (

        <DashboardLayout>

            <h2 className="mb-4 dashboard-welcome">
                Welcome back, {displayName} 👋
            </h2>

            {loading ? (

                <p className="text-muted">Loading your dashboard...</p>

            ) : (

                <>

                    <div className="row g-4 mb-4">

                        <div className="col-lg-3 col-sm-6">
                            <StatCard
                                title="Projects"
                                value={myProjects.length}
                                color="#E2672E"
                                icon={<FaProjectDiagram />}
                            />
                        </div>

                        <div className="col-lg-3 col-sm-6">
                            <StatCard
                                title="Tasks"
                                value={tasks.length}
                                color="#20C997"
                                icon={<FaTasks />}
                            />
                        </div>

                        <div className="col-lg-3 col-sm-6">
                            <StatCard
                                title="Completed"
                                value={completedCount}
                                color="#198754"
                                icon={<FaCheckCircle />}
                            />
                        </div>

                        <div className="col-lg-3 col-sm-6">
                            <StatCard
                                title="Overdue"
                                value={overdueCount}
                                color="#DC3545"
                                icon={<FaClock />}
                            />
                        </div>

                    </div>

                    <div className="reports-grid mb-4">

                        <div className="section-card">
                            <div className="chart-card-title">Tasks by status</div>
                            <div className="chart-card-body">
                                {tasks.length === 0 ? (
                                    <p className="text-muted">No tasks yet.</p>
                                ) : (
                                    <Doughnut data={doughnutData} options={doughnutOptions} />
                                )}
                            </div>
                        </div>

                        <div className="section-card">
                            <div className="chart-card-title">Tasks by priority</div>
                            <div className="chart-card-body">
                                {tasks.length === 0 ? (
                                    <p className="text-muted">No tasks yet.</p>
                                ) : (
                                    <Bar data={barData} options={barOptions} />
                                )}
                            </div>
                        </div>

                    </div>

                    <h5 className="fw-bold mb-3">Your projects</h5>

                    <div className="row g-4">

                        {myProjects.slice(0, 6).map((project) => (
                            <div className="col-lg-4" key={project.id}>
                                <ProjectCard
                                    title={project.name}
                                    description={project.description}
                                    progress={progressFor(project)}
                                    status={project.status}
                                    members={project.members.length}
                                />
                            </div>
                        ))}

                        {myProjects.length === 0 && (
                            <p className="text-muted">No projects yet.</p>
                        )}

                    </div>

                </>

            )}

        </DashboardLayout>

    );

}
