import { jStat } from "jstat";

import * as bh from "./behaviour";
import * as log from "./log";

const scaleShiftFit = (v: number, r: bh.IRandomValue): number => {
  let result = v;
  if (typeof r.factor !== "undefined") {
    result *= r.factor;
  }
  if (typeof r.shift !== "undefined") {
    result += r.shift;
  }
  if (typeof r.fitMin !== "undefined") {
    result = result < r.fitMin ? r.fitMin : result;
  }
  if (typeof r.fitMax !== "undefined") {
    result = result > r.fitMax ? r.fitMax : result;
  }
  return result;
};

const splat = (obj, ...keys) => keys.map((k) => obj[k]);

export const gen = (v: bh.IRandomValue): number => {
  let value = 0;
  switch (v.distribution.name) {
    case "beta":
      value = jStat.beta.sample(...splat(v.distribution as bh.IBetaDistribution, "alpha", "beta"));
      break;
    case "centralF":
      value = jStat.centralF.sample(...splat(v.distribution as bh.ICentralFDistribution, "df1", "df2"));
      break;
    case "cauchy":
      value = jStat.cauchy.sample(...splat(v.distribution as bh.ICauchyDistribution, "local", "scale"));
      break;
    case "chisquare":
      value = jStat.chisquare.sample(...splat(v.distribution as bh.IChisquareDistribution, "dof"));
      break;
    case "exponential":
      value = jStat.exponential.sample(...splat(v.distribution as bh.IExponentialDistribution, "rate"));
      break;
    case "gamma":
      value = jStat.gamma.sample(...splat(v.distribution as bh.IGammaDistribution, "shape", "scale"));
      break;
    case "invgamma":
      value = jStat.invgamma.sample(...splat(v.distribution as bh.IInvgammaDistribution, "shape", "scale"));
      break;
    case "lognormal":
      value = jStat.lognormal.sample(...splat(v.distribution as bh.ILognormalDistribution, "mu", "sigma"));
      break;
    case "normal":
      value = jStat.normal.sample(...splat(v.distribution as bh.INormalDistribution, "mean", "std"));
      break;
    case "studentt":
      value = jStat.studentt.sample(...splat(v.distribution as bh.IStudenttDistribution, "dof"));
      break;
    case "weibull":
      value = jStat.weibull.sample(...splat(v.distribution as bh.IWeibullDistribution, "scale", "shape"));
      break;
    case "uniform":
      value = jStat.uniform.sample(...splat(v.distribution as bh.IUniformDistribution, "a", "b"));
      break;
    case "triangular":
      value = jStat.triangular.sample(...splat(v.distribution as bh.ITriangularDistribution, "a", "b", "c"));
      break;
    case "arcsine":
      value = jStat.arcsine.sample(...splat(v.distribution as bh.IArcsineDistribution, "a", "b"));
      break;
    case "binary":
      value = jStat.uniform(0, 1).sample() <= v.distribution.pa ? v.distribution.a : v.distribution.b;
      break;
    case "constant":
      value = (v.distribution as bh.IConstantDistribution).value;
      break;
    default:
      log.error("incorrectly set random value; no distribution implementation found", {v});
      break;
  }
  return scaleShiftFit(value, v);
};
