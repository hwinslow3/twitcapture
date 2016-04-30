"use strict";

var system = require('system');
var webpage = require('webpage');

if (system.args.length != 3) {
  console.log("Usage: phantomjs " + system.args[0] + " TWEET_URL OUTPUT_FILE");
  console.log("Will render a screencap of the specified tweet.");
  phantom.exit(1);
}

var tweet = system.args[1];
var output_file = system.args[2];

function render_tweet(dimensions) {
  var page = webpage.create();
  page.viewportSize = dimensions;
  page.open(tweet, function() {
    var offset = page.evaluate(function() {
      return $('.js-original-tweet').offset();
    });
    var tweet_dimensions = page.evaluate(function() {
      return {width: $('.js-original-tweet').outerWidth(),
              height: $('.js-original-tweet').outerHeight()};
    });
    var bottom_right = { right: offset.left + tweet_dimensions.width,
                         bottom: offset.top + tweet_dimensions.height};

    if (offset.top < 0 || offset.left < 0 ||
        bottom_right.right > dimensions.width ||
        bottom_right.bottom > dimensions.height) {
      // doesn't fit, recurse
      return render_tweet({width: dimensions.width * 2,
                           height: dimensions.height * 2});
    } else {
      page.clipRect = {
        top: offset.top,
        left: offset.left,
        width: tweet_dimensions.width,
        height: tweet_dimensions.height
      };
      page.render(output_file);
      phantom.exit(0);
    }
  });
}

render_tweet({width: 560, height: 550});

