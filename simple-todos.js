Tasks = new Mongo.Collection("tasks");

if (Meteor.isClient) {
  // This code only runs on the client

  angular.module('simpleTodos',['angular-meteor'])
      .controller('todoList', ['$scope', '$collection', function($scope, $collection){

    $collection(Tasks).bind($scope, 'tasks', true, true);

      $scope.model = {newTodoText: ""};

      $scope.filteredTasks = function(){
        if($scope.hideCompleted) {
          return _.reject($scope.tasks, function(task){return task.checked})
        }else{
          return $scope.tasks
        }
      };
      $scope.privateStatus = function(task){ return task.private ? "Private" : "Public" };
      $scope.isOwner = function(task){ return task.owner === Meteor.userId() };
      $scope.addTask = function(){
        Meteor.call("addTask", $scope.model.newTodoText);
        $scope.model.newTodoText = "" };
      $scope.deleteTask = function(task){ Meteor.call("deleteTask", task._id) };
      $scope.toggleChecked = function(task){
        Meteor.call("setChecked", task._id, task.checked);
        return false;
      };
      $scope.togglePrivate = function(task){ Meteor.call("setPrivate", task._id, ! task.private) };
      $scope.loggedIn = function(){ return Meteor.userId() };
      $scope.incompleteCount = function(){ return _.filter($scope.tasks, function(task){return !(task.checked)}).length }
  }]);

  Meteor.startup(function () {
    angular.bootstrap(document, ['simpleTodos']);
  });

  Meteor.subscribe("tasks");

  Accounts.ui.config({
    passwordSignupFields: "USERNAME_ONLY"
  });
}

Meteor.methods({
  addTask: function (text) {
    // Make sure the user is logged in before inserting a task
    if (! Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }

    Tasks.insert({
      text: text,
      createdAt: new Date(),
      owner: Meteor.userId(),
      username: Meteor.user().username
    });
  },
  deleteTask: function (taskId) {
    var task = Tasks.findOne(taskId);
    if (task.private && task.owner !== Meteor.userId()) {
      // If the task is private, make sure only the owner can delete it
      throw new Meteor.Error("not-authorized");
    }

    Tasks.remove(taskId);
  },
  setChecked: function (taskId, setChecked) {
    var task = Tasks.findOne(taskId);
    if (task.private && task.owner !== Meteor.userId()) {
      // If the task is private, make sure only the owner can check it off
      throw new Meteor.Error("not-authorized");
    }

    Tasks.update(taskId, { $set: { checked: setChecked} });
  },
  setPrivate: function (taskId, setToPrivate) {
    var task = Tasks.findOne(taskId);

    // Make sure only the task owner can make a task private
    if (task.owner !== Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }

    Tasks.update(taskId, { $set: { private: setToPrivate } });
  }
});

if (Meteor.isServer) {
  // Only publish tasks that are public or belong to the current user
  Meteor.publish("tasks", function () {
    return Tasks.find({
      $or: [
        { private: {$ne: true} },
        { owner: this.userId }
      ]
    });
  });
}
