export const ASSET_ROOT = "/assets/game";

export const CAT = {
  D: { label: "Dare", icon: `${ASSET_ROOT}/category-dare.webp`, color: "#FF6B35", bg: "linear-gradient(145deg,#FF6B35,#C0392B)", tier: "free" },
  T: { label: "Truth", icon: `${ASSET_ROOT}/category-truth.webp`, color: "#4ECDC4", bg: "linear-gradient(145deg,#4ECDC4,#1A6B75)", tier: "free" },
  S: { label: "Group", icon: `${ASSET_ROOT}/category-group.webp`, color: "#F5C518", bg: "linear-gradient(145deg,#F5C518,#C47A00)", tier: "free" },
  W: { label: "Wild", icon: `${ASSET_ROOT}/category-wild.webp`, color: "#FF4757", bg: "linear-gradient(145deg,#FF4757,#8E1ABA)", tier: "free" },
  X: { label: "Spicy", icon: `${ASSET_ROOT}/category-spicy.webp`, color: "#FF6B9D", bg: "linear-gradient(145deg,#FF6B9D,#8B0057)", tier: "free" },
  C: { label: "Confess", icon: `${ASSET_ROOT}/category-confess.webp`, color: "#A29BFE", bg: "linear-gradient(145deg,#A29BFE,#4A3ABA)", tier: "free" },
  G: { label: "Girl Time", icon: `${ASSET_ROOT}/category-girl-time.webp`, color: "#FFCF9C", bg: "linear-gradient(145deg,#FFCF9C,#E85D75)", tier: "free" },
  P: { label: "Strictly Partners", icon: `${ASSET_ROOT}/category-partners.webp`, color: "#FF8577", bg: "linear-gradient(145deg,#FF8577,#7A0C2E)", tier: "paid" },
  O: { label: "Borderline Orgy", icon: `${ASSET_ROOT}/category-borderline.webp`, color: "#B24BF3", bg: "linear-gradient(145deg,#B24BF3,#4B0082)", tier: "paid" },
  M: { label: "Active Mayhem", icon: `${ASSET_ROOT}/category-mayhem.webp`, color: "#7CFC00", bg: "linear-gradient(145deg,#7CFC00,#1B7A3D)", tier: "free" },
  H: { label: "Heat Check", icon: `${ASSET_ROOT}/category-heat-check.webp`, color: "#4361EE", bg: "linear-gradient(145deg,#4361EE,#FF006E)", tier: "paid" },
};

export const CATEGORY_KEYS = Object.keys(CAT);
export const FREE_CATEGORY_KEYS = CATEGORY_KEYS.filter(key => CAT[key].tier === "free");
export const PAID_CATEGORY_KEYS = CATEGORY_KEYS.filter(key => CAT[key].tier === "paid");

export const UI_ASSETS = {
  cardBack: `${ASSET_ROOT}/card-back.webp`, tap: `${ASSET_ROOT}/tap.webp`,
  success: `${ASSET_ROOT}/success.webp`, drink: `${ASSET_ROOT}/drink.webp`,
  trophy: `${ASSET_ROOT}/trophy.webp`, dice: `${ASSET_ROOT}/dice.webp`,
};

export function getEligibleCardIndexes(cards, selectedCategories) {
  const selected = new Set(selectedCategories);
  return cards.reduce((indexes, [category], index) => {
    if (selected.has(category)) indexes.push(index);
    return indexes;
  }, []);
}
