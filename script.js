document.addEventListener("DOMContentLoaded", () => {
    loadWorkouts();
    setupExerciseAutocomplete();
    checkLoginStatus();
});

function addWorkout() {
    const exercise = document.getElementById("exercise")?.value.trim();
    const reps = parseInt(document.getElementById("reps")?.value);
    const weight = parseInt(document.getElementById("weight")?.value);
    
    // Validare exercițiu
    if (!exercise) {
        showMessage("workout-message", "Te rog să introduci un exercițiu.", "red");
        return;
    }

    // Validare repetări
    if (isNaN(reps)) {
        showMessage("workout-message", "Te rog să introduci un număr valid de repetări.", "red");
        return;
    }
    if (reps <= 0) {
        showMessage("workout-message", "Numărul de repetări trebuie să fie mai mare decât 0.", "red");
        return;
    }
    if (reps > 100) {
        showMessage("workout-message", "Numărul de repetări pare prea mare. Verifică și încearcă din nou.", "red");
        return;
    }

    // Validare greutate
    if (isNaN(weight)) {
        showMessage("workout-message", "Te rog să introduci o greutate validă.", "red");
        return;
    }
    if (weight < 0) {
        showMessage("workout-message", "Greutatea nu poate fi negativă.", "red");
        return;
    }
    if (weight > 500) {
        showMessage("workout-message", "Greutatea pare prea mare. Verifică și încearcă din nou.", "red");
        return;
    }

    const workout = { exercise, reps, weight, date: new Date().toISOString() };
    const workouts = JSON.parse(localStorage.getItem("workouts")) || [];
    workouts.push(workout);
    localStorage.setItem("workouts", JSON.stringify(workouts));
    
    // Curăță câmpurile după adăugare
    document.getElementById("exercise").value = "";
    document.getElementById("reps").value = "";
    document.getElementById("weight").value = "";
    
    // Afișează mesaj de succes
    showMessage("workout-message", "Antrenament adăugat cu succes!", "green");
    
    updateWorkoutList(workouts);
}

