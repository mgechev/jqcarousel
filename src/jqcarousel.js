/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 
* jslint nomen: true, indent: 4, maxerr: 50
* @name jQCarousel
* @version 1.0.3
* @author Minko Gechev
* @date 2012-02-11
*
* @license GPL
*
* @description
*   jQuery plugin creating carousel gallery.
*
*
* @usage
*   $('#gallery').jqcarousel({ settings });
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

(function ($) {

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
            minSizeRatio: 0.3,
            keyboardNavigation: true,
            imageWidth: 300,
            direction: 'shortest',
            enlargeWidth: 500,
            enlargeDuration: 200,
            closeDuration: 250,
            closeButtonSize: 30,
            enlargeEnabled: true
        },

        showFront: function (index, duration, direction) {
            var animationDuration =
                    typeof duration === 'undefined' ? this.options.animationDuration : duration,
                images = this._settings.images,
                image = this._settings.images[index],
                distance = this._getDistance(image.angle, Math.PI / 2, direction),
                steps = animationDuration / this._settings.stepDuration,
                step = distance / steps,
                i = images.length;
            this._settings.current = index;
            direction = direction || this.options.direction;
            if (distance !== 0) {
                while (i) {
                    i -= 1;
                    this._settings.activeAnimation += 1;
                    image = this._settings.images[i];
                    this._moveImage(image, step, steps, images[i].angle + distance, i);
                }
            } else {
                this.enlarge(image.image, index);
            }
        },

        enlarge: function (image, index) {
            if (this.options.enlargeEnabled) {
                var clone = image.clone(),
                    parent = image.parent(),
                    button;
                clone[0].style.zIndex = 10000;
                clone.appendTo(parent);
                button = this._addCloseButton(clone);
                this._enlarger(clone, image[0], button[0], index);
                this._settings.enlarged = true;
            }
        },

        rotateRight: function (duration) {
            if (typeof duration === 'undefined') {
                duration = this.options.animationDuration;
            }
            var settings = this._settings;
            if (!this._settings.activeAnimation) {
                this.showFront((settings.current + 1) % settings.images.length, duration, 'cw');
            }
        },

        rotateLeft: function (duration) {
            if (typeof duration === 'undefined') {
                duration = this.options.animationDuration;
            }
            var settings = this._settings,
                next = settings.current - 1;
            if (next < 0) {
                next = settings.images.length - 1;
            }
            if (!this._settings.activeAnimation) {
                this.showFront(next, duration, 'ccw');
            }
        },

        destroy: function () {
            this._removeEventListeners();
        },

        _create: function () {
            this._addSystemSettings();
            this._handleElementId();
            this._render();
            this._sizeBackup();
            this._performLayout();
            this._removeEventHandlers();
            this._addEventHandlers();
        },

        _addSystemSettings: function () {
            this._settings = {
                images: [],
                a: 0,
                b: 0,
                activeAnimation: 0,
                current: 0,
                stepDuration: 25,
                sizeBackup: [],
                enlarged: true
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
            var image,
                images = $(this.element.children()),
                count = 0,
                settings = this._settings;
            this._calculateEllipse();
            images.each(function (index) {
                image = {
                    image: $(images[index])
                };
                settings.images.push(image);
                count += 1;
            });
            this._settings.count = count;
        },

        _calculateEllipse: function () {
            var settings = this._settings,
                options = this.options;
            settings.a = options.focus / options.eccentricity;
            settings.b = Math.sqrt(settings.a * settings.a - options.focus * options.focus);
        },

        _sizeBackup: function () {
            var images = this._settings.images,
                i = images.length,
                width,
                height;
            while (i) {
                i -= 1;
                width = images[i].image.width();
                height = images[i].image.height();
                this._settings.sizeBackup[i] = {
                    width: width,
                    ratio: height / width
                };
            }
        },

        _performLayout: function () {
            this._performElementLayout();
            this._performImagesLayout();
        },

        _performElementLayout: function () {
            this.element.width(this._settings.a * 2 + this.options.imageWidth);
            this.element.height(1);
            this.element.css('overflow', 'visible');
            this.element.css('position', 'relative');
        },

        _performImagesLayout: function () {
            var settings = this._settings,
                angle = Math.PI / 2,
                images = settings.images,
                image = null,
                i = images.length,
                width = this.options.imageWidth,
                step = (2 * Math.PI) / i,
                ratio;
            settings.current = i - 1;
            while (i) {
                i -= 1;
                ratio = settings.sizeBackup[i].ratio;
                image = images[i].image;
                image.width(width);
                image.height(width * ratio);
                settings.sizeBackup[i].width = width;
                image[0].style.position = 'absolute';
                this._setImagePosition(image, angle);
                images[i].angle = angle;
                this._handlePerspective(images[i], i);
                angle += step;
            }
        },

        _enlarger: function (clone, original, button, index) {
            var enlargeWidth = this.options.enlargeWidth,
                enlargeDuration = this.options.enlargeDuration,
                buttonSize = this.options.closeButtonSize,
                ratio = this._settings.sizeBackup[index].ratio;
            clone.animate({ width: enlargeWidth, height: enlargeWidth * ratio }, {
                step: function (current, fx) {
                    var left = parseInt(original.style.left, 10),
                        top = parseInt(original.style.top, 10);
                    if (fx.prop === 'width') {
                        left = (left - (current - fx.start) / 2);
                        this.style.left = left + 'px';
                        button.style.left = (left - buttonSize / 2 + current) + 'px';
                    } else {
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
                'z-index': 100000,
                'position': 'absolute',
                'cursor': 'pointer'
            });
            button.bind('click', { self: this, image: image, button: button }, this._closeHandler);
            image.bind('click', { self: this, image: image, button: button }, this._closeHandler);
            return button;
        },

        _closeHandler: function (event) {
            var self = event.data.self,
                button = event.data.button,
                image = event.data.image;
            button.fadeOut(self.options.closeDuration);
            image.fadeOut(self.options.closeDuration, function () {
                image.remove();
                button.remove();
                self._settings.enlarged = false;
            });
        },

        _setImagePosition: function (image, angle) {
            var settings = this._settings,
                tempLeft = settings.a * Math.cos(angle) + settings.a,
                tempTop = settings.b * Math.sin(angle) + settings.b,
                left = tempLeft,
                top = tempTop,
                rotationAngle = this.options.angle;
            if (rotationAngle) {
                left = Math.cos(rotationAngle) * tempLeft - Math.sin(rotationAngle) * tempTop;
                top = Math.sin(rotationAngle) * tempLeft + Math.cos(rotationAngle) * tempTop;
            }
            left += 'px';
            top += 'px';
            image[0].style.left = left;
            image[0].style.top = top;
        },

        _removeEventHandlers: function () {
            var count = this._settings.images.length,
                images = this._settings.images;
            while (count) {
                count -= 1;
                images[count].image.off();
            }
            $(document).off('keydown.carousel.' + this.element[0].id, this._addKeyboardHandler);
        },

        _addEventHandlers: function () {
            var images = this._settings.images,
                i = images.length,
                image = null;
            while (i) {
                i -= 1;
                image = images[i].image;
                this._addMouseHandlers(image, i);
            }
            $(document).on('keydown.carousel.' + this.element[0].id, { self: this }, this._addKeyboardHandler);
        },

        _addMouseHandlers: function (image, index) {
            var self = this;
            image.on('click', function () {
                if (!self._settings.activeAnimation) {
                    self.showFront(index);
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
            var self = this;
            if (stepsCount > 0) {
                image.angle += step;
                setTimeout(function () {
                    self._moveImage(image, step, stepsCount - 1, target, index);
                }, this._settings.stepDuration);
            } else {
                this._finishImageMovement(target, image);
            }
            this._handlePerspective(image, index);
            this._setImagePosition(image.image, image.angle);
        },

        _finishImageMovement: function (target, image) {
            if (target < 0) {
                while (target < 0) {
                    target += Math.PI * 2;
                }
            }
            image.angle = target;
            image.angle %= Math.PI * 2;
            this._settings.activeAnimation -= 1;
        },

        _handlePerspective: function (image, index) {
            var zIndex = Math.round(Math.sin(image.angle) * 1000),
                imageElement = image.image,
                ratio = (zIndex + 1000) / 2000;
            imageElement[0].style.zIndex = zIndex;
            this._handleOpacity(imageElement, ratio + this.options.minOpacity);
            this._handleSize(imageElement, index, ratio + this.options.minSizeRatio);
        },

        _handleOpacity: function (image, opacity) {
            if (this.options.opacity) {
                if (opacity > 1) {
                    opacity = 1;
                } else if (opacity < 0) {
                    opacity = 0;
                }
                image[0].style.opacity = opacity;
            }
        },

        _handleSize: function (image, index, ratio) {
            if (this.options.resize) {
                ratio = (ratio > 1) ? 1 : ratio;
                var size = this._settings.sizeBackup[index],
                    newWidth = size.width * ratio,
                    newHeight = newWidth * size.ratio;
                image[0].style.width = newWidth + 'px';
                image[0].style.height = newHeight + 'px';
            }
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
                } else {
                    return -ccwDistance;
                }
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