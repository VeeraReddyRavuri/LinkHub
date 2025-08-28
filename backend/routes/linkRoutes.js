const express = require("express");
const router = express.Router();
const Link = require("../models/link");

// POST /links → Create a new link
router.post("/", async (req, res) => {
  try {
    const { title, url, description } = req.body;
    const link = new Link({ title, url, description });
    await link.save();
    res.status(201).json(link);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ✅ GET /links → Fetch all links
router.get("/", async (req, res) => {
  try {
    const links = await Link.find().sort({ createdAt: -1 });
    res.json(links);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

// GET /links/:id → Get a single link by ID
router.get("/:id", async (req, res) => {
  try {
    const link = await Link.findById(req.params.id);
    if (!link) return res.status(404).json({ message: "Link not found" });
    res.json(link);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// PUT /links/:id → Update a link
router.put("/:id", async (req, res) => {
  try {
    const { title, url, description } = req.body;
    const updatedLink = await Link.findByIdAndUpdate(
      req.params.id,
      { title, url, description },
      { new: true } // return the updated document
    );
    if (!updatedLink) return res.status(404).json({ message: "Link not found" });
    res.json(updatedLink);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// DELETE /links/:id → Delete a link
router.delete("/:id", async (req, res) => {
  try {
    const deletedLink = await Link.findByIdAndDelete(req.params.id);
    if (!deletedLink) return res.status(404).json({ message: "Link not found" });
    res.json({ message: "Link deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ✅ Reorder all links
router.put("/reorder", async (req, res) => {
  try {
    const { reorderedLinks } = req.body; // array of {_id, order}
    for (let link of reorderedLinks) {
      await Link.findByIdAndUpdate(link._id, { order: link.order });
    }
    res.json({ message: "Links reordered successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to reorder links" });
  }
});

// ✅ Increment click count
router.put("/:id/click", async (req, res) => {
  try {
    const link = await Link.findByIdAndUpdate(
      req.params.id,
      { $inc: { clickCount: 1 } },
      { new: true }
    );
    res.json(link);
  } catch (err) {
    res.status(500).json({ error: "Failed to update click count" });
  }
});