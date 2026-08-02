import registryData from "../data/identity-expression-registry.json";

export interface RegistryMapping {
  id: string;
  identityState: string;
  recognitionMoment: string;
  expressionText: string;
  assetType: "Podcast" | "Shop Product" | "Expert" | "Artist" | "Community";
  assetId: string;
  title: string;
  description: string;
  price?: string;
  uiCopy?: string;
  image?: string;
  destination: string;
  rationale: string;
}

export function getExpressionForState(state: string): RegistryMapping | null {
  if (!state) return null;
  const normalizedState = state.trim().toLowerCase();
  
  // Normalize mentor/contribution states to "contribution"
  let targetState = normalizedState;
  if (normalizedState === "mentor" || normalizedState === "contribution / mentor") {
    targetState = "contribution";
  }

  const found = (registryData as RegistryMapping[]).find(
    (item) => item.identityState.toLowerCase() === targetState
  );
  return found || null;
}
