import bag from "../../assets/joola-b2b/products/bag.jpg";
import hc40 from "../../assets/joola-b2b/products/hc40.jpg";
import hoodie from "../../assets/joola-b2b/products/hoodie.jpg";
import carbonX from "../../assets/joola-b2b/products/carbon-x.jpg";
import hyperion from "../../assets/joola-b2b/products/hyperion.jpg";
import perseus from "../../assets/joola-b2b/products/perseus.jpg";
import scorpeus from "../../assets/joola-b2b/products/scorpeus.jpg";

/**
 * Public JOOLA prices and photos, checked October 2026.
 * Wholesale unit prices keep the prototype's discount off the published price
 * (about 35–45% off). MSRPs below are the site's own prices, not invented ones.
 *
 * Perseus Pro V, 16mm Blaze Red — $299.95, SKU 600558
 *   https://joola.com/products/joola-perseus-pro-v-pickleball-paddle-1
 *   https://cdn.shopify.com/s/files/1/0685/6943/2278/files/p-bhIbyC-JOOLA-Perseus-Pro-V-16mm-Piackleball-Paddle-Red-2.jpg
 *
 * Hyperion Pro IV 14mm — compare-at $229.95 (current sale $149.95), SKU 300829
 *   https://joola.com/products/joola-hyperion-iv-14mm-pickleball-paddle
 *   https://cdn.shopify.com/s/files/1/0685/6943/2278/files/JOOLA_WBG_2025_ProIV_Hyperion-BJ14mm-01.jpg
 *
 * HC-40 Ball, 3-pack — $9.95, SKU 600091
 *   The prototype's "Indoor 3-Star Balls (6-Pack)" is not on joola.com.
 *   HC-40 is the official DUPR ball. https://joola.com/products/joola-hc-40-ball
 *   https://cdn.shopify.com/s/files/1/0685/6943/2278/files/3_0017_2R1A5283-5.jpg
 *
 * Unisex Full Zip Hoodie, Black — $74.95, SKU 600433 (M)
 *   No Ben Johns hoodie is published. https://joola.com/products/joola-unisex-full-zip-hoodie
 *   https://cdn.shopify.com/s/files/1/0685/6943/2278/files/FZHoodieBlk1.jpg
 *
 * Tour Elite Pickleball Bag, Black/JOOLA Yellow — $109.95, SKU 600333
 *   Sold as a bag, not a backpack. https://joola.com/products/joola-tour-elite-pickleball-bag
 *   https://cdn.shopify.com/s/files/1/0685/6943/2278/files/600333_FW_25_TOUR_ELITE_BLACK_JOOLA_YELLOW_004.jpg
 *
 * Carbon X Table Tennis Racket — $39.95, SKU 54206. No compare-at discount.
 *   https://joola.com/products/joola-carbon-x-table-tennis-racket
 *   https://cdn.shopify.com/s/files/1/0685/6943/2278/files/54206-Pro-Ping-Pong-Paddle-Carbon-X-Pro-Front-Red.jpg
 *
 * Scorpeus Pro V, 16mm JOOLA Yellow (Anna Bright) — $299.95, SKU 600567
 *   Compare-at equals the price. https://joola.com/products/scorpeus-pro-v-pickleball-paddle
 *   https://cdn.shopify.com/s/files/1/0685/6943/2278/files/p-37FcGf-JOOLA-Scorpeus-Pro-V-14mm-Pickleball-Paddle-Yellow-1.jpg
 */

export const photos = { perseus, hyperion, hc40, hoodie, bag, carbonX, scorpeus };

export const money = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD" });
