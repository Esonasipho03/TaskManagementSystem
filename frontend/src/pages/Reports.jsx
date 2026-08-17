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

import { AuthContext } from "../context/AuthContext";
import { getTasks } from "../api/tasks";
import { getProjects } from "../api/projects";
import { getUsers } from "../api/accounts";

import {
    FaProjectDiagram,
    FaTasks,
    FaCheckCircle,
    FaExclamationCircle,
    FaSortUp,
    FaSortDown,
    FaDownload,
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
    IN_PROGRESS: "#0D6EFD",
    REVIEW: "#FFA500",
    DONE: "#198754",
};

const PRIORITY_COLORS = {
    LOW: "#20C997",
    MEDIUM: "#0D6EFD",
    HIGH: "#FD7E14",
    CRITICAL: "#DC3545",
};

const MS_PER_DAY = 1000 * 60 * 60 * 24;

function formatDate(value) {

    if (!value) return "—";

    const d = new Date(value);

    if (Number.isNaN(d.getTime())) return "—";

    return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });

}

function median(values) {

    if (!values.length) return null;

    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);

    return sorted.length % 2 !== 0
        ? sorted[mid]
        : (sorted[mid - 1] + sorted[mid]) / 2;

}

// Real cycle time: how long the task was actually "in flight", using the
// started_at/completed_at timestamps set by Task.save() on real status
// transitions - not `updated_at`, which changes on any unrelated edit.
function cycleTimeDays(task) {

    if (!task.completed_at) return null;

    const start = task.started_at ? new Date(task.started_at) : new Date(task.created_at);
    const end = new Date(task.completed_at);

    return Math.max(0, (end - start) / MS_PER_DAY);

}

// A task counts as reopened if its history shows it left DONE for
// something else at least once.
function reopenCount(task) {

    const history = task.status_history || [];

    return history.filter((h) => h.from_status === "DONE" && h.to_status !== "DONE").length;

}

function csvEscape(value) {

    if (value === null || value === undefined) return "";

    const str = String(value);

    return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;

}

function toCsvRow(values) {
    return values.map(csvEscape).join(",");
}

function downloadCsv(filename, rows) {

    const csvContent = rows.join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);

}

function StatusBadge({ status }) {

    return (
        <span
            className="badge"
            style={{ background: STATUS_COLORS[status] || "#98A2B3", color: "#fff" }}
        >
            {STATUS_LABELS[status] || status}
        </span>
    );

}

