Misc Utilities
==============

Misc utility libs to handle common tasks


Color Object
------------

 **@description**  
	- module that creates color objects from string color values using 'create' method  
	- also exposes some utility conversion functions for color conversion  
 **@example** var myBlue = color.create('#123456'); // output: { hex:"#123456", alpha:1, rgb:[18,52,86], hsl:[210,79,34] }  


Storage
-------

**@description**  
	- create, read & destroy local storage data (falls back to cookie if local storage not supported (IE7))  
	- automatically parses string values to json using json2.js  
**@example**  
	- storage.save('myRecord', {name: First Last, id: 22}, 10); // last param is duration: if truthy, will add data to local storage. If falsy, will add to session. If a number and using cookies, it will store for x days.  
	- var jsonData = storage.read('myRecord'); // returns json  
	- storage.destory('myRecord');  

**@version 1.0.0**  
**@requires**  
	- json2.js  


Mobile Detection
----------------

**@description**  
	- for detecting mobile/tablet platforms via user agent, when feature detection is just not enough (tablet regex is minimal at this point)  
	- stores result in local storage/cookie for fast referencing on future page loads  
	- user agent regex from http://detectmobilebrowser.com  
 
**@example**  
	- var isMobile = mobileDetection.detectMobile();  
	- var isTablet = mobileDerection.detectTablet();  

**@requires**  
	- storage.js utility  
