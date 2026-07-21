
import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.9.0/firebase-app.js'
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.9.0/firebase-analytics.js";
import { initializeAppCheck, ReCaptchaV3Provider, getToken } from 'https://www.gstatic.com/firebasejs/11.9.0/firebase-app-check.js';
//import { getAuth } from 'https://www.gstatic.com/firebasejs/11.9.0/firebase-auth.js'
import { getFirestore, collection, getDocs } from 'https://www.gstatic.com/firebasejs/11.9.0/firebase-firestore.js'
//import { getStorage } from "https://www.gstatic.com/firebasejs/11.9.0/firebase-storage.js"

let recipes =[];


document.addEventListener("DOMContentLoaded", () => {
    const searchTerm = document.getElementById("search");
    searchTerm.placeholder = "Ladataan reseptejä...";
    searchTerm.disabled = true;


    initApp();
    document.getElementById("recipes").innerHTML = `<div>Ladataan reseptejä..</div>`;
});

async function initApp(){
    console.log("Waiting for App check") 
    const firebaseConfig = {
        apiKey: "",
        authDomain: "",
        projectId: "",
        storageBucket: "",
        messagingSenderId: "",
        appId: "",
        measurementId: ""
    };

    const app = initializeApp(firebaseConfig);

    const analytics = getAnalytics(app);
    const db = getFirestore(app);


    const appCheck = initializeAppCheck(app, {
            provider: new ReCaptchaV3Provider(''),
            isTokenAutoRefreshEnabled: true 
    });

    getToken(appCheck).catch(er =>
        console.error("App check not functional!", er)
    );

    const docRef = collection(db, "recipes");
    const query = await getDocs(docRef);


    query.forEach((rec) => {
        const name = rec.data().title;
        const tags = rec.data().tags;
        recipes.push({
            name: name,
            url: `recipes/${rec.id}`,
            tags: tags
        });
    });

    function getRandomRecipe(list){
        const chosenOne = Math.floor(Math.random()*list.length)
        console.log("Chosen one is: " + chosenOne);
        const chosenRecipe = list.at(chosenOne);
        return chosenRecipe;
    }

    document.getElementById("randomRecipe").addEventListener("click", () => {
        const randomRecipe = getRandomRecipe(recipes);
        window.location.href = randomRecipe.url;
    });

    recipes.sort(function(a, b){
        let x = a.name.toLowerCase();
        let y = b.name.toLowerCase();
        if (x < y) {return -1;}
        if (x > y) {return 1;}
        return 0;
    }); 


    const recipeList = document.getElementById("recipes");
    const searchTerm = document.getElementById("search");

    function displayRecipes(filtered) {
        recipeList.innerHTML = filtered.map(r => 
        `<div><a href="${r.url}">${r.name}</a></div>`).join('');
    }

    if(!recipes.length) {
        recipeList.innerHTML = `<div>Ei reseptejä!</div>`;
    }
    else{
        displayRecipes(recipes);

    }


    searchTerm.disabled = false;
    searchTerm.placeholder = "Etsi reseptejä...";

    searchTerm.addEventListener("input", () => {
    if (!searchTerm.value){
        recipeList.style.display = "none";
    }
    else{
        recipeList.style.display = "flex";
    }
    const keyword = searchTerm.value.toLowerCase();
    const filtered = recipes.filter(r => r.name.toLowerCase().includes(keyword));
    if(filtered.length === 0){
        recipeList.style.display = "none";
    }
    else{
    displayRecipes(filtered);}

     });
    
}
let sortStates={
    essaySort: false,

    mainSort: false,
    sideSort: false,
    soupSort: false,
    dessertSort: false,

    sauceSort: false,
    marinadeSort: false,

    chickenSort: false,
    duckSort: false,
    beefSort: false,
    fishSort: false,
    minceSort: false,
    lambSort: false,
    porkSort: false,
    veggieSort: false,
};
let sortTags ={
    essaySort: 'essee',
    
    mainSort: 'main',
    sideSort: 'side',
    soupSort: 'keitto',
    dessertSort: 'dessert',

    sauceSort: 'kastike',
    marinadeSort: 'marinadi',

    chickenSort: 'kana',
    duckSort: 'ankka',
    beefSort: 'nauta',
    fishSort: 'kala',
    minceSort: 'jauheliha',
    lambSort: 'lammas',
    porkSort: 'sika',
    veggieSort: 'kasvis'

};
document.querySelectorAll('.sortButtons').forEach(button =>{
    button.onclick = () =>{
        const state = button.id + 'Sort';
        sortStates[state] = !sortStates[state];
        menuContent();

        const sortButtons = document.querySelectorAll('.sortButtons');
        sortButtons.forEach((button) => {
        const key = button.id + 'Sort';
        if (sortStates[key]){
            button.classList.add('active');
        }
        else{
            button.classList.remove('active');
    }
});

    }
}
)



window.toggleMenu = function () {
    var nav = document.getElementById("myNav");
    var menuIcon = document.querySelector('.menu-icon');
    var recipeMenu = document.getElementById("recipeMenu");
    
    const searchTerm = document.getElementById("search");

    if (nav.classList.contains('open')) {
        nav.classList.remove('open');
        menuIcon.classList.remove('change');
        
        document.querySelectorAll('.overlay-content .dropdown-content.open').forEach(function(dropdown) {
            dropdown.classList.remove('open');
        });
    } else {
        nav.classList.add('open');
        menuIcon.classList.add('change');

        if(searchTerm.disabled){ // recipes havent loaded yet, but menu is open
            recipeMenu.innerHTML = `<div>Ladataan reseptejä...</div>`
            //refresh the recipes
            const refreshCheck = setInterval(() => {
                if(!searchTerm.disabled){
                    clearInterval(refreshCheck);
                    menuContent();
                }
            }, 100)
        } 
        else{
            menuContent();
        }


    }
    
};


function menuContent(){
    if(!Object.values(sortStates).some(Boolean)){
        recipeMenu.innerHTML = recipes.map(r => 
        `<div><a href="${r.url}">${r.name}</a></div>`).join('');
    }
    else{

        let trueTags = [];
        for (let key in sortStates){
            if (sortStates[key]){
                trueTags.push(sortTags[key]);
            }
        }
    
        
        let sorted = [];
        recipes.forEach((recipe) => {
            let tags = recipe.tags;
            let tagArray = tags.split(',');
            let hasAllTags = true;
            
            for (let i = 0; i < trueTags.length; i++) {
                let currentTag = trueTags[i];
                if (!tagArray.includes(currentTag)) {
                    hasAllTags = false;
                    break;
                }
            }
            
            if (hasAllTags) {
                sorted.push(recipe);
            }
        });

    recipeMenu.innerHTML = sorted
    .map(r => `<div><a href="${r.url}">${r.name}</a></div>`)
    .join('');
    }
};