function loadWorkouts() {
    const workouts = JSON.parse(localStorage.getItem("workouts")) || [];
    const workoutsToday = workouts.filter(workout => {
        const workoutDate = new Date(workout.date);
        const today = new Date();
        return workoutDate.getDate() === today.getDate() && workoutDate.getMonth() === today.getMonth() && workoutDate.getFullYear() === today.getFullYear();
    });
    updateWorkoutList(workoutsToday);
}
function updateWorkoutList(workouts) {
    const workoutList = document.getElementById("workout-list");
    const workoutMessage = document.getElementById("workout-message");
    if (!workoutList || !workoutMessage) return;
    
    workoutList.innerHTML = "";
    if (workouts.length === 0) {
        workoutMessage.textContent = "Nu există antrenamente adăugate încă.";
    } else {
        workoutMessage.textContent = "";
        workouts.forEach((workout, index) => {
            const listItem = document.createElement("li");
            listItem.innerHTML = `
                ${workout.exercise}: ${workout.reps} repetări - ${workout.weight} kg
                <button type="button" class="edit-btn" onclick="editWorkout('${workout.exercise}', '${workout.date}')">Editează</button>
                <button type="button" class="delete-btn" onclick="deleteWorkout('${workout.exercise}', '${workout.date}')">Șterge</button>
            `;
            workoutList.appendChild(listItem);
        });
    }
}
function deleteWorkout(exercise, date) {
    if (!confirm(`Ești sigur că vrei să ștergi exercițiul "${exercise}" din data ${new Date(date).toLocaleDateString()}?`)) {
        return;
    }

    const workouts = JSON.parse(localStorage.getItem("workouts")) || [];
    const updatedWorkouts = workouts.filter(workout => 
        !(workout.exercise === exercise && workout.date === date)
    );
    
    localStorage.setItem("workouts", JSON.stringify(updatedWorkouts));
    showMessage("workout-message", `Exercițiul "${exercise}" a fost șters cu succes!`, "green");
    loadWorkouts();
}
function editWorkout(exercise, date) {
    const workouts = JSON.parse(localStorage.getItem("workouts")) || [];
    const workout = workouts.find(w => w.exercise === exercise && w.date === date);
    if (!workout) return;

    // Setăm valorile în input-uri
    document.getElementById("exercise").value = workout.exercise;
    document.getElementById("reps").value = workout.reps;
    document.getElementById("weight").value = workout.weight;

    // Schimbăm textul butonului de adăugare
    const addButton = document.querySelector('button[onclick="addWorkout()"]');
    const originalText = addButton.textContent;
    addButton.textContent = "Actualizează";

    // După editare și apăsare pe "Actualizează", va actualiza în loc să adauge nou
    addButton.onclick = function() {
        const updatedExercise = document.getElementById("exercise")?.value.trim();
        const updatedReps = parseInt(document.getElementById("reps")?.value);
        const updatedWeight = parseInt(document.getElementById("weight")?.value);

        // Validări pentru actualizare
        if (!updatedExercise) {
            showMessage("workout-message", "Te rog să introduci un exercițiu.", "red");
            return;
        }
        if (isNaN(updatedReps) || updatedReps <= 0 || updatedReps > 100) {
            showMessage("workout-message", "Te rog să introduci un număr valid de repetări (1-100).", "red");
            return;
        }
        if (isNaN(updatedWeight) || updatedWeight < 0 || updatedWeight > 500) {
            showMessage("workout-message", "Te rog să introduci o greutate validă (0-500 kg).", "red");
            return;
        }

        // Actualizează antrenamentul
        const updatedWorkouts = workouts.map(w => {
            if (w.exercise === exercise && w.date === date) {
                return {
                    exercise: updatedExercise,
                    reps: updatedReps,
                    weight: updatedWeight,
                    date: date // Păstrăm data originală
                };
            }
            return w;
        });

        localStorage.setItem("workouts", JSON.stringify(updatedWorkouts));
        showMessage("workout-message", "Antrenament actualizat cu succes!", "green");
        loadWorkouts();

        // Resetăm butonul la starea originală
        addButton.textContent = originalText;
        addButton.onclick = addWorkout;
        
        // Curăță câmpurile
        document.getElementById("exercise").value = "";
        document.getElementById("reps").value = "";
        document.getElementById("weight").value = "";
    };
}
function goToProgress() {
    window.location.href = "progress.html";
}

function displayProgress() {
    const workouts = JSON.parse(localStorage.getItem("workouts")) || [];
    const progressContainer = document.getElementById("progress-data");

    if (!progressContainer) return;

    progressContainer.innerHTML = ""; // Curățăm conținutul anterior

    if (workouts.length === 0) {
        progressContainer.textContent = "Nu există antrenamente înregistrate.";
        return;
    }

    // Grupare antrenamente după exercițiu
    const exerciseMap = {};
    workouts.forEach(workout => {
        if (!exerciseMap[workout.exercise]) {
            exerciseMap[workout.exercise] = [];
        }
        exerciseMap[workout.exercise].push(workout);
    });

    // Creăm listă de progres pentru fiecare exercițiu
    for (const exercise in exerciseMap) {
        const workoutList = exerciseMap[exercise];
        let totalWeight = 0;

        const exerciseSection = document.createElement("div");
        exerciseSection.classList.add("exercise-progress");

        const title = document.createElement("h3");
        title.textContent = exercise;
        exerciseSection.appendChild(title);

        const list = document.createElement("ul");
        workoutList.forEach(item => {
            const listItem = document.createElement("li");
            const date = new Date(item.date).toLocaleDateString();
            listItem.textContent = `${date} - ${item.reps} repetări x ${item.weight} kg`;
            list.appendChild(listItem);

            totalWeight += item.weight * item.reps;
        });

        const totalInfo = document.createElement("p");
        totalInfo.textContent = `Greutate totală ridicată: ${totalWeight} kg`;

        exerciseSection.appendChild(list);
        exerciseSection.appendChild(totalInfo);
        progressContainer.appendChild(exerciseSection);
    }
}


