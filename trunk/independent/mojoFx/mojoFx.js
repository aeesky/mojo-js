/**
 * Copyright (c) 2010 scott.cgi
 * http://mojo-js.appspot.com
 * under MIT License
 * Since  2010-05-16
 * Nightly Builds
 */

(function(window){ 
	
	var 
		
		mojoFx = function(arg) {
			return new moFx(arg);
		},
		
		/**
		 * Animation object inculde HTMLElements and animation API
		 * 
		 * @param {Array/NodeList/HTMLElement} arg
		 */
		moFx = function(arg) {
			this.elements = arg.length ? arg : [arg];
		},		

		joFx = {
			
			// easing algorithm
			easing: {
			   /**
		 	    * @param {Number} t	current time   
		 	    * @param {Number} b	beginning value 
		 	    * @param {Number} c	change value    
		        * @param {Number} d	duration        
		 	    */
				swing: function(t, b, c, d){
					return ((-Math.cos(t / d * Math.PI) / 2) + 0.5) * c + b;
				}
			},
			
			// animation executor time id
			timeId: 0,
			
			// current animation elements
			animEls: [],
			
			/**
			 * Add elements into global animation array
			 * Add elements animation step
			 * 
			 * @param {Array}  els  Array of HTMLElement
			 * @param {Object/Undefined} cfg  Animation configuration object
			 * @return {Object} joFx
			 */
			add: function(els, cfg) {
				var 
					aEls  = this.animEls,
					len   = els.length,
					n     = arguments.length,
					i     = 0,
					el, data;
					
				for(; i < len; i++) {
					el = els[i];
					
					data = this.getElData(el);
					
					if(!data.isAnim) {
						aEls.push(el); 
						data.isAnim = true;
					} 
					
					if(n === 2) {
						cfg.queue ? data.queue.push(cfg) : data.current.push(this.getElStep(el, cfg));
					}
				}					
				
				return this;
			},			
			
			/**
			 * Add elements animation queue callback step
			 * 
			 * @param {Array}  els  Array of HTMLElements
			 * @param {Object} cfg  Callback function configuration object
			 * @return {Object} joFx
			 */
			addCallback: function(els, cfg) {
				var
					obj  = {
						queue: true,
						arguments: [],
						context: window,
						callback: null
					}, p;
				
				for(p in cfg) {
					obj[p] = cfg[p];
				}	
				
				return this.add(els, obj);
			},

			/**
			 * Get animation step array
			 * 
			 * @param {HTMLElement} el  HTMLElement
			 * @param {Object}      cfg Animation configuration object
			 * @return {Array}      step
			 */
			getElStep: function(el, cfg) {
				var 
					step = [],
					eachEasing, easing, prop, fxs,
					p, val, fx;
				
				step.cfg = {
					t: 0,
					d: cfg.duration,	
					ctx: cfg.context,
					args: cfg.arguments,
					callback: cfg.callback,
				};
				
				if(cfg.prop) {
					fxs = cfg.fxs;
				} else {
					// only has callback function	
					return step;					
				}
				
				if (!fxs) {
					fxs = [];
					prop   = cfg.prop;
					easing = cfg.easing;
					eachEasing = cfg.eachEasing;
					
					for (p in prop) {
						// each property animation object
						fx  = {};
						
						// property name
						fx.name = p;
						// easing type
						fx.easing = eachEasing[p] || easing;
						// property value
						val = prop[p]; 
						
						switch (typeof val) {
							case "number":
								fx.symbol = "";
								fx.val = val;
								fx.unit = "px";
								break;
								
							// Property value is an array
							// the 2nd parameter is easing	
							case "object":
								if (val.length > 1) {
									fx.easing = val[1];
								}
								val = val[0];
								// here no break
								
							case "string":
								if (p.toLowerCase().indexOf("color") === -1) {
									val = /(\+=|-=)?(-?\d+)(\D*)/.exec(val);
									fx.symbol = val[1];
									fx.val = val[2];
									fx.unit = val[3] || "px";
									
								// color property					
								} else {
									fx.val = val;
									// unit use "#" when color property
									fx.unit = "#";
								}
						}
						
						fxs.push(fx);
					}
					
					cfg.fxs = fxs;
				}
				
				return this.setBc(el, fxs, step);	
			},

			/**
			 * Set animation step begin and change value
			 * 
			 * @param  {HTMLElement} el    HTMLElement
			 * @param  {Array}       fxs   Animation configuration 
			 * @return {Array}       step  Animation step
			 */
			setBc : function(el, fxs, step) {
				var 
					len = fxs.length,
					i   = 0,
					undefined,
					fx, b, c, p, u;
					
				for(; i < len; i++) {
					fx = fxs[i];
					
					p = fx.name;
					c = fx.val;
					u = fx.unit;
					
					if (u !== "#") {
						// element style property
						if (el[p] === undefined) {
							// get current style value
							b = parseFloat(this.getElStyle(el, p)); 
							if(isNaN(b)) {
								b = 0;
							}
							
						} else {
							b = el[p];
							// unit use "&" when not style property
 							u = "&";
						}
						
						// set change value by symbol
						switch (fx.symbol) {
							case "+=":
								c = c * 1;
								break;
								
							case "-=":
								c = c * 1 - c * 2;
								break;
								
							default:
								c = c * 1 - b;
						}
						
						if (c === 0) {
							continue;
						}
						
					} else {
						b = this.getRgb(this.getElStyle(el, p));
						c = this.getRgb(c);
						
						// RGB value
						c[0] -= b[0];// red
						c[1] -= b[1];// green
						c[2] -= b[2];// blue
						
						if (c.join("") === "000") {
							continue;
						}
					}
					
					step.push({
						p: p.replace(/[A-Z]/g, "-$&"),
						b: b,
						c: c,
						u: u,
						e: this.easing[fx.easing]
					});
				}
				
				return step;
			},
			
			/**
			 * Start global animation executor
			 */
			animStart : function() {
				var 
				    self, start;	
				
				if (!this.timeId) {
				    self  = this;
					start = new Date().getTime();					
					
					this.timeId = window.setInterval(function(){
						var end = new Date().getTime();
						self.updateEl(end - start);
						start = end;
					}, 13);
				}
			},
			
			/**
			 * Update element style
			 * 
			 * @param {Number} stepTime  Each step interval 
			 */
			updateEl : function(stepTime) {
				var 
					aEls = this.animEls,
					len  = aEls.length,
					i    = 0,
					el, que, cur, curStep, data;
			
				for(; i < len; i++) {
					el = aEls[i];
					
					data = this.getElData(el);
					
					// element animation queue
					que = data.queue;
					// current animation steps
					cur = data.current;
					
					// element current animation queue step
					if(!(curStep = data.curStep).length && !data.stopQueue && que.length) {
						curStep = data.curStep = this.getElStep(el, que.shift());
						cur.push(curStep);
					}
					
					if(cur.length) {
						this.step(data, el, cur, stepTime);
					} else {
						// element animation complete
						aEls.splice(i--, 1);
						data.isAnim = false;						
						
						// global animation complete
						if ((len = aEls.length) === 0) {
							window.clearInterval(this.timeId);
							this.timeId = 0;
							return;
						}						
					}
				}					
			},
			
			/**
			 * Animation step
			 * 
			 * @param {HTMLElement} el     HTMLElement
			 * @param {Array}       steps  Animation steps array
			 */
			step: function(data, el, steps, stepTime) {
				var 
					sty  = "",
					len  = steps.length,
					cfgs = [],
					i    = 0,
					step, cfg, d, t;
				
				for (i = 0; i < len; i++) {
					step = steps[i];
					cfg  = step.cfg;
					
					// aniamtion property already complete 
					// or only just has callback function step
					if(step.length === 0) {
						cfgs.push(cfg);
						steps.splice(i--, 1);
						len--;
						continue;
					}
					
					t = cfg.t + stepTime;
					d = cfg.d;
					
					if(t < d) {
						sty += this.getCssText(el, step, t, d);
					} else {
						t = d;
						sty += this.getCssText(el, step, t, d);
						steps.splice(i--, 1);
						len--;
						step.length = 0;	
						cfgs.push(cfg);
					}
					
					cfg.t = t;
				}

				el.style.cssText += sty;
				
				for(i = 0, len = cfgs.length; i < len; i++) {
					cfg = cfgs[i];
					if(cfg.callback) {
						// execute callback function
						cfg.callback.apply(cfg.ctx, cfg.args.concat(el));
					}					
				}
			},
			
			/**
			 * Get element style cssText
			 * 
			 * @param {HTMLElement} el
			 * @param {Array}       step
			 * @param {Number}      t
			 * @param {Number}      d
			 */
			getCssText: function(el, step, t, d) {
				var 
					sty = ";",
					len = step.length,
					i   = 0,
					f, p, b, c, u, e;

				for(; i < len; i++) {
					f = step[i]; 
					
					p = f.p; 
					b = f.b;
					c = f.c;
					u = f.u;
					e = f.e; 
					
					switch (u) {
						case "&" :
							el[p] = e(t, b, c, d);
							continue;
						
						case "#" :
							sty += p + ":rgb(" +
								   Math.ceil(e(t, b[0], c[0], d)) + "," +
								   Math.ceil(e(t, b[1], c[1], d)) + "," +
								   Math.ceil(e(t, b[2], c[2], d)) + ");";
							break;
							
						default:				
							if(p === "opacity") {
								p = e(t, b, c, d);
								sty += "opacity:" + p + ";filter:alpha(opacity=" + p * 100 + ");";								
							} else {
								sty += p + ":" + e(t, b, c, d) + u + ";";								
							}
					}
				}
				
				return sty;				
			},
			
			/**
			 * Get the animation data on element
			 * 
			 * @param {HTMLElement} el HLTMLElement
			 * @return {Object}        mojoFx element animation data
			 */
			getElData: function(el) {
				var x;
				if(!(x = el.mojoData)) {
					x = el.mojoData = {};
				}
				
				if (!x.mojoFx) {
					x.mojoFx = {
						// animation queue
						queue: [],
						
						// current animation steps
						current: [],
						
						// current animation queue step
						curStep: [],
						
						// whether stop animation queue
						stopQueue: false,
						
						// whether the element in animation array
						isAnim: false
					};
				}
				
				return x.mojoFx;				
			},
			
			/**
			 * Set elements data 
			 * 
			 * @param {Array}   els   HTMLElement array
			 * @param {Object}  obj   Data object
			 * @return {Object} joFx
			 */
			setElsData: function(els, obj) {
				var
					len = els.length,
					i = 0,
					el, data, p;
				
				for(; i < len; i++) {
					el = els[i];
					data = this.getElData(el);
					
					for(p in obj) {
						data[p] = obj[p];
					}
				}	
				
				return this;
			},
			
			/**
			 * Stop elements animation
			 * 
			 * @param {Object}  els         HTMLElement array
			 * @param {Boolean} clearQueue  Clear element animation queue
			 * @return {Object} joFx
			 */
			stop: function(els, clearQueue) {
				var
					len = els.length,
					i = 0,
					el, data;
				
				for(; i < len; i++) {
					el = els[i];
					data = this.getElData(el);
					
					data.curStep.length = 0;
					data.current.length = 0;
					
					if(clearQueue) {
						data.queue.length = 0;
					}
				}	
				
				return this;				
			},
			
			/**
			 * Get property value of element css style
			 * 
			 * @param  {HTMLElement} el HTMLElement
			 * @param  {String}      p	Css property name
			 * @return {String} 	    Css property value			
			 */
			getElStyle: function(el, p) { 
				var 
					elSty = el.style,
					curElSty;
				
				if(window.getComputedStyle)	{
					curElSty = window.getComputedStyle(el, null);
				} else {
					curElSty = el.currentStyle;
					if(p === "opacity") {
						return (el.filters.alpha ? el.filters.alpha.opacity : 100) / 100;
					}
				}

				return elSty[p] || curElSty[p];
			},
			
			/**
			 * Get color property value to decimal RGB array
			 * 
			 * @param  {String} color Css color style value
			 * @return {Array}     	  Decimal RGB value array
			 */
			getRgb: function(color) {
				var 
					rgb, i;
				
				if(color.indexOf("#") === 0) {
					// #000
					if(color.length === 4) {
						color = color.replace(/\w/g, "$&$&");
					}
					
					rgb = [];
					
					// #000000
					for (i = 0; i < 3; i++) {
						rgb[i] = parseInt(color.substring(2 * i + 1, 2 * i + 3), 16);
					}					
				
				// rgb(0,0,0)
				} else {	
				   if (color === "transparent" || color === "rgba(0, 0, 0, 0)") {
				   		rgb = [255, 255, 255];
				   } else {
				   		rgb = color.match(/\d+/g);
				   		for (i = 0; i < 3; i++) {
				   			rgb[i] = parseInt(rgb[i]);
				   		}
				   }
				}

				return rgb;				
			}											
										
		};
		
		
		moFx.prototype = {
			/**
			 * Custom animation property and fire it
			 * 
			 * @param  {Object} prop	Element style configuration object
			 * @return {Object} moFx
			 */
			anim: function(prop) {
				var 
					// animation configuration object
					cfg = {
						prop: prop,
						
						duration: 400,
						
						callback: null,
						
						easing: "swing",
						
						eachEasing: {},
						
						// whether current animation enter animation queue 
						queue: true,
						
						// context of callback function
						context: window,
						
						// arguments of callback funtion
						arguments: []
					},
					len = arguments.length,
					i   = 1,
					p, param;

				for(; i < len; i++) {
					param = arguments[i];
					switch(typeof param) {
						case "number":
							cfg.duration = param;
							break;
						
						case "string":
							cfg.easing = param;
							break;
							
						case "function":
							cfg.callback = param;
							break;
						
						case "boolean":
							cfg.queue = param;
							break;	
						
						// optional object configuration
						case "object":
							for(p in param) {
								cfg[p] = param[p];
							}			
					}
				}
				
				// bind configuration object to element
				// set element into global animation array
				// start animation
				joFx.add(this.elements, cfg).animStart();
				
				return this;				
			},
			
			/**
			 * Stop elements animation
			 * 
			 * @param {Boolean} clearQueue  Clear element animation queue	 
			 * @return {Object} moFx
			 */
			stop: function(clearQueue) {
				joFx.stop(this.elements, clearQueue);
				return this;
			},
			
			/**
			 * Set a timer to delay execution aniamtion queue
			 * 
			 * @param {Number} t     Delay times
			 * @return{Object} moFx
			 */
			delay: function(t) {
				var 
				 	els = this.elements,
					count = 0;
				
				joFx.addCallback(els, {
					arguments: [els, els.length, t],
					context: joFx,
					callback: function(els, len, t) {
						if (++count === len) {
							var self = this;
							self.setElsData(els, {stopQueue: true});
							window.setTimeout(function(){
								self.setElsData(els, {stopQueue: false}).add(els).animStart();
							}, t);
						}
					}
				});
				
				return this;
			}							
		};
		
		mojoFx.extend = function(o) {
		 	var p;
			for(p in o) {
				this[p] = o[p];
			}
			
			return this;
		};
		
		
		mojoFx.extend({
			info: {
				author: "scott.cgi",
				version: "1.2.0"
			},
			
			easing: joFx.easing,
			
			/**
			 * Add easing algorithm
			 */
			addEasing: function() {
				var 
					easing = this.easing,
					p, o; 
				
				switch(arguments.length) {
					case 1:
						o = arguments[0];
						for(p in o) {
							easing[p] = o[p];
						}
						break;
					
					case 2:
						p = arguments[0];
						o = arguments[1];
						easing[p] = o;	
				}
				
				return this;
			}			
		});
		
		// make mojoFx global
		window.mojoFx = mojoFx;	
	
})(window);
