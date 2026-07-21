let stored = localStorage.getItem('isDarkMode');
let darkModeState = stored === null ? true : stored === 'true';

function toggleDarkMode(){
    darkMode(!darkModeState);
}
async function darkMode(state) {
    let button = document.getElementById("toggleDark");
    var element = document.body;        
    if(state===true){
        element.classList.add("dark-mode");
        darkModeState = true;
        localStorage.setItem('isDarkMode', darkModeState);
        button.innerHTML="Vaalea tila";
    }
    else{
        element.classList.remove("dark-mode");
        darkModeState = false;
        localStorage.setItem('isDarkMode', darkModeState);
        button.innerHTML="Tumma tila";
    }
};
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("toggleDark").onclick = toggleDarkMode;
    if (darkModeState === false){
        darkMode(false);
    }
    else{
        darkMode(true);
    }
});
