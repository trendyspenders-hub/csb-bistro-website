import json
import re
import urllib.request
from datetime import datetime, timedelta, timezone
from pathlib import Path
from zoneinfo import ZoneInfo

PT = ZoneInfo('America/Vancouver')
UTC = timezone.utc
TODAY = datetime.now(PT).date()
END = (datetime.now(PT) + timedelta(days=90)).date()

# ESPN team schedule endpoints
TEAMS = [
    ('soccer/usa.1', '9727', 'MLS', 'Vancouver Whitecaps'),
    ('baseball/mlb', '14', 'MLB', 'Toronto Blue Jays'),
    ('baseball/mlb', '12', 'MLB', 'Seattle Mariners'),
    ('football/nfl', '26', 'NFL', 'Seattle Seahawks'),
    ('hockey/nhl', '22', 'NHL', 'Vancouver Canucks'),
]

# For MLB, only keep games involving these teams to avoid flooding the schedule
MLB_KEEP_TEAMS = {'Toronto Blue Jays', 'Seattle Mariners'}


def fetch_json(url):
    try:
        with urllib.request.urlopen(url, timeout=30) as resp:
            return json.loads(resp.read().decode('utf-8'))
    except Exception as e:
        print('Fetch error', url, e)
        return {}


def parse_espn_events(data, sport, include_fn=None):
    events = []
    for ev in data.get('events', []):
        comp = ev.get('competitions', [{}])[0]
        competitors = comp.get('competitors', [])
        if len(competitors) != 2:
            continue
        home = next((c for c in competitors if c.get('homeAway') == 'home'), None)
        away = next((c for c in competitors if c.get('homeAway') == 'away'), None)
        if not home or not away:
            continue
        home_name = home['team']['displayName']
        away_name = away['team']['displayName']
        title = f"{away_name} at {home_name}"
        date_str = ev.get('date')
        if not date_str:
            continue
        dt = datetime.fromisoformat(date_str.replace('Z', '+00:00')).astimezone(PT)
        if dt.date() < TODAY or dt.date() > END:
            continue
        if include_fn and not include_fn(title, home_name, away_name):
            continue
        events.append({
            'sport': sport,
            'title': title,
            'dt': dt,
            'venue': home['team'].get('location', '') or '',
            'has_time': True,
        })
    return events


def fetch_team_schedule(league, team_id, sport):
    url = f'https://site.api.espn.com/apis/site/v2/sports/{league}/teams/{team_id}/schedule?season=2026'
    data = fetch_json(url)
    return parse_espn_events(data, sport)


all_events = []
for league, team_id, sport, team_name in TEAMS:
    if sport == 'MLB':
        # Only include games where the team is playing
        all_events += fetch_team_schedule(league, team_id, sport)
    else:
        all_events += fetch_team_schedule(league, team_id, sport)

# Filter MLB to only hot teams
filtered = []
for ev in all_events:
    if ev['sport'] == 'MLB':
        if not any(t in ev['title'] for t in MLB_KEEP_TEAMS):
            continue
    filtered.append(ev)
all_events = filtered

# Filter out games before 11 AM PT
all_events = [ev for ev in all_events if ev['dt'].hour >= 11]

