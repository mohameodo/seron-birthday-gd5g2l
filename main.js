document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('birthday-form');

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById('name').value;
        const birthday = document.getElementById('birthday').value;
        const note = document.getElementById('note').value;
        const type = document.querySelector('input[name="type"]:checked').value;

        if (!name || !birthday) {
            showToast('Please fill in both name and birthday!', 'error');
            return;
        }

        const isForFriend = type === 'friend';

        const params = new URLSearchParams({
            name: name,
            date: birthday,
            note: note,
            friend: isForFriend
        });

        window.location.href = `countdown.html?${params.toString()}`;
    });
});
