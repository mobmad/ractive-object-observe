# ractive-object-observe
An [object-observe](http://updates.html5rocks.com/2012/11/Respond-to-change-with-Object-observe) adapter for [ractive](https://github.com/Rich-Harris/Ractive). 

By using Object.observe, we'll get notifications when an object change. This renders Backbone models/collections and Ractive.set/update obsolete - instead we can simply use a plain old JavaScript object!

***Note:*** Object.observe is scheduled for a future version of JavaScript and is not available in browsers for mainstream usage yet. However, get a glimpse of the future by enabling it in Chrome:

## Enabling Object.observe in Chrome
1. Go to [chrome://flags/](chrome://flags/)
2. Enable `Enable Experimental JavaScript`
3. Restart Chrome

## Demo and usage
See [the demo](http://mobmad.github.io/ractive-object-observe/)

## Licence
* MIT
