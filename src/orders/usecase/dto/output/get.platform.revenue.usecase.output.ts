export default class GetPlatformRevenueUseCaseOutput {
  totalRevenue: number;
  platformFee: number;
  netRevenue: number;
  totalOrders: number;
  revenueByMonth: {
    month: string;
    revenue: number;
    platformFee: number;
    netRevenue: number;
  }[];

  constructor(data: {
    totalRevenue: number;
    platformFee: number;
    netRevenue: number;
    totalOrders: number;
    revenueByMonth: {
      month: string;
      revenue: number;
      platformFee: number;
      netRevenue: number;
    }[];
  }) {
    this.totalRevenue = data.totalRevenue;
    this.platformFee = data.platformFee;
    this.netRevenue = data.netRevenue;
    this.totalOrders = data.totalOrders;
    this.revenueByMonth = data.revenueByMonth;
  }
}

