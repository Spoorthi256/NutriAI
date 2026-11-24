/**
 * ML Recommendation Client
 * 
 * Communicates with the Python FastAPI ML recommendation service at http://localhost:8001.
 * 
 * Principle:
 * RULES decide what is allowed (Phase 3 hard constraints).
 * ML decides what is preferred (Phase 4 ranking).
 * 
 * If the ML service is offline, unresponsive, or times out (1.5s),
 * the client fails gracefully and allows the Phase 3 deterministic
 * engine to produce the plan without disrupting the user experience.
 */

import { NutritionProfile } from '../types';
import { NutritionTargets, DatasetMeal, MealSlot } from '../nutrition/types';

export interface MLMealRecommendation {
  mealId: string;
  name: string;
  decisionTreeScore: number;
  logisticRegressionScore: number;
  naiveBayesScore: number;
  ensembleScore: number;
}

export interface MLRecommendResponse {
  recommendations: MLMealRecommendation[];
  totalEvaluated: number;
  modelVersion: string;
  methodology: string;
}

const ML_SERVICE_URL = 'http://127.0.0.1:8001';
const REQUEST_TIMEOUT_MS = 1500;

class MLClient {
  private isOnlineCache: boolean | null = null;
  private lastHealthCheck: number = 0;

  /**
   * Health check to detect whether the Python ML service is running.
   */
  public async checkHealth(): Promise<boolean> {
    const now = Date.now();
    // Cache health status for 5 seconds to prevent spamming
    if (this.isOnlineCache !== null && now - this.lastHealthCheck < 5000) {
      return this.isOnlineCache;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1000);

      const res = await fetch(`${ML_SERVICE_URL}/health`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      this.isOnlineCache = res.ok;
      this.lastHealthCheck = now;
      return res.ok;
    } catch {
      this.isOnlineCache = false;
      this.lastHealthCheck = now;
      return false;
    }
  }

  /**
   * Request ML recommendation scores for pre-filtered, compatible candidate meals.
   * 
   * Returns: ML recommendations ordered by ensemble score, or null if service is unavailable.
   */
  public async getRecommendations(
    profile: NutritionProfile,
    targets: NutritionTargets,
    candidateMeals: DatasetMeal[],
    slotCategory: MealSlot
  ): Promise<MLMealRecommendation[] | null> {
    if (!candidateMeals || candidateMeals.length === 0) {
      return [];
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

      const payload = {
        profile,
        targets,
        candidateMeals,
        slotCategory,
      };

      const res = await fetch(`${ML_SERVICE_URL}/recommend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        console.warn(`[NutriAI ML Client] ML service returned status ${res.status}. Falling back to Phase 3.`);
        return null;
      }

      const data: MLRecommendResponse = await res.json();
      return data.recommendations;
    } catch (err: unknown) {
      // Graceful fallback on connection refused, network failure, or timeout
      if (err instanceof Error && err.name === 'AbortError') {
        console.warn('[NutriAI ML Client] ML service request timed out (>1500ms). Falling back to Phase 3.');
      } else {
        // Expected when ML service is not started in local dev
        // console.debug('[NutriAI ML Client] ML service unreachable. Using deterministic fallback.');
      }
      return null;
    }
  }
}

export const mlClient = new MLClient();
