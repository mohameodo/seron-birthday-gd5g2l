import { db } from './firebase-config.js';
import { collection, query, onSnapshot, orderBy, where, Timestamp } from 'https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js';

const wallContainer = document.getElementById('wall-container');
const searchBar = document.getElementById('search-bar');
const filterTabs = document.getElementById('filter-tabs');
const noResults = document.getElementById('no-results');
let countdownIntervals = {};
let allBirthdays = [];
let currentFilter = 'upcoming';
let searchQuery = '';

document.addEventListener('DOMContentLoaded', () => {
    fetchAndRenderBirthdays();

    searchBar.addEventListener('input', (e) => {
        searchQuery = e.target.value.toLowerCase();
        renderFilteredBirthdays();
    });

    filterTabs.addEventListener('click', (e) => {
        if (e.target.classList.contains('filter-tab')) {
            filterTabs.querySelector('.active').classList.remove('active');
            e.target.classList.add('active');
            currentFilter = e.target.dataset.filter;
            renderFilteredBirthdays();
        }
    });
});

function fetchAndRenderBirthdays() {
    const q = query(collection(db, 'birthdays'), orderBy('createdAt', 'desc'));

    onSnapshot(q, (snapshot) => {
        wallContainer.innerHTML = ''; // Clear existing content
        Object.values(countdownIntervals).forEach(clearInterval);
        countdownIntervals = {};

        allBirthdays = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        renderFilteredBirthdays();
    }, (error) => {
        console.error("Error fetching birthdays: ", error);
        wallContainer.innerHTML = '<p class="text-red-500 col-span-full text-center">Could not load birthdays.</p>';
    });
}

function renderFilteredBirthdays() {
    const now = new Date();
    let filtered = allBirthdays;

    // Apply filter
    if (currentFilter === 'upcoming') {
        filtered = allBirthdays.filter(b => getNextBirthday(b.date) > now);
    } else if (currentFilter === 'today') {
        filtered = allBirthdays.filter(b => {
            const nextBday = getNextBirthday(b.date);
            return nextBday.getDate() === now.getDate() &&
                   nextBday.getMonth() === now.getMonth();
        });
    }
    
    // Sort by next occurrence
    filtered.sort((a, b) => getNextBirthday(a.date) - getNextBirthday(b.date));

    // Apply search
    if (searchQuery) {
        filtered = filtered.filter(b => b.name.toLowerCase().includes(searchQuery));
    }

    wallContainer.innerHTML = '';
    if (filtered.length === 0) {
        noResults.classList.remove('hidden');
    } else {
        noResults.classList.add('hidden');
        filtered.forEach(createBirthdayCard);
    }
}

function createBirthdayCard(birthday) {
    const card = document.createElement('div');
    card.className = `glass-card p-6 flex flex-col justify-between transition-all duration-300 ${birthday.isForFriend ? 'sparkle' : ''}`;
    card.innerHTML = `
        <div>
            <h3 class="text-2xl font-bold text-pink-500 truncate">${birthday.name}</h3>
            <p class="text-gray-500 text-sm mb-4 truncate">${birthday.note || 'A special day is coming!'}</p>
        </div>
        <div>
            <div id="timer-${birthday.id}" class="text-center text-lg font-bold text-gray-700 mb-4">Loading...</div>
            <a href="countdown.html?id=${birthday.id}" class="block w-full text-center bg-pink-400 text-white font-bold py-2 px-4 rounded-full hover:bg-pink-500 transition-colors">View Countdown</a>
        </div>
    `;
    wallContainer.appendChild(card);
    startCardCountdown(birthday.id, birthday.date);
}

function startCardCountdown(id, dateString) {
    const timerElement = document.getElementById(`timer-${id}`);
    if (!timerElement) return;

    countdownIntervals[id] = setInterval(() => {
        const nextBirthday = getNextBirthday(dateString);
        const now = new Date().getTime();
        const distance = nextBirthday - now;

        if (distance < 0) {
            const daysSince = Math.floor(Math.abs(distance) / (1000 * 60 * 60 * 24));
            timerElement.innerHTML = `<span class="text-gray-500">${daysSince} days ago</span>`;
            if (daysSince === 0) timerElement.innerHTML = `<span class="text-green-500 font-extrabold">It's Today! 🎉</span>`;
        } else {
            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            timerElement.innerHTML = `<span class="text-pink-600">${days}d ${hours}h left</span>`;
        }
    }, 1000);
}

function getNextBirthday(dateString) {
    const today = new Date();
    const birthDate = new Date(dateString + 'T00:00:00'); // Use T00:00:00 to avoid timezone issues
    
    let nextBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());

    if (nextBirthday < today) {
        nextBirthday.setFullYear(today.getFullYear() + 1);
    }

    return nextBirthday;
}