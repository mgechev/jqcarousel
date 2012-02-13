Carousel gallery
============

jQCarousel is plugin used for creating carousel image galleries.
It's not using canvases so it can be run under older browsers.

  * Version: 1.0.3
  * License: GPL
  * Author: [Minko Gechev](http://twitter.com/mgechev)

jQCarousel API
----------------------

  * focus - ellipse's focus.
  * eccentricity - ellipse eccentricity.
  * animationDuration - the animation duration in milliseconds.
  * opacity - indicates whether the plugin is going to animate images opacity.
  * minOpacity -  sets the minimum opacity (if you don't want any transparent images).
  * direction - rotation direction. Possible values for this property are: "cw", "ccw", "shortest".
  * resize - indicates whether images size is going to be animated.
  * minSizeRatio - sets minimum size ratio, if you don't want to have any invisible images.
  * angle - sets ellipse angle.
  * keyboardNavigation - sets whether the keyboard navigation should be active.

Sample usage
---------------------

### JavaScript

    $(window).load(function () {
        $('#gallery').jqcarousel();
    });

### HTML

    <div id="gallery">
        <img src="images/1.png" alt="" />
        <img src="images/2.png" alt="" />
        <img src="images/3.png" alt="" />
        <img src="images/4.png" alt="" />
        <img src="images/5.png" alt="" />
        <img src="images/6.png" alt="" />
        <img src="images/7.png" alt="" />
    </div>