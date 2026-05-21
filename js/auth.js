function openRecipe(title, instructions) {
    const modal = document.getElementById("recipeModal");
    const modalTitle = document.getElementById("modalTitle");
    const modalInstructions = document.getElementById("modalInstructions");
    const ingredientsList = document.getElementById("ingredientsList");

    modalTitle.innerText = title;
    modalInstructions.innerText = instructions;

    
    modal.style.display = "block";
}

function closeModal() {
    document.getElementById("recipeModal").style.display = "none";
}

// Close the modal if the user clicks anywhere outside of the white box
window.onclick = function(event) {
    const modal = document.getElementById("recipeModal");
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

function openRecipe(title, ingredients, instructions) {
    document.getElementById("modalTitle").innerText = title;
    document.getElementById("modalInstructions").innerText = instructions;
    
    const list = document.getElementById("ingredientsList");
    list.innerHTML = "";
    ingredients.forEach(item => {
        list.innerHTML += `<li><input type="checkbox" style="accent-color:#64ab87"> ${item}</li>`;
    });
    
    document.getElementById("recipeModal").style.display = "block";
}

function toggleAuthModal() {
    document.getElementById("authModal").style.display = "block";
}

let isSignUp = false;
function toggleAuthMode() {
    isSignUp = !isSignUp;
    document.getElementById("authTitle").innerText = isSignUp ? "Sign Up" : "Sign In";
    document.getElementById("signupUser").style.display = isSignUp ? "block" : "none";
    document.getElementById("authSwitch").innerText = isSignUp ? "Already have an account? Sign In" : "New here? Create an account.";
}

function closeModal(id) {
    document.getElementById(id).style.display = "none";
}

// Close modals on outside click
window.onclick = function(e) {
    if (e.target.className === 'modal') {
        e.target.style.display = "none";
    }
}

