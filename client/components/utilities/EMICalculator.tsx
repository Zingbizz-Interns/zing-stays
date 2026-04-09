'use client';

import { useState, useCallback } from 'react';

interface EMIResult {
  monthlyEMI: number;
  totalAmount: number;
  totalInterest: number;
}

function computeEMI(principal: number, annualRate: number, tenureMonths: number): EMIResult {
  const r = annualRate / 100 / 12;
  if (r === 0) {
    const monthlyEMI = principal / tenureMonths;
    return { monthlyEMI, totalAmount: principal, totalInterest: 0 };
  }
  const pow = Math.pow(1 + r, tenureMonths);
  const monthlyEMI = (principal * r * pow) / (pow - 1);
  const totalAmount = monthlyEMI * tenureMonths;
  const totalInterest = totalAmount - principal;
  return { monthlyEMI, totalAmount, totalInterest };
}

function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

interface EMICalculatorProps {
  defaultPrincipal?: number;
}

export default function EMICalculator({ defaultPrincipal = 500000 }: EMICalculatorProps) {
  const [principal, setPrincipal] = useState(defaultPrincipal);
  const [annualRate, setAnnualRate] = useState(8.5);
  const [tenureMonths, setTenureMonths] = useState(12);

  const result = computeEMI(principal, annualRate, tenureMonths);

  const handlePrincipal = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseInt(e.target.value.replace(/,/g, ''), 10);
    if (!isNaN(v) && v >= 0) setPrincipal(v);
  }, []);

  const handleRate = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    if (!isNaN(v) && v >= 0 && v <= 50) setAnnualRate(v);
  }, []);

  const handleTenure = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseInt(e.target.value, 10);
    if (!isNaN(v) && v >= 1 && v <= 360) setTenureMonths(v);
  }, []);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-base font-semibold text-gray-800">EMI Calculator</h3>

      <div className="space-y-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Loan Amount (₹)
          </label>
          <input
            type="number"
            min={0}
            value={principal}
            onChange={handlePrincipal}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Interest Rate (% per year)
          </label>
          <input
            type="number"
            min={0}
            max={50}
            step={0.1}
            value={annualRate}
            onChange={handleRate}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Tenure (months)
          </label>
          <input
            type="number"
            min={1}
            max={360}
            value={tenureMonths}
            onChange={handleTenure}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>
      </div>

      <div className="mt-4 rounded-lg bg-blue-50 p-4">
        <div className="text-center">
          <p className="text-xs text-blue-600">Monthly EMI</p>
          <p className="text-2xl font-bold text-blue-700">{formatINR(result.monthlyEMI)}</p>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 border-t border-blue-100 pt-3 text-xs text-gray-600">
          <div>
            <p className="font-medium">Total Amount</p>
            <p>{formatINR(result.totalAmount)}</p>
          </div>
          <div>
            <p className="font-medium">Total Interest</p>
            <p>{formatINR(result.totalInterest)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
