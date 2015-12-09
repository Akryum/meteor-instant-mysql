Package.describe({
    name: 'akryum:mysql',
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
    "bluebird": "2.9.34",
    "mysql": "2.8.0",
    "zongji": "0.3.2"
});

Package.onUse(function (api) {
    api.versionsFrom('1.2.1');
    api.use('ecmascript');

    // -- Files
    var files = [];
    // Wrapper
    files.push('server/wrapper/lib/Helper.js');
    files.push('server/wrapper/lib/WhereBuilder.js');
    files.push('server/wrapper/lib/CriteriaBuilder.js');
    files.push('server/wrapper/lib/CriteriaDivider.js');
    files.push('server/wrapper/lib/queries/DeleteQuery.js');
    files.push('server/wrapper/lib/queries/SaveQuery.js');
    files.push('server/wrapper/lib/queries/SelectQueryRules.js');
    files.push('server/wrapper/lib/queries/SelectQuery.js');
    files.push('server/wrapper/lib/ObservableObject.js');
    files.push('server/wrapper/lib/BaseCollection.js');
    files.push('server/wrapper/lib/ConditionalConverter.js');
    files.push('server/wrapper/lib/Table.js');
    files.push('server/wrapper/lib/Connection.js');
    files.push('server/wrapper/lib/ObservableCollection.js');
    files.push('server/wrapper/lib/Database.js');
    files.push('server/wrapper/lib/Wrapper.js');
    files.push('server/wrapper/MysqlWrapper.js');
    // Meteor
    files.push('server/lib/LiveHelper.js');
    files.push('server/lib/Collection.js');
    files.push('server/lib/MeteorDatabase.js');
    files.push('server/Mysql.js');
    // -- end Files
    api.addFiles(files, 'server');

    api.export(['Mysql'], 'server');
});

Package.onTest(function (api) {
    api.use('ecmascript');
    api.use('tinytest');
    api.use('grs:mysql');
    api.addFiles('mysql-tests.js');
});
