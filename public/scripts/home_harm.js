document.addEventListener('DOMContentLoaded', function () {
    const mobileMenu = document.getElementById('mobile-menu');
    const nav = document.querySelector('.MyNav');

    mobileMenu.addEventListener('click', function () {
        nav.classList.toggle('show');
    });
});
