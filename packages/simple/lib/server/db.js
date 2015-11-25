var traceguide = Npm.require('api-javascript/dist/traceguide-node-debug.js');

Meteor.startup(function() {

    if (!Meteor.isServer) {
        return;
    }
    if (!Mongo) {
        return;
    }

    traceguide.options({
        access_token : "{your_access_token}",
        group_name   : "meteor/simple",
        debug        : true,
        log_to_console : true,
        verbosity    : 2,
    });

    var rollback = [];
    try {
        instrumentCollection(rollback, Mongo.Collection.prototype);
    } catch (e) {
        console.log('Instrumentation failed. Rolling back.');
        _.each(rollback, function(arr) {
            arr[0][arr[1]] = arr[2];
        });
    }
});

function instrumentCollection(rollback, proto) {
    var methods = [
        'find',
        'insert',
        'update',
        'remove',
    ];
    _.each(methods, function(name) {
        wrapPassThrough(rollback, proto, name);
    });
    console.log('Mongo instrumentation complete');
}

function wrapPassThrough(rollback, proto, name) {
    var baseImp = proto[name];
    rollback.push(proto, name, baseImp);

    if (!baseImp || typeof baseImp !== 'function') {
        throw new Error('Prototype does not have a function named:', name);
    }
    proto[name] = function() {
        var span = traceguide.span("meteor/Mongo.Collection/" + name);
        var ret = baseImp.apply(this, arguments);
        span.end();
        return ret;
    };
}
