(ns sql-beats-producer.conf
  (:require [clojure.string :as s]))

(defn env [name & [default]]
  (let [fromenv (System/getenv name)]
    (if (nil? fromenv) default fromenv)))

(def ^:private catalog (atom {}))

(defmacro ^:private defvar [name value]
  `(do
     (def ~name ~value)
     (swap! catalog assoc (keyword (name '~name)) ~name)))

(defn vars [] @catalog)


(defvar PWD
  (env "PWD"))

(defvar DATABASE_TYPE
  (env "DATABASE_TYPE" "pi-osisoft"))

(defvar CONSUMER_ENDPOINT
  (s/split (env "CONSUMER_ENDPOINT" "http://localhost/beats/") #","))

(defvar CONSUMER_PASSWORD
  (env "CONSUMER_PASSWORD" "fakepassword"))

(defvar CONSUMER_TIMEOUT
  (new Long (env "CONSUMER_TIMEOUT" "30")))

(defvar LOG_CONF
  (some? (some #{(clojure.string/lower-case (env "LOG_CONF" "false"))} ["true" "yes"])))

(defvar LOG_LEVEL
  (keyword (env "LOG_LEVEL" "debug")))

(defvar FAKE_OUTPUT
  (some? (some #{(clojure.string/lower-case (env "FAKE_OUTPUT" "false"))} ["true" "yes"])))

(defvar COMMIT
  (try
    (let [head (s/trim (slurp ".git/HEAD"))]
      (if (s/starts-with? head "ref: ")
        (s/trim (slurp (str ".git/" (subs head 5))))
        head))
    (catch Exception e nil)))

(defvar QUERIES_FOLDER
  (env "QUERIES_FOLDER" "/tmp/queries"))

(defvar POLL_INTERVAL
  (new Long (env "POLL_INTERVAL" "300")))

(defvar SLICE_INTERVAL_HOURS
  (new Long (env "SLICE_INTERVAL_HOURS" "6")))

(defvar HEARTBEAT_NAME
  (env "HEARTBEAT_NAME" "global-namespace.none.heartbeat"))

(defvar HEARTBEAT_INTERVAL
  (new Long (env "HEARTBEAT_INTERVAL" "60")))
