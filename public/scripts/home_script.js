const searchBtn = document.querySelector('#lens')
const closeBtn = document.querySelector('#closeBtn')
const search_field = document.querySelector('.search_field')

searchBtn.onclick = function(){
    search_field.classList.add('active')
    closeBtn.classList.add('active')
    searchBtn.classList.add('active')
}
closeBtn.onclick = function(){
    search_field.classList.remove('active')
    closeBtn.classList.remove('active')
    searchBtn.classList.remove('active')
}
