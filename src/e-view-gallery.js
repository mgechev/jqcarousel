(function ($) {

    $.widget('ui.eView', {
    
        options: {
            eccentricity: 0.98,
            focus: 300,
            images: null,
            imageWidth: 80,
            animationDuration: 700,
            top: 200,
            left: 550,
            direction: 'cw' //'ccw', 'shorter', 'cw'
        },

        _settings: {
            images: [],
            a: 0,
            b: 0,
            activeAnimation: false,
            wrapper: null
        },
    
        _create: function () {
            this._refresh();
        },
        
        _refresh: function () {
            this._render();
            this._performLayout();
            //this._removeEventListeners();
            this._addEventListeners();
          //  this._handlePerspective();
        },
        
        _render: function () {
            var image,
                images = $(this.options.images),
                count = 0.
                settings = this._settings;
            this._calculateEllipse();
            settings.wrapper = this.element.append('<div/>').children()
            images.each(function (index, element) {
                image = {
                    image: $(element)
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
            var settings = this._settings;
                count = settings.count,
                step = (2 * Math.PI) / count,
                angle = Math.PI / 2;
                images = settings.images,
                image = null,
                i = 0;
            for (; i < images.length; i += 1) {
                image = images[i].image;
                image.css('position', 'absolute');
                this._setImagePosition(image, angle);
                images[i].angle = angle;
                angle += step;
            }
        },

        _setImagePosition: function (image, angle) {
            var settings = this._settings, 
                x = this.options.left + settings.a * Math.cos(angle),
                y = this.options.top + settings.b * Math.sin(angle);
            image.css({
                'left': x + 'px',
                'top': y + 'px'
            });
        },
        
        _addEventListeners: function () {
            var i = 0,
                images = this._settings.images,
                image = null,
                self = this;
            for (; i < images.length; i += 1) {
                image = images[i].image;
                (function (i) {
                    image.bind('click', function () {
                        if (!self._settings.activeAnimation) {
                            self._showFront(i);
                        }
                    });
                }(i));
            }
        },
        
        _showFront: function (index, duration) {
            var animationDuration =
                    typeof duration === 'undefined' ? this.options.animationDuration : duration,
                images = this._settings.images,
                image = this._settings.images[index],
                i = 0,
                distance = this._getDistance(image.angle, Math.PI / 2),
                steps = animationDuration / 20,
                step = distance / steps;
            if (distance > 0) {
                for (; i < images.length; i += 1) {
                    if (this.options.direction === 'cw') {
                        this._moveImage(i, step, steps, images[i].angle + distance);
                    } else {
                        this._moveImage(i, step, steps, images[i].angle - distance);
                    }
                }
            }
        },
        
        _moveImage: function (index, step, count, target) {
            var image = this._settings.images[index],
                self = this;
            this._settings.activeAnimation = true;
            if (count > 0) {
                image.angle += (this.options.direction === 'cw') ? step : -step;
                setTimeout(function () {
                    self._moveImage(index, step, count - 1, target);
                }, 20);
            } else {
                image.angle = target;
                image.angle %= 2 * Math.PI;
                this._settings.activeAnimation = false;
            }
            this._handleImageZIndex(image);
            this._setImagePosition(image.image, image.angle);
        },
        
        _handlePerspective: function () {
            var images = this._settings.images,
                i = 0;
            for (; i < images.length; i += 1) {
                this._handleImageZIndex(images[i].image);
            }
        },
        
        _handleImageZIndex: function (image) {
            var count = this._settings.images.length,
                distance = Math.abs(image.angle - Math.PI / 2),
                zoneSize = Math.PI / count,
                i = 0,
                handled = false,
                currentZone = 0,
                zIndex = Math.ceil(count / 2);
            for (; i < count && !handled; i += 1) {
                if (distance <= currentZone + zoneSize &&
                    distance >= currentZone - zoneSize) {
                    image.image.css('z-index', zIndex);
                    handled = true;
               }
                currentZone += zoneSize;
                zIndex -= 1;
            }
        },
        
        _getDistance: function (source, target) {
            if (source === target) {
                return 0;
            }
            switch (this.options.direction) {
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
        }
        
    });
})(jQuery);