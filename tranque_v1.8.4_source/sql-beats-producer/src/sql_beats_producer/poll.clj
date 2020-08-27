(ns sql-beats-producer.poll
  (:require [clojure.set]
            [taoensso.timbre :as timbre]
            [sql-beats-producer.conf :as conf]
            [sql-beats-producer.output :as output]
            [sql-beats-producer.db :as db]
            [sql-beats-producer.scheduler :as scheduler]))


; Source: https://gist.github.com/hozumi/1472865
(defn get-digest [s]
  (->> (-> "sha1"
           java.security.MessageDigest/getInstance
           (.digest (.getBytes (str s))))
       (map #(.substring
              (Integer/toString
               (+ (bit-and % 0xff) 0x100) 16) 1))
       (apply str)))

(defn cycler []
  (let [sent-digests (atom #{})]
    (fn []
      (let [head (map output/event (db/run-queries))
            digests (map get-digest head)
            keyed-head (zipmap digests head)
            missing (clojure.set/difference (set digests) @sent-digests)]
        (when (output/send-events (map #(get keyed-head %) missing))
          (reset! sent-digests (set digests)))))))

(defn cycles-schedule [now]
  (scheduler/make-regular-schedule now (* 1000 conf/POLL_INTERVAL)))

(defn run-heartbeat []
  (output/send-events [(output/event {:name conf/HEARTBEAT_NAME
                                      :value 1.0
                                      :timestamp (java.util.Date.)})]))

(defn heartbeats-schedule [now]
  (scheduler/make-regular-schedule now (* 1000 conf/HEARTBEAT_INTERVAL)))
