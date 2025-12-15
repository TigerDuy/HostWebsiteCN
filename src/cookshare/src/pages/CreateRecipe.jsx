import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import "./CreateRecipe.css";

function CreateRecipe() {
  const [title, setTitle] = useState("");
  const [servings, setServings] = useState("");
  const [cookTime, setCookTime] = useState("");
  const [ingredientsList, setIngredientsList] = useState([""]);
  const [stepsList, setStepsList] = useState([{ text: "", images: [], previews: [] }]);
  const [coverImage, setCoverImage] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [openMenuIndex, setOpenMenuIndex] = useState(null);
  const [openIngredientMenuIndex, setOpenIngredientMenuIndex] = useState(null);

  const navigate = useNavigate();

  // Handle cover image
  const handleCoverChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImage(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  // Ingredients functions
  const addIngredient = () => {
    setIngredientsList([...ingredientsList, ""]);
  };

  const removeIngredient = (index) => {
    if (ingredientsList.length > 1) {
      setIngredientsList(ingredientsList.filter((_, i) => i !== index));
      setOpenIngredientMenuIndex(null);
    }
  };

  const insertIngredientAfter = (index) => {
    const updated = [...ingredientsList];
    updated.splice(index + 1, 0, "");
    setIngredientsList(updated);
    setOpenIngredientMenuIndex(null);
  };

  const updateIngredient = (index, value) => {
    const updated = [...ingredientsList];
    updated[index] = value;
    setIngredientsList(updated);
  };

  const toggleIngredientMenu = (index) => {
    setOpenIngredientMenuIndex(openIngredientMenuIndex === index ? null : index);
  };

  // Steps functions
  const addStep = () => {
    setStepsList([...stepsList, { text: "", images: [], previews: [] }]);
  };

  const insertStepAfter = (index) => {
    const newStep = { text: "", images: [], previews: [] };
    const updated = [...stepsList];
    updated.splice(index + 1, 0, newStep);
    setStepsList(updated);
    setOpenMenuIndex(null);
  };

  const removeStep = (index) => {
    if (stepsList.length > 1) {
      setStepsList(stepsList.filter((_, i) => i !== index));
      setOpenMenuIndex(null);
    }
  };

  const updateStepText = (index, value) => {
    const updated = [...stepsList];
    updated[index].text = value;
    setStepsList(updated);
  };

  const updateStepImage = (index, files) => {
    if (!files) return;
    const updated = [...stepsList];
    const existing = updated[index].images || [];
    const incoming = Array.from(files);
    // Deduplicate theo key: name|size|lastModified
    const toKey = f => `${f.name}|${f.size}|${f.lastModified || 0}`;
    const seen = new Set(existing.map(toKey));
    const uniqueIncoming = incoming.filter(f => {
      const k = toKey(f);
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });

    updated[index].images = [...existing, ...uniqueIncoming];
    updated[index].previews = [
      ...(updated[index].previews || []),
      ...uniqueIncoming.map(file => URL.createObjectURL(file))
    ];
    setStepsList(updated);
  };

  const removeStepImage = (stepIndex, imageIndex) => {
    const updated = [...stepsList];
    updated[stepIndex].images.splice(imageIndex, 1);
    updated[stepIndex].previews.splice(imageIndex, 1);
    setStepsList(updated);
  };

  const toggleMenu = (index) => {
    setOpenMenuIndex(openMenuIndex === index ? null : index);
  };

  // Submit form
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

    const STEP_DELIMITER = "||STEP||";
    const trimmedSteps = stepsList.map(s => (s.text || "").trim());
    if (trimmedSteps.length === 0 || trimmedSteps.every(s => s === "")) {
      setError("❌ Vui lòng nhập ít nhất 1 bước không trống!");
      return;
    }
    if (trimmedSteps.some(s => s === "")) {
      setError("❌ Có bước đang để trống. Vui lòng xóa hoặc điền đầy đủ!");
      return;
    }
    // Giữ nguyên xuống dòng bên trong mỗi bước, chỉ chèn delimiter giữa các bước
    const steps = trimmedSteps.join(`\n${STEP_DELIMITER}\n`);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("ingredients", ingredients);
    formData.append("steps", steps);
    formData.append("servings", servings || "0");
    formData.append("cook_time", cookTime || "0");
    if (coverImage) formData.append("image", coverImage);

    try {
      setLoading(true);
      const response = await axios.post(`${process.env.REACT_APP_API_BASE || 'http://localhost:3001'}/recipe/create`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      // Lấy recipe ID từ response
      const recipeId = response.data.id;

      // Upload ảnh từng bước
      for (let i = 0; i < stepsList.length; i++) {
        const step = stepsList[i];
        if (step.images && step.images.length > 0) {
          const stepFormData = new FormData();
          stepFormData.append("stepIndex", i);
          for (const image of step.images) {
            stepFormData.append("images", image);
          }
          
          await axios.post(
            `${process.env.REACT_APP_API_BASE || 'http://localhost:3001'}/recipe/upload-step-images/${recipeId}`,
            stepFormData,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data",
              },
            }
          );
        }
      }

      alert("✅ Đăng công thức thành công!");
      navigate("/my-recipes");
    } catch (err) {
      setError(err.response?.data?.message || "❌ Lỗi khi đăng công thức!");
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
        <h1 className="page-title">✏️ Viết món mới</h1>
        
        <form className="create-form" onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}

          {/* Cover Image Upload */}
          <div className="cover-upload-section">
            <div className="cover-placeholder" onClick={() => document.getElementById('coverInput').click()}>
              {coverPreview ? (
                <img src={coverPreview} alt="Cover" className="cover-preview-img" />
              ) : (
                <div className="upload-prompt">
                  <span className="camera-icon">📷</span>
                  <p>Bạn đã đăng hình món mình nấu ở đây chưa?</p>
                  <p className="sub-text">Chia sẻ với mọi người thành phẩm của bạn nào!</p>
                </div>
              )}
            </div>
            <input
              id="coverInput"
              type="file"
              accept="image/*"
              onChange={handleCoverChange}
              style={{ display: 'none' }}
            />
          </div>

          {/* Title */}
          <div className="form-section">
            <label className="form-label">Tên món:</label>
            <input
              type="text"
              placeholder="Món canh bí ngon nhất nhà mình"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="form-input"
            />
          </div>

          {/* Ingredients Section */}
          <div className="form-section">
            <h3 className="section-title">Nguyên Liệu</h3>
            
            {/* Servings */}
            <div className="form-field">
              <label className="field-label">Khẩu phần</label>
              <div className="input-with-unit">
                <input
                  type="text"
                  placeholder="2"
                  value={servings}
                  onChange={(e) => setServings(e.target.value)}
                  className="form-input-small"
                />
                <span className="unit-text">người</span>
              </div>
            </div>

            {/* Ingredients List */}
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="ingredients" type="ingredients">
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.droppableProps}>
                    {ingredientsList.map((ingredient, index) => (
                      <Draggable draggableId={`ing-${index}`} index={index} key={`ing-${index}`}>
                        {(dragProvided) => (
                          <div className="ingredient-row" ref={dragProvided.innerRef} {...dragProvided.draggableProps}>
                            <span className="drag-handle" {...dragProvided.dragHandleProps}>≡</span>
                            <input
                              type="text"
                              placeholder="250g bột"
                              value={ingredient}
                              onChange={(e) => updateIngredient(index, e.target.value)}
                              className="ingredient-input"
                            />
                            <div className="ingredient-menu-container">
                              <button
                                type="button"
                                onClick={() => toggleIngredientMenu(index)}
                                className="menu-dots-btn"
                                title="Tùy chọn"
                              >
                                ⋯
                              </button>
                              {openIngredientMenuIndex === index && (
                                <div className="ingredient-dropdown-menu">
                                  <button
                                    type="button"
                                    onClick={() => insertIngredientAfter(index)}
                                    className="dropdown-item"
                                  >
                                    + Nguyên liệu
                                  </button>
                                  {ingredientsList.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => removeIngredient(index)}
                                      className="dropdown-item delete-item"
                                    >
                                      Xóa nguyên liệu
                                    </button>
                                  )}
                                </div>
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

            <button type="button" onClick={addIngredient} className="add-button">
              + Nguyên liệu
            </button>
          </div>

          {/* Steps Section */}
          <div className="form-section">
            <h3 className="section-title">Các bước</h3>
            
            {/* Cook Time */}
            <div className="form-field">
              <label className="field-label">Thời gian nấu</label>
              <input
                type="text"
                placeholder="1 tiếng 30 phút"
                value={cookTime}
                onChange={(e) => setCookTime(e.target.value)}
                className="form-input"
              />
            </div>

            {/* Steps List */}
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="steps" type="steps">
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.droppableProps}>
                    {stepsList.map((step, index) => (
                      <Draggable draggableId={`step-${index}`} index={index} key={`step-${index}`}>
                        {(dragProvided) => (
                          <div className="step-item" ref={dragProvided.innerRef} {...dragProvided.draggableProps}>
                            {/* Top row: number, drag handle, textarea, menu */}
                            <div className="step-main-row">
                              <div className="step-number-circle">{index + 1}</div>
                              <span className="step-drag-handle" {...dragProvided.dragHandleProps}>≡</span>
                              <textarea
                                placeholder="Trộn bột và nước đến khi đặc lại"
                                value={step.text}
                                onChange={(e) => updateStepText(index, e.target.value)}
                                className="step-textarea"
                                rows="2"
                              />
                              <div className="step-menu-container">
                                <button
                                  type="button"
                                  onClick={() => toggleMenu(index)}
                                  className="menu-dots-btn"
                                  title="Tùy chọn"
                                >
                                  ⋯
                                </button>
                                {openMenuIndex === index && (
                                  <div className="step-dropdown-menu">
                                    <button
                                      type="button"
                                      onClick={() => insertStepAfter(index)}
                                      className="dropdown-item"
                                    >
                                      Thêm bước
                                    </button>
                                    {stepsList.length > 1 && (
                                      <button
                                        type="button"
                                        onClick={() => removeStep(index)}
                                        className="dropdown-item delete-item"
                                      >
                                        Xóa bước này
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            {/* Bottom row: image upload */}
                            <div className="step-image-row">
                              <div className="step-image-gallery">
                                {step.previews && step.previews.length > 0 ? (
                                  <div className="step-images-container">
                                    {step.previews.map((preview, imgIndex) => (
                                      <div key={imgIndex} className="step-image-preview">
                                        <img src={preview} alt={`Bước ${index + 1} - Ảnh ${imgIndex + 1}`} />
                                        <button
                                          type="button"
                                          onClick={() => removeStepImage(index, imgIndex)}
                                          className="remove-image-btn"
                                        >
                                          ×
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                ) : null}
                                <label className="step-upload-box">
                                  <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={(e) => updateStepImage(index, e.target.files)}
                                    style={{ display: 'none' }}
                                  />
                                  <span className="upload-icon">📷</span>
                                </label>
                              </div>
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

            <button type="button" onClick={addStep} className="add-button">
              + Bước làm
            </button>
          </div>

          {/* Action Buttons */}
          <div className="form-actions">
            <button type="button" onClick={() => navigate(-1)} className="btn-cancel">
              Hủy
            </button>
            <button type="submit" disabled={loading} className="btn-publish">
              {loading ? "⏳ Đang đăng..." : "Đăng bài"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateRecipe;
