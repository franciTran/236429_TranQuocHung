const express = require("express");
const mongoose = require("mongoose");
const Food = require("../models/Food");

const router = express.Router();

// Helper: Tìm món ăn theo foodId hoặc MongoDB _id
async function findFoodById(id) {
  const conditions = [{ foodId: id }];

  if (mongoose.isValidObjectId(id)) {
    conditions.push({ _id: id });
  }

  return Food.findOne({ $or: conditions });
}

// Helper: Kiểm tra dữ liệu món ăn
function validateFood(data, isUpdate = false) {
  const stringFields = ["foodId", "name", "category", "cuisine"];

  for (const field of stringFields) {
    if (isUpdate && data[field] === undefined) continue;

    if (
      typeof data[field] !== "string" ||
      data[field].trim().length === 0
    ) {
      return `${field} phải là chuỗi không được để trống`;
    }
  }

  if (isUpdate && data.ingredients === undefined) {
    // Không cập nhật ingredients nếu trường này không được gửi.
  } else if (
    data.ingredients !== undefined &&
    (!Array.isArray(data.ingredients) ||
      !data.ingredients.every((item) => typeof item === "string"))
  ) {
    return "ingredients phải là một mảng chuỗi";
  }

  if (isUpdate && data.price === undefined) {
    // Không cập nhật price nếu trường này không được gửi.
  } else if (
    data.price !== undefined &&
    (typeof data.price !== "number" ||
      !Number.isFinite(data.price) ||
      data.price < 0)
  ) {
    return "price phải là số không âm";
  }

  if (isUpdate && data.quantity === undefined) {
    // Không cập nhật quantity nếu trường này không được gửi.
  } else if (
    data.quantity !== undefined &&
    (!Number.isInteger(data.quantity) || data.quantity < 0)
  ) {
    return "quantity phải là số nguyên không âm";
  }

  for (const field of ["description", "imageUrl"]) {
    if (
      data[field] !== undefined &&
      typeof data[field] !== "string"
    ) {
      return `${field} phải là chuỗi`;
    }
  }

  return null;
}

// Chỉ cho phép cập nhật các trường hợp lệ
const allowedFields = [
  "foodId",
  "name",
  "category",
  "cuisine",
  "ingredients",
  "price",
  "quantity",
  "description",
  "imageUrl",
];

function pickAllowedFields(data) {
  const result = {};

  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      result[field] =
        typeof data[field] === "string" &&
        ["foodId", "name", "category", "cuisine"].includes(field)
          ? data[field].trim()
          : data[field];
    }
  }

  return result;
}

// GET /api/foods
// Lấy danh sách và tìm kiếm món ăn
router.get("/", async (req, res) => {
  try {
    const search =
      typeof req.query.search === "string"
        ? req.query.search.trim()
        : "";

    const filter = {};

    if (search) {
      const escapedKeyword = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(escapedKeyword, "i");

      filter.$or = [
        { name: regex },
        { category: regex },
        { cuisine: regex },
      ];
    }

    const foods = await Food.find(filter).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: foods.length,
      data: foods,
    });
  } catch (error) {
    console.error("GET /api/foods:", error.message);

    return res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách món ăn",
    });
  }
});

// GET /api/foods/:id
// Xem chi tiết món ăn
router.get("/:id", async (req, res) => {
  try {
    const food = await findFoodById(req.params.id);

    if (!food) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy món ăn",
      });
    }

    return res.status(200).json({
      success: true,
      data: food,
    });
  } catch (error) {
    console.error("GET /api/foods/:id:", error.message);

    return res.status(500).json({
      success: false,
      message: "Lỗi khi lấy chi tiết món ăn",
    });
  }
});

// POST /api/foods
// Thêm món ăn mới
router.post("/", async (req, res) => {
  try {
    if (
      !req.body ||
      typeof req.body !== "object" ||
      Array.isArray(req.body)
    ) {
      return res.status(400).json({
        success: false,
        message: "Dữ liệu gửi lên không hợp lệ",
      });
    }

    const validationError = validateFood(req.body);

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    const data = pickAllowedFields(req.body);
    const food = await Food.create(data);

    return res.status(201).json({
      success: true,
      message: "Thêm món ăn thành công",
      data: food,
    });
  } catch (error) {
    console.error("POST /api/foods:", error.message);

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

    return res.status(500).json({
      success: false,
      message: "Lỗi khi thêm món ăn",
    });
  }
});

// PUT /api/foods/:id
// Cập nhật món ăn
router.put("/:id", async (req, res) => {
  try {
    if (
      !req.body ||
      typeof req.body !== "object" ||
      Array.isArray(req.body)
    ) {
      return res.status(400).json({
        success: false,
        message: "Dữ liệu gửi lên không hợp lệ",
      });
    }

    const updates = pickAllowedFields(req.body);

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Không có trường hợp lệ để cập nhật",
      });
    }

    const validationError = validateFood(updates, true);

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    const food = await findFoodById(req.params.id);

    if (!food) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy món ăn",
      });
    }

    Object.assign(food, updates);
    await food.save();

    return res.status(200).json({
      success: true,
      message: "Cập nhật món ăn thành công",
      data: food,
    });
  } catch (error) {
    console.error("PUT /api/foods/:id:", error.message);

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

    return res.status(500).json({
      success: false,
      message: "Lỗi khi cập nhật món ăn",
    });
  }
});

// DELETE /api/foods/:id
// Xóa món ăn
router.delete("/:id", async (req, res) => {
  try {
    const food = await Food.findOneAndDelete({
      $or: [
        { foodId: req.params.id },
        ...(mongoose.isValidObjectId(req.params.id)
          ? [{ _id: req.params.id }]
          : []),
      ],
    });

    if (!food) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy món ăn",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Xóa món ăn thành công",
      data: food,
    });
  } catch (error) {
    console.error("DELETE /api/foods/:id:", error.message);

    return res.status(500).json({
      success: false,
      message: "Lỗi khi xóa món ăn",
    });
  }
});

module.exports = router;
