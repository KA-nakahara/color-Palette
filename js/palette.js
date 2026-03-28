import { load, save } from "./strage.js";

export function setupPalette() {

  // パレット内に追加するセルの作成
  const createColorCell = (color) => {
    const div = document.createElement("div");
    div.className = `wrapper`;
    div.draggable = true;
    div.innerHTML = `
      <span class="content-cell" style="background-color: ${color};"></span>
      <input type="color" class="colorPicker" value="${color}" style="display: none;">
      <span class="overlay">${color}</span> 
    `;
    div.querySelector(".content-cell").dataset.color = color;
    return div;
  };

  // パレットを保存
  function savedColors(name, colors) {
    if (colors.length === 0) return;

    const saved = load();

    saved.push({
      id: generatePaletteId(saved),
      name: name,
      colors: colors
    });

    save(saved);
    return "パレットが保存されました！";
  }

  //　パレットIDの発行
  function generatePaletteId(saved) {
    if (saved.length === 0) return "palette-001";

    // 既存IDから最大番号を取得
    const maxNum = saved.reduce((max, item) => {
      const match = item.id?.match(/palette-(\d+)/);
      if (!match) return max;

      const num = parseInt(match[1], 10);
      return Math.max(max, num);
    }, 0);

    const nextNum = maxNum + 1;

    // 3桁ゼロ埋め
    return `palette-${String(nextNum).padStart(3, "0")}`;
  }    

  // パレットの復元
  function restorePalette(colors) {
    return colors.map(color => createColorCell(color));
  }  

  // パレットの削除
  function deletePalette(id) {
    const saved = load();
    const newData = saved.filter(p => p.id !== id);
    save(newData);
  }

  // 並び替え変更したパレットの保存
  function saveOrder() {
    const saved = load();
    const paletteArea = document.getElementById("palette-area");
    const elements = paletteArea.querySelectorAll(".saved-palette");

    const newOrder = [];
    const map = new Map(saved.map(p => [p.id, p]));

    elements.forEach(el => {
      const found = map.get(el.dataset.id);
      if (found) newOrder.push(found);
    });

    save(newOrder);
  }  

  function updatePaletteName(id, newName) {
    const saved = load();
    if (!saved) return;

    const palette = saved.find(p => p.id === id);
    if (palette) {
      palette.name = newName;
      save(saved);
    }
  }    

  return {
    createColorCell,
    savedColors,
    generatePaletteId,
    restorePalette,
    deletePalette,
    saveOrder,
    updatePaletteName
  };

}