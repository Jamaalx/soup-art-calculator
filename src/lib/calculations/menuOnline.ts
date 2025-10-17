import { MenuConfig, MenuCalculation, Product } from '../../types';
import { MENU_COSTS } from '../data/constants';

/**
 * Calculate profit for ONLINE menu (delivery apps)
 * Includes packaging (3 LEI) + commission (36.3%)
 */
export function calculateOnlineMenu(
  pretVanzare: number,
  products: Product[]
): MenuCalculation {
  // Sum product costs
  const costProduse = products.reduce((sum, p) => sum + p.pretCost, 0);
  
  // Fixed packaging per menu
  const costAmbalaj = MENU_COSTS.ONLINE.PACKAGING_PER_MENU;
  
  // Commission on entire sale price
  const comisionPercentage = MENU_COSTS.ONLINE.COMMISSION_PERCENTAGE;
  const comision = (pretVanzare * comisionPercentage) / 100;
  
  // Total cost
  const costTotal = costProduse + costAmbalaj + comision;
  
  // Profit
  const profit = pretVanzare - costTotal;
  
  // Margin percentage (profit / cost)
  const marjaProfit = ((profit / (costProduse + costAmbalaj)) * 100);
  
  // Sum of individual ONLINE prices (what customer pays if buying separately)
  const pretIndividual = products.reduce((sum, p) => sum + p.pretOnline, 0);
  
  // Customer savings
  const economie = pretIndividual - pretVanzare;
  
  // Validation: menu price should be less than individual sum
  // Otherwise customer would just buy items separately
  const isValid = pretVanzare < pretIndividual;
  
  return {
    pretVanzare,
    costProduse,
    costAmbalaj,
    comision,
    comisionPercentage,
    costTotal,
    profit,
    marjaProfit,
    pretIndividual,
    economie,
    isValid
  };
}

/**
 * Calculate multiple simulations for all product combinations
 */
export function simulateOnlineMenus(
  pretVanzare: number,
  ciorbe: Product[],
  feluriPrincipale: Product[]
): MenuCalculation[] {
  const results: MenuCalculation[] = [];
  
  ciorbe.forEach(ciorba => {
    feluriPrincipale.forEach(felPrincipal => {
      const products = [ciorba, felPrincipal];
      const calc = calculateOnlineMenu(pretVanzare, products);
      results.push(calc);
    });
  });
  
  return results;
}