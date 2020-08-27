(ns sql-beats-producer.core
  (:require [taoensso.timbre :as timbre]
            [sql-beats-producer.conf :as conf]
            [sql-beats-producer.poll :as poll]
            [sql-beats-producer.scheduler :as scheduler])
  (:gen-class))


(defn -main
  "Starts the poller"
  [& args]
  (timbre/set-level! conf/LOG_LEVEL)
  (when conf/LOG_CONF
    (timbre/info "Configuration" (conf/vars)))
  (timbre/info "Starting poller")
  (try
    (let [timestamp (scheduler/now)]
      (scheduler/execute-schedules [(poll/cycler) (poll/cycles-schedule timestamp)]
                                   [poll/run-heartbeat (poll/heartbeats-schedule timestamp)]))
    (catch Exception e
      (timbre/fatal e))
    (finally
      (do
        (timbre/info "Stopping poller")
        (System/exit 1)))))
