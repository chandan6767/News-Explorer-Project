document.addEventListener("DOMContentLoaded", async () => {
  const newsContainer = document.getElementById("news-container");
  const searchInput = document.getElementById("search");
  const showMoreBtn = document.getElementById("show-more");
  const tags = document.querySelectorAll(".tag");

  let newsData = [];
  let visibleCount = 7;
  let selectedCategories = ["all"];

  // Fetch news from JSON file
  async function fetchNews() {
    const response = await fetch("./news.json");
    newsData = await response.json();
    renderNews();
  }

  // Render news cards
  function renderNews() {
    newsContainer.innerHTML = "";
    let filteredNews = newsData.filter(
      (article) =>
        selectedCategories.includes("all") ||
        selectedCategories.includes(article.category)
    );

    // Sort by latest date
    filteredNews.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Slice to show limited articles initially
    filteredNews.slice(0, visibleCount).forEach((article) => {
      const card = document.createElement("div");
      card.classList.add("news-card");
      card.innerHTML = `
                <h3 class="news-title">${article.title}</h3>
                <p class="news-date">${article.dateAndTime}</p>
                <p class="news-content">${article.content}</p>
            `;
      newsContainer.appendChild(card);
    });

    // Show/hide 'Show More' button
    showMoreBtn.style.display =
      visibleCount < filteredNews.length ? "block" : "none";
  }

  // Search function with debounce
  function debounce(func, delay) {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), delay);
    };
  }

  const searchNews = debounce(() => {
    let searchTerm = searchInput.value.toLowerCase();

    document.querySelectorAll(".news-card").forEach((card) => {
      let title = card.querySelector("h3").textContent.toLowerCase();
      let content = card
        .querySelector("p:nth-child(3)")
        .textContent.toLowerCase();

      if (title.includes(searchTerm) || content.includes(searchTerm)) {
        card.style.display = "block";
      } else {
        card.style.display = "none";
      }
    });
  }, 1000);

  // Filter news by category
  tags.forEach((tag) => {
    tag.addEventListener("click", () => {
      const category = tag.getAttribute("data-category");
      if (category === "all") {
        selectedCategories = ["all"];
      } else {
        selectedCategories = selectedCategories.includes(category)
          ? selectedCategories.filter((cat) => cat !== category)
          : [...selectedCategories, category];

        if (selectedCategories.length === 0) {
          selectedCategories = ["all"];
        } else {
          selectedCategories = selectedCategories.filter(
            (cat) => cat !== "all"
          );
        }
      }

      // Update UI
      tags.forEach((t) => t.classList.remove("active"));
      selectedCategories.forEach((cat) => {
        document
          .querySelector(`[data-category="${cat}"]`)
          .classList.add("active");
      });

      renderNews();
    });
  });

  // Show more functionality
  showMoreBtn.addEventListener("click", () => {
    visibleCount += 7;
    renderNews();
  });

  // Event listeners
  searchInput.addEventListener("input", searchNews);

  // Initial fetch
  fetchNews();
});
