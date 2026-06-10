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