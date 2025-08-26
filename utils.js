// UTILS.JS
// Contains shared utility functions

// --- Toast Notifications ---
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);

    // Animate in
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);

    // Animate out and remove
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            container.removeChild(toast);
        }, 500);
    }, 3000);
}

// --- Animation Controls ---
const animationContainer = document.getElementById('animation-container');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function startCelebration(intensity = 50) {
    if (prefersReducedMotion || !animationContainer) return;

    // Clear previous animations
    animationContainer.innerHTML = '';

    // Add balloons
    for (let i = 0; i < intensity / 5; i++) {
        createBalloon();
    }

    // Add confetti
    for (let i = 0; i < intensity; i++) {
        createConfetti();
    }
}

function createBalloon() {
    const balloon = document.createElement('div');
    balloon.className = 'balloon';
    const colors = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'];
    balloon.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    balloon.style.left = `${Math.random() * 100}vw`;
    balloon.style.animationDuration = `${Math.random() * 5 + 8}s`; // 8-13 seconds
    animationContainer.appendChild(balloon);
}

function createConfetti() {
    const confetti = document.createElement('div');
    confetti.className = 'confetti';
    const colors = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'];
    confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.left = `${Math.random() * 100}vw`;
    confetti.style.animationDelay = `${Math.random() * 5}s`;
    confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
    animationContainer.appendChild(confetti);
}

// Add a class to the timer box for a pop animation
const style = document.createElement('style');
style.innerHTML = `
    .animate-pop {
        animation: pop 0.3s ease-out;
    }
    @keyframes pop {
        0% { transform: scale(1); }
        50% { transform: scale(1.1); }
        100% { transform: scale(1); }
    }
`;
document.head.appendChild(style);