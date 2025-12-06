// Enrich existing recipes: make ingredients/steps more descriptive and adjust cook_time for simple dishes
// Usage:
//   node scripts/enrich_recipes.js          # dry-run (only logs)
//   DRY_RUN=false node scripts/enrich_recipes.js   # apply updates

const db = require("../config/db");
const util = require("util");

const query = util.promisify(db.query).bind(db);
const DRY_RUN = process.env.DRY_RUN !== "false"; // default true

// Simple heuristic to decide a dish is simple
function isSimpleRecipe(ingLines, stepLines) {
  return ingLines.length <= 6 && stepLines.length <= 4;
}

// Try to normalize lines: handle JSON-like ["a","b"] or newline-separated strings
function normalizeLines(raw) {
  const text = raw || "";
  const trimmed = text.trim();
  if (!trimmed) return [];

  // Attempt JSON parse if looks like array
  if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
    try {
      const arr = JSON.parse(trimmed);
      if (Array.isArray(arr)) {
        return arr.map((s) => `${s}`.trim()).filter(Boolean);
      }
    } catch (e) {
      // fall back to split by newline
    }
  }

  return text
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

function enrichIngredients(lines) {
  const extras = [
    "chọn loại tươi ngon để giữ vị ngọt tự nhiên",
    "được sơ chế sạch sẽ, an toàn khi nấu",
    "giúp hương vị đậm đà và tròn vị hơn",
    "cắt đều tay để chín cùng lúc",
    "giữ nguyên độ giòn và màu sắc đẹp",
  ];
  return lines
    .map((line, idx) => {
      const clean = line.trim();
      if (!clean) return "";
      const extra = extras[idx % extras.length];
      if (clean.length > 60) return clean; // đủ dài rồi
      return `${clean} — ${extra}`;
    })
    .filter(Boolean);
}

function enrichSteps(lines) {
  const tips = [
    "Giữ lửa vừa để nguyên liệu chín đều mà không bị cháy.",
    "Đảo nhẹ tay, giúp gia vị thấm sâu và dậy mùi thơm.",
    "Nêm nếm lại trước khi tắt bếp để cân bằng vị.",
    "Để nghỉ 2-3 phút cho hương vị hòa quyện rồi hãy dùng.",
    "Trình bày trên đĩa ấm để giữ độ ngon lâu hơn.",
  ];
  return lines
    .map((line, idx) => {
      const clean = line.trim();
      if (!clean) return "";
      const tip = tips[idx % tips.length];
      if (clean.length > 80) return clean; // đã đủ chi tiết
      return `${clean}. ${tip}`;
    })
    .filter(Boolean);
}

async function main() {
  try {
    const recipes = await query("SELECT id, title, ingredients, steps, cook_time FROM cong_thuc");
    console.log(`Found ${recipes.length} recipes.`);

    for (const r of recipes) {
      const ingLines = normalizeLines(r.ingredients);
      const stepLines = normalizeLines(r.steps);

      const newIngredients = enrichIngredients(ingLines);
      const newSteps = enrichSteps(stepLines);

      let newCookTime = r.cook_time || "";
      if (isSimpleRecipe(ingLines, stepLines)) {
        newCookTime = "20 phút";
      } else if (!newCookTime) {
        newCookTime = "45 phút";
      }

      console.log(`\n#${r.id} ${r.title}`);
      console.log("- cook_time:", newCookTime);
      console.log("- ingredients:\n" + newIngredients.join("\n"));
      console.log("- steps:\n" + newSteps.join("\n"));

      if (!DRY_RUN) {
        await query(
          "UPDATE cong_thuc SET ingredients=?, steps=?, cook_time=? WHERE id=?",
          [newIngredients.join("\n"), newSteps.join("\n"), newCookTime, r.id]
        );
      }
    }

    console.log(`\nDone${DRY_RUN ? " (dry-run, no changes applied)" : " (updates applied)"}.`);
    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
}

main();
