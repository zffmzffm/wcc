---
name: update-knockout-result
description: Update a FIFA World Cup 2026 knockout match result — score, winner, next-round matchup replacement, and loser elimination graying. Trigger when the user provides a knockout match score (e.g., "加拿大 1:0 南非" or "R32_73 CAN 1-0 RSA").
---

# Update Knockout Match Result

When the user tells you a knockout match result (score + winner), follow **all** steps below in order.

## Step 0: Parse User Input

Extract from the user's message:
- **Match identifier**: which match finished (e.g., match number, team names, or matchId like `R32_73`)
- **Score**: left–right score (may include penalties)
- **Winner**: the advancing team
- **Loser**: the eliminated team

Look up the match in [knockoutVenues.json](file:///c:/cc/wcc/src/data/knockoutVenues.json) to confirm the `matchId`, `stage`, and `matchup`.

## Step 1: Update Score in knockoutVenues.json

**File**: [knockoutVenues.json](file:///c:/cc/wcc/src/data/knockoutVenues.json)

Add or update the `"score"` field on the matching venue entry. The score follows `matchup` order (left team = `"left"`, right team = `"right"`):

```json
{
    "matchId": "R32_73",
    "stage": "R32",
    "cityId": "los_angeles",
    "datetime": "2026-06-28T15:00:00-04:00",
    "matchup": "2A vs 2B",
    "score": { "left": 0, "right": 1 }
}
```

> **IMPORTANT**: `"left"` / `"right"` correspond to the **matchup sides**, not the teams alphabetically. Check which side each team is on in the `"matchup"` field.

If the match went to penalties, use the format:
```json
"score": { "left": 1, "right": 1, "penLeft": 4, "penRight": 3 }
```

## Step 2: Record Winner in knockoutResults.json

**File**: [knockoutResults.json](file:///c:/cc/wcc/src/data/knockoutResults.json)

Add the winning team to the `"knockoutWinners"` object:

```json
"knockoutWinners": {
    "R32_73": "CAN",
    "R16_90": "NED"
}
```

Key = matchId (e.g., `"R32_73"`), Value = winner's 3-letter team code (uppercase).

## ~~Step 3: Replace W** Placeholder in Next Round~~ — NOT NEEDED

> **CAUTION**: Do **NOT** modify `matchup` strings in knockoutVenues.json! The `W76`, `W73` etc. tokens are used by `traceWinnerPath()` in `knockoutBracket.ts` to build knockout path templates. Replacing them breaks path tracing and causes a runtime crash.
>
> The display resolution happens automatically at render time: `resolveKnockoutSide()` in `knockoutResults.ts` reads `knockoutWinners` to resolve `W76` → `BRA`.

## Step 4: Handle Loser Elimination (Graying)

The losing team is eliminated. Add them to `"knockoutEliminatedAt"` in [knockoutResults.json](file:///c:/cc/wcc/src/data/knockoutResults.json):

```json
"knockoutEliminatedAt": {
    "RSA": "R32_73"
}
```

Key = loser's team code (uppercase), Value = the matchId where they lost.

### What this triggers automatically (no code changes needed):

1. **Map trajectory**: The loser's actual knockout path shows the segment up to (and including) the elimination match city in full color, and all subsequent segments in gray (`GRAY_KNOCKOUT_PATH_COLOR = '#AAB1BA'`).

2. **Team schedule sidebar (right panel)**: The loser's actual knockout tab (e.g., `2nd`) gets `is-knocked-out` CSS class (gray background, **no** strikethrough). Matches after the elimination match get `match-item-eliminated` class (full grayout). The match where they lost is shown normally (with score). Other tabs (`1st`, `3rd-*`) that are `impossible` keep their strikethrough.

3. **City sidebar (left panel)**: Future unplayed matches involving the eliminated team are grayed. Matches that already have scores are NOT grayed.

4. **Default tab selection**: When opening the eliminated team's schedule, the sidebar defaults to their actual path tab (e.g., `2nd`) instead of `1st`.

## Step 5: Verify

After making all changes, verify:
- [ ] Score appears correctly in both sidebars (city view and team schedule view)
- [ ] Winner's team code replaces `W**` placeholder in the next round's matchup display
- [ ] Loser's map trajectory is partially grayed (up to elimination city = colored, after = gray)
- [ ] Loser's schedule panel shows the played match normally and future matches grayed
- [ ] Loser's actual tab has gray background but **no strikethrough**; other tabs still have strikethrough
- [ ] Default tab for the eliminated team is their actual path (not 1st)

## Quick Reference: File Locations

| File | Purpose |
|---|---|
| [knockoutVenues.json](file:///c:/cc/wcc/src/data/knockoutVenues.json) | Match schedule, scores, matchup strings |
| [knockoutResults.json](file:///c:/cc/wcc/src/data/knockoutResults.json) | Winners, elimination records, group results, third-place slots |
| [knockoutResults.ts](file:///c:/cc/wcc/src/utils/knockoutResults.ts) | Resolution logic (no changes needed per match) |
| [useKnockoutPaths.ts](file:///c:/cc/wcc/src/hooks/useKnockoutPaths.ts) | Path building + eliminationMatchIndex (no changes needed per match) |
| [KnockoutFlightPath.tsx](file:///c:/cc/wcc/src/components/TeamFlightPath/KnockoutFlightPath.tsx) | Map rendering (no changes needed per match) |
| [TeamScheduleSidebar.tsx](file:///c:/cc/wcc/src/components/TeamScheduleSidebar.tsx) | Right panel tabs + match list (no changes needed per match) |
| [CitySidebar.tsx](file:///c:/cc/wcc/src/components/CitySidebar.tsx) | Left panel match display (no changes needed per match) |

## Quick Reference: Data Structures

### knockoutVenues.json — score object
```json
{ "left": 0, "right": 1 }                              // normal time
{ "left": 1, "right": 1, "penLeft": 4, "penRight": 3 } // with penalties
```

### knockoutResults.json — top-level keys
```json
{
    "groups": { ... },              // group stage results (already filled)
    "thirdPlaceSlots": { ... },     // third-place R32 assignments (already filled)
    "knockoutWinners": {            // matchId -> winner team code
        "R32_73": "CAN"
    },
    "knockoutEliminatedAt": {       // team code -> matchId where eliminated
        "RSA": "R32_73"
    }
}
```

### Winner token format
- `W73` = winner of match 73 (any stage with `_73` suffix)
- `L101` = loser of match 101 (only used for 3rd place match)

## Bracket Flow (matchId relationships)

```
R32_73 ─┐                    R32_83 ─┐
        ├─ R16_90 ─┐                 ├─ R16_93 ─┐
R32_75 ─┘          │         R32_84 ─┘          │
                   ├─ QF_97                     ├─ QF_98
R32_74 ─┐          │         R32_81 ─┐          │
        ├─ R16_89 ─┘                 ├─ R16_94 ─┘
R32_77 ─┘                    R32_82 ─┘

QF_97 ─┐                    QF_98 ─┐
       ├─ SF_101                    ├─ SF_102
QF_99 ─┘                    QF_100─┘

R32_76 ─┐                    R32_86 ─┐
        ├─ R16_91 ─┐                 ├─ R16_95 ─┐
R32_78 ─┘          │         R32_88 ─┘          │
                   ├─ QF_99                     ├─ QF_100
R32_79 ─┐          │         R32_85 ─┐          │
        ├─ R16_92 ─┘                 ├─ R16_96 ─┘
R32_80 ─┘                    R32_87 ─┘

SF_101 ─┐           L101 ─┐
        ├─ F_104           ├─ 3P_103
SF_102 ─┘           L102 ─┘
```
