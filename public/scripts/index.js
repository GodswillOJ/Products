/*=============== SHOW SCROLL UP ===============*/ 
const scrollUp = () =>{
	const scrollUp = document.getElementById('scroll-up')
    // When the scroll is higher than 350 viewport height, add the show-scroll class to the a tag with the scrollup class
	this.scrollY >= 350 ? scrollUp.classList.add('show-scroll')
						: scrollUp.classList.remove('show-scroll')
}
window.addEventListener('scroll', scrollUp)


var sidebar = document.getElementById('menu');
sidebar.addEventListener('scroll', function(e) {
    if(e.deltaY > 0 && this.scrollTop >= this.clientHeight) {
        e.preventDefault();
    }
});