document.addEventListener("DOMContentLoaded", () => {
    loadWorkouts();
    setupExerciseAutocomplete();
});

function addWorkout() {
    const exercise = document.getElementById("exercise")?.value.trim();
    const reps = parseInt(document.getElementById("reps")?.value);
    const weight = parseInt(document.getElementById("weight")?.value);
    
    if (!exercise || isNaN(reps) || isNaN(weight)) return;

    const workout = { exercise, reps, weight, date: new Date().toISOString() };
    const workouts = JSON.parse(localStorage.getItem("workouts")) || [];
    workouts.push(workout);
    localStorage.setItem("workouts", JSON.stringify(workouts));
    
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
                <button class="edit-btn" onclick="editWorkout(${index})">Editează</button>
                <button class="delete-btn" onclick="deleteWorkout(${index})">Șterge</button>
            `;
            workoutList.appendChild(listItem);
        });
    }
}
function deleteWorkout(index) {
    const workouts = JSON.parse(localStorage.getItem("workouts")) || [];
    workouts.splice(index, 1); // Ștergem workout-ul de la poziția "index"
    localStorage.setItem("workouts", JSON.stringify(workouts));
    loadWorkouts(); // Reîncărcăm lista
}
function editWorkout(index) {
    const workouts = JSON.parse(localStorage.getItem("workouts")) || [];
    const workout = workouts[index];
    if (!workout) return;

    // Setăm valorile în input-uri
    document.getElementById("exercise").value = workout.exercise;
    document.getElementById("reps").value = workout.reps;
    document.getElementById("weight").value = workout.weight;

    // După editare și apăsare pe "Adaugă", va actualiza în loc să adauge nou
    document.querySelector('button[onclick="addWorkout()"]').onclick = function() {
        const updatedExercise = document.getElementById("exercise")?.value.trim();
        const updatedReps = parseInt(document.getElementById("reps")?.value);
        const updatedWeight = parseInt(document.getElementById("weight")?.value);

        if (!updatedExercise || isNaN(updatedReps) || isNaN(updatedWeight)) return;

        workouts[index] = { 
            exercise: updatedExercise, 
            reps: updatedReps, 
            weight: updatedWeight, 
            date: new Date().toISOString() 
        };
        localStorage.setItem("workouts", JSON.stringify(workouts));
        loadWorkouts();

        // Resetăm butonul la funcția originală
        document.querySelector('button[onclick]').onclick = addWorkout;
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
    "Flotări diamant"
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
}

