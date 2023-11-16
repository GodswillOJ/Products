const hamburger = document.querySelector('#toggler')
const menuNav = document.querySelector('.dropdown1')

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    menuNav.classList.toggle('active');
})

document.querySelectorAll('#nav_link').forEach( n => n.addEventListener('click', () => {
        hamburger.classList.remove('active')
        menuNav.classList.remove('active')
    }))