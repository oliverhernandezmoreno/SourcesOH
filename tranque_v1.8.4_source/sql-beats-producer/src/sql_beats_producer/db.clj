(ns sql-beats-producer.db
  (:require [clojure.java.io :as io]
            [clojure.string :as s]
            [taoensso.timbre :as timbre]
            [sql-beats-producer.conf :as conf])
  (:import [java.util Date]))


(def query-vector
  (delay
   (let [queries (->> (.listFiles (io/file conf/QUERIES_FOLDER))
                      seq
                      (filter #(.isFile %))
                      (filter #(s/ends-with? (.getName %) ".poll.sql"))
                      (sort-by #(.getName %))
                      (map slurp))]
     (timbre/debug (count queries) "poll queries loaded")
     queries)))

(def slice-query-map
 (delay
   (let [queries (->> (.listFiles (io/file conf/QUERIES_FOLDER))
                      seq
                      (filter #(.isFile %))
                      (filter #(s/ends-with? (.getName %) ".slice.sql"))
                      (sort-by #(.getName %))
                      (mapcat #(vector (.getName %) (slurp %)))
                      (apply hash-map))]
     (timbre/debug (count queries) "slice queries loaded")
     queries)))

(def adapter
  (let [name (symbol (str "sql-beats-producer.db-adapters."
                          conf/DATABASE_TYPE))]
    (require name)
    (find-ns name)))

(defn run-queries
  "Executes the query vector and returns the results flattened into a
  single seq"
  []
  ((ns-resolve adapter 'run-queries) @query-vector))

(defn date-ranges
  "Returns a seq of maps with keys :from and :to, representing intervals
  of time within the [*from*, *to*] interval, each separated by at
  most *step* milliseconds"
  [from to step]
  (let [offset (min (.getTime from) (.getTime to))
        amplitude (Math/abs (- (.getTime to) (.getTime from)))
        steps (-> (range 0 amplitude step)
                  (vec)
                  (conj amplitude)
                  (->> (map #(Date. (+ % offset)))))]
    (map (fn [f t] {:from f :to t})
         steps
         (rest steps))))

(defn run-slice-query
  "Executes the slice query identified by the file name *query-file*, in
  windows of conf/SLICE_INTERVAL_HOURS of width, starting at *from*
  and ending at *to*"
  [query-file from to]
  (let [slice-fn (ns-resolve adapter 'run-slice-query)
        query (get @slice-query-map query-file)]
    (when (nil? query)
      (throw (ex-info "non-existent query" {:query query-file})))
    (map #(slice-fn query (:from %) (:to %))
         (date-ranges from to (* conf/SLICE_INTERVAL_HOURS 60 60 1000)))))
