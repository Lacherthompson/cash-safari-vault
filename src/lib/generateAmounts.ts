/**
 * Generates an array of amounts that sum to the target goal.
 * Uses a mix of round numbers for a satisfying grid.
 */
export function generateAmounts(goal: number): number[] {
  const amounts: number[] = [];
  let remaining = goal;
  
  // Determine appropriate denominations based on goal size
  let denominations: number[];
  
  if (goal <= 100) {
    denominations = [1, 2, 3, 5, 10];
  } else if (goal <= 500) {
    denominations = [5, 10, 15, 20, 25];
  } else if (goal <= 1000) {
    denominations = [10, 15, 20, 25, 50];
  } else if (goal <= 5000) {
    denominations = [25, 50, 75, 100, 150, 200];
  } else if (goal <= 10000) {
    denominations = [50, 100, 150, 200, 250, 300, 500];
  } else {
    denominations = [100, 200, 250, 500, 750, 1000];
  }
  
  // Target around 30-50 tiles for a nice grid
  const targetTileCount = Math.min(Math.max(20, Math.floor(goal / denominations[denominations.length - 1])), 50);
  const averageAmount = Math.floor(goal / targetTileCount);
  
  // Generate amounts
  while (remaining > 0) {
    // Filter denominations that don't exceed remaining
    const validDenoms = denominations.filter(d => d <= remaining);
    
    if (validDenoms.length === 0) {
      // Add the remaining as is
      amounts.push(remaining);
      break;
    }
    
    // Pick a random denomination, biased toward the average
    let picked: number;
    if (remaining < averageAmount) {
      // Pick from smaller denominations
      picked = validDenoms[Math.floor(Math.random() * Math.min(3, validDenoms.length))];
    } else {
      // Mix it up
      picked = validDenoms[Math.floor(Math.random() * validDenoms.length)];
    }
    
    amounts.push(picked);
    remaining -= picked;
  }
  
  // Shuffle the amounts for variety
  for (let i = amounts.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [amounts[i], amounts[j]] = [amounts[j], amounts[i]];
  }
  
  return amounts;
}
