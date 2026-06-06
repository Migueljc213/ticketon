import EventPost from 'src/events/domain/entity/EventPost.entity';

export default class FindEventPostsByEventIdUseCaseOutput {
  posts: EventPost[];

  constructor(posts: EventPost[]) {
    this.posts = posts;
  }
}
