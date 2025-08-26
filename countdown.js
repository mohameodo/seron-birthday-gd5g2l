import { db } from './firebase-config.js';
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";
import { launchConfetti } from './animations.js';
import { showToast } from './utils.js';

const countdownContainer = document.getElementById('countdown-container');
const notFoundContainer = document.getElementById('not-found');
const birthdayNameEl = document.getElementById('birthday-name');
const birthdayNameCelebrateEl = document.getElementById('birthday-name-celebrate');
const noteEl = document.getElementById('countdown-note');
const timerEl = document.getElementById('timer');

let countdownInterval;

function updateMetaTags(name, note) {
    const url = window.location.href;
    const title = `It's almost ${name}'s birthday!`;
    const description = note || `Join the celebration and watch the countdown live!`;

    document.title = title;
    document.querySelector('meta[property="og:title"]').setAttribute('content', title);
    document.querySelector('meta[property="og:description"]').setAttribute('content', description);
    document.querySelector('meta[property="og:url"]').setAttribute('content', url);

    // Setup share links
    const encodedText = encodeURIComponent(`${title} Check it out here: ${url}`);
    document.getElementById('twitter-share').href = `https://twitter.com/intent/tweet?text=${encodedText}`;
    document.getElementById('whatsapp-share').href = `https://api.whatsapp.com/send?text=${encodedText}`;

    document.getElementById('copy-link-btn').addEventListener('click', () => {
        navigator.clipboard.writeText(url).then(() => {
            showToast('Link copied to clipboard!', 'success');
        }).catch(err => {
            showToast('Failed to copy link.', 'error');
        });
    });
}

function startCountdown(birthdayDateString, name) {
    const birthday = new Date(birthdayDateString + 'T00:00:00');

    countdownInterval = setInterval(() => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        let nextBirthday = new Date(now.getFullYear(), birthday.getMonth(), birthday.getDate());
        if (nextBirthday < now) {
            nextBirthday.setFullYear(now.getFullYear() + 1);
        }

        const isToday = today.getTime() === new Date(nextBirthday.getFullYear(), nextBirthday.getMonth(), nextBirthday.getDate()).getTime();

        if (isToday && now.getTime() >= nextBirthday.getTime()) {
            document.getElementById('countdown-active').classList.add('hidden');
            document.getElementById('celebration-message').classList.remove('hidden');
            birthdayNameCelebrateEl.textContent = name;
            launchConfetti();
            setInterval(launchConfetti, 5000); // More confetti!
            clearInterval(countdownInterval);
            return;
        }

        const totalSeconds = (nextBirthday - now) / 1000;

        const days = Math.floor(totalSeconds / 3600 / 24);
        const hours = Math.floor(totalSeconds / 3600) % 24;
        const minutes = Math.floor(totalSeconds / 60) % 60;
        const seconds = Math.floor(totalSeconds) % 60;

        timerEl.innerHTML = `
            <div class="bg-pink-100/50 p-4 rounded-2xl"><div class="text-4xl md:text-6xl font-bold font-fredoka">${days}</div><div class="text-sm text-gray-500">Days</div></div>
            <div class="bg-pink-100/50 p-4 rounded-2xl"><div class="text-4xl md:text-6xl font-bold font-fredoka">${hours}</div><div class="text-sm text-gray-500">Hours</div></div>
            <div class="bg-pink-100/50 p-4 rounded-2xl"><div class="text-4xl md:text-6xl font-bold font-fredoka">${minutes}</div><div class="text-sm text-gray-500">Minutes</div></div>
            <div class="bg-pink-100/50 p-4 rounded-2xl"><div class="text-4xl md:text-6xl font-bold font-fredoka">${seconds}</div><div class="text-sm text-gray-500">Seconds</div></div>
        `;

    }, 1000);
}

async function loadBirthday() {
    const urlParams = new URLSearchParams(window.location.search);
    const birthdayId = urlParams.get('id');

    if (!birthdayId) {
        notFoundContainer.classList.remove('hidden');
        return;
    }

    try {
        const docRef = doc(db, 'birthdays', birthdayId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            birthdayNameEl.textContent = data.name;
            noteEl.textContent = data.note || 'Get ready to celebrate!';
            
            updateMetaTags(data.name, data.note);
            startCountdown(data.date, data.name);

            countdownContainer.classList.add('opacity-100', 'translate-y-0');

        } else {
            notFoundContainer.classList.remove('hidden');
        }
    } catch (error) {
        console.error("Error fetching birthday: ", error);
        notFoundContainer.classList.remove('hidden');
        showToast('Could not load birthday data.', 'error');
    }
}

// Clear any previous interval on page load
clearInterval(countdownInterval);
loadBirthday();