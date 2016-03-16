/* eslint-env mocha */

import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { assert } from 'meteor/practicalmeteor:chai';

import { Tasks } from './tasks.js';

if (Meteor.isServer) {
  describe('Tasks', () => {
    describe('methods', () => {
      const userId = Random.id();
      let taskId;

      beforeEach(() => {
        Tasks.remove({});
        taskId = Tasks.insert({
          text: 'test task',
          createdAt: new Date(),
          owner: userId,
          username: 'tmeasday',
        });
      });

      it('can delete owned task', () => {
        const deleteTask = Meteor.server.method_handlers.deleteTask;

        // Call delete task with a faked user context, so the server thinks we have userId
        const invocation = { userId };
        deleteTask.apply(invocation, [taskId]);

        assert.equal(Tasks.find().count(), 0);
      });
    });
  });
}
