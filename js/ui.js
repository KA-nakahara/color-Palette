  import { load, save } from "./strage.js";
  
  export function setupUI() {
  
  // ドロップ位置の計算 横移動
  function getClosestElement_X(container, e) {
      const elements = [...container.querySelectorAll(".wrapper:not(.dragging)")];

      return elements.reduce((closest, child) => {
      const rect = child.getBoundingClientRect();
      const offset = e.clientX - rect.left - rect.width / 2;

      if (offset < 0 && offset > closest.offset) {
          return { offset, element: child };
      } else {
          return closest;
      }
      }, { offset: Number.NEGATIVE_INFINITY }).element;
  }

  // ドロップ位置の計算 縦移動
  function getClosestElement_Y(container, e) {
      const elements = [...container.querySelectorAll(".saved-palette:not(.dragging)")];

      return elements.reduce((closest, child) => {
      const rect = child.getBoundingClientRect();
      const offset = e.clientY - rect.top - rect.height / 2;

      if (offset < 0 && offset > closest.offset) {
          return { offset, element: child };
      } else {
          return closest;
      }
      }, { offset: Number.NEGATIVE_INFINITY }).element;
  }  

  // 現在のパレットの色データを取得
  function getCurrentPalette() {
    const currentPalette = document.getElementById("contents-area");
    const cells = currentPalette.querySelectorAll(".content-cell");
    cells.forEach(cell => {
      if (!cell.dataset.color) {
        const bgColor = cell.querySelector(".overlay").textContent;
        cell.dataset.color = bgColor;
      }
    });
    return Array.from(cells).map(cell => cell.dataset.color);
  }

  // パレット名の編集
  function toggleEdit(palette) {
    const nameSpan = palette.querySelector(".palette-name");
    const nameInput = palette.querySelector(".palette-name-input");

    const isEditing = nameInput.style.display === "block";
    if (isEditing) {
      // 編集完了
      const newName = nameInput.value.trim() || "";
      nameSpan.textContent = newName;
      nameInput.style.display = "none";
      nameSpan.style.display = "inline";

      // ローカルストレージの更新
      const id = palette.dataset.id;
      return { id, newName };

    } else {
      // 編集開始
      nameInput.style.display = "block";
      nameSpan.style.display = "none";
      nameInput.focus();
    }
  };  

  // クリップボードにコピー
  function copyToClipboard(color) {
    navigator.clipboard.writeText(color).then(() => {
      alert(`カラーコード ${color} をコピーしました！`);
    });
  };  

  // パレットの再描画
  function renderPalettes() {

    const saved = load();
    const savepalette = document.getElementById("palette-area");

    savepalette.innerHTML = "";

    saved.forEach((paletteData) => {

      const name = paletteData.name || "";

      const newPalette = document.createElement("div");
      newPalette.className = "saved-palette";
      newPalette.draggable = true;
      newPalette.dataset.id = paletteData.id;

      newPalette.innerHTML = `
        <span class="drag-handle" style="cursor: move;">☰</span>
        <input class="export-checkbox" type="checkbox">
        <div class="palette-content">
          <div class="tool-row">
            <input type="button" class="restore-button" value="復元">
            <input type="button" class="delete-button" value="削除">
            <span class="palette-name">${name}</span>
            <input type="text" class="palette-name-input" name="palette-name" value="${name}" style="display: none;">
            <span class="edit-name">✏︎</span>
          </div>
          <div class="colors-container"></div>
        </div>
      `;

      // 色表示
      paletteData.colors.forEach(color => {
        const colorbox = document.createElement("div");
        colorbox.className = "saved-color";
        colorbox.style.backgroundColor = color;
        colorbox.dataset.color = color;
        newPalette.querySelector(".colors-container").appendChild(colorbox);
      });

      savepalette.appendChild(newPalette);
    });
  }

  return{
    getClosestElement_X,
    getClosestElement_Y,
    getCurrentPalette,
    toggleEdit,
    copyToClipboard,
    renderPalettes
  }

}