const searchBtn_user = document.querySelector('#searchBtn_user')
const closeBtn_user = document.querySelector('#closeBtn_user')
const searchField_user = document.querySelector('.searchField_user')

searchBtn_user.onclick = function(){
    searchField_user.classList.add('active')
    closeBtn_user.classList.add('active')
    searchBtn_user.classList.add('active')
}


closeBtn_user.onclick = function(){
    searchField_user.classList.remove('active')
    closeBtn_user.classList.remove('active')
    searchBtn_user.classList.remove('active')
}