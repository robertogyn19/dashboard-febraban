#!/bin/bash

MAPKEY=123

DB=demos
COLL=crimes

curl -s -XGET http://maps.demos.gogeo.io/1.0/styles/$DB/$COLL?mapkey=$MAPKEY \
  | python -m json.tool

curl -s -XPOST -H "Content-Type: application/json" \
  http://maps.demos.gogeo.io/1.0/styles/$DB/$COLL?mapkey=$MAPKEY -d '
    {
      "name": "crimes_style",
      "carto_css": "@color: #E3170A; #gogeo_many_points[zoom>1][zoom<=3] { marker-width: 1; marker-allow-overlap: true; marker-line-color: @color; marker-fill: @color; } #gogeo_many_points[zoom>3][zoom<=6] { marker-width: 1.75; marker-allow-overlap: true; marker-line-color: @color; marker-fill: @color; } #gogeo_many_points[zoom>6][zoom<=7] { marker-width: 3.5; marker-allow-overlap: true; marker-line-color: @color; marker-fill: @color; } #gogeo_many_points[zoom>7][zoom<=12] { marker-width: 4.5; marker-allow-overlap: true; marker-line-color: @color; marker-fill: @color; } #gogeo_many_points[zoom>12] { marker-width: 5.5; marker-allow-overlap: true; marker-line-color: @color; marker-fill: @color; }"
    }
  ' | python -m json.tool
