(ns sql-beats-producer.scheduler
  (:require [taoensso.timbre :as timbre]))


(defn now [] (System/currentTimeMillis))

(defn make-regular-schedule
  "Builds a schedule of executions every *millis* milliseconds,
  starting at *start*"
  [start millis]
  (iterate (partial + millis) start))

(defn minimum-with [f col]
  (reduce (fn [[min-e min-key] [e key]]
            (if (< key min-key)
              [e key]
              [min-e min-key]))
          (map (juxt identity f) col)))

(defn strip-obsolete [current-timestamp timestamps-atom]
  (swap! timestamps-atom (partial drop-while #(>= 0 (- % current-timestamp)))))

(defn execute-schedules
  "Attend to all schedules provided, blocking when nothing is to be
  done (Thread/sleep). Each job-schedule is a vector of a job and its
  schedule."
  [job-schedule & job-schedules]
  (let [states (map (fn [[job schedule]]
                      {:job job :schedule (atom schedule)})
                    (cons job-schedule job-schedules))]
    (while (not-every? empty? (map (comp deref :schedule) states))
      (let [iter-timestamp (now)
            [earliest-job earliest-time] (->> states
                                              (filter (comp seq deref :schedule))
                                              (minimum-with #(- (-> % :schedule deref first) iter-timestamp)))]
        (if (> earliest-time 0)
          (let [sleep-period (min earliest-time (* 30 1000))]
            (timbre/debug "Sleeping for" sleep-period "out of" earliest-time "milliseconds")
            (Thread/sleep sleep-period))
          (do
            ((:job earliest-job))
            (strip-obsolete (now) (:schedule earliest-job))))))))
