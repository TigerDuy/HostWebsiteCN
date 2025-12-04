import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import "./CreateRecipe.css";

function EditRecipe() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [servings, setServings] = useState("");
  const [cookTime, setCookTime] = useState("");
  const [ingredientsList, setIngredientsList] = useState([""]);
  const [stepsList, setStepsList] = useState([{ text: "", image: null, preview: null }]);
  const [coverImage, setCoverImage] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("❌ Vui lòng đăng nhập!");
      navigate("/login");
      return;
    }

    const fetchRecipe = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_BASE || 'http://localhost:3002'}/recipe/detail/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const r = res.data;
        setTitle(r.title || "");
        setCoverPreview(r.image_url || null);
        // Parse ingredients/steps by newline
        const ings = (r.ingredients || "").split("\n").filter(s => s.trim());
        setIngredientsList(ings.length ? ings : [""]);
        const steps = (r.steps || "").split("\n").filter(s => s.trim()).map(t => ({ text: t, image: null, preview: null }));
        setStepsList(steps.length ? steps : [{ text: "", image: null, preview: null }]);
        // Optional fields if present in API
        setServings(r.servings || "");
        setCookTime(r.cook_time || "");
      } catch (e) {
        setError("❌ Không tải được công thức!");
      }
    };
    fetchRecipe();
  }, [id, navigate]);

  const handleCoverChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImage(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const addIngredient = () => setIngredientsList([...ingredientsList, ""]);
  const removeIngredient = (index) => {
    if (ingredientsList.length > 1) setIngredientsList(ingredientsList.filter((_, i) => i !== index));
  };
  const updateIngredient = (index, value) => {
    const updated = [...ingredientsList];
    updated[index] = value;
    setIngredientsList(updated);
  };

  const addStep = () => setStepsList([...stepsList, { text: "", image: null, preview: null }]);
  const removeStep = (index) => {
    if (stepsList.length > 1) setStepsList(stepsList.filter((_, i) => i !== index));
  };
  const updateStepText = (index, value) => {
    const updated = [...stepsList];
    updated[index].text = value;
    setStepsList(updated);
  };
  const updateStepImage = (index, file) => {
    if (!file) return;
    const updated = [...stepsList];
    updated[index].image = file;
    updated[index].preview = URL.createObjectURL(file);
    setStepsList(updated);
  };
  const removeStepImage = (index) => {
    const updated = [...stepsList];
    updated[index].image = null;
    updated[index].preview = null;
    setStepsList(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const token = localStorage.getItem("token");
    if (!token) {
      alert("❌ Vui lòng đăng nhập!");
      navigate("/login");
      return;
    }
    if (!title.trim()) {
      setError("❌ Vui lòng nhập tên món ăn!");
      return;
    }

    const trimmedIngredients = ingredientsList.map(i => i.trim());
    if (trimmedIngredients.length === 0 || trimmedIngredients.every(i => i === "")) {
      setError("❌ Vui lòng nhập ít nhất 1 nguyên liệu không trống!");
      return;
    }
    if (trimmedIngredients.some(i => i === "")) {
      setError("❌ Có nguyên liệu đang để trống. Vui lòng xóa hoặc điền đầy đủ!");
      return;
    }
    const ingredients = trimmedIngredients.join("\n");

    const trimmedSteps = stepsList.map(s => (s.text || "").trim());
    if (trimmedSteps.length === 0 || trimmedSteps.every(s => s === "")) {
      setError("❌ Vui lòng nhập ít nhất 1 bước không trống!");
      return;
    }
    if (trimmedSteps.some(s => s === "")) {
      setError("❌ Có bước đang để trống. Vui lòng xóa hoặc điền đầy đủ!");
      return;
    }
    const steps = trimmedSteps.join("\n");

    const formData = new FormData();
    formData.append("title", title);
    formData.append("ingredients", ingredients);
    formData.append("steps", steps);
    if (servings) formData.append("servings", servings);
    if (cookTime) formData.append("cook_time", cookTime);
    if (coverImage) formData.append("image", coverImage);

    try {
      setLoading(true);
      await axios.put(`${process.env.REACT_APP_API_BASE || 'http://localhost:3002'}/recipe/update/${id}`, formData, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
      });
      alert("✅ Cập nhật công thức thành công!");
      navigate(`/recipe/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || "❌ Lỗi khi cập nhật công thức!");
    } finally {
      setLoading(false);
    }
  };

  const onDragEnd = (result) => {
    const { source, destination, type } = result;
    if (!destination) return;
    if (source.index === destination.index && source.droppableId === destination.droppableId) return;

    if (type === "ingredients") {
      const items = Array.from(ingredientsList);
      const [moved] = items.splice(source.index, 1);
      items.splice(destination.index, 0, moved);
      setIngredientsList(items);
    } else if (type === "steps") {
      const items = Array.from(stepsList);
      const [moved] = items.splice(source.index, 1);
      items.splice(destination.index, 0, moved);
      setStepsList(items);
    }
  };

  return (
    <div className="create-recipe-container">
      <div className="create-recipe-content">
        <h1>✏️ Sửa công thức</h1>
        <form className="create-form" onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}

          <div className="cover-upload-section">
            <div className="cover-placeholder" onClick={() => document.getElementById('editCoverInput').click()}>
              {coverPreview ? (
                <img src={coverPreview} alt="Cover" className="cover-preview-img" />
              ) : (
                <div className="upload-prompt">
                  <span className="camera-icon">📷</span>
                  <p>Đăng hình món của bạn tại đây</p>
                  <p className="sub-text">Ảnh bìa món ăn sẽ hiển thị nổi bật</p>
                </div>
              )}
            </div>
            <input id="editCoverInput" type="file" accept="image/*" onChange={handleCoverChange} style={{ display: 'none' }} />
          </div>

          <div className="form-section">
            <label className="form-label">Tên món:</label>
            <input type="text" placeholder="Tên món" value={title} onChange={(e) => setTitle(e.target.value)} className="form-input" />
          </div>

          <div className="form-section">
            <h3 className="section-title">Nguyên Liệu</h3>
            <div className="form-field">
              <label className="field-label">Khẩu phần</label>
              <div className="input-with-unit">
                <input type="text" placeholder="2" value={servings} onChange={(e) => setServings(e.target.value)} className="form-input-small" />
                <span className="unit-text">người</span>
              </div>
            </div>
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="ingredients" type="ingredients">
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.droppableProps}>
                    {ingredientsList.map((ingredient, index) => (
                      <Draggable draggableId={`ing-${index}`} index={index} key={`ing-${index}`}>
                        {(dragProvided) => (
                          <div className="ingredient-row" ref={dragProvided.innerRef} {...dragProvided.draggableProps}>
                            <span className="drag-handle" {...dragProvided.dragHandleProps}>≡</span>
                            <input type="text" placeholder="250g bột" value={ingredient} onChange={(e) => updateIngredient(index, e.target.value)} className="ingredient-input" />
                            {ingredientsList.length > 1 && (
                              <button type="button" onClick={() => removeIngredient(index)} className="menu-btn" title="Xóa nguyên liệu">🗑️</button>
                            )}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
            <button type="button" onClick={addIngredient} className="add-button">+ Nguyên liệu</button>
          </div>

          <div className="form-section">
            <h3 className="section-title">Các bước</h3>
            <div className="form-field">
              <label className="field-label">Thời gian nấu</label>
              <input type="text" placeholder="1 tiếng 30 phút" value={cookTime} onChange={(e) => setCookTime(e.target.value)} className="form-input" />
            </div>
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="steps" type="steps">
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.droppableProps}>
                    {stepsList.map((step, index) => (
                      <Draggable draggableId={`step-${index}`} index={index} key={`step-${index}`}>
                        {(dragProvided) => (
                          <div className="step-row" ref={dragProvided.innerRef} {...dragProvided.draggableProps}>
                            <div className="step-header">
                              <span className="step-drag-handle" {...dragProvided.dragHandleProps}>≡</span>
                              <div className="step-number">{index + 1}</div>
                            </div>
                            <div className="step-content-wrapper">
                              <div className="step-image-upload">
                                {step.preview ? (
                                  <div className="step-image-preview">
                                    <img src={step.preview} alt={`Step ${index + 1}`} />
                                    <button type="button" onClick={() => removeStepImage(index)} className="remove-image-btn">×</button>
                                  </div>
                                ) : (
                                  <label className="upload-box">
                                    <input type="file" accept="image/*" onChange={(e) => updateStepImage(index, e.target.files?.[0])} style={{ display: 'none' }} />
                                    <span className="upload-icon">📷</span>
                                  </label>
                                )}
                              </div>
                              <textarea placeholder="Mô tả bước thực hiện" value={step.text} onChange={(e) => updateStepText(index, e.target.value)} className="step-textarea" rows="3" />
                              {stepsList.length > 1 && (
                                <button type="button" onClick={() => removeStep(index)} className="menu-btn" title="Xóa bước">🗑️</button>
                              )}
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
            <button type="button" onClick={addStep} className="add-button">+ Bước làm</button>
          </div>

          <div className="form-actions">
            <button type="button" onClick={() => navigate(-1)} className="btn-delete">❌ Hủy</button>
            <button type="submit" disabled={loading} className="btn-publish">{loading ? "⏳ Đang lưu..." : "💾 Lưu"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditRecipe;
