import FindEventPostsByEventIdUseCase from '../find.event.posts.by.event.id.usecase';
import FakeEventPostRepository from 'src/events/external/repository/fakes/fake.event-post.repository';
import EventPost from 'src/events/domain/entity/EventPost.entity';

describe('FindEventPostsByEventIdUseCase', () => {
  let findEventPostsByEventIdUseCase: FindEventPostsByEventIdUseCase;
  let fakeEventPostRepository: FakeEventPostRepository;

  beforeEach(() => {
    fakeEventPostRepository = new FakeEventPostRepository();
    findEventPostsByEventIdUseCase = new FindEventPostsByEventIdUseCase(
      fakeEventPostRepository,
    );
  });

  it('should return posts for an event', async () => {
    const post1 = new EventPost();
    post1.id = 1;
    post1.eventId = 1;
    post1.userId = 1;
    post1.content = 'Great event!';
    post1.isApproved = true;
    post1.isActive = true;
    await fakeEventPostRepository.create(post1);

    const post2 = new EventPost();
    post2.id = 2;
    post2.eventId = 1;
    post2.userId = 2;
    post2.content = 'Amazing!';
    post2.isApproved = true;
    post2.isActive = true;
    await fakeEventPostRepository.create(post2);

    const result = await findEventPostsByEventIdUseCase.run({
      eventId: 1,
    } as any);

    expect(result.posts).toHaveLength(2);
    expect(result.posts[0].eventId).toBe(1);
    expect(result.posts[1].eventId).toBe(1);
  });

  it('should not return inactive posts', async () => {
    const post1 = new EventPost();
    post1.id = 1;
    post1.eventId = 1;
    post1.userId = 1;
    post1.content = 'Active post';
    post1.isApproved = true;
    post1.isActive = true;
    await fakeEventPostRepository.create(post1);

    const post2 = new EventPost();
    post2.id = 2;
    post2.eventId = 1;
    post2.userId = 2;
    post2.content = 'Inactive post';
    post2.isApproved = true;
    post2.isActive = false;
    await fakeEventPostRepository.create(post2);

    const result = await findEventPostsByEventIdUseCase.run({
      eventId: 1,
    } as any);

    expect(result.posts).toHaveLength(1);
    expect(result.posts[0].content).toBe('Active post');
  });

  it('should not return unapproved posts', async () => {
    const post1 = new EventPost();
    post1.id = 1;
    post1.eventId = 1;
    post1.userId = 1;
    post1.content = 'Approved post';
    post1.isApproved = true;
    post1.isActive = true;
    await fakeEventPostRepository.create(post1);

    const post2 = new EventPost();
    post2.id = 2;
    post2.eventId = 1;
    post2.userId = 2;
    post2.content = 'Unapproved post';
    post2.isApproved = false;
    post2.isActive = true;
    await fakeEventPostRepository.create(post2);

    const result = await findEventPostsByEventIdUseCase.run({
      eventId: 1,
    } as any);

    expect(result.posts).toHaveLength(1);
    expect(result.posts[0].content).toBe('Approved post');
  });

  it('should return empty array when no posts exist', async () => {
    const result = await findEventPostsByEventIdUseCase.run({
      eventId: 999,
    } as any);

    expect(result.posts).toHaveLength(0);
  });
});

