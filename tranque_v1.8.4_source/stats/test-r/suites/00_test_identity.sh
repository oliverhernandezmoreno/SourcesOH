set -e

source "/test/assert.sh"

payload='{"data":["anything","1","2","3"]}'

status=$(curl_status identity "$payload")
assert_eq "$status" 200 "identity failed"
log_success "identity doesn't fail"

result=$(curl_response identity "$payload")
assert_eq "$result" "$payload" "identity doesn't return the same payload"
log_success "identity returns the same payload"

result_twice=$(curl_response identity "$result")
assert_eq "$result_twice" "$payload" "identity is not isomorphic"
log_success "identity is isomorphic"
