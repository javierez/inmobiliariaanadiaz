

export interface WatermarkConfig {
  enabled: boolean;
  position: string;
  sizePercentage: number;
  opacity: number;
  logoUrl: string;
}

export const getWatermarkConfig = (_accountIdArg?: bigint): WatermarkConfig => {
  return {
  "enabled": false,
  "position": "southeast",
  "sizePercentage": 30,
  "opacity": 0.8,
  "logoUrl": "https://inmobiliariaacropolis.s3.us-east-1.amazonaws.com/accounts/137/branding/logo_transparent_1780661302298_zJLYJB.png"
};
}
