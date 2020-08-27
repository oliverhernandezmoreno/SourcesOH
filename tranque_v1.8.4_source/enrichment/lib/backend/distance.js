const geolib = require("geolib");
const proj4 = require("proj4");

const conf = require("../conf");
const {sequelize} = require("./models");

module.exports = async (p1, p2) => {
  if (typeof p1 !== "object" || typeof p2 !== "object") {
    return null;
  }
  const coords1 = p1.coords || {};
  const coords2 = p2.coords || {};
  if (
    typeof coords1.x === "undefined" ||
    typeof coords1.y === "undefined" ||
    typeof coords2.x === "undefined" ||
    typeof coords2.y === "undefined"
  ) {
    return null;
  }
  const startProj =
    typeof coords1.srid === "undefined" ? conf.PROJECTION_SRID : coords1.srid;
  const endProj =
    typeof coords2.srid === "undefined" ? conf.PROJECTION_SRID : coords2.srid;
  const projections = await sequelize
    .query("SELECT srid, proj4text FROM public.spatial_ref_sys WHERE srid IN (?)", {
      replacements: [[startProj, endProj]],
      type: sequelize.QueryTypes.SELECT,
    })
    .then((ps) => ps.reduce((acc, p) => ({...acc, [p.srid]: p.proj4text}), {}));
  if (!projections[startProj]) {
    throw new Error(`projection (${startProj}) is invalid: point ${JSON.stringify(p1)}`);
  }
  if (!projections[endProj]) {
    throw new Error(`projection (${endProj}) is invalid: point ${JSON.stringify(p2)}`);
  }
  const normalizedStart = proj4(projections[startProj], "EPSG:4326", [
    coords1.x,
    coords1.y,
  ]);
  const normalizedEnd = proj4(projections[endProj], "EPSG:4326", [coords2.x, coords2.y]);
  return geolib.getPreciseDistance(normalizedStart, normalizedEnd);
};
