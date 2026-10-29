const express = require("express");
const mongoose = require("mongoose");
const Food = require("../models/Food");

const router = express.Router();

// GET /api/foods - Danh sách và tìm kiếm món ăn
router.get("/", async (req, res) => {
  try {
    const { search } = req.query;
    const filter = {};

    if (search && search.trim()) {
      const keyword = search.trim();
      const regex = new RegExp(
        keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        "i"
      );

      filter.$or = [
        { name: regex },
        { category: regex },
        { cuisine: regex },
      ];
    }

    const foods = await Food.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: foods.length,
      data: foods,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách món ăn",
    });
  }
});

// GET /api/foods/:id - Chi tiết món ăn
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const conditions = [{ foodId: id }];

    if (mongoose.isValidObjectId(id)) {
      conditions.push({ _id: id });
    }

    const food = await Food.findOne({ $or: conditions });

    if (!food) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy món ăn",
      });
    }

    res.status(200).json({ success: true, data: food });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy chi tiết món ăn",
    });
  }
});

// POST /api/foods - Thêm món ăn
router.post("/", async (req, res) => {
  try {
    const {
      foodId,
      name,
      category,
      cuisine,
      ingredients,
      price,
      quantity,
      description,
      imageUrl,
    } = req.body;

    if (
      typeof foodId !== "string" || !foodId.trim() ||
      typeof name !== "string" || !name.trim() ||
      typeof category !== "string" || !category.trim() ||
      typeof cuisine !== "string" || !cuisine.trim() ||
      !Array.isArray(ingredients) ||
      typeof price !== "number" || !Number.isFinite(price) || price < 0 ||
      !Number.isInteger(quantity) || quantity < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Dữ liệu đầu vào không hợp lệ",
      });
    }

    const food = await Food.create({
      foodId: foodId.trim(),
      name: name.trim(),
      category: category.trim(),
      cuisine: cuisine.trim(),
      ingredients,
      price,
      quantity,
      description,
      imageUrl,
    });

    res.status(201).json({
      success: true,
      message: "Thêm món ăn thành công",
      data: food,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Mã món ăn foodId đã tồn tại",
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Lỗi khi thêm món ăn",
    });
  }
});

// PUT /api/foods/:id - Cập nhật món ăn
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const conditions = [{ foodId: id }];

    if (mongoose.isValidObjectId(id)) {
      conditions.push({ _id: id });
    }

    const food = await Food.findOne({ $or: conditions });

    if (!food) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy món ăn",
      });
    }

    const updates = { ...req.body };
    delete updates._id;
    delete updates.__v;

    Object.assign(food, updates);
    await food.save();

    res.status(200).json({
      success: true,
      message: "Cập nhật món ăn thành công",
      data: food,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Mã món ăn đã tồn tại",
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Lỗi khi cập nhật món ăn",
    });
  }
});

// DELETE /api/foods/:id - Xóa món ăn
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const conditions = [{ foodId: id }];

    if (mongoose.isValidObjectId(id)) {
      conditions.push({ _id: id });
    }

    const food = await Food.findOneAndDelete({ $or: conditions });

    if (!food) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy món ăn",
      });
    }

    res.status(200).json({
      success: true,
      message: "Xóa món ăn thành công",
      data: food,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi khi xóa món ăn",
    });
  }
});

module.exports = router;