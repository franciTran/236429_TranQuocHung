const mongoose = require("mongoose");

const foodSchema = new mongoose.Schema(
  {
    foodId: {
      type: String,
      required: [true, "Mã món ăn là bắt buộc"],
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, "Tên món ăn là bắt buộc"],
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    cuisine: {
      type: String,
      required: true,
      trim: true,
    },
    ingredients: {
      type: [String],
      default: [],
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator: Number.isInteger,
        message: "Số lượng phải là số nguyên",
      },
    },
    description: {
      type: String,
      default: "",
    },
    imageUrl: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("Food", foodSchema, "foods");