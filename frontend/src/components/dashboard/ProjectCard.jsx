const STATUS_OPTIONS = [
    { value: "PLANNING", label: "Planning" },
    { value: "ACTIVE", label: "Active" },
    { value: "ON_HOLD", label: "On Hold" },
    { value: "COMPLETED", label: "Completed" },
];

const STATUS_BADGES = {
    PLANNING: "secondary",
    ACTIVE: "success",
    ON_HOLD: "warning",
    COMPLETED: "primary",
};

export default function ProjectCard({
    title,
    description,
    progress,
    members,
    status,
    canEditStatus = false,
    onStatusChange,
    onClick,
}) {
    return (
        <div
            className={`card shadow-sm border-0 rounded-4 h-100${onClick ? " project-card-clickable" : ""}`}
            onClick={onClick}
            role={onClick ? "button" : undefined}
            tabIndex={onClick ? 0 : undefined}
            onKeyDown={(e) => {
                if (onClick && (e.key === "Enter" || e.key === " ")) {
                    e.preventDefault();
                    onClick();
                }
            }}
        >
            <div className="card-body">

                <h5 className="fw-bold">{title}</h5>

                <p className="text-muted">
                    {description}
                </p>

                <div className="mb-3">

                    <div className="d-flex justify-content-between">

                        <small>Progress</small>

                        <small>{progress}%</small>

                    </div>

                    <div className="progress">

                        <div
                            className="progress-bar"
                            style={{ width: `${progress}%` }}
                        ></div>

                    </div>

                </div>

                <div className="d-flex justify-content-between align-items-center">

                    {canEditStatus ? (
                        <select
                            className="form-select form-select-sm w-auto"
                            value={status}
                            onChange={(e) => onStatusChange?.(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {STATUS_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    ) : (
                        <span className={`badge bg-${STATUS_BADGES[status] || "secondary"}`}>
                            {STATUS_OPTIONS.find((o) => o.value === status)?.label || status}
                        </span>
                    )}

                    <small>{members} Members</small>

                </div>

            </div>
        </div>
    );
}
