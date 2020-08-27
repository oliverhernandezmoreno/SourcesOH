import * as conf from "./conf";

export interface IBetaDistribution {
  name: "beta";
  alpha: number;
  beta: number;
}

export interface ICentralFDistribution {
  name: "centralF";
  df1: number;
  df2: number;
}

export interface ICauchyDistribution {
  name: "cauchy";
  local: number;
  scale: number;
}

export interface IChisquareDistribution {
  name: "chisquare";
  dof: number;
}

export interface IExponentialDistribution {
  name: "exponential";
  rate: number;
}

export interface IGammaDistribution {
  name: "gamma";
  shape: number;
  scale: number;
}

export interface IInvgammaDistribution {
  name: "invgamma";
  shape: number;
  scale: number;
}

export interface ILognormalDistribution {
  name: "lognormal";
  mu: number;
  sigma: number;
}

export interface INormalDistribution {
  name: "normal";
  mean: number;
  std: number;
}

export interface IStudenttDistribution {
  name: "studentt";
  dof: number;
}

export interface IWeibullDistribution {
  name: "weibull";
  scale: number;
  shape: number;
}

export interface IUniformDistribution {
  name: "uniform";
  a: number;
  b: number;
}

export interface ITriangularDistribution {
  name: "triangular";
  a: number;
  b: number;
  c: number;
}

export interface IArcsineDistribution {
  name: "arcsine";
  a: number;
  b: number;
}

export interface IBinaryDistribution {
  name: "binary";
  a: number;
  b: number;
  pa: number;
}

export interface IConstantDistribution {
  name: "constant";
  value: number;
}

export type Distribution = IBetaDistribution
  | ICentralFDistribution
  | ICauchyDistribution
  | IChisquareDistribution
  | IExponentialDistribution
  | IGammaDistribution
  | IInvgammaDistribution
  | ILognormalDistribution
  | INormalDistribution
  | IStudenttDistribution
  | IWeibullDistribution
  | IUniformDistribution
  | ITriangularDistribution
  | IArcsineDistribution
  | IBinaryDistribution
  | IConstantDistribution;

export interface IRandomValue {
  distribution: Distribution;
  factor?: number;
  shift?: number;
  fitMin?: number;
  fitMax?: number;
}

export interface ICurvedRandomValue extends IRandomValue {
  staticCurve?: number[];
}

export interface IBoundedRandomValue extends IRandomValue {
  staticBounds?: [number, number, number];
}

export interface IMetadata {
  key: string;
  value: string;
}

export const omnipresentMetadata: IMetadata[] = [{
  key: "beats-version",
  value: conf.COMMIT || "unknown",
}, {
  key: "beats",
  value: "fake-beats",
}, {
  key: "namespace",
  value: conf.NAMESPACE,
}];

export interface IFakingBehaviour {
  timeseries: string;
  interval: IRandomValue;
  burst?: {
    quantity: IRandomValue;
    interval: IRandomValue;
    p?: number;
  };
  value: ICurvedRandomValue;
  xCoord?: IBoundedRandomValue;
  yCoord?: IBoundedRandomValue;
  zCoord?: IBoundedRandomValue;
  timestampOffset?: IRandomValue;
  metadata?: IMetadata[];
  meta?: object;
}
