#!/bin/sh

#
# getdata.sh - CGI script to get JSON data from vnstat
#
# Designed to be used as a CGI script to provide data to the
# vnstat-web application. Should be called when 'data.json'
# is requested. The value of the 'ts' query parameter should
# be passed as the value of the 'TIME_SCALE' environment
# variable. The value of the 'nr' query parameter should be
# passed as the value of the 'TIME_LIMIT' environment
# variable.

# The script will output JSON
printf "Content-Type: application/json\n\n"

# Only permit 'h' or 'd' for time scale
# Defaults to 'd'
case "$TIME_SCALE" in
	h)   scale='h'; fbl=12 ;;
	d|*) scale='d'; fbl=7  ;;
esac

# Strip non-number characters from time limit
TIME_LIMIT="$(echo "$TIME_LIMIT" | sed 's:[^0-9]::g')"

# Default to '12' for hourly or '7' for daily if invalid time limit given
tl="${TIME_LIMIT:-$fbl}"

# Get output
vnstat --json "$scale" "$tl"
