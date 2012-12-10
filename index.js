/**
 * Module dependencies
 */

var render = require('json-to-dom'),
    isArray = require('isArray');

/**
 * Export `Link`
 */

module.exports = Link;

/**
 * Initialize `Link`
 *
 * @param {DOMNode} el
 * @param {Model} model
 * @api public
 */

function Link(el, model) {
  if(!(this instanceof Link)) return new Link(el, model);
  this.original = el.cloneNode(true);
  this.el = el;
  this.model = model;
  this.formatters = {};
  this.model.on('change', this.onchange.bind(this));
}

/**
 * Onchange
 *
 * @param {String} name
 * @param {Mixed} val
 * @api private
 */

Link.prototype.onchange = function(name, val) {
  var el = (!isArray(val)) ? this.el : splice(name, this.original, this.el),
      changed = {};

  changed[name] = val;
  this.render(el, changed);
};

/**
 * Format an attribute
 * @param  {String} attr
 * @param  {Function} fn
 * @return {Link}
 * @api public
 */

Link.prototype.format = function(attr, fn) {
  this.formatters[attr] = fn;
  return this;
};

/**
 * Render the template
 *
 * @param {DOMNode} el
 * @param {Object} obj
 * @return {Link}
 * @api public
 */

Link.prototype.render = function(el, obj) {
  el = el || this.el,
  obj = obj || this.model.toJSON();

  for(var key in obj) {
    var fn = this.formatters[key];
    if(fn) obj[key] = fn(obj[key]);
  }

  render(this.el, obj);
  return this;
};

/**
 * Splice elements from original el into current state el
 *
 * @param {String} name
 * @param {DOMNode} orig
 * @param {DOMNode} el
 * @return {DomNode} new node
 * @api private
 */

function splice(name, orig, el) {
  var cls = '.' + name,
      ot = orig.querySelector(cls),
      et = el.querySelector(cls);

  et.parentNode.replaceChild(ot.cloneNode(true), et);
  return et;
}
