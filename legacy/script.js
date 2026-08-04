
import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.9.0/firebase-app.js'
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.9.0/firebase-analytics.js";
import { initializeAppCheck, ReCaptchaV3Provider, getToken } from 'https://www.gstatic.com/firebasejs/11.9.0/firebase-app-check.js';
//import { getAuth } from 'https://www.gstatic.com/firebasejs/11.9.0/firebase-auth.js'
import { getFirestore, collection, getDocs } from 'https://www.gstatic.com/firebasejs/11.9.0/firebase-firestore.js'
//import { getStorage } from "https://www.gstatic.com/firebasejs/11.9.0/firebase-storage.js"

let recipes = [];

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
            provider: new ReCaptchaV3Provider('REDACTED'),
            isTokenAutoRefreshEnabled: true 
    });

    try {
    const appCheckToken = await getToken(appCheck);
    console.log("App Check is OK!");
    } catch (error) {
    console.error("App Check token error:", error);
    }

    const docRef = collection(db, "recipes");
    const query = await getDocs(docRef);


    query.forEach((rec) => {
        const name = rec.data().title;
        recipes.push({
            name: name,
            url: `recipes/${rec.id}`
        });
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
    displayRecipes(recipes);

    searchTerm.placeholder = "Search...";

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
initApp();
function toggleMenu() {
    var nav = document.getElementById("myNav");
    var menuIcon = document.querySelector('.menu-icon');
    const recipeMenu = document.getElementById("recipeMenu");

    
    if (nav.classList.contains('open')) {
        nav.classList.remove('open');
        menuIcon.classList.remove('change');
        
        document.querySelectorAll('.overlay-content .dropdown-content.open').forEach(function(dropdown) {
            dropdown.classList.remove('open');
        });
    } else {
        nav.classList.add('open');
        menuIcon.classList.add('change');

        recipeMenu.innerHTML = filtered.map(r => 
        `<div><a href="${r.url}">${r.name}</a></div>`).join('');
    }
    
}


