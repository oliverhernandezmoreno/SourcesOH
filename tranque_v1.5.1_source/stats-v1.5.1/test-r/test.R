# Before to use, add linear_regression <- function(dates, values, prediction_dates=NULL, critical_values=NULL) in src-r/api.R

source("../src-r/api.R")

dates <- c(
  "2019-12-04 00:00:00",
  "2019-12-05 00:00:00",
  "2019-12-06 00:00:00",
  "2019-12-07 00:00:00",
  "2019-12-08 00:00:00",
  "2019-12-09 00:00:00",
  "2019-12-10 00:00:00",
  "2019-12-11 00:00:00",
  "2019-12-12 00:00:00",
  "2019-12-13 00:00:00")

values <- c(
  837,
  837.5,
  840,
  838,
  839.25,
  845,
  846,
  843.7,
  844,
  850)

cat("TEST #1: All input: linear_regression(dates, values, prediction_dates, critical_values)\n");
prediction_dates <- c(
  "2019-12-14 00:00:00",
  "2019-12-15 00:00:00")
critical_values <- c(150, 160)
result <- linear_regression(dates, values, prediction_dates, critical_values)
cat("a (slope):", result$slope, "\n")
cat("b (intercept):", result$intercept, "\n")
cat("prediction_dates:", result$prediction_dates, "\n")
cat("prediction_timestamps:", result$prediction_timestamps, "\n")
cat("prediction_values (m.s.n.m.):", result$prediction_values, "\n")
cat("critical_dates:", result$critical_dates, "\n")
cat("critical_timestamp:", result$critical_timestamp, "\n")

cat("\n")
cat("TEST #2: Whitout prediction_dates and critical_values: linear_regression(dates, values)\n")
result <- linear_regression(dates, values)
cat("a (slope):", result$slope, "\n")
cat("b (intercept):", result$intercept, "\n")

cat("\n")
cat("TEST #3: Whitout critical_values: linear_regression(dates, values, prediction_dates)\n")
result <- linear_regression(dates, values, prediction_dates)
cat("a (slope):", result$slope, "\n")
cat("b (intercept):", result$intercept, "\n")
cat("prediction_dates:", result$prediction_dates, "\n")
cat("prediction_timestamps:", result$prediction_timestamps, "\n")
cat("prediction_values (m.s.n.m.):", result$prediction_values, "\n")

cat("\n")
cat("TEST #4: prediction_dates and critical_values are empty: linear_regression(dates, values, prediction_dates, critical_values)\n")
prediction_dates <- vector()
critical_values <- vector()
result <- linear_regression(dates, values, prediction_dates, critical_values)
cat("a (slope):", result$slope, "\n")
cat("b (intercept):", result$intercept, "\n")

cat("\n")
cat("TEST #5: Whitout parameters: linear_regression()\n")
result <- linear_regression()
cat("a (slope):", result$slope, "\n")
cat("b (intercept):", result$intercept, "\n")
cat("prediction_dates:", result$prediction_dates, "\n")
cat("prediction_timestamps:", result$prediction_timestamps, "\n")
cat("prediction_values (m.s.n.m.):", result$prediction_values, "\n")
cat("critical_dates:", result$critical_dates, "\n")
cat("critical_timestamp:", result$critical_timestamp, "\n")
