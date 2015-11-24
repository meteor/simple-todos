Meteor.startup(function() {

    if (!Meteor.isServer) {
        return;
    }
    if (!Mongo) {
        return;
    }

    var rollback = [];
    try {
        instrumentConnection(rollback, Mongo.Collection.prototype);
    } catch (e) {
        console.log("Instrumentation failed. Rolling back.");
        _.each(rollback, function(arr) {
            arr[0][arr[1]] = arr[2];
        });
    }
});

function instrumentConnection(rollback, proto) {
    var methods = [
        'find',
        'insert',
        'update',
        'remove',
    ];
    _.each(methods, function(name) {
        wrapPassThrough(rollback, proto, name);
    });
    console.log("Mongo instrumentation complete");
}

function wrapPassThrough(rollback, proto, name) {
    var baseImp = proto[name];
    rollback.push(proto, name, baseImp);

    if (!baseImp || typeof baseImp !== 'function') {
        throw new Error("Prototype does not have a function named:", name);
    }
    proto[name] = function() {
        console.log("Instrumented call:", name);
        var ret = baseImp.apply(this, arguments);
        return ret;
    };
}
