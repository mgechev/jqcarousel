Carousel gallery
============

jqCarousel is plugin used for creating carousel image galleries.
It's not using canvases so it can be run under older browsers.

Version: 1.0.2
License: GPL
Author: Minko Gechev @mgechev, http://mgechev.com/

jqCarousel API
----------------------

 *focus - ellipse's focus.
 *eccentricity - ellipse eccentricity.
 *animationDuration - the animation duration in milliseconds.
 *opacity - indicates whether the plugin is going to animate images opacity.
 *minOpacity -  sets the minimum opacity (if you don't want any transparent images).
 *direction - rotation direction. Possible values for this property are: "cw", "ccw", "shortest".
 *resize - indicates whether images size is going to be animated.
 *minSizeRatio - sets minimum size ratio, if you don't want to have any invisible images.
 *angle - sets ellipse angle.

Sample usage
---------------------

    $(window).load(function () {
        $(selector-of-the-element-which-is-containing-all-images).jqcarousel();
    });