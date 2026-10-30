import { Router } from "express";
import mongoose from "mongoose";
import Blog from "../models/Blog.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);

router.get("/", async (req, res, next) => {
  try {
    const { search = "", category = "" } = req.query;
    const filter = { author: req.user._id };
    if (search.trim()) {
      const safe = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.$or = [
        { title: { $regex: safe, $options: "i" } },
        { content: { $regex: safe, $options: "i" } },
        { category: { $regex: safe, $options: "i" } }
      ];
    }
    if (category.trim() && category !== "All categories") filter.category = category.trim();
    res.json(await Blog.find(filter).sort({ updatedAt: -1 }));
  } catch (error) { next(error); }
});

router.post("/", async (req, res, next) => {
  try {
    const { title, content, category } = req.body;
    if (![title, content, category].every(v => typeof v === "string" && v.trim())) {
      return res.status(400).json({ message: "Title, content, and category are required." });
    }
    const blog = await Blog.create({ title: title.trim(), content: content.trim(), category: category.trim(), author: req.user._id });
    res.status(201).json(blog);
  } catch (error) { next(error); }
});

router.put("/:id", async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ message: "Invalid blog ID." });
    const { title, content, category } = req.body;
    if (![title, content, category].every(v => typeof v === "string" && v.trim())) {
      return res.status(400).json({ message: "Title, content, and category are required." });
    }
    const blog = await Blog.findOneAndUpdate(
      { _id: req.params.id, author: req.user._id },
      { title: title.trim(), content: content.trim(), category: category.trim() },
      { new: true, runValidators: true }
    );
    if (!blog) return res.status(404).json({ message: "Blog not found in your account." });
    res.json(blog);
  } catch (error) { next(error); }
});

router.delete("/:id", async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ message: "Invalid blog ID." });
    const blog = await Blog.findOneAndDelete({ _id: req.params.id, author: req.user._id });
    if (!blog) return res.status(404).json({ message: "Blog not found in your account." });
    res.json({ message: "Blog deleted successfully." });
  } catch (error) { next(error); }
});

export default router;
