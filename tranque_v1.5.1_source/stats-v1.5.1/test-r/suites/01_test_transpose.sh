set -e

source "/test/assert.sh"

payload='{"data":[[1,2,3],[4,5,6]]}'

status=$(curl_status transpose "$payload")
assert_eq "$status" 200 "transpose failed"
log_success "transpose doesn't fail"

result=$(curl_response transpose "$payload")
assert_eq "$result" '{"data":[[1,4],[2,5],[3,6]]}' "transpose works incorrectly"
log_success "transpose works as expected"

result_twice=$(curl_response transpose "$result")
assert_eq "$result_twice" "$payload" "transpose is not isomorphic"
log_success "transpose is isomorphic"