const exerciseList = [
    "Genuflexiuni cu haltera", "Îndreptări românești", "Presă pentru picioare", "Fandări cu gantere",
    "Extensii la aparat", "Flexii pentru femurali la aparat", "Ridicări pe vârfuri",
    "Împins cu haltera la bancă orizontală", "Împins cu gantere la bancă înclinată", "Fluturări cu gantere",
    "Dips pentru piept", "Aparat pec-deck", "Împins la aparat (chest press)", "Tracțiuni la bară",
    "Ramat cu haltera", "Ramat cu gantera", "Lat pulldown", "Ramat la aparat", "Îndreptări clasice",
    "Flexii cu gantere", "Flexii ciocan", "Flexii cu bară Z", "Flexii la helcometru", "Flexii concentrate",
    "Flotări la paralele", "Extensii cu gantera deasupra capului", "Skull crushers", "Extensii la helcometru",
    "Flotări diamant","Bulgarian squad", "Sărituri cu coarda", "Box jumps", "Burpees", "Mountain climbers",
    "Plank", "Plank lateral", "Russian twists", "Crunches", "Leg raises", "Bicycle crunches","Flutter kicks",
    "Superman", "Glute bridges", "Hip thrusts", "Side lunges", "Wall sits", "Kettlebell swings","  Deadlifts",
    "Push-ups", "Pull-ups", "Dumbbell rows", "Bench press", "Incline bench press", "Chest flys"
];

function setupExerciseAutocomplete() {
    const exerciseInput = document.getElementById("exercise");
    if (!exerciseInput) return;
    
    const suggestionsContainer = document.createElement("ul");
    suggestionsContainer.classList.add("suggestions");
    exerciseInput.insertAdjacentElement("afterend", suggestionsContainer);

    exerciseInput.addEventListener("input", function () {
        const inputValue = this.value.toLowerCase().trim();
        suggestionsContainer.innerHTML = "";
        if (inputValue.length > 0) {
            const filteredExercises = exerciseList.filter(exercise =>
                exercise.toLowerCase().startsWith(inputValue)
            );
            filteredExercises.forEach(exercise => {
                const suggestionItem = document.createElement("li");
                suggestionItem.textContent = exercise;
                suggestionItem.classList.add("suggestion-item");
                suggestionItem.addEventListener("click", function () {
                    exerciseInput.value = exercise;
                    suggestionsContainer.innerHTML = "";
                });
                suggestionsContainer.appendChild(suggestionItem);
            });
            suggestionsContainer.style.display = "block";
        } else {
            suggestionsContainer.style.display = "none";
        }
    });

    exerciseInput.addEventListener("blur", () => {
        setTimeout(() => { suggestionsContainer.style.display = "none"; }, 200);
    });
}

