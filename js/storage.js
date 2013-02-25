/**
 *	LOCAL STORAGE UTILITY W/COOKIE POLYFILL
 *
 *	@description
 *		- create, read & destroy local storage data (falls back to cookie if local storage not supported (IE7))
 *		- automatically parses string values to json using json2.js
 *	@example
 *		storage.save('myRecord', {name: First Last, id: 22}, 10); // last param is duration: if truthy, will add data to local storage. If falsy, will add to session. If a number and using cookies, it will store for x days.
 *	 	var jsonData = storage.read('myRecord'); // returns json
 *	  	storage.destroy('myRecord');
 *
 *	@version 1.0.0
 *	@requires
 *		- json2.js
 */


var storage = {
	
	supported: false, // cached flag for support or not after check is run once
	
	/**
	 * checks both for browser support and if it's enabled by user (disabled creates an error). Caches result in the object.
	 * @return {boolean} [returns boolean for supported]
	 */
	checkSupport: function(){
		if (typeof(Storage) !== "undefined"){
			try {
				localStorage.setItem('test', 'test local storage');
				localStorage.getItem('test');
				localStorage.removeItem('test');
				this.supported = true;
				return true;
			
			} catch(e){
				this.supported = false;
				return false;
			}
		
		}else{
			this.supported = false;
			return false;
		}

		this.checkSupport = function(){ // point to result once function has run once instead of checking again
			return this.supported;
		};
	},
	
	/**
	 * save record to storage (or cookie as fallback)
	 * @param  {string} key      [name of record]
	 * @param  {any} data     [data to be stored. Can be any type.]
	 * @param  {[bool or int]} duration [truthy values will use local storage, falsy will use session. An int value will be used for duration in days, if using cookies.]
	 */
	save: function(key, data, duration){
		if(typeof data !== 'string'){
			data = JSON.stringify(data);
		}
		
		if(this.supported || this.checkSupport() === true){
			if(duration){
				localStorage[key] = data;
			}else{
				sessionStorage[key] = data;
			}
		}else{
			this.cookie.create(key, data, duration);
		}
	},
	
	/**
	 * get stored data for a record
	 * @param  {string} key [name of record]
	 * @return {any}     [json-parsed data that was stored to that record]
	 */
	read: function(key){
		if(this.supported || this.checkSupport() === true){
			if(localStorage[key]){
				return JSON.parse(localStorage[key]);
			}else if(sessionStorage[key]){
				return JSON.parse(sessionStorage[key]);
			}else{
				return null;
			}
		
		}else{
			return JSON.parse(this.cookie.read(key));
		}
	},
	
	/**
	 * remove record from storage or cookie
	 * @param  {string} key [name of record]
	 */
	destroy: function(key){
		if(this.supported || this.checkSupport() === true){
			if(localStorage[key]){
				delete localStorage[key];
			}else if(sessionStorage[key]){
				delete sessionStorage[key];
			}
		}else{
			this.cookie.destroy(key);
		}

	},

	cookie: {
		
		/**
		 * check support for cookies
		 * @return {boolean}
		 */
		checkSupport: function(){
			this.create('cookieSupportTest', 'test', 10000);
			if(this.read('cookieSupportTest')){
				this.destroy('cookieSupportTest');
				return true;
			}else{
				return false;
			}
		},
		
		/**
		 * create cookie
		 * @param  {string} name  [cookie name]
		 * @param  {string} value [cookie data]
		 * @param  {[int]} days  [number of days before expire]
		 */
		create: function (name, value, days) {
			var date,
				expires;

			if (days) {
				date = new Date();
				date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
				expires = "; expires=" + date.toGMTString();
			} else {
				expires = "";
			}

			document.cookie = name + "=" + value + expires + "; path=/";
		},
		
		/**
		 * read cookie
		 * @param  {string} name [cookie name]
		 * @return {string}      [cookie data]
		 */
		read: function (name) {
			var nameEQ = name + "=",
				ca = document.cookie.split(';'),
				i,
				c;

			for (i = 0; i < ca.length; i++) {
				c = ca[i];

				while (c.charAt(0) == ' ') {
					c = c.substring(1, c.length);
				}

				if (c.indexOf(nameEQ) === 0) {
					return c.substring(nameEQ.length, c.length);
				}
			}

			return null;
		},
		
		/**
		 * destory cookie
		 * @param  {string} name [cookie name]
		 */
		destroy: function (name) {
			this.create(name, "", -1);
		}
	}

};
