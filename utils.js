export function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let icon = '';
    if (type === 'success') icon = '<i class="fas fa-check-circle mr-3"></i>';
    if (type === 'error') icon = '<i class="fas fa-times-circle mr-3"></i>';
    if (type === 'info') icon = '<i class="fas fa-info-circle mr-3"></i>';

    toast.innerHTML = `${icon}<span>${message}</span>`;
    container.appendChild(toast);

    // Animate in
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);

    // Animate out and remove
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            container.removeChild(toast);
        }, 500);
    }, 3000);
}