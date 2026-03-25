import { setupUI } from "./js/ui.js";
import { setupPalette } from "./js/palette.js";

const ui = setupUI();
const palette = setupPalette();

export function paletteImport() {

  function validatePalette(data) {
    if (typeof data !== "object" || data === null) {
      throw new Error("データ形式が不正です");
    }

    if (typeof data.name !== "string") {
      throw new Error("nameが不正です");
    }

    if (!Array.isArray(data.colors)) {
      throw new Error("colorsは配列である必要があります");
    }

    const isValidColor = (c) => /^#([0-9A-Fa-f]{6})$/.test(c);

    if (!data.colors.every(isValidColor)) {
      throw new Error("不正なカラーコードが含まれています");
    }

    return true;
  }

  function importPalette(data) {
    const saved = JSON.parse(localStorage.getItem("savedColors") || "[]");

    // バリデーション
    validatePalette(data);

    // ID付与
    const newPalette = {
      id: palette.generatePaletteId(saved),
      name: data.name,
      colors: data.colors,
      createdAt: new Date().toISOString()
    };

    saved.push(newPalette);

    localStorage.setItem("savedColors", JSON.stringify(saved));
  }  

  function importPalettes(dataArray) {
    const saved = JSON.parse(localStorage.getItem("savedColors") || "[]");

    dataArray.forEach(data => {
      validatePalette(data);

      saved.push({
        id: palette.generatePaletteId(saved),
        name: data.name,
        colors: data.colors,
        createdAt: new Date().toISOString()
      });
    });

    localStorage.setItem("savedColors", JSON.stringify(saved));
  }  

  function fileImport(file) {
    const reader = new FileReader();

    reader.onload = () => {
      try {
        const json = JSON.parse(reader.result);

        // 配列か単体か判定
        if (Array.isArray(json)) {
          importPalettes(json);
        } else {
          importPalette(json);
        }

        ui.renderPalettes();
        document.getElementById("importFile").value = ""; // ファイル選択をリセット

        alert("インポート完了！");
      } catch (err) {
        alert("JSONの読み込みに失敗しました");
        console.error(err);
      }
    };

    reader.readAsText(file);
  };    

  return {
    validatePalette,
    importPalette,
    importPalettes,
    fileImport
  }
}