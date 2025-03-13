const express = require('express');
const { addReminder } = require('../services/reminderService');
const store = require('../data/store');
const { parseISO, isFuture } = require('date-fns');

const router = express.Router();

// Create event
router.post('/', (req, res) => {
  const { name, description, date, time, category, reminder } = req.body;
  const userId = req.user.userId;
  
  const eventDate = parseISO(`${date}T${time}`);
  
  if (!isFuture(eventDate)) {
    return res.status(400).json({ message: 'Event date must be in the future' });
  }

  if (!store.categories.includes(category)) {
    return res.status(400).json({ message: 'Invalid category' });
  }

  const event = {
    id: store.events.length + 1,
    userId,
    name,
    description,
    date,
    time,
    category,
    reminder,
    createdAt: new Date().toISOString()
  };

  store.events.push(event);

  if (reminder) {
    addReminder(event);
  }

  res.status(201).json(event);
});

// Get all events for user
router.get('/', (req, res) => {
  const userId = req.user.userId;
  const { sort, category } = req.query;

  let events = store.events.filter(event => event.userId === userId);

  if (category) {
    events = events.filter(event => event.category === category);
  }

  if (sort === 'date') {
    events.sort((a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`));
  } else if (sort === 'category') {
    events.sort((a, b) => a.category.localeCompare(b.category));
  }

  res.json(events);
});

// Get event by id
router.get('/:id', (req, res) => {
  const userId = req.user.userId;
  const event = store.events.find(
    e => e.id === parseInt(req.params.id) && e.userId === userId
  );

  if (!event) {
    return res.status(404).json({ message: 'Event not found' });
  }

  res.json(event);
});

// Update event
router.put('/:id', (req, res) => {
  const userId = req.user.userId;
  const eventIndex = store.events.findIndex(
    e => e.id === parseInt(req.params.id) && e.userId === userId
  );

  if (eventIndex === -1) {
    return res.status(404).json({ message: 'Event not found' });
  }

  const updatedEvent = {
    ...store.events[eventIndex],
    ...req.body,
    id: store.events[eventIndex].id,
    userId
  };

  store.events[eventIndex] = updatedEvent;

  if (updatedEvent.reminder) {
    addReminder(updatedEvent);
  }

  res.json(updatedEvent);
});

// Delete event
router.delete('/:id', (req, res) => {
  const userId = req.user.userId;
  const eventIndex = store.events.findIndex(
    e => e.id === parseInt(req.params.id) && e.userId === userId
  );

  if (eventIndex === -1) {
    return res.status(404).json({ message: 'Event not found' });
  }

  store.events.splice(eventIndex, 1);
  res.status(204).send();
});

module.exports = router;