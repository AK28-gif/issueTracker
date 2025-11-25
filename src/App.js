import React, { useEffect, useState } from "react";
import "./App.css";

/*
  Soft Card UI Issue Tracker (Frontend)
  - Talks to backend at http://localhost:5000/api/issues
  - Features: Add / Edit / Delete / Close (mark Completed)
  - Fields: title, description, owner, status (New, On Going, Completed),
            effort (days), created, dueDate, completionDate
  - Link to uploaded brief: /mnt/data/Issue Tracker.docx
*/

const API_BASE = "http://localhost:5000/api/issues";

function formatDate(d) {
  if (!d) return "-";
  try {
    const date = new Date(d);
    return date.toLocaleDateString();
  } catch {
    return d;
  }
}

export default function App() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("");
  const [editingId, setEditingId] = useState(null);

  // form state for add
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [owner, setOwner] = useState("");
  const [effort, setEffort] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [completionDate, setCompletionDate] = useState("");

  useEffect(() => {
    fetchIssues();
    // eslint-disable-next-line
  }, []);

  async function fetchIssues() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(API_BASE);
      const data = await res.json();
      // ensure created field is Date-like or string — keep as-is
      setIssues(data.reverse()); // show newest first
    } catch (err) {
      console.error(err);
      setError("Failed to load issues from server.");
    } finally {
      setLoading(false);
    }
  }

  // Add issue
  async function handleAdd(e) {
    e.preventDefault();
    const payload = {
      title,
      description,
      owner,
      status: "New",
      effort: effort ? Number(effort) : 0,
      created: new Date(),
      dueDate: dueDate || "",
      completionDate: completionDate || "",
    };
    try {
      const res = await fetch(API_BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const saved = await res.json();
      setIssues((prev) => [saved, ...prev]);
      // clear form
      setTitle(""); setDescription(""); setOwner(""); setEffort(""); setDueDate(""); setCompletionDate("");
    } catch (err) {
      console.error(err);
      setError("Failed to add issue.");
    }
  }

  // Delete
  async function handleDelete(id) {
    try {
      await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
      setIssues((prev) => prev.filter((i) => i._id !== id && i.id !== id));
    } catch (err) {
      console.error(err);
      setError("Failed to delete issue.");
    }
  }

  // Close (mark Completed)
  async function handleClose(id) {
    try {
      const res = await fetch(`${API_BASE}/${id}/close`, { method: "PATCH" });
      const updated = await res.json();
      setIssues((prev) => prev.map((i) => (i._id === updated._id ? updated : i)));
    } catch (err) {
      console.error(err);
      setError("Failed to close issue.");
    }
  }

  // Save edited issue (id may be Mongo _id or local id)
  async function handleSaveEdit(id, form) {
    try {
      const res = await fetch(`${API_BASE}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const updated = await res.json();
      setIssues((prev) => prev.map((i) => (i._id === updated._id ? updated : i)));
      setEditingId(null);
    } catch (err) {
      console.error(err);
      setError("Failed to update issue.");
    }
  }

  // start editing: single-row inline edit will use editingId
  function startEditing(issue) {
    setEditingId(issue._id || issue.id);
    // store editable fields on the issue object itself temporarily
    setIssues((prev) => prev.map((i) => {
      const key = i._id || i.id;
      if (key === (issue._id || issue.id)) {
        return { ...i, _editingTemp: { title: i.title, description: i.description, owner: i.owner, status: i.status, effort: i.effort, dueDate: i.dueDate || "", completionDate: i.completionDate || "" } };
      }
      return i;
    }));
  }

  function cancelEditing(id) {
    setEditingId(null);
    setIssues((prev) => prev.map((i) => { if ((i._id || i.id) === id) { const copy = { ...i }; delete copy._editingTemp; return copy; } return i; }));
  }

  function updateTemp(id, field, value) {
    setIssues((prev) => prev.map((i) => {
      const key = i._id || i.id;
      if (key === id) {
        return { ...i, _editingTemp: { ...i._editingTemp, [field]: value } };
      }
      return i;
    }));
  }

  async function saveTemp(id) {
    const issue = issues.find((i) => (i._id || i.id) === id);
    if (!issue || !issue._editingTemp) return;
    const payload = {
      title: issue._editingTemp.title,
      description: issue._editingTemp.description,
      owner: issue._editingTemp.owner,
      status: issue._editingTemp.status,
      effort: Number(issue._editingTemp.effort),
      dueDate: issue._editingTemp.dueDate,
      completionDate: issue._editingTemp.completionDate,
    };
    await handleSaveEdit(id, payload);
  }

  // Visible issues by filter
  const visible = filter ? issues.filter((i) => (i.status === filter)) : issues;

  return (
    <div className="app-soft">
      <header className="app-header">
        <div>
          <h1>Issue Tracker </h1>
          <p className="subtitle">Manage issues with ease</p>
        </div>
      
      </header>

      <main className="app-container">
        <section className="controls-row">
          <div className="filter-card">
            <label>Status filter</label>
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="">All</option>
              <option>New</option>
              <option>On Going</option>
              <option>Completed</option>
            </select>
            <button className="btn-ghost" onClick={() => { setFilter(""); }}>Reset</button>
          </div>

          <form className="add-card" onSubmit={handleAdd}>
            <h3>Add Issue</h3>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" required />
            <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Short description" required />
            <input value={owner} onChange={(e) => setOwner(e.target.value)} placeholder="Owner" required />
            <input value={effort} onChange={(e) => setEffort(e.target.value)} placeholder="Effort (days)" type="number" min="0" />
            <label className="small">Due date (optional)</label>
            <input value={dueDate} onChange={(e) => setDueDate(e.target.value)} type="date" />
            <label className="small">Estimated completion (optional)</label>
            <input value={completionDate} onChange={(e) => setCompletionDate(e.target.value)} type="date" />
            <div className="add-actions">
              <button className="btn-primary" type="submit">Add</button>
            </div>
          </form>
        </section>

        <section className="table-section">
          {loading ? <div className="info">Loading issues...</div>
            : error ? <div className="error">{error}</div>
            : visible.length === 0 ? <div className="empty">No issues found</div>
            : <div className="cards-grid">
                {visible.map((issue) => {
                  const id = issue._id || issue.id;
                  const editing = editingId === id;
                  return (
                    <article className="issue-card" key={id}>
                      <div className="card-top">
                        {editing ? (
                          <input value={issue._editingTemp.title} onChange={(e) => updateTemp(id, "title", e.target.value)} />
                        ) : (
                          <h3 className="card-title">{issue.title}</h3>
                        )}
                        <div className={`status-pill status-${(issue.status || "New").toLowerCase().replace(" ", "-")}`}>{issue.status}</div>
                      </div>

                      <div className="card-body">
                        <div className="meta"><strong>Owner:</strong> {editing ? <input value={issue._editingTemp.owner} onChange={(e) => updateTemp(id, "owner", e.target.value)} /> : issue.owner}</div>
                        <div className="meta"><strong>Effort:</strong> {editing ? <input type="number" value={issue._editingTemp.effort} onChange={(e) => updateTemp(id, "effort", e.target.value)} /> : `${issue.effort || 0} days`}</div>
                        <div className="meta"><strong>Created:</strong> {formatDate(issue.created)}</div>
                        <div className="meta"><strong>Due:</strong> {editing ? <input type="date" value={issue._editingTemp.dueDate} onChange={(e) => updateTemp(id, "dueDate", e.target.value)} /> : (issue.dueDate || "-")}</div>
                        <div className="meta"><strong>Est. completion:</strong> {editing ? <input type="date" value={issue._editingTemp.completionDate} onChange={(e) => updateTemp(id, "completionDate", e.target.value)} /> : (issue.completionDate || "-")}</div>
                        <div className="desc">{editing ? <input value={issue._editingTemp.description} onChange={(e) => updateTemp(id, "description", e.target.value)} /> : issue.description}</div>
                      </div>

                      <div className="card-actions">
                        {editing ? (
                          <>
                            <button className="btn-primary" onClick={() => saveTemp(id)}>Save</button>
                            <button className="btn-ghost" onClick={() => cancelEditing(id)}>Cancel</button>
                          </>
                        ) : (
                          <>
                            <button className="btn-outline" onClick={() => startEditing(issue)}>Edit</button>
                            <button className="btn-primary" onClick={() => handleClose(issue._id || issue.id)}>Close</button>
                            <button className="btn-danger" onClick={() => handleDelete(issue._id || issue.id)}>Delete</button>
                          </>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
          }
        </section>

        <footer className="app-footer">
          <small>Frontend + simple backend example · Soft Card UI</small>
        </footer>
      </main>
    </div>
  );
}
