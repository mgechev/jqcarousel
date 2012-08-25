var site = (function ($) {

    'use strict';

    var fadeDuration = 1000,
        scrollDuration = 300,
        windowHeight = Math.max($(window).height(), 600),
        sectionHeight = 550,

        alignContent = function (contents) {
            var content,
                parent;
            contents.each(function (idx) {
                content = $(contents[idx]);
                parent = content.parent();
                content.css({
                    //'margin-top': (parent.height() - content.height()) / 2,
                    'margin-left': (parent.width() - content.width()) / 2
                });
            });
        },

        render = function () {
            $('#menu').jqDock({
                align: 'bottom',
                size: 65,
                bias: 10,
                onReady: function () {
                    alignContent($('#menu'));
                }
            });
            $('#gallery-basic').jqcarousel({ imageWidth: 250 });
            $('#gallery-angle').jqcarousel({ angle: Math.PI / 15, focus: 250, enlargeWidth: 300 });
        },

        performLayout = function () {
            if ($.browser.msie && $.browser.version < 9) {
                $(document.body).css('overflow', 'visible');
            }
            var body = $(document.body),
                page = $('#page'),
                sections = $('.section-container'),
                section,
                margin;
            body.height(windowHeight);
            sections.each(function (idx) {
                section = $(sections[idx]);
                margin = (windowHeight - sectionHeight) / 2;
                section.css('margin-bottom', margin);
                section.css('margin-top', margin);
            });
            page.height($(document).height());
            alignContent($('.section-content'));
            alignContent($('#gallery-angle'));
            alignContent($('#content'));
        },

        scrollTo = function (el) {
            $('html,body').stop();
            var target = el.offset().top - (windowHeight - sectionHeight) / 2;
            target = target < 0 ? 0 : target;
            $('html,body').animate({ scrollTop: target + 'px' }, scrollDuration);
        },

        addEventHandlers = function () {
            var links = $('.dock-item'),
                link;
            links.click(function () {
                link = $(this);
                scrollTo($('#' + link.data('section')));
            });
            $(window).resize(function () {
                performLayout();
            });
            $('.image-wrapper').mouseenter(function () {
                $(this).stop();
                $(this).children().fadeTo(fadeDuration, 0.01);
            });
            $('.image-wrapper').mouseleave(function () {
                $(this).stop();
                $(this).children().fadeTo(fadeDuration, 1);
            });
            document.onselectstart = function () { return false; };
        },

        init = function () {
            render();
            performLayout();
            addEventHandlers();
        };

    return {
        init: init
    };
}(jQuery));

site.preloader = (function ($) {

    'use strict';

    var loadingPointsTimeout,
        config = {
            documentFadeOutDuration: 0,
            documentFadeInDuration: 350,
            documentFadeToValue: 1,
            preloaderFadeToValue: 0.99,
            preloaderFadeInDuration: 0,
            preloaderFadeOutDuration: 350,
            preloaderId: 'preloader',
            preloaderParent: 'html',
            contentToHide: 'body',
            toAnimatePoints: true,
            imageDestination: './images/loading.gif',
            pointsAnimationDuration: 300,
            loadingTextContainer: 'loadingHeader',
            preloaderChildId: 'loading',
            loadingText: 'Loading'
        };
    return {

        init: function () {
            var self = this;
            $(window).load(function () {
                self.removePreloader();
            });
            this.addPreloader();
        },

        removePreloader: function () {
            $(config.contentToHide).children().fadeTo(config.documentFadeInDuration, 1);
            $('#' + config.preloaderId).fadeOut(config.preloaderFadeOutDuration, function () {
                $('#' + config.preloaderId).remove();
            });
            clearTimeout(loadingPointsTimeout);
        },

        addPreloader: function () {
            $(config.contentToHide).children().fadeTo(config.documentFadeOutDuration, config.documentFadeToValue);
            $(config.preloaderParent).prepend('<div id="' + config.preloaderId + '">');
            $('#' + config.preloaderId).html(
                '<div id="' + config.preloaderChildId + '" style="width: 200px;">' +
                    '<h1 id="' + config.loadingTextContainer + '" style="color: #fff">' +
                    '<img src="' + config.imageDestination + '" alt=""> ' + config.loadingText +
                    '</h1></div>'
            );
            this.addStyles();
            $('#' + config.preloaderId).fadeTo(config.preloaderFadeInDuration, config.preloaderFadeToValue);
            this.centerPreloader();
            if (config.toAnimatePoints) {
                this.loadingPoints();
            }
        },

        centerPreloader: function () {
            var verticalMiddle = parseInt($(window).height(), 10) / 2 - parseInt($('#' + config.preloaderChildId).height(), 10) / 2,
                horizontalMiddle = parseInt($(window).width(), 10) / 2 - parseInt($('#' + config.preloaderChildId).width(), 10) / 2;
            $('#' + config.preloaderChildId).css('margin-top', verticalMiddle);
            $('#' + config.preloaderChildId).css('margin-left', horizontalMiddle);
        },

        addStyles: function () {
            $('#' + config.preloaderId).css({
                height: $(document).height(),
                width: $(document).width(),
                background: '#000',
                position: 'absolute',
                left: '0px',
                right: '0px',
                'z-index': 21470
            });
        },

        loadingPoints: function () {
            var self = this,
                loadingText;
            loadingPointsTimeout = setTimeout(function () {
                self.loadingPoints();
            }, config.pointsAnimationDuration);
            if ($('#' + config.loadingTextContainer).text().indexOf('.') < 0 ||
                    $('#' + config.loadingTextContainer).text().indexOf('..') < 0 ||
                    $('#' + config.loadingTextContainer).text().indexOf('...') < 0) {
                $('#' + config.loadingTextContainer).append('.');
            } else if ($('#' + config.loadingTextContainer).text().indexOf('...') >= 0) {
                loadingText = $('#' + config.loadingTextContainer).html();
                $('#' + config.loadingTextContainer).html(loadingText.substr(0, loadingText.length - 3));
            }
        }
    };
}(jQuery));

jQuery(document).ready(function () {
    'use strict';
    site.preloader.init();
});

jQuery(window).load(function () {
    'use strict';
    site.init();
});
