(ns sql-beats-producer.output
  (:require [clojure.pprint :as pprint]
            [clj-http.client :as client]
            [taoensso.timbre :as timbre]
            [sql-beats-producer.conf :as conf])
  (:import [java.text SimpleDateFormat]
           [java.util Date]))


(def date-formatter (SimpleDateFormat. "yyyy-MM-dd'T'HH:mm:ss.SSSZ"))

(defmulti datestring class)
(defmethod datestring Date [ts] (.format date-formatter ts))
(defmethod datestring String [ts] ts)

(defn event
  "Builds an event map"
  [{name :name value :value timestamp :timestamp}]
  {"name" name
   "value" value
   "@timestamp" (datestring timestamp)
   "labels" [{"key" "beats-producer" "value" "sql-beats-producer"}
             {"key" "sql-beats-producer-version" "value" conf/COMMIT}]})

(defn send-events
  "Sends events to the consumer(s)"
  [events]
  (if conf/FAKE_OUTPUT
    (do (pprint/pprint events) true)
    (-> (fn [endpoint]
          (try
            (let [response (client/post endpoint
                                        {:form-params events
                                         :content-type :json
                                         :headers {"Authorization" (str "Token " conf/CONSUMER_PASSWORD)}
                                         :as :json
                                         :socket-timeout (* 1000 conf/CONSUMER_TIMEOUT)
                                         :connection-timeout (* 1000 conf/CONSUMER_TIMEOUT)
                                         :connection-request-timeout (* 1000 conf/CONSUMER_TIMEOUT)})]
              (timbre/info "Sent" (count events) "events to" endpoint "and received response " (:body response))
              true)
            (catch Exception e
              (do
                (timbre/error "Couldn't send events to" endpoint ":" (.getMessage e))
                false))))
        (map conf/CONSUMER_ENDPOINT)
        (doall)
        (->> (every? identity)))))
