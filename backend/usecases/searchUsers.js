// backend/usecases/searchUsers.js
'use strict';

function makeSearchUsers({ userRepository }) {
  return async function searchUsers(rawQuery) {
    const q = String(rawQuery || '').trim();

    if (q.length < 2) {
      return [];
    }

    const users = await userRepository.searchByUsername(q, 10);

    return users.map(u => ({
      id: String(u._id),
      username: u.username,
      avatar: u.avatar,
      bio: u.bio || 'Артист OtlichnikMusic'
    }));
  };
}

module.exports = makeSearchUsers;