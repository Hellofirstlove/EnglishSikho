// =============================================
//  THEME (Day / Night) TOGGLE
// =============================================
const root = document.documentElement;

const themeToggle = document.getElementById("theme-toggle");
const themeToggleMobile = document.getElementById("theme-toggle-mobile");
const themeIcon = document.getElementById("theme-icon");
const themeIconMobile = document.getElementById("theme-icon-mobile");
const themeLabelMobile = document.getElementById("theme-label-mobile");

const applyTheme = (theme) => {
  root.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);

  if (theme === "dark") {
    themeIcon.className = "fa-solid fa-moon text-indigo-400 text-xl";
    themeIconMobile.className = "fa-solid fa-moon";
    themeLabelMobile.textContent = "Dark Mode";
  } else {
    themeIcon.className = "fa-solid fa-sun text-yellow-400 text-xl";
    themeIconMobile.className = "fa-solid fa-sun";
    themeLabelMobile.textContent = "Light Mode";
  }
};

// Load saved theme on startup
const savedTheme = localStorage.getItem("theme") || "light";
applyTheme(savedTheme);

themeToggle.addEventListener("click", () => {
  const next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
  applyTheme(next);
});

themeToggleMobile.addEventListener("click", () => {
  const next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
  applyTheme(next);
});

// =============================================
//  AUTH  (Login / Logout)
// =============================================
const loginSection = document.getElementById("login-section");
const mainContent = document.getElementById("main-content");
const desktopAuth = document.getElementById("desktop-auth");
const mobileAuthItem = document.getElementById("mobile-auth-item");
const userGreeting = document.getElementById("user-greeting");
const loginError = document.getElementById("login-error");

const updateAuthUI = (loggedIn) => {
  if (loggedIn) {
    const name = localStorage.getItem("userName") || "User";

    // Show main content, hide login
    loginSection.classList.add("hidden");
    mainContent.classList.remove("hidden");

    // Update greeting
    userGreeting.textContent = name;

    // Desktop logout button
    desktopAuth.innerHTML = `
      <button id="btn-logout-desktop"
        class="btn btn-error btn-dash">
        <i class="fa-solid fa-arrow-right-from-bracket"></i> Logout
      </button>`;

    // Mobile logout item
    mobileAuthItem.innerHTML = `
      <button id="btn-logout-mobile" class="flex items-center gap-2 w-full text-left text-error">
        <i class="fa-solid fa-arrow-right-from-bracket"></i> Logout
      </button>`;

    document
      .getElementById("btn-logout-desktop")
      .addEventListener("click", handleLogout);
    document
      .getElementById("btn-logout-mobile")
      .addEventListener("click", handleLogout);

    // Load lessons now that user is in
    loadLessons();
  } else {
    // Show login, hide main content
    loginSection.classList.remove("hidden");
    mainContent.classList.add("hidden");

    // Desktop login prompt
    desktopAuth.innerHTML = `
      <span class="text-sm text-gray-400 font-medium">Please login to start learning</span>`;

    // Mobile login prompt
    mobileAuthItem.innerHTML = `
      <span class="text-sm text-gray-400">Please login</span>`;
  }
};

const handleLogout = () => {
  localStorage.removeItem("loggedIn");
  localStorage.removeItem("userName");
  updateAuthUI(false);
};

// Login button
document.getElementById("btn-login").addEventListener("click", () => {
  const name = document.getElementById("input-name").value.trim();
  const pass = document.getElementById("input-pass").value.trim();

  if (name && pass) {
    loginError.classList.add("hidden");
    localStorage.setItem("loggedIn", "true");
    localStorage.setItem("userName", name);
    updateAuthUI(true);
  } else {
    loginError.classList.remove("hidden");
  }
});

// Allow pressing Enter on password field to submit
document.getElementById("input-pass").addEventListener("keydown", (e) => {
  if (e.key === "Enter") document.getElementById("btn-login").click();
});



