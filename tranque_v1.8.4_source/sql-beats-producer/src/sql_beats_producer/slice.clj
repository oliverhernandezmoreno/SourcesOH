(ns sql-beats-producer.slice
  (:require [taoensso.timbre :as timbre]
            [sql-beats-producer.output :as output]
            [sql-beats-producer.db :as db])
  (:import [java.util Date]
           [javax.xml.bind DatatypeConverter]))


(defn parse-dt [s]
  (.getTime (DatatypeConverter/parseDateTime s)))

(defn -main [query from to]
  (let [from-dt (parse-dt from)
        to-dt (parse-dt to)]
    (dorun
     (map (fn [batch]
            (output/send-events (map output/event batch))
            (timbre/info "Sent batch of" (count batch) "events"))
          (db/run-slice-query query from-dt to-dt)))))
