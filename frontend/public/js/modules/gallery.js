
(function () {
  let allImages = [];
  let currentIdx = 0;
  let touchStartX = 0;
  let swipeReady = false;

  async function openImgModal() {
    const overlay = document.getElementById("imgModalOverlay");
    const loading = document.getElementById("imgModalLoading");
    const errorBox = document.getElementById("imgModalError");
    const grid = document.getElementById("imgModalGrid");
    const track = document.getElementById("sliderTrack");
    const total = document.getElementById("imgModalTotal");

    overlay.classList.add("open");
    document.body.classList.add("modal-open");
    grid.innerHTML = "";
    track.innerHTML = "";
    total.textContent = "";
    errorBox.classList.remove("active");
    loading.classList.add("active");

    try {
      const res = await fetch("http://localhost:3000/images");
      if (!res.ok) throw new Error("Server error " + res.status);
      const data = await res.json();
      allImages = data.images || [];
      if (!allImages.length) throw new Error("No images");
      renderGallery(allImages);
      total.textContent = allImages.length + " photos";
    } catch (err) {
      console.error("Gallery:", err);
      errorBox.classList.add("active");
    } finally {
      loading.classList.remove("active");
    }
  }

  function renderGallery(images) {
    const grid = document.getElementById("imgModalGrid");
    const track = document.getElementById("sliderTrack");

    images.forEach((url, i) => {
      const g = document.createElement("img");
      g.src = url;
      g.alt = "Photo " + (i + 1);
      g.loading = "lazy";
      grid.appendChild(g);

      const s = document.createElement("img");
      s.src = url;
      s.alt = "Photo " + (i + 1);
      s.draggable = false;
      track.appendChild(s);
    });

    currentIdx = 0;
    updateSlider();
    if (!swipeReady) {
      setupSwipe();
      swipeReady = true;
    }
  }

  function updateSlider() {
    document.getElementById("sliderTrack").style.transform =
      "translateX(-" + currentIdx * 100 + "%)";
    document.getElementById("sliderCounter").textContent =
      currentIdx + 1 + " / " + allImages.length;
    document.getElementById("sliderPrev").disabled = currentIdx === 0;
    document.getElementById("sliderNext").disabled =
      currentIdx === allImages.length - 1;
  }

  window.slideImg = function (dir) {
    const n = currentIdx + dir;
    if (n < 0 || n >= allImages.length) return;
    currentIdx = n;
    updateSlider();
  };

  function setupSwipe() {
    const slider = document.getElementById("imgModalSlider");
    slider.addEventListener(
      "touchstart",
      function (e) {
        touchStartX = e.changedTouches[0].screenX;
      },
      { passive: true },
    );
    slider.addEventListener(
      "touchend",
      function (e) {
        const diff = touchStartX - e.changedTouches[0].screenX;
        if (Math.abs(diff) > 40) window.slideImg(diff > 0 ? 1 : -1);
      },
      { passive: true },
    );
  }

  window.closeImgModal = function (e) {
    if (e.target === document.getElementById("imgModalOverlay"))
      window.closeImgModalDirect();
  };
  window.closeImgModalDirect = function () {
    document.getElementById("imgModalOverlay").classList.remove("open");
    document.body.classList.remove("modal-open");
  };
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") window.closeImgModalDirect();
  });

  document.addEventListener("DOMContentLoaded", function () {
    var btn = document.querySelector(".view-all-btn");
    if (btn) btn.addEventListener("click", openImgModal);
  });
})();
