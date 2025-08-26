document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const name = decodeURIComponent(params.get('name'));
    const dateString = params.get('date');
    const note = decodeURIComponent(params.get('note'));
    const isForFriend = params.get('isForFriend') === 'true';

    const titleEl = document.getElementById('title');
    const noteEl = document.getElementById('note');
    const countdownDisplayEl = document.getElementById('countdown-display');
    const celebrationMessageEl = document.getElementById('celebration-message');
    const postBirthdayMessageEl = document.getElementById('post-birthday-message');
    const shareBtn = document.getElementById('share-btn');
    const animationContainer = document.getElementById('animation-container');

    if (!name || !dateString) {
        titleEl.textContent = 'Oops! Invalid data.';
        noteEl.textContent = 'Please go back and fill out the form correctly.';
        return;
    }

    titleEl.textContent = isForFriend ? `${name}'s Birthday Countdown` : `My Birthday Countdown`;
    noteEl.textContent = note ? `"${note}"` : '';

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (isForFriend && !prefersReducedMotion) {
        startSparkles();
    }

    function getNextBirthday(dateStr) {
        const today = new Date();
        const birthDate = new Date(dateStr + 'T00:00:00'); // Use local timezone
        
        let nextBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
        
        if (today > nextBirthday) {
            nextBirthday.setFullYear(today.getFullYear() + 1);
        }
        return nextBirthday;
    }

    const targetDate = getNextBirthday(dateString);

    const countdownInterval = setInterval(() => {
        const now = new Date().getTime();
        const distance = targetDate - now;

        if (distance <= 0) {
            const timeSince = now - targetDate;
            if (timeSince < 24 * 60 * 60 * 1000) { // It's birthday day!
                clearInterval(countdownInterval);
                countdownDisplayEl.classList.add('hidden');
                celebrationMessageEl.classList.remove('hidden');
                if (!prefersReducedMotion) {
                    startCelebration();
                }
            } else { // Birthday has passed
                clearInterval(countdownInterval);
                countdownDisplayEl.classList.add('hidden');
                postBirthdayMessageEl.classList.remove('hidden');
                const daysSince = Math.floor(timeSince / (1000 * 60 * 60 * 24));
                postBirthdayMessageEl.textContent = `${daysSince} day${daysSince === 1 ? '' : 's'} have passed since the birthday.`;
            }
            return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        updateCountdownDisplay({ days, hours, minutes, seconds });

    }, 1000);

    let lastState = {};
    function updateCountdownDisplay(time) {
        const units = ['days', 'hours', 'minutes', 'seconds'];
        let html = '';
        units.forEach(unit => {
            const value = time[unit].toString().padStart(2, '0');
            const lastValue = lastState[unit] || '';
            let digitsHtml = '';
            for(let i = 0; i < value.length; i++){
                const digit = value[i];
                const lastDigit = lastValue[i] || '';
                const animationClass = digit !== lastDigit ? 'countdown-digit' : '';
                digitsHtml += `<span class="${animationClass}">${digit}</span>`;
            }
            html += `
                <div class="flex flex-col items-center">
                    <div class="text-4xl md:text-7xl font-bold tracking-wider">${digitsHtml}</div>
                    <div class="text-sm md:text-base uppercase text-gray-500">${unit}</div>
                </div>
            `;
        });
        countdownDisplayEl.innerHTML = html;
        lastState = time;
    }

    shareBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(window.location.href).then(() => {
            showToast('Link copied to clipboard!');
        }, () => {
            showToast('Failed to copy link.', 'error');
        });
    });

    function startCelebration() {
        for (let i = 0; i < 30; i++) createBalloon();
        for (let i = 0; i < 100; i++) createConfetti();
    }

    function createBalloon() {
        const balloon = document.createElement('div');
        balloon.className = 'balloon';
        const colors = ['#ff69b4', '#1e90ff', '#32cd32', '#ffdf00', '#ff4500'];
        balloon.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        balloon.style.left = `${Math.random() * 100}vw`;
        balloon.style.animationDuration = `${Math.random() * 5 + 8}s`;
        balloon.style.setProperty('--sway', `${(Math.random() - 0.5) * 200}px`);
        animationContainer.appendChild(balloon);
        setTimeout(() => balloon.remove(), 13000);
    }

    function createConfetti() {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        const colors = ['#ff69b4', '#1e90ff', '#32cd32', '#ffdf00', '#ff4500'];
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.left = `${Math.random() * 100}vw`;
        confetti.style.animationDelay = `${Math.random() * 3}s`;
        animationContainer.appendChild(confetti);
        setTimeout(() => confetti.remove(), 4000);
    }
    
    function startSparkles() {
        setInterval(() => {
            const sparkle = document.createElement('div');
            sparkle.className = 'sparkle';
            sparkle.style.top = `${Math.random() * 100}%`;
            sparkle.style.left = `${Math.random() * 100}%`;
            animationContainer.appendChild(sparkle);
            setTimeout(() => sparkle.remove(), 1000);
        }, 300);
    }
});

function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}
