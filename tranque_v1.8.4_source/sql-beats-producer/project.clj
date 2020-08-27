(def resource-catalog
  (->> (clojure.java.io/file "resources")
       file-seq
       (map #(.getPath %))
       (filter #(or (.endsWith % ".jar") (.endsWith % ".xml")))
       vec))

(defproject sql-beats-producer "0.1.0-SNAPSHOT"
  :description "SQL-based data producer for the tranque platform"
  :url "https://gitlab.com/Inria-Chile/tranque/sql-beats-producer"
  :dependencies [[org.clojure/clojure "1.8.0"]
                 [cheshire "5.8.1"]
                 [clj-http "3.10.0"]
                 [com.taoensso/timbre "4.10.0"]]
  :resource-paths ~resource-catalog
  :source-paths ["src"]
  :main ^:skip-aot sql-beats-producer.core
  :target-path "target/%s"
  :profiles {:uberjar {:aot :all}}
  :aliases {"pi-query" ["run" "-m" "sql-beats-producer.db-adapters.pi-osisoft"]
            "interpolate" ["run" "-m" "scripts.interpolate"]
            "slice" ["run" "-m" "sql-beats-producer.slice"]
            "dump-slice" ["run" "-m" "sql-beats-producer.dump-slice"]})
