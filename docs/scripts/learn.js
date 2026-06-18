function getCourseFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get("course");
}

const selectedCourse = getCourseFromURL();

// =========================================
// LESSON STATE
// =========================================

let lessonData = null;
let currentQuestionIndex = 0;

// =========================================
// UI REFS
// =========================================

const materialView = document.getElementById("materialView");
const materialContent = document.getElementById("materialContent");

const quizView = document.getElementById("quizView");

const questionCounter =
  document.getElementById("questionCounter");

const quizProgressBar =
  document.getElementById("quizProgressBar");

const questionText =
  document.getElementById("questionText");

const choicesContainer =
  document.getElementById("choicesContainer");

const explanationBox =
  document.getElementById("explanationBox");

const explanationTitle =
  document.getElementById("explanationTitle");

const explanationText =
  document.getElementById("explanationText");

const nextQuestionBtn =
  document.getElementById("nextQuestionBtn");

const startQuizBtn =
  document.getElementById("startQuizBtn");

// =========================================
// LOAD LESSON
// =========================================

async function loadLesson(lessonJSONString) {

  try {

    lessonData = JSON.parse(lessonJSONString);

    renderMaterials();

    document.querySelector(".nav-title").textContent =
      lessonData.title;

  }

  catch (err) {

    console.error(err);

    materialContent.innerHTML =
      "<p>Failed to load lesson.</p>";

  }

}

// =========================================
// RENDER MATERIALS
// =========================================

function renderMaterials() {

  materialContent.innerHTML = "";

  lessonData.materials.forEach(material => {

    // TEXT
    if (material.type === "text") {

      materialContent.innerHTML += `
        <div class="text-block">
          <p>${material.content}</p>
        </div>
      `;

    }

    // IMAGE
    else if (material.type === "image") {

      materialContent.innerHTML += `
        <div class="text-block">

          <img
            src="${material.src}"
            alt=""
            style="width:100%; border-radius:16px;"
          >

          <p>${material.caption}</p>

        </div>
      `;

    }

    // VIDEO
    else if (material.type === "video") {

      materialContent.innerHTML += `
        <div class="video-card">

          <video controls style="width:100%; border-radius:16px;">

            <source src="${material.src}">

          </video>

          <p class="video-caption">
            ${material.caption}
          </p>

        </div>
      `;

    }

  });

}

// =========================================
// START QUIZ
// =========================================

startQuizBtn.addEventListener("click", () => {

  materialView.style.display = "none";

  quizView.style.display = "block";

  const lastQuiz =
    Storage.get("last-quiz");

  // default
  currentQuestionIndex = 0;

  // resume if same lesson
  if (
    lastQuiz &&
    lastQuiz.lesson === selectedCourse
  ) {

    const savedQuestion =
      Number(lastQuiz.question);

    // bounds check
    if (
      !isNaN(savedQuestion) &&
      savedQuestion >= 0 &&
      savedQuestion < lessonData.questions.length
    ) {

      currentQuestionIndex = savedQuestion;

    }

  }

  renderQuestion();

});

// =========================================
// RENDER QUESTION
// =========================================

function renderQuestion() {

  const question =
    lessonData.questions[currentQuestionIndex];


  // =========================
  // COUNTER
  // =========================

  questionCounter.textContent =
    `Question ${currentQuestionIndex + 1} of ${lessonData.questions.length}`;

  // =========================
  // QUIZ PROGRESS BAR
  // =========================

  const progress =
    ((currentQuestionIndex + 1)
      / lessonData.questions.length) * 100;

  quizProgressBar.style.width =
    `${progress}%`;

  // =========================
  // QUESTION TEXT
  // =========================

  questionText.textContent =
    question.question;

  // =========================
  // RESET UI
  // =========================

  choicesContainer.innerHTML = "";

  explanationBox.style.display = "none";

  nextQuestionBtn.style.display = "none";

  // =========================
  // RENDER CHOICES
  // =========================

  question.choices.forEach(choice => {

    const btn =
      document.createElement("button");

    btn.className = "option-row";

    btn.innerHTML = `
      <span class="option-text">
        ${choice.text}
      </span>
    `;

    btn.addEventListener("click", () => {

      handleAnswer(choice, btn);

    });

    choicesContainer.appendChild(btn);

  });

}

