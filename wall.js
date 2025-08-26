document.addEventListener('DOMContentLoaded', () => {
    const wall = document.getElementById('birthday-wall');
    const searchBar = document.getElementById('search-bar');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const noResults = document.getElementById('no-results');
    let activeFilter = 'upcoming';

    const mockBirthdays = [
        { name: 'Alex', date: '2024-09-15', note: 'Almost there!', isForFriend: false },
        { name: 'Brenda', date: new Date().toISOString().slice(0, 10), note: "It's today!", isForFriend: true },
        { name: 'Charlie', date: '2025-01-01', note: 'New Year baby!', isForFriend: false },
        { name: 'Diana', date: '2023-05-20', note: 'Hope it was great!', isForFriend: true },
        { name: 'Edward', date: '2024-11-25', note: 'Getting closer!', isForFriend: false },
        { name: 'Fiona', date: '2024-12-25', note: 'A festive birthday!', isForFriend: true },
    ].map(b => {
        const today = new Date();
        const birthDate = new Date(b.date + 'T00:00:00');
        let nextOccurrence = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
        if (today > nextOccurrence) {
            nextOccurrence.setFullYear(today.getFullYear() + 1);
        }
        return { ...b, nextOccurrence };
    }).sort((a, b) => a.nextOccurrence - b.nextOccurrence);

    function renderWall(filter = '', query = '') {
        wall.innerHTML = '';
        query = query.toLowerCase();
        let resultsFound = false;

        const filteredBirthdays = mockBirthdays.filter(b => {
            const nameMatch = b.name.toLowerCase().includes(query);
            if (!nameMatch) return false;

            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const birthDate = new Date(b.date + 'T00:00:00');
            const isBirthdayToday = today.getDate() === birthDate.getDate() && today.getMonth() === birthDate.getMonth();

            switch (filter) {
                case 'today':
                    return isBirthdayToday;
                case 'upcoming':
                    return b.nextOccurrence >= today && !isBirthdayToday;
                case 'all':
                default:
                    return true;
            }
        });

        if (filteredBirthdays.length > 0) {
            resultsFound = true;
            noResults.classList.add('hidden');
        } else {
            noResults.classList.remove('hidden');
        }

        filteredBirthdays.forEach(b => {
            const card = createBirthdayCard(b);
            wall.appendChild(card);
        });
    }

    function createBirthdayCard(birthday) {
        const card = document.createElement('a');
        const params = new URLSearchParams({ name: birthday.name, date: birthday.date, note: birthday.note, friend: birthday.isForFriend });
        card.href = `countdown.html?${params.toString()}`;
        card.className = 'bg-white p-5 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-1 transition-all transform group';

        const icon = birthday.isForFriend 
            ? `<i class="fas fa-gift text-pink-400"></i> For a friend`
            : `<i class="fas fa-birthday-cake text-blue-400"></i> My birthday`;

        card.innerHTML = `
            <div class="flex justify-between items-start">
                <h3 class="text-xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors">${birthday.name}</h3>
                ${birthday.isForFriend ? '<i class="fas fa-star text-yellow-400 text-xs animate-pulse"></i>' : ''}
            </div>
            <p class="text-xs text-gray-500 mb-2">${icon}</p>
            <p class="text-gray-600 text-sm mb-4 italic truncate">"${birthday.note}"</p>
            <div class="text-center text-xs font-semibold uppercase text-gray-400" data-date="${birthday.date}">Loading...</div>
        `;
        return card;
    }

    function updateCardCountdowns() {
        const countdownElements = wall.querySelectorAll('[data-date]');
        countdownElements.forEach(el => {
            const date = el.dataset.date;
            const today = new Date();
            const birthDate = new Date(date + 'T00:00:00');
            let nextBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
            if(today > nextBirthday) nextBirthday.setFullYear(today.getFullYear() + 1);

            const timeRemaining = nextBirthday - today;
            const isToday = today.getDate() === birthDate.getDate() && today.getMonth() === birthDate.getMonth();

            if (isToday) {
                 el.innerHTML = `<span class="text-green-500 font-bold">Happy Birthday!</span>`;
            } else if (timeRemaining < 0) {
                const daysSince = Math.floor(Math.abs(timeRemaining) / (1000 * 60 * 60 * 24));
                el.textContent = `${daysSince} days ago`;
            } else {
                const days = Math.ceil(timeRemaining / (1000 * 60 * 60 * 24));
                el.innerHTML = `in <span class="text-blue-500 font-bold">${days}</span> day${days > 1 ? 's' : ''}`;
            }
        });
    }

    searchBar.addEventListener('input', (e) => {
        renderWall(activeFilter, e.target.value);
        updateCardCountdowns();
    });

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            activeFilter = btn.dataset.filter;
            filterBtns.forEach(b => {
                b.classList.remove('bg-blue-500', 'text-white');
                b.classList.add('text-gray-600', 'hover:bg-gray-100');
            });
            btn.classList.add('bg-blue-500', 'text-white');
            btn.classList.remove('text-gray-600', 'hover:bg-gray-100');
            renderWall(activeFilter, searchBar.value);
            updateCardCountdowns();
        });
    });

    // Initial render
    renderWall(activeFilter);
    setInterval(updateCardCountdowns, 60000); // Update every minute
    updateCardCountdowns();
});
