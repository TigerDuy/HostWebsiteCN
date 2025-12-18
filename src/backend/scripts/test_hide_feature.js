const axios = require("axios");

// Test các API endpoints mới
const BASE_URL = "http://localhost:3001";

// Thay đổi token và recipe ID để test
const TEST_TOKEN = "YOUR_ADMIN_TOKEN_HERE";
const TEST_RECIPE_ID = 1;

async function testHideRecipe() {
  console.log("\n🧪 Test 1: Ẩn bài viết");
  try {
    const response = await axios.put(
      `${BASE_URL}/recipe/hide/${TEST_RECIPE_ID}`,
      { reason: "Test: Nội dung không phù hợp" },
      { headers: { Authorization: `Bearer ${TEST_TOKEN}` } }
    );
    console.log("✅ Success:", response.data);
  } catch (error) {
    console.error("❌ Error:", error.response?.data || error.message);
  }
}

async function testUnhideRecipe() {
  console.log("\n🧪 Test 2: Bỏ ẩn bài viết");
  try {
    const response = await axios.put(
      `${BASE_URL}/recipe/unhide/${TEST_RECIPE_ID}`,
      {},
      { headers: { Authorization: `Bearer ${TEST_TOKEN}` } }
    );
    console.log("✅ Success:", response.data);
  } catch (error) {
    console.error("❌ Error:", error.response?.data || error.message);
  }
}

async function testGetAdminRecipes() {
  console.log("\n🧪 Test 3: Lấy danh sách bài viết (Admin)");
  try {
    const response = await axios.get(
      `${BASE_URL}/admin/recipes`,
      { headers: { Authorization: `Bearer ${TEST_TOKEN}` } }
    );
    console.log("✅ Success: Lấy được", response.data.length, "bài viết");
    console.log("Bài viết đầu tiên:", {
      id: response.data[0]?.id,
      title: response.data[0]?.title,
      is_hidden: response.data[0]?.is_hidden,
      violation_count: response.data[0]?.violation_count
    });
  } catch (error) {
    console.error("❌ Error:", error.response?.data || error.message);
  }
}

async function runTests() {
  console.log("====================================");
  console.log("🚀 Bắt đầu test API Ẩn/Bỏ ẩn bài viết");
  console.log("====================================");
  
  if (TEST_TOKEN === "YOUR_ADMIN_TOKEN_HERE") {
    console.log("\n⚠️  Cảnh báo: Vui lòng cập nhật TEST_TOKEN trong file này!");
    console.log("   1. Đăng nhập vào hệ thống bằng tài khoản admin");
    console.log("   2. Lấy token từ localStorage hoặc response");
    console.log("   3. Cập nhật biến TEST_TOKEN trong file này");
    console.log("   4. Cập nhật TEST_RECIPE_ID với ID bài viết muốn test");
    return;
  }

  // Chạy các test
  await testGetAdminRecipes();
  await testHideRecipe();
  
  // Đợi 2 giây để xem kết quả
  console.log("\n⏳ Đợi 2 giây...");
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  await testGetAdminRecipes();
  await testUnhideRecipe();
  
  console.log("\n====================================");
  console.log("✅ Hoàn thành test!");
  console.log("====================================");
}

// Chạy test nếu gọi trực tiếp file này
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { testHideRecipe, testUnhideRecipe, testGetAdminRecipes };
