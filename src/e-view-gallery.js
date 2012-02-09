(function ($) {

    'use strict';

    $.widget('ui.eView', {

        options: {
            eccentricity: 0.98,
            focus: 300,
            images: null,
            animationDuration: 700,
            opacity: true,
            direction: 'cw' //'ccw', 'cw'
        },

        destroy: function () {
            this._removeEventListeners();
            this.element.remove();
        },

        _settings: {
            images: [],
            a: 0,
            b: 0,
            activeAnimation: 0,
            wrapper: null,
            current: 0
        },

        _create: function () {
            this._refresh();
        },

        _refresh: function () {
            this._render();
            this._performLayout();
            this._removeEventListeners();
            this._addEventListeners();
        },

        _render: function () {
            var image,
                images = $(this.options.images),
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

        _performLayout: function () {
            this._performHostLayout();
            this._performImagesLayout();
        },

        _performHostLayout: function () {
            this.element.width(1);
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
                step = (2 * Math.PI) / i;
            settings.current = i - 1;
            while (i) {
                i -= 1;
                image = images[i].image;
                image[0].style.position = 'absolute';
                this._setImagePosition(image, angle);
                images[i].angle = angle;
                this._handleImageZIndex(images[i]);
                angle += step;
            }
        },

        _setImagePosition: function (image, angle) {
            var settings = this._settings,
                x = settings.a * Math.cos(angle),
                y = settings.b * Math.sin(angle);
            image[0].style.left = x + 'px';
            image[0].style.top = y + 'px';
        },

        _removeEventListeners: function () {
            var count = this._settings.images.length,
                images = this._settings.images;
            while (count) {
                count -= 1;
                images[count].image.off();
            }
            $(document).off();
        },

        _addEventListeners: function () {
            var images = this._settings.images,
                i = images.length,
                image = null;
            while (i) {
                i -= 1;
                image = images[i].image;
                this._addClickListener(image, i);
            }
            $(document).on('keydown', { self: this }, this._keyDownHandler);
        },

        _addClickListener: function (image, index) {
            var self = this;
            image.on('click', function () {
                if (!self._settings.activeAnimation) {
                    self._showFront(index);
                }
            });
        },

        _keyDownHandler: function (event) {
            var self = event.data.self;
            if (event.keyCode === 39) {
                self.rotateLeft();
            } else if (event.keyCode === 37) {
                self.rotateRight();
            }
        },

        _showFront: function (index, duration, direction) {
            var animationDuration =
                    typeof duration === 'undefined' ? this.options.animationDuration : duration,
                images = this._settings.images,
                image = this._settings.images[index],
                i = images.length,
                distance = this._getDistance(image.angle, Math.PI / 2, direction),
                steps = animationDuration / 20,
                step = distance / steps;
            this._settings.current = index;
            direction = direction || this.options.direction;
            if (distance > 0) {
                while (i) {
                    i -= 1;
                    this._settings.activeAnimation += 1;
                    if (direction === 'cw') {
                        this._moveImage(i, step, steps, images[i].angle + distance);
                    } else {
                        this._moveImage(i, -step, steps, images[i].angle - distance);
                    }
                }
            }
        },

        _moveImage: function (index, step, stepsCount, target) {
            var image = this._settings.images[index],
                self = this;
            if (stepsCount > 0) {
                image.angle += step;
                setTimeout(function () {
                    self._moveImage(index, step, stepsCount - 1, target);
                }, 20);
            } else {
                this._finishImageMovement(target, image);
            }
            this._handleImageZIndex(image);
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

        _handleImageZIndex: function (image) {
            var count = Math.ceil(this._settings.images.length / 2),
                distance = Math.abs((image.angle % (2 * Math.PI)) - Math.PI / 2),
                zoneSize = Math.PI / count,
                i = count,
                handled = false,
                currentZone = 0,
                zIndex = count;
            while (i && !handled) {
                i -= 1;
                if (distance <= (currentZone + (zoneSize / 2)) && distance > (currentZone - (zoneSize / 2))) {
                    handled = true;
                }
                if (!handled && i) {
                    currentZone += zoneSize;
                    zIndex -= 1;
                }
            }
            image.image[0].style.zIndex = zIndex;
            this._handleOpacity(image.image[0], zIndex / count + 0.3);
        },

        _handleOpacity: function (image, opacity) {
            if (this.options.opacity) {
                if (opacity > 1) {
                    opacity = 1;
                } else if (opacity < 0) {
                    opacity = 0;
                }
                image.style.opacity = opacity;
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
            return distance;
        },

        rotateRight: function (duration) {
            if (typeof duration === 'undefined') {
                duration = this.options.animationDuration;
            }
            var settings = this._settings;
            if (!this._settings.activeAnimation) {
                this._showFront((settings.current + 1) % settings.images.length, duration, 'cw');
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
                this._showFront(next, duration, 'ccw');
            }
        }

    });
}(jQuery));