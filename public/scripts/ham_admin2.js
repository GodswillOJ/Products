const hamburger = document.querySelector('#toggler2')
const menuNav = document.querySelector('.dropdown2')

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    menuNav.classList.toggle('active');
})

document.querySelectorAll('#nav_link').forEach( n => n.addEventListener('click', () => {
    hamburger1.classList.remove('active')
    menuNav1.classList.remove('active')
}))