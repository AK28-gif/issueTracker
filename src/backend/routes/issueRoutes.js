import express from "express";
import Issue from "../models/Issue.js";

const router = express.Router();

// GET /api/issues
router.get("/", async (req, res) => {
  try {
    const issues = await Issue.find().sort({ created: -1 });
    res.json(issues);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/issues
router.post("/", async (req, res) => {
  try {
    const issue = new Issue(req.body);
    const saved = await issue.save();
    res.json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/issues/:id
router.put("/:id", async (req, res) => {
  try {
    const updated = await Issue.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/issues/:id
router.delete("/:id", async (req, res) => {
  try {
    await Issue.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/issues/:id/close
router.patch("/:id/close", async (req, res) => {
  try {
    const updated = await Issue.findByIdAndUpdate(
      req.params.id,
      { status: "Completed" },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