let currentPage = 1;
const pageSize = 10;
async function getRecipes(page = 1) {
    const apiKey = '82d8893fda3b490f9b04e5a3ae451f1f'; // << înlocuiești cu cheia ta Spoonacular
    const url = `https://api.spoonacular.com/recipes/complexSearch?diet=high-protein&number=${pageSize}&offset=${(page-1)*pageSize}&addRecipeInformation=true&apiKey=${apiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        displayRecipes(data.results);
    } catch (error) {
        console.error("Eroare la încărcarea rețetelor:", error);
    }
}

function displayRecipes(recipes) {
    const container = document.getElementById("recipes");
    if (!container) return;

    container.innerHTML = ""; // Curăță conținutul anterior

    if (!recipes || recipes.length === 0) {
        container.innerHTML = "<p>Nu au fost găsite rețete.</p>";
        return;
    }

    recipes.forEach(recipe => {
        const card = document.createElement("div");
        card.classList.add("recipe-card");

        card.innerHTML = `
            <img src="${recipe.image}" alt="${recipe.title}">
            <h3>${recipe.title}</h3>
            <a href="${recipe.sourceUrl}" target="_blank">Vezi Rețeta</a>
        `;

        container.appendChild(card);
    });
}
//Buton incarcare rețete

// Butonul pentru încărcare
const loadMoreBtn = document.getElementById('loadMore');
document.addEventListener("DOMContentLoaded", () => {
    const loadMoreBtn = document.getElementById('loadMore');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', () => {
            currentPage++;
            getRecipes(currentPage);
        });
    }

    getRecipes(currentPage);
});

//seria de rețete 1
window.onload = () => {
    getRecipes(currentPage);
};

function navigateTo(page) {
  window.location.href = page;
}


function register() {
    const newUsername = document.getElementById("new-username")?.value.trim();
    const newPassword = document.getElementById("new-password")?.value.trim();

    if (!newUsername || !newPassword) {
        showMessage("register-message", "Te rog să completezi toate câmpurile.", "red");
        return;
    }

    const users = JSON.parse(localStorage.getItem("users")) || [];
    const existingUser = users.find(user => user.username === newUsername);

    if (existingUser) {
        showMessage("register-message", "Numele de utilizator există deja.", "red");
        return;
    }

    users.push({
        username: newUsername,
        password: btoa(newPassword)
    });

    localStorage.setItem("users", JSON.stringify(users));
    showMessage("register-message", "Înregistrare reușită! Acum te poți autentifica.", "green");
}

function login() {
    const username = document.getElementById("username")?.value.trim();
    const password = document.getElementById("password")?.value.trim();

    const users = JSON.parse(localStorage.getItem("users")) || [];
    const foundUser = users.find(user => user.username === username && user.password === btoa(password));

    if (foundUser) {
        localStorage.setItem("loggedInUser", username);
        showMessage("login-message", "Autentificare reușită!", "green");
        setTimeout(() => window.location.href = "workouts.html", 1000);
    } else {
        showMessage("login-message", "Nume utilizator sau parolă incorectă.", "red");
    }
}

function showMessage(elementId, message, color) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    element.textContent = message;
    element.style.color = color;
    
    // Adaugă animație pentru mesaj
    element.style.animation = 'none';
    element.offsetHeight; // Forțează reflow
    element.style.animation = 'fadeIn 0.5s';
    
    // Ascunde mesajul după 3 secunde dacă este un mesaj de succes
    if (color === "green") {
        setTimeout(() => {
            element.style.animation = 'fadeOut 0.5s';
            setTimeout(() => {
                element.textContent = "";
            }, 500);
        }, 3000);
    }
}

const workoutCategories = {
    PIEPT: "Piept",
    SPATE: "Spate",
    PICIORI: "Picioare",
    UMERI: "Umeri",
    BICEPS: "Biceps",
    TRICEPS: "Triceps",
    ABDOMEN: "Abdomen",
    CARDIO: "Cardio"
};

const workoutTemplates = {
    "Antrenament Piept": [
        { exercise: "Împins cu haltera la bancă orizontală", reps: 12, weight: 0 },
        { exercise: "Fluturări cu gantere", reps: 12, weight: 0 },
        { exercise: "Dips pentru piept", reps: 12, weight: 0 }
    ],
    "Antrenament Spate": [
        { exercise: "Tracțiuni la bară", reps: 10, weight: 0 },
        { exercise: "Ramat cu haltera", reps: 12, weight: 0 },
        { exercise: "Lat pulldown", reps: 12, weight: 0 }
    ],
    "Antrenament Picioare": [
        { exercise: "Genuflexiuni cu haltera", reps: 12, weight: 0 },
        { exercise: "Îndreptări românești", reps: 12, weight: 0 },
        { exercise: "Presă pentru picioare", reps: 12, weight: 0 }
    ]
};

let timerInterval;
let timeLeft = 0;

function startTimer(seconds) {
    timeLeft = seconds;
    const timerDisplay = document.getElementById('timer-display');
    if (!timerDisplay) return;

    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timerDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            playAlarm();
        }
        timeLeft--;
    }, 1000);
}

function playAlarm() {
    const audio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-alarm-digital-clock-beep-989.mp3');
    audio.play();
}

function exportWorkoutHistory() {
    const workouts = JSON.parse(localStorage.getItem("workouts")) || [];
    const csvContent = "data:text/csv;charset=utf-8," 
        + "Data,Exercițiu,Repetări,Greutate\n"
        + workouts.map(workout => {
            const date = new Date(workout.date).toLocaleDateString();
            return `${date},${workout.exercise},${workout.reps},${workout.weight}`;
        }).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "istoric_antrenamente.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Funcție pentru a aplica un șablon de antrenament
function applyWorkoutTemplate(templateName) {
    const template = workoutTemplates[templateName];
    if (!template) return;

    template.forEach(exercise => {
        document.getElementById("exercise").value = exercise.exercise;
        document.getElementById("reps").value = exercise.reps;
        document.getElementById("weight").value = exercise.weight;
        addWorkout();
    });
}

// Obiective și realizări
const achievements = {
    "Primul Antrenament": {
        description: "Completează primul tău antrenament",
        check: (workouts) => workouts.length >= 1
    },
    "Consistență": {
        description: "Completează 5 antrenamente",
        check: (workouts) => workouts.length >= 5
    },
    "Greutate Ridicată": {
        description: "Ridică peste 1000kg în total",
        check: (workouts) => workouts.reduce((total, w) => total + (w.weight * w.reps), 0) >= 1000
    }
};

function checkAchievements() {
    const workouts = JSON.parse(localStorage.getItem("workouts")) || [];
    const userAchievements = JSON.parse(localStorage.getItem("userAchievements")) || [];
    const newAchievements = [];

    for (const [achievement, data] of Object.entries(achievements)) {
        if (!userAchievements.includes(achievement) && data.check(workouts)) {
            newAchievements.push(achievement);
            userAchievements.push(achievement);
        }
    }

    if (newAchievements.length > 0) {
        localStorage.setItem("userAchievements", JSON.stringify(userAchievements));
        showAchievementNotification(newAchievements);
    }
}

function showAchievementNotification(achievements) {
    const notification = document.createElement("div");
    notification.className = "achievement-notification";
    notification.innerHTML = `
        <h3>Felicitări! Ai deblocat:</h3>
        <ul>
            ${achievements.map(a => `<li>${a}</li>`).join("")}
        </ul>
    `;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 5000);
}

// Funcție pentru a desena graficul progresului
function drawProgressChart() {
    const workouts = JSON.parse(localStorage.getItem("workouts")) || [];
    const ctx = document.getElementById('progressChart');
    if (!ctx) return;

    // Grupare antrenamente după exercițiu
    const exerciseData = {};
    workouts.forEach(workout => {
        if (!exerciseData[workout.exercise]) {
            exerciseData[workout.exercise] = [];
        }
        exerciseData[workout.exercise].push({
            date: new Date(workout.date),
            weight: workout.weight,
            reps: workout.reps
        });
    });

    // Creare grafic pentru fiecare exercițiu
    for (const [exercise, data] of Object.entries(exerciseData)) {
        const dates = data.map(d => d.date.toLocaleDateString());
        const weights = data.map(d => d.weight);
        const reps = data.map(d => d.reps);

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: dates,
                datasets: [{
                    label: `${exercise} - Greutate`,
                    data: weights,
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.1
                }, {
                    label: `${exercise} - Repetări`,
                    data: reps,
                    borderColor: 'rgb(255, 99, 132)',
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
}

// Funcții pentru pagina de progres
function updateProgressCharts() {
    const workouts = JSON.parse(localStorage.getItem("workouts")) || [];
    const selectedExercise = document.getElementById("exercise-filter").value;
    const timeFilter = document.getElementById("time-filter").value;
    
    // Filtrare date
    let filteredWorkouts = workouts;
    if (selectedExercise) {
        filteredWorkouts = workouts.filter(w => w.exercise === selectedExercise);
    }
    
    if (timeFilter !== "all") {
        const daysAgo = new Date();
        daysAgo.setDate(daysAgo.getDate() - parseInt(timeFilter));
        filteredWorkouts = filteredWorkouts.filter(w => new Date(w.date) >= daysAgo);
    }

    // Sortare după dată
    filteredWorkouts.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Pregătire date pentru grafice
    const dates = filteredWorkouts.map(w => new Date(w.date).toLocaleDateString());
    const weights = filteredWorkouts.map(w => w.weight);
    const reps = filteredWorkouts.map(w => w.reps);
    const volumes = filteredWorkouts.map(w => w.weight * w.reps);

    // Actualizare grafice
    updateWeightChart(dates, weights);
    updateRepsChart(dates, reps);
    updateVolumeChart(dates, volumes);
    updateGeneralStats(filteredWorkouts);
}

function updateWeightChart(dates, weights) {
    const ctx = document.getElementById('weightChart');
    if (!ctx) return;

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [{
                label: 'Greutate (kg)',
                data: weights,
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Greutate (kg)'
                    }
                }
            }
        }
    });
}

function updateRepsChart(dates, reps) {
    const ctx = document.getElementById('repsChart');
    if (!ctx) return;

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [{
                label: 'Repetări',
                data: reps,
                borderColor: 'rgb(255, 99, 132)',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Repetări'
                    }
                }
            }
        }
    });
}

function updateVolumeChart(dates, volumes) {
    const ctx = document.getElementById('volumeChart');
    if (!ctx) return;

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [{
                label: 'Volum Total (kg)',
                data: volumes,
                borderColor: 'rgb(153, 102, 255)',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Volum Total (kg)'
                    }
                }
            }
        }
    });
}

function updateGeneralStats(workouts) {
    const statsContainer = document.getElementById('general-stats');
    if (!statsContainer) return;

    if (workouts.length === 0) {
        statsContainer.innerHTML = '<p>Nu există date pentru perioada selectată.</p>';
        return;
    }

    const totalVolume = workouts.reduce((sum, w) => sum + (w.weight * w.reps), 0);
    const maxWeight = Math.max(...workouts.map(w => w.weight));
    const totalReps = workouts.reduce((sum, w) => sum + w.reps, 0);
    const uniqueExercises = new Set(workouts.map(w => w.exercise)).size;

    statsContainer.innerHTML = `
        <div class="stat-item">
            <h4>Volum Total</h4>
            <p>${totalVolume} kg</p>
        </div>
        <div class="stat-item">
            <h4>Greutate Maximă</h4>
            <p>${maxWeight} kg</p>
        </div>
        <div class="stat-item">
            <h4>Total Repetări</h4>
            <p>${totalReps}</p>
        </div>
        <div class="stat-item">
            <h4>Exerciții Unice</h4>
            <p>${uniqueExercises}</p>
        </div>
    `;
}

function exportProgressData() {
    const workouts = JSON.parse(localStorage.getItem("workouts")) || [];
    const csvContent = "data:text/csv;charset=utf-8," 
        + "Data,Exercițiu,Repetări,Greutate,Volum\n"
        + workouts.map(workout => {
            const date = new Date(workout.date).toLocaleDateString();
            const volume = workout.weight * workout.reps;
            return `${date},${workout.exercise},${workout.reps},${workout.weight},${volume}`;
        }).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "progres_antrenamente.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Inițializare pagină progres
document.addEventListener("DOMContentLoaded", () => {
    if (window.location.pathname.includes("progress.html")) {
        const workouts = JSON.parse(localStorage.getItem("workouts")) || [];
        const exerciseFilter = document.getElementById("exercise-filter");
        
        // Populare selector exerciții
        const uniqueExercises = [...new Set(workouts.map(w => w.exercise))];
        uniqueExercises.forEach(exercise => {
            const option = document.createElement("option");
            option.value = exercise;
            option.textContent = exercise;
            exerciseFilter.appendChild(option);
        });

        // Inițializare grafice
        updateProgressCharts();
    }
});

// Funcții pentru gestionarea vizibilității butonului "Află mai multe despre aplicație"
function checkLoginStatus() {
    const loggedInUser = localStorage.getItem('loggedInUser');
    const aboutButton = document.querySelector('.about-app-button');
    if (aboutButton) {
        aboutButton.style.display = loggedInUser ? 'block' : 'none';
    }
}

// Extinderea funcțiilor de autentificare și înregistrare
const originalLogin = window.login;
window.login = function() {
    originalLogin();
    const loginMessage = document.getElementById('login-message');
    if (loginMessage && loginMessage.textContent.includes('reușită')) {
        checkLoginStatus();
    }
};

const originalRegister = window.register;
window.register = function() {
    originalRegister();
    const registerMessage = document.getElementById('register-message');
    if (registerMessage && registerMessage.textContent.includes('reușită')) {
        checkLoginStatus();
    }
};

// Verifică starea de autentificare la încărcarea paginii
document.addEventListener('DOMContentLoaded', function() {
    checkLoginStatus();
});

