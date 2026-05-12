
(function () {
  const IMG_BASE    = 'https://beta.imgservice.rentbyowner.com/640x308/';
  const STORAGE_KEY = 'favouriteProperties';

  let map      = null;
  let markers  = {};   
  let mapReady = false;

  function getLatLng(geo) {
    if (!geo) return null;
    const lat = parseFloat(
      geo.Latitude  ?? geo.latitude  ?? geo.Lat ?? geo.lat ?? null
    );
    const lng = parseFloat(
      geo.Longitude ?? geo.longitude ?? geo.Lng ?? geo.lng ??
      geo.Long      ?? geo.long      ?? null
    );
    if (isNaN(lat) || isNaN(lng)) return null;
    return { lat, lng };
  }

  function createPinEl(isActive) {
    const el     = document.createElement('div');
    el.className = 'map-pin' + (isActive ? ' active' : '');
    el.innerHTML = '<i class="fa-solid fa-location-dot"></i>';
    return el;
  }

  function resetAllMarkers() {
    Object.values(markers).forEach(({ pinEl }) => {
      pinEl.classList.remove('active');
    });
  }

  window.initNearbyMap = function () {
    const container = document.getElementById('nearby-map-container');
    if (!container) {
      console.warn('[Map] Container not found');
      return;
    }

    if (!window.google || !window.google.maps) {
      console.error('[Map] Google Maps not loaded');
      return;
    }

    try {
      map = new google.maps.Map(container, {
        zoom: 11,
        center: { lat: 23.8103, lng: 90.4125 }, // Dhaka default
        mapId: 'DEMO_MAP_ID',
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
        gestureHandling: 'cooperative',
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }],
          },
        ],
      });

      mapReady = true;
      console.log('[Map] ✓ Map initialized successfully');

      if (window._pendingMarkerData) {
        placeMarkers(window._pendingMarkerData);
        window._pendingMarkerData = null;
      }
    } catch (error) {
      console.error('[Map] ✗ Failed to initialize map:', error);
      container.innerHTML = `
        <div style="padding: 20px; text-align: center; color: #666;">
          <i class="fa-solid fa-exclamation-triangle" style="font-size: 24px; color: #ff6b6b;"></i>
          <p style="margin-top: 10px;">Failed to initialize Google Maps.</p>
        </div>
      `;
    }
  };

  function loadGoogleMapsScript() {
    if (document.getElementById('gmap-script')) return;

    // Wait for API key to be available
    if (!window.GOOGLE_MAPS_API_KEY) {
      console.warn('[Map] Waiting for API key...');
      setTimeout(loadGoogleMapsScript, 500);
      return;
    }

    const key = window.GOOGLE_MAPS_API_KEY;
    if (!key) {
      console.error('[Map] No API key available');
      return;
    }

    const script = document.createElement('script');
    script.id = 'gmap-script';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=marker&v=weekly`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      console.log('[Map] ✓ Google Maps script loaded successfully');
      // Initialize map after script loads
      if (typeof google !== 'undefined' && google.maps) {
        window.initNearbyMap();
      }
    };

    script.onerror = (error) => {
      console.error('[Map] ✗ Failed to load Google Maps script:', error);
      // Show error message to user
      const container = document.getElementById('nearby-map-container');
      if (container) {
        container.innerHTML = `
          <div style="padding: 20px; text-align: center; color: #666;">
            <i class="fa-solid fa-exclamation-triangle" style="font-size: 24px; color: #ff6b6b;"></i>
            <p style="margin-top: 10px;">Unable to load Google Maps. Please check your internet connection.</p>
          </div>
        `;
      }
    };

    document.head.appendChild(script);
  }

  function placeMarkers(items) {
    if (!mapReady || !map) {
      window._pendingMarkerData = items;
      return;
    }

    Object.values(markers).forEach(({ marker }) => {
      marker.map = null;
    });
    markers = {};

    const { AdvancedMarkerElement } = google.maps.marker;
    const bounds = new google.maps.LatLngBounds();
    let placed = 0;

    items.forEach(item => {
      const pos = getLatLng(item.GeoInfo);
      if (!pos) {
        console.warn('[Map] lat/lng:', item.ID, item.GeoInfo);
        return;
      }

      const pinEl  = createPinEl(false);
      const marker = new AdvancedMarkerElement({
        position: pos,
        map,
        title:   item.Property?.PropertyName || '',
        content: pinEl,
      });
      marker.addListener('click', () => {
        resetAllMarkers();
        pinEl.classList.add('active');
        highlightCard(item.ID);
      });

      markers[item.ID] = { marker, pinEl };
      bounds.extend(pos);
      placed++;
    });

    console.log(`[Map] ${placed} marker placed`);

    if (placed > 0) {
      map.fitBounds(bounds);
      google.maps.event.addListenerOnce(map, 'idle', () => {
        if (map.getZoom() > 14) map.setZoom(14);
      });
    }
  }

  function bindCardHover(grid) {
    grid.querySelectorAll('.nearby-card').forEach(card => {
      const id = card.dataset.id;

      card.addEventListener('mouseenter', () => {
        resetAllMarkers();
        if (markers[id]) {
          markers[id].pinEl.classList.add('active');
          map?.panTo(markers[id].marker.position);
        }
      });

      card.addEventListener('mouseleave', () => {
        markers[id]?.pinEl.classList.remove('active');
      });
    });
  }

  function highlightCard(id) {
    document.querySelectorAll('.nearby-card')
      .forEach(c => c.classList.remove('map-highlighted'));

    const card = document.querySelector(`.nearby-card[data-id="${id}"]`);
    if (!card) return;

    card.classList.add('map-highlighted');
    card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    setTimeout(() => card.classList.remove('map-highlighted'), 2200);
  }

  function getFavourites() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  }
  function saveFavourites(list) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }

  function getLimit() {
    return window.innerWidth <= 768 ? 4 : 6;
  }
  function getCurrentSort() {
    return document.getElementById('nearby-sort')?.value || 'most_popular';
  }

  function buildCardHTML(item) {
    const prop    = item.Property;
    const geo     = item.GeoInfo;
    const partner = item.Partner;

    const imgUrl      = `${IMG_BASE}${prop.FeatureImage}`;
    const price       = prop.Price
      ? `From $${prop.Price.toLocaleString()}`
      : 'Price N/A';
    const reviewScore = prop.ReviewScore
      ? (prop.ReviewScore / 2).toFixed(1)
      : 'N/A';
    const reviewCount = prop.Counts?.Reviews ?? 0;
    const propType    = prop.PropertyType || 'Property';
    const amenities   = (prop.TopAmenities || [])
      .slice(0, 3)
      .map(a => a.Name)
      .join(' · ');
    const location   = geo?.Display || '';
    const bookingUrl = partner?.URL || '#';

    return `
      <div class="nearby-card" data-id="${item.ID}">
        <div class="card-img-wrap">
          <img
            src="${imgUrl}"
            alt="${prop.PropertyName}"
            loading="lazy"
            onerror="this.src='../public/image/nearby_resort1.jpeg'"
          />
          <div class="card-icons">
            <button class="icon-btn" title="Report">
              <i class="fa-solid fa-flag"></i>
            </button>
            <button class="icon-btn" title="Location">
              <i class="fa-solid fa-location-dot"></i>
            </button>
            <button class="icon-btn heart-btn" title="Save">
              <i class="fa-solid fa-heart"></i>
            </button>
          </div>
          <div class="price-tag">${price}</div>
        </div>
        <div class="card-body">
          <div class="card-meta-top">
            <span class="card-rating">
              <span class="star">★</span> ${reviewScore} (${reviewCount} Reviews)
            </span>
            <span class="card-type">${propType}</span>
          </div>
          <h4>${prop.PropertyName}</h4>
          <p class="card-amenities">${amenities}</p>
          <p class="card-location">${location}</p>
          <div class="card-footer">
            <span class="brand booking">
              <span class="b-blue">Booking</span>
              <span class="b-dot">.</span>
              <span class="b-blue">com</span>
            </span>
            <a
              href="${bookingUrl}"
              target="_blank"
              rel="noopener"
              class="avail-btn"
            >View Availability</a>
          </div>
        </div>
      </div>`;
  }

  function applyAndBindHearts(grid) {
    const favourites = getFavourites();

    grid.querySelectorAll('.nearby-card').forEach(card => {
      const id  = card.dataset.id;
      const btn = card.querySelector('.heart-btn');
      if (!btn || !id) return;

      if (favourites.includes(id)) btn.classList.add('active');

      btn.addEventListener('click', () => {
        let favs = getFavourites();
        if (btn.classList.contains('active')) {
          btn.classList.remove('active');
          favs = favs.filter(f => f !== id);
        } else {
          btn.classList.add('active');
          if (!favs.includes(id)) favs.push(id);
        }
        saveFavourites(favs);
      });
    });
  }

  function showSkeleton(count) {
    const grid = document.getElementById('nearby-grid');
    if (!grid) return;
    grid.innerHTML = Array.from({ length: count }, () => `
      <div class="nearby-card skeleton-card">
        <div class="skeleton sk-img"></div>
        <div class="card-body">
          <div class="skeleton sk-line sk-short"></div>
          <div class="skeleton sk-line"></div>
          <div class="skeleton sk-line sk-medium"></div>
          <div class="skeleton sk-line sk-short"></div>
        </div>
      </div>`).join('');
  }

  async function loadProperties() {
    const sort  = getCurrentSort();
    const limit = getLimit();

    showSkeleton(limit);

    try {
      const res  = await fetch(
        `http://localhost:3000/get-property?sort=${sort}&limit=${limit}`
      );
      const data = await res.json();
      const grid = document.getElementById('nearby-grid');
      if (!grid) return;

      if (!data.success || !data.items?.length) {
        grid.innerHTML = '<p class="no-results">No properties found.</p>';
        return;
      }

      grid.innerHTML = data.items.map(buildCardHTML).join('');

      applyAndBindHearts(grid);
      placeMarkers(data.items);
      bindCardHover(grid);

    } catch (err) {
      console.error('[Nearby] Load failed:', err);
      const grid = document.getElementById('nearby-grid');
      if (grid) {
        grid.innerHTML =
          '<p class="no-results">Something went wrong. Please try again.</p>';
      }
    }
  }

  // Wait for config to load, then initialize map
  function waitForConfigAndLoadMap() {
    if (window.CONFIG_LOADED) {
      loadGoogleMapsScript();
    } else {
      // Wait for config to load
      setTimeout(waitForConfigAndLoadMap, 100);
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    waitForConfigAndLoadMap();
    loadProperties();

    document.getElementById('nearby-sort')
      ?.addEventListener('change', loadProperties);

    let lastLimit = getLimit();
    window.addEventListener('resize', () => {
      clearTimeout(window._nearbyResizeTimer);
      window._nearbyResizeTimer = setTimeout(() => {
        const newLimit = getLimit();
        if (newLimit !== lastLimit) {
          lastLimit = newLimit;
          loadProperties();
        }
      }, 300);
    });
  });

})();
