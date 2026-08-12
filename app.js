const subjects = [
  {
    id: "python",
    title: "Python",
    icon: "⌘",
    accent: "#a78bfa",
    topics: [
      "Python fundamentals",
      "Functions and object-oriented programming",
      "Exception handling",
      "NumPy",
      "Pandas",
      "Data cleaning and preprocessing",
      "Matplotlib and Seaborn",
      "Working with CSV, Excel and JSON",
      "Writing reusable scripts",
      "Clean a messy customer dataset",
      "Perform exploratory analysis and calculate KPIs"
    ]
  },
  {
    id: "sql",
    title: "SQL & Databases",
    icon: "▦",
    accent: "#63e6be",
    topics: [
      "SELECT, WHERE, GROUP BY and HAVING",
      "Aggregate functions",
      "Joins",
      "Subqueries",
      "Common table expressions (CTEs)",
      "Window functions",
      "CASE statements",
      "Views",
      "Basic database concepts",
      "Data extraction and transformation",
      "Analyze customers, orders, products and payments"
    ]
  },
  {
    id: "statistics",
    title: "Statistics",
    icon: "∿",
    accent: "#f4d06f",
    topics: [
      "Descriptive statistics",
      "Mean, median, variance and standard deviation",
      "Probability",
      "Distributions",
      "Sampling",
      "Confidence intervals",
      "Hypothesis testing",
      "Correlation",
      "Regression",
      "A/B testing",
      "Statistical significance"
    ]
  },
  {
    id: "machine-learning",
    title: "Machine Learning",
    icon: "✣",
    accent: "#ff9dba",
    topics: [
      "Supervised learning",
      "Linear and logistic regression",
      "Decision trees and random forest",
      "XGBoost and boosting",
      "Support vector machines (SVM)",
      "K-nearest neighbors (KNN)",
      "K-Means and hierarchical clustering",
      "PCA and dimensionality reduction",
      "Train/test split and cross-validation",
      "Bias vs. variance",
      "Overfitting and underfitting",
      "Feature engineering",
      "Hyperparameter tuning",
      "Classification metrics: accuracy, precision, recall and F1",
      "ROC-AUC and confusion matrix",
      "Regression metrics: MAE, MSE, RMSE and R²",
      "Customer-churn modelling project"
    ]
  },
  {
    id: "bi",
    title: "Power BI / Tableau",
    icon: "▤",
    accent: "#75b9ff",
    topics: [
      "Dashboard creation",
      "Data modelling and relationships",
      "Calculated columns and measures",
      "DAX fundamentals",
      "Filters and slicers",
      "KPI cards",
      "Drill-downs",
      "Data storytelling",
      "Build and present an executive dashboard"
    ]
  },
  {
    id: "excel",
    title: "Excel",
    icon: "▧",
    accent: "#80dfb9",
    topics: [
      "Pivot tables",
      "XLOOKUP and VLOOKUP",
      "INDEX-MATCH",
      "IF and IFS",
      "SUMIFS and COUNTIFS",
      "Conditional formatting",
      "Charts",
      "Data cleaning and basic macros"
    ]
  },
  {
    id: "data-engineering",
    title: "Data Engineering",
    icon: "⟟",
    accent: "#ffb78e",
    topics: [
      "ETL and ELT",
      "Data pipelines",
      "Data warehouses",
      "Data lakes",
      "APIs",
      "Batch vs. real-time processing",
      "Data quality",
      "Data integration",
      "Cloud data platforms",
      "Databricks and Spark basics"
    ]
  },
  {
    id: "generative-ai",
    title: "Generative AI",
    icon: "✦",
    accent: "#caa6ff",
    topics: [
      "Generative AI fundamentals",
      "Large language models",
      "Prompt engineering",
      "Retrieval-augmented generation (RAG)",
      "Embeddings",
      "Vector databases",
      "AI agents",
      "Responsible AI",
      "Using AI APIs",
      "Evaluating AI outputs",
      "Build a document question-answering system"
    ]
  },
  {
    id: "cloud-devops",
    title: "Cloud & DevOps",
    icon: "☁",
    accent: "#68d8e7",
    topics: [
      "Cloud computing fundamentals",
      "Azure and AWS basics",
      "Git and GitHub",
      "CI/CD",
      "Docker",
      "APIs",
      "Basic Linux",
      "Deployment concepts",
      "Deploy a Python or ML project"
    ]
  },
  {
    id: "agile",
    title: "Agile & Client Skills",
    icon: "◌",
    accent: "#f4d06f",
    topics: [
      "Agile methodology",
      "Scrum",
      "Jira",
      "User stories",
      "Sprint planning",
      "Daily stand-ups and sprint reviews",
      "Documentation",
      "Client communication and requirement gathering",
      "Presentation and professional communication"
    ]
  }
];

