export default class SearchEventsUseCaseInput {
  title?: string;
  category?: string;
  city?: string;
  state?: string;
  startDate?: Date;
  endDate?: Date;
  isPublished?: boolean;

  constructor(filters: {
    title?: string;
    category?: string;
    city?: string;
    state?: string;
    startDate?: Date;
    endDate?: Date;
    isPublished?: boolean;
  }) {
    this.title = filters.title;
    this.category = filters.category;
    this.city = filters.city;
    this.state = filters.state;
    this.startDate = filters.startDate;
    this.endDate = filters.endDate;
    this.isPublished = filters.isPublished;
  }
}

