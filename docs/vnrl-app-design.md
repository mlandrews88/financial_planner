# vNRL Team Optimizer Web App Design

## Goal
Build a web app that:
1. Pulls **official NRL squad/team lists** each round.
2. Maps availability/injuries/late changes to your owned players.
3. Calculates your **best possible vNRL lineup** from players in your squad.
4. Explains *why* each player was selected so you can trust or override recommendations.

---

## Product Scope (MVP)

### User stories
- As a user, I can create my vNRL squad in the app.
- As a user, I can click “Sync Round” and fetch upcoming NRL team lists.
- As a user, I can see my players marked as **Available / Doubtful / Out / Bye**.
- As a user, I can get a recommended starting lineup + bench.
- As a user, I can manually swap players and lock positions.

### Non-goals for MVP
- Not a full fantasy platform.
- Not betting advice.
- Not live in-game scoring.

---

## Recommended Tech Stack

- **Frontend**: Next.js (React + TypeScript)
- **Backend API**: FastAPI (Python)
- **Database**: PostgreSQL
- **Cache/Queue**: Redis (optional, for scheduled updates)
- **Scheduler**: Cron job (or GitHub Actions / serverless scheduler)
- **Hosting**: Vercel (frontend) + Render/Fly/Railway (API + DB)

This split keeps UI fast while making optimizer and ingestion logic easy to maintain in Python.

---

## Data Sources

Use at least two source classes:

1. **Primary source for official squads**
   - NRL official team list pages and announcements.
2. **Secondary source for status checks**
   - Club injury reports, late mail, and confirmed final teams.

### Data ingestion flow
1. Scheduled job fetches round team lists.
2. Parser normalizes players (name, club, jersey number, role, status).
3. Upsert into `nrl_player_status` table.
4. Run reconciler for duplicate names/misspellings.
5. Mark stale data if source timestamp is old.

---

## Core Domain Model

### Entities
- `users`
- `vnrl_squads`
- `vnrl_squad_players`
- `nrl_players`
- `nrl_player_status`
- `rounds`
- `lineup_recommendations`

### Minimal SQL schema (starter)
```sql
create table users (
  id uuid primary key,
  email text unique not null,
  created_at timestamptz default now()
);

create table vnrl_squads (
  id uuid primary key,
  user_id uuid not null references users(id),
  name text not null,
  created_at timestamptz default now()
);

create table nrl_players (
  id uuid primary key,
  external_id text unique,
  full_name text not null,
  club text not null,
  primary_position text not null,
  updated_at timestamptz default now()
);

create table vnrl_squad_players (
  squad_id uuid not null references vnrl_squads(id),
  nrl_player_id uuid not null references nrl_players(id),
  bought_price numeric,
  priority_rank int,
  primary key (squad_id, nrl_player_id)
);

create table rounds (
  id uuid primary key,
  season int not null,
  round_number int not null,
  lockout_at timestamptz,
  unique (season, round_number)
);

create table nrl_player_status (
  nrl_player_id uuid not null references nrl_players(id),
  round_id uuid not null references rounds(id),
  availability text not null check (availability in ('available','doubtful','out','bye')),
  list_type text not null check (list_type in ('named','extended','final')),
  source_url text,
  source_updated_at timestamptz,
  updated_at timestamptz default now(),
  primary key (nrl_player_id, round_id)
);

create table lineup_recommendations (
  id uuid primary key,
  squad_id uuid not null references vnrl_squads(id),
  round_id uuid not null references rounds(id),
  algorithm_version text not null,
  lineup_json jsonb not null,
  score_estimate numeric,
  created_at timestamptz default now()
);
```

---

## API Design (MVP)

### Auth
- `POST /auth/login`
- `POST /auth/logout`

### Squad management
- `GET /squads/:id`
- `POST /squads/:id/players` (add/remove players)
- `PATCH /squads/:id/players/:playerId` (set priority/locks)

### Team-list sync and status
- `POST /rounds/:season/:round/sync` (admin or scheduled)
- `GET /rounds/:season/:round/status?squadId=...`

### Optimization
- `POST /optimize`
  - input: `squadId`, `season`, `round`, optional locks/exclusions
  - output: starters, bench, captain/vice-captain, projected total, reasoning

---

## Lineup Optimizer Logic

Use a transparent scoring model first; evolve later.

### Inputs
- Player availability status.
- Position eligibility rules.
- Expected points baseline (`projection`).
- Risk modifier (injury cloud, late-mail uncertainty).
- User preferences (safe vs upside, lock players, avoid club stack).

### Scoring function (example)
```text
effective_score = projection
                * availability_multiplier
                * form_multiplier
                * role_security_multiplier
                - risk_penalty
```

Where:
- `available` = 1.00
- `doubtful` = 0.60
- `out/bye` = 0.00 (cannot start)

### Selection method
1. Filter unusable players (`out`, `bye`, suspended).
2. Respect roster constraints by position.
3. Solve best lineup via integer optimization (or greedy + repair for MVP).
4. Pick captaincy from highest stable projected players.
5. Return alternatives for each slot.

### Pseudocode
```python
def optimize_lineup(players, rules, locks):
    pool = [p for p in players if p.status in {"available", "doubtful"}]
    apply_locks(pool, locks)

    for p in pool:
        p.effective = score_player(p)

    lineup = solve_with_constraints(pool, rules)
    bench = pick_bench(pool, lineup, rules)
    captain, vice = pick_captaincy(lineup)

    return {
        "lineup": lineup,
        "bench": bench,
        "captain": captain,
        "vice_captain": vice,
        "explanations": explain_choices(lineup)
    }
```

---

## Frontend UX Wireframe (simple)

### Screen 1: Dashboard
- Round selector (`2026 Round 7`)
- Last sync timestamp
- Button: `Sync Team Lists`
- Cards: Available / Doubtful / Out / Bye counts

### Screen 2: My Squad
- Table of all owned players
- Columns: Position, Club, Status, Projection, Lock toggle
- Quick filters: only at-risk players, only unavailable players

### Screen 3: Recommended Team
- Starting lineup by position
- Bench lineup
- Captain + vice suggestions
- “Why this pick?” expandable notes
- “Recalculate” button with strategy presets:
  - Balanced
  - Low-risk
  - High-upside

---

## Reliability + Edge Cases

- Same-name players across clubs: match on external IDs where possible.
- Late changes near lockout: mark recommendation stale if status updated after last optimize.
- Missing projection: fallback to rolling average or baseline by position.
- Partial source outage: preserve last known status and show warning badge.

---

## Security and Privacy

- Store only necessary user data.
- Hash passwords or use OAuth.
- Role-gate sync endpoints.
- Log source fetches and parser outcomes for auditability.

---

## 2-Week Build Plan

### Week 1
- Scaffold Next.js + FastAPI + Postgres.
- Implement auth + squad CRUD.
- Build ingestion pipeline for one reliable squad-list source.
- Build status endpoint and dashboard cards.

### Week 2
- Implement optimizer v1.
- Build recommended-team UI with explanations.
- Add lock players + strategy presets.
- Add scheduler + health checks.
- QA on historical rounds for sanity.

---

## Future Improvements

- Bayesian projection model from historical vNRL outcomes.
- Ownership and differential analysis.
- Auto alerts: “You have 3 OUT players in starters.”
- Multiple competition formats and rule profiles.
- Mobile app wrapper.

---

## Practical Next Step

If you want, the next implementation artifact should be:
1. `docker-compose.yml` (web/api/db),
2. FastAPI endpoints for squad + optimize,
3. Next.js page with mock optimizer response,
4. one ingestion script for round team lists.
