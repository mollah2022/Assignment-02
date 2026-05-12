
let descState = 0;

function descToggle() {
  const chunk1 = document.getElementById("desc-chunk-1");
  const chunk2 = document.getElementById("desc-chunk-2");
  const btn    = document.getElementById("desc-btn");

  if (btn.textContent.trim() === "Show more") {
    descState++;
    if (descState === 1) chunk1.classList.add("visible");
    if (descState === 2) { chunk2.classList.add("visible"); btn.textContent = "Show less"; }
  } else {
    descState--;
    if (descState === 1) chunk2.classList.remove("visible");
    if (descState === 0) { chunk1.classList.remove("visible"); btn.textContent = "Show more"; }
  }
}
