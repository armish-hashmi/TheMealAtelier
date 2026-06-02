const categories = ['Produce', 'Proteins', 'Pantry', 'Dairy'];
let groceryData = JSON.parse(localStorage.getItem('groceryData') || JSON.stringify({
    Produce:  [{text:'Mixed greens',done:false},{text:'Cherry tomatoes',done:false},{text:'Garlic cloves',done:false}],
    Proteins: [{text:'Chicken breasts',done:false},{text:'Pulled lamb',done:false}],
    Pantry:   [{text:'Basmati rice',done:false},{text:'Soy sauce',done:false}],
    Dairy:    [{text:'Heavy cream',done:false},{text:'Parmesan cheese',done:false}]
}));

function save() {
    localStorage.setItem('groceryData', JSON.stringify(groceryData));
}

function renderAll() {
    categories.forEach(cat => {
        const ul = document.getElementById(`list-${cat}`);
        ul.innerHTML = '';
        (groceryData[cat] || []).forEach((item, i) => {
            const li = document.createElement('li');
            li.className = 'grocery-item';
            const id = `${cat}-${i}`;
            li.innerHTML = `
                <input type="checkbox" id="${id}" ${item.done ? 'checked' : ''} onchange="toggleItem('${cat}',${i})">
                <label for="${id}" class="${item.done ? 'done' : ''}">${item.text}</label>
                <span class="delete-item" onclick="deleteItem('${cat}',${i})">×</span>`;
            ul.appendChild(li);
        });
    });
}

function toggleItem(cat, i) {
    groceryData[cat][i].done = !groceryData[cat][i].done;
    save();
    renderAll();
}

function deleteItem(cat, i) {
    groceryData[cat].splice(i, 1);
    save();
    renderAll();
}

function addItem(cat) {
    const input = document.getElementById(`input-${cat}`);
    const val = input.value.trim();
    if (!val) return;
    groceryData[cat].push({ text: val, done: false });
    save();
    renderAll();
    input.value = '';
}

document.getElementById('clearChecked').addEventListener('click', () => {
    categories.forEach(cat => {
        groceryData[cat] = groceryData[cat].filter(item => !item.done);
    });
    save();
    renderAll();
});

// allow Enter key to add items
categories.forEach(cat => {
    document.getElementById(`input-${cat}`).addEventListener('keydown', e => {
        if (e.key === 'Enter') addItem(cat);
    });
});

document.addEventListener('DOMContentLoaded', renderAll);