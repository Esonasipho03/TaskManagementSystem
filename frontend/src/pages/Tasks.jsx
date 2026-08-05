import { useContext, useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import { FaEdit, FaTrash } from "react-icons/fa";

import DashboardLayout from "../components/layout/DashboardLayout";
import DateFieldSA from "../components/common/DateFieldSA";

import { AuthContext } from "../context/AuthContext";
import {
    getTasks,
    createTask,
    updateTask,
    updateTaskStatus,
    deleteTask,
} from "../api/tasks";
import { getProjects } from "../api/projects";
import { getUsers } from "../api/accounts";
import { formatDateSA } from "../utils/date";

const STATUS_OPTIONS = [
    { value: "TODO", label: "To Do" },
    { value: "IN_PROGRESS", label: "In Progress" },
    { value: "REVIEW", label: "Review" },
    { value: "DONE", label: "Done" },
];

const STATUS_BADGES = {
    TODO: "secondary",
    IN_PROGRESS: "primary",
    REVIEW: "warning",
    DONE: "success",
};

function emptyForm(selfId) {
    return {
        title: "",
        description: "",
        project: "",
        assigned_to: selfId || "",
        priority: "MEDIUM",
        status: "TODO",
        due_date: "",
    };
}

export default function Tasks() {

    const { user } = useContext(AuthContext);
    const isManager = user?.role === "MANAGER";
    const isDeveloper = user?.role === "DEVELOPER";

    const [tasks, setTasks] = useState([]);
    const [projects, setProjects] = useState([]);
    const [developers, setDevelopers] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [form, setForm] = useState(emptyForm());
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {

        loadTasks();

        if (isDeveloper) {
            loadProjects();
            loadDevelopers();
        }

    }, [isDeveloper, user]);

    async function loadTasks() {

        try {
            const data = await getTasks();
            setTasks(data);
        } catch (err) {
            console.error(err);
        }

    }

    async function loadProjects() {

        try {
            // Developers can browse and pick from every project, same as
            // the Projects page. If a project rule (e.g. must be a member
            // to create a task there) is violated, the backend's error
            // message surfaces via the form's error banner.
            const data = await getProjects();
            setProjects(data);
        } catch (err) {
            console.error(err);
        }

    }

    async function loadDevelopers() {

        try {
            const data = await getUsers();
            setDevelopers(data.filter((u) => u.role === "DEVELOPER"));
        } catch (err) {
            console.error(err);
        }

    }

    // Any developer can be assigned to a task, regardless of project
    // membership - the backend enforces whatever restrictions actually
    // apply and reports them back as a form error if violated.
    const assignableTeammates = developers;

    async function handleStatusChange(task, newStatus) {

        const previous = tasks;

        // optimistic update
        setTasks((prev) =>
            prev.map((t) => (t.id === task.id ? { ...t, status: newStatus } : t))
        );

        try {

            await updateTaskStatus(task.id, newStatus);

        } catch (err) {

            console.error(err);
            setTasks(previous);

        }

    }

    function openCreateModal() {

        setEditingTask(null);
        setForm(emptyForm(user?.id));
        setError("");
        setShowModal(true);

    }

    function openEditModal(task) {

        setEditingTask(task);

        setForm({
            title: task.title,
            description: task.description || "",
            project: task.project,
            assigned_to: task.assigned_to || "",
            priority: task.priority,
            status: task.status,
            due_date: task.due_date,
        });

        setError("");
        setShowModal(true);

    }

    async function handleDelete(task) {

        if (!window.confirm(`Delete "${task.title}"? This can't be undone.`)) {
            return;
        }

        const previous = tasks;
        setTasks((prev) => prev.filter((t) => t.id !== task.id));

        try {
            await deleteTask(task.id);
        } catch (err) {
            console.error(err);
            setTasks(previous);
        }

    }

    function handleChange(e) {

        const { name, value } = e.target;

        setForm((prev) => {

            const next = { ...prev, [name]: value };

            // Changing project can invalidate the previously chosen assignee.
            if (name === "project") {
                next.assigned_to = "";
            }

            return next;

        });

    }

    async function handleSubmit(e) {

        e.preventDefault();

        setError("");
        setSubmitting(true);

        try {

            const payload = {
                ...form,
                assigned_to: form.assigned_to || null,
            };

            if (editingTask) {
                await updateTask(editingTask.id, payload);
            } else {
                await createTask(payload);
            }

            setShowModal(false);
            loadTasks();

        } catch (err) {

            const data = err?.response?.data;

            setError(
                data
                    ? Object.values(data).flat().join(" ")
                    : "Could not save the task."
            );

        } finally {

            setSubmitting(false);

        }

    }

    function canEdit(task) {
        // The backend already scopes /tasks/ to projects the developer
        // belongs to, so anything returned here is fair game to edit.
        return true;
    }

    function canDelete(task) {
        return task.created_by === user?.id;
    }

    return (
        <DashboardLayout>

            <div className="d-flex justify-content-between align-items-center mb-4">

                <div>
                    <h2>Tasks</h2>
                    <p className="text-muted mb-0">
                        {isManager
                            ? "Tasks your developers have broken projects down into."
                            : "Break your projects down into tasks and hand them out to the team."}
                    </p>
                </div>

                {isDeveloper && (

                    <button className="btn btn-primary" onClick={openCreateModal}>
                        + New Task
                    </button>

                )}

            </div>

            <div className="card shadow-sm border-0">

                <div className="table-responsive">

                    <table className="table table-hover align-middle mb-0">

                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Project</th>
                                <th>Assigned To</th>
                                <th>Status</th>
                                <th>Priority</th>
                                <th>Due Date</th>
                                {isDeveloper && <th className="text-end">Actions</th>}
                            </tr>
                        </thead>

                        <tbody>

                            {tasks.map(task => {

                                const editable = isDeveloper && canEdit(task);
                                const deletable = isDeveloper && canDelete(task);

                                return (

                                    <tr key={task.id}>

                                        <td>{task.title}</td>

                                        <td>{task.project_name}</td>

                                        <td>{task.assigned_to_name || "Unassigned"}</td>

                                        <td>

                                            {editable ? (
                                                <select
                                                    className="form-select form-select-sm"
                                                    value={task.status}
                                                    onChange={(e) =>
                                                        handleStatusChange(task, e.target.value)
                                                    }
                                                    style={{ width: "auto" }}
                                                >
                                                    {STATUS_OPTIONS.map((opt) => (
                                                        <option key={opt.value} value={opt.value}>
                                                            {opt.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <span className={`badge bg-${STATUS_BADGES[task.status]}`}>
                                                    {STATUS_OPTIONS.find((o) => o.value === task.status)?.label}
                                                </span>
                                            )}

                                        </td>

                                        <td>{task.priority}</td>

                                        <td>{formatDateSA(task.due_date)}</td>

                                        {isDeveloper && (

                                            <td className="text-end">

                                                {editable && (
                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-light me-2"
                                                        onClick={() => openEditModal(task)}
                                                        title="Edit task"
                                                    >
                                                        <FaEdit />
                                                    </button>
                                                )}

                                                {deletable && (
                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-light text-danger"
                                                        onClick={() => handleDelete(task)}
                                                        title="Delete task"
                                                    >
                                                        <FaTrash />
                                                    </button>
                                                )}

                                            </td>

                                        )}

                                    </tr>

                                );

                            })}

                            {tasks.length === 0 && (
                                <tr>
                                    <td colSpan={isDeveloper ? 7 : 6} className="text-center text-muted py-4">
                                        {isManager
                                            ? "No tasks have been created yet."
                                            : "You haven't broken any work down into tasks yet."}
                                    </td>
                                </tr>
                            )}

                        </tbody>

                    </table>

                </div>

            </div>

            <Modal show={showModal} onHide={() => setShowModal(false)} centered>

                <Modal.Header closeButton>
                    <Modal.Title>{editingTask ? "Edit Task" : "New Task"}</Modal.Title>
                </Modal.Header>

                <form onSubmit={handleSubmit}>

                    <Modal.Body>

                        <input
                            className="form-control mb-3"
                            name="title"
                            placeholder="Task title"
                            value={form.title}
                            onChange={handleChange}
                            required
                        />

                        <textarea
                            className="form-control mb-3"
                            name="description"
                            placeholder="Description"
                            rows={3}
                            value={form.description}
                            onChange={handleChange}
                        />

                        <label className="form-label small text-muted">Project</label>
                        <select
                            className="form-control mb-3"
                            name="project"
                            value={form.project}
                            onChange={handleChange}
                            required
                        >
                            <option value="" disabled>Select a project</option>
                            {projects.map((p) => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>

                        {projects.length === 0 && (
                            <p className="text-muted small mb-3">
                                No projects exist yet - ask a manager to create one before creating tasks.
                            </p>
                        )}

                        <label className="form-label small text-muted">Assign to</label>
                        <select
                            className="form-control mb-3"
                            name="assigned_to"
                            value={form.assigned_to}
                            onChange={handleChange}
                            disabled={!form.project}
                        >
                            <option value="">Unassigned</option>
                            {assignableTeammates.map((d) => (
                                <option key={d.id} value={d.id}>
                                    {d.id === user?.id ? `${d.username} (me)` : d.username}
                                </option>
                            ))}
                        </select>

                        <div className="row">

                            <div className="col-6">
                                <label className="form-label small text-muted">Priority</label>
                                <select
                                    className="form-control mb-3"
                                    name="priority"
                                    value={form.priority}
                                    onChange={handleChange}
                                >
                                    <option value="LOW">Low</option>
                                    <option value="MEDIUM">Medium</option>
                                    <option value="HIGH">High</option>
                                    <option value="CRITICAL">Critical</option>
                                </select>
                            </div>

                            <div className="col-6">
                                <label className="form-label small text-muted">Due date</label>
                                <DateFieldSA
                                    name="due_date"
                                    value={form.due_date}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                        </div>

                        {editingTask && (

                            <>
                                <label className="form-label small text-muted">Status</label>
                                <select
                                    className="form-control mb-3"
                                    name="status"
                                    value={form.status}
                                    onChange={handleChange}
                                >
                                    {STATUS_OPTIONS.map((opt) => (
                                        <option key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                            </>

                        )}

                        {error && (
                            <div className="alert alert-danger">
                                {error}
                            </div>
                        )}

                    </Modal.Body>

                    <Modal.Footer>

                        <button
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={() => setShowModal(false)}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={submitting || (!editingTask && projects.length === 0)}
                        >
                            {submitting ? "Saving..." : editingTask ? "Save Changes" : "Create Task"}
                        </button>

                    </Modal.Footer>

                </form>

            </Modal>

        </DashboardLayout>
    );
}
