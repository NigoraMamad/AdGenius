import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency, formatPercentage, getPerformanceColor } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricsCardProps {
  title: string;
  value: number;
  previousValue?: number;
  format?: 'currency' | 'percentage' | 'number';
  type?: 'roas' | 'ctr' | 'cpc' | 'cpa';
  icon?: React.ReactNode;
}

export function MetricsCard({ 
  title, 
  value, 
  previousValue, 
  format = 'number',
  type,
  icon 
}: MetricsCardProps) {
  const formatValue = (val: number) => {
    switch (format) {
      case 'currency':
        return formatCurrency(val);
      case 'percentage':
        return formatPercentage(val);
      case 'number':
      default:
        return val.toLocaleString();
    }
  };

  const getTrendIcon = () => {
    if (!previousValue) return null;
    
    const diff = value - previousValue;
    if (diff > 0) return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (diff < 0) return <TrendingDown className="w-4 h-4 text-red-600" />;
    return <Minus className="w-4 h-4 text-gray-600" />;
  };

  const getTrendText = () => {
    if (!previousValue) return null;
    
    const diff = value - previousValue;
    const percentage = Math.abs((diff / previousValue) * 100);
    const direction = diff > 0 ? '+' : '';
    
    return (
      <span className={`text-sm ${diff > 0 ? 'text-green-600' : diff < 0 ? 'text-red-600' : 'text-gray-600'}`}>
        {direction}{percentage.toFixed(1)}%
      </span>
    );
  };

  const performanceColor = type ? getPerformanceColor(value, type) : 'text-gray-900';

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">
          {title}
        </CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline justify-between">
          <div className={`text-2xl font-bold ${performanceColor}`}>
            {formatValue(value)}
          </div>
          <div className="flex items-center space-x-1">
            {getTrendIcon()}
            {getTrendText()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 