library(plumber)
api <- plumb("/app/api.R")
api$run(host="0.0.0.0", port=5000)
