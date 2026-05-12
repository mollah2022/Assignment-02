const PRICE_PER_NIGHT = 2060;
const DAY_NAMES = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

let checkinDate = null;
let checkoutDate = null;
let pendingCheckinDate = null;
let pendingCheckoutDate = null;
let activeMode = null;
let calYear, calMonth;

const today = new Date();
today.setHours(0, 0, 0, 0);

function toKey(d) {
  return d ? `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}` : null;
}

function openCalendar(mode) {
  activeMode = mode;
  pendingCheckinDate = checkinDate ? new Date(checkinDate) : null;
  pendingCheckoutDate = checkoutDate ? new Date(checkoutDate) : null;

  const refDate =
    mode === "checkin" && pendingCheckinDate
      ? pendingCheckinDate
      : mode === "checkout" && pendingCheckoutDate
        ? pendingCheckoutDate
        : pendingCheckinDate || today;
  calYear = refDate.getFullYear();
  calMonth = refDate.getMonth();
  renderCalendar();
  document.getElementById("calWrapper").classList.add("open");
  document.getElementById("calOverlay").classList.add("active");
  document
    .getElementById(mode === "checkin" ? "btnCheckin" : "btnCheckout")
    .classList.add("active");
}

function closeCalendar() {
  document.getElementById("calWrapper").classList.remove("open");
  document.getElementById("calOverlay").classList.remove("active");
  document.getElementById("btnCheckin").classList.remove("active");
  document.getElementById("btnCheckout").classList.remove("active");
  activeMode = null;
}

function changeMonth(delta) {
  calMonth += delta;
  if (calMonth > 11) { calMonth = 0; calYear++; }
  if (calMonth < 0)  { calMonth = 11; calYear--; }
  renderCalendar();
}

function renderCalendar() {
  document.getElementById("calMonthLabel").textContent =
    `${MONTH_NAMES[calMonth]} ${calYear}`;
  const grid = document.getElementById("calGrid");
  grid.innerHTML = "";

  DAY_NAMES.forEach((d) => {
    const el = document.createElement("div");
    el.className = "cal-day-name";
    el.textContent = d;
    grid.appendChild(el);
  });

  const firstDay = new Date(calYear, calMonth, 1).getDay();
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();

  for (let i = 0; i < firstDay; i++) {
    const el = document.createElement("div");
    el.className = "cal-day empty";
    grid.appendChild(el);
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(calYear, calMonth, d);
    date.setHours(0, 0, 0, 0);
    const el = document.createElement("div");
    el.className = "cal-day";
    el.textContent = d;

    const isToday   = date.getTime() === today.getTime();
    const isPast    = date < today;
    const isStart   = pendingCheckinDate  && date.getTime() === pendingCheckinDate.getTime();
    const isEnd     = pendingCheckoutDate && date.getTime() === pendingCheckoutDate.getTime();
    const isInRange =
      pendingCheckinDate && pendingCheckoutDate && date > pendingCheckinDate && date < pendingCheckoutDate;

    if (isPast)    el.classList.add("disabled");
    if (isToday)   el.classList.add("today");
    if (isStart)   el.classList.add("selected-start");
    if (isEnd)     el.classList.add("selected-end");

    if (isInRange) {
      el.classList.add("in-range");
      const prev = new Date(calYear, calMonth, d - 1);
      prev.setHours(0, 0, 0, 0);
      const next = new Date(calYear, calMonth, d + 1);
      next.setHours(0, 0, 0, 0);
      if (prev.getTime() === pendingCheckinDate.getTime())  el.classList.add("range-start-edge");
      if (next.getTime() === pendingCheckoutDate.getTime()) el.classList.add("range-end-edge");
    }

    if (!isPast) el.addEventListener("click", () => selectDate(date));
    grid.appendChild(el);
  }
}

function selectDate(date) {
  if (activeMode === "checkin") {
    pendingCheckinDate = date;
    if (pendingCheckoutDate && pendingCheckoutDate <= pendingCheckinDate)
      pendingCheckoutDate = null;
    activeMode = "checkout";
    document.getElementById("btnCheckin").classList.remove("active");
    document.getElementById("btnCheckout").classList.add("active");
    renderCalendar();
  } else {
    if (!pendingCheckinDate || date <= pendingCheckinDate) {
      pendingCheckinDate = date;
      pendingCheckoutDate = null;
      activeMode = "checkout";
      renderCalendar();
      return;
    }
    pendingCheckoutDate = date;
    renderCalendar();
  }
}

function applyDateSelection() {
  if (!pendingCheckinDate || !pendingCheckoutDate) return;
  checkinDate = pendingCheckinDate;
  checkoutDate = pendingCheckoutDate;
  updateDisplays();
  closeCalendar();
}

function cancelDateSelection() {
  pendingCheckinDate = checkinDate ? new Date(checkinDate) : null;
  pendingCheckoutDate = checkoutDate ? new Date(checkoutDate) : null;
  closeCalendar();
}

function fmt(date) {
  if (!date) return null;
  return `${MONTH_NAMES[date.getMonth()].slice(0, 3)} ${date.getDate()}, ${date.getFullYear()}`;
}

function updateDisplays() {
  const ci = document.getElementById("valCheckin");
  const co = document.getElementById("valCheckout");

  if (checkinDate) {
    ci.textContent = fmt(checkinDate);
    ci.classList.remove("placeholder");
  }

  if (checkoutDate) {
    co.textContent = fmt(checkoutDate);
    co.classList.remove("placeholder");
  } else {
    co.textContent = "Select date";
    co.classList.add("placeholder");
  }

  const badge    = document.getElementById("availBadge");
  const availTxt = document.getElementById("availText");
  const totalEl  = document.getElementById("totalPrice");

  if (checkinDate && checkoutDate) {
    const nights = Math.round((checkoutDate - checkinDate) / (1000 * 60 * 60 * 24));
    const total  = nights * PRICE_PER_NIGHT;
    availTxt.textContent = `Dates selected are available`;
    badge.style.background   = "#f0f9f4";
    badge.style.borderColor  = "#b8e0c8";
    badge.querySelector(".check-icon").style.background = "#2e7d52";
    totalEl.textContent = `USD $${total.toLocaleString()}`;
  } else {
    availTxt.textContent = "Select dates to check availability";
    totalEl.textContent  = "—";
  }
}
