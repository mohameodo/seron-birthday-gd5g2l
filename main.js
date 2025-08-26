import { db, auth } from './firebase-config.js';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js';
import { signInAnonymously, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js';

// --- UTILS --- //
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let icon = 'fa-solid fa-circle-info';
    if (type === 'success') icon = 'fa-solid fa-check-circle';
    if (type === 'error') icon = 'fa-solid fa-times-circle';

    toast.innerHTML = `<i class="${icon}"></i><span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// --- AUTHENTICATION --- //
let currentUser = null;
onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
    } else {
        signInAnonymously(auth).catch((error) => {
            console.error("Anonymous sign-in failed:", error);
            showToast('Authentication failed. Please refresh.', 'error');
        });
    }
});

// --- FORM HANDLING --- //
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('birthday-form');
    const submitBtn = document.getElementById('submit-btn');
    const btnText = submitBtn.querySelector('.button-text');
    const btnLoader = submitBtn.querySelector('.button-loader');
    const dateInput = document.getElementById('date');

    // Set min date to today
    const today = new Date().toISOString().split('T')[0];
    // dateInput.setAttribute('min', today); // Removed to allow past dates if needed, but validation will handle it

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!currentUser) {
            showToast('Still authenticating... please wait a moment.', 'info');
            return;
        }

        btnText.classList.add('hidden');
        btnLoader.classList.remove('hidden');
        submitBtn.disabled = true;

        const name = form.name.value.trim();
        const date = form.date.value;
        const note = form.note.value.trim();
        const isForFriend = form.isForFriend.checked;

        if (!name || !date) {
            showToast('Name and date are required!', 'error');
            resetButton();
            return;
        }

        // Check for duplicates
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const q = query(
            collection(db, 'birthdays'), 
            where('name', '==', name),
            where('date', '==', date),
            where('createdAt', '>=', twentyFourHoursAgo)
        );

        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            showToast('This exact name and birthday was added recently.', 'error');
            resetButton();
            return;
        }

        try {
            const docRef = await addDoc(collection(db, 'birthdays'), {
                name,
                date,
                note,
                isForFriend,
                createdAt: serverTimestamp(),
                createdBy: currentUser.uid,
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            });
            showToast('Countdown created successfully!', 'success');
            setTimeout(() => {
                window.location.href = `countdown.html?id=${docRef.id}`;
            }, 1000);
        } catch (error) {
            console.error("Error adding document: ", error);
            showToast('Could not create countdown. Please try again.', 'error');
            resetButton();
        }
    });

    function resetButton() {
        btnText.classList.remove('hidden');
        btnLoader.classList.add('hidden');
        submitBtn.disabled = false;
    }
});