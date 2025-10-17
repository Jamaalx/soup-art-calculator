import { MenuCalculation, MenuStatistics } from '@/types';
import { COST_CATEGORIES, PROFIT_THRESHOLDS } from '@/lib/data/constants';

/**
 * Calculate statistics from menu simulations
 */
export function calculateStatistics(simulations: MenuCalculation[]): MenuStatistics {
  if (simulations.length === 0) {
    return {
      totalCombinations: 0,
      costMin: 0,
      costMax: 0,
      costMediu: 0,
      profitMediu: 0,
      marjaMin: 0,
      marjaMax: 0,
      marjaMedie: 0,
      profitabile: 0,
      economic: 0,
      mediu: 0,
      premium: 0
    };
  }

  const costuri = simulations.map(s => s.costTotal);
  const profituri = simulations.map(s => s.profit);
  const marje = simulations.map(s => s.marjaProfit);
  
  // Basic stats
  const costMin = Math.min(...costuri);
  const costMax = Math.max(...costuri);
  const costMediu = costuri.reduce((a, b) => a + b, 0) / costuri.length;
  const profitMediu = profituri.reduce((a, b) => a + b, 0) / profituri.length;
  const marjaMin = Math.min(...marje);
  const marjaMax = Math.max(...marje);
  const marjaMedie = marje.reduce((a, b) => a + b, 0) / marje.length;
  
  // Profitability count (>= 100% margin)
  const profitabile = simulations.filter(
    s => s.marjaProfit >= PROFIT_THRESHOLDS.EXCELLENT
  ).length;
  
  // Cost distribution
  const economic = simulations.filter(
    s => s.costTotal < COST_CATEGORIES.ECONOMIC.max
  ).length;
  
  const mediu = simulations.filter(
    s => s.costTotal >= COST_CATEGORIES.MEDIU.min && 
         s.costTotal < COST_CATEGORIES.MEDIU.max
  ).length;
  
  const premium = simulations.filter(
    s => s.costTotal >= COST_CATEGORIES.PREMIUM.min
  ).length;
  
  return {
    totalCombinations: simulations.length,
    costMin,
    costMax,
    costMediu,
    profitMediu,
    marjaMin,
    marjaMax,
    marjaMedie,
    profitabile,
    economic,
    mediu,
    premium
  };
}

/**
 * Get top N most profitable menus
 */
export function getTopProfitableMenus(
  simulations: MenuCalculation[],
  count: number = 5
): MenuCalculation[] {
  return [...simulations]
    .sort((a, b) => b.marjaProfit - a.marjaProfit)
    .slice(0, count);
}

/**
 * Get bottom N least profitable menus
 */
export function getBottomProfitableMenus(
  simulations: MenuCalculation[],
  count: number = 5
): MenuCalculation[] {
  return [...simulations]
    .sort((a, b) => a.marjaProfit - b.marjaProfit)
    .slice(0, count);
}

/**
 * Get recommended pricing based on average cost
 */
export function getRecommendedPricing(costMediu: number) {
  return {
    conservative: {
      price: costMediu * 2.2,
      margin: 120,
      label: 'CONSERVATOR'
    },
    optimal: {
      price: costMediu * 2.0,
      margin: 100,
      label: 'OPTIM'
    },
    competitive: {
      price: costMediu * 1.8,
      margin: 80,
      label: 'COMPETITIV'
    }
  };
}