document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const name = params.get('name') || 'Someone';
    const date = params.get('date');
    const note = params.get('note') || 'A special day is coming up!';
    const isForFriend = params.get('friend') === 'true';

    if (!date) {
        document.getElementById('title').textContent = 'No Birthday Specified!';
        document.getElementById('countdown').style.display = 'none';
        return;
    }

    const titleEl = document.getElementById('title');
    const noteEl = document.getElementById('note');
    const countdownEl = document.getElementById('countdown');
    const celebrationEl = document.getElementById('celebration-message');
    const pastMessageEl = document.getElementById('past-message');
    const postToWallBtn = document.getElementById('post-to-wall');
    const copyLinkBtn = document.getElementById('copy-link');

    titleEl.textContent = `${name}'s Birthday Countdown`;
    noteEl.textContent = `"${note}"`;

    if (isForFriend) {
        startSparkles();
    }

    const countdownInterval = setInterval(() => {
        const { timeRemaining, nextBirthday, isToday, daysSince } = calculateCountdown(date);

        if (isToday && timeRemaining <= 0) {
            clearInterval(countdownInterval);
            startCelebration();
        } else if (timeRemaining < 0) {
            clearInterval(countdownInterval);
            showPastMessage(daysSince);
        } else {
            updateCountdownUI(timeRemaining);
        }
    }, 1000);
    
    startAnimations();

    postToWallBtn.addEventListener('click', () => {
        showToast('Successfully posted to the public wall!', 'success');
        // In a real app, this would write to Firestore.
        // For demo, we just show a message and redirect.
        setTimeout(() => {
            window.location.href = 'wall.html';
        }, 1500);
    });

    copyLinkBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(window.location.href).then(() => {
            showToast('Share link copied to clipboard!', 'info');
        });
    });

    function calculateCountdown(birthdayDate) {
        const today = new Date();
        const birthDate = new Date(birthdayDate + 'T00:00:00'); // Use T00:00:00 to avoid timezone issues
        
        let nextBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());

        if (today > nextBirthday) {
            nextBirthday.setFullYear(today.getFullYear() + 1);
        }
        
        const timeRemaining = nextBirthday - today;
        const daysSince = Math.floor((today - nextBirthday) / (1000 * 60 * 60 * 24));

        const isToday = today.getDate() === birthDate.getDate() && today.getMonth() === birthDate.getMonth();

        return { timeRemaining, nextBirthday, isToday, daysSince };
    }

    function updateCountdownUI(time) {
        const days = Math.floor(time / (1000 * 60 * 60 * 24));
        const hours = Math.floor((time % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((time % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((time % (1000 * 60)) / 1000);

        document.getElementById('days').textContent = days;
        document.getElementById('hours').textContent = hours;
        document.getElementById('minutes').textContent = minutes;
        document.getElementById('seconds').textContent = seconds;
    }

    function startCelebration() {
        countdownEl.style.display = 'none';
        celebrationEl.style.display = 'block';
        titleEl.textContent = `Happy Birthday, ${name}!`;
        noteEl.style.display = 'none';
        celebrate(true); // Full celebration
    }

    function showPastMessage(daysSince) {
        countdownEl.style.display = 'none';
        pastMessageEl.style.display = 'block';
        pastMessageEl.querySelector('h2').textContent = `${name}'s birthday was ${Math.abs(daysSince)} days ago.`
    }
});
