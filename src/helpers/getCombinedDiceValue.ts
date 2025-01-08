import OBR from "@owlbear-rodeo/sdk";
import { Dice, isDice } from "../types/Dice";
import { isDie } from "../types/Die";

/**
 * Check if the dice is a classical D100 roll with a D100
 * for the 10s unit and a D10 for the single digit.
 * If it is return the combined result.
 */
function checkD100Combination(
  dice: Dice,
  values: Record<string, number>
): number | null {
  const bonus = dice.bonus || 0;
  if (
    dice.dice.length === 2 &&
    (dice.combination === undefined || dice.combination === "SUM")
  ) {
    const d1 = dice.dice[0];
    const d2 = dice.dice[1];
    if (isDie(d1) && isDie(d2) && d1.type === "D100" && d2.type === "D10") {
      const v1 = values[d1.id];
      const v2 = values[d2.id];
      if (v1 !== undefined && v2 !== undefined) {
        if (v1 === 0 && v2 === 0) {
          return 100 + bonus;
        } else {
          return v1 + v2 + bonus;
        }
      }
    }
  }
  return null;
}

/**
 * Recursively get the final result for a roll of dice
 * @param dice
 * @param values A mapping of Die ID to their rolled value
 * @returns
 */
export function getCombinedDiceValue(
  dice: Dice,
  values: Record<string, number>
): number | null {
  const d100Value = checkD100Combination(dice, values);
  if (d100Value !== null) {
    return d100Value;
  }

  let currentValues: number[] = [];
  for (const dieOrDice of dice.dice) {
    if (isDie(dieOrDice)) {
      const value = values[dieOrDice.id];
      if (value !== undefined) {
        if (value === 0 && dieOrDice.type === "D10") {
          currentValues.push(10);
        } else {
          currentValues.push(value);
        }
      }
    } else if (isDice(dieOrDice)) {
      const value = getCombinedDiceValue(dieOrDice, values);
      if (value !== null) {
        currentValues.push(value);
      }
    }
  }

  const bonus = dice.bonus || 0;

  if (currentValues.length === 0 || dice.combination === "NONE") {
    if (dice.bonus === undefined) {
      return null;
    } else {
      return dice.bonus;
    }
  } else if (dice.combination === "HIGHEST") {
    return Math.max(...currentValues) + bonus;
  } else if (dice.combination === "LOWEST") {
    return Math.min(...currentValues) + bonus;
  } else {
    return currentValues.reduce((a, b) => a + b) + bonus;
  }
}

/**
 * Recursively get the final result for a roll of dice calculating only successes according to Forbidden lands
 * @param dice
 * @param values A mapping of Die ID to their rolled value
 * @returns
 */
export function getSuccessDiceValueFbl(
  dice: Dice,
  values: Record<string, number>
): number | null {
  const d100Value = checkD100Combination(dice, values);
  if (d100Value !== null) {
    return d100Value;
  }

  let currentValues: number[] = [];
  for (const dieOrDice of dice.dice) {
    if (isDie(dieOrDice)) {
      const value = values[dieOrDice.id];
      if (value !== undefined) {
        if (value === 0 && dieOrDice.type === "D10") {
          currentValues.push(1);
        } else if(value >= 6){
          if(value === 6 || value === 7)
            currentValues.push(1);
          if(value === 8 || value === 9)
            currentValues.push(2);
          if(value === 10 || value === 11)
            currentValues.push(3);
          if(value === 12)
            currentValues.push(5);
        }
      }
    } else if (isDice(dieOrDice)) {
      const value = getSuccessDiceValueFbl(dieOrDice, values);
      if (value !== null) {
        currentValues.push(value);
      }
    }
  }

  const bonus = dice.bonus || 0;

  if (currentValues.length === 0 || dice.combination === "NONE") {
    if (dice.bonus === undefined) {
      return null;
    } else {
      return dice.bonus;
    }
  } else if (dice.combination === "HIGHEST") {
    return Math.max(...currentValues) + bonus;
  } else if (dice.combination === "LOWEST") {
    return Math.min(...currentValues) + bonus;
  } else {
    return currentValues.reduce((a, b) => a + b) + bonus;
  }
}

/**
 * Recursively get the final result for a roll of dice calculating only fails according to Forbidden lands
 * @param dice
 * @param values A mapping of Die ID to their rolled value
 * @returns
 */
export function getFailDiceValueFbl(
  dice: Dice,
  values: Record<string, number>
): number | null {
  const d100Value = checkD100Combination(dice, values);
  if (d100Value !== null) {
    return d100Value;
  }

  let currentValues: number[] = [];
  for (const dieOrDice of dice.dice) {
    if (isDie(dieOrDice)) {
      const value = values[dieOrDice.id];
      if (value !== undefined) {
        if (value === 0 && dieOrDice.type === "D10") {
          continue;
        } else if(value === 1){
          if((dieOrDice.style === "FBLGEAR" || dieOrDice.style === "FBLBASE")){
            currentValues.push(1);
          }
        }
      }
    } else if (isDice(dieOrDice)) {
      const value = getCombinedDiceValue(dieOrDice, values);
      if (value !== null) {
        currentValues.push(value);
      }
    }
  }

  const bonus = dice.bonus || 0;

  if (currentValues.length === 0 || dice.combination === "NONE") {
    if (dice.bonus === undefined) {
      return null;
    } else {
      return dice.bonus;
    }
  } else if (dice.combination === "HIGHEST") {
    return Math.max(...currentValues) + bonus;
  } else if (dice.combination === "LOWEST") {
    return Math.min(...currentValues) + bonus;
  } else {    
    return currentValues.reduce((a, b) => a + b) + bonus;
  }
}
