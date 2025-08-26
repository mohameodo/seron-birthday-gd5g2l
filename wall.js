import { db } from './firebase-config.js';
import { collection, getDocs, query, orderBy, where, Timestamp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

const grid = document.getElementById('birthday-grid');
const loader = document.getElementById('loader');
const noResults = document.getElementById('no-results');
const searchInput = document.getElementById('search-input');
const filterBtns = document.querySelectorAll('.filter-btn');

let allBirthdays = [];

function getNextBirthday(dateString) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const birthDate = new Date(dateString + 'T00:00:00');
    
    let nextBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
    if (nextBirthday < today) {
        nextBirthday.setFullYear(today.getFullYear() + 1);
    }
    return nextBirthday;
}

function renderBirthdays(birthdaysToRender) {
    grid.innerHTML = ''; // Clear existing content
    if (birthdaysToRender.length === 0) {
        noResults.classList.remove('hidden');
        return;
    }
    noResults.classList.add('hidden');

    birthdaysToRender.forEach(bday => {
        const card = document.createElement('a');
        card.href = `/countdown.html?id=${bday.id}`;
        card.className = 'bg-white/80 backdrop-blur-lg border border-pink-200 rounded-2xl p-5 shadow-md hover:shadow-xl hover:-translate-y-1 transform transition-all duration-300 flex flex-col';
        
        const typeIcon = bday.isForFriend ? '✨' : '🎉';
        const typeText = bday.isForFriend ? "Friend's Birthday" : "My Birthday";
        
        const diffTime = getNextBirthday(bday.date) - new Date();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        let countdownText = `${diffDays} days away`;
        if (diffDays === 1) countdownText = `1 day away`;
        if (diffDays === 0) countdownText = `It's Today!`;
        if (diffDays < 0) countdownText = `Passed`;

        card.innerHTML = `
            <div class="flex-grow">
                <p class="text-xs text-pink-500 font-semibold">${typeText} ${typeIcon}</p>
                <h3 class="text-2xl font-bold text-gray-800 font-fredoka truncate">${bday.name}</h3>
                <p class="text-gray-500 text-sm h-10 overflow-hidden">${bday.note || 'No note added.'}</p>
            </div>
            <div class="mt-4 pt-4 border-t border-pink-100 text-center">
                <p class="text-lg font-semibold text-pink-600">${countdownText}</p>
            </div>
        `;
        grid.appendChild(card);
    });
}

async function fetchBirthdays() {
    try {
        const q = query(collection(db, 'birthdays'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        
        allBirthdays = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        allBirthdays.sort((a, b) => getNextBirthday(a.date) - getNextBirthday(b.date));

        filterAndRender();
    } catch (error) {
        console.error("Error fetching birthdays: ", error);
        grid.innerHTML = `<p class="col-span-full text-center text-red-500">Could not load birthdays. Please try again later.</p>`;
    } finally {
        loader.classList.add('hidden');
    }
}

function filterAndRender() {
    const searchTerm = searchInput.value.toLowerCase();
    const activeFilter = document.querySelector('.active-filter').dataset.filter;

    let filtered = allBirthdays.filter(bday => bday.name.toLowerCase().includes(searchTerm));

    if (activeFilter === 'today') {
        const today = new Date();
        today.setHours(0,0,0,0);
        filtered = filtered.filter(bday => {
            const nextBday = getNextBirthday(bday.date);
            return nextBday.getTime() === today.getTime();
        });
    } else if (activeFilter === 'upcoming') {
         const today = new Date();
         today.setHours(0,0,0,0);
         filtered = filtered.filter(bday => getNextBirthday(bday.date) >= today);
    }

    renderBirthdays(filtered);
}

// Event Listeners
searchInput.addEventListener('input', filterAndRender);

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active-filter'));
        btn.classList.add('active-filter');
        filterAndRender();
    });
});

// Initial fetch
fetchBirthdays();