import { useContext, useEffect, useMemo, useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

import DashboardLayout from "../components/layout/DashboardLayout";
import { AuthContext } from "../context/AuthContext";
import { getTasks } from "../api/tasks";
import { getProjects } from "../api/projects";
import { formatDateSA } from "../utils/date";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];

// Builds a yyyy-mm-dd key from a Date's local components. We deliberately
// avoid date.toISOString() here: it converts to UTC first, which in any
// timezone ahead of UTC (e.g. South Africa, UTC+2) rolls local midnight
// back into the previous UTC day. That shifted the computed key backward,
// which - since due dates are matched into the grid by key - made every
// due date visually land one day later than the actual date it was
// assigned to.
function toDateKey(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

export default function Calendar() {

    const { user } = useContext(AuthContext);
    const isManager = user?.role === "MANAGER";

    const [tasks, setTasks] = useState([]);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cursor, setCursor] = useState(() => {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth(), 1);
    });

    useEffect(() => {
        load();
    }, [isManager]);

    async function load() {

        try {

            // Managers only ever see project due dates (red); developers
            // see both project due dates (red) and task due dates (yellow).
            const projectData = await getProjects();
            setProjects(projectData.filter((p) => p.due_date));

            if (isManager) {
                setTasks([]);
            } else {
                const taskData = await getTasks();
                setTasks(taskData.filter((t) => t.due_date));
            }

        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }

    }

    const tasksByDate = useMemo(() => {

        const map = {};

        tasks.forEach((t) => {
            if (!map[t.due_date]) map[t.due_date] = [];
            map[t.due_date].push(t);
        });

        return map;

    }, [tasks]);

    const projectsByDate = useMemo(() => {

        const map = {};

        projects.forEach((p) => {
            if (!map[p.due_date]) map[p.due_date] = [];
            map[p.due_date].push(p);
        });

        return map;

    }, [projects]);

    const year = cursor.getFullYear();
    const month = cursor.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const startWeekday = firstDayOfMonth.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const todayKey = toDateKey(new Date());

    const cells = [];

    for (let i = 0; i < startWeekday; i++) {
        cells.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        cells.push(new Date(year, month, day));
    }

    function goPrevMonth() {
        setCursor(new Date(year, month - 1, 1));
    }

    function goNextMonth() {
        setCursor(new Date(year, month + 1, 1));
    }

    function goToday() {
        const now = new Date();
        setCursor(new Date(now.getFullYear(), now.getMonth(), 1));
    }

    // Upcoming agenda: projects (and, for developers, tasks) due today or
    // later, soonest first, tagged so they can be color-coded in the list.
    const agenda = useMemo(() => {

        const projectItems = projects.map((p) => ({
            id: `project-${p.id}`,
            kind: "project",
            title: p.name,
            subtitle: "Project due date",
            due_date: p.due_date,
        }));

        const taskItems = tasks.map((t) => ({
            id: `task-${t.id}`,
            kind: "task",
            title: t.title,
            subtitle: t.project_name,
            due_date: t.due_date,
        }));

        return [...projectItems, ...taskItems]
            .filter((item) => item.due_date >= todayKey)
            .sort((a, b) => a.due_date.localeCompare(b.due_date))
            .slice(0, 8);

    }, [projects, tasks, todayKey]);

    return (

        <DashboardLayout>

            <div className="page-header">
                <div>
                    <h2>Calendar</h2>
                    <p className="text-muted mb-0">
                        {isManager
                            ? "Project due dates at a glance."
                            : "Project and task due dates at a glance."}
                    </p>
                </div>

                <button
                    type="button"
                    className="btn btn-outline-primary btn-sm"
                    onClick={goToday}
                >
                    Today
                </button>
            </div>

            {loading ? (

                <p className="text-muted">Loading calendar...</p>

            ) : (

                <div className="calendar-layout">

                    <div className="section-card">

                        <div className="calendar-header">

                            <button
                                type="button"
                                className="calendar-nav-btn"
                                onClick={goPrevMonth}
                                aria-label="Previous month"
                            >
                                <FaChevronLeft />
                            </button>

                            <h5>{MONTH_NAMES[month]} {year}</h5>

                            <button
                                type="button"
                                className="calendar-nav-btn"
                                onClick={goNextMonth}
                                aria-label="Next month"
                            >
                                <FaChevronRight />
                            </button>

                        </div>

                        <div className="calendar-legend">
                            <span className="calendar-legend-item">
                                <span className="calendar-dot project" /> Project due date
                            </span>
                            {!isManager && (
                                <span className="calendar-legend-item">
                                    <span className="calendar-dot task" /> Task due date
                                </span>
                            )}
                        </div>

                        <div className="calendar-grid">

                            {WEEKDAYS.map((d) => (
                                <div className="calendar-weekday" key={d}>{d}</div>
                            ))}

                            {cells.map((date, idx) => {

                                if (!date) {
                                    return <div className="calendar-cell empty" key={`empty-${idx}`} />;
                                }

                                const key = toDateKey(date);
                                const dayProjects = projectsByDate[key] || [];
                                const dayTasks = tasksByDate[key] || [];
                                const isToday = key === todayKey;

                                const tooltipParts = [
                                    ...dayProjects.map((p) => `${p.name} (project due)`),
                                    ...dayTasks.map((t) => `${t.title} (task due)`),
                                ];

                                return (
                                    <div
                                        key={key}
                                        className={
                                            "calendar-cell" +
                                            (isToday ? " today" : "") +
                                            (dayProjects.length > 0 ? " has-project" : "") +
                                            (dayTasks.length > 0 ? " has-task" : "")
                                        }
                                        title={tooltipParts.join(", ")}
                                    >
                                        <div className="calendar-date">{date.getDate()}</div>

                                        {(dayProjects.length > 0 || dayTasks.length > 0) && (
                                            <div className="calendar-dot-row">
                                                {dayProjects.slice(0, 4).map((p) => (
                                                    <span className="calendar-dot project" key={`p-${p.id}`} />
                                                ))}
                                                {dayTasks.slice(0, Math.max(0, 4 - dayProjects.length)).map((t) => (
                                                    <span className="calendar-dot task" key={`t-${t.id}`} />
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );

                            })}

                        </div>

                    </div>

                    <div className="section-card">

                        <div className="chart-card-title">Upcoming</div>

                        {agenda.length === 0 && (
                            <p className="text-muted">Nothing due soon.</p>
                        )}

                        {agenda.map((item) => (
                            <div className="agenda-item" key={item.id}>
                                <div className="d-flex align-items-start gap-2">
                                    <span className={`calendar-dot ${item.kind}`} style={{ marginTop: 6 }} />
                                    <div>
                                        <div className="fw-semibold">{item.title}</div>
                                        <div className="text-muted small">{item.subtitle}</div>
                                    </div>
                                </div>
                                <div className="agenda-date">
                                    {formatDateSA(item.due_date)}
                                </div>
                            </div>
                        ))}

                    </div>

                </div>

            )}

        </DashboardLayout>

    );

}
