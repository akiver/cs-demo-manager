WITH team_rounds AS (
  SELECT r.match_checksum, r.number AS round_number, r.winner_name, r.team_a_name, r.team_b_name
  FROM rounds r
  WHERE r.team_a_name = 'Team SpeaR' OR r.team_b_name = 'Team SpeaR'
),
bomb_exploded_rounds AS (
  SELECT match_checksum, round_number
  FROM bombs_exploded
),
bomb_defused_rounds AS (
  SELECT match_checksum, round_number
  FROM bombs_defused
),
bomb_plants AS (
  SELECT bp.match_checksum, bp.round_number, bp.site
  FROM bombs_planted bp
  JOIN players p ON bp.match_checksum = p.match_checksum AND bp.planter_steam_id = p.steam_id
  WHERE p.team_name = 'Team SpeaR'
)
SELECT
  -- Rounds won by planting the bomb and the bomb exploded
  (SELECT COUNT(*)
   FROM team_rounds tr
   JOIN bomb_exploded_rounds ber ON tr.match_checksum = ber.match_checksum AND tr.round_number = ber.round_number
   WHERE tr.winner_name = 'Team SpeaR') AS rounds_won_by_bomb_exploded,

  -- Rounds won by defusing the bomb after being planted
  (SELECT COUNT(*)
   FROM team_rounds tr
   JOIN bomb_defused_rounds bdr ON tr.match_checksum = bdr.match_checksum AND tr.round_number = bdr.round_number
   WHERE tr.winner_name = 'Team SpeaR') AS rounds_won_by_bomb_defused,

  -- Rounds lost by not defusing the bomb when the bomb has been planted (bomb exploded, team lost)
  (SELECT COUNT(*)
   FROM team_rounds tr
   JOIN bomb_exploded_rounds ber ON tr.match_checksum = ber.match_checksum AND tr.round_number = ber.round_number
   WHERE tr.winner_name <> 'Team SpeaR') AS rounds_lost_by_bomb_exploded,

  -- Rounds lost when the bomb has been planted (either exploded or defused, team lost)
  (SELECT COUNT(*)
   FROM team_rounds tr
   WHERE (tr.match_checksum, tr.round_number) IN (
     SELECT match_checksum, round_number FROM bombs_exploded
     UNION
     SELECT match_checksum, round_number FROM bombs_defused
   ) AND tr.winner_name <> 'Team SpeaR') AS rounds_lost_when_bomb_planted,

  -- Number of times the team has planted the bomb
  (SELECT COUNT(*) FROM bomb_plants) AS bomb_plants_total,

  -- Number of times the team has planted the bomb at site A
  (SELECT COUNT(*) FROM bomb_plants WHERE site = 'A') AS bomb_plants_site_a,

  -- Number of times the team has planted the bomb at site B
  (SELECT COUNT(*) FROM bomb_plants WHERE site = 'B') AS bomb_plants_site_b;