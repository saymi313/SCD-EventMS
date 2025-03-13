const cron = require('node-cron');
const notifier = require('node-notifier');
const { store } = require('../data/store');
const { parseISO, subMinutes, isAfter } = require('date-fns');

const reminders = new Map();

function addReminder(event) {
  const eventDateTime = parseISO(`${event.date}T${event.time}`);
  const reminderTime = subMinutes(eventDateTime, event.reminder);

  if (isAfter(reminderTime, new Date())) {
    reminders.set(event.id, {
      event,
      timeout: setTimeout(() => {
        sendNotification(event);
      }, reminderTime.getTime() - Date.now())
    });
  }
}

function sendNotification(event) {
  notifier.notify({
    title: 'Event Reminder',
    message: `Upcoming event: ${event.name}`,
    sound: true,
    wait: true
  });
}

function initializeReminders() {
  // Clean up old reminders every day at midnight
  cron.schedule('0 0 * * *', () => {
    const now = new Date();
    reminders.forEach((reminder, eventId) => {
      const eventDateTime = parseISO(`${reminder.event.date}T${reminder.event.time}`);
      if (eventDateTime < now) {
        clearTimeout(reminder.timeout);
        reminders.delete(eventId);
      }
    });
  });
}

module.exports = {
  addReminder,
  initializeReminders
};