// =============================================
//  VOCABULARY HELPERS
// =============================================
const createElements = (arr) => {
  const htmlElements = arr.map((el) => `<span class="btn">${el}</span>`);
  return htmlElements.join(" ");
};

function pronounceWord(word) {
  const utterance = new SpeechSynthesisUtterance(word);
  utterance.lang = "en-EN";
  window.speechSynthesis.speak(utterance);
}

const manageSpinner = (status) => {
  if (status == true) {
    document.getElementById("spinner").classList.remove("hidden");
    document.getElementById("word-container").classList.add("hidden");
  } else {
    document.getElementById("word-container").classList.remove("hidden");
    document.getElementById("spinner").classList.add("hidden");
  }
};

const loadLessons = () => {
  fetch("https://openapi.programming-hero.com/api/levels/all")
    .then((res) => res.json())
    .then((json) => displayLesson(json.data));
};

// Reset word-container to the initial "select a lesson" placeholder
const resetToHome = () => {
  removeActive();
  document.getElementById("input-search").value = "";
  document.getElementById("btn-back-home").classList.add("hidden");
  document.getElementById("word-container").innerHTML = `
    <div class="text-center bg-base-100 col-span-full rounded-xl py-10 space-y-6 font-bangla">
      <p class="text-xl font-medium text-base-content/50">
        আপনি এখনো কোন Lesson Select করেন নি
      </p>
      <h2 class="font-bold text-4xl">একটি Lesson Select করুন।</h2>
    </div>
  `;
};


const removeActive = () => {
  const lessonButtons = document.querySelectorAll(".lesson-btn");
  lessonButtons.forEach((btn) => btn.classList.remove("active"));
};

const loadLevelWord = (id) => {
  manageSpinner(true);
  const url = `https://openapi.programming-hero.com/api/level/${id}`;
  fetch(url)
    .then((res) => res.json())
    .then((data) => {
      removeActive();
      const clickBtn = document.getElementById(`lesson-btn-${id}`);
      clickBtn.classList.add("active");
      displayLevelWord(data.data);
    });
};

const loadWordDetail = async (id) => {
  const url = `https://openapi.programming-hero.com/api/word/${id}`;
  const res = await fetch(url);
  const details = await res.json();
  displayWordDetails(details.data);
};

const displayWordDetails = (word) => {
  const detailsBox = document.getElementById("details-container");
  detailsBox.innerHTML = `
    <div>
      <h2 class="text-2xl font-bold">
        ${word.word} (<i class="fa-solid fa-microphone-lines"></i> :${word.pronunciation})
      </h2>
    </div>
    <div>
      <h2 class="font-bold">Meaning</h2>
      <p>${word.meaning}</p>
    </div>
    <div>
      <h2 class="font-bold">Example</h2>
      <p>${word.sentence}</p>
    </div>
    <div>
      <h2 class="font-bold">Synonym</h2>
      <div>${createElements(word.synonyms)}</div>
    </div>
  `;
  document.getElementById("word_modal").showModal();
};

const displayLevelWord = (words) => {
  const wordContainer = document.getElementById("word-container");
  wordContainer.innerHTML = "";

  // Always show the back button whenever any results are rendered
  document.getElementById("btn-back-home").classList.remove("hidden");

  if (words.length == 0) {
    wordContainer.innerHTML = `
      <div class="text-center col-span-full rounded-xl py-10 space-y-6 font-bangla">
        <img class="mx-auto" src="./assets/alert-error.png"/>
        <p class="text-xl font-medium text-base-content/50">
          এই Lesson এ এখনো কোন Vocabulary যুক্ত করা হয়নি।
        </p>
        <h2 class="font-bold text-4xl">নেক্সট Lesson এ যান</h2>
      </div>
    `;
    manageSpinner(false);
    return;
  }

  words.forEach((word) => {
    const card = document.createElement("div");
    card.innerHTML = `
      <div class="bg-base-100 rounded-xl shadow-sm text-center py-10 px-5 space-y-4">
        <h2 class="font-bold text-2xl">${word.word ? word.word : "শব্দ পাওয়া যায়নি"}</h2>
        <p class="font-semibold">Meaning / Pronunciation</p>
        <div class="text-2xl font-medium font-bangla">"${
          word.meaning ? word.meaning : "অর্থ পাওয়া যায়নি"
        } / ${word.pronunciation ? word.pronunciation : "Pronunciation পাওয়া যায়নি"}"</div>
        <div class="flex justify-between items-center">
          <button onclick="loadWordDetail(${word.id})" class="btn bg-[#1A91FF10] hover:bg-[#1A91FF80]">
            <i class="fa-solid fa-circle-info"></i>
          </button>
          <button onclick="pronounceWord('${word.word}')" class="btn bg-[#1A91FF10] hover:bg-[#1A91FF80]">
            <i class="fa-solid fa-volume-high"></i>
          </button>
        </div>
      </div>
    `;
    wordContainer.append(card);
  });
  manageSpinner(false);
};

