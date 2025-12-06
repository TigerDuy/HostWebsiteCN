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

function enrichIngredients(lines) {
  const extras = [
    "tươi ngon",
    "chất lượng",
    "đầy hương vị",
    "đã sơ chế sạch",
    "đậm đà",
  ];
  return lines.map((line, idx) => {
    const clean = line.trim();
    if (!clean) return "";
    const extra = extras[idx % extras.length];
    if (clean.length > 40) return clean; // đủ dài rồi
    return `${clean} (${extra})`;
  }).filter(Boolean);
}

function enrichSteps(lines) {
  const tips = [
    "giữ lửa vừa để không cháy",
    "đảo nhẹ tay cho thấm đều",
    "nêm nếm lại trước khi tắt bếp",
    "để nghỉ 2-3 phút cho hương vị hòa quyện",
    "trình bày ra đĩa ấm để ngon hơn",
  ];
  return lines.map((line, idx) => {
    const clean = line.trim();
    if (!clean) return "";
    const tip = tips[idx % tips.length];
    return `${clean} (${tip})`;
  }).filter(Boolean);
}

async function main() {
  try {
    const recipes = await query("SELECT id, title, ingredients, steps, cook_time FROM cong_thuc");
    console.log(`Found ${recipes.length} recipes.`);

    for (const r of recipes) {
      const ingLines = (r.ingredients || "").split("\n").map(s => s.trim()).filter(Boolean);
      const stepLines = (r.steps || "").split("\n").map(s => s.trim()).filter(Boolean);

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
