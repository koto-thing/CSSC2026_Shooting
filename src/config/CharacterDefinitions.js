export const CharacterDefinitions = Object.freeze({
  fast: Object.freeze({
    id: "fast",
    name: "Astra",
    label: "高速型",
    description: "素早い移動で道中を切り返しやすい。低速時も少し速め。",
    moveSpeed: 380,
    slowMoveSpeed: 160,
    color: "#5ce1e6",
  }),
  standard: Object.freeze({
    id: "standard",
    name: "Mira",
    label: "標準型",
    description: "速度と操作性のバランスがよく、最初に遊びやすい。",
    moveSpeed: 300,
    slowMoveSpeed: 120,
    color: "#65d887",
  }),
  precise: Object.freeze({
    id: "precise",
    name: "Noel",
    label: "低速型",
    description: "通常速度は低め。細かい回避と高密度弾幕に向く。",
    moveSpeed: 240,
    slowMoveSpeed: 82,
    color: "#b995ff",
  }),
});

export const CharacterDefinitionList = Object.freeze(Object.values(CharacterDefinitions));
