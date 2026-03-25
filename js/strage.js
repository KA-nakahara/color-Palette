export function load() {
  return JSON.parse(localStorage.getItem("savedColors") || "[]");
}

export function loadById(id) {
  const saved = load();
  return saved.find(p => p.id === id);
}

export function save(data) {
  localStorage.setItem("savedColors", JSON.stringify(data));
}