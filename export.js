import { load } from "./strage.js";

export function paletteExport(palettes) {
  if (!palettes || palettes.length === 0) {
    alert("エクスポートするパレットがありません");
    return;
  }

  const saved = load();
  const selected = [];

  palettes.forEach(palette => {
    const id = palette.dataset.id;
    const found = saved.find(p => p.id === id);

    if (found) {
      selected.push({
        name: found.name,
        colors: found.colors
      });
    }
  });

  const json = JSON.stringify(selected, null, 2);

  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  const createtime = createTimestamp();
  a.href = url;
  a.download = `palettes-selected-${createtime}.json`;
  a.click();

  URL.revokeObjectURL(url);
  };

  function createTimestamp() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");
    return `${year}${month}${day}${hours}${minutes}${seconds}`;
  }