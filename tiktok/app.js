function fitCanvas() {
    const canvas = document.getElementById("canvas");
    const viewport = document.getElementById("viewport");

    if (!canvas || !viewport) return;

    const viewportWidth = viewport.clientWidth;
    const viewportHeight = viewport.clientHeight;

    const scale = Math.min(
        viewportWidth / 1920,
        viewportHeight / 1080
    );

    canvas.style.left = "50%";
    canvas.style.top = "50%";
    canvas.style.transform = `translate(-50%, -50%) scale(${scale})`;
}

window.addEventListener("load", fitCanvas);
window.addEventListener("resize", fitCanvas);

function updateClock() {
    const now = new Date();

    const time = document.getElementById("time");
    const date = document.getElementById("date");

    if (time) {
        time.textContent = now.toLocaleTimeString("it-IT", {
            hour: "2-digit",
            minute: "2-digit"
        });
    }

    if (date) {
        date.textContent = now.toLocaleDateString("it-IT", {
            weekday: "long",
            day: "2-digit",
            month: "long"
        });
    }
}

updateClock();
setInterval(updateClock, 1000);

function createEqualizer() {
    const equalizer = document.getElementById("equalizer");

    if (!equalizer || equalizer.children.length > 0) return;

    for (let i = 0; i < 90; i++) {
        const bar = document.createElement("i");

        bar.style.animationDuration =
            (0.5 + Math.random()) + "s";

        bar.style.animationDelay =
            (Math.random() * 0.5) + "s";

        equalizer.appendChild(bar);
    }
}

createEqualizer();
