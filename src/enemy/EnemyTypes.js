export const EnemyTypes = {
    normal: {
        hp: 3,
        radius: 12,
        color: "#f58220",
        moveSpeed: 180,
        shotCooldown: 1.0,
        movePattern: "straightDown",
        shotPattern: "singleDown",
        bulletSpeed: 260,
    },

    fast: {
        hp: 1,
        radius: 8,
        color: "#40c4ff",
        moveSpeed: 320,
        shotCooldown: 0,
        movePattern: "zigzag",
        shotPattern: "none",
    },

    shooter: {
        hp: 5,
        radius: 14,
        color: "#ff4d6d",
        moveSpeed: 120,
        shotCooldown: 0.8,
        movePattern: "stopAtY",
        stopY: 140,
        shotPattern: "fan3",
        bulletSpeed: 280,
    },

    burst: {
        hp: 4,
        radius: 13,
        color: "#b967ff",
        moveSpeed: 90,
        shotCooldown: 1.5,
        movePattern: "stopAtY",
        stopY: 100,
        shotPattern: "circle12",
        bulletSpeed: 180,
    },
};