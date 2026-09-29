

export interface WatermarkConfig {
  enabled: boolean;
  position: string;
  sizePercentage: number;
  opacity: number;
  logoUrl: string;
}

export const getWatermarkConfig = (_accountIdArg?: bigint): WatermarkConfig => {
  return {
  "enabled": true,
  "position": "center",
  "sizePercentage": 10,
  "opacity": 0.5,
  "logoUrl": "https://inmobiliariaacropolis.s3.us-east-1.amazonaws.com/accounts/137/branding/logo_transparent_1780661302298_zJLYJB.png"
} as WatermarkConfig;
}
