export default class GetCheckInDashboardUseCaseOutput {
  totalTicketsSold: number;
  totalTicketsCheckedIn: number;
  totalTicketsPending: number;
  attendanceRate: number;
  checkedInToday: number;
  checkedInByPeriod: {
    date: string;
    count: number;
  }[];
  revenue: {
    gross: number;
    net: number;
    platformFee: number;
  };

  constructor(data: {
    totalTicketsSold: number;
    totalTicketsCheckedIn: number;
    totalTicketsPending: number;
    attendanceRate: number;
    checkedInToday: number;
    checkedInByPeriod: { date: string; count: number }[];
    revenue: {
      gross: number;
      net: number;
      platformFee: number;
    };
  }) {
    this.totalTicketsSold = data.totalTicketsSold;
    this.totalTicketsCheckedIn = data.totalTicketsCheckedIn;
    this.totalTicketsPending = data.totalTicketsPending;
    this.attendanceRate = data.attendanceRate;
    this.checkedInToday = data.checkedInToday;
    this.checkedInByPeriod = data.checkedInByPeriod;
    this.revenue = data.revenue;
  }
}