const displayLesson = (lessons) => {
  const levelContainer = document.getElementById("level-container");
  levelContainer.innerHTML = "";

  for (let lesson of lessons) {
    const btnDiv = document.createElement("div");
    btnDiv.innerHTML = `
      <button id="lesson-btn-${lesson.level_no}" onclick="loadLevelWord(${lesson.level_no})"
        class="btn btn-outline btn-primary lesson-btn">
        <i class="fa-solid fa-book-open"></i> Lesson - ${lesson.level_no}
      </button>
    `;
    levelContainer.append(btnDiv);
  }
};

// Search (only when logged in)
document.getElementById("btn-search").addEventListener("click", () => {
  removeActive();
  const input = document.getElementById("input-search");
  const searchValue = input.value.trim().toLowerCase();
  if (!searchValue) return;

  manageSpinner(true);
  fetch("https://openapi.programming-hero.com/api/words/all")
    .then((res) => res.json())
    .then((data) => {
      const allWords = data.data;
      const filterWords = allWords.filter((word) =>
        word.word.toLowerCase().includes(searchValue)
      );
      displayLevelWord(filterWords);
      // Show the back button after search
      document.getElementById("btn-back-home").classList.remove("hidden");
    });
});

// Allow pressing Enter in search input to trigger search
document.getElementById("input-search").addEventListener("keydown", (e) => {
  if (e.key === "Enter") document.getElementById("btn-search").click();
});

// Back to Home button
document.getElementById("btn-back-home").addEventListener("click", resetToHome);

// "Learn" navbar buttons → reset view and scroll to lessons
const goToLessons = (e) => {
  e.preventDefault();
  if (localStorage.getItem("loggedIn") === "true") {
    resetToHome();
    document.getElementById("level-container").scrollIntoView({ behavior: "smooth", block: "start" });
  } else {
    document.getElementById("login-section").scrollIntoView({ behavior: "smooth", block: "start" });
  }
};

document.getElementById("btn-learn-desktop").addEventListener("click", goToLessons);
document.getElementById("btn-learn-mobile").addEventListener("click", goToLessons);

// Logo + Home buttons → scroll to top of page (Home)
const goHome = (e) => {
  e.preventDefault();
  resetToHome();
  window.scrollTo({ top: 0, behavior: "smooth" });
};

document.getElementById("btn-logo").addEventListener("click", goHome);
document.getElementById("btn-home-desktop").addEventListener("click", goHome);
document.getElementById("btn-home-mobile").addEventListener("click", goHome);

// "FAQ" navbar buttons → scroll to FAQ section
const goToFAQ = (e) => {
  e.preventDefault();
  document.getElementById("faq-section").scrollIntoView({ behavior: "smooth", block: "start" });
};

document.querySelectorAll("a[href='#']").forEach((link) => {
  if (link.textContent.trim().includes("FAQ")) {
    link.addEventListener("click", goToFAQ);
  }
});

// =============================================
//  INIT – must be LAST so all functions are defined
// =============================================
const isLoggedIn = localStorage.getItem("loggedIn") === "true";
updateAuthUI(isLoggedIn);
