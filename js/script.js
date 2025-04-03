///////////////////////////////////////////////////////////
// Set current year
const yearEl = document.querySelector(".year");
const currentYear = new Date().getFullYear();
yearEl.textContent = currentYear;

///////////////////////////////////////////////////////////
// Make mobile navigation work

const btnNavEl = document.querySelector(".btn-mobile-nav");
const headerEl = document.querySelector(".header");

btnNavEl.addEventListener("click", function () {
  headerEl.classList.toggle("nav-open");
});

///////////////////////////////////////////////////////////
// Smooth scrolling animation

const allLinks = document.querySelectorAll(".header a:link");

allLinks.forEach(function (link) {
  link.addEventListener("click", function (e) {
    e.preventDefault();
    const href = link.getAttribute("href");

    // Scroll back to top
    if (href === "#")
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

    // Scroll to other links
    if (href !== "#" && href.startsWith("#")) {
      const sectionEl = document.querySelector(href);
      sectionEl.scrollIntoView({ behavior: "smooth" });
    }

    // Close mobile naviagtion
    if (link.classList.contains("main-nav-link"))
      headerEl.classList.toggle("nav-open");
  });
});

///////////////////////////////////////////////////////////
// Sticky navigation

const sectionHeroEl = document.querySelector(".section-hero");

const obs = new IntersectionObserver(
  function (entries) {
    const ent = entries[0];

    if (ent.isIntersecting === false) {
      document.body.classList.add("sticky");
    }

    if (ent.isIntersecting === true) {
      document.body.classList.remove("sticky");
    }
  },
  {
    // In the viewport
    root: null,
    threshold: 0,
    rootMargin: "-80px",
  }
);
obs.observe(sectionHeroEl);

///////////////////////////////////////////////////////////
// Fixing flexbox gap property missing in some Safari versions
function checkFlexGap() {
  var flex = document.createElement("div");
  flex.style.display = "flex";
  flex.style.flexDirection = "column";
  flex.style.rowGap = "1px";

  flex.appendChild(document.createElement("div"));
  flex.appendChild(document.createElement("div"));

  document.body.appendChild(flex);
  var isSupported = flex.scrollHeight === 1;
  flex.parentNode.removeChild(flex);

  if (!isSupported) document.body.classList.add("no-flexbox-gap");
}
checkFlexGap();

////////////////////////////////////////////////////////

async function fetchGitHubContributions() {
  try {
      const response = await fetch("https://github-contribution-api.vercel.app/api/contributions");
      const data = await response.json();

      let weeks = data.data.user.contributionsCollection.contributionCalendar.weeks;
      let days = weeks.flatMap(week => week.contributionDays);

      // Get the first month's details
      const firstMonth = new Date(days[0].date).toLocaleString("en", { month: "short" });
      const firstMonthDays = days.filter(d => new Date(d.date).toLocaleString("en", { month: "short" }) === firstMonth);

      // **Skip the first month if it has less than 15 days**
      if (firstMonthDays.length < 15) {
          days = days.filter(d => new Date(d.date).toLocaleString("en", { month: "short" }) !== firstMonth);
      }

      renderGitHubGraph(days);
  } catch (error) {
      console.error("Error fetching GitHub contributions:", error);
  }
}

function renderGitHubGraph(data) {
  const boxSize = 16, gap = 3;
  const width = (data.length / 7) * (boxSize + gap) + 50;
  const height = 160;

  const svg = d3.select("#contributionsGraph")
                .attr("width", width)
                .attr("height", height);

  // Add all day labels (Sun-Sat)
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  svg.selectAll(".day-label")
      .data(daysOfWeek)
      .enter().append("text")
      .attr("class", "day-label")
      .attr("x", 5)
      .attr("y", (d, i) => 30 + i * (boxSize + gap))
      .text(d => d);

  // Color scale based on contribution count
  const colorScale = d3.scaleThreshold()
      .domain([1, 5, 10, 20])
      .range(["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"]);

  // Creating grid
  svg.selectAll(".contribution-day")
      .data(data)
      .enter().append("rect")
      .attr("class", "contribution-day")
      .attr("x", (d, i) => Math.floor(i / 7) * (boxSize + gap) + 40)
      .attr("y", (d, i) => (i % 7) * (boxSize + gap) + 20)
      .attr("width", boxSize)
      .attr("height", boxSize)
      .attr("rx", 2)
      .attr("ry", 2)
      .attr("fill", d => colorScale(d.contributionCount))
      .append("title")
      .text(d => `${d.date}: ${d.contributionCount} contributions`);

  // Auto-scroll effect
  const scrollContainer = document.querySelector(".scroll-container");
  let scrollAmount = 0;
  function autoScroll() {
      scrollAmount += 2;
      if (scrollAmount >= scrollContainer.scrollWidth) {
          scrollAmount = 0;
      }
      scrollContainer.scrollTo({ left: scrollAmount, behavior: "smooth" });
      requestAnimationFrame(autoScroll);
  }
  // autoScroll();
}

fetchGitHubContributions();