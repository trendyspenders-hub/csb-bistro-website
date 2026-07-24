const LEAGUE_EMOJI = {
  NFL: '🏈',
  NHL: '🏒',
  MLB: '⚾',
  NBA: '🏀',
  MLS: '⚽',
  UFC: '🥊',
  F1: '🏎️',
};

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString('en-CA', {
    timeZone: 'America/Vancouver',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-CA', {
    timeZone: 'America/Vancouver',
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

function gameCard(game) {
  const emoji = LEAGUE_EMOJI[game.league] || '🏆';
  return `
    <div class="sport-card">
      <div class="sport-card-meta">
        <span class="sport-card-league">${emoji} ${game.league}</span>
        <span class="sport-card-time">${formatDate(game.startTimeISO)} • ${formatTime(game.startTimeISO)} PT</span>
      </div>
      <h4 class="sport-card-title">${escapeHtml(game.name)}</h4>
      <div class="sport-card-teams">
        ${game.awayLogo ? `<img src="${escapeHtml(game.awayLogo)}" alt="" loading="lazy" decoding="async">` : ''}
        ${game.homeLogo ? `<img src="${escapeHtml(game.homeLogo)}" alt="" loading="lazy" decoding="async">` : ''}
      </div>
      ${game.venue ? `<p class="sport-card-venue">${escapeHtml(game.venue)}</p>` : ''}
      <a class="btn btn-primary" href="${escapeHtml(game.reserveUrl)}">
        <span>Reserve a Table</span>
        <span class="btn-icon">
          <svg fill="none" height="14" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" viewbox="0 0 24 24" width="14">
            <path d="M7 17L17 7"></path>
            <path d="M7 7h10v10"></path>
          </svg>
        </span>
      </a>
    </div>
  `;
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function renderGames(container, games, emptyMessage) {
  if (!container) return;
  if (!games || games.length === 0) {
    container.innerHTML = `<p class="sport-empty">${emptyMessage}</p>`;
    return;
  }
  container.innerHTML = `<div class="sport-grid">${games.map(gameCard).join('')}</div>`;
}

async function loadSchedule() {
  const containers = {
    today: document.getElementById('sport-today'),
    tomorrow: document.getElementById('sport-tomorrow'),
    week: document.getElementById('sport-week'),
    tonight: document.getElementById('tonight-at-csb'),
  };

  Object.values(containers).forEach((el) => {
    if (el) el.innerHTML = '<p class="sport-loading">Loading schedule...</p>';
  });

  try {
    const res = await fetch('/api/sports-schedule.js', { headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error(res.statusText);
    const data = await res.json();

    if (containers.tonight) {
      renderGames(containers.tonight, data.today, 'No games on the schedule today. Check back tomorrow or view the full sports schedule.');
    }
    if (containers.today) {
      renderGames(containers.today, data.today, 'No games scheduled for today.');
    }
    if (containers.tomorrow) {
      renderGames(containers.tomorrow, data.tomorrow, 'No games scheduled for tomorrow.');
    }
    if (containers.week) {
      renderGames(containers.week, data.thisWeek, 'No games scheduled this week.');
    }

    // Wire up schedule page tabs if present
    initScheduleTabs(data);
  } catch (err) {
    const msg = 'Could not load the live schedule right now. Please try again shortly.';
    Object.values(containers).forEach((el) => {
      if (el) el.innerHTML = `<p class="sport-empty">${msg}</p>`;
    });
    console.error('CSB sports schedule error:', err);
  }
}

function initScheduleTabs(data) {
  const tabContainer = document.getElementById('sport-tab-buttons');
  if (!tabContainer) return;

  const panels = {
    today: document.getElementById('sport-today'),
    tomorrow: document.getElementById('sport-tomorrow'),
    week: document.getElementById('sport-week'),
    all: document.getElementById('sport-all'),
  };

  tabContainer.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-tab]');
    if (!btn) return;
    const tab = btn.dataset.tab;

    tabContainer.querySelectorAll('[data-tab]').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');

    Object.entries(panels).forEach(([key, el]) => {
      if (!el) return;
      el.style.display = key === tab ? 'block' : 'none';
    });
  });

  // Render all panel once
  if (panels.all) {
    renderGames(panels.all, data.all, 'No upcoming games in the schedule.');
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadSchedule);
} else {
  loadSchedule();
}
