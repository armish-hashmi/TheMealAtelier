let currentWeekOffset = 0;
let selectedDay = null;
const plannerData = JSON.parse(localStorage.getItem('plannerData') || '{}');

const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

function getWeekDates(offset) {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + offset * 7);
    return Array.from({length: 7}, (_, i) => {
        const d = new Date(startOfWeek);
        d.setDate(startOfWeek.getDate() + i);
        return d;
    });
}

function buildPlanner() {
    const grid = document.getElementById('plannerGrid');
    const dates = getWeekDates(currentWeekOffset);
    grid.innerHTML = '';

    document.getElementById('weekLabel').textContent =
        `${dates[0].toLocaleDateString('en',{month:'short',day:'numeric'})} — ${dates[6].toLocaleDateString('en',{month:'short',day:'numeric',year:'numeric'})}`;

    dates.forEach(date => {
        const key = date.toISOString().split('T')[0];
        const meal = plannerData[key];
        const card = document.createElement('div');
        card.className = 'day-card';
        card.innerHTML = `
            <h4>${days[date.getDay()]}</h4>
            <div class="day-date">${date.getDate()}</div>
            <div class="planned-recipe ${meal ? 'has-meal' : ''}" onclick="openMealPicker('${key}')">
                ${meal
                    ? `<span>${meal}</span><span class="remove-meal" onclick="removeMeal(event,'${key}')">×</span>`
                    : '+ add meal'}
            </div>`;
        grid.appendChild(card);
    });
}

function openMealPicker(dayKey) {
    selectedDay = dayKey;
    document.getElementById('mealPickerModal').style.display = 'flex';
    renderMealOptions('');
}

function closeMealPicker() {
    document.getElementById('mealPickerModal').style.display = 'none';
}

function renderMealOptions(query) {
    const list = document.getElementById('mealPickerList');
    const filtered = recipes.filter(r => r.title.toLowerCase().includes(query.toLowerCase()));
    list.innerHTML = filtered.map(r => `
        <div class="meal-option" onclick="selectMeal('${r.title}')">
            ${r.title} <span style="color:#aaa;font-size:11px;">🔥 ${r.calories} kcal</span>
        </div>`).join('');
}

function selectMeal(title) {
    plannerData[selectedDay] = title;
    localStorage.setItem('plannerData', JSON.stringify(plannerData));
    closeMealPicker();
    buildPlanner();
}

function removeMeal(event, key) {
    event.stopPropagation();
    delete plannerData[key];
    localStorage.setItem('plannerData', JSON.stringify(plannerData));
    buildPlanner();
}

document.getElementById('prevWeek').addEventListener('click', () => { currentWeekOffset--; buildPlanner(); });
document.getElementById('nextWeek').addEventListener('click', () => { currentWeekOffset++; buildPlanner(); });
document.getElementById('mealSearch').addEventListener('input', e => renderMealOptions(e.target.value));

document.addEventListener('DOMContentLoaded', buildPlanner);