var blessed = require('blessed');
var Promise = require('bluebird');
var _ = require('lazy.js');
var fs = Promise.promisifyAll(require('fs'));
var path = require('path');

var Slap = require('./Slap');
var BaseElement = require('./BaseElement');
var BaseList = require('./BaseList');

var util = require('../util');

function FileBrowser (opts) {
  var self = this;

  if (!(self instanceof blessed.Node)) return new FileBrowser(opts);

  BaseList.call(self, _(Slap.global.options.fileBrowser)
    .merge({focusable: true})
    .merge(opts || {})
    .toObject());
}
FileBrowser.prototype.__proto__ = BaseList.prototype;

FileBrowser.prototype._initHandlers = function () {
  var self = this;
  var slap = self.slap;
  self.watchers = {};
  self.on('items', function (items) {
    self.items().forEach(function (item) { if (item.watcher) item.watcher.close(); });
    Promise.map(items, function (item) {
      if (!item.name) item.name = util.resolvePath(item.path);
      item.expanded = true;
      item.watcher = fs.watch(item.path, {persistent: false}, function (event, filename) {
        logger.warn('watch event', arguments);
        var pane = slap.paneForPath(filename);
        if (pane && !pane.editor.isUnsaved()) pane.editor.open(filename).done();
      });
      return fs.readdirAsync(item.path).then(function (files) {
        return Promise
          .map(files, function (file) {
            return fs.statAsync(file).then(function (stats) {
              return {path: file, stats: stats};
            });
          })
          .then(function (filesData) {
            item.children = filesData.map(function (fileData) {
              return {
                name: fileData.path,
                path: fileData.path,
                expandable: fileData.stats.isDirectory(),
              };
            });
          });
      });
    }).done(function () {
      self.computeRenderableLines();
    });
  });
  self.on('choice', function (item) { self.slap.open(item.path, true).done(); });
  // self.on('element mousedown', function (el) { self.focus(); });
  // self.on('cancel', function () {
  //   var currentPane = slap.panes[slap.data.currentPane];
  //   if (currentPane) currentPane.focus();
  // });
  //
  // self.on('focus', function () {
  //   self.style.selected = self.data.selectedStyle;
  //   self.screen.program.hideCursor();
  // });
  // self.on('blur', function () {
  //   self.style.selected = self.data.itemStyle;
  // });

  return BaseList.prototype._initHandlers.apply(self, arguments);
};

module.exports = FileBrowser;
