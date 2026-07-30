export const ShotDefinitions = Object.freeze({
  straight: Object.freeze({
    id: "straight",
    label: "直線",
    description: "正面集中。ボスに火力を出しやすい。",
    slots: Object.freeze([
      Object.freeze({
        pattern: "straight",
        cooldown: 0.075,
        config: { moveSpeed: 720, damage: 2 },
      }),
    ]),
  }),
  spread: Object.freeze({
    id: "spread",
    label: "拡散",
    description: "広範囲へ撃つ。道中の敵を拾いやすい。",
    slots: Object.freeze([
      Object.freeze({
        pattern: "straight",
        cooldown: 0.095,
        config: { offsetX: 0, moveSpeed: 640, damage: 1 },
      }),
      Object.freeze({
        pattern: "angled",
        cooldown: 0.13,
        config: { offsetX: -10, angle: -12, moveSpeed: 600, damage: 1 },
      }),
      Object.freeze({
        pattern: "angled",
        cooldown: 0.13,
        config: { offsetX: 10, angle: 12, moveSpeed: 600, damage: 1 },
      }),
    ]),
  }),
  homing: Object.freeze({
    id: "homing",
    label: "追尾",
    description: "近い敵を追う。避けることに集中しやすい。",
    slots: Object.freeze([
      Object.freeze({ pattern: "straight", cooldown: 0.12, config: { moveSpeed: 620, damage: 1 } }),
      Object.freeze({
        pattern: "homing",
        cooldown: 0.24,
        config: { moveSpeed: 440, damage: 1, turnRate: 3.2 },
      }),
    ]),
  }),
});

export const ShotDefinitionList = Object.freeze(Object.values(ShotDefinitions));
