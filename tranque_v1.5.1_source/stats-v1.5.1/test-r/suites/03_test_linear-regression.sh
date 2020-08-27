set -e

source "/test/assert.sh"

payload=$(
     jq -cM . <<EOF
{
  "dates": [
    "2019-12-04 00:00:00",
    "2019-12-05 00:00:00",
    "2019-12-06 00:00:00",
    "2019-12-07 00:00:00",
    "2019-12-08 00:00:00",
    "2019-12-09 00:00:00",
    "2019-12-10 00:00:00",
    "2019-12-11 00:00:00",
    "2019-12-12 00:00:00",
    "2019-12-13 00:00:00"
  ],
  "values": [
    837,
    837.5,
    840,
    838,
    839.25,
    845,
    846,
    843.7,
    844,
    850
  ],
  "prediction_dates": [
    "2019-12-14 00:00:00",
    "2019-12-15 12:30:40"
  ]
}
EOF
)

status=$(curl_status linear-regression "$payload")
assert_eq "$status" 200 "linear-regression failed"
log_success "linear-regression doesn't fail"

result=$(curl_response linear-regression "$payload")
assert_eq $(
    echo -n "$result" | jq -cM '.prediction_values | length'
) 2 "linear-regression predicted incorrect amount of values"
log_success "linear-regression predicted correct amount of values"

payload_with_insufficient_values=$(
    echo "$payload" | jq -cM '. * {values: .values[0:-1]}'
)

status=$(curl_status linear-regression "$payload_with_insufficient_values")
assert_eq "$status" 500 "linear-regression didn't fail for insufficient values"
log_success "linear-regression fails properly when given insufficient values"

payload_with_insufficient_dates=$(
    echo "$payload" | jq -cM '. * {dates: .dates[0:-1]}'
)

status=$(curl_status linear-regression "$payload_with_insufficient_dates")
assert_eq "$status" 500 "linear-regression didn't fail for insufficient dates"
log_success "linear-regression fails properly when given insufficient dates"

payload_without_predictions=$(
    echo "$payload" | jq -cM '. * {prediction_dates: []}'
)

status=$(curl_status linear-regression "$payload_without_predictions")
assert_eq "$status" 200 "linear-regression failed when asked 0 predictions"
log_success "linear-regression doesn't fail when asked 0 predictions"

payload_with_null_predictions=$(
    echo "$payload" | jq -cM '. * {prediction_dates: null}'
)

status=$(curl_status linear-regression "$payload_with_null_predictions")
assert_eq "$status" 200 "linear-regression failed when asked null predictions"
log_success "linear-regression doesn't fail when asked null predictions"

payload_with_missing_predictions=$(
    echo "$payload" | jq -cM 'del(.prediction_dates)'
)

status=$(curl_status linear-regression "$payload_with_missing_predictions")
assert_eq "$status" 200 "linear-regression failed when predictions are missing"
log_success "linear-regression doesn't fail when predictions are missing"

simple_payload=$(
     jq -cM . <<EOF
{
  "dates": [
    "2000-02-02T00:00:03Z",
    "2000-02-02T00:20:03Z",
    "2000-02-02T00:40:03Z",
    "2000-02-02T01:00:03Z",
    "2000-02-02T01:20:03Z",
    "2000-02-02T01:40:03Z"
  ],
  "values": [
    800.2,
    801.2,
    802.2,
    803.2,
    804.2,
    805.2
  ],
  "prediction_dates": [
    "2000-02-02T02:00:03Z",
    "2000-02-02T03:00:03Z"
  ],
  "critical_values": [
    810.2,
    790.2
  ]
}
EOF
)

prediction_payload=$(echo "$simple_payload" | jq -cM 'del(.critical_values)')

result=$(curl_response linear-regression "$prediction_payload" | jq -cM .prediction_values)
assert_eq "$result" "[806.2,809.2]" "linear-regression failed numerically when predicting"
log_success "linear-regression doesn't fail numerically when predicting"

critical_payload=$(echo "$simple_payload" | jq -cM 'del(.prediction_dates)')

result=$(curl_response linear-regression "$critical_payload" | jq -cM .critical_dates)
assert_eq "$result" '["2000-02-02T03:20:03+00:00","2000-02-01T20:40:03+00:00"]' "linear-regression failed when inverse predicting"
log_success "linear-regression doesn't fail when inverse predicting"

degenerate_prediction_payload=$(
     jq -cM . <<EOF
{
  "dates": [
    "2000-02-02T00:00:03Z",
    "2000-02-02T00:00:03Z",
    "2000-02-02T00:00:03Z",
    "2000-02-02T00:00:03Z",
    "2000-02-02T00:00:03Z",
    "2000-02-02T00:00:03Z"
  ],
  "values": [
    800.2,
    801.2,
    802.2,
    803.2,
    804.2,
    805.2
  ],
  "prediction_dates": ["2000-02-02T01:00:03Z"]
}
EOF
)


result=$(curl_response linear-regression "$degenerate_prediction_payload" | jq -cM '.prediction_values | length')
assert_eq "$result" 0 "linear-regression produced nonsensical predictions when given a degenerate model"
log_success "linear-regression didn't produce predictions when given a degenerate model"

degenerate_critical_payload=$(
     jq -cM . <<EOF
{
  "dates": [
    "2000-02-02T00:00:03Z",
    "2000-02-02T00:20:03Z",
    "2000-02-02T00:40:03Z",
    "2000-02-02T01:00:03Z",
    "2000-02-02T01:20:03Z",
    "2000-02-02T01:40:03Z"
  ],
  "values": [
    800.2,
    800.2,
    800.2,
    800.2,
    800.2,
    800.2
  ],
  "critical_values": [801.2]
}
EOF
)

result=$(curl_response linear-regression "$degenerate_critical_payload" | jq -cM '.critical_dates | length')
assert_eq "$result" 0 "linear-regression gives nonsense critical dates when given a constant model"
log_success "linear-regression doesn't give critical dates when given a constant model"
