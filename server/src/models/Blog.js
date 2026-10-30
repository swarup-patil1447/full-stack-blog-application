import mongoose from "mongoose";

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 140 },
  content: { type: String, required: true, trim: true },
  category: { type: String, required: true, trim: true, maxlength: 50 },
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true }
}, { timestamps: true });

export default mongoose.model("Blog", blogSchema);
