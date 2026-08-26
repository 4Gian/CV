let canvas = document.getElementById('indexcanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const simbolos = [
    'G', 'H', 'K', '⊕', '⊗', '≅', '≃', '⊲', '⊳', 'ker', 'im', 'Hom', 'Aut', 'End',
    '<G,∗>', '|G|', 'N ⊲ G', 'Z(G)',
    'ε', 'δ', '∀', '∃', 'lim', 'sup', 'inf', 'ℝ', 'ℝⁿ', '∥·∥',
    '∫', 'Σ', '∂', '∇', 'Δ', 'L¹', 'ℓ²', 'fₙ→f',
    'M', 'TₚM', 'ω', 'dω', '∧', '∇', 'g', 'det', 'R', 'S²', 'χ(M)',
    'Γᵏᵢⱼ', '⊗', 'Hₚ', '∂M',
    'τ', 'ℬ', '∅', '∩', '∪', '⊂', '⊆', 'cl', 'int', 'fr', '∂',
    'π₁', 'Hₙ', '≈', '↪',
    'π', 'e', 'i', 'φ', '∞', '√', 'ℕ', 'ℤ', 'ℚ', 'ℂ',
    '∮', '⇒', '⇔', '∀x', '∃!',
];

const reds  = ['#8b0000', '#b22222', '#c0392b', '#a93226', '#922b21', '#641e16'];
const darks = ['#1a1a2e', '#2c3e50', '#333333', '#444444', '#1b1b1b'];

class Simbolo {
    constructor() {
        this.position = { x: Math.random() * canvas.width, y: Math.random() * canvas.height };
        this.velocity = { x: Math.random() * 2 - 1, y: Math.random() * 2 - 1 };
        this.symbol = simbolos[Math.floor(Math.random() * simbolos.length)];
        this.size = Math.random() * 12 + 20;
        this.isRed = Math.random() < 0.6;
        this.color = this.isRed
            ? reds[Math.floor(Math.random() * reds.length)]
            : darks[Math.floor(Math.random() * darks.length)];
        this.isNode = Math.random() < 0.5;
        this.nodeRadius = Math.random() * 4 + 6;
        this.opacity = this.isNode ? 1 : Math.random() * 0.15 + 0.3;
    }

    distance(other) {
        return Math.sqrt((this.position.x - other.position.x) ** 2 +
            (this.position.y - other.position.y) ** 2);
    }

    update(entities) {
        let align = this.align(entities);
        let cohesion = this.cohesion(entities);
        let separation = this.separate(entities);

        this.velocity.x += align.x * 0.005 + cohesion.x * 0.08 + separation.x * 0.5;
        this.velocity.y += align.y * 0.005 + cohesion.y * 0.08 + separation.y * 0.5;

        let speed = Math.sqrt(this.velocity.x ** 2 + this.velocity.y ** 2);
        if (speed > 1.5) {
            this.velocity.x = (this.velocity.x / speed) * 1.5;
            this.velocity.y = (this.velocity.y / speed) * 1.5;
        }

        this.velocity.x += (Math.random() - 0.5) * 0.06;
        this.velocity.y += (Math.random() - 0.5) * 0.06;

        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;

        if (this.position.x > canvas.width + 80) this.position.x = -80;
        if (this.position.x < -80) this.position.x = canvas.width + 80;
        if (this.position.y > canvas.height + 80) this.position.y = -80;
        if (this.position.y < -80) this.position.y = canvas.height + 80;
    }

    cohesion(entities) {
        let pcj = { x: 0, y: 0 };
        let count = 0;
        for (let e of entities) {
            if (e != this && this.distance(e) < this.size * 5) {
                pcj.x += e.position.x;
                pcj.y += e.position.y;
                count += 1;
            }
        }
        if (count === 0) return { x: 0, y: 0 };
        pcj.x /= count;
        pcj.y /= count;
        return { x: (pcj.x - this.position.x) * 0.003, y: (pcj.y - this.position.y) * 0.003 };
    }

    separate(entities) {
        let c = { x: 0, y: 0 };
        for (let other of entities) {
            if (other != this) {
                let d = this.distance(other);
                if (d < this.size * 2.5) {
                    c.x += this.position.x - other.position.x;
                    c.y += this.position.y - other.position.y;
                }
            }
        }
        return c;
    }

