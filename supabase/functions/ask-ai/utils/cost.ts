
export function getDisplayCost({ usedFreeApi, baseCost }: { usedFreeApi: boolean; baseCost: number }) {
  // 管理者API/モデル（無料ユーザー用）利用時は0円
  if (usedFreeApi) return 0;
  return baseCost;
}
