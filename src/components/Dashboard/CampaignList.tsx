import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatPercentage, formatDate } from '@/lib/utils';
import { MoreVertical, Play, Pause, Settings } from 'lucide-react';
import type { Campaign, AdMetrics } from '@/types';

interface CampaignWithMetrics extends Campaign {
  metrics?: AdMetrics;
  platform_name?: string;
}

interface CampaignListProps {
  campaigns: CampaignWithMetrics[];
  onCampaignClick?: (campaign: CampaignWithMetrics) => void;
  onStatusChange?: (campaignId: string, status: string) => void;
  loading?: boolean;
}

export function CampaignList({ 
  campaigns, 
  onCampaignClick, 
  onStatusChange,
  loading = false 
}: CampaignListProps) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'deleted':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPlatformIcon = (platform: string) => {
    // You can add platform-specific icons here
    return null;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Campaigns</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (campaigns.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Campaigns</CardTitle>
          <CardDescription>No campaigns found</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-8">
            Connect your advertising accounts to see campaigns here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Active Campaigns</CardTitle>
        <CardDescription>
          {campaigns.length} campaign{campaigns.length !== 1 ? 's' : ''} found
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {campaigns.map((campaign) => (
            <div
              key={campaign.id}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={() => onCampaignClick?.(campaign)}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-3">
                  {getPlatformIcon(campaign.platform_name || '')}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {campaign.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {campaign.objective} • {formatDate(campaign.start_date)}
                    </p>
                  </div>
                  <Badge className={getStatusColor(campaign.status)}>
                    {campaign.status}
                  </Badge>
                </div>
                
                {campaign.metrics && (
                  <div className="mt-3 grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Spend</p>
                      <p className="font-medium">{formatCurrency(campaign.metrics.spend)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Revenue</p>
                      <p className="font-medium">{formatCurrency(campaign.metrics.revenue)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">ROAS</p>
                      <p className="font-medium">{campaign.metrics.roas.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">CTR</p>
                      <p className="font-medium">{formatPercentage(campaign.metrics.ctr)}</p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex items-center space-x-2 ml-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    onStatusChange?.(
                      campaign.id, 
                      campaign.status === 'active' ? 'paused' : 'active'
                    );
                  }}
                >
                  {campaign.status === 'active' ? (
                    <Pause className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Handle settings
                  }}
                >
                  <Settings className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Handle more options
                  }}
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 