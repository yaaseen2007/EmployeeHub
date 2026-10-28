
import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  Check,
  ChevronDown,
  CircleHelp,
  ClipboardList,
  Code2,
  LayoutDashboard,
  LoaderCircle,
  LogOut,
  Mail,
  Menu,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Trash2,
  Users,
  X,
} from "lucide-react";
import "./App.css";

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  "http://127.0.0.1:8000/api/v1"
).replace(/\/+$/, "");

const EMPTY_FORM = {
  emp_id: "",
  emp_name: "",
  designation: "",
  department: "Engineering",
  email: "",
  phone: "",
  date_joined: new Date().toLocaleDateString("en-CA"),
  status: "Active",
};

const COLORS = [
  "avatar-indigo",
  "avatar-blue",
  "avatar-violet",
  "avatar-teal",
  "avatar-orange",
  "avatar-pink",
];

function getInitials(name = "") {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase() || "EM";
}

function getAvatarColor(name = "") {
  const total = [...name].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return COLORS[total % COLORS.length];
}

function formatDate(date) {
  if (!date) return "—";

  return new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getErrorMessage(data) {
  if (!data) return "Something went wrong. Please try again.";

  if (typeof data === "string") return data;

  return Object.entries(data)
    .map(([field, messages]) => {
      const message = Array.isArray(messages)
        ? messages.join(", ")
        : typeof messages === "object"
          ? JSON.stringify(messages)
          : String(messages);

      return `${field}: ${message}`;
    })
    .join(" • ");
}

async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });

  const text = await response.text();
  let data = null;

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!response.ok) {
    throw new Error(
      getErrorMessage(data) || `Request failed (${response.status})`
    );
  }

  return data;
}

