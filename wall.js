document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('birthdays-grid');
    const noResults = document.getElementById('no-results');
    const searchBar = document.getElementById('search-bar');
    const filterBtns = document.querySelectorAll('.filter-btn');

    let allBirthdays = [];
    let currentFilter = 'upcoming';

    const fetchBirthdays = async () => {
        try {
            const snapshot = await db.collection('birthdays').orderBy('nextOccurrence', 'asc').get();
            if (snapshot.empty) {
                grid.innerHTML = '';
                noResults.classList.remove('hidden');
                return;
            }
            allBirthdays = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            filterAndRenderBirthdays();
        } catch (error) {
            console.error("Error fetching birthdays: ", error);
            showToast('Could not load birthdays.', 'error');
            grid.innerHTML = '<p class="text-center text-red-500 col-span-full">Failed to load data.</p>';
        }
    };

    const renderBirthdays = (birthdaysToRender) => {
        grid.innerHTML = ''; // Clear skeleton or old content
        if (birthdaysToRender.length === 0) {
            grid.innerHTML = `<p class="text-center text-gray-500 col-span-full mt-8">No birthdays match your criteria.</p>`;
            return;
        }

        birthdaysToRender.forEach(bday => {
            const card = document.createElement('a');
            card.href = `countdown.html?id=${bday.id}`;
            card.className = `relative bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 transform transition-all duration-300 block`;
            if (bday.isForFriend) {
                card.classList.add('friend-card');
            }

            const noteHTML = bday.note ? `<p class="text-gray-500 mt-2 italic truncate">"${bday.note}"</p>` : '<p class="text-gray-400 mt-2 italic">No note.</p>';

            card.innerHTML = `
                <h3 class="text-2xl font-bold text-gray-800 truncate">${bday.name}</h3>
                ${noteHTML}
                <div class="mt-4 pt-4 border-t border-gray-200">
                    <div data-countdown="${bday.nextOccurrence.toDate()}" class="text-lg font-semibold text-pink-600">Loading...</div>
                </div>
            `;
            grid.appendChild(card);
        });
        startLiveCounters();
    };
    
    const filterAndRenderBirthdays = () => {
        const searchTerm = searchBar.value.toLowerCase();
        let filtered = [...allBirthdays];

        // Filter by tab
        const now = new Date();
        const todayStart = new Date(now.setHours(0, 0, 0, 0));
        const todayEnd = new Date(now.setHours(23, 59, 59, 999));

        if (currentFilter === 'upcoming') {
            filtered = filtered.filter(b => b.nextOccurrence.toDate() >= todayEnd);
        } else if (currentFilter === 'today') {
            filtered = filtered.filter(b => {
                const nextOcc = b.nextOccurrence.toDate();
                return nextOcc >= todayStart && nextOcc <= todayEnd;
            });
        }

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(b => b.name.toLowerCase().includes(searchTerm));
        }

        renderBirthdays(filtered);
    };

    const startLiveCounters = () => {
        const countdownElements = document.querySelectorAll('[data-countdown]');
        countdownElements.forEach(el => {
            const targetDate = new Date(el.dataset.countdown);
            const update = () => {
                const now = new Date().getTime();
                const distance = targetDate - now;

                if (distance < 0) {
                    el.innerHTML = `Birthday has passed!`;
                    return;
                }

                const days = Math.floor(distance / (1000 * 60 * 60 * 24));
                const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                
                el.innerHTML = `${days}d ${hours}h ${minutes}m`;
            };
            update();
            setInterval(update, 60000); // Update every minute
        });
    };

    searchBar.addEventListener('input', filterAndRenderBirthdays);

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active-filter'));
            btn.classList.add('active-filter');
            currentFilter = btn.dataset.filter;
            filterAndRenderBirthdays();
        });
    });

    fetchBirthdays();
});