const storageKey = "todo-learning-roadmap-v1";
const allTaskIds = new Set();
const openSubjects = new Set(subjects.map(function (subject) { return subject.id; }));
let activeFilter = "all";
let searchTerm = "";
let toastTimer;

subjects.forEach(function (subject) {
  subject.topics.forEach(function (_, index) {
    allTaskIds.add(taskIdFor(subject.id, index));
  });
});

let completedTopics = loadCompletedTopics();

const subjectList = document.getElementById("subjectList");
const emptyState = document.getElementById("emptyState");
const searchInput = document.getElementById("searchInput");
const progressRing = document.getElementById("progressRing");
const progressValue = document.getElementById("progressValue");
const completedCount = document.getElementById("completedCount");
const totalCount = document.getElementById("totalCount");
const progressBar = document.getElementById("progressBar");
const nextTask = document.getElementById("nextTask");
const streakValue = document.getElementById("streakValue");
const celebration = document.getElementById("celebration");
const celebrationText = document.getElementById("celebrationText");
const toast = document.getElementById("toast");
const confettiLayer = document.getElementById("confettiLayer");

function taskIdFor(subjectId, index) {
  return subjectId + "-" + index;
}

function loadCompletedTopics() {
  try {
    const savedTopics = JSON.parse(localStorage.getItem(storageKey) || "[]");
    return new Set(Array.isArray(savedTopics) ? savedTopics : []);
  } catch (error) {
    return new Set();
  }
}

function saveCompletedTopics() {
  localStorage.setItem(storageKey, JSON.stringify(Array.from(completedTopics)));
}

function completedCountFor(subject) {
  return subject.topics.reduce(function (count, _, index) {
    return count + (completedTopics.has(taskIdFor(subject.id, index)) ? 1 : 0);
  }, 0);
}

function subjectIsComplete(subject) {
  return completedCountFor(subject) === subject.topics.length;
}

function taskMatchesView(subject, topic, index) {
  const isCompleted = completedTopics.has(taskIdFor(subject.id, index));
  const normalizedSearch = searchTerm.trim().toLowerCase();
  const matchesSearch = !normalizedSearch ||
    subject.title.toLowerCase().includes(normalizedSearch) ||
    topic.toLowerCase().includes(normalizedSearch);
  const matchesFilter = activeFilter === "all" ||
    (activeFilter === "completed" && isCompleted) ||
    (activeFilter === "active" && !isCompleted);
  return matchesSearch && matchesFilter;
}

