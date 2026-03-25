import { setupPalette } from "./palette.js";
import { setupUI } from "./ui.js"; 
import { paletteImport } from "./import.js";
import { paletteExport } from "./export.js";
import { loadById } from "./strage.js";

const palette = setupPalette();
const ui = setupUI();
const importFn = paletteImport();

(function(){

  const el = {
    body: document.body,
    modeSelect: document.getElementsByName("mode"),
    colorInput: document.getElementById("color-input"),
    colorCode: document.getElementById("color-code"),
    addBtn: document.getElementById("add-button"),
    clearBtn: document.getElementById("clear-button"),
    currentPalette: document.getElementById("contents-area"),
    paletteName: document.getElementById("palette-name"),
    saveBtn: document.getElementById("save-button"),
    saveMessage: document.getElementById("save-message"),
    importFile: document.getElementById("importFile"),
    paletteArea: document.getElementById("palette-area"),
    selectAll: document.getElementById("selectAll"),
    clearAll: document.getElementById("clearAll"),
    exportButton: document.getElementById("export-button")
  };

  // モード切り替え
  el.modeSelect.forEach(radio => {
    radio.addEventListener("change", () => {
      if (radio.id === "desktop-mode") {
        el.body.classList.remove("mobile");
        el.body.classList.add("desktop");
        el.body.dataset.mode = "desktop";
      } else {
        el.body.classList.remove("desktop");
        el.body.classList.add("mobile");
        el.body.dataset.mode = "mobile";
      }
      localStorage.setItem("viewMode", el.body.dataset.mode);
    });
  });

  const savedMode = localStorage.getItem("viewMode") || "desktop";
  el.body.classList.add(savedMode);
  document.getElementById(`${savedMode}-mode`).checked = true;

  // カラーピッカーとテキスト入力の同期
  el.colorInput.addEventListener("input", () => {
    el.colorCode.value = el.colorInput.value;
  });
  el.colorCode.addEventListener("input", () => {
    const val = el.colorCode.value;
    if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
      el.colorInput.value = val;
    }
  });
  el.colorCode.addEventListener("focus", (e) => {
    e.target.select();
  });

  // 追加ボタンの動作
  // パレットに選択カラーを追加
  el.addBtn.addEventListener("click", () => {
    const color = el.colorInput.value;
    const div = palette.createColorCell(color);
    el.currentPalette.appendChild(div);
  });  
  
  // クリアボタンの動作
  // パレットを全てクリア
  el.clearBtn.addEventListener("click", () => {
    el.currentPalette.innerHTML = "";
    el.paletteName.value = ""; // パレット名もリセット
  });

  // パレット内のセルをダブルクリックで削除
  el.currentPalette.addEventListener("dblclick", (e) => {
    if (e.target.classList.contains("content-cell")) {
      e.target.parentElement.remove(); // wrapperごと削除
    }
  });

  // パレット内のセルを右クリックでカラー編集
  el.currentPalette.addEventListener("contextmenu", (e) => {
    e.preventDefault();

    const overlay = e.target.closest(".overlay");
    if (!overlay) return;

    const wrapper = overlay.closest(".wrapper");
    const cell = wrapper.querySelector(".content-cell");
    const colorPicker = wrapper.querySelector(".colorPicker");

    colorPicker.click(); // カラーピッカーを開く
    colorPicker.addEventListener("change", handler, { once: true });

    function handler() {
      const color = colorPicker.value;
      cell.style.backgroundColor = color;
      overlay.textContent = color;
    };
  });

  // ドラッグアンドドロップのセットアップ
  setupDnD(el.currentPalette, ".wrapper", ui.getClosestElement_X);
  setupDnD(el.paletteArea, ".saved-palette", ui.getClosestElement_Y);  

  function setupDnD(container, selector, getPosition) {
    let dragged = null;

    container.addEventListener("dragstart", (e) => {
      if (e.target.matches(selector)) {
        dragged = e.target;
        dragged?.classList.add("dragging");
      }
    });

    container.addEventListener("dragend", () => {
      dragged?.classList.remove("dragging");
      palette.saveOrder(); // ドロップ後に順序を保存
    });

    container.addEventListener("dragover", (e) => {
      e.preventDefault();

      const after = getPosition(container, e);
      if (!after) container.appendChild(dragged);
      else container.insertBefore(dragged, after);
    });
  }

  // 作成したパレットの保存
  el.saveBtn.addEventListener("click", () => {
    const cells = el.currentPalette.querySelectorAll(".wrapper");
    el.saveMessage.textContent = ""; // メッセージをリセット
    if (cells.length === 0) {
      el.saveMessage.textContent = "保存するパレットがありません。";
      return;
    }
    const colors = ui.getCurrentPalette();
    const name = el.paletteName.value || "";
    el.saveMessage.textContent = palette.savedColors(name, colors);
    ui.renderPalettes();
  });

  // パレットエリアのイベント
  el.paletteArea.addEventListener("click", (e) => {
    const selectedPalette = e.target.closest(".saved-palette");
    if (!selectedPalette) return;

    const id = selectedPalette.dataset.id;

    // 復元ボタン
    if (e.target.classList.contains("restore-button")) {
      el.currentPalette.innerHTML = ""; // 既存のパレットをクリア   
      const selectedPalette = loadById(id);   
      const name = selectedPalette?.name || "";
      const colors = selectedPalette?.colors || [];

      el.paletteName.textContent = name;
      const colorArray = palette.restorePalette(colors);
      for (const [color, div] of Object.entries(colorArray)) {
        el.currentPalette.appendChild(div);
      }
    }

    // 削除ボタン
    if (e.target.classList.contains("delete-button")) {
      palette.deletePalette(id);
      ui.renderPalettes();
      return; // 削除後は他の処理をしない
    }

    // 名前編集
    if (e.target.classList.contains("edit-name")) {
      const result = ui.toggleEdit(selectedPalette);
      if (!result) return; // 編集キャンセルや無効な入力の場合は終了

      palette.updatePaletteName(result?.id, result?.newName);
      ui.renderPalettes();
    }

    // カラーセルのクリックでクリップボードにコピー
    if (e.target.classList.contains("saved-color")) {
      const color = e.target.dataset.color;
      ui.copyToClipboard(color);
    }

  });  

  // JSONファイルからのインポート
  el.importFile.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    importFn.fileImport(file);
  });  

  // 全選択
  el.selectAll.addEventListener("click", () => {
    el.paletteArea.querySelectorAll(".export-checkbox").forEach(cb => cb.checked = true);
  });
  // 全解除
  el.clearAll.addEventListener("click", () => {
    el.paletteArea.querySelectorAll(".export-checkbox").forEach(cb => cb.checked = false);
  });  

  // パレットのエクスポート
  el.exportButton.addEventListener("click", () => {
    const selected = [];
    const palettes = el.paletteArea.querySelectorAll(".saved-palette");
    palettes.forEach(palette => {
      const checkbox = palette.querySelector(".export-checkbox");
      if (checkbox.checked) selected.push(palette);
    });
    paletteExport(selected);
  });

  // ページ読み込み時に保存されたパレットを表示
  ui.renderPalettes();

})();