export default function Reports() {

    const { user } = useContext(AuthContext);
    const isManager = user?.role === "MANAGER";

    const [tasks, setTasks] = useState([]);
    const [projects, setProjects] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sortField, setSortField] = useState("overdue");
    const [sortDir, setSortDir] = useState("desc");

    const [activitySortField, setActivitySortField] = useState("dueDate");
    const [activitySortDir, setActivitySortDir] = useState("asc");

    useEffect(() => {
        load();
    }, []);

    async function load() {

        try {

            const [taskData, projectData, userData] = await Promise.all([
                getTasks(),
                getProjects(),
                isManager ? getUsers() : Promise.resolve([]),
            ]);

            setTasks(taskData);
            setProjects(projectData);
            setUsers(userData);

        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }

    }

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

    const overdueCount = useMemo(() => {

        const today = new Date().toISOString().slice(0, 10);

        return tasks.filter((t) => t.status !== "DONE" && t.due_date && t.due_date < today).length;

    }, [tasks]);

    const developerStats = useMemo(() => {

        if (!isManager) return [];

        const today = new Date().toISOString().slice(0, 10);

        const developers = users.filter((u) => u.role === "DEVELOPER");

        return developers.map((dev) => {

            const assigned = tasks.filter((t) => t.assigned_to === dev.id);

            const completed = assigned.filter((t) => t.status === "DONE");

            const overdue = assigned.filter(
                (t) => t.status !== "DONE" && t.due_date && t.due_date < today
            );

            const inProgress = assigned.filter((t) => t.status === "IN_PROGRESS");

            const cycleTimes = completed
                .map(cycleTimeDays)
                .filter((d) => d !== null);

            const medianCycleDays = median(cycleTimes);

            const reopened = assigned.reduce((sum, t) => sum + reopenCount(t), 0);

            return {
                id: dev.id,
                name: dev.first_name || dev.last_name
                    ? `${dev.first_name} ${dev.last_name}`.trim()
                    : dev.username,
                assigned: assigned.length,
                completed: completed.length,
                overdue: overdue.length,
                currentlyWorkingOn: inProgress.length
                    ? inProgress.map((t) => t.title).join(", ")
                    : "—",
                avgDays: medianCycleDays,
                reopened,
            };

        });

    }, [isManager, users, tasks]);

    const projectStats = useMemo(() => {

        if (!isManager) return [];

        const today = new Date().toISOString().slice(0, 10);

        return projects.map((p) => {

            const projectTasks = tasks.filter((t) => t.project === p.id);

            const completed = projectTasks.filter((t) => t.status === "DONE");

            const overdue = projectTasks.filter(
                (t) => t.status !== "DONE" && t.due_date && t.due_date < today
            );

            return {
                id: p.id,
                name: p.name,
                status: p.status,
                startDate: p.start_date,
                dueDate: p.due_date,
                total: projectTasks.length,
                completed: completed.length,
                overdue: overdue.length,
            };

        });

    }, [isManager, projects, tasks]);

    // Flat, per-task activity log - this is the direct answer to "what
    // project is this, what was each developer working on, when did they
    // finish it, and what were the project's and task's due dates". One
    // row per task rather than an aggregated index.
    const taskActivity = useMemo(() => {

        if (!isManager) return [];

        const usersById = new Map(users.map((u) => [u.id, u]));
        const projectsById = new Map(projects.map((p) => [p.id, p]));

        return tasks.map((t) => {

            const dev = usersById.get(t.assigned_to);
            const project = projectsById.get(t.project);

            return {
                id: t.id,
                developer: dev
                    ? (dev.first_name || dev.last_name
                        ? `${dev.first_name} ${dev.last_name}`.trim()
                        : dev.username)
                    : "Unassigned",
                project: project ? project.name : "—",
                projectDueDate: project ? project.due_date : null,
                task: t.title,
                status: t.status,
                dueDate: t.due_date,
                completedAt: t.completed_at,
            };

        });

    }, [isManager, users, projects, tasks]);

    const sortedDeveloperStats = useMemo(() => {

        const sorted = [...developerStats].sort((a, b) => {

            const av = a[sortField] ?? -1;
            const bv = b[sortField] ?? -1;

            if (typeof av === "string" || typeof bv === "string") {
                return sortDir === "desc"
                    ? String(bv).localeCompare(String(av))
                    : String(av).localeCompare(String(bv));
            }

            return sortDir === "desc" ? bv - av : av - bv;

        });

        return sorted;

    }, [developerStats, sortField, sortDir]);

    function toggleSort(field) {

        if (field === sortField) {
            setSortDir((d) => (d === "desc" ? "asc" : "desc"));
        } else {
            setSortField(field);
            setSortDir("desc");
        }

    }

    function sortIcon(field) {

        if (field !== sortField) return null;

        return sortDir === "desc" ? <FaSortDown className="ms-1" /> : <FaSortUp className="ms-1" />;

    }

    const sortedTaskActivity = useMemo(() => {

        const sorted = [...taskActivity].sort((a, b) => {

            let av = a[activitySortField];
            let bv = b[activitySortField];

            if (activitySortField === "dueDate" || activitySortField === "completedAt" || activitySortField === "projectDueDate") {
                av = av ? new Date(av).getTime() : -Infinity;
                bv = bv ? new Date(bv).getTime() : -Infinity;
            } else {
                av = (av ?? "").toString().toLowerCase();
                bv = (bv ?? "").toString().toLowerCase();
            }

            if (av < bv) return activitySortDir === "asc" ? -1 : 1;
            if (av > bv) return activitySortDir === "asc" ? 1 : -1;

            return 0;

        });

        return sorted;

    }, [taskActivity, activitySortField, activitySortDir]);

    function toggleActivitySort(field) {

        if (field === activitySortField) {
            setActivitySortDir((d) => (d === "desc" ? "asc" : "desc"));
        } else {
            setActivitySortField(field);
            setActivitySortDir("asc");
        }

    }

    function activitySortIcon(field) {

        if (field !== activitySortField) return null;

        return activitySortDir === "desc" ? <FaSortDown className="ms-1" /> : <FaSortUp className="ms-1" />;

    }

    function handleDownloadReport() {

        const today = new Date().toISOString().slice(0, 10);
        const rows = [];

        rows.push(toCsvRow(["Report generated", today]));
        rows.push("");

        rows.push(toCsvRow(["Summary"]));
        rows.push(toCsvRow(["Projects", projects.length]));
        rows.push(toCsvRow(["Tasks", tasks.length]));
        rows.push(toCsvRow(["Completed", completedCount]));
        rows.push(toCsvRow(["Overdue", overdueCount]));
        rows.push("");

        if (isManager) {

            rows.push(toCsvRow(["Projects overview"]));
            rows.push(toCsvRow(["Project", "Status", "Start date", "Due date", "Tasks", "Completed", "Overdue"]));

            projectStats.forEach((p) => {
                rows.push(toCsvRow([
                    p.name, p.status, p.startDate || "", p.dueDate || "",
                    p.total, p.completed, p.overdue,
                ]));
            });

            rows.push("");

            rows.push(toCsvRow(["Developer performance"]));
            rows.push(toCsvRow([
                "Developer", "Assigned", "Completed", "Overdue",
                "Median cycle time (days)", "Reopened", "Currently working on",
            ]));

            sortedDeveloperStats.forEach((d) => {
                rows.push(toCsvRow([
                    d.name, d.assigned, d.completed, d.overdue,
                    d.avgDays === null ? "" : d.avgDays.toFixed(1),
                    d.reopened,
                    d.currentlyWorkingOn,
                ]));
            });

            rows.push("");

            rows.push(toCsvRow(["Task activity"]));
            rows.push(toCsvRow([
                "Developer", "Project", "Task", "Status", "Task due date",
                "Completed on", "Project due date",
            ]));

            sortedTaskActivity.forEach((t) => {
                rows.push(toCsvRow([
                    t.developer, t.project, t.task, STATUS_LABELS[t.status] || t.status,
                    t.dueDate || "",
                    t.completedAt ? t.completedAt.slice(0, 10) : "",
                    t.projectDueDate || "",
                ]));
            });

            rows.push("");

        }

        downloadCsv(`report_${today}.csv`, rows);

    }

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

    const completedCount = statusCounts.DONE;

    return (

        <DashboardLayout>

            <div className="page-header">
                <div>
                    <h2>Reports</h2>
                    <p className="text-muted mb-0">
                        {isManager
                            ? "An overview across all projects and tasks."
                            : "An overview of the work assigned to you."}
                    </p>
                </div>
                <button
                    type="button"
                    className="btn btn-outline-primary"
                    onClick={handleDownloadReport}
                    disabled={loading || tasks.length === 0}
                >
                    <FaDownload className="me-2" />
                    Download report
                </button>
            </div>

            {loading ? (

                <p className="text-muted">Loading report data...</p>

            ) : (

                <>

                    <div className="row g-4 mb-4">

                        <div className="col-lg-3 col-sm-6">
                            <StatCard
                                title="Projects"
                                value={projects.length}
                                color="#0D6EFD"
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
                                icon={<FaExclamationCircle />}
                            />
                        </div>

                    </div>

                    {!isManager && (

                        <div className="reports-grid">

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

                    )}

                    {isManager && (

                        <div className="section-card mb-4">

                            <div className="chart-card-title">Projects overview</div>

                            {projectStats.length === 0 ? (

                                <p className="text-muted mb-0">No projects to report on yet.</p>

                            ) : (

                                <div className="table-responsive">

                                    <table className="table align-middle">

                                        <thead>
                                            <tr>
                                                <th>Project</th>
                                                <th>Status</th>
                                                <th>Start date</th>
                                                <th>Due date</th>
                                                <th>Tasks</th>
                                                <th>Completed</th>
                                                <th>Overdue</th>
                                            </tr>
                                        </thead>

                                        <tbody>

                                            {projectStats.map((p) => (

                                                <tr key={p.id}>
                                                    <td>{p.name}</td>
                                                    <td>{p.status}</td>
                                                    <td>{formatDate(p.startDate)}</td>
                                                    <td>{formatDate(p.dueDate)}</td>
                                                    <td>{p.total}</td>
                                                    <td>{p.completed}</td>
                                                    <td>
                                                        {p.overdue > 0 ? (
                                                            <span className="badge bg-danger">{p.overdue}</span>
                                                        ) : (
                                                            0
                                                        )}
                                                    </td>
                                                </tr>

                                            ))}

                                        </tbody>

                                    </table>

                                </div>

                            )}

                            <p className="text-muted mb-0 mt-3" style={{ fontSize: 13 }}>
                                Each project's status, timeline, and how its tasks are tracking
                                against that timeline.
                            </p>

                        </div>

                    )}

                    {isManager && (

                        <div className="section-card mt-4">

                            <div className="chart-card-title">Developer performance</div>

                            {developerStats.length === 0 ? (

                                <p className="text-muted mb-0">No developers to report on yet.</p>

                            ) : (

                                <div className="table-responsive">

                                    <table className="table align-middle">

                                        <thead>
                                            <tr>
                                                <th>Developer</th>
                                                <th
                                                    role="button"
                                                    onClick={() => toggleSort("assigned")}
                                                >
                                                    Assigned {sortIcon("assigned")}
                                                </th>
                                                <th
                                                    role="button"
                                                    onClick={() => toggleSort("completed")}
                                                >
                                                    Completed {sortIcon("completed")}
                                                </th>
                                                <th
                                                    role="button"
                                                    onClick={() => toggleSort("overdue")}
                                                >
                                                    Overdue {sortIcon("overdue")}
                                                </th>
                                                <th
                                                    role="button"
                                                    onClick={() => toggleSort("avgDays")}
                                                >
                                                    Median cycle time {sortIcon("avgDays")}
                                                </th>
                                                <th
                                                    role="button"
                                                    onClick={() => toggleSort("reopened")}
                                                >
                                                    Reopened {sortIcon("reopened")}
                                                </th>
                                                <th>Currently working on</th>
                                            </tr>
                                        </thead>

                                        <tbody>

                                            {sortedDeveloperStats.map((dev) => (

                                                <tr key={dev.id}>

                                                    <td>{dev.name}</td>
                                                    <td>{dev.assigned}</td>
                                                    <td>{dev.completed}</td>
                                                    <td>
                                                        {dev.overdue > 0 ? (
                                                            <span className="badge bg-danger">{dev.overdue}</span>
                                                        ) : (
                                                            0
                                                        )}
                                                    </td>
                                                    <td>
                                                        {dev.avgDays === null
                                                            ? "—"
                                                            : `${dev.avgDays.toFixed(1)}d`}
                                                    </td>
                                                    <td>
                                                        {dev.reopened > 0 ? (
                                                            <span className="badge bg-warning text-dark">{dev.reopened}</span>
                                                        ) : (
                                                            0
                                                        )}
                                                    </td>
                                                    <td>{dev.currentlyWorkingOn}</td>

                                                </tr>

                                            ))}

                                        </tbody>

                                    </table>

                                </div>

                            )}

                            <p className="text-muted mb-0 mt-3" style={{ fontSize: 13 }}>
                                Median cycle time is the typical time from a task first entering
                                "In Progress" to being marked "Done" (median, not average, since a
                                couple of large tasks would otherwise skew the number). Reopened
                                counts tasks that left "Done" and had to be reworked. "Currently
                                working on" lists this developer's tasks that are In Progress
                                right now.
                            </p>

                        </div>

                    )}

                    {isManager && (

                        <div className="section-card mt-4">

                            <div className="chart-card-title">Task activity</div>

                            {sortedTaskActivity.length === 0 ? (

                                <p className="text-muted mb-0">No tasks to report on yet.</p>

                            ) : (

                                <div className="table-responsive">

                                    <table className="table align-middle">

                                        <thead>
                                            <tr>
                                                <th
                                                    role="button"
                                                    onClick={() => toggleActivitySort("developer")}
                                                >
                                                    Developer {activitySortIcon("developer")}
                                                </th>
                                                <th
                                                    role="button"
                                                    onClick={() => toggleActivitySort("project")}
                                                >
                                                    Project {activitySortIcon("project")}
                                                </th>
                                                <th
                                                    role="button"
                                                    onClick={() => toggleActivitySort("task")}
                                                >
                                                    Task {activitySortIcon("task")}
                                                </th>
                                                <th
                                                    role="button"
                                                    onClick={() => toggleActivitySort("status")}
                                                >
                                                    Status {activitySortIcon("status")}
                                                </th>
                                                <th
                                                    role="button"
                                                    onClick={() => toggleActivitySort("dueDate")}
                                                >
                                                    Task due date {activitySortIcon("dueDate")}
                                                </th>
                                                <th
                                                    role="button"
                                                    onClick={() => toggleActivitySort("completedAt")}
                                                >
                                                    Completed on {activitySortIcon("completedAt")}
                                                </th>
                                                <th
                                                    role="button"
                                                    onClick={() => toggleActivitySort("projectDueDate")}
                                                >
                                                    Project due date {activitySortIcon("projectDueDate")}
                                                </th>
                                            </tr>
                                        </thead>

                                        <tbody>

                                            {sortedTaskActivity.map((t) => (

                                                <tr key={t.id}>
                                                    <td>{t.developer}</td>
                                                    <td>{t.project}</td>
                                                    <td>{t.task}</td>
                                                    <td><StatusBadge status={t.status} /></td>
                                                    <td>{formatDate(t.dueDate)}</td>
                                                    <td>{formatDate(t.completedAt)}</td>
                                                    <td>{formatDate(t.projectDueDate)}</td>
                                                </tr>

                                            ))}

                                        </tbody>

                                    </table>

                                </div>

                            )}

                            <p className="text-muted mb-0 mt-3" style={{ fontSize: 13 }}>
                                Every task, which developer it's assigned to, which project it
                                belongs to, its status, when it's due, when it was actually
                                completed, and that project's overall due date - click a column
                                header to sort.
                            </p>

                        </div>

                    )}

                </>

            )}

        </DashboardLayout>

    );

}
