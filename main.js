import { db, auth } from './firebase-config.js';
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";
import { signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import { showToast } from './utils.js';

const form = document.getElementById('birthday-form');
const submitBtn = document.getElementById('submit-btn');
const btnText = document.getElementById('btn-text');
const btnLoader = document.getElementById('btn-loader');

onAuthStateChanged(auth, (user) => {
    if (!user) {
        signInAnonymously(auth).catch((error) => {
            console.error("Anonymous sign in failed", error);
            showToast('Could not connect. Please refresh.', 'error');
        });
    }
});

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (auth.currentUser === null) {
        showToast('Not connected yet, please wait a moment.', 'error');
        return;
    }

    // Disable button
    submitBtn.disabled = true;
    btnText.classList.add('hidden');
    btnLoader.classList.remove('hidden');

    const name = form.name.value;
    const date = form.date.value;
    const note = form.note.value;
    const isForFriend = form.type.value === 'friend';

    // Validation
    if (!name || !date) {
        showToast('Please fill in the name and date!', 'error');
        submitBtn.disabled = false;
        btnText.classList.remove('hidden');
        btnLoader.classList.add('hidden');
        return;
    }

    const birthdayDate = new Date(date + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    try {
        const docRef = await addDoc(collection(db, 'birthdays'), {
            name,
            date,
            note,
            isForFriend,
            createdAt: serverTimestamp(),
            createdBy: auth.currentUser.uid,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        });
        
        showToast('Countdown created successfully!', 'success');
        
        // Redirect to the new countdown page
        window.location.href = `/countdown.html?id=${docRef.id}`;

    } catch (error) {
        console.error("Error adding document: ", error);
        showToast('Something went wrong. Please try again.', 'error');
        submitBtn.disabled = false;
        btnText.classList.remove('hidden');
        btnLoader.classList.add('hidden');
    }
});