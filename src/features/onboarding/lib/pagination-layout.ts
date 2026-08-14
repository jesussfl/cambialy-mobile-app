import { PAGINATION } from "../constants";

export type PaginationLayout = {
  activeWidth: number;
  gap: number;
  horizontalInset: number;
  inactiveWidth: number;
};

/**
 * Pure layout math for the pagination row, kept out of the component so the
 * geometry can be reasoned about (and tested) without rendering.
 */
export function getPaginationLayout(screenWidth: number, slideCount: number): PaginationLayout {
  const { activeWidthRatio, gap, horizontalInsetRatio } = PAGINATION;

  const availableWidth = screenWidth * (1 - horizontalInsetRatio);
  const totalGapWidth = Math.max(slideCount - 1, 0) * gap;
  const slotCount = slideCount + (activeWidthRatio - 1);
  const inactiveWidth = Math.max((availableWidth - totalGapWidth) / slotCount, 0);

  return {
    activeWidth: inactiveWidth * activeWidthRatio,
    gap,
    horizontalInset: (screenWidth * horizontalInsetRatio) / 2,
    inactiveWidth,
  };
}
