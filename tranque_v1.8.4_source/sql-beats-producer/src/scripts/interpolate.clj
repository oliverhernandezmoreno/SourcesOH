(ns scripts.interpolate
  (:require [clojure.string])
  (:gen-class))


(def placeholder-regex #"\{(\w+)\}")

(defn -main [& args]
  (let [kwargs (apply hash-map args)
        raw-template (slurp *in*)
        placeholders (re-seq placeholder-regex raw-template)
        format-args (map #(get kwargs (peek %) (first %)) placeholders)
        format-template (-> raw-template
                            (clojure.string/replace "%" "%%")
                            (clojure.string/replace placeholder-regex "%s"))]
    (apply (partial printf format-template) format-args)))
