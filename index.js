/**
 * Module dependencies
 */

var render = require('json-to-dom');

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
 * TODO: Don't refresh the whole template. Not trivial
 * with array references
 *
 * Probably need to save the original and clear it out if
 * val is an array
 */

Link.prototype.onchange = function(name, val, prev) {
  var changed = {};
  changed[name] = val;
  this.render();
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
 * @return {Link}
 * @api public
 */

Link.prototype.render = function(obj) {
  obj = obj || this.model.toJSON();

  for(var key in obj) {
    var fn = this.formatters[key];
    if(fn) obj[key] = fn(obj[key]);
  }

  var el = render(this.original.cloneNode(true), obj);
  this.el.innerHTML = el.innerHTML;
  return this;
};
