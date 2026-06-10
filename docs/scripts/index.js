// ========================================
// CONTINUE LESSON BUTTON
// ========================================

const continueBtn =
  document.getElementById("continueBtn");

const lastQuiz =
  Storage.get("last-quiz");

// hide by default
continueBtn.style.display = "none";

// only show if a saved quiz exists
if (
  lastQuiz &&
  lastQuiz.lesson
) {

  continueBtn.style.display = "block";

  continueBtn.addEventListener("click", () => {

    window.location.href =
      `learn.html?course=${lastQuiz.lesson}`;

  });

}

// ========================================
// LOAD PROGRESS UI
// ========================================

function loadProgressUI() {

  const progressData =
    Storage.get("progress", {
      internet: 0,
      network: 0,
      uiux: 0
    });

  document.querySelectorAll(".card")
    .forEach(card => {

      const course =
        card.getAttribute("data-course");

      const value =
        progressData[course] || 0;

      const bar =
        card.querySelector(".progress-bar");

      const percent =
        card.querySelector(".progress-percentage");

      if (bar) {

        bar.style.width =
          value + "%";

      }

      if (percent) {

        percent.textContent =
          value + "%";

      }

    });

}

// ========================================
// PAGE LOAD
// ========================================

window.addEventListener("load", () => {

  loadProgressUI();

});

const COURSE_ORDER = ["internet", "network", "uiux"];

// get progress from storage
function getProgress() {
    return Storage.get("progress", {
        internet: 0,
        network: 0,
        uiux: 0
    });
}

function isUnlocked(course, progress) {
    const index = COURSE_ORDER.indexOf(course);

    if (index === 0) return true; // first course always unlocked

    const prevCourse = COURSE_ORDER[index - 1];

    return progress[prevCourse] >= 100;
}

function updateCourseUI() {
    const progress = getProgress();

    COURSE_ORDER.forEach(course => {
        const card = document.querySelector(`[data-course="${course}"]`);
        if (!card) return;

        const unlocked = isUnlocked(course, progress);

        if (!unlocked) {
            card.classList.add("card-locked");

            // disable click
            const link = card.closest("a");
            if (link) {
                link.removeAttribute("href");

                link.style.pointerEvents = "none";
                link.style.opacity = "0.5";
            }
        } else {
            card.classList.remove("card-locked");
        }
    });
}

updateCourseUI();