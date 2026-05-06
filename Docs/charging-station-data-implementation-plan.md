# Charging Station Data Implementation Plan

> Last updated: `2026-05-06`  
> Frontend repo: `C:\Users\Lenovo\Kairo-React-Native`  
> Backend repo: `C:\Users\Lenovo\Backend-Ev`

## Goal

Build a production-grade charging-station discovery system for India that:

- supports multiple networks such as `Tata Power`, `Ather Grid`, `Kazam`, `ChargeZone`, `Jio-bp`, and future operators
- uses our own backend database as the source of truth
- supports geospatial search, route-based stop selection, and future live availability updates
- can start with open seed data and evolve into verified operator-backed integrations

## Current State

- The backend `stations` table is currently empty.
- The frontend station discovery flow is already wired to `GET /v1/stations/nearby`.
- Google Maps is currently used for:
  - map rendering in the React Native app
  - route geometry in backend route planning
- Google Maps is not currently the source of truth for charging station locations.
- The station source of truth should be our backend database.

## Implementation Principles

- Store station data in our own schema, never depend on a single third-party app at runtime.
- Separate `location data` from `live availability/session control`.
- Track data provenance for every imported station.
- Prefer official APIs and licensed/open datasets over scraping.
- Treat operator integrations as adapters, not one-off custom hacks.

## Data Source Strategy

### Tier 1: Seed Sources

Use these to populate the first usable national dataset.

- `OpenStreetMap`
  - Best immediate open source for India-wide seed ingestion
  - Good for location bootstrap
  - Coverage quality varies by city
- `Open Charge Map`
  - Good enrichment source if we obtain an API key
  - Useful for names, connection info, comments, and photos

### Tier 2: Operator / Partner Sources

Use these for better coverage and fresher commercial data.

- `Tata Power EZ Charge`
- `Ather Grid`
- `Kazam`
- `ChargeZone`
- `Jio-bp pulse`
- future: `Statiq`, `HPCL`, `BPCL`, `IOCL`, `Zeon`, `Shell`, `Mahindra Charge_iN`

Notes:

- `Kazam` appears the most integration-friendly because they mention API integration publicly.
- `Tata`, `ChargeZone`, `Jio-bp`, and `Ather` appear to have strong consumer-facing apps, but public third-party APIs were not confirmed.
- These should be treated as partnership/API targets, not assumed open feeds.

### Tier 3: Manual Verification Layer

Use admin tooling to verify and enrich high-value stations in key cities.

- Bhopal
- Indore
- Delhi NCR
- Mumbai
- Bengaluru
- Pune
- Hyderabad
- Chennai

## Target Data Model

Extend or normalize the backend `stations` model to support multi-network ingestion cleanly.

### Core station fields

- `id`
- `name`
- `network`
- `source`
- `external_id`
- `lat`
- `lng`
- `address`
- `city`
- `state`
- `pincode`
- `is_active`
- `is_verified`
- `last_verified_at`
- `last_imported_at`

### Enrichment fields

- `image_url`
- `amenities`
- `operating_hours`
- `avg_rating`
- `total_reviews`
- `price_per_unit`
- `price_per_hour`

### Live-operability fields

- `supports_live_status`
- `supports_booking`
- `supports_start_stop_session`
- `supports_reservation`

### Connector / charger detail

Store charger and gun metadata separately if possible.

- `station_connectors`
- `charger_type`
- `power_kw`
- `connector_count`
- `vehicle_category`
- `tariff metadata`

### Provenance fields

- `source = osm | open_charge_map | tata | ather | kazam | manual | partner_api`
- `source_priority`
- `raw_source_payload`
- `import_batch_id`

## Recommended Schema Additions

### New table: `station_sources`

Purpose:

- track all external records mapped to one internal station
- avoid losing upstream IDs during deduplication

Suggested fields:

- `id`
- `station_id`
- `provider`
- `external_id`
- `external_name`
- `external_status`
- `raw_payload`
- `first_seen_at`
- `last_seen_at`

### Optional new table: `station_import_runs`

Purpose:

- audit imports
- simplify debugging and rollback

Suggested fields:

- `id`
- `provider`
- `started_at`
- `completed_at`
- `status`
- `records_fetched`
- `records_created`
- `records_updated`
- `records_rejected`
- `error_summary`

## Deduplication Strategy

Multiple networks may refer to the same real-world station differently. We should merge carefully.

### Primary matching

- exact `provider + external_id`

