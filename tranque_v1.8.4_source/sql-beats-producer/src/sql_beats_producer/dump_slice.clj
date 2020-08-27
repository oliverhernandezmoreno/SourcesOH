(ns sql-beats-producer.dump-slice
  (:require [sql-beats-producer.output :as output]
            [sql-beats-producer.db :as db]
            [sql-beats-producer.slice :as slice]))

(defn dump-batch [batch]
  (dorun
   (map (fn [event]
          (printf "%s\t%s\t%f\n" (get event "@timestamp") (get event "name") (get event "value")))
        batch)))

(defn -main [query from to]
  (let [from-dt (slice/parse-dt from)
        to-dt (slice/parse-dt to)]
    (dorun
     (map (fn [batch]
            (dump-batch (map output/event batch)))
          (db/run-slice-query query from-dt to-dt)))))
