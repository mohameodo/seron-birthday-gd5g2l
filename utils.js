function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');

    const colors = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        info: 'bg-blue-500'
    };
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        info: 'fa-info-circle'
    }

    toast.className = `flex items-center text-white p-4 rounded-lg shadow-lg transform transition-all duration-300 translate-x-full opacity-0`;
    toast.classList.add(colors[type]);
    toast.innerHTML = `<i class="fas ${icons[type]} mr-3"></i><p>${message}</p>`;

    container.appendChild(toast);

    // Animate in
    setTimeout(() => {
        toast.classList.remove('translate-x-full', 'opacity-0');
    }, 100);

    // Animate out
    setTimeout(() => {
        toast.classList.add('translate-x-full', 'opacity-0');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function startAnimations() {
    setInterval(createBalloon, 3000);
    setInterval(createConfettiBurst, 2000);
}

function createBalloon() {
    const animationContainer = document.getElementById('animation-container');
    const balloon = document.createElement('div');
    balloon.className = 'balloon';

    const colors = ['rgba(255,99,132,0.7)', 'rgba(54,162,235,0.7)', 'rgba(255,206,86,0.7)', 'rgba(75,192,192,0.7)'];
    balloon.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    balloon.style.left = `${Math.random() * 100}vw`;
    balloon.style.animationDuration = `${Math.random() * 5 + 8}s`; // Rise duration

    animationContainer.appendChild(balloon);
    setTimeout(() => balloon.remove(), 13000); 
}

function createConfettiBurst(x = Math.random() * window.innerWidth, y = Math.random() * window.innerHeight) {
    const animationContainer = document.getElementById('animation-container');
    for (let i = 0; i < 15; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = `${x}px`;
        confetti.style.top = `${y}px`;

        const colors = ['#f94144', '#f3722c', '#f8961e', '#f9c74f', '#90be6d', '#43aa8b', '#577590'];
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];

        const angle = Math.random() * 2 * Math.PI;
        const distance = Math.random() * 100 + 50;
        confetti.style.setProperty('--x-end', `${Math.cos(angle) * distance}px`);
        confetti.style.setProperty('--y-end', `${Math.sin(angle) * distance}px`);

        animationContainer.appendChild(confetti);
        setTimeout(() => confetti.remove(), 1500);
    }
}

function celebrate(isFullCelebration = false) {
    if (isFullCelebration) {
        // Big bursts all over the screen
        for (let i=0; i<10; i++) {
            setTimeout(() => createConfettiBurst(), i * 200);
        }
    }
}

function startSparkles() {
    const container = document.getElementById('sparkle-container');
    if (!container) return;
    setInterval(() => {
        const sparkle = document.createElement('div');
        sparkle.className = 'sparkle';
        sparkle.style.top = `${Math.random() * 100}%`;
        sparkle.style.left = `${Math.random() * 100}%`;
        sparkle.style.animationDelay = `${Math.random() * 0.5}s`;
        container.appendChild(sparkle);
        setTimeout(() => sparkle.remove(), 800);
    }, 400);
}
