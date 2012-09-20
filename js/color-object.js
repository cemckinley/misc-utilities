/**
 * COLOR MODULE
 *
 * @description
 *		- module that creates color objects from string color values using 'create' method
 *		- also exposes some utility conversion functions for color conversion
 * @example var myBlue = color.create('#123456');
 */

var color = (function(){

	var Color,
		htmlColorMap = {'aqua':'#00ffff', 'black':'#000000', 'blue':'#0000ff', 'fuchsia':'#ff00ff', 'gray':'#808080', 'green':'#008000', 'lime':'#00ff00', 'maroon':'#800000', 'navy':'#000080', 'olive':'#808000', 'orange':'#ffa500', 'purple':'#800080', 'red':'#ff0000', 'silver':'#c0c0c0', 'teal':'#008080', 'white':'#ffffff', 'yellow':'#ffff00'},
		htmlColorComparator = [];

	for(var n in htmlColorMap){ // prep html color names for regex in Color.update
		htmlColorComparator.push(n);
	}
	htmlColorComparator = htmlColorComparator.join('|');

	/**
	 * color object constructor
	 * creates color object with values for hex, rgb, hsl, and alpha, based on color value input
	 * @param {string} instanceVal [string value for color (hex, rgb, rgba, html color name)]
	 */
	Color = function(instanceVal){
		this.update(instanceVal);
	};
	Color.prototype = {

		update: function(val){

			// hex accepts 6 and 3 character hex with leading #
			// rgb or rgba accepts format 'rgb(r,g,b)', 'r,g,b', 'rgba(r,g,b,a)', or 'r,g,b,a' with a value of 0-255 or 0%-100% for each
			// also accepts common html names for colors
			var hexRegex = /(^|\s)(#([0-9A-Fa-f]){3,6})(\s|$)/,
				rgbRegex = /(((\d*(\.\d+)?%?)|(\.\d+%?)),){2,3}(\d*(\.\d+)?%?)/g,
				htmlRegex = new RegExp('(^|s)(' + htmlColorComparator + ')(s|$)', 'g'),
				rgbArr;

			// check format of val - hex, rgb, or html?
			if(val.match(hexRegex)){
				this.hex = val;
				this.alpha = 1;
				this.rgb = hexToRgb(val);
			
			}else if(val.match(rgbRegex)){
				rgbArr = val.match(rgbRegex)[0].split(',');
				rgbArr = normalizeRgb(rgbArr);
				this.rgb = [rgbArr[0], rgbArr[1], rgbArr[2]];
				this.hex = rgbToHex(this.rgb);
				this.alpha = rgbArr[3] ? Math.max(0, Math.min(1, rgbArr[3])) : 1;
			
			}else if(val.match(htmlRegex)){
				this.hex = htmlColorMap[val];
				this.alpha = 1;
				this.rgb = hexToRgb(this.hex);
			
			}else{
				throw new Error("Invalid color value. Value can be: a hex string of format '#ccc' or '#cccccc'; an rgb/rgba string of format 'r,g,b' or 'r,g,b,a'; an rgb/rgba string formatted for CSS (e.g. 'rgb(20,40,60)'); a basic html color name (e.g. 'blue') ");
			}

			this.hsl = rgbToHsl(this.rgb);
		}

	};

	/**
	  * creates and returns a Color instance with rgb & hex values, and method for updating the color
	  * @param  {string} colorVal [hex value or rgb value ('#bbbbbb' or 'r,g,b')]
	  * @return {object} [new instance of Color object]
	 */
	function create(colorVal){
		var color;

		try{
			color = new Color(colorVal);
		}catch (e){
			console.log(e.message);
		}
		
		return color;
	}

	/**
	 * convert hex color string to rgb values
	 * @param  {string} hexString [hex color string format '#cccccc' or '#ccc']
	 * @return {array}           [array for r,g,b values]
	 */
	function hexToRgb(hexString){
		var hexArr;
		if(hexString.length === 4){ // if hex shortcode
			hexArr = hexString.match(/[a-f\d]{1}/g);
			for(var i = 0, len = hexArr.length; i < len; i++){
				hexArr[i] += hexArr[i]; // convert hex shortcode to normal hex (e.g. #abc = #aabbcc)
			}
		}else{
			hexArr = hexString.match(/[a-f\d]{2}/g);
		}

		for(var j = 0, len2 = hexArr.length; j < len2; j++){
			hexArr[j] = parseInt(hexArr[j], 16);
		}

		return hexArr;
	}

	/**
	 * convert rgb array into hex color string
	 * @param  {array} rgbArray [array in format of [r,g,b] where r,g,b are integers 0-255]
	 * @return {string}          [hex color string format '#cccccc']
	 */
	function rgbToHex(rgbArray){
		var hexString = '#',
			hexVal;

		for(var i = 0, len = 3; i < len; i++){
			hexVal = rgbArray[i].toString(16);
			if(hexVal.length === 1) hexVal = '0' + hexVal; // add leading zero if only single digit val
			hexString += hexVal;
		}

		return hexString;
	}

	/**
	 * convert rgb array of values into h,s,l values
	 * based on http://mjijackson.com/2008/02/rgb-to-hsl-and-rgb-to-hsv-color-model-conversion-algorithms-in-javascript
	 * @param  {array} rgbArray [rgb array of integers with values 0-255]
	 * @return {array}          [array of values for h,s,l]
	 */
	function rgbToHsl(rgbArray){
		var r = rgbArray[0] / 255,
			g = rgbArray[1] / 255,
			b = rgbArray[2] / 255,
			max, min, diff, mid, h, s, l;

		max = Math.max(r, g, b);
		min = Math.min(r, g, b);
		diff = max - min;
		mid = (max + min) / 2;

		if(max === min){
			h = s = 0;
		}else{
			s = Math.round((diff / max) * 100);
			
			switch(max){
				case r: h = (g - b) / diff + (g < b ? 6 : 0); break;
				case g: h = (b - r) / diff + 2; break;
				case b: h = (r - g) / diff + 4; break;
			}
			h = Math.round(360 * (h / 6));
		}

		l = Math.round(max * 100);

		return [h, s, l];
	}

	/**
	 * standardize format of rgb array values so that each value is an integer 0-255 (converts percentages and sets min/max)
	 * @param  {array} rgbArray [array of rgba values where values are integers/floats [as strings] or percentages as strings]
	 * @return {array}          [array of rgba values where rgb values are integers 0-255 and alpha value is percentage as decimal]
	 */
	function normalizeRgb(rgbArray){
		for(var i = 0, len = rgbArray.length; i < len; i++){
			if(rgbArray[i].match('%')){
				rgbArray[i] = Math.max(0, Math.min(100, parseInt(rgbArray[i], 10))); // remove % and set min 0 max 100
				if(i < 3){
					rgbArray[i] = 255 * (rgbArray[i] / 100); // convert to decimals 0-255
				}else{ // if alpha value
					rgbArray[i] = rgbArray[i] / 100; // convert to percentage as decimal
				}
			}else{
				rgbArray[i] = Math.max(0, Math.min(255, parseFloat(rgbArray[i], 10))); // set min 0 max 255
			}
		}

		return rgbArray;
	}


	/**
	 * PUBLIC API
	 */
	return {
		create: create,
		hexToRgb: hexToRgb,
		rgbToHex: rgbToHex
	};

}());