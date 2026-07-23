# Sports Schedule Automation

The sports schedule on `sports-schedule.html` is generated automatically from ESPN APIs and manual event data.

## Files

- `update_schedule.py` — fetches schedules and regenerates the calendar section
- `.github/workflows/update-schedule.yml` — runs the script daily at 6 AM PT

## Leagues covered

- MLS: Vancouver Whitecaps
- MLB: Toronto Blue Jays, Seattle Mariners
- NFL: Seattle Seahawks
- NHL: Vancouver Canucks
- CFL, UFC, Formula 1, Golf, Vancouver Canadians (MiLB)

All game times are converted to Pacific Time (PT) and games before 11 AM PT are hidden.

## Filters

The schedule page has three filter types:

- **When**: All Dates / Today / Tomorrow / This Week
- **Month**: All / July / August / September / October
- **Sport**: All Sports / CFL / NFL / Soccer / MLB / Formula 1 / Golf / NHL / UFC / Vancouver Canadians

## How to update manually

```bash
python update_schedule.py
```

Then commit and redeploy.

## How to automate with GitHub Actions

1. Initialize a Git repository in this folder and push it to GitHub.
2. Connect the repository to your Vercel project.
3. The workflow in `.github/workflows/update-schedule.yml` will run daily and commit any schedule changes.
4. Vercel will automatically redeploy when the commit lands on the production branch.

## How to automate without GitHub

Run `update_schedule.py` on any schedule you prefer (cron on a server, local reminder, etc.) and redeploy with:

```bash
npx vercel --prod --yes
```
