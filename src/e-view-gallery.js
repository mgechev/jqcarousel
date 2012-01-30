(function ($) {

    $.widget('ui.eView', {
    
        options: {
            eccentricity: 0.99,
            focus: 200,
            images: null,
            imageWidth: 80,
            animationDuration: 1000,
            direction: 'cw' //'ccw', 'shorter', 'cw'
        },

        _settings: {
            images: [],
            a: 0,
            b: 0,
            count: 0
        },
    
        _create: function () {
            this._refresh();
        },
        
        _refresh: function () {
            this._render();
            this._performLayout();
            //this._removeEventListeners();
            this._addEventListeners();
        },
        
        _render: function () {
            var image,
                images = $(this.options.images),
                count = 0.
                settings = this._settings;
            this._calculateEllipse();
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
            var count = this._settings.count,
                step = (2 * Math.PI) / count,
                angle = Math.PI / 2;
                images = this._settings.images,
                image = null,
                i = 0;
            console.log(count);
            console.log(step);
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
                x = 500 + settings.a * Math.cos(angle),
                y = 200 + settings.b * Math.sin(angle);
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
                        self._showFront(i);
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
                    this._moveImage(i, step, steps, images[i].angle + distance);
                }
            }
        },
        
        _moveImage: function (index, step, count, target) {
            var image = this._settings.images[index],
                self = this;
            if (count > 0) {
                image.angle += step;            
                setTimeout(function () {
                    self._moveImage(index, step, count - 1, target);
                }, 20);
            } else {
                image.angle = target;
                image.angle %= 2 * Math.PI;
            }            
            this._setImagePosition(image.image, image.angle);
        },
        
        _fixAngle: function (index) {
            var image = this._settings.images[index];
            while (image.angle > Math.PI) {
                image.angle -= 2 * Math.PI;
            }
        },
        
        _getDistance: function (source, target) {
            var tempDistance,
                distance = 0;
            if (source === target) {
                return 0;
            }
            if (this.options.direction === 'cw') {
                tempDistance = Math.abs(source - target);
                tempDistance %= (2 * Math.PI);
                if (Math.cos(source) < 0) {
                    distance = Math.max((2 * Math.PI) - tempDistance, tempDistance);
                } else {
                    distance = Math.min((2 * Math.PI) - tempDistance, tempDistance);
                }
            }
            return distance;
        }
        
    });
})(jQuery);