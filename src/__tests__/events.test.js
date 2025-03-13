const request = require('supertest');
const { app, server } = require('../../index'); 
const store = require('../data/store');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'usairamsaeed';

describe('Events API', () => {
  let token;

  beforeAll(() => {
    store.events = [];
    store.users = [];

    const testUser = { id: 1, username: 'ali_ahmed' };
    store.users.push(testUser);
    token = jwt.sign({ userId: testUser.id }, JWT_SECRET);
  });

  afterAll(async () => {
    await server.close(); 
  });

  describe('POST /events', () => {
    it('should create a new business meeting event', async () => {
      const newEvent = {
        name: 'Annual Business Strategy Meeting',
        category: 'Meetings',
        date: '2025-04-10',
        time: '14:00',
      };

      const response = await request(app)
        .post('/events')
        .set('Authorization', `Bearer ${token}`)
        .send(newEvent);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(newEvent.name);
    });

    it('should reject an event with an invalid category', async () => {
      const invalidEvent = {
        name: 'Unknown Celebration',
        category: 'Festival',
        date: '2025-06-15',
        time: '18:00',
      };

      const response = await request(app)
        .post('/events')
        .set('Authorization', `Bearer ${token}`)
        .send(invalidEvent);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid category. Choose from Meetings, Birthdays, or Conferences.');
    });
  });

  describe('GET /events', () => {
    beforeEach(() => {
      store.events = [
        { id: 1, userId: 1, name: 'Project Kickoff Meeting', category: 'Meetings', date: '2025-05-01', time: '10:00' },
        { id: 2, userId: 1, name: 'Company Anniversary Celebration', category: 'Birthdays', date: '2025-05-20', time: '18:30' },
        { id: 3, userId: 2, name: 'Tech Conference 2025', category: 'Conferences', date: '2025-06-10', time: '09:00' }
      ];
    });

    it('should return only the events created by the authenticated user', async () => {
      const response = await request(app)
        .get('/events')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2); 
    });

    it('should filter events by category', async () => {
      const response = await request(app)
        .get('/events?category=Meetings')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].category).toBe('Meetings');
    });
  });

  describe('DELETE /events/:id', () => {
    it('should successfully delete a specific event', async () => {
      const response = await request(app)
        .delete('/events/1')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Event "Project Kickoff Meeting" has been deleted.');
    });

    it('should return an error if the event does not exist', async () => {
      const response = await request(app)
        .delete('/events/999')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Event not found. Please check the event ID.');
    });
  });
});