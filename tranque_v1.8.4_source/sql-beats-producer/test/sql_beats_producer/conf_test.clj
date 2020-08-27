(ns sql-beats-producer.conf-test
  (:require [clojure.test :refer :all]
            [sql-beats-producer.conf :as conf]))

(deftest configuration-from-env
  (testing "Configuration loaded from env variables"
    (is (some? conf/PWD))))