// =========================================
// HANDLE ANSWER
// =========================================

const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

function handleAnswer(choice, button) {

  // disable all buttons
  document.querySelectorAll(".option-row")
    .forEach(btn => btn.disabled = true);

  // reset explanation styles
  explanationBox.classList.remove("correct");
  explanationBox.classList.remove("wrong");

  // =====================================
  // UPDATE COURSE PROGRESS
  // =====================================

  let progressData =
    Storage.get("progress", {
      internet: 0,
      network: 0,
      uiux: 0
    });



  const totalQuestions =
    lessonData.questions.length;

  const completedQuestions =
    currentQuestionIndex + 1;

  const percentage =
    Math.floor(
      (completedQuestions / totalQuestions) * 100
    );

  progressData[selectedCourse] =
    percentage;

  Storage.set("progress", progressData);

  Storage.set("last-quiz", {
    lesson: selectedCourse,
    question: currentQuestionIndex + 1
  });

  // =====================================
  // CORRECT ANSWER
  // =====================================

  if (choice.correct) {

    button.classList.add("is-correct");

    explanationTitle.textContent =
      "Correct!";

    explanationBox.classList.add("correct");

    document.querySelector(".explain-header i").className =
      "ri-checkbox-circle-line";

  }

  // =====================================
  // WRONG ANSWER
  // =====================================

  else {

    button.classList.add("is-wrong");

    explanationTitle.textContent =
      "Incorrect";

    explanationBox.classList.add("wrong");

    document.querySelector(".explain-header i").className =
      "ri-close-circle-line";

  }

  // =====================================
  // COMMENT
  // =====================================

  explanationText.textContent =
    choice.comment;

  explanationBox.style.display =
    "block";

  nextQuestionBtn.style.display =
    "block";

}

// =========================================
// NEXT QUESTION
// =========================================

nextQuestionBtn.addEventListener("click", () => {

  currentQuestionIndex++;

  // finished
  if (
    currentQuestionIndex >=
    lessonData.questions.length
  ) {

    let progressData =
      Storage.get("progress", {});

    progressData[selectedCourse] = 100;

    Storage.set("progress", progressData);

    Storage.remove("last-quiz");

    quizView.innerHTML = `
      <div class="text-block">

        <h2>
          Quiz Complete 🎉
        </h2>

        <p>
          You finished the lesson.
        </p>

      </div>
    `;

    return;

  }

  renderQuestion();

});

// =========================================
// LESSON DATA
// =========================================