function renderSubjects() {
  const cards = subjects.map(function (subject) {
    const completed = completedCountFor(subject);
    const subjectPercent = Math.round((completed / subject.topics.length) * 100);
    const isOpen = openSubjects.has(subject.id);
    const visibleTopics = subject.topics.map(function (topic, index) {
      return { topic: topic, index: index };
    }).filter(function (task) {
      return taskMatchesView(subject, task.topic, task.index);
    });

    if (!visibleTopics.length) {
      return "";
    }

    const topicMarkup = visibleTopics.map(function (task) {
      const id = taskIdFor(subject.id, task.index);
      const isDone = completedTopics.has(id);
      return (
        '<label class="task-row' + (isDone ? " is-done" : "") + '" style="--accent: ' + subject.accent + '">' +
          '<input class="task-checkbox" type="checkbox" data-task-id="' + id + '" data-subject-id="' + subject.id + '"' +
            (isDone ? " checked" : "") + ' aria-label="Mark ' + task.topic + ' complete" />' +
          '<span class="task-name">' + task.topic + "</span>" +
        "</label>"
      );
    }).join("");

    return (
      '<article class="subject-card' + (subjectIsComplete(subject) ? " is-complete" : "") + '" style="--accent: ' + subject.accent + '" id="subject-' + subject.id + '">' +
        '<div class="subject-head">' +
          '<div class="subject-icon" aria-hidden="true">' + subject.icon + "</div>" +
          '<div class="subject-title-wrap">' +
            '<p class="subject-kicker">SUBJECT ' + String(subjects.indexOf(subject) + 1).padStart(2, "0") + "</p>" +
            '<h3 class="subject-title">' + subject.title + "</h3>" +
            '<p class="subject-count"><strong>' + completed + "</strong> / " + subject.topics.length + " topics complete</p>" +
          "</div>" +
          '<button class="collapse-button" type="button" data-action="toggle-subject" data-subject-id="' + subject.id + '" aria-expanded="' + isOpen + '" aria-label="Toggle ' + subject.title + ' topics">⌄</button>' +
        "</div>" +
        '<div class="subject-body" ' + (isOpen ? "" : "hidden") + ">" +
          '<div class="subject-progress" aria-hidden="true"><span style="width: ' + subjectPercent + '%"></span></div>' +
          '<div class="topic-list">' + topicMarkup + "</div>" +
          '<div class="subject-footer">' +
            '<span class="subject-footnote">' + (subjectIsComplete(subject) ? "Mastered — brilliant work." : (subject.topics.length - completed) + " topic" + (subject.topics.length - completed === 1 ? "" : "s") + " to go") + "</span>" +
            '<button class="subject-button" type="button" data-action="complete-subject" data-subject-id="' + subject.id + '">' + (subjectIsComplete(subject) ? "Reopen subject" : "Mark subject done") + "</button>" +
          "</div>" +
        "</div>" +
      "</article>"
    );
  }).join("");

  subjectList.innerHTML = cards;
  emptyState.hidden = Boolean(cards);
}

function updateDashboard() {
  const total = allTaskIds.size;
  const completed = completedTopics.size;
  const percentage = Math.round((completed / total) * 100);
  const next = findNextTopic();

  progressRing.style.setProperty("--progress", percentage + "%");
  progressRing.setAttribute("aria-label", percentage + "% complete");
  progressValue.textContent = percentage + "%";
  completedCount.textContent = String(completed);
  totalCount.textContent = String(total);
  streakValue.textContent = String(completed);
  progressBar.style.width = percentage + "%";

  if (next) {
    nextTask.textContent = next.topic;
    nextTask.dataset.subjectId = next.subject.id;
    nextTask.dataset.taskId = taskIdFor(next.subject.id, next.index);
    nextTask.disabled = false;
  } else {
    nextTask.textContent = "You have mastered every topic!";
    nextTask.dataset.subjectId = "";
    nextTask.dataset.taskId = "";
    nextTask.disabled = true;
  }

  if (completed === total) {
    celebration.hidden = false;
    celebrationText.textContent = "Every topic is checked off. Your roadmap is complete — take a victory lap.";
  } else if (completed > 0 && percentage >= 50) {
    celebration.hidden = false;
    celebrationText.textContent = "You are past halfway. Keep showing up — the finish line is in view.";
  } else {
    celebration.hidden = true;
  }
}

function findNextTopic() {
  for (let subjectIndex = 0; subjectIndex < subjects.length; subjectIndex += 1) {
    const subject = subjects[subjectIndex];
    for (let topicIndex = 0; topicIndex < subject.topics.length; topicIndex += 1) {
      if (!completedTopics.has(taskIdFor(subject.id, topicIndex))) {
        return { subject: subject, topic: subject.topics[topicIndex], index: topicIndex };
      }
    }
  }
  return null;
}

function refresh() {
  renderSubjects();
  updateDashboard();
  syncToolbar();
}

function syncToolbar() {
  document.querySelectorAll(".filter-button").forEach(function (button) {
    button.classList.toggle("active", button.dataset.filter === activeFilter);
  });
}

