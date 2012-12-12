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

  // Set up the bindings
  this.bind();
}

/**
 * Set up the input bindings
 */

Link.prototype.bind = function() {
  var inputs = this.el.querySelectorAll('input, [contenteditable]'),
      input;

  for(var i = 0, len = inputs.length; i < len; i++) {
    input = inputs[i];
    input.oninput = this.oninput.bind(this);
  }
};

/**
 * Oninput
 *
 * @param {Event} e
 */

Link.prototype.oninput = function(e) {
  var target = e.target,
      model = this.model,
      classes = target.className.split(/\s+/),
      val = target.value || target.innerText || '';

  for (var i = 0, len = classes.length; i < len; i++) {
    var cls = classes[i];
    if(model.attrs[cls]) {
      var prev = model.attrs[cls];
      model.attrs[cls] = val;
      model.emit('change ' + cls, val, prev);
    }
  }
};

/**
 * Onchange
 *
 * @param {String} name
 * @param {Mixed} val
 * @api private
 */

Link.prototype.onchange = function(name, val, prev) {
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

  if(!et) return el;
  et.parentNode.replaceChild(ot.cloneNode(true), et);
  return et;
}
