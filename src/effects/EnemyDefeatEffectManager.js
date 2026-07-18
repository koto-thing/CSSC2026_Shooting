const TAU = Math.PI * 2;

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function easeOutCubic(value) {
    return 1 - Math.pow(1 - value, 3);
}

function drawDiamond(graphics, size) {
    graphics
        .moveTo(0, -size)
        .lineTo(size * 0.58, 0)
        .lineTo(0, size)
        .lineTo(-size * 0.58, 0)
        .closePath();
}

/** 敵撃破時の魔法陣・弾幕粒子を管理する。 */
export class EnemyDefeatEffectManager {
    constructor({ root } = {}) {
        this.root = root;
        this.effects = [];
    }

    /** 撃破位置に東方風の放射エフェクトを生成する。 */
    spawn({ x, y, radius = 12, color = "#ff5ca8", maxHp = 1 } = {}) {
        if (this.root === null || this.root === undefined) {
            return;
        }

        const elite = maxHp >= 20;
        const scale = clamp(radius / 12, 0.75, 1.45) * (elite ? 1.25 : 1);
        const container = new createjs.Container();
        container.x = x;
        container.y = y;
        container.compositeOperation = "lighter";

        const flash = new createjs.Shape();
        flash.graphics
            .beginRadialGradientFill(
                ["#ffffff", color, "rgba(255,255,255,0)"],
                [0, 0.28, 1],
                0, 0, 0,
                0, 0, 42,
            )
            .drawCircle(0, 0, 42);
        flash.cache(-44, -44, 88, 88);
        flash.scaleX = flash.scaleY = 0.35 * scale;
        container.addChild(flash);

        const sigil = this.#createSigil(color, 34 * scale, elite);
        container.addChild(sigil);

        const outerRing = this.#createRing(color, 25 * scale, elite ? 12 : 8);
        const innerRing = this.#createRing("#ffffff", 15 * scale, elite ? 8 : 6);
        container.addChild(outerRing, innerRing);

        const particles = this.#createParticles(container, {
            color,
            scale,
            count: elite ? 30 : 18,
        });

        this.root.addChild(container);
        this.effects.push({
            age: 0,
            duration: elite ? 1.05 : 0.82,
            container,
            flash,
            sigil,
            outerRing,
            innerRing,
            particles,
            elite,
        });
    }

    tick(deltaTime) {
        for (const effect of this.effects) {
            this.#tickEffect(effect, deltaTime);
        }

        this.effects = this.effects.filter((effect) => {
            if (effect.age < effect.duration) {
                return true;
            }

            effect.container.parent?.removeChild(effect.container);
            effect.container.removeAllChildren();
            return false;
        });
    }

    #createSigil(color, size, elite) {
        const shape = new createjs.Shape();
        const graphics = shape.graphics;
        const points = elite ? 8 : 6;

        graphics
            .setStrokeStyle(1.5)
            .beginStroke(color)
            .drawCircle(0, 0, size * 0.55)
            .moveTo(0, -size * 0.72);

        for (let index = 1; index <= points; index += 1) {
            const angle = -Math.PI / 2 + (index * TAU * 2) / points;
            graphics.lineTo(Math.cos(angle) * size * 0.72, Math.sin(angle) * size * 0.72);
        }

        graphics.endStroke();
        shape.cache(-size - 3, -size - 3, size * 2 + 6, size * 2 + 6);
        shape.scaleX = shape.scaleY = 0.25;
        return shape;
    }

    #createRing(color, radius, marks) {
        const padding = 8;
        const shape = new createjs.Shape();
        const graphics = shape.graphics;

        graphics
            .setStrokeStyle(2)
            .beginStroke(color)
            .drawCircle(0, 0, radius)
            .setStrokeStyle(1)
            .drawCircle(0, 0, radius * 0.76);

        for (let index = 0; index < marks; index += 1) {
            const angle = (index / marks) * TAU;
            const inner = radius * 0.86;
            const outer = radius * 1.13;
            graphics
                .moveTo(Math.cos(angle) * inner, Math.sin(angle) * inner)
                .lineTo(Math.cos(angle) * outer, Math.sin(angle) * outer);
        }

        graphics.endStroke();
        shape.cache(
            -radius - padding,
            -radius - padding,
            (radius + padding) * 2,
            (radius + padding) * 2,
        );
        shape.scaleX = shape.scaleY = 0.2;
        return shape;
    }

    #createParticles(container, { color, scale, count }) {
        const particles = [];
        const palette = ["#ffffff", color, "#ff8bd1", "#74e7ff", "#bca7ff"];
        const angleOffset = Math.random() * TAU;

        for (let index = 0; index < count; index += 1) {
            const angle = angleOffset + (index / count) * TAU + (Math.random() - 0.5) * 0.16;
            const speed = (70 + Math.random() * 135) * scale;
            const size = (1.8 + Math.random() * 2.6) * scale;
            const particle = new createjs.Shape();
            const particleColor = palette[index % palette.length];

            particle.graphics.beginFill(particleColor);
            if (index % 3 === 0) {
                particle.graphics.drawEllipse(-size * 0.55, -size * 1.8, size * 1.1, size * 3.6);
            } else {
                drawDiamond(particle.graphics, size);
            }
            particle.graphics.endFill();
            particle.cache(-size * 2, -size * 2.2, size * 4, size * 4.4);
            particle.rotation = angle * 180 / Math.PI + 90;
            container.addChild(particle);

            particles.push({
                view: particle,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                spin: (Math.random() - 0.5) * 480,
                delay: (index % 2) * 0.025,
            });
        }

        return particles;
    }

    #tickEffect(effect, deltaTime) {
        effect.age += deltaTime;
        const progress = clamp(effect.age / effect.duration, 0, 1);
        const burst = easeOutCubic(progress);

        effect.flash.scaleX = effect.flash.scaleY = 0.35 + burst * (effect.elite ? 2.1 : 1.55);
        effect.flash.alpha = Math.pow(1 - progress, 3);

        effect.sigil.scaleX = effect.sigil.scaleY = 0.25 + burst * 1.08;
        effect.sigil.rotation += deltaTime * (effect.elite ? 210 : 155);
        effect.sigil.alpha = Math.pow(1 - progress, 1.45);

        effect.outerRing.scaleX = effect.outerRing.scaleY = 0.2 + burst * 1.85;
        effect.outerRing.rotation += deltaTime * 125;
        effect.outerRing.alpha = Math.pow(1 - progress, 1.2);

        effect.innerRing.scaleX = effect.innerRing.scaleY = 0.2 + burst * 1.35;
        effect.innerRing.rotation -= deltaTime * 185;
        effect.innerRing.alpha = Math.pow(1 - progress, 1.5);

        for (const particle of effect.particles) {
            if (effect.age < particle.delay) {
                particle.view.visible = false;
                continue;
            }

            particle.view.visible = true;
            particle.view.x += particle.vx * deltaTime;
            particle.view.y += particle.vy * deltaTime;
            particle.vx *= Math.pow(0.09, deltaTime);
            particle.vy *= Math.pow(0.09, deltaTime);
            particle.view.rotation += particle.spin * deltaTime;
            particle.view.alpha = Math.pow(1 - progress, 1.35);
            const particleScale = 0.65 + Math.sin(progress * Math.PI) * 0.75;
            particle.view.scaleX = particle.view.scaleY = particleScale;
        }
    }
}
