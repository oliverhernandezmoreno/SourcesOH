const crypto = require("crypto");

const conf = require("./conf");

const token = (v) => {
  if (typeof v === "undefined" || v === null) {
    return "";
  }
  if (typeof v === "string") {
    return v;
  }
  if (typeof v.toJSON !== "undefined") {
    return `${v.toJSON()}`;
  }
  return `${v}`;
};

const SEPARATOR = "#";

exports.identify = (event) => {
  const hash = crypto.createHash(conf.HASHING_ALGORITHM);
  const pieces = [
    event.name,
    typeof event["@timestamp"] === "string"
      ? new Date(event["@timestamp"])
      : event["@timestamp"],
    (event.coords || {}).x,
    (event.coords || {}).y,
    (event.coords || {}).z,
    event.sequence,
  ];
  return hash
    .update(pieces.map(token).join(SEPARATOR))
    .digest()
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
};