# Manual events
manual = [
    # CFL
    {'sport': 'CFL', 'title': 'BC Lions at Calgary Stampeders', 'date': '2026-08-13', 'time': '18:00', 'venue': 'McMahon Stadium'},
    {'sport': 'CFL', 'title': 'Saskatchewan Roughriders at BC Lions', 'date': '2026-08-23', 'time': '16:00', 'venue': 'BC Place'},
    {'sport': 'CFL', 'title': 'BC Lions at Ottawa Redblacks', 'date': '2026-08-30', 'time': '16:00', 'venue': 'TD Place'},
    {'sport': 'CFL', 'title': 'BC Lions at Montreal Alouettes', 'date': '2026-09-04', 'time': '16:30', 'venue': 'Percival Molson Stadium'},
    {'sport': 'CFL', 'title': 'Montreal Alouettes at BC Lions', 'date': '2026-09-12', 'time': '19:00', 'venue': 'BC Place'},
    {'sport': 'CFL', 'title': 'Saskatchewan Roughriders at BC Lions', 'date': '2026-09-25', 'time': '19:30', 'venue': 'BC Place'},
    {'sport': 'CFL', 'title': 'BC Lions Home Game', 'date': '2026-10-09', 'time': '19:00', 'venue': 'BC Place'},
    # F1
    {'sport': 'F1', 'title': 'Belgian Grand Prix', 'date': '2026-08-21', 'end_date': '2026-08-23', 'venue': 'Circuit de Spa-Francorchamps'},
    {'sport': 'F1', 'title': 'Dutch Grand Prix', 'date': '2026-08-28', 'end_date': '2026-08-30', 'venue': 'Circuit Zandvoort'},
    {'sport': 'F1', 'title': 'Italian Grand Prix', 'date': '2026-09-04', 'end_date': '2026-09-06', 'venue': 'Autodromo Nazionale Monza'},
    {'sport': 'F1', 'title': 'Azerbaijan Grand Prix', 'date': '2026-09-18', 'end_date': '2026-09-20', 'venue': 'Baku City Circuit'},
    {'sport': 'F1', 'title': 'Singapore Grand Prix', 'date': '2026-09-25', 'end_date': '2026-09-27', 'venue': 'Marina Bay Street Circuit'},
    {'sport': 'F1', 'title': 'United States Grand Prix', 'date': '2026-10-16', 'end_date': '2026-10-18', 'venue': 'Circuit of the Americas'},
    # UFC
    {'sport': 'UFC', 'title': 'UFC Fight Night: August Main Event', 'date': '2026-08-15', 'time': '16:00', 'venue': 'UFC APEX'},
    {'sport': 'UFC', 'title': 'UFC Fight Night: September Main Event', 'date': '2026-09-05', 'time': '16:00', 'venue': 'UFC APEX'},
    {'sport': 'UFC', 'title': 'UFC 310: Pay-Per-View', 'date': '2026-09-19', 'time': '19:00', 'venue': 'T-Mobile Arena'},
    {'sport': 'UFC', 'title': 'UFC Fight Night: October Main Event', 'date': '2026-10-10', 'time': '16:00', 'venue': 'UFC APEX'},
    # Golf
    {'sport': 'Golf', 'title': 'Wyndham Championship', 'date': '2026-08-06', 'end_date': '2026-08-09', 'venue': 'Sedgefield Country Club'},
    {'sport': 'Golf', 'title': 'FedEx St. Jude Championship', 'date': '2026-08-13', 'end_date': '2026-08-16', 'venue': 'TPC Southwind'},
    {'sport': 'Golf', 'title': 'BMW Championship', 'date': '2026-08-20', 'end_date': '2026-08-23', 'venue': 'Bellerive Country Club'},
    {'sport': 'Golf', 'title': 'TOUR Championship', 'date': '2026-08-27', 'end_date': '2026-08-30', 'venue': 'East Lake Golf Club'},
    {'sport': 'Golf', 'title': 'Presidents Cup', 'date': '2026-09-24', 'end_date': '2026-09-27', 'venue': 'Medinah Country Club'},
    # MiLB
    {'sport': 'MiLB', 'title': 'Vancouver Canadians Final Regular-Season Home Stand', 'date': '2026-08-24', 'end_date': '2026-08-30', 'venue': 'Nat Bailey Stadium'},
]

for m in manual:
    start = datetime.strptime(m['date'], '%Y-%m-%d').replace(tzinfo=PT)
    if start.date() < TODAY or start.date() > END:
        continue
    dt = start
    if 'time' in m:
        h, mm = map(int, m['time'].split(':'))
        dt = start.replace(hour=h, minute=mm)
    ev = {
        'sport': m['sport'],
        'title': m['title'],
        'dt': dt,
        'venue': m.get('venue', ''),
        'has_time': 'time' in m,
        'end_date': m.get('end_date'),
    }
    if 'time' in m and dt.hour < 11:
        continue
    all_events.append(ev)

# Deduplicate by title + date
seen = set()
unique = []
for ev in all_events:
    k = (ev['dt'].strftime('%Y-%m-%d'), ev['title'])
    if k in seen:
        continue
    seen.add(k)
    unique.append(ev)
all_events = unique

# Sort by datetime
all_events.sort(key=lambda x: x['dt'])


def fmt_date(dt):
    return dt.strftime('%b %d').upper()


def fmt_time(dt):
    return dt.strftime('%I:%M %p').lstrip('0') + ' PT'


def event_html(ev):
    date = fmt_date(ev['dt'])
    if ev.get('end_date'):
        end = datetime.strptime(ev['end_date'], '%Y-%m-%d').replace(tzinfo=PT)
        date = f"{fmt_date(ev['dt'])}–{end.strftime('%d')}"
    sport = ev['sport']
    sport_label = {'F1': 'Formula 1', 'MiLB': 'Vancouver Canadians'}.get(sport, sport)
    title = ev['title']
    if ev.get('has_time'):
        detail = f"{fmt_time(ev['dt'])}"
        if ev['venue']:
            detail += f" • {ev['venue']}"
    else:
        detail = ev['venue'] or 'TBD'
    date_iso = ev['dt'].strftime('%Y-%m-%d')
    return f'''<div class="event" data-sport="{sport}" data-date="{date_iso}">
<div class="event-date">{date}</div>
<div class="event-info">
<span class="event-sport">{sport_label}</span>
<h4>{title}</h4>
<p>{detail}</p>
</div>
<div class="event-action"><a class="book-btn" href="tel:+16048283165">Book a Table</a></div>
</div>'''


