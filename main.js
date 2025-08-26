document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('birthday-form');

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById('name').value;
        const date = document.getElementById('date').value;
        const note = document.getElementById('note').value;
        const isForFriend = document.querySelector('input[name="isForFriend"]:checked').value;

        if (!name || !date) {
            showToast('Please fill in the name and date!', 'error');
            return;
        }

        const today = new Date().toISOString().split('T')[0];
        if (date > today) {
             showToast('Birthday date cannot be in the future.', 'error');
             return;
        }

        // In a real app, this would be sent to a backend.
        // Here, we'll pass it via URL parameters.
        const params = new URLSearchParams({
            name: encodeURIComponent(name),
            date: date,
            note: encodeURIComponent(note),
            isForFriend: isForFriend
        });

        window.location.href = `birthday.html?${params.toString()}`;
    });
});

function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}
