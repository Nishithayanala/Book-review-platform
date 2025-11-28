// Example: confirm before approving/rejecting a review
document.addEventListener('DOMContentLoaded', () => {
    const approveBtns = document.querySelectorAll('.approve-btn');
    const rejectBtns = document.querySelectorAll('.reject-btn');

    approveBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            if(!confirm('Are you sure you want to approve this review?')) {
                e.preventDefault();
            }
        });
    });

    rejectBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            if(!confirm('Are you sure you want to reject this review?')) {
                e.preventDefault();
            }
        });
    });
});