# Group by month
months = [
    ('july', 'July 2026', 7),
    ('august', 'August 2026', 8),
    ('september', 'September 2026', 9),
    ('october', 'October 2026', 10),
]
month_html = []
for key, name, month_num in months:
    events = [ev for ev in all_events if ev['dt'].month == month_num or (ev.get('end_date') and datetime.strptime(ev['end_date'], '%Y-%m-%d').month == month_num)]
    if not events:
        continue
    event_blocks = '\n'.join(event_html(ev) for ev in events)
    month_html.append(f'''<div class="month-section {key}">
<div class="month-title"><h3>{name}</h3></div>
<div class="events">
{event_blocks}
</div>
</div>''')

calendar_html = '\n'.join(month_html)

# Read current file
file = Path('sports-schedule.html')
text = file.read_text(encoding='utf-8')

# Replace calendar month sections
start_marker = '<div class="month-section july">'
end_marker = '</div><div class="calendar-cta">'
start = text.find(start_marker)
end = text.find(end_marker)
if start == -1 or end == -1:
    print('Markers not found', start, end)
else:
    text = text[:start] + calendar_html + '\n' + text[end:]

# Replace inline filter script with updated version that includes date filtering
new_script = '''<script>
    let selectedSport = "all";
    let selectedMonth = "all";
    let selectedDate = "all";

    function getTodayStr() {
      const now = new Date();
      return now.toISOString().split('T')[0];
    }

    function getTomorrowStr() {
      const now = new Date();
      now.setDate(now.getDate() + 1);
      return now.toISOString().split('T')[0];
    }

    function getWeekEndStr() {
      const now = new Date();
      now.setDate(now.getDate() + 7);
      return now.toISOString().split('T')[0];
    }

    function setActive(button) {
      const buttons = button.parentElement.querySelectorAll('.filter-btn');
      buttons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
    }

    function filterSport(sport, button) {
      selectedSport = sport;
      setActive(button);
      applyFilters();
    }

    function filterMonth(month, button) {
      selectedMonth = month;
      setActive(button);
      applyFilters();
    }

    function filterDate(date, button) {
      selectedDate = date;
      setActive(button);
      applyFilters();
    }

    function searchEvents() {
      applyFilters();
    }

    function applyFilters() {
      const search = document.getElementById('calendarSearch').value.toLowerCase();
      const today = getTodayStr();
      const tomorrow = getTomorrowStr();
      const weekEnd = getWeekEndStr();
      const months = document.querySelectorAll('.month-section');

      months.forEach(monthSection => {
        const monthName = monthSection.classList[1];
        let monthVisible = selectedMonth === "all" || selectedMonth === monthName;
        let visibleEvents = 0;
        const events = monthSection.querySelectorAll('.event');

        events.forEach(event => {
          const sport = event.dataset.sport;
          const date = event.dataset.date;
          const text = event.innerText.toLowerCase();
          const sportMatch = selectedSport === "all" || sport === selectedSport;
          const searchMatch = text.includes(search);

          let dateMatch = true;
          if (selectedDate === 'today') {
            dateMatch = date === today;
          } else if (selectedDate === 'tomorrow') {
            dateMatch = date === tomorrow;
          } else if (selectedDate === 'this-week') {
            dateMatch = date >= today && date <= weekEnd;
          }

          if (monthVisible && sportMatch && searchMatch && dateMatch) {
            event.style.display = "grid";
            visibleEvents++;
          } else {
            event.style.display = "none";
          }
        });

        monthSection.style.display = visibleEvents > 0 ? "block" : "none";
      });
    }
  </script>'''

# Find and replace the inline script
script_pattern = re.compile(r'<script>\s*let selectedSport.*?<\/script>', re.DOTALL)
text = script_pattern.sub(new_script, text)

# Ensure date filter buttons exist
filters_without_date = '''<div class="filters">
<div class="filter-title">Browse by Month</div>'''

filters_with_date = '''<div class="filters">
<div class="filter-title">When</div>
<div class="filter-buttons">
<button class="filter-btn active" onclick="filterDate('all', this)">All Dates</button>
<button class="filter-btn" onclick="filterDate('today', this)">Today</button>
<button class="filter-btn" onclick="filterDate('tomorrow', this)">Tomorrow</button>
<button class="filter-btn" onclick="filterDate('this-week', this)">This Week</button>
</div>
<div class="filter-title">Browse by Month</div>'''

if 'filterDate' not in text and filters_without_date in text:
    text = text.replace(filters_without_date, filters_with_date)

file.write_text(text, encoding='utf-8')
print(f'Wrote schedule with {len(all_events)} events across {len(month_html)} months')
