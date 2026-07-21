import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.9.0/firebase-app.js'
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.9.0/firebase-analytics.js";
import { initializeAppCheck, ReCaptchaV3Provider, getToken } from 'https://www.gstatic.com/firebasejs/11.9.0/firebase-app-check.js';
//import { getAuth } from 'https://www.gstatic.com/firebasejs/11.9.0/firebase-auth.js'
import { getFirestore, doc, getDoc } from 'https://www.gstatic.com/firebasejs/11.9.0/firebase-firestore.js'
//import { getStorage } from "https://www.gstatic.com/firebasejs/11.9.0/firebase-storage.js"
async function recipeLoader() {
    console.log("Recipelookup starting.")
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

    try {
    const appCheckToken = await getToken(appCheck);
    console.log("App Check is OK!");
    } catch (error) {
    console.error("App Check token error:", error);
    }

    const current = window.location.pathname.split('/');
    let lastSegment = current.pop() || current.pop();


    const docRef = doc(db, "recipes", lastSegment);
    const docSnap = await getDoc(docRef);
    const headerElement = document.getElementById("header");
    const infoElement = document.getElementById("info");
    const ingredientsElement = document.getElementById("ingredients");
    const instructionsElement = document.getElementById("instructions");
    const imgElement = document.getElementById("image");


    if (docSnap.exists()) {
        const recipeData = docSnap.data();
        const name = recipeData.title;
        const ingredients = recipeData.ingredients;
        const instructions = recipeData.instructions;
        const info = recipeData.info;
        
        const newPageTitle = `${name} resepti` ;
        document.title = newPageTitle;

        headerElement.innerHTML =`${name}`;
        infoElement.innerHTML = `${info}`;
        ingredientsElement.innerHTML = `<pre>${ingredients}</pre>`;
        instructionsElement.innerHTML =`<pre>${instructions}</pre>`;

        console.log("Recipelookup done!");

        let attempts = 0;
        const sources = [
            `recipes/img/${lastSegment}.png`,
            `recipes/img/${lastSegment}.jpg`,
            `recipes/img/${lastSegment}.jpeg`,
        ];

        imgElement.onerror = () => {
            attempts ++;
            if (attempts < sources.length) {
                imgElement.src = sources[attempts];
            } else {
                imgElement.onerror = null;
                imgElement.style.display = "none";
 }
        }
        imgElement.src = sources[0];


    } else {
    console.log("Could not load recipe from firebase.");
    headerElement.innerHTML= `<p> Could not load recipe.</p>`
    }
}
document.addEventListener("DOMContentLoaded", () => {
    recipeLoader();
});