function App() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All employees");
  const [departmentFilter, setDepartmentFilter] = useState("All departments");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  async function loadEmployees() {
    setLoading(true);
    setError("");

    try {
      const data = await apiRequest("/employees/");
      setEmployees(
        Array.isArray(data) ? data : Array.isArray(data?.results) ? data.results : []
      );
    } catch (err) {
      setError(
        `${err.message}. Check that Django is running and the API URL is correct.`
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEmployees();
  }, []);

  const departments = useMemo(() => {
    return [
      "All departments",
      ...new Set(employees.map((employee) => employee.department).filter(Boolean)),
    ];
  }, [employees]);

  const activeCount = employees.filter(
    (employee) => employee.status === "Active"
  ).length;

  const inactiveCount = employees.filter(
    (employee) => employee.status === "Inactive"
  ).length;

  const filteredEmployees = employees.filter((employee) => {
    const searchText = search.toLowerCase().trim();

    const matchesSearch = [
      employee.emp_name,
      employee.emp_id,
      employee.designation,
      employee.department,
      employee.email,
    ].some((value) => String(value || "").toLowerCase().includes(searchText));

    const matchesStatus =
      statusFilter === "All employees" || employee.status === statusFilter;

    const matchesDepartment =
      departmentFilter === "All departments" ||
      employee.department === departmentFilter;

    return matchesSearch && matchesStatus && matchesDepartment;
  });

  function openAddModal() {
    setEditingEmployee(null);
    setForm({ ...EMPTY_FORM });
    setError("");
    setModalOpen(true);
  }

  function openEditModal(employee) {
    setEditingEmployee(employee);
    setForm({
      emp_id: employee.emp_id || "",
      emp_name: employee.emp_name || "",
      designation: employee.designation || "",
      department: employee.department || "Engineering",
      email: employee.email || "",
      phone: employee.phone || "",
      date_joined: employee.date_joined || "",
      status: employee.status || "Active",
    });
    setError("");
    setModalOpen(true);
  }

  function closeModal() {
    if (saving) return;
    setModalOpen(false);
    setEditingEmployee(null);
    setError("");
  }

  function updateField(event) {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");

    const payload = {
      ...form,
      emp_id: form.emp_id.trim(),
      emp_name: form.emp_name.trim(),
      designation: form.designation.trim(),
      department: form.department.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
    };

    try {
      if (editingEmployee) {
        await apiRequest(`/employees/${editingEmployee.id}/`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        setNotice("Employee details updated successfully.");
      } else {
        await apiRequest("/employees/", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        setNotice("New employee added successfully.");
      }

      setModalOpen(false);
      setEditingEmployee(null);
      await loadEmployees();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(employee) {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${employee.emp_name}? This cannot be undone.`
    );

    if (!confirmed) return;

    setError("");
    setNotice("");

    try {
      await apiRequest(`/employees/${employee.id}/`, {
        method: "DELETE",
      });
      setEmployees((previous) =>
        previous.filter((item) => item.id !== employee.id)
      );
      setNotice(`${employee.emp_name} was deleted successfully.`);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="app-shell">
      {sidebarOpen && (
        <button
          className="sidebar-backdrop"
          aria-label="Close navigation"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
        <a className="brand" href="#" onClick={() => setSidebarOpen(false)}>
          <span className="brand-mark">
            <Users size={22} strokeWidth={2.5} />
          </span>
          <span className="brand-name">
            Employee<span>Hub</span>
          </span>
        </a>

        <div className="workspace-label">WORKSPACE</div>

        <nav className="side-nav">
          <a className="nav-link active" href="#dashboard">
            <LayoutDashboard size={19} />
            <span>Dashboard</span>
          </a>
          <a className="nav-link" href="#employees">
            <Users size={19} />
            <span>All employees</span>
            <span className="nav-count">{employees.length}</span>
          </a>
          <a
            className="nav-link"
            href="#employees"
            onClick={() => setStatusFilter("Active")}
          >
            <ShieldCheck size={19} />
            <span>Active employees</span>
          </a>
          <a
            className="nav-link"
            href="#employees"
            onClick={() => setStatusFilter("Inactive")}
          >
            <ClipboardList size={19} />
            <span>Inactive employees</span>
          </a>
        </nav>

        <div className="workspace-label department-heading">MANAGEMENT</div>

        <nav className="side-nav">
          <a className="nav-link" href="#employees" onClick={openAddModal}>
            <Plus size={19} />
            <span>Add employee</span>
          </a>
          <a
            className="nav-link"
            href="#departments"
            onClick={() => setDepartmentFilter("All departments")}
          >
            <Building2 size={19} />
            <span>Departments</span>
          </a>
          <a
            className="nav-link"
            href="#settings"
            onClick={() =>
              setNotice("Settings are not part of this version yet.")
            }
          >
            <Settings size={19} />
            <span>Settings</span>
          </a>
        </nav>

        <div className="sidebar-bottom">
          <div className="help-card">
            <span className="help-icon">
              <CircleHelp size={19} />
            </span>
            <strong>Need a hand?</strong>
            <p>Your team workspace, all in one place.</p>
            <button
              className="help-link"
              onClick={() =>
                setNotice("Tip: use Search to find an employee quickly.")
              }
            >
              Quick tip <ArrowUpRight size={14} />
            </button>
          </div>

          <div className="sidebar-user">
            <div className="user-avatar">Y</div>
            <div className="user-info">
              <strong>Workspace Admin</strong>
              <span>Administrator</span>
            </div>
            <button
              className="icon-button user-more"
              title="Account"
              onClick={() => setNotice("You are viewing the local admin workspace.")}
            >
              <MoreHorizontal size={19} />
            </button>
          </div>
        </div>
      </aside>

      <main className="main-area" id="dashboard">
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="icon-button mobile-menu"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open navigation"
            >
              <Menu size={21} />
            </button>
            <div className="breadcrumb">
              Workspace <span>/</span> <strong>Dashboard</strong>
            </div>
          </div>

          <div className="topbar-right">
            <span className="live-indicator">
              <span /> API workspace
            </span>
            <div className="topbar-divider" />
            <div className="topbar-profile">
              <div className="user-avatar small">Y</div>
              <ChevronDown size={15} />
            </div>
          </div>
        </header>

        <div className="page-content">
          <section className="welcome-row">
            <div>
              <div className="eyebrow">
                <span className="eyebrow-line" /> PEOPLE & OPERATIONS
              </div>
              <h1>Good to see you<span className="title-dot">.</span></h1>
              <p className="page-subtitle">
                Here’s what’s happening with your team today.
              </p>
            </div>

            <button className="primary-button" onClick={openAddModal}>
              <Plus size={18} strokeWidth={2.5} />
              Add employee
            </button>
          </section>

          {notice && (
            <div className="notice-banner">
              <Check size={17} />
              <span>{notice}</span>
              <button onClick={() => setNotice("")} aria-label="Dismiss message">
                <X size={16} />
              </button>
            </div>
          )}

          {error && !modalOpen && (
            <div className="error-banner">
              <span>{error}</span>
              <button className="text-button" onClick={loadEmployees}>
                Try again
              </button>
            </div>
          )}

          <section className="stats-grid" aria-label="Employee statistics">
            <article className="stat-card">
              <div className="stat-top">
                <span className="stat-icon indigo">
                  <Users size={20} />
                </span>
                <span className="stat-trend neutral">
                  <Activity size={13} /> Team overview
                </span>
              </div>
              <div className="stat-label">Total employees</div>
              <div className="stat-value">
                {loading ? "—" : employees.length}
              </div>
              <div className="stat-foot">
                <span className="stat-foot-icon"><Users size={14} /></span>
                All registered employees
              </div>
            </article>

            <article className="stat-card">
              <div className="stat-top">
                <span className="stat-icon green">
                  <ShieldCheck size={20} />
                </span>
                <span className="stat-trend positive">
                  <ArrowUpRight size={14} /> Active
                </span>
              </div>
              <div className="stat-label">Active employees</div>
              <div className="stat-value">
                {loading ? "—" : activeCount}
              </div>
              <div className="stat-foot">
                <span className="mini-dot green-dot" />
                Currently active in the team
              </div>
            </article>

            <article className="stat-card">
              <div className="stat-top">
                <span className="stat-icon orange">
                  <BriefcaseBusiness size={20} />
                </span>
                <span className="stat-trend neutral">Status overview</span>
              </div>
              <div className="stat-label">Inactive employees</div>
              <div className="stat-value">
                {loading ? "—" : inactiveCount}
              </div>
              <div className="stat-foot">
                <span className="mini-dot orange-dot" />
                Not currently active
              </div>
            </article>

            <article className="stat-card">
              <div className="stat-top">
                <span className="stat-icon blue">
                  <Building2 size={20} />
                </span>
                <span className="stat-trend neutral">Organization</span>
              </div>
              <div className="stat-label">Departments</div>
              <div className="stat-value">
                {loading ? "—" : departments.length - 1}
              </div>
              <div className="stat-foot">
                <span className="stat-foot-icon"><Building2 size={14} /></span>
                Unique departments represented
              </div>
            </article>
          </section>

          <section className="employees-panel" id="employees">
            <div className="panel-heading">
              <div>
                <div className="panel-title-row">
                  <h2>All employees</h2>
                  <span className="record-count">{filteredEmployees.length}</span>
                </div>
                <p className="panel-subtitle">
                  Manage your people, all in one place.
                </p>
              </div>
              <button className="secondary-button export-button" onClick={() => {
                const headers = [
                  "ID", "Employee ID", "Name", "Designation",
                  "Department", "Email", "Phone", "Date joined", "Status"
                ];
                const rows = filteredEmployees.map((e) => [
                  e.id, e.emp_id, e.emp_name, e.designation,
                  e.department, e.email, e.phone, e.date_joined, e.status
                ]);
                const csv = [headers, ...rows]
                  .map((row) => row.map((cell) =>
                    `"${String(cell ?? "").replace(/"/g, '""')}"`
                  ).join(","))
                  .join("\n");
                const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.download = "employeehub-employees.csv";
                link.click();
                URL.revokeObjectURL(url);
              }}>
                <ClipboardList size={16} /> Export CSV
              </button>
            </div>

            <div className="table-toolbar">
              <div className="search-box">
                <Search size={18} />
                <input
                  type="search"
                  placeholder="Search name, ID, department..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  aria-label="Search employees"
                />
                {search && (
                  <button
                    className="search-clear"
                    onClick={() => setSearch("")}
                    aria-label="Clear search"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>

              <div className="filters">
                <label className="filter-select">
                  <span>Status:</span>
                  <select
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value)}
                  >
                    <option>All employees</option>
                    <option>Active</option>
                    <option>Inactive</option>
                  </select>
                  <ChevronDown size={14} />
                </label>

                <label className="filter-select department-filter">
                  <span>Department:</span>
                  <select
                    value={departmentFilter}
                    onChange={(event) => setDepartmentFilter(event.target.value)}
                  >
                    {departments.map((department) => (
                      <option key={department}>{department}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} />
                </label>
              </div>
            </div>

            <div className="table-scroll">
              <table className="employee-table">
                <thead>
                  <tr>
                    <th>EMPLOYEE</th>
                    <th>EMPLOYEE ID</th>
                    <th>DEPARTMENT</th>
                    <th>DATE JOINED</th>
                    <th>STATUS</th>
                    <th className="actions-heading">ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="table-message">
                        <LoaderCircle className="spin" size={23} />
                        <span>Loading your team...</span>
                      </td>
                    </tr>
                  ) : filteredEmployees.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="table-message empty-state">
                        <span className="empty-icon"><Users size={25} /></span>
                        <strong>
                          {employees.length === 0
                            ? "Your team starts here"
                            : "No matching employees"}
                        </strong>
                        <span>
                          {employees.length === 0
                            ? "Add your first employee to populate this dashboard."
                            : "Try another search term or change your filters."}
                        </span>
                        {employees.length === 0 && (
                          <button className="primary-button compact" onClick={openAddModal}>
                            <Plus size={16} /> Add your first employee
                          </button>
                        )}
                      </td>
                    </tr>
                  ) : (
                    filteredEmployees.map((employee) => (
                      <tr key={employee.id}>
                        <td>
                          <div className="employee-cell">
                            <div className={`employee-avatar ${getAvatarColor(employee.emp_name)}`}>
                              {getInitials(employee.emp_name)}
                            </div>
                            <div className="employee-details">
                              <strong>{employee.emp_name}</strong>
                              <span>{employee.designation}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="employee-id">#{employee.emp_id}</span>
                        </td>
                        <td>
                          <div className="department-cell">
                            <span className="department-icon"><BriefcaseBusiness size={15} /></span>
                            {employee.department}
                          </div>
                        </td>
                        <td>
                          <span className="date-cell">
                            <CalendarDays size={15} />
                            {formatDate(employee.date_joined)}
                          </span>
                        </td>
                        <td>
                          <span className={`status-badge ${employee.status === "Active" ? "status-active" : "status-inactive"}`}>
                            <span />
                            {employee.status}
                          </span>
                        </td>
                        <td>
                          <div className="row-actions">
                            <button
                              className="action-button edit-action"
                              onClick={() => openEditModal(employee)}
                              title={`Edit ${employee.emp_name}`}
                              aria-label={`Edit ${employee.emp_name}`}
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              className="action-button delete-action"
                              onClick={() => handleDelete(employee)}
                              title={`Delete ${employee.emp_name}`}
                              aria-label={`Delete ${employee.emp_name}`}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="table-footer">
              <span>
                Showing <strong>{filteredEmployees.length}</strong> of{" "}
                <strong>{employees.length}</strong> employees
              </span>
              <button
                className="refresh-button"
                onClick={loadEmployees}
                disabled={loading}
              >
                <Activity size={15} className={loading ? "spin" : ""} />
                Refresh data
              </button>
            </div>
          </section>

          <footer className="page-footer">
            <span>© 2026 EmployeeHub</span>
            <span className="footer-center">
              <span className="footer-status-dot" /> Built for better teamwork
            </span>
            <span className="footer-version"><Code2 size={14} /> v1.0.0</span>
          </footer>
        </div>
      </main>

      {modalOpen && (
        <div className="modal-overlay" onMouseDown={(event) => {
          if (event.target === event.currentTarget) closeModal();
        }}>
          <section className="employee-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
            <div className="modal-header">
              <div className="modal-heading-icon">
                {editingEmployee ? <Pencil size={20} /> : <Users size={21} />}
              </div>
              <div className="modal-heading-copy">
                <h2 id="modal-title">
                  {editingEmployee ? "Edit employee" : "Add new employee"}
                </h2>
                <p>
                  {editingEmployee
                    ? "Update this employee's information."
                    : "Enter the details to add someone to your team."}
                </p>
              </div>
              <button className="icon-button modal-close" onClick={closeModal} aria-label="Close form">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {error && <div className="form-error">{error}</div>}

                <div className="form-section-title">PERSONAL INFORMATION</div>
                <div className="form-grid">
                  <label className="form-field">
                    <span>Full name <b>*</b></span>
                    <input
                      name="emp_name"
                      value={form.emp_name}
                      onChange={updateField}
                      placeholder="e.g. Arun Kumar"
                      required
                    />
                  </label>

                  <label className="form-field">
                    <span>Employee ID <b>*</b></span>
                    <input
                      name="emp_id"
                      value={form.emp_id}
                      onChange={updateField}
                      placeholder="e.g. EMP007"
                      required
                    />
                  </label>

                  <label className="form-field">
                    <span>Email address <b>*</b></span>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={updateField}
                      placeholder="name@example.com"
                      required
                    />
                  </label>

                  <label className="form-field">
                    <span>Phone number <b>*</b></span>
                    <input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={updateField}
                      placeholder="Enter phone number"
                      required
                    />
                  </label>
                </div>

                <div className="form-section-title form-section-spaced">WORK INFORMATION</div>
                <div className="form-grid">
                  <label className="form-field">
                    <span>Designation <b>*</b></span>
                    <input
                      name="designation"
                      value={form.designation}
                      onChange={updateField}
                      placeholder="e.g. Python Developer"
                      required
                    />
                  </label>

                  <label className="form-field">
                    <span>Department <b>*</b></span>
                    <select
                      name="department"
                      value={form.department}
                      onChange={updateField}
                      required
                    >
                      <option>Engineering</option>
                      <option>Development</option>
                      <option>Quality Assurance</option>
                      <option>Human Resources</option>
                      <option>Design</option>
                      <option>IT Support</option>
                      <option>Marketing</option>
                      <option>Operations</option>
                      <option>Sales</option>
                      <option>Finance</option>
                    </select>
                  </label>

                  <label className="form-field">
                    <span>Date joined <b>*</b></span>
                    <input
                      type="date"
                      name="date_joined"
                      value={form.date_joined}
                      onChange={updateField}
                      required
                    />
                  </label>

                  <label className="form-field">
                    <span>Employment status <b>*</b></span>
                    <select
                      name="status"
                      value={form.status}
                      onChange={updateField}
                      required
                    >
                      <option>Active</option>
                      <option>Inactive</option>
                    </select>
                  </label>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="secondary-button" onClick={closeModal} disabled={saving}>
                  Cancel
                </button>
                <button type="submit" className="primary-button" disabled={saving}>
                  {saving ? (
                    <><LoaderCircle size={17} className="spin" /> Saving...</>
                  ) : (
                    <><Check size={17} /> {editingEmployee ? "Save changes" : "Add employee"}</>
                  )}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}

export default App;
