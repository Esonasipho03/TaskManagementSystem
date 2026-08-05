import { useContext, useEffect, useState } from "react";
import { Modal } from "react-bootstrap";

import DashboardLayout from "../components/layout/DashboardLayout";
import ProjectCard from "../components/dashboard/ProjectCard";
import DateFieldSA from "../components/common/DateFieldSA";

import { AuthContext } from "../context/AuthContext";
import { getProjects, createProject, updateProject, updateProjectStatus } from "../api/projects";
import { getUsers } from "../api/accounts";

const emptyForm = {
    name: "",
    description: "",
    status: "PLANNING",
    start_date: "",
    due_date: "",
    members: [],
};

export default function Projects() {

    const { user } = useContext(AuthContext);
    const isManager = user?.role === "MANAGER";

    const [projects, setProjects] = useState([]);
    const [users, setUsers] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editingProject, setEditingProject] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {

        loadProjects();

        if (isManager) {
            loadUsers();
        }

    }, [isManager]);

    async function loadProjects() {

        try {

            const data = await getProjects();

            setProjects(data);

        } catch (err) {

            console.error(err);

        }

    }

    async function loadUsers() {

        try {

            const data = await getUsers();

            setUsers(data.filter((u) => u.role === "DEVELOPER"));

        } catch (err) {

            console.error(err);

        }

    }

    async function handleStatusChange(project, newStatus) {

        const previous = projects;

        // optimistic update
        setProjects((prev) =>
            prev.map((p) => (p.id === project.id ? { ...p, status: newStatus } : p))
        );

        try {

            await updateProjectStatus(project.id, newStatus);

        } catch (err) {

            console.error(err);
            setProjects(previous);

        }

    }

    function handleChange(e) {

        const { name, value } = e.target;

        setForm((prev) => ({ ...prev, [name]: value }));

    }

    function toggleMember(id) {

        setForm((prev) => {

            const members = prev.members.includes(id)
                ? prev.members.filter((m) => m !== id)
                : [...prev.members, id];

            return { ...prev, members };

        });

    }

    function openModal() {

        setEditingProject(null);
        setForm(emptyForm);
        setError("");
        setShowModal(true);

    }

    function openProjectModal(project) {

        setEditingProject(project);

        setForm({
            name: project.name,
            description: project.description || "",
            status: project.status,
            start_date: project.start_date,
            due_date: project.due_date,
            members: project.members || [],
        });

        setError("");
        setShowModal(true);

    }

    async function handleSubmit(e) {

        e.preventDefault();

        setError("");
        setSubmitting(true);

        try {

            if (editingProject) {

                await updateProject(editingProject.id, form);

            } else {

                await createProject(form);

            }

            setShowModal(false);

            loadProjects();

        } catch (err) {

            const data = err?.response?.data;

            setError(
                data
                    ? Object.values(data).flat().join(" ")
                    : `Could not ${editingProject ? "update" : "create"} the project.`
            );

        } finally {

            setSubmitting(false);

        }

    }

    const canEditModal = editingProject
        ? isManager && editingProject.manager === user?.id
        : true;

    return (

        <DashboardLayout>

            <div className="d-flex justify-content-between align-items-center mb-4">

                <div>

                    <h2>Projects</h2>

                    <p className="text-muted">
                        {isManager
                            ? "Manage development projects."
                            : "Browse every project across the team."}
                    </p>

                </div>

                {isManager && (

                    <button
                        className="btn btn-primary"
                        onClick={openModal}
                    >

                        + New Project

                    </button>

                )}

            </div>

            <div className="row g-4">

                {projects.map(project => (

                    <div
                        className="col-lg-4"
                        key={project.id}
                    >

                        <ProjectCard

                            title={project.name}

                            description={project.description}

                            progress={project.progress ?? 0}

                            status={project.status}

                            members={project.members.length}

                            canEditStatus={isManager && project.manager === user?.id}

                            onStatusChange={(newStatus) => handleStatusChange(project, newStatus)}

                            onClick={isManager ? () => openProjectModal(project) : undefined}

                        />

                    </div>

                ))}

                {projects.length === 0 && (

                    <p className="text-muted">
                        No projects to show yet.
                    </p>

                )}

            </div>

            <Modal show={showModal} onHide={() => setShowModal(false)} centered>

                <Modal.Header closeButton>
                    <Modal.Title>
                        {editingProject
                            ? (canEditModal ? "Edit Project" : "View Project")
                            : "New Project"}
                    </Modal.Title>
                </Modal.Header>

                <form onSubmit={handleSubmit}>

                    <Modal.Body>

                        <input
                            className="form-control mb-3"
                            name="name"
                            placeholder="Project name"
                            value={form.name}
                            onChange={handleChange}
                            disabled={!canEditModal}
                            required
                        />

                        <textarea
                            className="form-control mb-3"
                            name="description"
                            placeholder="Description"
                            rows={3}
                            value={form.description}
                            onChange={handleChange}
                            disabled={!canEditModal}
                        />

                        <div className="row">

                            <div className="col-6">
                                <label className="form-label small text-muted">Start date</label>
                                <DateFieldSA
                                    name="start_date"
                                    value={form.start_date}
                                    onChange={handleChange}
                                    disabled={!canEditModal}
                                    required
                                />
                            </div>

                            <div className="col-6">
                                <label className="form-label small text-muted">Due date</label>
                                <DateFieldSA
                                    name="due_date"
                                    value={form.due_date}
                                    onChange={handleChange}
                                    disabled={!canEditModal}
                                    required
                                />
                            </div>

                        </div>

                        <label className="form-label small text-muted">Status</label>
                        <select
                            className="form-control mb-3"
                            name="status"
                            value={form.status}
                            onChange={handleChange}
                            disabled={!canEditModal}
                        >
                            <option value="PLANNING">Planning</option>
                            <option value="ACTIVE">Active</option>
                            <option value="ON_HOLD">On Hold</option>
                            <option value="COMPLETED">Completed</option>
                        </select>

                        <label className="form-label small text-muted">Team members</label>
                        <div className="mb-2" style={{ maxHeight: 150, overflowY: "auto" }}>

                            {users.map((u) => (

                                <div className="form-check" key={u.id}>

                                    <input
                                        type="checkbox"
                                        className="form-check-input"
                                        id={`member-${u.id}`}
                                        checked={form.members.includes(u.id)}
                                        onChange={() => toggleMember(u.id)}
                                        disabled={!canEditModal}
                                    />

                                    <label
                                        className="form-check-label"
                                        htmlFor={`member-${u.id}`}
                                    >
                                        {u.username}
                                    </label>

                                </div>

                            ))}

                            {users.length === 0 && (
                                <small className="text-muted">
                                    No developers found yet.
                                </small>
                            )}

                        </div>

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
                            {canEditModal ? "Cancel" : "Close"}
                        </button>

                        {canEditModal && (
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={submitting}
                            >
                                {submitting
                                    ? (editingProject ? "Saving..." : "Creating...")
                                    : (editingProject ? "Save Changes" : "Create Project")}
                            </button>
                        )}

                    </Modal.Footer>

                </form>

            </Modal>

        </DashboardLayout>

    );

}
