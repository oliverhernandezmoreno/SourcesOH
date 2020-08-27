(ns sql-beats-producer.db-adapters.pi-osisoft
  (:require [sql-beats-producer.conf :as conf])
  (:import [java.sql DriverManager Timestamp]
           [java.util Properties]))


(defn env [key & [default]]
  (conf/env (str "DB_" key) (if (nil? default) "" default)))

(def driver-class-name "com.osisoft.jdbc.Driver")
(def das-name (env "DAS"))
(def data-source-name (env "DATA_SOURCE"))
(def url
  (str "jdbc:" (env "JDBC_SCHEME" "pisql") "://"
       das-name "/Data Source=" data-source-name "; Integrated Security=SSPI;"))
(def properties
  (doto (Properties.)
    (.put "Port" (env "PORT" "5461"))
    (.put "user" (env "USER"))
    (.put "password" (env "PASSWORD"))
    (.put "EnableCertificateValidation" (env "CERTIFICATE_VALIDATION" "No"))
    (.put "TrustedConnection" (env "TRUSTED_CONNECTION" "No"))
    (.put "LogConsole" (env "LOG_CONSOLE" "True"))
    (.put "LogLevel" (env "LOG_LEVEL" "0"))))

(defn get-connection []
  (.newInstance (Class/forName driver-class-name))
  (DriverManager/getConnection url properties))

(defn- with-queries [queries prepare-fn result-fn]
  (let [conn (atom nil)
        stmt (atom nil)
        result (atom nil)
        outputs (atom [])]

    (try
      (reset! conn (get-connection))
      (dorun
       (map (fn [query]
              (reset! stmt (.prepareStatement @conn query))
              (when (some? prepare-fn)
                (prepare-fn @stmt))
              (reset! result (.executeQuery @stmt))
              (while (.next @result)
                (swap! outputs conj (result-fn @result)))
              (.close @result)
              (.close @stmt))
            queries))
      @outputs

      (finally
        (when (some? @result)
          (.close @result))
        (when (some? @stmt)
          (.close @stmt))
        (when (some? @conn)
          (.close @conn))))))

(defn run-queries [queries]
  (with-queries queries
    nil
    (fn [result]
      {:name (.getString result "name")
       :value (.getDouble result "value")
       :timestamp (.getTimestamp result "timestamp")})))

(defn run-slice-query [query from to]
  (with-queries [query]
    (fn [stmt]
      (.setTimestamp stmt 1 (Timestamp. (.getTime from)))
      (.setTimestamp stmt 2 (Timestamp. (.getTime to))))
    (fn [result]
      {:name (.getString result "name")
       :value (.getDouble result "value")
       :timestamp (.getTimestamp result "timestamp")})))

(defn -main [& args]
  (with-queries args
    nil
    (fn [result]
      (let [meta (.getMetaData result)
            cols (.getColumnCount meta)]
        (dorun
         (map
          (fn [index]
            (print (str (.getString result index) "\t")))
          (range 1 (+ cols 1))))
        (println)))))
