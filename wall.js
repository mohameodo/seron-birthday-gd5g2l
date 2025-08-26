document.addEventListener('DOMContentLoaded', () => {
    const wall = document.getElementById('birthday-wall');
    const searchBar = document.getElementById('search-bar');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const loadingSpinner = document.getElementById('loading-spinner');

    // Mock data to simulate Firestore collection
    const mockBirthdays = [
        { name: 'Alice', date: '2000-08-15', note: 'Can\'t wait!', isForFriend: false },
        { name: 'Bob (Friend)', date: '1995-07-25', note: 'Party time!', isForFriend: true },
        { name: 'Charlie', date: new Date().toISOString().slice(0, 10), note: 'It\'s today!', isForFriend: false },
        { name: 'Diana', date: '1988-09-01', note: 'Another year older.', isForFriend: false },
        { name: 'Edward (Friend)', date: '2002-12-24', note: 'Christmas baby!', isForFriend: true },
        { name: 'Fiona', date: '1999-07-28', note: '', isForFriend: false },
    ];

    let currentFilter = 'upcoming';
    let searchQuery = '';
    let countdownIntervals = [];

    function getNextBirthday(dateStr) {
        const today = new Date();
        const birthDate = new Date(dateStr + 'T00:00:00');
        let nextBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
        if (today.getTime() > nextBirthday.getTime()) {
            nextBirthday.setFullYear(today.getFullYear() + 1);
        }
        return nextBirthday;
    }

    function renderWall() {
        wall.innerHTML = '';
        loadingSpinner.classList.remove('hidden');
        countdownIntervals.forEach(clearInterval);
        countdownIntervals = [];

        // Simulate fetch delay
        setTimeout(() => {
            const processedData = mockBirthdays.map(b => ({
                ...b,
                nextOccurrence: getNextBirthday(b.date)
            })).sort((a, b) => a.nextOccurrence - b.nextOccurrence);

            let filteredData = processedData;

            if (searchQuery) {
                filteredData = filteredData.filter(b => b.name.toLowerCase().includes(searchQuery.toLowerCase()));
            }

            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (currentFilter === 'upcoming') {
                filteredData = filteredData.filter(b => b.nextOccurrence.getTime() >= today.getTime());
            } else if (currentFilter === 'today') {
                filteredData = filteredData.filter(b => b.nextOccurrence.toDateString() === today.toDateString());
            }

            wall.innerHTML = '';
            if (filteredData.length === 0) {
                wall.innerHTML = `<p class="col-span-full text-center text-gray-500">No birthdays found for this filter.</p>`;
            } else {
                 filteredData.forEach(b => {
                    const card = createBirthdayCard(b);
                    wall.appendChild(card);
                });
            }
            loadingSpinner.classList.add('hidden');
        }, 500);
    }

    function createBirthdayCard(birthday) {
        const card = document.createElement('a');
        const params = new URLSearchParams({
            name: encodeURIComponent(birthday.name),
            date: birthday.date,
            note: encodeURIComponent(birthday.note),
            isForFriend: birthday.isForFriend
        });
        card.href = `birthday.html?${params.toString()}`;
        card.className = 'bg-white p-4 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-1 transition-all transform flex flex-col justify-between';
        
        let cardHTML = `
            <div>
                <h3 class="font-bold text-lg text-pink-500 truncate">${birthday.name} ${birthday.isForFriend ? '<i class="fas fa-star text-yellow-400 text-xs"></i>' : ''}</h3>
                <p class="text-gray-500 text-sm italic truncate h-6">${birthday.note ? `"${birthday.note}"` : ''}</p>
            </div>
            <div id="countdown-${birthday.name.replace(/\s/g, '')}" class="text-center text-gray-700 mt-2 font-mono text-sm"></div>
        `;
        card.innerHTML = cardHTML;

        const countdownEl = card.querySelector(`#countdown-${birthday.name.replace(/\s/g, '')}`);
        const interval = setInterval(() => {
            const now = new Date().getTime();
            const distance = birthday.nextOccurrence - now;

            if (distance <= 0) {
                const timeSince = now - birthday.nextOccurrence;
                 if (timeSince < 24 * 60 * 60 * 1000) {
                    countdownEl.innerHTML = `<span class="font-bold text-pink-500">Happy Birthday!</span>`;
                 } else {
                    countdownEl.textContent = `Birthday has passed.`;
                 }
                clearInterval(interval);
                return;
            }

            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            countdownEl.textContent = `${days}d ${hours}h left`;
        }, 1000 * 60); // Update every minute is enough for the wall
        
        // Initial call
        const now = new Date().getTime();
        const distance = birthday.nextOccurrence - now;
        if (distance > 0) {
            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            countdownEl.textContent = `${days}d ${hours}h left`;
        } else {
            countdownEl.innerHTML = `<span class="font-bold text-pink-500">Happy Birthday!</span>`;
        }

        countdownIntervals.push(interval);

        return card;
    }

    searchBar.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        renderWall();
    });

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active-filter'));
            btn.classList.add('active-filter');
            currentFilter = btn.dataset.filter;
            renderWall();
        });
    });

    // Initial render
    renderWall();
});
