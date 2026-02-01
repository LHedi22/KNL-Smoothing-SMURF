'use client';

import { Card } from '@/components/ui/card';

export function RiskGauge({ score }: { score: number }) {
  const getRiskLevel = (score: number) => {
    if (score <= 33) return 'low';
    if (score <= 66) return 'medium';
    return 'high';
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low':
        return 'text-green-600 bg-green-50';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50';
      case 'high':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-primary';
    }
  };

  const riskLevel = getRiskLevel(score);
  const riskColor = getRiskColor(riskLevel);

  return (
    <Card className={`p-8 ${riskColor}`}>
      <h3 className="text-lg font-semibold text-foreground mb-6">
        Overall Risk Score
      </h3>
      
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-5xl font-bold mb-2">{score}</div>
          <div className="text-sm font-semibold capitalize">{riskLevel} Risk</div>
        </div>
        
        <div className="flex-1 ml-8">
          <div className="relative h-3 bg-white/30 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                riskLevel === 'low'
                  ? 'bg-green-600'
                  : riskLevel === 'medium'
                    ? 'bg-yellow-600'
                    : 'bg-red-600'
              }`}
              style={{ width: `${score}%` }}
            />
          </div>
          <div className="flex justify-between text-xs mt-2 text-muted-foreground">
            <span>0</span>
            <span>50</span>
            <span>100</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 text-sm">
        <div className="text-center">
          <div className="text-xs text-muted-foreground mb-1">Low Risk</div>
          <div className="font-semibold">0-33</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-muted-foreground mb-1">Medium Risk</div>
          <div className="font-semibold">34-66</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-muted-foreground mb-1">High Risk</div>
          <div className="font-semibold">67-100</div>
        </div>
      </div>
    </Card>
  );
}