### Secondary matching

- same name and within `30-75 meters`
- same address and within `30-75 meters`
- same coordinates and compatible operator/network values

### Rules

- never hard-merge uncertain matches automatically
- send ambiguous records to review
- preserve all upstream source links in `station_sources`

## Backend Work Plan

### Phase 1: Schema readiness

Deliverables:

- update station schema for source tracking
- add `station_sources`
- add import-run audit table
- add migrations

### Phase 2: OSM importer

Deliverables:

- script/service to fetch India charging stations from Overpass
- transform OSM tags to backend station schema
- persist stations and source links
- support dry-run mode
- support city-only and India-wide import modes

Recommended importer location:

- `C:\Users\Lenovo\Backend-Ev\app\services\imports\osm_importer.py`
- `C:\Users\Lenovo\Backend-Ev\scripts\import_osm_stations.py`

### Phase 3: Open Charge Map adapter

Deliverables:

- API-key based importer
- enrichment merge logic
- connector and operator normalization

### Phase 4: Partner adapter interface

Create a shared adapter contract for future operator integrations.

Suggested interface:

- `fetch_stations()`
- `normalize_station()`
- `upsert_station()`
- `supports_live_status()`
- `fetch_live_status()`

### Phase 5: Admin review tooling

Deliverables:

- internal endpoint to review imported records
- conflict-resolution workflow
- station verification toggle

## API Plan

### Existing APIs to keep

- `GET /v1/stations/nearby`
- `GET /v1/stations/{station_id}`

### Recommended additions

- `GET /v1/stations/search`
- `GET /v1/stations/{station_id}/sources`
- `POST /v1/admin/stations/import/osm`
- `POST /v1/admin/stations/import/open-charge-map`
- `GET /v1/admin/stations/import-runs`
- `POST /v1/admin/stations/{station_id}/verify`

### Future live-data APIs

- `GET /v1/stations/{station_id}/live-status`
- `GET /v1/stations/nearby/live`

## Frontend Plan

### Phase 1: Real location-based discovery

Deliverables:

- replace demo Bhopal coordinates with device GPS
- request location permission
- search nearby stations using current position
- show the user/car as a map marker

Relevant files:

- `C:\Users\Lenovo\Kairo-React-Native\app\(app)\index.tsx`
- `C:\Users\Lenovo\Kairo-React-Native\src\components\discovery\MapView.tsx`

### Phase 2: Source-aware UI

Deliverables:

- show station network badge
- show verification/source quality
- filter by operator, charger type, and live availability

### Phase 3: Route planning improvements

Deliverables:

- prefer verified or live-capable stations for route stops
- degrade gracefully when only seed data exists

## Validation and QA Plan

### Data QA

- reject malformed coordinates
- reject stations outside India unless explicitly allowed
- enforce city/state normalization
- log duplicate collisions
- sample imported stations manually on map

### Product QA

- nearby search accuracy
- route stop relevance
- empty-state handling
- performance in dense metro areas
- offline/retry behavior

### Observability

- import success/failure metrics
- counts by provider
- duplicate rate
- verification backlog count

## Rollout Plan

### Milestone 1

- backend schema ready
- OSM importer working
- India seed import completed
- frontend can render imported stations

### Milestone 2

- live GPS-based discovery
- user/car marker on map
- operator badges and better filters

### Milestone 3

- Open Charge Map enrichment
- verified Bhopal and Madhya Pradesh pass
- admin review workflow

### Milestone 4

- first operator integration
- live availability where supported
- route planner prefers higher-confidence stations

## Risks

- open data can be incomplete or stale
- operator feeds may not be publicly available
- deduplication across networks is non-trivial
- scraping commercial apps/sites may introduce legal and maintenance risk
- live availability data will likely need partnerships, not just public map ingestion

## Recommended Build Order

1. Prepare backend schema for source-aware ingestion.
2. Build and test the OSM importer.
3. Seed India-wide stations into the database.
4. Switch frontend discovery to live device location.
5. Add user/car marker and operator badges.
6. Add Open Charge Map enrichment.
7. Add manual verification tooling for key cities.
8. Pursue official operator integrations starting with `Kazam`.

## Definition of Done

This initiative should be considered successful when:

- the `stations` table is populated with real geolocated data
- nearby discovery works from the user’s actual location
- the map shows both stations and the user/car position
- route planning can select real backend stations
- every station record has a source trail
- at least one enrichment or operator adapter beyond OSM is working
