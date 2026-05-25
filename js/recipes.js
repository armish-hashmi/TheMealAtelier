document.addEventListener('DOMContentLoaded', () => {
    fetch('./data/recipes.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Could not find recipes.json');
            }
            return response.json();
        })
        .then(data => {
            renderRecipes(data.recipes);
        })
        .catch(error => console.error('Error loading recipes:', error));
});


function renderRecipes(list) {
    const container = document.getElementById('container');
    container.innerHTML = '';

    list.forEach(recipe => {
        const box = document.createElement('div');
        box.classList.add('box');
        box.innerHTML = `
            <img src="${recipe.image}" alt="${recipe.title}">
            <div class="recipe-info">
                <h3>${recipe.title}</h3>
                <p>${recipe.description}</p>
            </div>
            <div class="recipe-stats">
                <span class="rating">⭐ ${recipe.rating}</span>
                <span class="calories">🔥 ${recipe.calories} kcal</span>
            </div>
        `;
        box.addEventListener('click', () => openRecipeModal(recipe));
        container.appendChild(box);
    });
}


function openRecipeModal(recipe) {
    document.getElementById('modalTitle').textContent = recipe.title;
    document.getElementById('modalInstructions').textContent = recipe.instructions;

    const ingredientsList = document.getElementById('ingredientsList');
    ingredientsList.innerHTML = '<h4>Ingredients</h4><ul>' +
        recipe.ingredients.map(ing => `<li>${ing}</li>`).join('') +
        '</ul>';

    document.getElementById('recipeModal').style.display = 'flex';
}


function closeModal(id) {
    document.getElementById(id).style.display = 'none';
}