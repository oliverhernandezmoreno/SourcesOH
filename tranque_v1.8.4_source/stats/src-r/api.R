library(parsedate)
library(forecast)

#* Return back the input
#* @param data the argument to return
#* @post /identity
function(data) {
    list(data=data)
}

#* Transposes a matrix
#* @param data the matrix data
#* @post /transpose
function(data) {
    list(data=t(data))
}

#* Performs an auto.arima fit and forecast
#* @param n the amount of predictions
#* @param frequency the frequency of the data
#* @param lambda the optional parameter of the Box-Cox transformation
#* @param data the data vector
#* @post /auto-arima
function(n, frequency, lambda=NULL, data) {
    fit <- auto.arima(
        ts(data, frequency=frequency),
        lambda=lambda
    )
    fc <- forecast(fit, h=n, level=c(60, 95))
    list(
        model=c(
            fit$arma[1],
            fit$arma[6],
            fit$arma[2]
        ),
        level=fc$level,
        mean=fc$mean,
        lower=fc$lower,
        upper=fc$upper
    )
}

#* Performs a linear regression and returns the coefficients and the prediction
#* @param dates array of dates in ISO 8601 format
#* @param values the values for each of the given dates
#* @param prediction_dates the dates to predict in ISO 8601 format
#* @param critical_values the values used for an inverse prediction
#* @post /linear-regression
function(dates, values, prediction_dates=NULL, critical_values=NULL) {
    if (missing(dates) | missing(values)) {
        my_empty_list <- list(
            intercept=NULL,
            slope=vector(),
            prediction_dates=vector(),
            prediction_timestamps=vector(),
            prediction_values=vector(),
            critical_values=vector(),
            critical_timestamps=vector(),
            critical_dates=vector())
        return (my_empty_list)
    }
    timestamps <- as.numeric(parse_iso_8601(dates))
    relation <- lm(values ~ timestamps)
    s <- summary(relation)
    # forward predictions
    prediction_timestamps <- vector()
    prediction_values <- vector()
    if (!is.null(prediction_dates) && dim(s$coefficients)[1] > 1) {  # predict if the slope is not infinity
        prediction_timestamps <- as.numeric(parse_iso_8601(prediction_dates))
        prediction_values <- predict(relation, data.frame(timestamps=prediction_timestamps))
    }
    # inverse predictions
    critical_timestamps <- vector()
    critical_dates <- vector()
    if (!is.null(critical_values) && !isTRUE(all.equal(s$coefficients[2, 1], 0))) {  # predict if the slope is not zero
        critical_timestamps <- (critical_values - s$coefficients[1, 1]) / s$coefficients[2, 1]
        critical_dates <- format_iso_8601(as.POSIXct(critical_timestamps, origin="1970-01-01", tz="UTC"))
    }
    list(
        intercept=s$coefficients[1, 1],
        slope=if (dim(s$coefficients)[1] > 1) s$coefficients[2, 1] else vector(),
        prediction_dates=if (is.null(prediction_dates)) vector() else prediction_dates,
        prediction_timestamps=prediction_timestamps,
        prediction_values=prediction_values,
        critical_values=if (is.null(critical_values)) vector() else critical_values,
        critical_timestamps=critical_timestamps,
        critical_dates=critical_dates
    )
}
