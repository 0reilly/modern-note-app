// MongoDB initialization script
db = db.getSiblingDB('modern-note-app');

// Create collections
db.createCollection('users');
db.createCollection('notes');
db.createCollection('sessions');

// Create indexes for better performance
db.users.createIndex({ "email": 1 }, { unique: true });
db.notes.createIndex({ "author": 1, "createdAt": -1 });
db.notes.createIndex({ "author": 1, "isArchived": 1 });
db.notes.createIndex({ "tags": 1 });
db.notes.createIndex({ "category": 1 });
db.notes.createIndex({ "title": "text", "content": "text" });
db.sessions.createIndex({ "expiresAt": 1 }, { expireAfterSeconds: 0 });

// Create application user with limited privileges
db.createUser({
  user: 'app_user',
  pwd: 'app_password',
  roles: [
    {
      role: 'readWrite',
      db: 'modern-note-app'
    }
  ]
});

print('MongoDB initialization completed successfully!');