const lessonRawData = {};
lessonRawData["internet"] = `
{"id":"internet-basics","title":"How to Use Internet","description":"Learn the fundamentals of internet usage.","thumbnail":"assets/internet/thumb.png","materials":[{"type":"text","content":"The internet is a global network connecting millions of computers and devices."},{"type":"image","src":"assets/internet/network-diagram.png","caption":"Example of a network diagram"},{"type":"video","src":"assets/internet/intro.mp4","caption":"Introduction video"}],"questions":[{"id":0,"question":"What does the internet connect?","choices":[{"text":"Only phones","correct":false,"comment":"The internet connects much more than phones."},{"text":"Computers and devices worldwide","correct":true,"comment":"Correct! The internet connects devices around the world."},{"text":"Only websites","correct":false,"comment":"Websites are only one service on the internet."}]},{"id":1,"question":"Which device can access the internet?","choices":[{"text":"Laptop","correct":true,"comment":"Correct! Laptops can connect to the internet."},{"text":"Stone","correct":false,"comment":"A stone cannot access the internet."},{"text":"Smartphone","correct":true,"comment":"Correct! Smartphones can access the internet."}]},{"id":2,"question":"What is a website?","choices":[{"text":"A collection of webpages","correct":true,"comment":"Correct! Websites contain multiple webpages."},{"text":"A physical computer","correct":false,"comment":"A website is not hardware."},{"text":"An internet cable","correct":false,"comment":"Cables connect devices, not websites."}]},{"id":3,"question":"Which program is commonly used to browse the internet?","choices":[{"text":"Web browser","correct":true,"comment":"Correct! Browsers like Chrome or Firefox are used to access websites."},{"text":"Calculator","correct":false,"comment":"Calculators are not used for browsing."},{"text":"Paint app","correct":false,"comment":"Paint apps are for drawing."}]},{"id":4,"question":"What should you do before clicking an unknown link?","choices":[{"text":"Click immediately","correct":false,"comment":"Unknown links may be unsafe."},{"text":"Check if the link is trustworthy","correct":true,"comment":"Correct! Always verify links before opening them."},{"text":"Turn off your monitor","correct":false,"comment":"That does not improve safety."}]},{"id":5,"question":"What is Wi-Fi used for?","choices":[{"text":"Cooking food","correct":false,"comment":"Wi-Fi is unrelated to cooking."},{"text":"Connecting devices wirelessly to the internet","correct":true,"comment":"Correct! Wi-Fi allows wireless internet access."},{"text":"Charging batteries","correct":false,"comment":"Wi-Fi does not charge devices."}]},{"id":6,"question":"What is a search engine?","choices":[{"text":"A tool used to find information online","correct":true,"comment":"Correct! Search engines help users find websites and information."},{"text":"A car engine","correct":false,"comment":"That is unrelated to the internet."},{"text":"A type of monitor","correct":false,"comment":"Monitors display images, not search results."}]},{"id":7,"question":"Why are passwords important?","choices":[{"text":"They protect accounts and personal information","correct":true,"comment":"Correct! Strong passwords improve online security."},{"text":"They make the internet faster","correct":false,"comment":"Passwords do not affect internet speed."},{"text":"They charge your device","correct":false,"comment":"Passwords do not provide power."}]},{"id":8,"question":"What should you do if a website asks for sensitive information unexpectedly?","choices":[{"text":"Provide it immediately","correct":false,"comment":"Never share sensitive information carelessly."},{"text":"Verify the website first","correct":true,"comment":"Correct! Always confirm the site's authenticity."},{"text":"Ignore all websites forever","correct":false,"comment":"You only need to be cautious, not avoid the internet entirely."}]},{"id":9,"question":"What is the main purpose of the internet?","choices":[{"text":"Connecting people and sharing information","correct":true,"comment":"Correct! The internet enables communication and information sharing."},{"text":"Only playing games","correct":false,"comment":"Games are only one use of the internet."},{"text":"Replacing electricity","correct":false,"comment":"The internet depends on electricity."}]}]}
`
lessonRawData["network"] = `
{"id":"networking-basics","title":"Networking Basics","description":"Learn the fundamental concepts of computer networking.","thumbnail":"assets/network/thumb.png","materials":[{"type":"text","content":"A computer network is a group of interconnected devices that can communicate and share resources with one another."},{"type":"image","src":"assets/network/network-diagram.png","caption":"Example of a network diagram"},{"type":"video","src":"assets/network/intro.mp4","caption":"Introduction video"}],"questions":[{"id":0,"question":"What is a computer network?","choices":[{"text":"A single computer working alone","correct":false,"comment":"A network requires multiple devices."},{"text":"Two or more interconnected devices sharing resources","correct":true,"comment":"Correct! Networks allow devices to share data and communicate."},{"text":"A specific type of computer hardware","correct":false,"comment":"A network refers to the connection between hardware, not the hardware itself."}]},{"id":1,"question":"What is the primary function of a router?","choices":[{"text":"To connect multiple networks and route data traffic","correct":true,"comment":"Correct! Routers direct data packets between different networks."},{"text":"To display web pages on a screen","correct":false,"comment":"That is the function of a web browser."},{"text":"To store large amounts of files securely","correct":false,"comment":"That is the function of a hard drive or server."}]},{"id":2,"question":"What does LAN stand for?","choices":[{"text":"Large Area Network","correct":false,"comment":"The term for a large area is a WAN (Wide Area Network)."},{"text":"Logical Access Node","correct":false,"comment":"This is not a standard networking term."},{"text":"Local Area Network","correct":true,"comment":"Correct! A LAN connects devices in a small, localized area like a home or office."}]},{"id":3,"question":"What is the purpose of an IP address?","choices":[{"text":"A unique numerical identifier for a device on a network","correct":true,"comment":"Correct! IP addresses help route data to the exact correct device."},{"text":"A physical street address of an office building","correct":false,"comment":"An IP address is digital, not physical."},{"text":"A secret password for Wi-Fi","correct":false,"comment":"Passwords secure access, but they are not IP addresses."}]},{"id":4,"question":"Which hardware device primarily connects multiple devices together within the SAME local network?","choices":[{"text":"Monitor","correct":false,"comment":"Monitors only display video output."},{"text":"Network Switch","correct":true,"comment":"Correct! Switches connect devices on a single local network."},{"text":"Modem","correct":false,"comment":"Modems connect your local network to the wider Internet."}]},{"id":5,"question":"What is the role of a modem in a home network?","choices":[{"text":"To block viruses and malware","correct":false,"comment":"That is the job of a firewall or antivirus software."},{"text":"To connect your keyboard to your PC","correct":false,"comment":"Keyboards typically use USB or Bluetooth connections."},{"text":"To connect your local network to your Internet Service Provider (ISP)","correct":true,"comment":"Correct! A modem acts as the bridge connecting your home to the internet."}]},{"id":6,"question":"What does DNS (Domain Name System) do?","choices":[{"text":"Translates human-readable web addresses into IP addresses","correct":true,"comment":"Correct! DNS acts like a phonebook, turning domain names into IP addresses computers can read."},{"text":"Downloads files directly from the internet","correct":false,"comment":"Web browsers and download managers handle file transfers."},{"text":"Makes your internet connection wireless","correct":false,"comment":"That is the function of a Wi-Fi access point."}]},{"id":7,"question":"What does 'bandwidth' refer to in networking?","choices":[{"text":"The physical length of an ethernet cable","correct":false,"comment":"Bandwidth refers to data capacity, not physical size."},{"text":"The maximum amount of data that can be transmitted over a connection in a given time","correct":true,"comment":"Correct! Bandwidth is like the width of a pipe for digital data."},{"text":"The total number of users currently on a network","correct":false,"comment":"Bandwidth is a measure of capacity, though having many users can consume it quickly."}]},{"id":8,"question":"Which type of cable is most commonly used for establishing wired local networks?","choices":[{"text":"Power cable","correct":false,"comment":"Power cables provide electricity, not data."},{"text":"Ethernet cable","correct":true,"comment":"Correct! Ethernet cables are the standard for fast, wired network connections."},{"text":"HDMI cable","correct":false,"comment":"HDMI transmits high-definition video and audio to displays."}]},{"id":9,"question":"What is the primary purpose of a network firewall?","choices":[{"text":"To monitor and filter incoming and outgoing network traffic for security","correct":true,"comment":"Correct! Firewalls help secure networks by blocking unauthorized access."},{"text":"To physically cool down network servers","correct":false,"comment":"Physical cooling systems and fans do this, not firewalls."},{"text":"To boost Wi-Fi signals in large buildings","correct":false,"comment":"A Wi-Fi extender or repeater is used to boost wireless signals."}]}]}
`
lessonRawData["uiux"] = `
{"id":"uiux","title":"Basic UI/UX in apps","description":"Learn the fundamental concepts of basic UI/UX in apps.","thumbnail":"assets/network/thumb.png","materials":[{"type":"text","content":"Every app you use has a User Interface (UI), which includes buttons, menus, icons, and other elements you interact with. A good User Experience (UX) makes the app easy to understand, navigate, and use. When apps have clear labels, easy-to-find features, and helpful feedback messages, users can complete tasks more quickly and with less confusion."},{"type":"image","src":"assets/uiux/app-interface-example.png","caption":"Example of common UI elements such as buttons, icons, and navigation menus."},{"type":"text","content":"Common UI elements include search icons, menu buttons, settings pages, and navigation bars. Learning what these elements do can help you use unfamiliar apps more confidently."},{"type":"image","src":"assets/uiux/ui-elements.png","caption":"Examples of commonly used icons and interface elements."},{"type":"video","src":"assets/uiux/intro.mp4","caption":"Introduction to navigating and understanding app interfaces."}],"questions":[{"id":0,"question":"You want to save your changes in an app. Which button would you most likely tap?","choices":[{"text":"Save","correct":true,"comment":"Correct! Save stores your changes."},{"text":"Delete","correct":false,"comment":"Delete removes information."},{"text":"Logout","correct":false,"comment":"Logout signs you out."}]},{"id":1,"question":"What is the purpose of a menu icon (☰) in many apps?","choices":[{"text":"Open navigation options","correct":true,"comment":"Correct! The menu icon usually opens additional options or pages."},{"text":"Close the app","correct":false,"comment":"Apps typically have a separate close button."},{"text":"Refresh the screen","correct":false,"comment":"Refresh is usually represented by a circular arrow."}]},{"id":2,"question":"If an app shows a spinning loading icon, what does it usually mean?","choices":[{"text":"The app is processing or loading information","correct":true,"comment":"Correct! The app is working on your request."},{"text":"The app has been deleted","correct":false,"comment":"A loading icon does not mean the app is deleted."},{"text":"Your device is turned off","correct":false,"comment":"The device is still running if you can see the icon."}]},{"id":3,"question":"What should you do if a button is grayed out and cannot be tapped?","choices":[{"text":"Complete any required steps first","correct":true,"comment":"Correct! Disabled buttons often become available after completing a task."},{"text":"Tap harder","correct":false,"comment":"Tapping harder will not enable the button."},{"text":"Restart your phone immediately","correct":false,"comment":"This is usually not necessary."}]},{"id":4,"question":"Which icon is commonly used to search for information?","choices":[{"text":"Magnifying glass","correct":true,"comment":"Correct! A magnifying glass usually represents search."},{"text":"Trash can","correct":false,"comment":"A trash can usually means delete."},{"text":"Padlock","correct":false,"comment":"A padlock is related to security or privacy."}]},{"id":5,"question":"Why do many apps use clear labels and icons?","choices":[{"text":"To help users understand what actions are available","correct":true,"comment":"Correct! Clear labels make apps easier to use."},{"text":"To make the app load slower","correct":false,"comment":"Labels do not intentionally slow apps."},{"text":"To hide important features","correct":false,"comment":"The goal is usually the opposite."}]},{"id":6,"question":"If you accidentally open the wrong page in an app, what is usually the easiest way to return?","choices":[{"text":"Use the Back button","correct":true,"comment":"Correct! The Back button typically returns you to the previous screen."},{"text":"Delete the app","correct":false,"comment":"Deleting the app is unnecessary."},{"text":"Turn off your device","correct":false,"comment":"You can simply navigate back."}]},{"id":7,"question":"A message says 'Changes saved successfully.' What does this mean?","choices":[{"text":"Your changes have been stored","correct":true,"comment":"Correct! The app successfully saved your updates."},{"text":"The app has closed","correct":false,"comment":"The message only refers to saving."},{"text":"Your account was deleted","correct":false,"comment":"Saving changes does not delete accounts."}]},{"id":8,"question":"Why should important buttons be easy to find on a screen?","choices":[{"text":"So users can complete tasks more easily","correct":true,"comment":"Correct! Easy-to-find buttons improve usability."},{"text":"To make the screen look crowded","correct":false,"comment":"Crowded screens are harder to use."},{"text":"To increase battery usage","correct":false,"comment":"Button placement does not affect battery usage."}]},{"id":9,"question":"What is the main purpose of a well-designed app interface?","choices":[{"text":"Help users complete tasks easily","correct":true,"comment":"Correct! Good interfaces help users achieve their goals."},{"text":"Make users guess what to do","correct":false,"comment":"Good design reduces confusion."},{"text":"Hide useful features","correct":false,"comment":"Useful features should be easy to find."}]}]}
`
// =========================================
// INIT
// =========================================

loadLesson(
  lessonRawData[selectedCourse]
);