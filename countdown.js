import { db } from './firebase-config.js';
import { doc, getDoc } from 'https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js';
import { startConfetti, stopConfetti, removeConfetti, launchConfetti } from './effects.js';

let countdownInterval;

document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const birthdayId = params.get('id');

    if (birthdayId) {
        loadBirthday(birthdayId);
    } else {
        displayError('No birthday specified.');
    }

    document.getElementById('share-btn').addEventListener('click', shareCountdown);
});

async function loadBirthday(id) {
    try {
        const docRef = doc(db, 'birthdays', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const birthday = docSnap.data();
            displayCountdown(birthday);
        } else {
            displayError('This birthday countdown does not exist.');
        }
    } catch (error) {
        console.error("Error fetching document: ", error);
        displayError('Could not load the countdown.');
    }
}

function displayCountdown(birthday) {
    const loadingState = document.getElementById('loading-state');
    const content = document.getElementById('countdown-content');
    const cardContainer = document.getElementById('countdown-card-container');

    loadingState.classList.add('hidden');
    content.classList.remove('hidden');
    cardContainer.classList.add('opacity-100', 'translate-y-0');

    const title = document.getElementById('countdown-title');
    const note = document.getElementById('countdown-note');
    
    title.textContent = `${birthday.name}'s Birthday Countdown`;
    note.textContent = birthday.note || 'Get ready to celebrate!';

    if (birthday.isForFriend) {
        setInterval(() => createBalloon(), 2000);
    }

    startTimer(birthday.date);
}

function startTimer(dateString) {
    const timerElements = {
        days: document.getElementById('days'),
        hours: document.getElementById('hours'),
        minutes: document.getElementById('minutes'),
        seconds: document.getElementById('seconds')
    };
    const timerContainer = document.getElementById('timer');
    const celebrationMsg = document.getElementById('celebration-message');
    const postCelebrationMsg = document.getElementById('post-celebration-message');

    countdownInterval = setInterval(() => {
        const nextBirthday = getNextBirthday(dateString);
        const now = new Date().getTime();
        const distance = nextBirthday - now;

        if (distance <= 0) {
            // Birthday is today or past
            const timeSince = Math.abs(distance);
            const daysSince = Math.floor(timeSince / (1000 * 60 * 60 * 24));

            if (nextBirthday.getDate() === new Date().getDate() && nextBirthday.getMonth() === new Date().getMonth()) {
                // It's today!
                clearInterval(countdownInterval);
                timerContainer.classList.add('hidden');
                celebrationMsg.classList.remove('hidden');
                startConfetti();
                setTimeout(stopConfetti, 5000);
            } else {
                // It has passed
                clearInterval(countdownInterval);
                timerContainer.classList.add('hidden');
                postCelebrationMsg.classList.remove('hidden');
                postCelebrationMsg.textContent = `${birthday.name}'s birthday was ${daysSince} day${daysSince === 1 ? '' : 's'} ago!`;
            }
        } else {
            // Countdown running
            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            updateTimerElement(timerElements.days, days);
            updateTimerElement(timerElements.hours, hours);
            updateTimerElement(timerElements.minutes, minutes);
            updateTimerElement(timerElements.seconds, seconds);

            if (Math.random() > 0.98) launchConfetti();
        }
    }, 1000);
}

function updateTimerElement(element, value) {
    const formattedValue = String(value).padStart(2, '0');
    if (element.textContent !== formattedValue) {
        element.parentElement.classList.add('animate-pop');
        element.textContent = formattedValue;
        setTimeout(() => element.parentElement.classList.remove('animate-pop'), 300);
    }
}

function getNextBirthday(dateString) {
    const today = new Date();
    const birthDate = new Date(dateString + 'T00:00:00');
    let nextBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
    if (nextBirthday < today) {
        nextBirthday.setFullYear(today.getFullYear() + 1);
    }
    return nextBirthday;
}

function displayError(message) {
    const content = document.getElementById('countdown-content');
    content.innerHTML = `<p class="text-red-500 text-2xl font-bold">${message}</p><a href="/" class="back-button mt-4 inline-block">Go Home</a>`;
    document.getElementById('loading-state').classList.add('hidden');
    content.classList.remove('hidden');
}

function shareCountdown() {
    navigator.clipboard.writeText(window.location.href).then(() => {
        showToast('Link copied to clipboard!', 'success');
    }, () => {
        showToast('Could not copy link.', 'error');
    });
}

function createBalloon() {
    const balloonContainer = document.getElementById('balloon-container');
    const balloon = document.createElement('div');
    balloon.className = 'balloon';
    const colors = ['#ff7e7e', '#ffc17e', '#fffa7e', '#a0ff7e', '#7effd3', '#7ec8ff', '#a87eff'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    balloon.style.backgroundColor = color;
    balloon.style.left = `${Math.random() * 100}vw`;
    const animationDuration = Math.random() * 5 + 8; // 8-13 seconds
    balloon.style.animationDuration = `${animationDuration}s`;
    balloon.style.animationTimingFunction = 'linear';
    balloon.style.animationName = `rise-sway-${Math.ceil(Math.random() * 2)}`; // Two different sway patterns

    balloonContainer.appendChild(balloon);

    setTimeout(() => {
        balloon.remove();
    }, animationDuration * 1000);
}

// Add dynamic keyframes for balloons
const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = `
@keyframes rise-sway-1 {
    0% { transform: translateY(0) translateX(0); }
    100% { transform: translateY(-120vh) translateX(50px); }
}
@keyframes rise-sway-2 {
    0% { transform: translateY(0) translateX(0); }
    100% { transform: translateY(-120vh) translateX(-50px); }
}
@keyframes pop {
    0% { transform: scale(1); }
    50% { transform: scale(1.1); }
    100% { transform: scale(1); }
}
.animate-pop { animation: pop 0.3s ease-out; }
`;
document.head.appendChild(styleSheet);

function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    let icon = 'fa-solid fa-circle-info';
    if (type === 'success') icon = 'fa-solid fa-check-circle';
    if (type === 'error') icon = 'fa-solid fa-times-circle';
    toast.innerHTML = `<i class="${icon}"></i><span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => { toast.remove(); }, 3000);
}