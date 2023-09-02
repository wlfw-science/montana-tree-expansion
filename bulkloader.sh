#!/bin/bash
# Load data from bigquery
bq load  --source_format=NEWLINE_DELIMITED_JSON --replace --json_extension=GEOJSON  --autodetect  landscape_explorer.seamlines  gs://landscape-explorer/bigQuery/seamlines.geojson
bq load  --source_format=NEWLINE_DELIMITED_JSON --replace --json_extension=GEOJSON  --autodetect  landscape_explorer.tileDownload gs://landscape-explorer/bigQuery/tileDownload.geojson
