import EventPost from 'src/events/domain/entity/EventPost.entity';
import IEventPostRepository from 'src/events/domain/interface/event-post.repository.interface';

export default class FakeEventPostRepository implements IEventPostRepository {
  private posts: EventPost[] = [];
  private nextId = 1;

  async create(input: Partial<EventPost>): Promise<EventPost> {
    const post = new EventPost();
    post.id = this.nextId++;
    post.eventId = input.eventId!;
    post.userId = input.userId!;
    post.orderId = input.orderId ?? null;
    post.content = input.content!;
    post.isApproved = input.isApproved !== undefined ? input.isApproved : true;
    post.isActive = input.isActive !== undefined ? input.isActive : true;
    post.createdAt = new Date();
    post.updatedAt = new Date();

    this.posts.push(post);
    return post;
  }

  async findById(id: number): Promise<EventPost | null> {
    return this.posts.find((p) => p.id === id) || null;
  }

  async findByEventId(eventId: number): Promise<EventPost[]> {
    return this.posts.filter(
      (p) =>
        p.eventId === eventId && p.isActive === true && p.isApproved === true,
    );
  }

  async findByUserId(userId: number): Promise<EventPost[]> {
    return this.posts.filter((p) => p.userId === userId);
  }

  async findAll(): Promise<EventPost[]> {
    return [...this.posts];
  }

  async update(id: number, input: Partial<EventPost>): Promise<EventPost> {
    const postIndex = this.posts.findIndex((p) => p.id === id);
    if (postIndex === -1) {
      throw new Error('EventPost not found');
    }

    Object.keys(input).forEach((key) => {
      if (input[key] !== undefined) {
        this.posts[postIndex][key] = input[key];
      }
    });

    this.posts[postIndex].updatedAt = new Date();
    return this.posts[postIndex];
  }

  async delete(id: number): Promise<void> {
    const postIndex = this.posts.findIndex((p) => p.id === id);
    if (postIndex === -1) {
      throw new Error('EventPost not found');
    }
    this.posts.splice(postIndex, 1);
  }
}