    align(entities) {
        let pvj = { x: 0, y: 0 };
        let count = 0;
        for (let e of entities) {
            if (e != this && this.distance(e) < this.size * 3) {
                pvj.x += e.velocity.x;
                pvj.y += e.velocity.y;
                count += 1;
            }
        }
        if (count === 0) return { x: 0, y: 0 };
        pvj.x /= count;
        pvj.y /= count;
        return { x: (pvj.x - this.velocity.x) * 0.08, y: (pvj.y - this.velocity.y) * 0.08 };
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        if (this.isNode) {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.position.x, this.position.y, this.nodeRadius, 0, Math.PI * 2);
            ctx.fill();
        } else {
            ctx.fillStyle = this.color;
            ctx.font = `${this.size}px "Crimson Pro", serif`;
            ctx.fillText(this.symbol, this.position.x, this.position.y);
        }
        ctx.restore();
    }
}

const totalEntities = Math.floor((canvas.width * canvas.height) / 22000);
const entities = [];
for (let i = 0; i < totalEntities; i++) {
    entities.push(new Simbolo());
}

let mouse = { x: -1000, y: -1000 };

document.body.addEventListener("mousemove", (event) => {
    mouse.x = event.pageX;
    mouse.y = event.pageY;
});

function applyMouseRepulsion(entity) {
    const dx = entity.position.x - mouse.x;
    const dy = entity.position.y - mouse.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const radius = 160;

    if (distance < radius) {
        let strength = Math.pow(1 - distance / radius, 2);
        const power = 10;
        entity.velocity.x += (dx / distance) * strength * power;
        entity.velocity.y += (dy / distance) * strength * power;
    }
}

const D = 250;
const DELTA = 60;
const activeEdges = new Map();

function edgeKey(i, j) {
    return i < j ? `${i},${j}` : `${j},${i}`;
}

function updateActiveEdges() {
    const indices = entities.map((e, idx) => e.isNode ? idx : -1).filter(i => i !== -1);
    const toRemove = new Set(activeEdges.keys());

    for (let a = 0; a < indices.length; a++) {
        for (let b = a + 1; b < indices.length; b++) {
            const i = indices[a];
            const j = indices[b];
            const key = edgeKey(i, j);
            const dist = entities[i].distance(entities[j]);

            if (dist < D || (activeEdges.has(key) && dist < D + DELTA)) {
                if (!activeEdges.has(key)) {
                    activeEdges.set(key, { i, j, alpha: 0 });
                }
                toRemove.delete(key);
            }
        }
    }

    for (const key of toRemove) {
        activeEdges.delete(key);
    }
}

function drawEdgesBetweenNodes() {
    updateActiveEdges();

    for (const [, edge] of activeEdges) {
        const a = entities[edge.i];
        const b = entities[edge.j];
        const dist = a.distance(b);

        edge.alpha = Math.min(1, edge.alpha + 0.03);

        const inFadeOut = dist >= D + DELTA - 30;
        const fadeAlpha = inFadeOut
            ? edge.alpha * Math.max(0, (D + DELTA - dist) / 30)
            : edge.alpha * Math.min(1, dist < D ? 1 : (D + DELTA - dist) / DELTA * 0.5);

        ctx.save();
        ctx.globalAlpha = fadeAlpha;
        ctx.strokeStyle = a.color;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(a.position.x, a.position.y);
        ctx.lineTo(b.position.x, b.position.y);
        ctx.stroke();
        ctx.restore();
    }
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawEdgesBetweenNodes();

    for (let entity of entities) {
        applyMouseRepulsion(entity);
        entity.update(entities);
        entity.draw();
    }

    requestAnimationFrame(animate);
}

animate();

let hasScrolled = false;
window.addEventListener('scroll', function () {
    if (!hasScrolled && window.scrollY > 100) {
        hasScrolled = true;
        window.scrollTo({
            top: window.innerHeight,
            behavior: "smooth"
        });
    }
    if (window.scrollY < 100) {
        hasScrolled = false;
    }
});
