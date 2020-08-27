set -e

source "/test/assert.sh"

payload=$(
     jq -cM . <<EOF
{
  "n": 3,
  "frequency": 10,
  "lambda": 0,
  "data": [
    269, 321, 585, 871, 1475, 2821, 3928, 5943, 4950,
    2577, 523, 98, 184, 279, 409, 2285, 2685, 3409,
    1824, 409, 151, 45, 68, 213, 546, 1033, 2129,
    2536, 957, 361, 377, 225, 360, 731, 1638, 2725,
    2871, 2119, 684, 299, 236, 245, 552, 1623, 3311,
    6721, 4254, 687, 255, 473, 358, 784, 1594, 1676,
    2251, 1426, 756, 299, 201, 229, 469, 736, 2042,
    2811, 4431, 2511, 389, 73, 39, 49, 59, 188,
    377, 1292, 4031, 3495, 587, 105, 153, 387, 758,
    1307, 3465, 6991, 6313, 3794, 1836, 345, 382, 808,
    1388, 2713, 3800, 3091, 2985, 3790, 674, 81, 80,
    108, 229, 399, 1132, 2432, 3574, 2935, 1537, 529,
    485, 662, 1000, 1590, 2657, 3396
  ]
}
EOF
)

status=$(curl_status auto-arima "$payload")
assert_eq "$status" 200 "auto-arima failed"
log_success "auto-arima doesn't fail"

payload_with_null_lambda=$(
    echo "$payload" | jq -cM '. * {lambda: null}'
)

status=$(curl_status auto-arima "$payload_with_null_lambda")
assert_eq "$status" 200 "auto-arima failed with null lambda"
log_success "auto-arima doesn't fail with null lambda"

payload_without_lambda=$(
    echo "$payload" | jq -cM 'del(.lambda)'
)

status=$(curl_status auto-arima "$payload_without_lambda")
assert_eq "$status" 200 "auto-arima failed without lambda"
log_success "auto-arima doesn't fail without lambda"

payload_with_empty_data=$(
    echo "$payload" | jq -cM '. * {data: []}'
)

status=$(curl_status auto-arima "$payload_with_empty_data")
assert_eq "$status" 500 "auto-arima didn't fail with empty data"
log_success "auto-arima fails properly when given empty data"
