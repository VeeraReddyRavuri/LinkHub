import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const AddLinkForm = ({ onAdd }) => {
  const [form, setForm] = useState({ title: "", url: "", description: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.url) {
      toast.error("⚠️ Title and URL are required");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post("http://localhost:5000/links", form);
      onAdd(res.data);
      setForm({ title: "", url: "", description: "" });
      toast.success("✅ Link added successfully!");
    } catch (err) {
      console.error(err);
      toast.error("❌ Failed to add link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Add New Link</h2>
      <form onSubmit={handleSubmit} className="link-form">
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
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <button type="submit" disabled={loading}>
          {loading ? "Adding..." : "Add Link"}
        </button>
      </form>
    </div>
  );
};

export default AddLinkForm;
