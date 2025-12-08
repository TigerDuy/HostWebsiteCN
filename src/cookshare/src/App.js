import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import Profile from "./pages/Profile";
import AccountSettings from "./pages/AccountSettings";
import UserProfile from "./pages/UserProfile";
import ThemeSettings from "./pages/ThemeSettings";
import ThemeCustomization from "./pages/ThemeCustomization";
import Navbar from "./components/Navbar";
// Sử dụng trang tạo công thức mới (CreateRecipe.jsx)
import CreateRecipe from "./pages/CreateRecipe";
import RecipeDetail from "./pages/RecipeDetail";
import Home from "./pages/Home";
import MyRecipes from "./pages/MyRecipes";
import AdminDashboard from "./pages/AdminDashboard";
import Search from "./pages/Search";
import FavoriteRecipes from "./pages/FavoriteRecipes";
import ProtectedRoute from "./components/ProtectedRoute";
import EditRecipe from "./pages/EditRecipe";

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        {/* Public user profile */}
        <Route path="/user/:id" element={<UserProfile />} />
        
        {/* ✅ Các route bảo vệ - cần đăng nhập */}
        <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/create" element={<ProtectedRoute><CreateRecipe /></ProtectedRoute>} />
        <Route path="/recipe/:id" element={<ProtectedRoute><RecipeDetail /></ProtectedRoute>} />
        <Route path="/recipe/:id/edit" element={<ProtectedRoute><EditRecipe /></ProtectedRoute>} />
        <Route path="/my-recipes" element={<ProtectedRoute><MyRecipes /></ProtectedRoute>} />
        <Route path="/favorites" element={<ProtectedRoute><FavoriteRecipes /></ProtectedRoute>} />
        <Route path="/search" element={<ProtectedRoute><Search /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><AccountSettings /></ProtectedRoute>} />
        <Route path="/theme" element={<ProtectedRoute><ThemeSettings /></ProtectedRoute>} />
        <Route path="/customize" element={<ProtectedRoute><ThemeCustomization /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
