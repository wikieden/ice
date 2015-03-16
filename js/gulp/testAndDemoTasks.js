// **********************************************************************
//
// Copyright (c) 2003-2015 ZeroC, Inc. All rights reserved.
//
// This copy of Ice is licensed to you under the terms described in the
// ICE_LICENSE file included in this distribution.
//
// **********************************************************************

var browserSync = require("browser-sync");
var concat      = require('gulp-concat');
var del         = require("del");
var extreplace  = require("gulp-ext-replace");
var gzip        = require('gulp-gzip');
var newer       = require('gulp-newer');
var path        = require('path');
var paths       = require('vinyl-paths');
var uglify      = require("gulp-uglify");

var util        = require('./util');

module.exports = function(gulp) {

    var subprojects =
    {
        test: [
        "Ice/acm", "Ice/ami", "Ice/binding", "Ice/defaultValue", "Ice/enums", "Ice/exceptions",
        "Ice/exceptionsBidir", "Ice/facets", "Ice/facetsBidir", "Ice/hold", "Ice/inheritance",
        "Ice/inheritanceBidir", "Ice/location", "Ice/objects", "Ice/operations", "Ice/operationsBidir",
        "Ice/optional", "Ice/optionalBidir", "Ice/promise", "Ice/properties", "Ice/proxy", "Ice/retry",
        "Ice/slicing/exceptions", "Ice/slicing/objects", "Ice/timeout", "Ice/number", "Glacier2/router"],
        demo: ["Ice/hello", "Ice/throughput", "Ice/minimal", "Ice/latency", "Ice/bidir", "Glacier2/chat"]
    };

    var minDemos =
    {
        "Ice/minimal":
        {
            srcs: [
            "lib/Ice.min.js",
            "demo/Ice/minimal/Hello.js",
            "demo/Ice/minimal/browser/Client.js"],
            dest: "demo/Ice/minimal/browser/"
        }
    };

    function testHtmlTask(name) { return "test_" + name.replace("/", "_") + ":html"; }
    function testHtmlCleanTask(name) { return "test_" + name.replace("/", "_") + ":html:clean"; }

    subprojects.test.forEach(
        function(name)
        {
            gulp.task(testHtmlTask(name), [],
                function()
                {
                    return gulp.src("test/Common/index.html")
                    .pipe(newer(path.join("test", name, "index.html")))
                    .pipe(gulp.dest(path.join("test", name)));
                });

            gulp.task(testHtmlCleanTask(name), [],
                function()
                {
                    del(path.join("test", name, "index.html"));
                });
        });

    gulp.task("html", subprojects.test.map(testHtmlTask));
    gulp.task("html:watch", ["html"],
        function()
        {
            gulp.watch(["test/Common/index.html"], ["html"]);
        });
    gulp.task("html:clean", subprojects.test.map(testHtmlCleanTask));

    Object.keys(subprojects).forEach(
        function(group)
        {
            function groupTask(name) { return group + "_" + name.replace("/", "_"); }
            function groupGenerateTask(name) { return groupTask(name); }
            function groupWatchTask(name) { return groupTask(name) + ":watch"; }
            function groupCleanTask(name) { return groupTask(name) + ":clean"; }

            subprojects[group].forEach(
                function(name)
                {
                    gulp.task(groupGenerateTask(name), (util.useBinDist ? [] : ["dist"]),
                        function()
                        {
                            return gulp.src(path.join(group, name, "*.ice"))
                            .pipe(util.slice2js(
                            {
                                args: ["-I" + path.join(group, name)],
                                dest: path.join(group, name)
                            }))
                            .pipe(gulp.dest(path.join(group, name)));
                        });

                    gulp.task(groupWatchTask(name),
                        (group == "test" ? [groupGenerateTask(name), "html"] : [groupGenerateTask(name)]),
                        function()
                        {
                            gulp.watch([path.join(group, name, "*.ice")], [groupGenerateTask(name)]);

                            gulp.watch([path.join(group, name, "*.js"),
                                path.join(group, name, "browser", "*.js"),
                                path.join(group, name, "*.html")], function(e){
                                    browserSync.reload(e.path);
                                });
                        });

                    gulp.task(groupCleanTask(name), [],
                        function()
                        {
                            return gulp.src(path.join(group, name, "*.ice"))
                            .pipe(extreplace(".js"))
                            .pipe(paths(del));
                        });
                });

    gulp.task(group, subprojects[group].map(groupGenerateTask).concat(
        group == "test" ? ["common:slice", "common:js", "common:css"].concat(subprojects.test.map(testHtmlTask)) :
        ["common:slice", "common:js", "common:css", "demo_Ice_minimal:min"]));

    gulp.task(group + ":watch", subprojects[group].map(groupWatchTask).concat(
        group == "test" ? ["common:slice:watch", "common:css:watch", "common:js:watch", "html:watch"] :
        ["common:css:watch", "common:js:watch"].concat(Object.keys(minDemos).map(minDemoWatchTaskName))));

    gulp.task(group + ":clean", subprojects[group].map(groupCleanTask).concat(
        group == "test" ? subprojects.test.map(testHtmlCleanTask).concat(["common:slice:clean"]) :
        ["demo_Ice_minimal:min:clean"]));
    });

    function demoTaskName(name) { return "demo_" + name.replace("/", "_"); }
    function minDemoTaskName(name) { return demoTaskName(name) + ":min"; }
    function minDemoWatchTaskName(name) { return minDemoTaskName(name) + ":watch"; }
    function minDemoCleanTaskName(name) { return minDemoTaskName(name) + ":clean"; }

    Object.keys(minDemos).forEach(
        function(name)
        {
            var demo = minDemos[name];

            gulp.task(minDemoTaskName(name), [demoTaskName(name)],
                function()
                {
                    return gulp.src(demo.srcs)
                    .pipe(newer(path.join(demo.dest, "Client.min.js")))
                    .pipe(concat("Client.min.js"))
                    .pipe(uglify())
                    .pipe(gulp.dest(demo.dest))
                    .pipe(gzip())
                    .pipe(gulp.dest(demo.dest));
                });

            gulp.task(minDemoWatchTaskName(name), [minDemoTaskName(name)],
                function()
                {
                    gulp.watch(demo.srcs, [minDemoTaskName(name)]);
                });

            gulp.task(minDemoCleanTaskName(name), [],
                function()
                {
                    del([path.join(demo.dest, "Client.min.js"),
                       path.join(demo.dest, "Client.min.js.gz")]);
                });
        });
};