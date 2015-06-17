SELECT
  /*
   * Geo_IDs
   *
   */
  dp1.geo_id,
  dp1.geo_id2::text,
  /* 
   * Totais
   *
   */
  dp1.hd01_s001 as total_pop, -- Total population
  s.hc01_est_vc01 as households, -- Total households (estimate)
  s.hc02_est_vc01 as families, -- Total families (estimate)
  s.hc04_est_vc01 as nonfamily, -- Total nonfamily (estimate)
  -- (hd01_s078+hd01_s079+hd01_s080+hd01_s081+hd01_s089+hd01_s094+hd01_s095) as total_check,
  /* 
   * Idade
   *
   */
  hd01_s002 as age_under_5, -- under 5 years
  (hd01_s003 + hd01_s004 + hd01_s005) as age_5_19, -- 5 to 19 years
  (hd01_s006 + hd01_s007) as age_20_29, -- 20 to 29 years
  (hd01_s008 + hd01_s009 + hd01_s010) as age_30_44, -- 30 to 44 years
  (hd01_s011 + hd01_s012 + hd01_s013 + hd01_s014) as age_45_64, -- 45 to 64 years
  (hd01_s015 + hd01_s016 + hd01_s017 + hd01_s018 + hd01_s019) as age_85_over, -- 85 years and over
  /* 
   * Raças
   *
   */
  hd01_s078 as white, -- Number; RACE - Total population - One Race - White
  hd01_s079 as black, -- Number; RACE - Total population - One Race - Black or African American
  hd01_s080 as indian, -- Number; RACE - Total population - One Race - American Indian and Alaska Native
  hd01_s081 as asian, -- Number; RACE - Total population - One Race - Asian
  hd01_s089 as hawaiian, -- Number; RACE - Total population - One Race - Native Hawaiian and Other Pacific Islander
  hd01_s094 as others, -- Number; RACE - Total population - One Race - Some Other Race
  hd01_s095 as two_races, -- Number; RACE - Total population - Two or More Races
  /*
   * Faixas de renda por domicílio
   *
   */
  ((s.hc01_est_vc02 + hc01_est_vc03)*s.hc01_est_vc01/100)::integer as household_income_less_15k, -- Househould income estimate - Less than $15,000
  ((s.hc01_est_vc04 + hc01_est_vc05)*s.hc01_est_vc01/100)::integer as household_income_15k_35k, -- Househould income estimate - $15,000 to $34,999
  ((s.hc01_est_vc06 + hc01_est_vc07)*s.hc01_est_vc01/100)::integer as household_income_35k_75k, -- Househould income estimate - $35,000 to $74,999
  ((s.hc01_est_vc08 + hc01_est_vc09)*s.hc01_est_vc01/100)::integer as household_income_75k_150k, -- Househould income estimate - $75,000 to $149,999
  ((s.hc01_est_vc10)*s.hc01_est_vc01/100)::integer as household_income_150k_200k, -- Househould income estimate - $150,000 to $199,999
  ((s.hc01_est_vc11)*s.hc01_est_vc01/100)::integer as household_income_200k_more, -- Househould income estimate - $150,000 to $199,999
  /*
   * Renda média por domicílio
   *
   */
  (s.hc01_est_vc13) as household_median_income, -- Households; Estimate; Median income (dollars)
  /*
   * Geometria
   *
   */
  st_astext(g.geom) as the_geom
  FROM census_sanfrancisco.dpdp1 dp1
  INNER JOIN census_sanfrancisco.geometries g ON dp1.geo_id = g.geo_id
  INNER JOIN census_sanfrancisco.s1901 s ON dp1.geo_id = s.geo_id
  ;