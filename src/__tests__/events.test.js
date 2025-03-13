const request = require('supertest');
const app = require('../index');
const store = require('../data/store');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'usairamsaeed';

describe('Events API', () => {
  let token;
  
  beforeEach(() => {
    // Clear the store
    store.events = [];
    store.users = [];
    
    // Create a test user and generate token
    const testUser = { id: 1, username: 'testuser' };
    store.users.push(testUser);
    token = jwt.sign({ userId: testUser.id }, JWT_SECRET);
  });

  describe('POST /events', () => {
    it('should create a new event', async () => {
      const event = {
        name: 'Test Event',
        description: 'Test Description',
        date: '2024-12-31',
        time: '12:00',
        category: 'Meetings',
        reminder: 30
      };

      const response = await request(app)
        .post('/events')
        .set('Authorization', `Bearer ${token}`)
        .send(event);

      expect(response.status).toBe(201);
      expect(response.body.name).toBe(event.name);
      expect(store.events).toHaveLength(1);
    });

    it('should reject invalid category', async () => {
      const event = {
        name: 'Test Event',
        description: 'Test Description',
        date: '2024-12-31',
        time: '12:00',
        category: 'InvalidCategory',
        reminder: 30
      };

      const response = await request(app)
        .post('/events')
        .set('Authorization', `Bearer ${token}`)
        .send(event);

      expect(response.status).toBe(400);
    });
  });

  describe('GET /events', () => {
    beforeEach(() => {
      // Add test events
      store.events = [
        {
          id: 1,
          userId: 1,
          name: 'Event 1',
          category: 'Meetings',
          date: '2024-01-01',
          time: '10:00'
        },
        {
          id: 2,
          userId: 1,
          name: 'Event 2',
          category: 'Birthdays',
          date: '2024-01-02',
          time: '11:00'
        }
      ];
    });

    it('should return user events', async () => {
      const response = await request(app)
        .get('/events')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
    });

    it('should filter by category', async () => {
      const response = await request(app)
        .get('/events?category=Meetings')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].category).toBe('Meetings');
    });
  });
});