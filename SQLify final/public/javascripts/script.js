const loginBtn = document.getElementById("loginBtn");
const regBtn = document.getElementById("regBtn");
const regPage = document.getElementById("regPage");
const loginPage = document.getElementById("loginPage");


// regPage.style.display="none";
loginPage.style.display="none";

regBtn.addEventListener('click', ()=>{
    regPage.style.display="flex";
    loginPage.style.display="none";
})
loginBtn.addEventListener('click', ()=>{
    loginPage.style.display="flex";
    regPage.style.display="none";
})