function showToast(message) {
  window.clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add("show");
  toastTimer = window.setTimeout(function () {
    toast.classList.remove("show");
  }, 2800);
}

function launchConfetti() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }

  const colors = ["#a78bfa", "#63e6be", "#f4d06f", "#ff9dba", "#75b9ff"];
  for (let index = 0; index < 32; index += 1) {
    const piece = document.createElement("span");
    piece.className = "confetti";
    piece.style.left = Math.round(Math.random() * 100) + "%";
    piece.style.setProperty("--drift", Math.round((Math.random() - 0.5) * 240) + "px");
    piece.style.setProperty("--fall-duration", (900 + Math.random() * 800) + "ms");
    piece.style.setProperty("--confetti-color", colors[index % colors.length]);
    confettiLayer.appendChild(piece);
    window.setTimeout(function () {
      piece.remove();
    }, 1800);
  }
}

document.addEventListener("change", function (event) {
  const checkbox = event.target.closest(".task-checkbox");
  if (!checkbox) {
    return;
  }

  const subject = subjects.find(function (item) {
    return item.id === checkbox.dataset.subjectId;
  });
  const wasComplete = subjectIsComplete(subject);
  const taskId = checkbox.dataset.taskId;

  if (checkbox.checked) {
    completedTopics.add(taskId);
  } else {
    completedTopics.delete(taskId);
  }

  saveCompletedTopics();
  refresh();

  if (!wasComplete && subjectIsComplete(subject)) {
    showToast(subject.title + " complete — excellent work!");
    launchConfetti();
  } else if (checkbox.checked) {
    showToast("Progress saved. Keep your momentum going.");
  }
});

document.addEventListener("click", function (event) {
  const button = event.target.closest("[data-action]");
  if (!button) {
    return;
  }

  const action = button.dataset.action;
  const subject = subjects.find(function (item) {
    return item.id === button.dataset.subjectId;
  });

  if (action === "filter") {
    activeFilter = button.dataset.filter;
    refresh();
    return;
  }

  if (action === "toggle-subject" && subject) {
    if (openSubjects.has(subject.id)) {
      openSubjects.delete(subject.id);
    } else {
      openSubjects.add(subject.id);
    }
    renderSubjects();
    return;
  }

  if (action === "complete-subject" && subject) {
    const shouldComplete = !subjectIsComplete(subject);
    subject.topics.forEach(function (_, index) {
      const topicId = taskIdFor(subject.id, index);
      if (shouldComplete) {
        completedTopics.add(topicId);
      } else {
        completedTopics.delete(topicId);
      }
    });
    saveCompletedTopics();
    refresh();
    showToast(shouldComplete ? subject.title + " marked complete." : subject.title + " reopened.");
    if (shouldComplete) {
      launchConfetti();
    }
    return;
  }

  if (action === "collapse-all") {
    if (openSubjects.size) {
      openSubjects.clear();
      button.textContent = "Expand all";
    } else {
      subjects.forEach(function (item) {
        openSubjects.add(item.id);
      });
      button.textContent = "Collapse all";
    }
    renderSubjects();
    return;
  }

  if (action === "reset") {
    if (!completedTopics.size) {
      showToast("There is no saved progress to reset.");
      return;
    }
    if (window.confirm("Reset all completed topics? This cannot be undone.")) {
      completedTopics.clear();
      saveCompletedTopics();
      refresh();
      showToast("Your roadmap has been reset.");
    }
  }
});

searchInput.addEventListener("input", function (event) {
  searchTerm = event.target.value;
  renderSubjects();
});

nextTask.addEventListener("click", function () {
  const subjectId = nextTask.dataset.subjectId;
  const taskId = nextTask.dataset.taskId;
  if (!subjectId || !taskId) {
    return;
  }

  openSubjects.add(subjectId);
  activeFilter = "all";
  searchTerm = "";
  searchInput.value = "";
  refresh();

  const target = document.querySelector('[data-task-id="' + taskId + '"]');
  if (target) {
    target.closest(".subject-card").scrollIntoView({ behavior: "smooth", block: "center" });
    window.setTimeout(function () {
      target.focus({ preventScroll: true });
    }, 450);
  }
});

refresh();
