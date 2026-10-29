import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

const API_URL = "https://food-management-backend-yixu.onrender.com/api/foods";

const emptyForm = {
  foodId: "",
  name: "",
  category: "Main Course",
  cuisine: "",
  ingredients: "",
  price: "",
  quantity: "",
  description: "",
  imageUrl: "",
};

function App() {
  const [foods, setFoods] = useState([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(emptyForm);

  const [showForm, setShowForm] = useState(false);
  const [editingFood, setEditingFood] = useState(null);
  const [selectedFood, setSelectedFood] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Lấy danh sách món ăn
  const fetchFoods = async (keyword = "") => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(API_URL, {
        params: keyword.trim()
          ? { search: keyword.trim() }
          : {},
      });

      setFoods(response.data.data || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Không thể tải danh sách món ăn. Hãy kiểm tra backend."
      );
    } finally {
      setLoading(false);
    }
  };

  // Tải danh sách khi mở trang
  useEffect(() => {
    fetchFoods();
  }, []);

  // Tìm kiếm khi gửi biểu mẫu
  const handleSearch = async (event) => {
    event.preventDefault();
    await fetchFoods(search);
  };

  // Cập nhật dữ liệu nhập
  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // Mở form thêm món ăn
  const openAddForm = () => {
    setForm(emptyForm);
    setEditingFood(null);
    setShowForm(true);
    setMessage("");
    setError("");
  };

  // Mở form cập nhật món ăn
  const openEditForm = (food) => {
    setForm({
      foodId: food.foodId || "",
      name: food.name || "",
      category: food.category || "",
      cuisine: food.cuisine || "",
      ingredients: Array.isArray(food.ingredients)
        ? food.ingredients.join(", ")
        : "",
      price: String(food.price ?? ""),
      quantity: String(food.quantity ?? ""),
      description: food.description || "",
      imageUrl: food.imageUrl || "",
    });

    setEditingFood(food);
    setShowForm(true);
    setSelectedFood(null);
    setMessage("");
    setError("");
  };

  // Thêm hoặc cập nhật món ăn
  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setMessage("");

    const price = Number(form.price);
    const quantity = Number(form.quantity);

    if (
      !form.foodId.trim() ||
      !form.name.trim() ||
      !form.category.trim() ||
      !form.cuisine.trim()
    ) {
      setError("Vui lòng nhập đầy đủ mã, tên, loại và vùng miền.");
      return;
    }

    if (
      form.price.trim() === "" ||
      !Number.isFinite(price) ||
      price < 0
    ) {
      setError("Giá món ăn phải là số không âm.");
      return;
    }

    if (
      form.quantity.trim() === "" ||
      !Number.isInteger(quantity) ||
      quantity < 0
    ) {
      setError("Số lượng phải là số nguyên không âm.");
      return;
    }

    const payload = {
      foodId: form.foodId.trim(),
      name: form.name.trim(),
      category: form.category.trim(),
      cuisine: form.cuisine.trim(),
      ingredients: form.ingredients
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      price,
      quantity,
      description: form.description.trim(),
      imageUrl: form.imageUrl.trim(),
    };

    try {
      setLoading(true);

      if (editingFood) {
        const id = editingFood.foodId;

        await axios.put(
          `${API_URL}/${encodeURIComponent(id)}`,
          payload
        );

        setMessage("Cập nhật món ăn thành công!");
      } else {
        await axios.post(API_URL, payload);

        setMessage("Thêm món ăn thành công!");
      }

      setShowForm(false);
      setEditingFood(null);
      setForm(emptyForm);

      await fetchFoods(search);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Không thể lưu món ăn. Vui lòng kiểm tra dữ liệu."
      );
    } finally {
      setLoading(false);
    }
  };

  // Xem chi tiết món ăn
  const handleViewDetail = async (food) => {
    try {
      setError("");

      const id = food.foodId;

      const response = await axios.get(
        `${API_URL}/${encodeURIComponent(id)}`
      );

      setSelectedFood(response.data.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Không thể tải chi tiết món ăn."
      );
    }
  };

  // Xóa món ăn
  const handleDelete = async (food) => {
    const confirmed = window.confirm(
      `Bạn có chắc muốn xóa món "${food.name}" không?`
    );

    if (!confirmed) return;

    try {
      setLoading(true);
      setError("");
      setMessage("");

      await axios.delete(
        `${API_URL}/${encodeURIComponent(food.foodId)}`
      );

      setMessage("Xóa món ăn thành công!");

      if (selectedFood?.foodId === food.foodId) {
        setSelectedFood(null);
      }

      await fetchFoods(search);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Không thể xóa món ăn."
      );
    } finally {
      setLoading(false);
    }
  };

  // Đóng form
  const closeForm = () => {
    setShowForm(false);
    setEditingFood(null);
    setForm(emptyForm);
  };

  return (
    <div className="app">
      <header className="header">
        <div>
          <h1>Food Management</h1>
          <p>Hệ thống quản lý thực đơn nhà hàng</p>
        </div>

        <button
          type="button"
          className="primary-button"
          onClick={openAddForm}
        >
          + Thêm món ăn
        </button>
      </header>

      <main className="main-content">
        <section className="toolbar">
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Tìm theo tên, loại món hoặc vùng miền..."
            />

            <button type="submit" className="primary-button">
              Tìm kiếm
            </button>

            <button
              type="button"
              className="secondary-button"
              onClick={() => {
                setSearch("");
                fetchFoods("");
              }}
            >
              Làm mới
            </button>
          </form>
        </section>

        {error && (
          <div className="alert error-alert">
            {error}
          </div>
        )}

        {message && (
          <div className="alert success-alert">
            {message}
          </div>
        )}

        <section className="food-section">
          <div className="section-heading">
            <h2>Danh sách món ăn</h2>
            <span>Tổng số: {foods.length} món</span>
          </div>

          {loading && (
            <p className="status-message">Đang xử lý...</p>
          )}

          {!loading && foods.length === 0 && (
            <p className="status-message">
              Không tìm thấy món ăn nào.
            </p>
          )}

          {foods.length > 0 && (
            <div className="table-wrapper">
              <table className="food-table">
                <thead>
                  <tr>
                    <th>Mã món</th>
                    <th>Tên món ăn</th>
                    <th>Loại món</th>
                    <th>Vùng miền</th>
                    <th>Giá</th>
                    <th>Số lượng</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>

                <tbody>
                  {foods.map((food) => (
                    <tr key={food._id || food.foodId}>
                      <td>{food.foodId}</td>
                      <td className="food-name">
                        {food.name}
                      </td>
                      <td>{food.category}</td>
                      <td>{food.cuisine}</td>
                      <td>
                        {Number(food.price).toLocaleString("vi-VN")} đ
                      </td>
                      <td>{food.quantity}</td>

                      <td>
                        <div className="action-buttons">
                          <button
                            type="button"
                            className="detail-button"
                            onClick={() => handleViewDetail(food)}
                          >
                            Xem
                          </button>

                          <button
                            type="button"
                            className="edit-button"
                            onClick={() => openEditForm(food)}
                          >
                            Sửa
                          </button>

                          <button
                            type="button"
                            className="delete-button"
                            onClick={() => handleDelete(food)}
                          >
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {selectedFood && (
          <section className="detail-card">
            <div className="section-heading">
              <h2>Chi tiết món ăn</h2>

              <button
                type="button"
                className="secondary-button"
                onClick={() => setSelectedFood(null)}
              >
                Đóng
              </button>
            </div>

            {selectedFood.imageUrl && (
              <img
                className="food-image"
                src={selectedFood.imageUrl}
                alt={selectedFood.name}
              />
            )}

            <div className="detail-grid">
              <p>
                <strong>Mã món:</strong>{" "}
                {selectedFood.foodId}
              </p>

              <p>
                <strong>Tên món:</strong>{" "}
                {selectedFood.name}
              </p>

              <p>
                <strong>Loại món:</strong>{" "}
                {selectedFood.category}
              </p>

              <p>
                <strong>Vùng miền:</strong>{" "}
                {selectedFood.cuisine}
              </p>

              <p>
                <strong>Giá:</strong>{" "}
                {Number(selectedFood.price).toLocaleString("vi-VN")} đ
              </p>

              <p>
                <strong>Số lượng:</strong>{" "}
                {selectedFood.quantity}
              </p>

              <p>
                <strong>Nguyên liệu:</strong>{" "}
                {Array.isArray(selectedFood.ingredients)
                  ? selectedFood.ingredients.join(", ")
                  : ""}
              </p>

              <p>
                <strong>Mô tả:</strong>{" "}
                {selectedFood.description || "Chưa có mô tả"}
              </p>
            </div>
          </section>
        )}
      </main>

      {showForm && (
        <div className="modal-overlay">
          <section className="form-modal">
            <div className="section-heading">
              <h2>
                {editingFood
                  ? "Cập nhật món ăn"
                  : "Thêm món ăn mới"}
              </h2>

              <button
                type="button"
                className="close-button"
                onClick={closeForm}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <label>
                  Mã món ăn *
                  <input
                    name="foodId"
                    value={form.foodId}
                    onChange={handleChange}
                    placeholder="Ví dụ: FOOD0004"
                    required
                    disabled={Boolean(editingFood)}
                  />
                </label>

                <label>
                  Tên món ăn *
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Nhập tên món ăn"
                    required
                  />
                </label>

                <label>
                  Loại món ăn *
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    required
                  >
                    <option value="Main Course">
                      Main Course
                    </option>
                    <option value="Fast Food">
                      Fast Food
                    </option>
                    <option value="Appetizer">
                      Appetizer
                    </option>
                    <option value="Dessert">
                      Dessert
                    </option>
                    <option value="Beverage">
                      Beverage
                    </option>
                    <option value="Soup">
                      Soup
                    </option>
                  </select>
                </label>

                <label>
                  Vùng miền / Ẩm thực *
                  <input
                    name="cuisine"
                    value={form.cuisine}
                    onChange={handleChange}
                    placeholder="Ví dụ: Vietnamese"
                    required
                  />
                </label>

                <label>
                  Giá tiền (VNĐ) *
                  <input
                    name="price"
                    type="number"
                    min="0"
                    step="1"
                    value={form.price}
                    onChange={handleChange}
                    required
                  />
                </label>

                <label>
                  Số lượng *
                  <input
                    name="quantity"
                    type="number"
                    min="0"
                    step="1"
                    value={form.quantity}
                    onChange={handleChange}
                    required
                  />
                </label>

                <label className="full-width">
                  Nguyên liệu
                  <input
                    name="ingredients"
                    value={form.ingredients}
                    onChange={handleChange}
                    placeholder="Beef, Rice Noodles, Ginger"
                  />
                  <small>
                    Phân cách từng nguyên liệu bằng dấu phẩy.
                  </small>
                </label>

                <label className="full-width">
                  Đường dẫn hình ảnh
                  <input
                    name="imageUrl"
                    type="url"
                    value={form.imageUrl}
                    onChange={handleChange}
                    placeholder="https://example.com/image.jpg"
                  />
                </label>

                <label className="full-width">
                  Mô tả món ăn
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Nhập mô tả món ăn"
                  />
                </label>
              </div>

              {error && (
                <div className="alert error-alert">
                  {error}
                </div>
              )}

              <div className="form-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={closeForm}
                >
                  Hủy
                </button>

                <button
                  type="submit"
                  className="primary-button"
                  disabled={loading}
                >
                  {loading
                    ? "Đang lưu..."
                    : editingFood
                      ? "Lưu thay đổi"
                      : "Thêm món ăn"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}

export default App;