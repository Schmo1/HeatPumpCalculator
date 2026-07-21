export interface MonthlyBill {
  id: number;
  sortOrder: number;
  month: string;
  cost: number;
  consumption: number | null;
  comment: string | null;
}

export interface BillingPeriod {
  id: number;
  label: string;
  sortOrder: number;
  totalConsumptionKwh: number;
  heatPumpMeterReading: number;
  // berechnet:
  heatPumpConsumption: number;
  davidTotalCost: number;
  heatingTotalCost: number;
  sarahSharePercent: number;
  davidHeatingCost: number;
  sarahHeatingCost: number;
  monthlyBills: MonthlyBill[];
}

export interface BillingPeriodInput {
  label: string;
  sortOrder: number;
  totalConsumptionKwh: number;
  heatPumpMeterReading: number;
  sarahSharePercent: number;
}

export interface MonthlyBillInput {
  sortOrder: number;
  month: string;
  cost: number;
  consumption: number | null;
  comment: string | null;
}

export interface WaterPeriod {
  id: number;
  label: string;
  sortOrder: number;
  isBaseline: boolean;
  totalMeterReading: number | null;
  davidColdReading: number | null;
  davidWarmReading: number | null;
  sarahColdReading: number | null;
  sarahWarmReading: number | null;
  // berechnet:
  totalConsumption: number | null;
  davidCold: number | null;
  davidWarm: number | null;
  davidTotal: number | null;
  sarahCold: number | null;
  sarahWarm: number | null;
  sarahTotal: number | null;
  sarahWarmRatioPercent: number | null;
  sarahTotalRatioPercent: number | null;
}

export interface WaterPeriodInput {
  label: string;
  sortOrder: number;
  isBaseline: boolean;
  totalMeterReading: number | null;
  davidColdReading: number | null;
  davidWarmReading: number | null;
  sarahColdReading: number | null;
  sarahWarmReading: number | null;
}

export interface LoginResponse {
  token: string;
  username: string;
  role: string;
  expiresAt: string;
}
