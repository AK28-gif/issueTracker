import mongoose from "mongoose";

const IssueSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  owner: String,
  status: { type: String, default: "New" },
  effort: { type: Number, default: 0 },
  created: { type: Date, default: Date.now },
  dueDate: { type: String, default: "" },
  completionDate: { type: String, default: "" }
});

export default mongoose.model("Issue", IssueSchema);

