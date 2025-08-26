document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const birthdayId = params.get('id');

    const countdownCard = document.getElementById('countdown-card');
    const loadingState = document.getElementById('loading-state');
    const contentState = document.getElementById('content-state');
    const titleEl = document.getElementById('title');
    const noteEl = document.getElementById('note');
    const daysEl = document.getElementById('days');
    const hoursEl = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');
    const celebrationMessage = document.getElementById('celebration-message');
    const countdownDisplay = document.getElementById('countdown-display');
    const copyLinkBtn = document.getElementById('copy-link-btn');

    let countdownInterval;

    if (!birthdayId) {
        countdownCard.innerHTML = '<p class="text-center text-red-500 text-2xl font-bold">No birthday ID provided.</p>';
        showContent();
        return;
    }

    const fetchBirthday = async () => {
        try {
            const doc = await db.collection('birthdays').doc(birthdayId).get();
            if (!doc.exists) {
                throw new Error('Birthday not found.');
            }
            const data = doc.data();
            renderCountdown(data);
        } catch (error) {
            console.error('Error fetching birthday:', error);
            titleEl.textContent = 'Oops!';
            noteEl.textContent = 'We couldn\'t find this birthday countdown. It might have been removed.';
            countdownDisplay.classList.add('hidden');
            showContent();
        }
    };

    const renderCountdown = (data) => {
        const possessive = data.name.endsWith('s') ? "'" : "'s";
        titleEl.textContent = `${data.name}${possessive} Birthday Countdown`;
        noteEl.textContent = data.note || 'Wishing you a wonderful celebration!';
        
        if (data.isForFriend) {
            startCelebration(10); // Add some sparkles for friends
        }

        const targetDate = data.nextOccurrence.toDate();
        updateCountdown(targetDate);
        countdownInterval = setInterval(() => updateCountdown(targetDate), 1000);

        showContent();
    };

    const updateCountdown = (targetDate) => {
        const now = new Date().getTime();
        const distance = targetDate - now;

        if (distance <= 0) {
            clearInterval(countdownInterval);
            countdownDisplay.classList.add('hidden');
            celebrationMessage.classList.remove('hidden');
            daysEl.textContent = hoursEl.textContent = minutesEl.textContent = secondsEl.textContent = 0;
            startCelebration();
            return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        updateTimeUnit(daysEl, days);
        updateTimeUnit(hoursEl, hours);
        updateTimeUnit(minutesEl, minutes);
        updateTimeUnit(secondsEl, seconds);
    };
    
    const updateTimeUnit = (element, value) => {
        const formattedValue = String(value).padStart(2, '0');
        if (element.textContent !== formattedValue) {
            element.textContent = formattedValue;
            element.parentElement.classList.add('animate-pop');
            setTimeout(() => element.parentElement.classList.remove('animate-pop'), 300);
        }
    }

    const showContent = () => {
        loadingState.classList.add('hidden');
        contentState.classList.remove('hidden');
        countdownCard.classList.add('opacity-100', 'translate-y-0');
        countdownCard.classList.remove('opacity-0', 'translate-y-10');
    };

    copyLinkBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(window.location.href).then(() => {
            showToast('Link copied to clipboard!', 'info');
        }).catch(err => {
            showToast('Failed to copy link.', 'error');
            console.error('Could not copy text: ', err);
        });
    });

    fetchBirthday();
});
