import sharp from "sharp";
import type { WatermarkConfig } from "~/server/queries/watermark";

const ALLOWED_HOSTNAME_PATTERNS = [
  // S3 buckets: <bucket>.s3.<region>.amazonaws.com
  /^.+\.s3(\..+)?\.amazonaws\.com$/,
  // Unsplash
  /^images\.unsplash\.com$/,
];

/** Only allow fetching images from known domains to prevent open proxy */
export function isAllowedImageUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ALLOWED_HOSTNAME_PATTERNS.some((pattern) =>
      pattern.test(parsed.hostname),
    );
  } catch {
    return false;
  }
}

/** Map position string to sharp gravity */
function getGravity(
  position: string,
): "southeast" | "northeast" | "northwest" | "southwest" | "centre" {
  switch (position) {
    case "northeast":
      return "northeast";
    case "northwest":
      return "northwest";
    case "southwest":
      return "southwest";
    case "center":
      return "centre";
    case "southeast":
    default:
      return "southeast";
  }
}

/** Apply watermark logo to an image buffer using sharp */
export async function applyWatermark(
  imageBuffer: Buffer,
  config: WatermarkConfig,
): Promise<Buffer> {
  const image = sharp(imageBuffer);
  const metadata = await image.metadata();

  if (!metadata.width || !metadata.height) {
    return imageBuffer;
  }

  // Fetch the logo
  const logoResponse = await fetch(config.logoUrl);
  if (!logoResponse.ok) {
    return imageBuffer;
  }

  const logoBuffer = Buffer.from(await logoResponse.arrayBuffer());

  // Resize logo to target percentage of image width
  const targetWidth = Math.round(
    (metadata.width * config.sizePercentage) / 100,
  );
  const resizedLogo = await sharp(logoBuffer)
    .resize({ width: targetWidth, withoutEnlargement: true })
    .toBuffer();

  // Apply opacity via SVG mask using composite with dest-in blend
  const resizedMeta = await sharp(resizedLogo).metadata();
  const logoWidth = resizedMeta.width ?? targetWidth;
  const logoHeight = resizedMeta.height ?? targetWidth;

  const opacitySvg = Buffer.from(
    `<svg width="${logoWidth}" height="${logoHeight}">
      <rect x="0" y="0" width="${logoWidth}" height="${logoHeight}"
            fill="rgba(255,255,255,${config.opacity})" />
    </svg>`,
  );

  const logoWithOpacity = await sharp(resizedLogo)
    .composite([{ input: opacitySvg, blend: "dest-in" }])
    .png()
    .toBuffer();

  // Composite logo onto the image at the configured position
  const result = await image
    .composite([
      {
        input: logoWithOpacity,
        gravity: getGravity(config.position),
      },
    ])
    .jpeg({ quality: 85 })
    .toBuffer();

  return result;
}
