document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('birthday-form');
    const submitBtn = document.getElementById('submit-btn');
    const submitText = document.getElementById('submit-text');
    const submitSpinner = document.getElementById('submit-spinner');

    // Sign in user anonymously
    auth.onAuthStateChanged(user => {
        if (user) {
            console.log('Anonymous user signed in:', user.uid);
        } else {
            auth.signInAnonymously().catch(error => {
                console.error('Error signing in anonymously:', error);
                showToast('Could not connect. Please refresh.', 'error');
            });
        }
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const currentUser = auth.currentUser;

        if (!currentUser) {
            showToast('You are not signed in. Please refresh the page.', 'error');
            return;
        }

        setLoading(true);

        const formData = new FormData(form);
        const name = formData.get('name');
        const date = formData.get('date'); // YYYY-MM-DD
        const note = formData.get('note');
        const isForFriend = formData.get('isForFriend') === 'true';

        // Calculate next occurrence
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const [year, month, day] = date.split('-').map(Number);
        
        let nextBirthday = new Date(today.getFullYear(), month - 1, day);
        if (nextBirthday < today) {
            nextBirthday.setFullYear(today.getFullYear() + 1);
        }

        const birthdayData = {
            name,
            date: `${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
            note,
            isForFriend,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            nextOccurrence: firebase.firestore.Timestamp.fromDate(nextBirthday),
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            createdBy: currentUser.uid
        };

        try {
            const docRef = await db.collection('birthdays').add(birthdayData);
            showToast('Birthday countdown created!', 'success');
            window.location.href = `countdown.html?id=${docRef.id}`;
        } catch (error) {
            console.error('Error adding document: ', error);
            showToast('Failed to create countdown. Please try again.', 'error');
        } finally {
            setLoading(false);
        }
    });

    function setLoading(isLoading) {
        if (isLoading) {
            submitBtn.disabled = true;
            submitText.classList.add('hidden');
            submitSpinner.classList.remove('hidden');
        } else {
            submitBtn.disabled = false;
            submitText.classList.remove('hidden');
            submitSpinner.classList.add('hidden');
        }
    }
});
