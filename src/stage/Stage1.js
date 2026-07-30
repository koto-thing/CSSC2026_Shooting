export const Stage1 = {
  waves: [
    { time: 0.6, type: "normal", xRatio: 0.5 },
    { time: 1.5, type: "normal", xRatio: 0.35 },
    { time: 2.3, type: "normal", xRatio: 0.65 },
    {
      time: 3.4,
      enemies: [
        { type: "fast", xRatio: 0.22, amplitude: 45, frequency: 5 },
        { type: "fast", xRatio: 0.78, amplitude: 45, frequency: 5 },
      ],
    },
    { time: 5.0, type: "shooter", xRatio: 0.5, stopAtY: 120, shotCooldown: 1.1 },

    {
      time: 7.0,
      enemies: [
        { type: "normal", xRatio: 0.2 },
        { type: "normal", xRatio: 0.4 },
        { type: "normal", xRatio: 0.6 },
        { type: "normal", xRatio: 0.8 },
      ],
    },
    { time: 8.8, type: "fast", xRatio: 0.12, amplitude: 85, frequency: 4 },
    { time: 9.3, type: "fast", xRatio: 0.88, amplitude: 85, frequency: 4 },
    { time: 10.5, type: "shooter", xRatio: 0.28, stopAtY: 150, shotCooldown: 1.0 },
    { time: 11.1, type: "shooter", xRatio: 0.72, stopAtY: 150, shotCooldown: 1.0 },

    {
      time: 14.0,
      enemies: [
        { type: "fast", xRatio: 0.25, amplitude: 55, frequency: 6 },
        { type: "normal", xRatio: 0.5, hp: 4, moveSpeed: 145 },
        { type: "fast", xRatio: 0.75, amplitude: 55, frequency: 6 },
      ],
    },
    {
      time: 16.2,
      type: "burst",
      xRatio: 0.5,
      hp: 50,
      stopAtY: 110,
      shotCooldown: 0.3,
      bulletSpeed: 155,
    },
    { time: 19.0, type: "shooter", xRatio: 0.18, stopAtY: 130, shotCooldown: 0.9 },
    { time: 19.4, type: "shooter", xRatio: 0.82, stopAtY: 130, shotCooldown: 0.9 },

    {
      time: 22.0,
      enemies: [
        { type: "normal", xRatio: 0.15, moveSpeed: 220 },
        { type: "normal", xRatio: 0.3, moveSpeed: 205 },
        { type: "normal", xRatio: 0.45, moveSpeed: 190 },
        { type: "normal", xRatio: 0.6, moveSpeed: 205 },
        { type: "normal", xRatio: 0.75, moveSpeed: 220 },
      ],
    },
    {
      time: 25.0,
      type: "burst",
      xRatio: 0.33,
      hp: 25,
      stopAtY: 105,
      shotCooldown: 1.0,
      bulletSpeed: 145,
    },
    {
      time: 25.6,
      type: "burst",
      xRatio: 0.67,
      hp: 25,
      stopAtY: 105,
      shotCooldown: 1.0,
      bulletSpeed: 145,
    },
    {
      time: 29.0,
      type: "shooter",
      xRatio: 0.5,
      hp: 10,
      stopAtY: 115,
      shotCooldown: 0.72,
      bulletSpeed: 300,
    },
    {
      time: 30.0,
      type: "boss",
      xRatio: 0.5,
      hp: 3000,
      stopAtY: 115,
      shotCooldown: 1.0,
      bulletSpeed: 300,
    },
  ],
};
