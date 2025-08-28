import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";

function App() {
  // -------------------- State --------------------
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [form, setForm] = useState({ title: "", url: "", description: "" });
  const [editingId, setEditingId] = useState(null);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedCard, setExpandedCard] = useState(null);

  // -------------------- Fetch Links --------------------
  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/links");
      setLinks(res.data);
      setError("");
    } catch (err) {
      console.error(err);
      setError("⚠️ Failed to fetch links. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // -------------------- Add / Update --------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title.trim() || !form.url.trim()) {
      toast.warning("⚠️ Title & URL are required");
      return;
    }

    try {
      if (editingId) {
        // Update existing
        const res = await axios.put(
          `http://localhost:5000/links/${editingId}`,
          form
        );
        setLinks((prev) =>
          prev.map((link) => (link._id === editingId ? res.data : link))
        );
        toast.success("✅ Link updated!");
      } else {
        // Add new
        const res = await axios.post("http://localhost:5000/links", form);
        setLinks((prev) => [...prev, res.data]);
        toast.success("✅ Link added!");
      }

      resetForm();
    } catch (err) {
      console.error(err);
      toast.error("❌ Failed to save link");
    }
  };

  const resetForm = () => {
    setForm({ title: "", url: "", description: "" });
    setEditingId(null);
    setShowForm(false);
    setExpandedCard(null);
  };

  // -------------------- Edit --------------------
  const handleEdit = (link) => {
    setForm({
      title: link.title || "",
      url: link.url || "",
      description: link.description || "",
    });
    setEditingId(link._id);
    setShowForm(true);
    setExpandedCard(null);
  };

  // -------------------- Delete --------------------
  const confirmDelete = (id) => setDeleteTarget(id);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await axios.delete(`http://localhost:5000/links/${deleteTarget}`);
      setLinks((prev) => prev.filter((l) => l._id !== deleteTarget));
      toast.info("🗑️ Link deleted");
      if (expandedCard === deleteTarget) setExpandedCard(null);
    } catch (err) {
      console.error(err);
      toast.error("❌ Failed to delete link");
    } finally {
      setDeleteTarget(null);
    }
  };

  // -------------------- Helpers --------------------
  const getFavicon = (url) => {
    try {
      const domain = new URL(url).origin;
      return `https://www.google.com/s2/favicons?sz=64&domain=${domain}`;
    } catch {
      return `https://www.google.com/s2/favicons?sz=64&domain=${url}`;
    }
  };

  const filteredLinks = links.filter((link) => {
    const q = searchTerm.trim().toLowerCase();
    return (
      !q ||
      (link.title || "").toLowerCase().includes(q) ||
      (link.description || "").toLowerCase().includes(q) ||
      (link.url || "").toLowerCase().includes(q)
    );
  });

  // -------------------- Render --------------------
  return (
    <div className="app-container">
      <h1 className="title">LinkHub</h1>

      {/* Search */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by title, url or description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Add Link Button */}
      <button
        className="open-form-btn"
        onClick={() => {
          resetForm();
          setShowForm(true);
        }}
      >
        ➕ Add New Link
      </button>

      {/* Links Grid */}
      {loading ? (
        <p className="loading">⏳ Loading links...</p>
      ) : error ? (
        <p className="error">{error}</p>
      ) : (
        <div className="links-grid">
          {filteredLinks.length === 0 ? (
            <p className="no-links">No links found.</p>
          ) : (
            filteredLinks.map((link) => {
              const isExpanded = expandedCard === link._id;
              const desc = link.description || "";
              const needsTruncate = desc.length > 120;

              return (
                <div key={link._id} className="link-card">
                  <div className="card-box">
                    {/* Header */}
                    <div className="card-header">
                      <img
                        src={getFavicon(link.url)}
                        alt="favicon"
                        className="favicon"
                      />
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="card-title-link"
                      >
                        {link.title || link.url}
                      </a>
                    </div>

                    {/* Description */}
                    <div
                      className={`description-container ${
                        isExpanded ? "expanded" : "collapsed"
                      }`}
                    >
                      <div className="description-content">
                        {desc || "No description"}
                      </div>
                    </div>

                    {/* Toggle Button */}
                    {needsTruncate && (
                      <button
                        type="button"
                        className="toggle-btn"
                        onClick={() =>
                          setExpandedCard(isExpanded ? null : link._id)
                        }
                      >
                        {isExpanded ? "Show Less" : "Show More"}
                      </button>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="card-actions">
                    <button className="edit-btn" onClick={() => handleEdit(link)}>
                      ✏️ Edit
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => confirmDelete(link._id)}
                    >
                      ❌ Delete
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>{editingId ? "✏️ Edit Link" : "➕ Add New Link"}</h3>
            <form className="link-form" onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
              <input
                type="url"
                placeholder="https://example.com"
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
              />
              <textarea
                placeholder="Description"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={resetForm}>
                  Cancel
                </button>
                <button type="submit" className="confirm-btn">
                  {editingId ? "Update" : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteTarget && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Are you sure?</h3>
            <p>This action cannot be undone.</p>
            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setDeleteTarget(null)}>
                Cancel
              </button>
              <button className="confirm-btn" onClick={handleDelete}>
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer position="bottom-right" autoClose={2000} />
    </div>
  );
}

export default App;
