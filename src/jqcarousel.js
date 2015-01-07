/* jshint maxparams: 5 */

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 
  jQuery UI plugin jQCarousel v1.1.5.
  Copyright (C) 2012 Minko Gechev, http://mgechev.com/, @mgechev

  This program is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3 of the License.

  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU General Public License for more details.

  You should have received a copy of the GNU General Public License
  along with this program.  If not, see <http://www.gnu.org/licenses/>.

            jslint nomen: true

* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

;(function ($) {

  'use strict';

  $.widget('ui.jqcarousel', {

    options: {
      eccentricity: 0.99,
      focus: 300,
      animationDuration: 700,
      opacity: true,
      resize: true,
      angle: 0,
      minOpacity: 0.2,
      minSizeRatio: 0.8,
      keyboardNavigation: true,
      imageWidth: 200,
      direction: 'shortest',
      enlargeWidth: 500,
      enlargeDuration: 200,
      closeDuration: 250,
      closeButtonSize: 30,
      enlargeEnabled: true,
      enlargedOffset: [0, 0]
    },

    showFront: function (index, duration, direction) {
      var animationDuration = duration === undefined ?
        this.options.animationDuration : duration,
          distance;
      direction = direction || this.options.direction;
      if (!this._.enlarged) {
        this._rotateImages(index, animationDuration, direction, distance);
      }
    },

    enlarge: function (index) {
      if (this.options.enlargeEnabled) {
        var image = this._.images[index].image,
          clone = image.clone(),
          parent = image.parent(),
          button;
        clone[0].style.zIndex = 200;
        clone.appendTo(parent);
        button = this._addCloseButton(clone);
        this._.enlargedItems = { image: clone, button: button };
        this._enlarger(clone, image[0], button[0], index);
        this._.enlarged = true;
      }
    },

    removeEnlarged: function () {
      if (this._.enlargedItems) {
        var self = this,
          image = this._.enlargedItems.image,
          button = this._.enlargedItems.button;
        button.fadeOut(this.options.closeDuration);
        image.fadeOut(this.options.closeDuration, function () {
          image.remove();
          button.remove();
          self._.enlarged = false;
        });
      }
    },

    rotateRight: function (duration) {
      if (duration === undefined) {
        duration = this.options.animationDuration;
      }
      if (!this._.activeAnimation) {
        this.showFront((this._.current + 1) %
          this._.images.length, duration, 'cw');
      }
    },

    rotateLeft: function (duration) {
      if (duration === undefined) {
        duration = this.options.animationDuration;
      }
      var next = this._.current - 1;
      if (next < 0) {
        next = this._.images.length - 1;
      }
      if (!this._.activeAnimation) {
        this.showFront(next, duration, 'ccw');
      }
    },

    destroy: function () {
      this._removeEventListeners();
    },

    _rotateImages: function (index, duration, direction) {
      var i = this._.images.length,
        image = this._.images[index],
        distance = this._getDistance(image.angle, Math.PI / 2, direction),
        steps = duration / this._.stepDuration,
        step = distance / steps;
      this._.current = index;
      direction = direction || this.options.direction;
      while (i) {
        i -= 1;
        this._.activeAnimation += 1;
        image = this._.images[i];
        this._moveImage(image, step, steps,
          this._.images[i].angle + distance, i);
      }
    },

    _create: function () {
      this._initPrivateProperties();
      this._handleElementId();
      this._render();
      this._sizeBackup();
      this._performLayout();
      this._removeEventHandlers();
      this._addEventHandlers();
    },

    _initPrivateProperties: function () {
      this._ = {
        images: [],
        a: 0,
        b: 0,
        activeAnimation: 0,
        current: 0,
        stepDuration: 25,
        sizeBackup: [],
        enlarged: false,
        maxHeight: 0,
        enlargedItems: null
      };
    },

    _handleElementId: function () {
      var count = $.data(document.body, 'jqcarousels-count') || 0;
      count += 1;
      $.data(document.body, 'jqcarousels-count', count);
      if (!this.element[0].id) {
        this.element[0].id = 'jqcarousel-' + count;
      }
    },

    _render: function () {
      var self = this,
        image,
        images = $(this.element.children()),
        count = 0;
      this.element[0].tabIndex = 0;
      this.element.css('outline-width', '0px');
      this._calculateEllipse();
      images.each(function (index) {
        image = {
          image: $(images[index])
        };
        self._.images.push(image);
        count += 1;
      });
      this.count = count;
    },

    _calculateEllipse: function () {
      var options = this.options;
      this._.a = options.focus / options.eccentricity;
      this._.b = Math.sqrt(this._.a * this._.a - options.focus * options.focus);
    },

    _sizeBackup: function () {
      var images = this._.images,
        i = images.length,
        width,
        height,
        maxHeight = 0;
      while (i) {
        i -= 1;
        width = images[i].image.width();
        height = images[i].image.height();
        if (height > maxHeight) {
          maxHeight = height;
        }
        this._.sizeBackup[i] = {
          width: width,
          ratio: height / width
        };
      }
      this._.maxHeight = maxHeight;
    },

    _performLayout: function () {
      this._performElementLayout();
      this._performImagesLayout();
    },

    _performElementLayout: function () {
      this.element.width(this._.a * 2 + this.options.imageWidth);
      this.element.height(this._.maxHeight);
      this.element.css('overflow', 'visible');
      this.element.css('position', 'relative');
    },

    _performImagesLayout: function () {
      var angle = Math.PI / 2,
        image = null,
        i = this._.images.length,
        width = this.options.imageWidth,
        step = (2 * Math.PI) / i,
        ratio,
        cssText;
      this._.current = i - 1;
      while (i) {
        i -= 1;
        ratio = this._.sizeBackup[i].ratio;
        image = this._.images[i].image;
        this._.sizeBackup[i].width = width;
        this._.images[i].angle = angle;
        image.width(width);
        image.height(width * ratio);
        cssText = this._setImagePosition(angle) + ';' +
          this._handlePerspective(i);
        this._setImageCssText(image[0], cssText);
        angle += step;
      }
    },

    _setImageCssText: function (image, text) {
      var base = 'position: absolute;';
      image.style.cssText = base + text;
    },

    _enlarger: function (clone, original, button, index) {
      var enlargeWidth = this.options.enlargeWidth,
        enlargeDuration = this.options.enlargeDuration,
        buttonSize = this.options.closeButtonSize,
        ratio = this._.sizeBackup[index].ratio,
        offset = this.options.enlargedOffset;
      clone.animate({ width: enlargeWidth, height: enlargeWidth * ratio }, {
        step: function (current, fx) {
          var left = offset[0] + parseInt(original.style.left, 10),
            top = offset[1] + parseInt(original.style.top, 10);
          if (fx.prop === 'width') {
            current = current || $(this).width();
            left = (left - (current - fx.start) / 2);
            this.style.left = left + 'px';
            button.style.left = (left - buttonSize / 2 + current) + 'px';
          } else {
            current = current || $(this).height();
            top = (top - (current - fx.start) / 2);
            this.style.top = top + 'px';
            button.style.top = (top - buttonSize / 2) + 'px';
          }
        }
      }, enlargeDuration);
    },

    _addCloseButton: function (image) {
      var parent,
        size = this.options.closeButtonSize,
        button = $('<img src="./images/close.png" alt="close" />');
      parent = image.parent();
      parent.append(button);
      button.width(size);
      button.height(size);
      button.css({
        'z-index': 201,
        'position': 'absolute',
        'cursor': 'pointer'
      });
      button.bind('click', this._closeHandler());
      image.bind('click', this._closeHandler());
      return button;
    },

    _closeHandler: function () {
      var self = this;
      return function () {
        self.removeEnlarged();
      };
    },

    _removeEventHandlers: function () {
      var count = this._.images.length,
        images = this._.images;
      while (count) {
        count -= 1;
        images[count].image.off();
      }
      this.element.off('keydown.carousel.' +
        this.element[0].id, this._addKeyboardHandler);
    },

    _addEventHandlers: function () {
      var images = this._.images,
        i = images.length,
        image = null;
      while (i) {
        i -= 1;
        image = images[i].image;
        this._addMouseHandlers(i);
      }
      this.element.on('keydown.carousel.' +
        this.element[0].id, { self: this }, this._addKeyboardHandler);
    },

    _addMouseHandlers: function (index) {
      var self = this,
        image = this._.images[index];
      image.image.on('click', function () {
        if (!self._.activeAnimation) {
          var distance = self._getDistance(image.angle,
            Math.PI / 2, self.options.direction);
          if (distance !== 0) {
            self.showFront(index);
          } else {
            self.enlarge(index);
          }
        }
      });
    },

    _addKeyboardHandler: function (event) {
      var self = event.data.self;
      if (self.options.keyboardNavigation) {
        if (event.keyCode === 39) {
          self.rotateLeft();
        } else if (event.keyCode === 37) {
          self.rotateRight();
        }
      }
    },

    _moveImage: function (image, step, stepsCount, target, index) {
      var self = this,
        cssText;
      if (stepsCount > 0) {
        image.angle += step;
        //TODO use requestAnimationFrame if possible and fallback to setTimeout
        setTimeout(function () {
          self._moveImage(image, step, stepsCount - 1, target, index);
        }, this._.stepDuration);
      } else {
        this._finishImageMovement(target, image);
      }
      cssText = this._handlePerspective(index);
      cssText += ';' + this._setImagePosition(image.angle);
      this._setImageCssText(image.image[0], cssText);
    },

    _finishImageMovement: function (target, image) {
      if (target < 0) {
        while (target < 0) {
          target += Math.PI * 2;
        }
      }
      image.angle = target;
      image.angle %= Math.PI * 2;
      this._.activeAnimation -= 1;
    },

    _setImagePosition: function (angle) {
      var tempLeft = this._.a * Math.cos(angle) + this._.a,
        tempTop = this._.b * Math.sin(angle) + this._.b,
        left = tempLeft,
        top = tempTop,
        rotationAngle = this.options.angle;
      if (rotationAngle) {
        left = Math.cos(rotationAngle) *
          tempLeft - Math.sin(rotationAngle) * tempTop;
        top = Math.sin(rotationAngle) *
          tempLeft + Math.cos(rotationAngle) * tempTop;
      }
      left += 'px';
      top += 'px';
      return 'left:' + left + ';top:' + top;
    },

    _handlePerspective: function (index) {
      var image = this._.images[index],
          zIndex = Math.round(Math.sin(image.angle) * 100) + 100,
          ratio = zIndex / 200,
          styleStr;
      styleStr = this._handleOpacity(ratio + this.options.minOpacity);
      styleStr += ';z-index:' + zIndex;
      styleStr += ';' +
        this._handleSize(index, ratio + this.options.minSizeRatio);
      return styleStr;
    },

    _handleOpacity: function (opacity) {
      if (this.options.opacity) {
        if (opacity > 1) {
          opacity = 1;
        } else if (opacity < 0) {
          opacity = 0;
        }
        return 'opacity:' + opacity;
      }
      return '';
    },

    _handleSize: function (index, ratio) {
      var newWidth = this._.sizeBackup[index].width,
          newHeight = newWidth * this._.sizeBackup[index].ratio,
          size;
      if (this.options.resize) {
        ratio = (ratio > 1) ? 1 : ratio;
        size = this._.sizeBackup[index];
        newWidth = size.width * ratio;
        newHeight = newWidth * size.ratio;
      }
      return 'width:' + newWidth + 'px;height:' + newHeight + 'px';
    },

    _getDistance: function (source, target, direction) {
      if (source === target) {
        return 0;
      }
      direction = direction || this.options.direction;
      switch (direction) {
      case 'cw':
        return this._getCWDistance(source, target);
      case 'ccw':
        return this._getCCWDistance(source, target);
      case 'shortest':
        var ccwDistance = Math.abs(this._getCCWDistance(source, target)),
          cwDistance = this._getCWDistance(source, target);
        if (cwDistance < ccwDistance) {
          return cwDistance;
        }
        return -ccwDistance;
      }
      return 0;
    },

    _getCWDistance: function (source, target) {
      var tempDistance,
        distance = 0;
      tempDistance = Math.abs(source - target) % (2 * Math.PI);
      if (Math.cos(source) < 0) {
        distance = Math.max((2 * Math.PI) - tempDistance, tempDistance);
      } else {
        distance = Math.min((2 * Math.PI) - tempDistance, tempDistance);
      }
      return distance;
    },

    _getCCWDistance: function (source, target) {
      var tempDistance,
        distance = 0;
      tempDistance = Math.abs(source - target) % (2 * Math.PI);
      if (Math.cos(source) > 0) {
        distance = Math.max((2 * Math.PI) - tempDistance, tempDistance);
      } else {
        distance = Math.min((2 * Math.PI) - tempDistance, tempDistance);
      }
      return -distance;
    }
  });
}(jQuery));
