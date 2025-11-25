const express = require("express");
const router = express.Router();
const Issue = require("../models/Issue");

// GET /api/issues
router.get("/", async (req, res) => {
  const issues = await Issue.find().sort({ created: -1 });
  res.json(issues);
});

// POST /api/issues
router.post("/", async (req, res) => {
  const issue = new Issue(req.body);
  const saved = await issue.save();
  res.json(saved);
});

// PUT /api/issues/:id
router.put("/:id", async (req, res) => {
  const updated = await Issue.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
});

// DELETE /api/issues/:id
router.delete("/:id", async (req, res) => {
  await Issue.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
});

// PATCH /api/issues/:id/close
router.patch("/:id/close", async (req, res) => {
  const updated = await Issue.findByIdAndUpdate(req.params.id, { status: "Completed" }, { new: true });
  res.json(updated);
});

module.exports = router;
