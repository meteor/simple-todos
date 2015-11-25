Package.describe({
  name: 'bcronin:simple',
  version: '0.0.1',
  // Brief, one-line summary of the package.
  summary: '',
  // URL to the Git repository containing the source code for this package.
  git: '',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
});

Npm.depends({
    'api-javascript': '0.5.13',
})

Package.onUse(function(api) {
  api.versionsFrom('1.1.0.2');

  // Server only
  api.addFiles([
        'lib/server/db.js',
  ], 'server');

  api.addFiles('simple.js');
});

Package.onTest(function(api) {
  api.use('tinytest');
  api.use('bcronin:simple');
  api.addFiles('simple-tests.js');
});
