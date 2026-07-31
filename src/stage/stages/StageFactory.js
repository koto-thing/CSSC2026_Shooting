const enemyRows = [0.18, 0.34, 0.5, 0.66, 0.82];

function wave(time, enemies) {
  return { time, enemies };
}

function normalLine(time, type, count = 5) {
  return wave(
    time,
    enemyRows.slice(0, count).map((xRatio, index) => ({
      type,
      xRatio,
      moveSpeed: 145 + index * 10,
    })),
  );
}

function bossChapter(id, name, bossOverrides = {}) {
  return {
    id,
    name,
    type: "boss",
    duration: bossOverrides.timeout ?? 55,
    endCondition: "bossDefeated",
    boss: {
      type: "boss",
      xRatio: 0.5,
      hp: 650,
      stopAtY: 112,
      shotCooldown: 0.88,
      ...bossOverrides,
    },
  };
}

export function createStage({ id, name, estimatedSeconds, theme, difficulty = 1 }) {
  const speed = 1 + difficulty * 0.08;
  const hp = 1 + difficulty * 0.18;
  const midPatterns = ["aimedFan", "circle15WithOffset", "doubleSpiral", "lunarWave"];
  const finalPatterns = ["circle15WithOffset", "doubleSpiral", "lunarWave", "pureRing"];
  const midPattern =
    midPatterns[Math.min(midPatterns.length - 1, Math.floor((difficulty - 1) / 2))];
  const finalPattern = finalPatterns[Math.min(finalPatterns.length - 1, difficulty - 1)];

  return {
    id,
    name,
    estimatedSeconds,
    theme,
    chapters: [
      {
        id: `${id}-1`,
        name: "Opening",
        type: "wave",
        duration: 45,
        endCondition: "duration",
        events: [
          normalLine(1.0, "normal", 3),
          wave(8.0, [{ type: "shooter", xRatio: 0.5, hp: 4 * hp, bulletSpeed: 230 * speed }]),
          normalLine(18.0, "fast", 4),
          wave(30.0, [{ type: "burst", xRatio: 0.5, hp: 24 * hp, bulletSpeed: 130 * speed }]),
        ],
      },
      {
        id: `${id}-2`,
        name: "Crossing Lights",
        type: "wave",
        duration: 50,
        endCondition: "duration",
        events: [
          wave(2.0, [
            { type: "fast", xRatio: 0.15, amplitude: 75, frequency: 4 },
            { type: "fast", xRatio: 0.85, amplitude: 75, frequency: 4 },
          ]),
          wave(13.0, [
            { type: "shooter", xRatio: 0.28, hp: 7 * hp, bulletSpeed: 245 * speed },
            { type: "shooter", xRatio: 0.72, hp: 7 * hp, bulletSpeed: 245 * speed },
          ]),
          normalLine(27.0, "normal", 5),
          wave(38.0, [{ type: "burst", xRatio: 0.5, hp: 30 * hp, angleOffsetStep: 10 }]),
        ],
      },
      bossChapter(`${id}-3`, "Mid Guardian", {
        hp: 420 * hp,
        timeout: 45,
        shotCooldown: Math.max(0.38, 1.0 - difficulty * 0.08),
        bulletSpeed: 150 * speed,
        shotPattern: midPattern,
        fanCount: 5 + difficulty,
        ringCount: 14 + difficulty * 2,
      }),
      {
        id: `${id}-4`,
        name: "Falling Pattern",
        type: "wave",
        duration: 55,
        endCondition: "duration",
        events: [
          normalLine(1.0, "normal", 5),
          wave(10.0, [
            { type: "burst", xRatio: 0.25, hp: 28 * hp },
            { type: "burst", xRatio: 0.75, hp: 28 * hp },
          ]),
          wave(28.0, [
            { type: "shooter", xRatio: 0.4, shotPattern: "fan3" },
            { type: "shooter", xRatio: 0.6, shotPattern: "fan3" },
          ]),
          normalLine(42.0, "fast", 5),
        ],
      },
      {
        id: `${id}-5`,
        name: "Quiet Ring",
        type: "wave",
        duration: 50,
        endCondition: "allEnemiesDefeated",
        events: [
          wave(1.0, [
            {
              type: "burst",
              xRatio: 0.5,
              hp: 42 * hp,
              shotPattern: "circle15WithOffset",
              angleOffsetStep: 8,
            },
          ]),
          wave(17.0, [
            { type: "shooter", xRatio: 0.22 },
            { type: "shooter", xRatio: 0.78 },
          ]),
          normalLine(32.0, "normal", 5),
        ],
      },
      bossChapter(`${id}-6`, "Spell Bloom", {
        hp: 760 * hp,
        timeout: 60,
        shotCooldown: Math.max(0.32, 0.82 - difficulty * 0.07),
        angleOffsetStep: Math.max(5, 13 - difficulty),
        bulletSpeed: 165 * speed,
        shotPattern: difficulty >= 3 ? "lunarWave" : "doubleSpiral",
        waveCount: 9 + difficulty,
      }),
      {
        id: `${id}-7`,
        name: "Last Corridor",
        type: "wave",
        duration: 60,
        endCondition: "duration",
        events: [
          wave(2.0, [
            { type: "fast", xRatio: 0.1 },
            { type: "fast", xRatio: 0.9 },
          ]),
          normalLine(12.0, "normal", 5),
          wave(26.0, [
            { type: "burst", xRatio: 0.33, hp: 34 * hp },
            { type: "burst", xRatio: 0.67, hp: 34 * hp },
          ]),
          wave(45.0, [{ type: "shooter", xRatio: 0.5, hp: 14 * hp, shotCooldown: 0.55 }]),
        ],
      },
      bossChapter(`${id}-8`, "Stage Finale", {
        hp: 980 * hp,
        timeout: 75,
        shotCooldown: Math.max(0.28, 0.78 - difficulty * 0.06),
        bulletSpeed: 175 * speed,
        shotPattern: finalPattern,
        ringCount: 18 + difficulty * 2,
        waveCount: 10 + difficulty,
      }),
    ],
  };
}
