var InterfaceBuilder = function() {
	
	var IB = this;
	
	/*------------------------------------------
	 *	Methods
	/* -------------------------------------- */
	
	IB.matrix = function(obj) {
	
		$(obj).each(function() {
			
			var $wrapper = $(this);
		
			var $body = $wrapper.find("tbody");
			var $head = $wrapper.find("thead tr");
			var name  = $wrapper.data('name');
			var columns = [];
			
			$head.find('th').each(function(i) {
				if(i > 0) {
					columns.push($(this).data('col'));
				}
			});
			
			$wrapper.find(".ib-add-row").live('click', function(e) {
				
				var row = $("<tr />");
				var index = $body.find("tr").length;
				
				row.append("<td><div class=\"ib-drag-handle\"></div></td>");
		
				for(var x = 1; x < $head.find("th").length - 1; x++) {
					row.append("<td><input type=\"text\" name=\""+name+"["+index+"]["+columns[x-1]+"]\" value=\"\" class=\"ib-cell\" /></td>");
				}
		
				row.append("<td><a href=\"#"+index+"\" class=\"ib-delete-row\">Delete</a></td>");
		
				$body.append(row);
		
				e.preventDefault();
			});
			
			$wrapper.find(".ib-delete-row").live('click', function() {		
				$(this).parent().parent().remove();
				
				$body.find('tr').each(function(index) {
					
					var td = $(this).find('td');
					var length = td.length;
					
					td.each(function(i) {
						if(i > 0 && (i + 1) < length) {
							var $input = $(this).find('input');
							var name   = $input.attr('name').replace(/(\[\d\]\[)/g, "\["+index+"\][");			
							$input.attr('name', name);
						}	
					});
					
				});
				
				return false;
			});
					
		});
	}
	
	/*------------------------------------------
	 *	Construct
	/* -------------------------------------- */
	
	IB.matrix('.ib-matrix');
	
}
;/*
	Base.js, version 1.1a
	Copyright 2006-2010, Dean Edwards
	License: http://www.opensource.org/licenses/mit-license.php
*/

var Base = function() {
	// dummy
};

Base.extend = function(_instance, _static) { // subclass
	var extend = Base.prototype.extend;
	
	// build the prototype
	Base._prototyping = true;
	var proto = new this;
	extend.call(proto, _instance);
	proto.base = function() {
    	// call this method from any other method to invoke that method's ancestor
    };
	
	delete Base._prototyping;
	
	// create the wrapper for the constructor function
	//var constructor = proto.constructor.valueOf(); //-dean
	var constructor = proto.constructor;
	var klass = proto.constructor = function() {
		if (!Base._prototyping) {
			if (this._constructing || this.constructor == klass) { // instantiation
				this._constructing = true;
				constructor.apply(this, arguments);
				delete this._constructing;
			} else if (arguments[0] != null) { // casting
				return (arguments[0].extend || extend).call(arguments[0], proto);
			}
		}
	};
	
	// build the class interface
	klass.ancestor = this;
	klass.extend = this.extend;
	klass.forEach = this.forEach;
	klass.implement = this.implement;
	klass.prototype = proto;
	klass.toString = this.toString;
	klass.valueOf = function(type) {
		//return (type == "object") ? klass : constructor; //-dean
		return (type == "object") ? klass : constructor.valueOf();
	};
	extend.call(klass, _static);
	// class initialisation
	if (typeof klass.init == "function") klass.init();
	return klass;
};

Base.prototype = {	
	extend: function(source, value) {
		if (arguments.length > 1) { // extending with a name/value pair
			var ancestor = this[source];
			if (ancestor && (typeof value == "function") && // overriding a method?
				// the valueOf() comparison is to avoid circular references
				(!ancestor.valueOf || ancestor.valueOf() != value.valueOf()) &&
				/\bbase\b/.test(value)) {
				// get the underlying method
				var method = value.valueOf();
				// override
				value = function() {
					var previous = this.base || Base.prototype.base;
					this.base = ancestor;
					var returnValue = method.apply(this, arguments);
					this.base = previous;
					return returnValue;
				};
				// point to the underlying method
				value.valueOf = function(type) {
					return (type == "object") ? value : method;
				};
				value.toString = Base.toString;
			}
			this[source] = value;
		} else if (source) { // extending with an object literal
			var extend = Base.prototype.extend;
			// if this object has a customised extend method then use it
			if (!Base._prototyping && typeof this != "function") {
				extend = this.extend || extend;
			}
			var proto = {toSource: null};
			// do the "toString" and other methods manually
			var hidden = ["constructor", "toString", "valueOf"];
			// if we are prototyping then include the constructor
			var i = Base._prototyping ? 0 : 1;
			while (key = hidden[i++]) {
				if (source[key] != proto[key]) {
					extend.call(this, key, source[key]);

				}
			}
			// copy each of the source object's properties to this object
			for (var key in source) {
				if (!proto[key]) extend.call(this, key, source[key]);
			}
		}
		return this;
	}
};

// initialise
Base = Base.extend({
	constructor: function() {
		this.extend(arguments[0]);
	}
}, {
	ancestor: Object,
	version: "1.1",
	
	forEach: function(object, block, context) {
		for (var key in object) {
			if (this.prototype[key] === undefined) {
				block.call(context, object[key], key, object);
			}
		}
	},
		
	implement: function() {
		for (var i = 0; i < arguments.length; i++) {
			if (typeof arguments[i] == "function") {
				// if it's a function, call it
				arguments[i](this.prototype);
			} else {
				// add the interface using the extend method
				this.prototype.extend(arguments[i]);
			}
		}
		return this;
	},
	
	toString: function() {
		return String(this.valueOf());
	}
});
;(function($) {

	PhotoFrame.Buttons.Crop = PhotoFrame.Button.extend({
		
		/**
		 * An array of button objects
		 */
		
		buttons: [],
		
		/**
		 * The button description 
		 */
		
		description: false,
		
		/**
		 * Name of the button
		 */
		
		name: false,
		
		/**
		 * Is the crop enabled?
		 */
		
		enabled: true,
		
		/**
		 * Should Photo Frame render the photo after removing the layer
		 */	
		 
		renderAfterRemovingLayer: false,
		
		/**
		 * The JSON object used for Window settings 
		 */
		
		windowSettings: {
			title: false
		},
		
		constructor: function(buttonBar) {
			var t = this;
			
			this.name                 = PhotoFrame.Lang.crop;
			this.description          = PhotoFrame.Lang.crop_desc;
			this.windowSettings.title = PhotoFrame.Lang.crop;
			
			this.buttons = [{
				text: PhotoFrame.Lang.crop,
				css: 'photo-frame-tool-window-save',
				onclick: function(e) {
					var crop = t.getCrop(true);
					
					if(crop.x || crop.y || crop.x2 || crop.y2) {					
						t.setCrop(crop.x, crop.y, crop.x2, crop.y2);
					}
				}
			}];

			t.base(buttonBar);
		},
		
		setCrop: function(x, y, x2, y2) {
			this.buttonBar.factory.cropPhoto.jcrop.setSelect([x, y, x2, y2]);
		},
		
		apply: function() {	
			if(this.enabled) {
				var crop = this.getCrop(true);			
				var x    = crop.x;
				var y    = crop.y;
				var x2   = crop.x2;
				var y2   = crop.y2;
				
				if(!this.resizeToggleLayer && (x || x2 || y || y2)) {
					this.addManipulation(true, {
						x:  x,
						x2: x2,
						y:  y,
						y2: y2
					});
				}
			}
		},
		
		getCrop: function(formFields) {
			if(!formFields) {
				return this.buttonBar.factory.cropPhoto.cropDimensions();
			}
			else {
				return {
					x:  parseInt(this.window.ui.x.val()),
					y:  parseInt(this.window.ui.y.val()),
					x2: parseInt(this.window.ui.x2.val()),
					y2: parseInt(this.window.ui.y2.val())
				};
			}
		},
		
		startCrop: function() {
			var crop = this.getCrop();
			
			if(crop.x || crop.y || crop.x2 || crop.y2) {
				this.addManipulation(true, {
					x:  crop.x,
					y:  crop.y,
					x2: crop.x2,
					y2: crop.y2
				});
			}
			else {
				var m = this.getManipulation();
				
				if(m && !m.visible) {
					this.disable();
				}
			}
			
			this.refresh();
		},
		
		toggleLayer: function(visibility, render) {
			var m = this.getManipulation();
			
			if(!visibility) {
				this.hideCrop();
			}
			else {
				this.showCrop(m);
			}
			
			this.addManipulation(visibility, m.data);
		},
		
		hideCrop: function() {			
			this.release();
			this.disable();	
		},
		
		showCrop: function(m) {			
			this.enable();	
			this.setCrop(m.data.x, m.data.y, m.data.x2, m.data.y2);
		},
		
		disable: function(omitJcrop) {
			this.enabled = false;
			
			if(!omitJcrop) {
				this.buttonBar.factory.cropPhoto.jcrop.disable();
			}
			
			this.window.ui.content.find('input').attr('disabled', true);
		},
		
		enable: function(omitJcrop) {
			this.enabled = true;
		
			if(!omitJcrop) {			
				this.buttonBar.factory.cropPhoto.jcrop.enable();	
			}
			
			this.window.ui.content.find('input').attr('disabled', false);
		},
		
		release: function() {
			this.buttonBar.factory.cropPhoto.releaseCrop();
		},
		
		removeLayer: function() {
			this.resizeToggleLayer = false;
			this.removeManipulation();
			this.release();
			this.enable();	
		},
		
		reset: function() {
			this.window.ui.x.val('');
			this.window.ui.y.val('');
			this.window.ui.x2.val('');
			this.window.ui.y2.val('');
		},
		
		showWindow: function() {
			this.refresh();
			this.base();
		},
		
		buildWindow: function() {
			this.base({ buttons: this.buttons });
			
			var t    = this;			
			var html = $([
				/*'<div class="photo-frame-grid">',
					'<label for="width">Width</label>',
					'<input type="text" name="width" value="" id="width" class="photo-frame-small" />',
				'</div>',
				'<div class="photo-frame-grid">',
					'<label for="Height">Height</label>',
					'<input type="text" name="height" value="" id="height" class="photo-frame-small" />',
				'</div>',*/
				'<div class="photo-frame-grid">',
					'<label for="x">'+PhotoFrame.Lang.x+'</label>',
					'<input type="text" name="x" value="" id="x" class="photo-frame-small" />',
				'</div>',
				'<div class="photo-frame-grid">',
					'<label for="y">'+PhotoFrame.Lang.y+'</label>',
					'<input type="text" name="y" value="" id="y" class="photo-frame-small" />',
				'</div>',
				'<div class="photo-frame-grid">',
					'<label for="x2">'+PhotoFrame.Lang.x2+'</label>',
					'<input type="text" name="x2" value="" id="x2" class="photo-frame-small" />',
				'</div>',
				'<div class="photo-frame-grid">',
					'<label for="y">'+PhotoFrame.Lang.y2+'</label>',
					'<input type="text" name="y" value="" id="y2" class="photo-frame-small" />',
				'</div>',
			].join(''));
			
			this.window.ui.content.html(html);
			
			this.window.ui.content.find('input').keypress(function(e) {
				if(e.keyCode == 13) {
					t.apply();
					e.preventDefault();
				}
			});
			
			this.window.ui.x  = this.window.ui.content.find('#x');
			this.window.ui.y  = this.window.ui.content.find('#y');
			this.window.ui.x2 = this.window.ui.content.find('#x2');
			this.window.ui.y2 = this.window.ui.content.find('#y2');	
			
			var visibility;
			var resizeVisibility;
			var started;			
			var cancelled = true;
			
			this.resizeToggleLayer = false;
			
			this.bind('startCropBegin', function() {
				started = false;
			});
			
			this.bind('startCropEnd', function() {			
				started = true;
			});
			
			this.bind('jcropOnChange', function(a) {
				if(!this.resizeToggleLayer) {
					var m = t.getManipulation();
					if(m && m.visible) {
						t.enable(true);
					}
					t.buttonBar.factory.cropPhoto.released = false;
					t.refresh();
				}			
			});
			
			this.bind('jcropOnRelease', function(a) {
				if(started && t.getManipulation().visible) {
					if(!t.resizeToggleLayer) {
						t.removeManipulation();
					}
					t.resizeToggleLayer = false;
				}
			});
						
			this.bind('jcropOnSelect', function(a) {
				t.buttonBar.factory.cropPhoto.released = false;
				t.refresh(true);
				t.apply();
			});
			
			this.bind('startRendering', function() {
				visibility = t.getManipulation().visible ? true : false;
				
				if(visibility) {
					t.showManipulation();	
				}
				else {
					t.hideManipulation();
				}
			});
			
			this.bind('stopRendering', function() {
				if(t.getManipulation() && t.getManipulation().visible) {
					if(!t.buttonBar.factory.cancel) {
						t.toggleLayer(visibility);
					}
				}
			});
			
			this.bind('resizeInitCrop', function(obj, manipulation) {
				if(t.cropPhoto().totalManipulations() > 0) {
					var m = t.getManipulation();
					
					t.initCrop(m && !m.visible ? true : false);
				}
			});
			
			this.bind('resizeRemoveLayer', function() {
				t.initCrop(true);
			});
			
			this.bind('rotateReInitCrop', function(obj) {
				t.initCrop();
			});

			this.bind('startCropEnd', function() {
				if(t.buttonBar.factory.settings.photo_frame_disable_regular_crop == 'true') {
					t.disable();
				}
			});
			
			/*
			this.bind('resize', function(obj, width, height) {
				t.resizeObj = obj;
				
				if(t.getManipulation()) {
					//t.cropPhoto().releaseCrop();
				}
			});
			
			this.bind('rotateRemoveLayer', function(obj) {
				//t.removeManipulation();
			});
			
			this.bind('resizeToggleLayer', function(manipulation) {
				//t.toggleLayerCallback(manipulation);
			});
			
			*/
		},

		isActive: function() {
			return this.getSetting('disable_regular_crop') === 'true' ? false : true;
		},
		
		toggleLayerCallback: function(manipulation) {
			// resizeVisibility = manipulation.visible;
				
			var visible = manipulation.visible && this.getManipulation().visible ? true : false;
			
			if(!manipulation.visible) {
				this.resizeToggleLayer = this.getManipulation().data;
				
				this.toggleLayer(visible);
			}	
		},
		
		initCrop: function(init) {	
						
			if(!this.cropPhoto().jcrop) {
				return;
			}
			
			var manipulation = this.getManipulation();
			var released 	 = this.cropPhoto().released;
			var select   	 = this.cropPhoto().jcrop.tellSelect();
			var img      	 = this.cropPhoto().ui.cropPhoto.find('img');
			
			this.cropPhoto().ui.cropPhoto.remove();
			this.cropPhoto().destroyJcrop();				
			this.cropPhoto().ui.cropPhoto = $('<div class="'+this.buttonBar.factory.classes.cropPhoto+'"></div>');
			
			this.buttonBar.factory.ui.crop.append(this.cropPhoto().ui.cropPhoto);				
			this.cropPhoto().ui.cropPhoto.append(img);
			
			this.cropPhoto().initJcrop();
			
			if(!manipulation.visible) {
				this.cropPhoto().releaseCrop();
			}
			
			if(manipulation.data && !released && !init) {
				this.cropPhoto().releaseCrop();				
				this.cropPhoto().jcrop.setSelect([select.x, select.y, select.x2, select.y2])
			}
			
			this.buttonBar.factory.ui.crop.center();	
			this.buttonBar.factory.trigger('initCrop');
		},
		
		refresh: function(formFields) {
			var crop = this.getCrop(formFields)
			
			if(!this.isActive()) {
				this.window.close();
			}

			if(crop.x || crop.y || crop.x2 || crop.y2) {
				this.window.ui.x.val(crop.x);
				this.window.ui.y.val(crop.y);
				this.window.ui.x2.val(crop.x2);
				this.window.ui.y2.val(crop.y2);
			}
			else {
				this.reset();
			}			
		}
	});
	
}(jQuery));;(function($) {
	
	PhotoFrame.Buttons.Layers = PhotoFrame.Button.extend({
		
		/**
		 * An array of button objects
		 */
		
		buttons: [],
		
		/**
		 * An object of css classes
		 */
		
		classes: {
			layer: 'photo-frame-layer',
			layerIcon: 'photo-frame-layer-icon',
			layerEmpty: 'photo-frame-layer-empty',
			layerTitle: 'photo-frame-layer-title',
			layerActions: 'photo-frame-layer-actions',
			visible: 'photo-frame-toggle-visible',
			toggleButton: 'photo-frame-toggle-layer-button',
			trash: 'photo-frame-trash',			
		},
		
		/**
		 * The button description 
		 */
		
		description: false,
		
		/**
		 * The button icon
		 */
		
		icon: 'layers',
		
		/**
		 * An object of icon classes
		 */
		
		icons: {
			eye: 'eye',
			eyeClose: 'eye-off',
			trash: 'trash'
		},
		
		/**
		 * Name of the button
		 */
		
		name: false,
		
		/**
		 * The JSON object used for Window settings 
		 */
		
		windowSettings: {
			css: 'photo-frame-layers',
			title: false
		},
		
		constructor: function(buttonBar) {
			var t = this;
			
			this.buttons = [{
				text: PhotoFrame.Lang.hide_all,
				css: this.classes.toggleButton,
				onclick: function(e, button) {
					var $target = $(e.target);
					
					if($target.html() == PhotoFrame.Lang.hide_all) {
						$target.html(PhotoFrame.Lang.show_all);
						t.hideAll();
					}
					else {
						$target.html(PhotoFrame.Lang.hide_all);
						t.showAll();
					}

					e.preventDefault();
				}
			},{
				text: PhotoFrame.Lang.rerender,
				css: 'photo-frame-tool-window-save',
				onclick: function(e, button) {
					if(t.cropPhoto() && !t.cropPhoto().isRendering()) {
						t.render(function() {
							t.buttonBar.factory.trigger('layerWindowReRender');
						});
						t.refresh();
					}
				}
			}];
			
			this.name				  = PhotoFrame.Lang.layers;
			this.description          = PhotoFrame.Lang.layers_desc;
			this.windowSettings.title = PhotoFrame.Lang.layers;
					
			this.base(buttonBar);
			// this.buttonBar.factory.layerWindow = this;
		},
		
		totalHidden: function() {
			var count = 0;		
			$.each(this.cropPhoto().getManipulations(), function(i, m) {
				if(!m.visible) {
					count++;
				}
			});
			return count;
		},
		
		allHidden: function() {			
			if(this.cropPhoto().totalManipulations() == this.totalHidden()) {
				return true;
			}
			return false;
		},
		
		hideAll: function() {
			this.toggleLayers(false);
		},
		
		showAll: function() {
			this.toggleLayers(true);
		},
		
		toggleLayers: function(visible, render) {	
			if(this.cropPhoto() && !this.cropPhoto().isRendering()) {
				var m = this.cropPhoto().getManipulations();
				for(var i in this.buttonBar.buttons) {
					var button = this.buttonBar.buttons[i];
					
					if(m[button.getPackageName()]) {
						button.toggleLayer(visible, false);
					}
				}
			}
			
			this.refresh();
			this.render();
		},
		
		toggleDisplayButton: function() {				
			if(this.allHidden()) {
				this.window.buttons[0].ui.button.html(PhotoFrame.Lang.show_all);
			}
			else {
				this.window.buttons[0].ui.button.html(PhotoFrame.Lang.hide_all);
			}
		},		
		
		buildWindow: function() {	
			var t = this;
			
			this.base({buttons: this.buttons});
			
			this.buttonBar.factory.bind('startCropEnd', function() {
				t.refresh();
				t.toggleDisplayButton();
			});
			
			this.buttonBar.factory.bind('removeManipulation', function() {
				t.refresh();
			});
			
			this.buttonBar.factory.bind('showManipulation', function() {
				t.refresh();
			});
			
			this.buttonBar.factory.bind('hideManipulation', function() {
				t.refresh();
			});
			
			this.buttonBar.factory.bind('startRendering', function() {
				t.toggleDisplayButton();
			});
			
			this.buttonBar.factory.bind('addManipulation', function(obj, name, exists) {
				var content = $(t.window.ui.content).get(0);
				
				t.refresh();
				
				if(!exists && name != 'crop') {
					content.scrollTop = content.scrollHeight;
				}
			});
			
		},
		
		toggleLayer: function(name, manipulation, ui) {
			manipulation.visible = manipulation.visible ? false : true;
			this.buttonBar.factory.trigger(name+'ToggleLayer', manipulation);
			this.refresh();
		},
		
		removeLayer: function(name, manipulation, ui) {
			this.buttonBar.factory.trigger(name+'RemoveLayer', manipulation);
			delete this.buttonBar.factory.cropPhoto.manipulations[name];			
			this.refresh();
		},
		
		refresh: function(photo) {
			var count = 0, t = this, classes = {}, buttons = {}, photo = photo ? photo : this.cropPhoto();
			
			this.window.ui.content.html('');
			
			for(var y in this.buttonBar.buttons) {
				var button = this.buttonBar.buttons[y];				
				buttons[button.getPackageName()] = button;
			}
			
			$.each(photo.manipulations, function(x, manipulation) {
				var manipulation = photo.manipulations[x];
				var button       = buttons[x];
				
				if(button) {
					var title = button.getPackageName();
					
					var visible = $('<a href="#" class="'+t.classes.visible+'"><i class="icon-'+(manipulation.visible ? t.icons.eye : t.icons.eyeClose)+'"></i></a>');
					var trash   = $('<a href="#" class="'+t.classes.trash+'"><i class="icon-'+t.icons.trash+'"></i></a>');
					
					var html = $([
					'<div class="'+t.classes.layer+' '+t.buttonBar.factory.classes.clearfix+'">',
						'<div class="'+t.classes.layerIcon+'"><a href="#"><i class="icon-'+(button.icon ? button.icon : title)+'"></i></a></div>',
						'<div class="'+t.classes.layerTitle+'">'+button.window.title+'</div>',
						'<div class="'+t.classes.layerActions+'"></div>',
					'</div>'
					].join(''));
					
					html.find('.'+t.classes.layerActions).append(visible);
					html.find('.'+t.classes.layerActions).append(trash);
					
					html.find('.'+t.classes.layerIcon+' > a').click(function(e) {
						button.window.toggle();
						e.preventDefault();
					});
					
					visible.click(function(e) {
						if(t.cropPhoto() && !t.cropPhoto().isRendering()) {
							t.toggleLayer(x, manipulation, visible);
							button.toggleLayer(manipulation.visible);		
							e.preventDefault();
						}
					});
					
					trash.click(function(e) {
						t.removeLayer(x, manipulation, trash);
						if(button.renderAfterRemovingLayer) {
							// no need to render when removing the crop layer
							t.render(function() {								
								button.removeLayer();
							});
						}
						else {
							button.removeLayer();
						}
						e.preventDefault();
					});
					
					t.window.ui.buttons.show();
					t.window.ui.content.append(html);
					count++;
				}
			});			
			
			if(!count) {	
				var html = $([
					'<div class="'+t.classes.layer+' '+t.buttonBar.factory.classes.clearfix+'">',
						'<div class="'+t.classes.layerEmpty+'">'+PhotoFrame.Lang.no_layers+'</div>',
						'<div class="'+t.classes.layerActions+'"></div>',
					'</div>'
				].join(''));
				
				t.window.ui.buttons.hide();				
				t.window.ui.content.append(html);
			}
		},
		
		startCrop: function(photo) {			
			var obj = this.window.buttons[0].ui.button;
			
			this.refresh();			
		}
	});

}(jQuery));;(function($) {
	
	PhotoFrame.Buttons.Resize = PhotoFrame.Button.extend({
		
		/**
		 * An array of button objects
		 */
		
		buttons: [],
		
		/**
		 * The button description 
		 */
		
		description: 'The resize the image.',
		
		/**
		 * Name of the button
		 */
		
		name: 'Resize',
		
		/**
		 * The JSON object used for Window settings 
		 */
		
		windowSettings: {
			title: 'Resize'
		},
		
		constructor: function(buttonBar) {
			var t = this;
			
			this.buttons = [{
				text: PhotoFrame.Lang.resize,
				css: 'photo-frame-tool-window-save',
				onclick: function(e, button) {
					t.apply();
				}
			}];

			this.base(buttonBar);
		},
		
		getWidth: function() {
			return parseInt(this.window.ui.width.val());
		},
		
		getHeight: function() {
			return parseInt(this.window.ui.height.val());
		},
		
		getMaintainAspect: function() {
			return this.window.ui.aspect.attr('checked') === 'checked' ? true : false;
		},
		
		reset: function() {
			if(this.cropPhoto()) {
				this.window.ui.width.val(this.cropPhoto().width());
				this.window.ui.height.val(this.cropPhoto().height());
				this.window.ui.aspect.attr('checked', true);
			}
		},
		
		enable: function() {
			this.window.ui.width.attr('disabled', false);
			this.window.ui.height.attr('disabled', false);	
			this.window.ui.aspect.attr('disabled', false);	
		},
		
		disable: function() {
			this.window.ui.width.attr('disabled', true);
			this.window.ui.height.attr('disabled', true);
			this.window.ui.aspect.attr('disabled', true);		
		},
		
		removeLayer: function() {
			this.reset();
			//this.cropPhoto().jcrop.release();
			this.buttonBar.factory.trigger('resizeRemoveLayer');
		},
		
		startCrop: function() {
			var manipulation = this.getManipulation();
			
			if(manipulation) {
				this.window.ui.width.val(manipulation.data.width);
				this.window.ui.height.val(manipulation.data.height);
				
				if(manipulation.data.aspect === true || manipulation.data.aspect === "true") {
					this.window.ui.aspect.attr('checked', true); 	
				}
				else {					
					this.window.ui.aspect.attr('checked', false);
				}
				
				this.base();
			}
			else {
				this.reset();
			}
		},
		
		apply: function() {
			var t = this;
			
			this.addManipulation(true, {
				aspect: this.getMaintainAspect(),
				width: this.getWidth(),
				height: this.getHeight()
			});
			
			this.buttonBar.factory.trigger('resize', this, this.getWidth(), this.getHeight());
			
			this.render(function() {
				t.buttonBar.factory.trigger('resizeRenderCallback', t, t.getWidth(), t.getHeight());
			});
		},
		
		initCrop: function(manipulation) {
			this.buttonBar.factory.trigger('resizeReInitCrop', this, manipulation);
		},
		
		toggleLayer: function(visibility, render) {
			this.base(visibility, render);
		},
		
		buildWindow: function() {	
			this.base({ buttons: this.buttons });
			
			var t = this, html = $([
				'<div class="photo-frame-inline photo-frame-margin-bottom">',
					'<label for="photo-frame-width" class="photo-frame-small photo-frame-margin-right">'+PhotoFrame.Lang.width+'</label>',
					'<input type="text" name="photo-frame-width" value="" id="photo-frame-width" class="photo-frame-small" />',
				'</div>',
				'<div class="photo-frame-inline">',
					'<label for="photo-frame-height" class="photo-frame-small photo-frame-margin-right">'+PhotoFrame.Lang.height+'</label>',
					'<input type="text" name="photo-frame-height" value="" id="photo-frame-height" class="photo-frame-small" />',
				'</div>',
				'<div class="photo-frame-margin-top">',
					'<label><input type="checkbox" name="photo-frame-maintain-ratio" id="photo-frame-maintain-ratio" /> '+PhotoFrame.Lang.maintain_ratio+'</label>',
				'</div>'
			].join(''));
			
			this.window.ui.content.html(html);
			this.window.ui.width  = this.window.ui.content.find('#photo-frame-width');
			this.window.ui.height = this.window.ui.content.find('#photo-frame-height');
			this.window.ui.aspect = this.window.ui.content.find('#photo-frame-maintain-ratio');	
			
			this.window.ui.content.find('input').keypress(function(e) {
				if(e.keyCode == 13) {
					t.apply();
					e.preventDefault();
				}
			});
			
			this.buttonBar.factory.bind('render', function() {
				if(t.getManipulation()) {
					t.initCrop();
				}
				t.reset();
			});
						
			this.window.ui.content.find('input[type="text"]').keyup(function(e) {
				if(t.getMaintainAspect() && t.cropPhoto()) {
					var aspect, target, val = $(this).val(), id = $(e.target).attr('id');
					
					if(id == 'photo-frame-height') {
						aspect = t.cropPhoto().width() / t.cropPhoto().height();
						target = '#photo-frame-width';
						val   *= aspect;
					}
					else {						
						aspect = t.cropPhoto().height() / t.cropPhoto().width();
						target = '#photo-frame-height';
						val   *= aspect;
					}
					
					t.window.ui.content.find(target).val(t.cropPhoto().round(val, 1));
				}
			});
		}
	});

}(jQuery));;(function($) {
	
	PhotoFrame.Buttons.Rotate = PhotoFrame.Button.extend({
		
		/**
		 * An array of button objects
		 */
		
		buttons: [],
		
		/**
		 * The button description 
		 */
		
		description: false,
		
		/**
		 * Name of the button
		 */
		
		name: false,
		
		/**
		 * The JSON object used for Window settings 
		 */
		
		windowSettings: {
			title: false
		},
		
		constructor: function(buttonBar) {
			var t = this;
			
			this.name                 = PhotoFrame.Lang.rotate;
			this.description          = PhotoFrame.Lang.rotate_desc;	
			this.windowSettings.title = PhotoFrame.Lang.rotate;		
			this.buttons = [{
				text: PhotoFrame.Lang.rotate,
				css: 'photo-frame-tool-window-save',
				onclick: function(e, button) {
					t.apply();
				}
			}];

			this.base(buttonBar);
		},
		
		apply: function() {	
			var t = this;
						
			this.addManipulation(true, {
				degree: this.getDegree()
			});
			
			this.buttonBar.factory.trigger('rotate', this, this.getDegree());
			
			this.render(function() {	
				t.buttonBar.factory.trigger('rotateReInitCrop', t, t.getDegree());			
			});
		},
		
		startCrop: function() {
			var m = this.getManipulation();	
			
			if(m.data && m.data.degree) {
				this.window.ui.input.val(m.data.degree);
				this.base();
			}
		},
		
		getDegree: function() {
			return parseInt(this.window.ui.input.val() == '' ? 0 : this.window.ui.input.val());	
		},
		
		reset: function() {
			this.window.ui.input.val('');	
		},
		
		toggleLayer: function(visibility, render) {			
			this.base(visibility, render);
		},
		
		enable: function() {
			this.window.ui.input.attr('disabled', false);	
		},
		
		disable: function() {
			this.window.ui.input.attr('disabled', true);	
		},
		
		buildWindow: function() {	
			this.base({ buttons: this.buttons });
			
			this.window.ui.input = $('<input type="text" name="photo-frame-rotate" value="" id="photo-frame-rotate" class="photo-frame-small" />');
			
			var t = this, html = $([
				'<div class="photo-frame-inline">',
					'<label for="photo-frame-rotate photo-frame-margin-right">'+PhotoFrame.Lang.degrees+'</label>',
				'</div>'
			].join(''));
			
			html.append(this.window.ui.input);
			
			this.window.ui.content.html(html);			
			this.window.ui.content.find('input').keypress(function(e) {
				if(e.keyCode == 13) {
					t.apply();
					e.preventDefault();
				}
			});
			
			this.bind('stopRendering', function() {
				t.buttonBar.factory.trigger('rotateReInitCrop', t, t.getDegree());				
			});
		}
	});

}(jQuery));;/*!
 * NETEYE Activity Indicator jQuery Plugin
 *
 * Copyright (c) 2010 NETEYE GmbH
 * Licensed under the MIT license
 *
 * Author: Felix Gnass [fgnass at neteye dot de]
 * Version: @{VERSION}
 */
 
/**
 * Plugin that renders a customisable activity indicator (spinner) using SVG or VML.
 */
(function($) {

	$.fn.activity = function(opts) {
		this.each(function() {
			var $this = $(this);
			var el = $this.data('activity');
			if (el) {
				clearInterval(el.data('interval'));
				el.remove();
				$this.removeData('activity');
			}
			if (opts !== false) {
				opts = $.extend({color: $this.css('color')}, $.fn.activity.defaults, opts);
				
				el = render($this, opts).css('position', 'absolute').prependTo(opts.outside ? 'body' : $this);
				var h = $this.outerHeight() - el.height();
				var w = $this.outerWidth() - el.width();
				var margin = {
					top: opts.valign == 'top' ? opts.padding : opts.valign == 'bottom' ? h - opts.padding : Math.floor(h / 2),
					left: opts.align == 'left' ? opts.padding : opts.align == 'right' ? w - opts.padding : Math.floor(w / 2)
				};
				var offset = $this.offset();
				if (opts.outside) {
					el.css({top: offset.top + 'px', left: offset.left + 'px'});
				}
				else {
					margin.top -= el.offset().top - offset.top;
					margin.left -= el.offset().left - offset.left;
				}
				el.css({marginTop: margin.top + 'px', marginLeft: margin.left + 'px'});
				animate(el, opts.segments, Math.round(10 / opts.speed) / 10);
				$this.data('activity', el);
			}
		});
		return this;
	};
	
	$.fn.activity.defaults = {
		segments: 12,
		space: 3,
		length: 7,
		width: 4,
		speed: 1.2,
		align: 'center',
		valign: 'center',
		padding: 4
	};
	
	$.fn.activity.getOpacity = function(opts, i) {
		var steps = opts.steps || opts.segments-1;
		var end = opts.opacity !== undefined ? opts.opacity : 1/steps;
		return 1 - Math.min(i, steps) * (1 - end) / steps;
	};
	
	/**
	 * Default rendering strategy. If neither SVG nor VML is available, a div with class-name 'busy' 
	 * is inserted, that can be styled with CSS to display an animated gif as fallback.
	 */
	var render = function() {
		return $('<div>').addClass('busy');
	};
	
	/**
	 * The default animation strategy does nothing as we expect an animated gif as fallback.
	 */
	var animate = function() {
	};
	
	/**
	 * Utility function to create elements in the SVG namespace.
	 */
	function svg(tag, attr) {
		var el = document.createElementNS("http://www.w3.org/2000/svg", tag || 'svg');
		if (attr) {
			$.each(attr, function(k, v) {
				el.setAttributeNS(null, k, v);
			});
		}
		return $(el);
	}
	
	if (document.createElementNS && document.createElementNS( "http://www.w3.org/2000/svg", "svg").createSVGRect) {
	
		// =======================================================================================
		// SVG Rendering
		// =======================================================================================
		
		/**
		 * Rendering strategy that creates a SVG tree.
		 */
		render = function(target, d) {
			var innerRadius = d.width*2 + d.space;
			var r = (innerRadius + d.length + Math.ceil(d.width / 2) + 1);
			
			var el = svg().width(r*2).height(r*2);
			
			var g = svg('g', {
				'stroke-width': d.width, 
				'stroke-linecap': 'round', 
				stroke: d.color
			}).appendTo(svg('g', {transform: 'translate('+ r +','+ r +')'}).appendTo(el));
			
			for (var i = 0; i < d.segments; i++) {
				g.append(svg('line', {
					x1: 0, 
					y1: innerRadius, 
					x2: 0, 
					y2: innerRadius + d.length, 
					transform: 'rotate(' + (360 / d.segments * i) + ', 0, 0)',
					opacity: $.fn.activity.getOpacity(d, i)
				}));
			}
			return $('<div>').append(el).width(2*r).height(2*r);
		};
				
		// Check if Webkit CSS animations are available, as they work much better on the iPad
		// than setTimeout() based animations.
		
		if (document.createElement('div').style.WebkitAnimationName !== undefined) {

			var animations = {};
		
			/**
			 * Animation strategy that uses dynamically created CSS animation rules.
			 */
			animate = function(el, steps, duration) {
				if (!animations[steps]) {
					var name = 'spin' + steps;
					var rule = '@-webkit-keyframes '+ name +' {';
					for (var i=0; i < steps; i++) {
						var p1 = Math.round(100000 / steps * i) / 1000;
						var p2 = Math.round(100000 / steps * (i+1) - 1) / 1000;
						var value = '% { -webkit-transform:rotate(' + Math.round(360 / steps * i) + 'deg); }\n';
						rule += p1 + value + p2 + value; 
					}
					rule += '100% { -webkit-transform:rotate(100deg); }\n}';
					document.styleSheets[0].insertRule(rule, 0);
					animations[steps] = name;
				}
				el.css('-webkit-animation', animations[steps] + ' ' + duration +'s linear infinite');
			};
		}
		else {
		
			/**
			 * Animation strategy that transforms a SVG element using setInterval().
			 */
			animate = function(el, steps, duration) {
				var rotation = 0;
				var g = el.find('g g').get(0);
				el.data('interval', setInterval(function() {
					g.setAttributeNS(null, 'transform', 'rotate(' + (++rotation % steps * (360 / steps)) + ')');
				},  duration * 1000 / steps));
			};
		}
		
	}
	else {
		
		// =======================================================================================
		// VML Rendering
		// =======================================================================================
		
		var s = $('div').appendTo('body').html('<v:shape id="vml_flag1" adj="1" />');

		s = s.find(':first').css('behavior', 'url(#default#VML)');

		if ((s[0] ? typeof s[0].adj == "object" : true)) {
		
			// VML support detected. Insert CSS rules for group, shape and stroke.
			var sheet = document.createStyleSheet();
			$.each(['group', 'shape', 'stroke'], function() {
				sheet.addRule(this, "behavior:url(#default#VML);");
			});
			
			/**
			 * Rendering strategy that creates a VML tree. 
			 */
			render = function(target, d) {
			
				var innerRadius = d.width*2 + d.space;
				var r = (innerRadius + d.length + Math.ceil(d.width / 2) + 1);
				var s = r*2;
				var o = -Math.ceil(s/2);
				
				var el = $('<group>', {coordsize: s + ' ' + s, coordorigin: o + ' ' + o}).css({top: o, left: o, width: s, height: s});
				for (var i = 0; i < d.segments; i++) {
					el.append($('<shape>', {path: 'm ' + innerRadius + ',0  l ' + (innerRadius + d.length) + ',0'}).css({
						width: s,
						height: s,
						rotation: (360 / d.segments * i) + 'deg'
					}).append($('<stroke>', {color: d.color, weight: d.width + 'px', endcap: 'round', opacity: $.fn.activity.getOpacity(d, i)})));
				}
				return $('<group>', {coordsize: s + ' ' + s}).css({width: s, height: s, overflow: 'hidden'}).append(el);
			};
		
			/**
		     * Animation strategy that modifies the VML rotation property using setInterval().
		     */
			animate = function(el, steps, duration) {
				var rotation = 0;
				var g = el.get(0);
				el.data('interval', setInterval(function() {
					g.style.rotation = ++rotation % steps * (360 / steps);
				},  duration * 1000 / steps));
			};
		}
		$(s).parent().remove();
	}

})(jQuery);;/*
 * jQuery Color Animations
 * Copyright 2007 John Resig
 * Released under the MIT and GPL licenses.
 */

(function(jQuery){

	// We override the animation for all of these color styles
	jQuery.each(['backgroundColor', 'borderBottomColor', 'borderLeftColor', 'borderRightColor', 'borderTopColor', 'color', 'outlineColor'], function(i,attr){
		jQuery.fx.step[attr] = function(fx){
			if ( fx.state == 0 ) {
				fx.start = getColor( fx.elem, attr );
				fx.end = getRGB( fx.end );
			}

			fx.elem.style[attr] = "rgb(" + [
				Math.max(Math.min( parseInt((fx.pos * (fx.end[0] - fx.start[0])) + fx.start[0]), 255), 0),
				Math.max(Math.min( parseInt((fx.pos * (fx.end[1] - fx.start[1])) + fx.start[1]), 255), 0),
				Math.max(Math.min( parseInt((fx.pos * (fx.end[2] - fx.start[2])) + fx.start[2]), 255), 0)
			].join(",") + ")";
		}
	});

	// Color Conversion functions from highlightFade
	// By Blair Mitchelmore
	// http://jquery.offput.ca/highlightFade/

	// Parse strings looking for color tuples [255,255,255]
	function getRGB(color) {
		var result;

		// Check if we're already dealing with an array of colors
		if ( color && color.constructor == Array && color.length == 3 )
			return color;

		// Look for rgb(num,num,num)
		if (result = /rgb\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*\)/.exec(color))
			return [parseInt(result[1]), parseInt(result[2]), parseInt(result[3])];

		// Look for rgb(num%,num%,num%)
		if (result = /rgb\(\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*\)/.exec(color))
			return [parseFloat(result[1])*2.55, parseFloat(result[2])*2.55, parseFloat(result[3])*2.55];

		// Look for #a0b1c2
		if (result = /#([a-fA-F0-9]{2})([a-fA-F0-9]{2})([a-fA-F0-9]{2})/.exec(color))
			return [parseInt(result[1],16), parseInt(result[2],16), parseInt(result[3],16)];

		// Look for #fff
		if (result = /#([a-fA-F0-9])([a-fA-F0-9])([a-fA-F0-9])/.exec(color))
			return [parseInt(result[1]+result[1],16), parseInt(result[2]+result[2],16), parseInt(result[3]+result[3],16)];

		// Otherwise, we're most likely dealing with a named color
		return colors[jQuery.trim(color).toLowerCase()];
	}
	
	function getColor(elem, attr) {
		var color;

		do {
			color = jQuery.curCSS(elem, attr);

			// Keep going until we find an element that has color, or we hit the body
			if ( color != '' && color != 'transparent' || jQuery.nodeName(elem, "body") )
				break; 

			attr = "backgroundColor";
		} while ( elem = elem.parentNode );

		return getRGB(color);
	};
	
	// Some named colors to work with
	// From Interface by Stefan Petre
	// http://interface.eyecon.ro/

	var colors = {
		aqua:[0,255,255],
		azure:[240,255,255],
		beige:[245,245,220],
		black:[0,0,0],
		blue:[0,0,255],
		brown:[165,42,42],
		cyan:[0,255,255],
		darkblue:[0,0,139],
		darkcyan:[0,139,139],
		darkgrey:[169,169,169],
		darkgreen:[0,100,0],
		darkkhaki:[189,183,107],
		darkmagenta:[139,0,139],
		darkolivegreen:[85,107,47],
		darkorange:[255,140,0],
		darkorchid:[153,50,204],
		darkred:[139,0,0],
		darksalmon:[233,150,122],
		darkviolet:[148,0,211],
		fuchsia:[255,0,255],
		gold:[255,215,0],
		green:[0,128,0],
		indigo:[75,0,130],
		khaki:[240,230,140],
		lightblue:[173,216,230],
		lightcyan:[224,255,255],
		lightgreen:[144,238,144],
		lightgrey:[211,211,211],
		lightpink:[255,182,193],
		lightyellow:[255,255,224],
		lime:[0,255,0],
		magenta:[255,0,255],
		maroon:[128,0,0],
		navy:[0,0,128],
		olive:[128,128,0],
		orange:[255,165,0],
		pink:[255,192,203],
		purple:[128,0,128],
		violet:[128,0,128],
		red:[255,0,0],
		silver:[192,192,192],
		white:[255,255,255],
		yellow:[255,255,0]
	};
	
})(jQuery);
;/*
 * jQuery File Upload File Processing Plugin 1.0
 * https://github.com/blueimp/jQuery-File-Upload
 *
 * Copyright 2012, Sebastian Tschan
 * https://blueimp.net
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */

/*jslint nomen: true, unparam: true, regexp: true */
/*global define, window, document */

(function (factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        // Register as an anonymous AMD module:
        define([
            'jquery',
            'load-image',
            'canvas-to-blob',
            './jquery.fileupload'
        ], factory);
    } else {
        // Browser globals:
        factory(
            window.jQuery,
            window.loadImage
        );
    }
}(function ($, loadImage) {
    'use strict';

    // The File Upload IP version extends the basic fileupload widget
    // with file processing functionality:
    $.widget('blueimpFP.fileupload', $.blueimp.fileupload, {

        options: {
            // The list of file processing actions:
            process: [
            /*
                {
                    action: 'load',
                    fileTypes: /^image\/(gif|jpeg|png)$/,
                    maxFileSize: 20000000 // 20MB
                },
                {
                    action: 'resize',
                    maxWidth: 1920,
                    maxHeight: 1200,
                    minWidth: 800,
                    minHeight: 600
                },
                {
                    action: 'save'
                }
            */
            ],

            // The add callback is invoked as soon as files are added to the
            // fileupload widget (via file input selection, drag & drop or add
            // API call). See the basic file upload widget for more information:
            add: function (e, data) {
                $(this).fileupload('process', data).done(function () {
                    data.submit();
                });
            }
        },

        processActions: {
            // Loads the image given via data.files and data.index
            // as canvas element.
            // Accepts the options fileTypes (regular expression)
            // and maxFileSize (integer) to limit the files to load:
            load: function (data, options) {
                var that = this,
                    file = data.files[data.index],
                    dfd = $.Deferred();
                if (window.HTMLCanvasElement &&
                        window.HTMLCanvasElement.prototype.toBlob &&
                        ($.type(options.maxFileSize) !== 'number' ||
                            file.size < options.maxFileSize) &&
                        (!options.fileTypes ||
                            options.fileTypes.test(file.type))) {
                    loadImage(
                        file,
                        function (canvas) {
                            data.canvas = canvas;
                            dfd.resolveWith(that, [data]);
                        },
                        {canvas: true}
                    );
                } else {
                    dfd.rejectWith(that, [data]);
                }
                return dfd.promise();
            },
            // Resizes the image given as data.canvas and updates
            // data.canvas with the resized image.
            // Accepts the options maxWidth, maxHeight, minWidth and
            // minHeight to scale the given image:
            resize: function (data, options) {
                if (data.canvas) {
                    var canvas = loadImage.scale(data.canvas, options);
                    if (canvas.width !== data.canvas.width ||
                            canvas.height !== data.canvas.height) {
                        data.canvas = canvas;
                        data.processed = true;
                    }
                }
                return data;
            },
            // Saves the processed image given as data.canvas
            // inplace at data.index of data.files:
            save: function (data, options) {
                // Do nothing if no processing has happened:
                if (!data.canvas || !data.processed) {
                    return data;
                }
                var that = this,
                    file = data.files[data.index],
                    name = file.name,
                    dfd = $.Deferred(),
                    callback = function (blob) {
                        if (!blob.name) {
                            if (file.type === blob.type) {
                                blob.name = file.name;
                            } else if (file.name) {
                                blob.name = file.name.replace(
                                    /\..+$/,
                                    '.' + blob.type.substr(6)
                                );
                            }
                        }
                        // Store the created blob at the position
                        // of the original file in the files list:
                        data.files[data.index] = blob;
                        dfd.resolveWith(that, [data]);
                    };
                // Use canvas.mozGetAsFile directly, to retain the filename, as
                // Gecko doesn't support the filename option for FormData.append:
                if (data.canvas.mozGetAsFile) {
                    callback(data.canvas.mozGetAsFile(
                        (/^image\/(jpeg|png)$/.test(file.type) && name) ||
                            ((name && name.replace(/\..+$/, '')) ||
                                'blob') + '.png',
                        file.type
                    ));
                } else {
                    data.canvas.toBlob(callback, file.type);
                }
                return dfd.promise();
            }
        },

        // Resizes the file at the given index and stores the created blob at
        // the original position of the files list, returns a Promise object:
        _processFile: function (files, index, options) {
            var that = this,
                dfd = $.Deferred().resolveWith(that, [{
                    files: files,
                    index: index
                }]),
                chain = dfd.promise();
            that._processing += 1;
            $.each(options.process, function (i, settings) {
                chain = chain.pipe(function (data) {
                    return that.processActions[settings.action]
                        .call(this, data, settings);
                });
            });
            chain.always(function () {
                that._processing -= 1;
                if (that._processing === 0) {
                    that.element
                        .removeClass('fileupload-processing');
                }
            });
            if (that._processing === 1) {
                that.element.addClass('fileupload-processing');
            }
            return chain;
        },

        // Processes the files given as files property of the data parameter,
        // returns a Promise object that allows to bind a done handler, which
        // will be invoked after processing all files (inplace) is done:
        process: function (data) {
            var that = this,
                options = $.extend({}, this.options, data);
            if (options.process && options.process.length &&
                    this._isXHRUpload(options)) {
                $.each(data.files, function (index, file) {
                    that._processingQueue = that._processingQueue.pipe(
                        function () {
                            var dfd = $.Deferred();
                            that._processFile(data.files, index, options)
                                .always(function () {
                                    dfd.resolveWith(that);
                                });
                            return dfd.promise();
                        }
                    );
                });
            }
            return this._processingQueue;
        },

        _create: function () {
            $.blueimp.fileupload.prototype._create.call(this);
            this._processing = 0;
            this._processingQueue = $.Deferred().resolveWith(this)
                .promise();
        }

    });

}));
;/*
 * jQuery File Upload User Interface Plugin 6.9.5
 * https://github.com/blueimp/jQuery-File-Upload
 *
 * Copyright 2010, Sebastian Tschan
 * https://blueimp.net
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */

/*jslint nomen: true, unparam: true, regexp: true */
/*global define, window, document, URL, webkitURL, FileReader */

(function (factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        // Register as an anonymous AMD module:
        define([
            'jquery',
            'tmpl',
            'load-image',
            './jquery.fileupload-fp'
        ], factory);
    } else {
        // Browser globals:
        factory(
            window.jQuery,
            window.tmpl,
            window.loadImage
        );
    }
}(function ($, tmpl, loadImage) {
    'use strict';

    // The UI version extends the FP (file processing) version or the basic
    // file upload widget and adds complete user interface interaction:
    var parentWidget = ($.blueimpFP || $.blueimp).fileupload;
    $.widget('blueimpUI.fileupload', parentWidget, {

        options: {
            // By default, files added to the widget are uploaded as soon
            // as the user clicks on the start buttons. To enable automatic
            // uploads, set the following option to true:
            autoUpload: false,
            // The following option limits the number of files that are
            // allowed to be uploaded using this widget:
            maxNumberOfFiles: undefined,
            // The maximum allowed file size:
            maxFileSize: undefined,
            // The minimum allowed file size:
            minFileSize: undefined,
            // The regular expression for allowed file types, matches
            // against either file type or file name:
            acceptFileTypes:  /.+$/i,
            // The regular expression to define for which files a preview
            // image is shown, matched against the file type:
            previewSourceFileTypes: /^image\/(gif|jpeg|png)$/,
            // The maximum file size of images that are to be displayed as preview:
            previewSourceMaxFileSize: 5000000, // 5MB
            // The maximum width of the preview images:
            previewMaxWidth: 80,
            // The maximum height of the preview images:
            previewMaxHeight: 80,
            // By default, preview images are displayed as canvas elements
            // if supported by the browser. Set the following option to false
            // to always display preview images as img elements:
            previewAsCanvas: true,
            // The ID of the upload template:
            uploadTemplateId: 'template-upload',
            // The ID of the download template:
            downloadTemplateId: 'template-download',
            // The container for the list of files. If undefined, it is set to
            // an element with class "files" inside of the widget element:
            filesContainer: undefined,
            // By default, files are appended to the files container.
            // Set the following option to true, to prepend files instead:
            prependFiles: false,
            // The expected data type of the upload response, sets the dataType
            // option of the $.ajax upload requests:
            dataType: 'json',

            // The add callback is invoked as soon as files are added to the fileupload
            // widget (via file input selection, drag & drop or add API call).
            // See the basic file upload widget for more information:
            add: function (e, data) {
                var that = $(this).data('fileupload'),
                    options = that.options,
                    files = data.files;
                $(this).fileupload('process', data).done(function () {
                    that._adjustMaxNumberOfFiles(-files.length);
                    data.maxNumberOfFilesAdjusted = true;
                    data.files.valid = data.isValidated = that._validate(files);
                    data.context = that._renderUpload(files).data('data', data);
                    options.filesContainer[
                        options.prependFiles ? 'prepend' : 'append'
                    ](data.context);
                    that._renderPreviews(files, data.context);
                    that._forceReflow(data.context);
                    that._transition(data.context).done(
                        function () {
                            if ((that._trigger('added', e, data) !== false) &&
                                    (options.autoUpload || data.autoUpload) &&
                                    data.autoUpload !== false && data.isValidated) {
                                data.submit();
                            }
                        }
                    );
                });
            },
            // Callback for the start of each file upload request:
            send: function (e, data) {
                var that = $(this).data('fileupload');
                if (!data.isValidated) {
                    if (!data.maxNumberOfFilesAdjusted) {
                        that._adjustMaxNumberOfFiles(-data.files.length);
                        data.maxNumberOfFilesAdjusted = true;
                    }
                    if (!that._validate(data.files)) {
                        return false;
                    }
                }
                if (data.context && data.dataType &&
                        data.dataType.substr(0, 6) === 'iframe') {
                    // Iframe Transport does not support progress events.
                    // In lack of an indeterminate progress bar, we set
                    // the progress to 100%, showing the full animated bar:
                    data.context
                        .find('.progress').addClass(
                            !$.support.transition && 'progress-animated'
                        )
                        .attr('aria-valuenow', 100)
                        .find('.bar').css(
                            'width',
                            '100%'
                        );
                }
                return that._trigger('sent', e, data);
            },
            // Callback for successful uploads:
            done: function (e, data) {
                var that = $(this).data('fileupload'),
                    template;
                if (data.context) {
                    data.context.each(function (index) {
                        var file = ($.isArray(data.result) &&
                                data.result[index]) || {error: 'emptyResult'};
                        if (file.error) {
                            that._adjustMaxNumberOfFiles(1);
                        }
                        that._transition($(this)).done(
                            function () {
                                var node = $(this);
                                template = that._renderDownload([file])
                                    .replaceAll(node);
                                that._forceReflow(template);
                                that._transition(template).done(
                                    function () {
                                        data.context = $(this);
                                        that._trigger('completed', e, data);
                                    }
                                );
                            }
                        );
                    });
                } else {
                    if ($.isArray(data.result)) {
                        $.each(data.result, function (index, file) {
                            if (data.maxNumberOfFilesAdjusted && file.error) {
                                that._adjustMaxNumberOfFiles(1);
                            } else if (!data.maxNumberOfFilesAdjusted &&
                                    !file.error) {
                                that._adjustMaxNumberOfFiles(-1);
                            }
                        });
                        data.maxNumberOfFilesAdjusted = true;
                    }
                    template = that._renderDownload(data.result)
                        .appendTo(that.options.filesContainer);
                    that._forceReflow(template);
                    that._transition(template).done(
                        function () {
                            data.context = $(this);
                            that._trigger('completed', e, data);
                        }
                    );
                }
            },
            // Callback for failed (abort or error) uploads:
            fail: function (e, data) {
                var that = $(this).data('fileupload'),
                    template;
                if (data.maxNumberOfFilesAdjusted) {
                    that._adjustMaxNumberOfFiles(data.files.length);
                }
                if (data.context) {
                    data.context.each(function (index) {
                        if (data.errorThrown !== 'abort') {
                            var file = data.files[index];
                            file.error = file.error || data.errorThrown ||
                                true;
                            that._transition($(this)).done(
                                function () {
                                    var node = $(this);
                                    template = that._renderDownload([file])
                                        .replaceAll(node);
                                    that._forceReflow(template);
                                    that._transition(template).done(
                                        function () {
                                            data.context = $(this);
                                            that._trigger('failed', e, data);
                                        }
                                    );
                                }
                            );
                        } else {
                            that._transition($(this)).done(
                                function () {
                                    $(this).remove();
                                    that._trigger('failed', e, data);
                                }
                            );
                        }
                    });
                } else if (data.errorThrown !== 'abort') {
                    data.context = that._renderUpload(data.files)
                        .appendTo(that.options.filesContainer)
                        .data('data', data);
                    that._forceReflow(data.context);
                    that._transition(data.context).done(
                        function () {
                            data.context = $(this);
                            that._trigger('failed', e, data);
                        }
                    );
                } else {
                    that._trigger('failed', e, data);
                }
            },
            // Callback for upload progress events:
            progress: function (e, data) {
                if (data.context) {
                    var progress = parseInt(data.loaded / data.total * 100, 10);
                    data.context.find('.progress')
                        .attr('aria-valuenow', progress)
                        .find('.bar').css(
                            'width',
                            progress + '%'
                        );
                }
            },
            // Callback for global upload progress events:
            progressall: function (e, data) {
                var $this = $(this),
                    progress = parseInt(data.loaded / data.total * 100, 10),
                    globalProgressNode = $this.find('.fileupload-progress'),
                    extendedProgressNode = globalProgressNode
                        .find('.progress-extended');
                if (extendedProgressNode.length) {
                    extendedProgressNode.html(
                        $this.data('fileupload')._renderExtendedProgress(data)
                    );
                }
                globalProgressNode
                    .find('.progress')
                    .attr('aria-valuenow', progress)
                    .find('.bar').css(
                        'width',
                        progress + '%'
                    );
            },
            // Callback for uploads start, equivalent to the global ajaxStart event:
            start: function (e) {
                var that = $(this).data('fileupload');
                that._transition($(this).find('.fileupload-progress')).done(
                    function () {
                        that._trigger('started', e);
                    }
                );
            },
            // Callback for uploads stop, equivalent to the global ajaxStop event:
            stop: function (e) {
                var that = $(this).data('fileupload');
                that._transition($(this).find('.fileupload-progress')).done(
                    function () {
                        $(this).find('.progress')
                            .attr('aria-valuenow', '0')
                            .find('.bar').css('width', '0%');
                        $(this).find('.progress-extended').html('&nbsp;');
                        that._trigger('stopped', e);
                    }
                );
            },
            // Callback for file deletion:
            destroy: function (e, data) {
                var that = $(this).data('fileupload');
                if (data.url) {
                    $.ajax(data);
                    that._adjustMaxNumberOfFiles(1);
                }
                that._transition(data.context).done(
                    function () {
                        $(this).remove();
                        that._trigger('destroyed', e, data);
                    }
                );
            }
        },

        // Link handler, that allows to download files
        // by drag & drop of the links to the desktop:
        _enableDragToDesktop: function () {
            var link = $(this),
                url = link.prop('href'),
                name = link.prop('download'),
                type = 'application/octet-stream';
            link.bind('dragstart', function (e) {
                try {
                    e.originalEvent.dataTransfer.setData(
                        'DownloadURL',
                        [type, name, url].join(':')
                    );
                } catch (err) {}
            });
        },

        _adjustMaxNumberOfFiles: function (operand) {
            if (typeof this.options.maxNumberOfFiles === 'number') {
                this.options.maxNumberOfFiles += operand;
                if (this.options.maxNumberOfFiles < 1) {
                    this._disableFileInputButton();
                } else {
                    this._enableFileInputButton();
                }
            }
        },

        _formatFileSize: function (bytes) {
            if (typeof bytes !== 'number') {
                return '';
            }
            if (bytes >= 1000000000) {
                return (bytes / 1000000000).toFixed(2) + ' GB';
            }
            if (bytes >= 1000000) {
                return (bytes / 1000000).toFixed(2) + ' MB';
            }
            return (bytes / 1000).toFixed(2) + ' KB';
        },

        _formatBitrate: function (bits) {
            if (typeof bits !== 'number') {
                return '';
            }
            if (bits >= 1000000000) {
                return (bits / 1000000000).toFixed(2) + ' Gbit/s';
            }
            if (bits >= 1000000) {
                return (bits / 1000000).toFixed(2) + ' Mbit/s';
            }
            if (bits >= 1000) {
                return (bits / 1000).toFixed(2) + ' kbit/s';
            }
            return bits + ' bit/s';
        },

        _formatTime: function (seconds) {
            var date = new Date(seconds * 1000),
                days = parseInt(seconds / 86400, 10);
            days = days ? days + 'd ' : '';
            return days +
                ('0' + date.getUTCHours()).slice(-2) + ':' +
                ('0' + date.getUTCMinutes()).slice(-2) + ':' +
                ('0' + date.getUTCSeconds()).slice(-2);
        },

        _formatPercentage: function (floatValue) {
            return (floatValue * 100).toFixed(2) + ' %';
        },

        _renderExtendedProgress: function (data) {
            return this._formatBitrate(data.bitrate) + ' | ' +
                this._formatTime(
                    (data.total - data.loaded) * 8 / data.bitrate
                ) + ' | ' +
                this._formatPercentage(
                    data.loaded / data.total
                ) + ' | ' +
                this._formatFileSize(data.loaded) + ' / ' +
                this._formatFileSize(data.total);
        },

        _hasError: function (file) {
            if (file.error) {
                return file.error;
            }
            // The number of added files is subtracted from
            // maxNumberOfFiles before validation, so we check if
            // maxNumberOfFiles is below 0 (instead of below 1):
            if (this.options.maxNumberOfFiles < 0) {
                return 'maxNumberOfFiles';
            }
            // Files are accepted if either the file type or the file name
            // matches against the acceptFileTypes regular expression, as
            // only browsers with support for the File API report the type:
            if (!(this.options.acceptFileTypes.test(file.type) ||
                    this.options.acceptFileTypes.test(file.name))) {
                return 'acceptFileTypes';
            }
            if (this.options.maxFileSize &&
                    file.size > this.options.maxFileSize) {
                return 'maxFileSize';
            }
            if (typeof file.size === 'number' &&
                    file.size < this.options.minFileSize) {
                return 'minFileSize';
            }
            return null;
        },

        _validate: function (files) {
            var that = this,
                valid = !!files.length;
            $.each(files, function (index, file) {
                file.error = that._hasError(file);
                if (file.error) {
                    valid = false;
                }
            });
            return valid;
        },

        _renderTemplate: function (func, files) {
            if (!func) {
                return $();
            }
            var result = func({
                files: files,
                formatFileSize: this._formatFileSize,
                options: this.options
            });
            if (result instanceof $) {
                return result;
            }
            return $(this.options.templatesContainer).html(result).children();
        },

        _renderPreview: function (file, node) {
            var that = this,
                options = this.options,
                dfd = $.Deferred();
            return ((loadImage && loadImage(
                file,
                function (img) {
                    node.append(img);
                    that._forceReflow(node);
                    that._transition(node).done(function () {
                        dfd.resolveWith(node);
                    });
                    if (!$.contains(document.body, node[0])) {
                        // If the element is not part of the DOM,
                        // transition events are not triggered,
                        // so we have to resolve manually:
                        dfd.resolveWith(node);
                    }
                },
                {
                    maxWidth: options.previewMaxWidth,
                    maxHeight: options.previewMaxHeight,
                    canvas: options.previewAsCanvas
                }
            )) || dfd.resolveWith(node)) && dfd;
        },

        _renderPreviews: function (files, nodes) {
            var that = this,
                options = this.options;
            nodes.find('.preview span').each(function (index, element) {
                var file = files[index];
                if (options.previewSourceFileTypes.test(file.type) &&
                        ($.type(options.previewSourceMaxFileSize) !== 'number' ||
                        file.size < options.previewSourceMaxFileSize)) {
                    that._processingQueue = that._processingQueue.pipe(function () {
                        var dfd = $.Deferred();
                        that._renderPreview(file, $(element)).done(
                            function () {
                                dfd.resolveWith(that);
                            }
                        );
                        return dfd.promise();
                    });
                }
            });
            return this._processingQueue;
        },

        _renderUpload: function (files) {
            return this._renderTemplate(
                this.options.uploadTemplate,
                files
            );
        },

        _renderDownload: function (files) {
            return this._renderTemplate(
                this.options.downloadTemplate,
                files
            ).find('a[download]').each(this._enableDragToDesktop).end();
        },

        _startHandler: function (e) {
            e.preventDefault();
            var button = $(this),
                template = button.closest('.template-upload'),
                data = template.data('data');
            if (data && data.submit && !data.jqXHR && data.submit()) {
                button.prop('disabled', true);
            }
        },

        _cancelHandler: function (e) {
            e.preventDefault();
            var template = $(this).closest('.template-upload'),
                data = template.data('data') || {};
            if (!data.jqXHR) {
                data.errorThrown = 'abort';
                e.data.fileupload._trigger('fail', e, data);
            } else {
                data.jqXHR.abort();
            }
        },

        _deleteHandler: function (e) {
            e.preventDefault();
            var button = $(this);
            e.data.fileupload._trigger('destroy', e, {
                context: button.closest('.template-download'),
                url: button.attr('data-url'),
                type: button.attr('data-type') || 'DELETE',
                dataType: e.data.fileupload.options.dataType
            });
        },

        _forceReflow: function (node) {
            return $.support.transition && node.length &&
                node[0].offsetWidth;
        },

        _transition: function (node) {
            var dfd = $.Deferred();
            if ($.support.transition && node.hasClass('fade')) {
                node.bind(
                    $.support.transition.end,
                    function (e) {
                        // Make sure we don't respond to other transitions events
                        // in the container element, e.g. from button elements:
                        if (e.target === node[0]) {
                            node.unbind($.support.transition.end);
                            dfd.resolveWith(node);
                        }
                    }
                ).toggleClass('in');
            } else {
                node.toggleClass('in');
                dfd.resolveWith(node);
            }
            return dfd;
        },

        _initButtonBarEventHandlers: function () {
            var fileUploadButtonBar = this.element.find('.fileupload-buttonbar'),
                filesList = this.options.filesContainer,
                ns = this.options.namespace;
            fileUploadButtonBar.find('.start')
                .bind('click.' + ns, function (e) {
                    e.preventDefault();
                    filesList.find('.start button').click();
                });
            fileUploadButtonBar.find('.cancel')
                .bind('click.' + ns, function (e) {
                    e.preventDefault();
                    filesList.find('.cancel button').click();
                });
            fileUploadButtonBar.find('.delete')
                .bind('click.' + ns, function (e) {
                    e.preventDefault();
                    filesList.find('.delete input:checked')
                        .siblings('button').click();
                    fileUploadButtonBar.find('.toggle')
                        .prop('checked', false);
                });
            fileUploadButtonBar.find('.toggle')
                .bind('change.' + ns, function (e) {
                    filesList.find('.delete input').prop(
                        'checked',
                        $(this).is(':checked')
                    );
                });
        },

        _destroyButtonBarEventHandlers: function () {
            this.element.find('.fileupload-buttonbar button')
                .unbind('click.' + this.options.namespace);
            this.element.find('.fileupload-buttonbar .toggle')
                .unbind('change.' + this.options.namespace);
        },

        _initEventHandlers: function () {
            parentWidget.prototype._initEventHandlers.call(this);
            var eventData = {fileupload: this};
            this.options.filesContainer
                .delegate(
                    '.start button',
                    'click.' + this.options.namespace,
                    eventData,
                    this._startHandler
                )
                .delegate(
                    '.cancel button',
                    'click.' + this.options.namespace,
                    eventData,
                    this._cancelHandler
                )
                .delegate(
                    '.delete button',
                    'click.' + this.options.namespace,
                    eventData,
                    this._deleteHandler
                );
            this._initButtonBarEventHandlers();
        },

        _destroyEventHandlers: function () {
            var options = this.options;
            this._destroyButtonBarEventHandlers();
            options.filesContainer
                .undelegate('.start button', 'click.' + options.namespace)
                .undelegate('.cancel button', 'click.' + options.namespace)
                .undelegate('.delete button', 'click.' + options.namespace);
            parentWidget.prototype._destroyEventHandlers.call(this);
        },

        _enableFileInputButton: function () {
            this.element.find('.fileinput-button input')
                .prop('disabled', false)
                .parent().removeClass('disabled');
        },

        _disableFileInputButton: function () {
            this.element.find('.fileinput-button input')
                .prop('disabled', true)
                .parent().addClass('disabled');
        },

        _initTemplates: function () {
            var options = this.options;
            options.templatesContainer = document.createElement(
                options.filesContainer.prop('nodeName')
            );
            if (tmpl) {
                if (options.uploadTemplateId) {
                    options.uploadTemplate = tmpl(options.uploadTemplateId);
                }
                if (options.downloadTemplateId) {
                    options.downloadTemplate = tmpl(options.downloadTemplateId);
                }
            }
        },

        _initFilesContainer: function () {
            var options = this.options;
            if (options.filesContainer === undefined) {
                options.filesContainer = this.element.find('.files');
            } else if (!(options.filesContainer instanceof $)) {
                options.filesContainer = $(options.filesContainer);
            }
        },

        _stringToRegExp: function (str) {
            var parts = str.split('/'),
                modifiers = parts.pop();
            parts.shift();
            return new RegExp(parts.join('/'), modifiers);
        },

        _initRegExpOptions: function () {
            var options = this.options;
            if ($.type(options.acceptFileTypes) === 'string') {
                options.acceptFileTypes = this._stringToRegExp(
                    options.acceptFileTypes
                );
            }
            if ($.type(options.previewSourceFileTypes) === 'string') {
                options.previewSourceFileTypes = this._stringToRegExp(
                    options.previewSourceFileTypes
                );
            }
        },

        _initSpecialOptions: function () {
            parentWidget.prototype._initSpecialOptions.call(this);
            this._initFilesContainer();
            this._initTemplates();
            this._initRegExpOptions();
        },

        _create: function () {
            parentWidget.prototype._create.call(this);
            this._refreshOptionsList.push(
                'filesContainer',
                'uploadTemplateId',
                'downloadTemplateId'
            );
            if (!$.blueimpFP) {
                this._processingQueue = $.Deferred().resolveWith(this).promise();
                this.process = function () {
                    return this._processingQueue;
                };
            }
        },

        enable: function () {
            var wasDisabled = false;
            if (this.options.disabled) {
                wasDisabled = true;
            }
            parentWidget.prototype.enable.call(this);
            if (wasDisabled) {
                this.element.find('input, button').prop('disabled', false);
                this._enableFileInputButton();
            }
        },

        disable: function () {
            if (!this.options.disabled) {
                this.element.find('input, button').prop('disabled', true);
                this._disableFileInputButton();
            }
            parentWidget.prototype.disable.call(this);
        }

    });

}));
;/*
 * jQuery File Upload Plugin 5.17.1
 * https://github.com/blueimp/jQuery-File-Upload
 *
 * Copyright 2010, Sebastian Tschan
 * https://blueimp.net
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */

/*jslint nomen: true, unparam: true, regexp: true */
/*global define, window, document, Blob, FormData, location */

(function (factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        // Register as an anonymous AMD module:
        define([
            'jquery',
        ], factory);
    } else {
        // Browser globals:
        factory(window.jQuery);
    }
}(function ($) {
    'use strict';

    // The FileReader API is not actually used, but works as feature detection,
    // as e.g. Safari supports XHR file uploads via the FormData API,
    // but not non-multipart XHR file uploads:
    $.support.xhrFileUpload = !!(window.XMLHttpRequestUpload && window.FileReader);
    $.support.xhrFormDataFileUpload = !!window.FormData;

    // The fileupload widget listens for change events on file input fields defined
    // via fileInput setting and paste or drop events of the given dropZone.
    // In addition to the default jQuery Widget methods, the fileupload widget
    // exposes the "add" and "send" methods, to add or directly send files using
    // the fileupload API.
    // By default, files added via file input selection, paste, drag & drop or
    // "add" method are uploaded immediately, but it is possible to override
    // the "add" callback option to queue file uploads.
    $.widget('blueimp.fileupload', {

        options: {
            // The namespace used for event handler binding on the fileInput,
            // dropZone and pasteZone document nodes.
            // If not set, the name of the widget ("fileupload") is used.
            namespace: undefined,
            // The drop target element(s), by the default the complete document.
            // Set to null to disable drag & drop support:
            dropZone: $(document),
            // The paste target element(s), by the default the complete document.
            // Set to null to disable paste support:
            pasteZone: $(document),
            // The file input field(s), that are listened to for change events.
            // If undefined, it is set to the file input fields inside
            // of the widget element on plugin initialization.
            // Set to null to disable the change listener.
            fileInput: undefined,
            // By default, the file input field is replaced with a clone after
            // each input field change event. This is required for iframe transport
            // queues and allows change events to be fired for the same file
            // selection, but can be disabled by setting the following option to false:
            replaceFileInput: true,
            // The parameter name for the file form data (the request argument name).
            // If undefined or empty, the name property of the file input field is
            // used, or "files[]" if the file input name property is also empty,
            // can be a string or an array of strings:
            paramName: undefined,
            // By default, each file of a selection is uploaded using an individual
            // request for XHR type uploads. Set to false to upload file
            // selections in one request each:
            singleFileUploads: true,
            // To limit the number of files uploaded with one XHR request,
            // set the following option to an integer greater than 0:
            limitMultiFileUploads: undefined,
            // Set the following option to true to issue all file upload requests
            // in a sequential order:
            sequentialUploads: false,
            // To limit the number of concurrent uploads,
            // set the following option to an integer greater than 0:
            limitConcurrentUploads: undefined,
            // Set the following option to true to force iframe transport uploads:
            forceIframeTransport: false,
            // Set the following option to the location of a redirect url on the
            // origin server, for cross-domain iframe transport uploads:
            redirect: undefined,
            // The parameter name for the redirect url, sent as part of the form
            // data and set to 'redirect' if this option is empty:
            redirectParamName: undefined,
            // Set the following option to the location of a postMessage window,
            // to enable postMessage transport uploads:
            postMessage: undefined,
            // By default, XHR file uploads are sent as multipart/form-data.
            // The iframe transport is always using multipart/form-data.
            // Set to false to enable non-multipart XHR uploads:
            multipart: true,
            // To upload large files in smaller chunks, set the following option
            // to a preferred maximum chunk size. If set to 0, null or undefined,
            // or the browser does not support the required Blob API, files will
            // be uploaded as a whole.
            maxChunkSize: undefined,
            // When a non-multipart upload or a chunked multipart upload has been
            // aborted, this option can be used to resume the upload by setting
            // it to the size of the already uploaded bytes. This option is most
            // useful when modifying the options object inside of the "add" or
            // "send" callbacks, as the options are cloned for each file upload.
            uploadedBytes: undefined,
            // By default, failed (abort or error) file uploads are removed from the
            // global progress calculation. Set the following option to false to
            // prevent recalculating the global progress data:
            recalculateProgress: true,
            // Interval in milliseconds to calculate and trigger progress events:
            progressInterval: 100,
            // Interval in milliseconds to calculate progress bitrate:
            bitrateInterval: 500,

            // Additional form data to be sent along with the file uploads can be set
            // using this option, which accepts an array of objects with name and
            // value properties, a function returning such an array, a FormData
            // object (for XHR file uploads), or a simple object.
            // The form of the first fileInput is given as parameter to the function:
            formData: function (form) {
                return form.serializeArray();
            },

            // The add callback is invoked as soon as files are added to the fileupload
            // widget (via file input selection, drag & drop, paste or add API call).
            // If the singleFileUploads option is enabled, this callback will be
            // called once for each file in the selection for XHR file uplaods, else
            // once for each file selection.
            // The upload starts when the submit method is invoked on the data parameter.
            // The data object contains a files property holding the added files
            // and allows to override plugin options as well as define ajax settings.
            // Listeners for this callback can also be bound the following way:
            // .bind('fileuploadadd', func);
            // data.submit() returns a Promise object and allows to attach additional
            // handlers using jQuery's Deferred callbacks:
            // data.submit().done(func).fail(func).always(func);
            add: function (e, data) {
                data.submit();
            },

            // Other callbacks:
            // Callback for the submit event of each file upload:
            // submit: function (e, data) {}, // .bind('fileuploadsubmit', func);
            // Callback for the start of each file upload request:
            // send: function (e, data) {}, // .bind('fileuploadsend', func);
            // Callback for successful uploads:
            // done: function (e, data) {}, // .bind('fileuploaddone', func);
            // Callback for failed (abort or error) uploads:
            // fail: function (e, data) {}, // .bind('fileuploadfail', func);
            // Callback for completed (success, abort or error) requests:
            // always: function (e, data) {}, // .bind('fileuploadalways', func);
            // Callback for upload progress events:
            // progress: function (e, data) {}, // .bind('fileuploadprogress', func);
            // Callback for global upload progress events:
            // progressall: function (e, data) {}, // .bind('fileuploadprogressall', func);
            // Callback for uploads start, equivalent to the global ajaxStart event:
            // start: function (e) {}, // .bind('fileuploadstart', func);
            // Callback for uploads stop, equivalent to the global ajaxStop event:
            // stop: function (e) {}, // .bind('fileuploadstop', func);
            // Callback for change events of the fileInput(s):
            // change: function (e, data) {}, // .bind('fileuploadchange', func);
            // Callback for paste events to the pasteZone(s):
            // paste: function (e, data) {}, // .bind('fileuploadpaste', func);
            // Callback for drop events of the dropZone(s):
            // drop: function (e, data) {}, // .bind('fileuploaddrop', func);
            // Callback for dragover events of the dropZone(s):
            // dragover: function (e) {}, // .bind('fileuploaddragover', func);

            // The plugin options are used as settings object for the ajax calls.
            // The following are jQuery ajax settings required for the file uploads:
            processData: false,
            contentType: false,
            cache: false
        },

        // A list of options that require a refresh after assigning a new value:
        _refreshOptionsList: [
            'namespace',
            'fileInput',
            'dropZone',
            'pasteZone',
            'multipart',
            'forceIframeTransport'
        ],

        _BitrateTimer: function () {
            this.timestamp = +(new Date());
            this.loaded = 0;
            this.bitrate = 0;
            this.getBitrate = function (now, loaded, interval) {
                var timeDiff = now - this.timestamp;
                if (!this.bitrate || !interval || timeDiff > interval) {
                    this.bitrate = (loaded - this.loaded) * (1000 / timeDiff) * 8;
                    this.loaded = loaded;
                    this.timestamp = now;
                }
                return this.bitrate;
            };
        },

        _isXHRUpload: function (options) {
            return !options.forceIframeTransport &&
                ((!options.multipart && $.support.xhrFileUpload) ||
                $.support.xhrFormDataFileUpload);
        },

        _getFormData: function (options) {
            var formData;
            if (typeof options.formData === 'function') {
                return options.formData(options.form);
            }
			if ($.isArray(options.formData)) {
                return options.formData;
            }
			if (options.formData) {
                formData = [];
                $.each(options.formData, function (name, value) {
                    formData.push({name: name, value: value});
                });
                return formData;
            }
            return [];
        },

        _getTotal: function (files) {
            var total = 0;
            $.each(files, function (index, file) {
                total += file.size || 1;
            });
            return total;
        },

        _onProgress: function (e, data) {
            if (e.lengthComputable) {
                var now = +(new Date()),
                    total,
                    loaded;
                if (data._time && data.progressInterval &&
                        (now - data._time < data.progressInterval) &&
                        e.loaded !== e.total) {
                    return;
                }
                data._time = now;
                total = data.total || this._getTotal(data.files);
                loaded = parseInt(
                    e.loaded / e.total * (data.chunkSize || total),
                    10
                ) + (data.uploadedBytes || 0);
                this._loaded += loaded - (data.loaded || data.uploadedBytes || 0);
                data.lengthComputable = true;
                data.loaded = loaded;
                data.total = total;
                data.bitrate = data._bitrateTimer.getBitrate(
                    now,
                    loaded,
                    data.bitrateInterval
                );
                // Trigger a custom progress event with a total data property set
                // to the file size(s) of the current upload and a loaded data
                // property calculated accordingly:
                this._trigger('progress', e, data);
                // Trigger a global progress event for all current file uploads,
                // including ajax calls queued for sequential file uploads:
                this._trigger('progressall', e, {
                    lengthComputable: true,
                    loaded: this._loaded,
                    total: this._total,
                    bitrate: this._bitrateTimer.getBitrate(
                        now,
                        this._loaded,
                        data.bitrateInterval
                    )
                });
            }
        },

        _initProgressListener: function (options) {
            var that = this,
                xhr = options.xhr ? options.xhr() : $.ajaxSettings.xhr();
            // Accesss to the native XHR object is required to add event listeners
            // for the upload progress event:
            if (xhr.upload) {
                $(xhr.upload).bind('progress', function (e) {
                    var oe = e.originalEvent;
                    // Make sure the progress event properties get copied over:
                    e.lengthComputable = oe.lengthComputable;
                    e.loaded = oe.loaded;
                    e.total = oe.total;
                    that._onProgress(e, options);
                });
                options.xhr = function () {
                    return xhr;
                };
            }
        },

        _initXHRData: function (options) {
            var formData,
                file = options.files[0],
                // Ignore non-multipart setting if not supported:
                multipart = options.multipart || !$.support.xhrFileUpload,
                paramName = options.paramName[0];
            if (!multipart || options.blob) {
                // For non-multipart uploads and chunked uploads,
                // file meta data is not part of the request body,
                // so we transmit this data as part of the HTTP headers.
                // For cross domain requests, these headers must be allowed
                // via Access-Control-Allow-Headers or removed using
                // the beforeSend callback:
                options.headers = $.extend(options.headers, {
                    'X-File-Name': file.name,
                    'X-File-Type': file.type,
                    'X-File-Size': file.size
                });
                if (!options.blob) {
                    // Non-chunked non-multipart upload:
                    options.contentType = file.type;
                    options.data = file;
                } else if (!multipart) {
                    // Chunked non-multipart upload:
                    options.contentType = 'application/octet-stream';
                    options.data = options.blob;
                }
            }
            if (multipart && $.support.xhrFormDataFileUpload) {
                if (options.postMessage) {
                    // window.postMessage does not allow sending FormData
                    // objects, so we just add the File/Blob objects to
                    // the formData array and let the postMessage window
                    // create the FormData object out of this array:
                    formData = this._getFormData(options);
                    if (options.blob) {
                        formData.push({
                            name: paramName,
                            value: options.blob
                        });
                    } else {
                        $.each(options.files, function (index, file) {
                            formData.push({
                                name: options.paramName[index] || paramName,
                                value: file
                            });
                        });
                    }
                } else {
                    if (options.formData instanceof FormData) {
                        formData = options.formData;
                    } else {
                        formData = new FormData();
                        $.each(this._getFormData(options), function (index, field) {
                            formData.append(field.name, field.value);
                        });
                    }
                    if (options.blob) {
                        formData.append(paramName, options.blob, file.name);
                    } else {
                        $.each(options.files, function (index, file) {
                            // File objects are also Blob instances.
                            // This check allows the tests to run with
                            // dummy objects:
                            if (file instanceof Blob) {
                                formData.append(
                                    options.paramName[index] || paramName,
                                    file,
                                    file.name
                                );
                            }
                        });
                    }
                }
                options.data = formData;
            }
            // Blob reference is not needed anymore, free memory:
            options.blob = null;
        },

        _initIframeSettings: function (options) {
            // Setting the dataType to iframe enables the iframe transport:
            options.dataType = 'iframe ' + (options.dataType || '');
            // The iframe transport accepts a serialized array as form data:
            options.formData = this._getFormData(options);
            // Add redirect url to form data on cross-domain uploads:
            if (options.redirect && $('<a></a>').prop('href', options.url)
                    .prop('host') !== location.host) {
                options.formData.push({
                    name: options.redirectParamName || 'redirect',
                    value: options.redirect
                });
            }
        },

        _initDataSettings: function (options) {
            if (this._isXHRUpload(options)) {
                if (!this._chunkedUpload(options, true)) {
                    if (!options.data) {
                        this._initXHRData(options);
                    }
                    this._initProgressListener(options);
                }
                if (options.postMessage) {
                    // Setting the dataType to postmessage enables the
                    // postMessage transport:
                    options.dataType = 'postmessage ' + (options.dataType || '');
                }
            } else {
                this._initIframeSettings(options, 'iframe');
            }
        },

        _getParamName: function (options) {
            var fileInput = $(options.fileInput),
                paramName = options.paramName;
            if (!paramName) {
                paramName = [];
                fileInput.each(function () {
                    var input = $(this),
                        name = input.prop('name') || 'files[]',
                        i = (input.prop('files') || [1]).length;
                    while (i) {
                        paramName.push(name);
                        i -= 1;
                    }
                });
                if (!paramName.length) {
                    paramName = [fileInput.prop('name') || 'files[]'];
                }
            } else if (!$.isArray(paramName)) {
                paramName = [paramName];
            }
            return paramName;
        },

        _initFormSettings: function (options) {
            // Retrieve missing options from the input field and the
            // associated form, if available:
            if (!options.form || !options.form.length) {
                options.form = $(options.fileInput.prop('form'));
                // If the given file input doesn't have an associated form,
                // use the default widget file input's form:
                if (!options.form.length) {
                    options.form = $(this.options.fileInput.prop('form'));
                }
            }
            options.paramName = this._getParamName(options);
            if (!options.url) {
                options.url = options.form.prop('action') || location.href;
            }
            // The HTTP request method must be "POST" or "PUT":
            options.type = (options.type || options.form.prop('method') || '')
                .toUpperCase();
            if (options.type !== 'POST' && options.type !== 'PUT') {
                options.type = 'POST';
            }
            if (!options.formAcceptCharset) {
                options.formAcceptCharset = options.form.attr('accept-charset');
            }
        },

        _getAJAXSettings: function (data) {
            var options = $.extend({}, this.options, data);
            this._initFormSettings(options);
            this._initDataSettings(options);
            return options;
        },

        // Maps jqXHR callbacks to the equivalent
        // methods of the given Promise object:
        _enhancePromise: function (promise) {
            promise.success = promise.done;
            promise.error = promise.fail;
            promise.complete = promise.always;
            return promise;
        },

        // Creates and returns a Promise object enhanced with
        // the jqXHR methods abort, success, error and complete:
        _getXHRPromise: function (resolveOrReject, context, args) {
            var dfd = $.Deferred(),
                promise = dfd.promise();
            context = context || this.options.context || promise;
            if (resolveOrReject === true) {
                dfd.resolveWith(context, args);
            } else if (resolveOrReject === false) {
                dfd.rejectWith(context, args);
            }
            promise.abort = dfd.promise;
            return this._enhancePromise(promise);
        },

        // Uploads a file in multiple, sequential requests
        // by splitting the file up in multiple blob chunks.
        // If the second parameter is true, only tests if the file
        // should be uploaded in chunks, but does not invoke any
        // upload requests:
        _chunkedUpload: function (options, testOnly) {
            var that = this,
                file = options.files[0],
                fs = file.size,
                ub = options.uploadedBytes = options.uploadedBytes || 0,
                mcs = options.maxChunkSize || fs,
                // Use the Blob methods with the slice implementation
                // according to the W3C Blob API specification:
                slice = file.webkitSlice || file.mozSlice || file.slice,
                upload,
                n,
                jqXHR,
                pipe;
            if (!(this._isXHRUpload(options) && slice && (ub || mcs < fs)) ||
                    options.data) {
                return false;
            }
            if (testOnly) {
                return true;
            }
            if (ub >= fs) {
                file.error = 'uploadedBytes';
                return this._getXHRPromise(
                    false,
                    options.context,
                    [null, 'error', file.error]
                );
            }
            // n is the number of blobs to upload,
            // calculated via filesize, uploaded bytes and max chunk size:
            n = Math.ceil((fs - ub) / mcs);
            // The chunk upload method accepting the chunk number as parameter:
            upload = function (i) {
                if (!i) {
                    return that._getXHRPromise(true, options.context);
                }
                // Upload the blobs in sequential order:
                return upload(i -= 1).pipe(function () {
                    // Clone the options object for each chunk upload:
                    var o = $.extend({}, options);
                    o.blob = slice.call(
                        file,
                        ub + i * mcs,
                        ub + (i + 1) * mcs
                    );
                    // Expose the chunk index:
                    o.chunkIndex = i;
                    // Expose the number of chunks:
                    o.chunksNumber = n;
                    // Store the current chunk size, as the blob itself
                    // will be dereferenced after data processing:
                    o.chunkSize = o.blob.size;
                    // Process the upload data (the blob and potential form data):
                    that._initXHRData(o);
                    // Add progress listeners for this chunk upload:
                    that._initProgressListener(o);
                    jqXHR = ($.ajax(o) || that._getXHRPromise(false, o.context))
                        .done(function () {
                            // Create a progress event if upload is done and
                            // no progress event has been invoked for this chunk:
                            if (!o.loaded) {
                                that._onProgress($.Event('progress', {
                                    lengthComputable: true,
                                    loaded: o.chunkSize,
                                    total: o.chunkSize
                                }), o);
                            }
                            options.uploadedBytes = o.uploadedBytes +=
                                o.chunkSize;
                        });
                    return jqXHR;
                });
            };
            // Return the piped Promise object, enhanced with an abort method,
            // which is delegated to the jqXHR object of the current upload,
            // and jqXHR callbacks mapped to the equivalent Promise methods:
            pipe = upload(n);
            pipe.abort = function () {
                return jqXHR.abort();
            };
            return this._enhancePromise(pipe);
        },

        _beforeSend: function (e, data) {
            if (this._active === 0) {
                // the start callback is triggered when an upload starts
                // and no other uploads are currently running,
                // equivalent to the global ajaxStart event:
                this._trigger('start');
                // Set timer for global bitrate progress calculation:
                this._bitrateTimer = new this._BitrateTimer();
            }
            this._active += 1;
            // Initialize the global progress values:
            this._loaded += data.uploadedBytes || 0;
            this._total += this._getTotal(data.files);
        },

        _onDone: function (result, textStatus, jqXHR, options) {
            if (!this._isXHRUpload(options)) {
                // Create a progress event for each iframe load:
                this._onProgress($.Event('progress', {
                    lengthComputable: true,
                    loaded: 1,
                    total: 1
                }), options);
            }
            options.result = result;
            options.textStatus = textStatus;
            options.jqXHR = jqXHR;
            this._trigger('done', null, options);
        },

        _onFail: function (jqXHR, textStatus, errorThrown, options) {
            options.jqXHR = jqXHR;
            options.textStatus = textStatus;
            options.errorThrown = errorThrown;
            this._trigger('fail', null, options);
            if (options.recalculateProgress) {
                // Remove the failed (error or abort) file upload from
                // the global progress calculation:
                this._loaded -= options.loaded || options.uploadedBytes || 0;
                this._total -= options.total || this._getTotal(options.files);
            }
        },

        _onAlways: function (jqXHRorResult, textStatus, jqXHRorError, options) {
            this._active -= 1;
            options.textStatus = textStatus;
            if (jqXHRorError && jqXHRorError.always) {
                options.jqXHR = jqXHRorError;
                options.result = jqXHRorResult;
            } else {
                options.jqXHR = jqXHRorResult;
                options.errorThrown = jqXHRorError;
            }
            this._trigger('always', null, options);
            if (this._active === 0) {
                // The stop callback is triggered when all uploads have
                // been completed, equivalent to the global ajaxStop event:
                this._trigger('stop');
                // Reset the global progress values:
                this._loaded = this._total = 0;
                this._bitrateTimer = null;
            }
        },

        _onSend: function (e, data) {
            var that = this,
                jqXHR,
                slot,
                pipe,
                options = that._getAJAXSettings(data),
                send = function (resolve, args) {
                    that._sending += 1;
                    // Set timer for bitrate progress calculation:
                    options._bitrateTimer = new that._BitrateTimer();
                    jqXHR = jqXHR || (
                        (resolve !== false &&
                        that._trigger('send', e, options) !== false &&
                        (that._chunkedUpload(options) || $.ajax(options))) ||
                        that._getXHRPromise(false, options.context, args)
                    ).done(function (result, textStatus, jqXHR) {
                        that._onDone(result, textStatus, jqXHR, options);
                    }).fail(function (jqXHR, textStatus, errorThrown) {
                        that._onFail(jqXHR, textStatus, errorThrown, options);
                    }).always(function (jqXHRorResult, textStatus, jqXHRorError) {
                        that._sending -= 1;
                        that._onAlways(
                            jqXHRorResult,
                            textStatus,
                            jqXHRorError,
                            options
                        );
                        if (options.limitConcurrentUploads &&
                                options.limitConcurrentUploads > that._sending) {
                            // Start the next queued upload,
                            // that has not been aborted:
                            var nextSlot = that._slots.shift(),
                                isPending;
                            while (nextSlot) {
                                // jQuery 1.6 doesn't provide .state(),
                                // while jQuery 1.8+ removed .isRejected():
                                isPending = nextSlot.state ?
                                        nextSlot.state() === 'pending' :
                                        !nextSlot.isRejected();
                                if (isPending) {
                                    nextSlot.resolve();
                                    break;
                                }
                                nextSlot = that._slots.shift();
                            }
                        }
                    });
                    return jqXHR;
                };
            this._beforeSend(e, options);
            if (this.options.sequentialUploads ||
                    (this.options.limitConcurrentUploads &&
                    this.options.limitConcurrentUploads <= this._sending)) {
                if (this.options.limitConcurrentUploads > 1) {
                    slot = $.Deferred();
                    this._slots.push(slot);
                    pipe = slot.pipe(send);
                } else {
                    pipe = (this._sequence = this._sequence.pipe(send, send));
                }
                // Return the piped Promise object, enhanced with an abort method,
                // which is delegated to the jqXHR object of the current upload,
                // and jqXHR callbacks mapped to the equivalent Promise methods:
                pipe.abort = function () {
                    var args = [undefined, 'abort', 'abort'];
                    if (!jqXHR) {
                        if (slot) {
                            slot.rejectWith(pipe, args);
                        }
                        return send(false, args);
                    }
                    return jqXHR.abort();
                };
                return this._enhancePromise(pipe);
            }
            return send();
        },

        _onAdd: function (e, data) {
            var that = this,
                result = true,
                options = $.extend({}, this.options, data),
                limit = options.limitMultiFileUploads,
                paramName = this._getParamName(options),
                paramNameSet,
                paramNameSlice,
                fileSet,
                i;
            if (!(options.singleFileUploads || limit) ||
                    !this._isXHRUpload(options)) {
                fileSet = [data.files];
                paramNameSet = [paramName];
            } else if (!options.singleFileUploads && limit) {
                fileSet = [];
                paramNameSet = [];
                for (i = 0; i < data.files.length; i += limit) {
                    fileSet.push(data.files.slice(i, i + limit));
                    paramNameSlice = paramName.slice(i, i + limit);
                    if (!paramNameSlice.length) {
                        paramNameSlice = paramName;
                    }
                    paramNameSet.push(paramNameSlice);
                }
            } else {
                paramNameSet = paramName;
            }
            data.originalFiles = data.files;
            $.each(fileSet || data.files, function (index, element) {
                var newData = $.extend({}, data);
                newData.files = fileSet ? element : [element];
                newData.paramName = paramNameSet[index];
                newData.submit = function () {
                    newData.jqXHR = this.jqXHR =
                        (that._trigger('submit', e, this) !== false) &&
                        that._onSend(e, this);
                    return this.jqXHR;
                };
                return (result = that._trigger('add', e, newData));
            });
            return result;
        },

        _replaceFileInput: function (input) {
            var inputClone = input.clone(true);
            $('<form></form>').append(inputClone)[0].reset();
            // Detaching allows to insert the fileInput on another form
            // without loosing the file input value:
            input.after(inputClone).detach();
            // Avoid memory leaks with the detached file input:
            $.cleanData(input.unbind('remove'));
            // Replace the original file input element in the fileInput
            // elements set with the clone, which has been copied including
            // event handlers:
            this.options.fileInput = this.options.fileInput.map(function (i, el) {
                if (el === input[0]) {
                    return inputClone[0];
                }
                return el;
            });
            // If the widget has been initialized on the file input itself,
            // override this.element with the file input clone:
            if (input[0] === this.element[0]) {
                this.element = inputClone;
            }
        },

        _handleFileTreeEntry: function (entry, path) {
            var that = this,
                dfd = $.Deferred(),
                errorHandler = function () {
                    dfd.reject();
                },
                dirReader;
            path = path || '';
            if (entry.isFile) {
                entry.file(function (file) {
                    file.relativePath = path;
                    dfd.resolve(file);
                }, errorHandler);
            } else if (entry.isDirectory) {
                dirReader = entry.createReader();
                dirReader.readEntries(function (entries) {
                    that._handleFileTreeEntries(
                        entries,
                        path + entry.name + '/'
                    ).done(function (files) {
                        dfd.resolve(files);
                    }).fail(errorHandler);
                }, errorHandler);
            } else {
                errorHandler();
            }
            return dfd.promise();
        },

        _handleFileTreeEntries: function (entries, path) {
            var that = this;
            return $.when.apply(
                $,
                $.map(entries, function (entry) {
                    return that._handleFileTreeEntry(entry, path);
                })
            ).pipe(function () {
                return Array.prototype.concat.apply(
                    [],
                    arguments
                );
            });
        },

        _getDroppedFiles: function (dataTransfer) {
            dataTransfer = dataTransfer || {};
            var items = dataTransfer.items;
            if (items && items.length && (items[0].webkitGetAsEntry ||
                    items[0].getAsEntry)) {
                return this._handleFileTreeEntries(
                    $.map(items, function (item) {
                        if (item.webkitGetAsEntry) {
                            return item.webkitGetAsEntry();
                        }
                        return item.getAsEntry();
                    })
                );
            }
            return $.Deferred().resolve(
                $.makeArray(dataTransfer.files)
            ).promise();
        },

        _getSingleFileInputFiles: function (fileInput) {
            fileInput = $(fileInput);
            var entries = fileInput.prop('webkitEntries') ||
                    fileInput.prop('entries'),
                files,
                value;
            if (entries && entries.length) {
                return this._handleFileTreeEntries(entries);
            }
            files = $.makeArray(fileInput.prop('files'));
            if (!files.length) {
                value = fileInput.prop('value');
                if (!value) {
                    return $.Deferred().resolve([]).promise();
                }
                // If the files property is not available, the browser does not
                // support the File API and we add a pseudo File object with
                // the input value as name with path information removed:
                files = [{name: value.replace(/^.*\\/, '')}];
            }
            return $.Deferred().resolve(files).promise();
        },

        _getFileInputFiles: function (fileInput) {
            if (!(fileInput instanceof $) || fileInput.length === 1) {
                return this._getSingleFileInputFiles(fileInput);
            }
            return $.when.apply(
                $,
                $.map(fileInput, this._getSingleFileInputFiles)
            ).pipe(function () {
                return Array.prototype.concat.apply(
                    [],
                    arguments
                );
            });
        },

        _onChange: function (e) {
            var that = e.data.fileupload,
                data = {
                    fileInput: $(e.target),
                    form: $(e.target.form)
                };
            that._getFileInputFiles(data.fileInput).always(function (files) {
                data.files = files;
                if (that.options.replaceFileInput) {
                    that._replaceFileInput(data.fileInput);
                }
                if (that._trigger('change', e, data) !== false) {
                    that._onAdd(e, data);
                }
            });
        },

        _onPaste: function (e) {
            var that = e.data.fileupload,
                cbd = e.originalEvent.clipboardData,
                items = (cbd && cbd.items) || [],
                data = {files: []};
            $.each(items, function (index, item) {
                var file = item.getAsFile && item.getAsFile();
                if (file) {
                    data.files.push(file);
                }
            });
            if (that._trigger('paste', e, data) === false ||
                    that._onAdd(e, data) === false) {
                return false;
            }
        },

        _onDrop: function (e) {
            e.preventDefault();
            var that = e.data.fileupload,
                dataTransfer = e.dataTransfer = e.originalEvent.dataTransfer,
                data = {};
            that._getDroppedFiles(dataTransfer).always(function (files) {
                data.files = files;
                if (that._trigger('drop', e, data) !== false) {
                    that._onAdd(e, data);
                }
            });
        },

        _onDragOver: function (e) {
            var that = e.data.fileupload,
                dataTransfer = e.dataTransfer = e.originalEvent.dataTransfer;
            if (that._trigger('dragover', e) === false) {
                return false;
            }
            if (dataTransfer) {
                dataTransfer.dropEffect = 'copy';
            }
            e.preventDefault();
        },

        _initEventHandlers: function () {
            var ns = this.options.namespace;
            if (this._isXHRUpload(this.options)) {
                this.options.dropZone
                    .bind('dragover.' + ns, {fileupload: this}, this._onDragOver)
                    .bind('drop.' + ns, {fileupload: this}, this._onDrop);
                this.options.pasteZone
                    .bind('paste.' + ns, {fileupload: this}, this._onPaste);
            }
            this.options.fileInput
                .bind('change.' + ns, {fileupload: this}, this._onChange);
        },

        _destroyEventHandlers: function () {
            var ns = this.options.namespace;
            this.options.dropZone
                .unbind('dragover.' + ns, this._onDragOver)
                .unbind('drop.' + ns, this._onDrop);
            this.options.pasteZone
                .unbind('paste.' + ns, this._onPaste);
            this.options.fileInput
                .unbind('change.' + ns, this._onChange);
        },

        _setOption: function (key, value) {
            var refresh = $.inArray(key, this._refreshOptionsList) !== -1;
            if (refresh) {
                this._destroyEventHandlers();
            }
            $.Widget.prototype._setOption.call(this, key, value);
            if (refresh) {
                this._initSpecialOptions();
                this._initEventHandlers();
            }
        },

        _initSpecialOptions: function () {
            var options = this.options;
            if (options.fileInput === undefined) {
                options.fileInput = this.element.is('input[type="file"]') ?
                        this.element : this.element.find('input[type="file"]');
            } else if (!(options.fileInput instanceof $)) {
                options.fileInput = $(options.fileInput);
            }
            if (!(options.dropZone instanceof $)) {
                options.dropZone = $(options.dropZone);
            }
            if (!(options.pasteZone instanceof $)) {
                options.pasteZone = $(options.pasteZone);
            }
        },

        _create: function () {
            var options = this.options;
            // Initialize options set via HTML5 data-attributes:
            $.extend(options, $(this.element[0].cloneNode(false)).data());
            options.namespace = options.namespace || this.widgetName;
            this._initSpecialOptions();
            this._slots = [];
            this._sequence = this._getXHRPromise(true);
            this._sending = this._active = this._loaded = this._total = 0;
            this._initEventHandlers();
        },

        destroy: function () {
            this._destroyEventHandlers();
            $.Widget.prototype.destroy.call(this);
        },

        enable: function () {
            var wasDisabled = false;
            if (this.options.disabled) {
                wasDisabled = true;
            }
            $.Widget.prototype.enable.call(this);
            if (wasDisabled) {
                this._initEventHandlers();
            }
        },

        disable: function () {
            if (!this.options.disabled) {
                this._destroyEventHandlers();
            }
            $.Widget.prototype.disable.call(this);
        },

        // This method is exposed to the widget API and allows adding files
        // using the fileupload API. The data parameter accepts an object which
        // must have a files property and can contain additional options:
        // .fileupload('add', {files: filesList});
        add: function (data) {
            var that = this;
            if (!data || this.options.disabled) {
                return;
            }
            if (data.fileInput && !data.files) {
                this._getFileInputFiles(data.fileInput).always(function (files) {
                    data.files = files;
                    that._onAdd(null, data);
                });
            } else {
                data.files = $.makeArray(data.files);
                this._onAdd(null, data);
            }
        },

        // This method is exposed to the widget API and allows sending files
        // using the fileupload API. The data parameter accepts an object which
        // must have a files or fileInput property and can contain additional options:
        // .fileupload('send', {files: filesList});
        // The method returns a Promise object for the file upload call.
        send: function (data) {
            if (data && !this.options.disabled) {
                if (data.fileInput && !data.files) {
                    var that = this,
                        dfd = $.Deferred(),
                        promise = dfd.promise(),
                        jqXHR,
                        aborted;
                    promise.abort = function () {
                        aborted = true;
                        if (jqXHR) {
                            return jqXHR.abort();
                        }
                        dfd.reject(null, 'abort', 'abort');
                        return promise;
                    };
                    this._getFileInputFiles(data.fileInput).always(
                        function (files) {
                            if (aborted) {
                                return;
                            }
                            data.files = files;
                            jqXHR = that._onSend(null, data).then(
                                function (result, textStatus, jqXHR) {
                                    dfd.resolve(result, textStatus, jqXHR);
                                },
                                function (jqXHR, textStatus, errorThrown) {
                                    dfd.reject(jqXHR, textStatus, errorThrown);
                                }
                            );
                        }
                    );
                    return this._enhancePromise(promise);
                }
                data.files = $.makeArray(data.files);
                if (data.files.length) {
                    return this._onSend(null, data);
                }
            }
            return this._getXHRPromise(false, data && data.context);
        }

    });

}));
;/*
 * jQuery Iframe Transport Plugin 1.5
 * https://github.com/blueimp/jQuery-File-Upload
 *
 * Copyright 2011, Sebastian Tschan
 * https://blueimp.net
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */

/*jslint unparam: true, nomen: true */
/*global define, window, document */

(function (factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        // Register as an anonymous AMD module:
        define(['jquery'], factory);
    } else {
        // Browser globals:
        factory(window.jQuery);
    }
}(function ($) {
    'use strict';

    // Helper variable to create unique names for the transport iframes:
    var counter = 0;

    // The iframe transport accepts three additional options:
    // options.fileInput: a jQuery collection of file input fields
    // options.paramName: the parameter name for the file form data,
    //  overrides the name property of the file input field(s),
    //  can be a string or an array of strings.
    // options.formData: an array of objects with name and value properties,
    //  equivalent to the return data of .serializeArray(), e.g.:
    //  [{name: 'a', value: 1}, {name: 'b', value: 2}]
    $.ajaxTransport('iframe', function (options) {
        if (options.async && (options.type === 'POST' || options.type === 'GET')) {
            var form,
                iframe;
            return {
                send: function (_, completeCallback) {
                    form = $('<form style="display:none;"></form>');
                    form.attr('accept-charset', options.formAcceptCharset);
                    // javascript:false as initial iframe src
                    // prevents warning popups on HTTPS in IE6.
                    // IE versions below IE8 cannot set the name property of
                    // elements that have already been added to the DOM,
                    // so we set the name along with the iframe HTML markup:
                    iframe = $(
                        '<iframe src="javascript:false;" name="iframe-transport-' +
                            (counter += 1) + '"></iframe>'
                    ).bind('load', function () {
                        var fileInputClones,
                            paramNames = $.isArray(options.paramName) ?
                                    options.paramName : [options.paramName];
                        iframe
                            .unbind('load')
                            .bind('load', function () {
                                var response;
                                // Wrap in a try/catch block to catch exceptions thrown
                                // when trying to access cross-domain iframe contents:
                                try {
                                    response = iframe.contents();
                                    // Google Chrome and Firefox do not throw an
                                    // exception when calling iframe.contents() on
                                    // cross-domain requests, so we unify the response:
                                    if (!response.length || !response[0].firstChild) {
                                        throw new Error();
                                    }
                                } catch (e) {
                                    response = undefined;
                                }
                                // The complete callback returns the
                                // iframe content document as response object:
                                completeCallback(
                                    200,
                                    'success',
                                    {'iframe': response}
                                );
                                // Fix for IE endless progress bar activity bug
                                // (happens on form submits to iframe targets):
                                $('<iframe src="javascript:false;"></iframe>')
                                    .appendTo(form);
                                form.remove();
                            });
                        form
                            .prop('target', iframe.prop('name'))
                            .prop('action', options.url)
                            .prop('method', options.type);
                        if (options.formData) {
                            $.each(options.formData, function (index, field) {
                                $('<input type="hidden"/>')
                                    .prop('name', field.name)
                                    .val(field.value)
                                    .appendTo(form);
                            });
                        }
                        if (options.fileInput && options.fileInput.length &&
                                options.type === 'POST') {
                            fileInputClones = options.fileInput.clone();
                            // Insert a clone for each file input field:
                            options.fileInput.after(function (index) {
                                return fileInputClones[index];
                            });
                            if (options.paramName) {
                                options.fileInput.each(function (index) {
                                    $(this).prop(
                                        'name',
                                        paramNames[index] || options.paramName
                                    );
                                });
                            }
                            // Appending the file input fields to the hidden form
                            // removes them from their original location:
                            form
                                .append(options.fileInput)
                                .prop('enctype', 'multipart/form-data')
                                // enctype must be set as encoding for IE:
                                .prop('encoding', 'multipart/form-data');
                        }
                        form.submit();
                        // Insert the file input fields at their original location
                        // by replacing the clones with the originals:
                        if (fileInputClones && fileInputClones.length) {
                            options.fileInput.each(function (index, input) {
                                var clone = $(fileInputClones[index]);
                                $(input).prop('name', clone.prop('name'));
                                clone.replaceWith(input);
                            });
                        }
                    });
                    form.append(iframe).appendTo(document.body);
                },
                abort: function () {
                    if (iframe) {
                        // javascript:false as iframe src aborts the request
                        // and prevents warning popups on HTTPS in IE6.
                        // concat is used to avoid the "Script URL" JSLint error:
                        iframe
                            .unbind('load')
                            .prop('src', 'javascript'.concat(':false;'));
                    }
                    if (form) {
                        form.remove();
                    }
                }
            };
        }
    });

    // The iframe transport returns the iframe content document as response.
    // The following adds converters from iframe to text, json, html, and script:
    $.ajaxSetup({
        converters: {
            'iframe text': function (iframe) {
                return $(iframe[0].body).text();
            },
            'iframe json': function (iframe) {
                return $.parseJSON($(iframe[0].body).text());
            },
            'iframe html': function (iframe) {
                return $(iframe[0].body).html();
            },
            'iframe script': function (iframe) {
                return $.globalEval($(iframe[0].body).text());
            }
        }
    });

}));
;/**
 * jquery.Jcrop.min.js v0.9.12 (build:20130202)
 * jQuery Image Cropping Plugin - released under MIT License
 * Copyright (c) 2008-2013 Tapmodo Interactive LLC
 * https://github.com/tapmodo/Jcrop
 */
(function(a){a.Jcrop=function(b,c){function i(a){return Math.round(a)+"px"}function j(a){return d.baseClass+"-"+a}function k(){return a.fx.step.hasOwnProperty("backgroundColor")}function l(b){var c=a(b).offset();return[c.left,c.top]}function m(a){return[a.pageX-e[0],a.pageY-e[1]]}function n(b){typeof b!="object"&&(b={}),d=a.extend(d,b),a.each(["onChange","onSelect","onRelease","onDblClick"],function(a,b){typeof d[b]!="function"&&(d[b]=function(){})})}function o(a,b,c){e=l(D),bc.setCursor(a==="move"?a:a+"-resize");if(a==="move")return bc.activateHandlers(q(b),v,c);var d=_.getFixed(),f=r(a),g=_.getCorner(r(f));_.setPressed(_.getCorner(f)),_.setCurrent(g),bc.activateHandlers(p(a,d),v,c)}function p(a,b){return function(c){if(!d.aspectRatio)switch(a){case"e":c[1]=b.y2;break;case"w":c[1]=b.y2;break;case"n":c[0]=b.x2;break;case"s":c[0]=b.x2}else switch(a){case"e":c[1]=b.y+1;break;case"w":c[1]=b.y+1;break;case"n":c[0]=b.x+1;break;case"s":c[0]=b.x+1}_.setCurrent(c),bb.update()}}function q(a){var b=a;return bd.watchKeys
(),function(a){_.moveOffset([a[0]-b[0],a[1]-b[1]]),b=a,bb.update()}}function r(a){switch(a){case"n":return"sw";case"s":return"nw";case"e":return"nw";case"w":return"ne";case"ne":return"sw";case"nw":return"se";case"se":return"nw";case"sw":return"ne"}}function s(a){return function(b){return d.disabled?!1:a==="move"&&!d.allowMove?!1:(e=l(D),W=!0,o(a,m(b)),b.stopPropagation(),b.preventDefault(),!1)}}function t(a,b,c){var d=a.width(),e=a.height();d>b&&b>0&&(d=b,e=b/a.width()*a.height()),e>c&&c>0&&(e=c,d=c/a.height()*a.width()),T=a.width()/d,U=a.height()/e,a.width(d).height(e)}function u(a){return{x:a.x*T,y:a.y*U,x2:a.x2*T,y2:a.y2*U,w:a.w*T,h:a.h*U}}function v(a){var b=_.getFixed();b.w>d.minSelect[0]&&b.h>d.minSelect[1]?(bb.enableHandles(),bb.done()):bb.release(),bc.setCursor(d.allowSelect?"crosshair":"default")}function w(a){if(d.disabled)return!1;if(!d.allowSelect)return!1;W=!0,e=l(D),bb.disableHandles(),bc.setCursor("crosshair");var b=m(a);return _.setPressed(b),bb.update(),bc.activateHandlers(x,v,a.type.substring
(0,5)==="touch"),bd.watchKeys(),a.stopPropagation(),a.preventDefault(),!1}function x(a){_.setCurrent(a),bb.update()}function y(){var b=a("<div></div>").addClass(j("tracker"));return g&&b.css({opacity:0,backgroundColor:"white"}),b}function be(a){G.removeClass().addClass(j("holder")).addClass(a)}function bf(a,b){function t(){window.setTimeout(u,l)}var c=a[0]/T,e=a[1]/U,f=a[2]/T,g=a[3]/U;if(X)return;var h=_.flipCoords(c,e,f,g),i=_.getFixed(),j=[i.x,i.y,i.x2,i.y2],k=j,l=d.animationDelay,m=h[0]-j[0],n=h[1]-j[1],o=h[2]-j[2],p=h[3]-j[3],q=0,r=d.swingSpeed;c=k[0],e=k[1],f=k[2],g=k[3],bb.animMode(!0);var s,u=function(){return function(){q+=(100-q)/r,k[0]=Math.round(c+q/100*m),k[1]=Math.round(e+q/100*n),k[2]=Math.round(f+q/100*o),k[3]=Math.round(g+q/100*p),q>=99.8&&(q=100),q<100?(bh(k),t()):(bb.done(),bb.animMode(!1),typeof b=="function"&&b.call(bs))}}();t()}function bg(a){bh([a[0]/T,a[1]/U,a[2]/T,a[3]/U]),d.onSelect.call(bs,u(_.getFixed())),bb.enableHandles()}function bh(a){_.setPressed([a[0],a[1]]),_.setCurrent([a[2],
a[3]]),bb.update()}function bi(){return u(_.getFixed())}function bj(){return _.getFixed()}function bk(a){n(a),br()}function bl(){d.disabled=!0,bb.disableHandles(),bb.setCursor("default"),bc.setCursor("default")}function bm(){d.disabled=!1,br()}function bn(){bb.done(),bc.activateHandlers(null,null)}function bo(){G.remove(),A.show(),A.css("visibility","visible"),a(b).removeData("Jcrop")}function bp(a,b){bb.release(),bl();var c=new Image;c.onload=function(){var e=c.width,f=c.height,g=d.boxWidth,h=d.boxHeight;D.width(e).height(f),D.attr("src",a),H.attr("src",a),t(D,g,h),E=D.width(),F=D.height(),H.width(E).height(F),M.width(E+L*2).height(F+L*2),G.width(E).height(F),ba.resize(E,F),bm(),typeof b=="function"&&b.call(bs)},c.src=a}function bq(a,b,c){var e=b||d.bgColor;d.bgFade&&k()&&d.fadeTime&&!c?a.animate({backgroundColor:e},{queue:!1,duration:d.fadeTime}):a.css("backgroundColor",e)}function br(a){d.allowResize?a?bb.enableOnly():bb.enableHandles():bb.disableHandles(),bc.setCursor(d.allowSelect?"crosshair":"default"),bb
.setCursor(d.allowMove?"move":"default"),d.hasOwnProperty("trueSize")&&(T=d.trueSize[0]/E,U=d.trueSize[1]/F),d.hasOwnProperty("setSelect")&&(bg(d.setSelect),bb.done(),delete d.setSelect),ba.refresh(),d.bgColor!=N&&(bq(d.shade?ba.getShades():G,d.shade?d.shadeColor||d.bgColor:d.bgColor),N=d.bgColor),O!=d.bgOpacity&&(O=d.bgOpacity,d.shade?ba.refresh():bb.setBgOpacity(O)),P=d.maxSize[0]||0,Q=d.maxSize[1]||0,R=d.minSize[0]||0,S=d.minSize[1]||0,d.hasOwnProperty("outerImage")&&(D.attr("src",d.outerImage),delete d.outerImage),bb.refresh()}var d=a.extend({},a.Jcrop.defaults),e,f=navigator.userAgent.toLowerCase(),g=/msie/.test(f),h=/msie [1-6]\./.test(f);typeof b!="object"&&(b=a(b)[0]),typeof c!="object"&&(c={}),n(c);var z={border:"none",visibility:"visible",margin:0,padding:0,position:"absolute",top:0,left:0},A=a(b),B=!0;if(b.tagName=="IMG"){if(A[0].width!=0&&A[0].height!=0)A.width(A[0].width),A.height(A[0].height);else{var C=new Image;C.src=A[0].src,A.width(C.width),A.height(C.height)}var D=A.clone().removeAttr("id").
css(z).show();D.width(A.width()),D.height(A.height()),A.after(D).hide()}else D=A.css(z).show(),B=!1,d.shade===null&&(d.shade=!0);t(D,d.boxWidth,d.boxHeight);var E=D.width(),F=D.height(),G=a("<div />").width(E).height(F).addClass(j("holder")).css({position:"relative",backgroundColor:d.bgColor}).insertAfter(A).append(D);d.addClass&&G.addClass(d.addClass);var H=a("<div />"),I=a("<div />").width("100%").height("100%").css({zIndex:310,position:"absolute",overflow:"hidden"}),J=a("<div />").width("100%").height("100%").css("zIndex",320),K=a("<div />").css({position:"absolute",zIndex:600}).dblclick(function(){var a=_.getFixed();d.onDblClick.call(bs,a)}).insertBefore(D).append(I,J);B&&(H=a("<img />").attr("src",D.attr("src")).css(z).width(E).height(F),I.append(H)),h&&K.css({overflowY:"hidden"});var L=d.boundary,M=y().width(E+L*2).height(F+L*2).css({position:"absolute",top:i(-L),left:i(-L),zIndex:290}).mousedown(w),N=d.bgColor,O=d.bgOpacity,P,Q,R,S,T,U,V=!0,W,X,Y;e=l(D);var Z=function(){function a(){var a={},b=["touchstart"
,"touchmove","touchend"],c=document.createElement("div"),d;try{for(d=0;d<b.length;d++){var e=b[d];e="on"+e;var f=e in c;f||(c.setAttribute(e,"return;"),f=typeof c[e]=="function"),a[b[d]]=f}return a.touchstart&&a.touchend&&a.touchmove}catch(g){return!1}}function b(){return d.touchSupport===!0||d.touchSupport===!1?d.touchSupport:a()}return{createDragger:function(a){return function(b){return d.disabled?!1:a==="move"&&!d.allowMove?!1:(e=l(D),W=!0,o(a,m(Z.cfilter(b)),!0),b.stopPropagation(),b.preventDefault(),!1)}},newSelection:function(a){return w(Z.cfilter(a))},cfilter:function(a){return a.pageX=a.originalEvent.changedTouches[0].pageX,a.pageY=a.originalEvent.changedTouches[0].pageY,a},isSupported:a,support:b()}}(),_=function(){function h(d){d=n(d),c=a=d[0],e=b=d[1]}function i(a){a=n(a),f=a[0]-c,g=a[1]-e,c=a[0],e=a[1]}function j(){return[f,g]}function k(d){var f=d[0],g=d[1];0>a+f&&(f-=f+a),0>b+g&&(g-=g+b),F<e+g&&(g+=F-(e+g)),E<c+f&&(f+=E-(c+f)),a+=f,c+=f,b+=g,e+=g}function l(a){var b=m();switch(a){case"ne":return[
b.x2,b.y];case"nw":return[b.x,b.y];case"se":return[b.x2,b.y2];case"sw":return[b.x,b.y2]}}function m(){if(!d.aspectRatio)return p();var f=d.aspectRatio,g=d.minSize[0]/T,h=d.maxSize[0]/T,i=d.maxSize[1]/U,j=c-a,k=e-b,l=Math.abs(j),m=Math.abs(k),n=l/m,r,s,t,u;return h===0&&(h=E*10),i===0&&(i=F*10),n<f?(s=e,t=m*f,r=j<0?a-t:t+a,r<0?(r=0,u=Math.abs((r-a)/f),s=k<0?b-u:u+b):r>E&&(r=E,u=Math.abs((r-a)/f),s=k<0?b-u:u+b)):(r=c,u=l/f,s=k<0?b-u:b+u,s<0?(s=0,t=Math.abs((s-b)*f),r=j<0?a-t:t+a):s>F&&(s=F,t=Math.abs(s-b)*f,r=j<0?a-t:t+a)),r>a?(r-a<g?r=a+g:r-a>h&&(r=a+h),s>b?s=b+(r-a)/f:s=b-(r-a)/f):r<a&&(a-r<g?r=a-g:a-r>h&&(r=a-h),s>b?s=b+(a-r)/f:s=b-(a-r)/f),r<0?(a-=r,r=0):r>E&&(a-=r-E,r=E),s<0?(b-=s,s=0):s>F&&(b-=s-F,s=F),q(o(a,b,r,s))}function n(a){return a[0]<0&&(a[0]=0),a[1]<0&&(a[1]=0),a[0]>E&&(a[0]=E),a[1]>F&&(a[1]=F),[Math.round(a[0]),Math.round(a[1])]}function o(a,b,c,d){var e=a,f=c,g=b,h=d;return c<a&&(e=c,f=a),d<b&&(g=d,h=b),[e,g,f,h]}function p(){var d=c-a,f=e-b,g;return P&&Math.abs(d)>P&&(c=d>0?a+P:a-P),Q&&Math.abs
(f)>Q&&(e=f>0?b+Q:b-Q),S/U&&Math.abs(f)<S/U&&(e=f>0?b+S/U:b-S/U),R/T&&Math.abs(d)<R/T&&(c=d>0?a+R/T:a-R/T),a<0&&(c-=a,a-=a),b<0&&(e-=b,b-=b),c<0&&(a-=c,c-=c),e<0&&(b-=e,e-=e),c>E&&(g=c-E,a-=g,c-=g),e>F&&(g=e-F,b-=g,e-=g),a>E&&(g=a-F,e-=g,b-=g),b>F&&(g=b-F,e-=g,b-=g),q(o(a,b,c,e))}function q(a){return{x:a[0],y:a[1],x2:a[2],y2:a[3],w:a[2]-a[0],h:a[3]-a[1]}}var a=0,b=0,c=0,e=0,f,g;return{flipCoords:o,setPressed:h,setCurrent:i,getOffset:j,moveOffset:k,getCorner:l,getFixed:m}}(),ba=function(){function f(a,b){e.left.css({height:i(b)}),e.right.css({height:i(b)})}function g(){return h(_.getFixed())}function h(a){e.top.css({left:i(a.x),width:i(a.w),height:i(a.y)}),e.bottom.css({top:i(a.y2),left:i(a.x),width:i(a.w),height:i(F-a.y2)}),e.right.css({left:i(a.x2),width:i(E-a.x2)}),e.left.css({width:i(a.x)})}function j(){return a("<div />").css({position:"absolute",backgroundColor:d.shadeColor||d.bgColor}).appendTo(c)}function k(){b||(b=!0,c.insertBefore(D),g(),bb.setBgOpacity(1,0,1),H.hide(),l(d.shadeColor||d.bgColor,1),bb.
isAwake()?n(d.bgOpacity,1):n(1,1))}function l(a,b){bq(p(),a,b)}function m(){b&&(c.remove(),H.show(),b=!1,bb.isAwake()?bb.setBgOpacity(d.bgOpacity,1,1):(bb.setBgOpacity(1,1,1),bb.disableHandles()),bq(G,0,1))}function n(a,e){b&&(d.bgFade&&!e?c.animate({opacity:1-a},{queue:!1,duration:d.fadeTime}):c.css({opacity:1-a}))}function o(){d.shade?k():m(),bb.isAwake()&&n(d.bgOpacity)}function p(){return c.children()}var b=!1,c=a("<div />").css({position:"absolute",zIndex:240,opacity:0}),e={top:j(),left:j().height(F),right:j().height(F),bottom:j()};return{update:g,updateRaw:h,getShades:p,setBgColor:l,enable:k,disable:m,resize:f,refresh:o,opacity:n}}(),bb=function(){function k(b){var c=a("<div />").css({position:"absolute",opacity:d.borderOpacity}).addClass(j(b));return I.append(c),c}function l(b,c){var d=a("<div />").mousedown(s(b)).css({cursor:b+"-resize",position:"absolute",zIndex:c}).addClass("ord-"+b);return Z.support&&d.bind("touchstart.jcrop",Z.createDragger(b)),J.append(d),d}function m(a){var b=d.handleSize,e=l(a,c++
).css({opacity:d.handleOpacity}).addClass(j("handle"));return b&&e.width(b).height(b),e}function n(a){return l(a,c++).addClass("jcrop-dragbar")}function o(a){var b;for(b=0;b<a.length;b++)g[a[b]]=n(a[b])}function p(a){var b,c;for(c=0;c<a.length;c++){switch(a[c]){case"n":b="hline";break;case"s":b="hline bottom";break;case"e":b="vline right";break;case"w":b="vline"}e[a[c]]=k(b)}}function q(a){var b;for(b=0;b<a.length;b++)f[a[b]]=m(a[b])}function r(a,b){d.shade||H.css({top:i(-b),left:i(-a)}),K.css({top:i(b),left:i(a)})}function t(a,b){K.width(Math.round(a)).height(Math.round(b))}function v(){var a=_.getFixed();_.setPressed([a.x,a.y]),_.setCurrent([a.x2,a.y2]),w()}function w(a){if(b)return x(a)}function x(a){var c=_.getFixed();t(c.w,c.h),r(c.x,c.y),d.shade&&ba.updateRaw(c),b||A(),a?d.onSelect.call(bs,u(c)):d.onChange.call(bs,u(c))}function z(a,c,e){if(!b&&!c)return;d.bgFade&&!e?D.animate({opacity:a},{queue:!1,duration:d.fadeTime}):D.css("opacity",a)}function A(){K.show(),d.shade?ba.opacity(O):z(O,!0),b=!0}function B
(){F(),K.hide(),d.shade?ba.opacity(1):z(1),b=!1,d.onRelease.call(bs)}function C(){h&&J.show()}function E(){h=!0;if(d.allowResize)return J.show(),!0}function F(){h=!1,J.hide()}function G(a){a?(X=!0,F()):(X=!1,E())}function L(){G(!1),v()}var b,c=370,e={},f={},g={},h=!1;d.dragEdges&&a.isArray(d.createDragbars)&&o(d.createDragbars),a.isArray(d.createHandles)&&q(d.createHandles),d.drawBorders&&a.isArray(d.createBorders)&&p(d.createBorders),a(document).bind("touchstart.jcrop-ios",function(b){a(b.currentTarget).hasClass("jcrop-tracker")&&b.stopPropagation()});var M=y().mousedown(s("move")).css({cursor:"move",position:"absolute",zIndex:360});return Z.support&&M.bind("touchstart.jcrop",Z.createDragger("move")),I.append(M),F(),{updateVisible:w,update:x,release:B,refresh:v,isAwake:function(){return b},setCursor:function(a){M.css("cursor",a)},enableHandles:E,enableOnly:function(){h=!0},showHandles:C,disableHandles:F,animMode:G,setBgOpacity:z,done:L}}(),bc=function(){function f(b){M.css({zIndex:450}),b?a(document).bind("touchmove.jcrop"
,k).bind("touchend.jcrop",l):e&&a(document).bind("mousemove.jcrop",h).bind("mouseup.jcrop",i)}function g(){M.css({zIndex:290}),a(document).unbind(".jcrop")}function h(a){return b(m(a)),!1}function i(a){return a.preventDefault(),a.stopPropagation(),W&&(W=!1,c(m(a)),bb.isAwake()&&d.onSelect.call(bs,u(_.getFixed())),g(),b=function(){},c=function(){}),!1}function j(a,d,e){return W=!0,b=a,c=d,f(e),!1}function k(a){return b(m(Z.cfilter(a))),!1}function l(a){return i(Z.cfilter(a))}function n(a){M.css("cursor",a)}var b=function(){},c=function(){},e=d.trackDocument;return e||M.mousemove(h).mouseup(i).mouseout(i),D.before(M),{activateHandlers:j,setCursor:n}}(),bd=function(){function e(){d.keySupport&&(b.show(),b.focus())}function f(a){b.hide()}function g(a,b,c){d.allowMove&&(_.moveOffset([b,c]),bb.updateVisible(!0)),a.preventDefault(),a.stopPropagation()}function i(a){if(a.ctrlKey||a.metaKey)return!0;Y=a.shiftKey?!0:!1;var b=Y?10:1;switch(a.keyCode){case 37:g(a,-b,0);break;case 39:g(a,b,0);break;case 38:g(a,0,-b);break;
case 40:g(a,0,b);break;case 27:d.allowSelect&&bb.release();break;case 9:return!0}return!1}var b=a('<input type="radio" />').css({position:"fixed",left:"-120px",width:"12px"}).addClass("jcrop-keymgr"),c=a("<div />").css({position:"absolute",overflow:"hidden"}).append(b);return d.keySupport&&(b.keydown(i).blur(f),h||!d.fixedSupport?(b.css({position:"absolute",left:"-20px"}),c.append(b).insertBefore(D)):b.insertBefore(D)),{watchKeys:e}}();Z.support&&M.bind("touchstart.jcrop",Z.newSelection),J.hide(),br(!0);var bs={setImage:bp,animateTo:bf,setSelect:bg,setOptions:bk,tellSelect:bi,tellScaled:bj,setClass:be,disable:bl,enable:bm,cancel:bn,release:bb.release,destroy:bo,focus:bd.watchKeys,getBounds:function(){return[E*T,F*U]},getWidgetSize:function(){return[E,F]},getScaleFactor:function(){return[T,U]},getOptions:function(){return d},ui:{holder:G,selection:K}};return g&&G.bind("selectstart",function(){return!1}),A.data("Jcrop",bs),bs},a.fn.Jcrop=function(b,c){var d;return this.each(function(){if(a(this).data("Jcrop")){if(
b==="api")return a(this).data("Jcrop");a(this).data("Jcrop").setOptions(b)}else this.tagName=="IMG"?a.Jcrop.Loader(this,function(){a(this).css({display:"block",visibility:"hidden"}),d=a.Jcrop(this,b),a.isFunction(c)&&c.call(d)}):(a(this).css({display:"block",visibility:"hidden"}),d=a.Jcrop(this,b),a.isFunction(c)&&c.call(d))}),this},a.Jcrop.Loader=function(b,c,d){function g(){f.complete?(e.unbind(".jcloader"),a.isFunction(c)&&c.call(f)):window.setTimeout(g,50)}var e=a(b),f=e[0];e.bind("load.jcloader",g).bind("error.jcloader",function(b){e.unbind(".jcloader"),a.isFunction(d)&&d.call(f)}),f.complete&&a.isFunction(c)&&(e.unbind(".jcloader"),c.call(f))},a.Jcrop.defaults={allowSelect:!0,allowMove:!0,allowResize:!0,trackDocument:!0,baseClass:"jcrop",addClass:null,bgColor:"black",bgOpacity:.6,bgFade:!1,borderOpacity:.4,handleOpacity:.5,handleSize:null,aspectRatio:0,keySupport:!0,createHandles:["n","s","e","w","nw","ne","se","sw"],createDragbars:["n","s","e","w"],createBorders:["n","s","e","w"],drawBorders:!0,dragEdges
:!0,fixedSupport:!0,touchSupport:null,shade:null,boxWidth:0,boxHeight:0,boundary:2,fadeTime:400,animationDelay:20,swingSpeed:3,minSelect:[0,0],maxSize:[0,0],minSize:[0,0],onChange:function(){},onSelect:function(){},onDblClick:function(){},onRelease:function(){}}})(jQuery);;/*
 * JavaScript Load Image 1.2.2
 * https://github.com/blueimp/JavaScript-Load-Image
 *
 * Copyright 2011, Sebastian Tschan
 * https://blueimp.net
 *
 * iOS image scaling fixes based on
 * https://github.com/stomita/ios-imagefile-megapixel
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */

/*jslint nomen: true, bitwise: true */
/*global window, document, URL, webkitURL, Blob, File, FileReader, define */

(function ($) {
    'use strict';

    // Loads an image for a given File object.
    // Invokes the callback with an img or optional canvas
    // element (if supported by the browser) as parameter:
    var loadImage = function (file, callback, options) {
            var img = document.createElement('img'),
                url,
                oUrl,
                date = new Date();
            img.onerror = callback;
            img.onload = function () {
                if (oUrl && !(options && options.noRevoke)) {
                    loadImage.revokeObjectURL(oUrl);
                }
                callback(loadImage.scale(img, options));
            };
            if ((window.Blob && file instanceof Blob) ||
                // Files are also Blob instances, but some browsers
                // (Firefox 3.6) support the File API but not Blobs:
                    (window.File && file instanceof File)) {
                url = oUrl = loadImage.createObjectURL(file);
                // Store the file type for resize processing:
                img._type = file.type;
            } else {
                url = file;
            }
            url += '?_'+date.getTime();
            if (url) {
                img.src = url;
                return img;
            }
            return loadImage.readFile(file, function (url) {
                img.src = url;
            });
        },
        // The check for URL.revokeObjectURL fixes an issue with Opera 12,
        // which provides URL.createObjectURL but doesn't properly implement it:
        urlAPI = (window.createObjectURL && window) ||
            (window.URL && URL.revokeObjectURL && URL) ||
            (window.webkitURL && webkitURL);

    // Detects subsampling in JPEG images:
    loadImage.detectSubsampling = function (img) {
        var iw = img.width,
            ih = img.height,
            canvas,
            ctx;
            
        if (iw * ih > 1024 * 1024) { // only consider mexapixel images
            canvas = document.createElement('canvas');
            canvas.width = canvas.height = 1;
            ctx = canvas.getContext('2d');
            ctx.drawImage(img, -iw + 1, 0);
            // subsampled image becomes half smaller in rendering size.
            // check alpha channel value to confirm image is covering edge pixel or not.
            // if alpha value is 0 image is not covering, hence subsampled.
            return ctx.getImageData(0, 0, 1, 1).data[3] === 0;
        }
        return false;
    };

    // Detects vertical squash in JPEG images:
    loadImage.detectVerticalSquash = function (img, ih) {
        var canvas = document.createElement('canvas'),
            ctx = canvas.getContext('2d'),
            data,
            sy,
            ey,
            py,
            alpha;
        canvas.width = 1;
        canvas.height = ih;
        ctx.drawImage(img, 0, 0);
        data = ctx.getImageData(0, 0, 1, ih).data;
        // search image edge pixel position in case it is squashed vertically:
        sy = 0;
        ey = ih;
        py = ih;
        while (py > sy) {
            alpha = data[(py - 1) * 4 + 3];
            if (alpha === 0) {
                ey = py;
            } else {
                sy = py;
            }
            py = (ey + sy) >> 1;
        }
        return py / ih;
    };

    // Renders image to canvas while working around iOS image scaling bugs:
    // https://github.com/blueimp/JavaScript-Load-Image/issues/13
    loadImage.renderImageToCanvas = function (img, canvas, width, height) {
        var iw = img.width,
            ih = img.height,
            ctx = canvas.getContext('2d'),
            vertSquashRatio,
            d = 1024, // size of tiling canvas
            tmpCanvas = document.createElement('canvas'),
            tmpCtx,
            sy,
            sh,
            sx,
            sw;
        ctx.save();
        if (loadImage.detectSubsampling(img)) {
            iw /= 2;
            ih /= 2;
        }
        vertSquashRatio = loadImage.detectVerticalSquash(img, ih);
        tmpCanvas.width = tmpCanvas.height = d;
        tmpCtx = tmpCanvas.getContext('2d');
        sy = 0;
        while (sy < ih) {
            sh = sy + d > ih ? ih - sy : d;
            sx = 0;
            while (sx < iw) {
                sw = sx + d > iw ? iw - sx : d;
                tmpCtx.clearRect(0, 0, d, d);
                tmpCtx.drawImage(img, -sx, -sy);
                ctx.drawImage(
                    tmpCanvas,
                    0,
                    0,
                    sw,
                    sh,
                    Math.floor(sx * width / iw),
                    Math.floor(sy * height / ih / vertSquashRatio),
                    Math.ceil(sw * width / iw),
                    Math.ceil(sh * height / ih / vertSquashRatio)
                );
                sx += d;
            }
            sy += d;
        }
        ctx.restore();
        tmpCanvas = tmpCtx = null;
    };

    // Scales the given image (img or canvas HTML element)
    // using the given options.
    // Returns a canvas object if the browser supports canvas
    // and the canvas option is true or a canvas object is passed
    // as image, else the scaled image:
    loadImage.scale = function (img, options) {
        options = options || {};
        var canvas = document.createElement('canvas'),
            width = img.width,
            height = img.height,
            scale = Math.max(
                (options.minWidth || width) / width,
                (options.minHeight || height) / height
            );
        if (scale > 1) {
            width = parseInt(width * scale, 10);
            height = parseInt(height * scale, 10);
        }
        scale = Math.min(
            (options.maxWidth || width) / width,
            (options.maxHeight || height) / height
        );
        if (scale < 1) {
            width = parseInt(width * scale, 10);
            height = parseInt(height * scale, 10);
        }
        if (img.getContext || (options.canvas && canvas.getContext)) {
            canvas.width = width;
            canvas.height = height;
            if (img._type === 'image/jpeg') {
                loadImage
                    .renderImageToCanvas(img, canvas, width, height);
            } else {
                canvas.getContext('2d')
                    .drawImage(img, 0, 0, width, height);
            }
            return canvas;
        }
        
        return img;
    };

    loadImage.createObjectURL = function (file) {
        return urlAPI ? urlAPI.createObjectURL(file) : false;
    };

    loadImage.revokeObjectURL = function (url) {
        return urlAPI ? urlAPI.revokeObjectURL(url) : false;
    };

    // Loads a given File object via FileReader interface,
    // invokes the callback with a data url:
    loadImage.readFile = function (file, callback) {
        if (window.FileReader && FileReader.prototype.readAsDataURL) {
            var fileReader = new FileReader();
            fileReader.onload = function (e) {
                callback(e.target.result);
            };
            fileReader.readAsDataURL(file);
            return fileReader;
        }
        return false;
    };

    $.loadImage = loadImage;
    
}(this));
;/*!
 * jQuery UI 1.8.24
 *
 * Copyright 2012, AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * http://docs.jquery.com/UI
 */
(function( $, undefined ) {

// prevent duplicate loading
// this is only a problem because we proxy existing functions
// and we don't want to double proxy them
$.ui = $.ui || {};
if ( $.ui.version ) {
	return;
}

$.extend( $.ui, {
	version: "1.8.24",

	keyCode: {
		ALT: 18,
		BACKSPACE: 8,
		CAPS_LOCK: 20,
		COMMA: 188,
		COMMAND: 91,
		COMMAND_LEFT: 91, // COMMAND
		COMMAND_RIGHT: 93,
		CONTROL: 17,
		DELETE: 46,
		DOWN: 40,
		END: 35,
		ENTER: 13,
		ESCAPE: 27,
		HOME: 36,
		INSERT: 45,
		LEFT: 37,
		MENU: 93, // COMMAND_RIGHT
		NUMPAD_ADD: 107,
		NUMPAD_DECIMAL: 110,
		NUMPAD_DIVIDE: 111,
		NUMPAD_ENTER: 108,
		NUMPAD_MULTIPLY: 106,
		NUMPAD_SUBTRACT: 109,
		PAGE_DOWN: 34,
		PAGE_UP: 33,
		PERIOD: 190,
		RIGHT: 39,
		SHIFT: 16,
		SPACE: 32,
		TAB: 9,
		UP: 38,
		WINDOWS: 91 // COMMAND
	}
});

// plugins
$.fn.extend({
	propAttr: $.fn.prop || $.fn.attr,

	_focus: $.fn.focus,
	focus: function( delay, fn ) {
		return typeof delay === "number" ?
			this.each(function() {
				var elem = this;
				setTimeout(function() {
					$( elem ).focus();
					if ( fn ) {
						fn.call( elem );
					}
				}, delay );
			}) :
			this._focus.apply( this, arguments );
	},

	scrollParent: function() {
		var scrollParent;
		if (($.browser.msie && (/(static|relative)/).test(this.css('position'))) || (/absolute/).test(this.css('position'))) {
			scrollParent = this.parents().filter(function() {
				return (/(relative|absolute|fixed)/).test($.curCSS(this,'position',1)) && (/(auto|scroll)/).test($.curCSS(this,'overflow',1)+$.curCSS(this,'overflow-y',1)+$.curCSS(this,'overflow-x',1));
			}).eq(0);
		} else {
			scrollParent = this.parents().filter(function() {
				return (/(auto|scroll)/).test($.curCSS(this,'overflow',1)+$.curCSS(this,'overflow-y',1)+$.curCSS(this,'overflow-x',1));
			}).eq(0);
		}

		return (/fixed/).test(this.css('position')) || !scrollParent.length ? $(document) : scrollParent;
	},

	zIndex: function( zIndex ) {
		if ( zIndex !== undefined ) {
			return this.css( "zIndex", zIndex );
		}

		if ( this.length ) {
			var elem = $( this[ 0 ] ), position, value;
			while ( elem.length && elem[ 0 ] !== document ) {
				// Ignore z-index if position is set to a value where z-index is ignored by the browser
				// This makes behavior of this function consistent across browsers
				// WebKit always returns auto if the element is positioned
				position = elem.css( "position" );
				if ( position === "absolute" || position === "relative" || position === "fixed" ) {
					// IE returns 0 when zIndex is not specified
					// other browsers return a string
					// we ignore the case of nested elements with an explicit value of 0
					// <div style="z-index: -10;"><div style="z-index: 0;"></div></div>
					value = parseInt( elem.css( "zIndex" ), 10 );
					if ( !isNaN( value ) && value !== 0 ) {
						return value;
					}
				}
				elem = elem.parent();
			}
		}

		return 0;
	},

	disableSelection: function() {
		return this.bind( ( $.support.selectstart ? "selectstart" : "mousedown" ) +
			".ui-disableSelection", function( event ) {
				event.preventDefault();
			});
	},

	enableSelection: function() {
		return this.unbind( ".ui-disableSelection" );
	}
});

// support: jQuery <1.8
if ( !$( "<a>" ).outerWidth( 1 ).jquery ) {
	$.each( [ "Width", "Height" ], function( i, name ) {
		var side = name === "Width" ? [ "Left", "Right" ] : [ "Top", "Bottom" ],
			type = name.toLowerCase(),
			orig = {
				innerWidth: $.fn.innerWidth,
				innerHeight: $.fn.innerHeight,
				outerWidth: $.fn.outerWidth,
				outerHeight: $.fn.outerHeight
			};

		function reduce( elem, size, border, margin ) {
			$.each( side, function() {
				size -= parseFloat( $.curCSS( elem, "padding" + this, true) ) || 0;
				if ( border ) {
					size -= parseFloat( $.curCSS( elem, "border" + this + "Width", true) ) || 0;
				}
				if ( margin ) {
					size -= parseFloat( $.curCSS( elem, "margin" + this, true) ) || 0;
				}
			});
			return size;
		}

		$.fn[ "inner" + name ] = function( size ) {
			if ( size === undefined ) {
				return orig[ "inner" + name ].call( this );
			}

			return this.each(function() {
				$( this ).css( type, reduce( this, size ) + "px" );
			});
		};

		$.fn[ "outer" + name] = function( size, margin ) {
			if ( typeof size !== "number" ) {
				return orig[ "outer" + name ].call( this, size );
			}

			return this.each(function() {
				$( this).css( type, reduce( this, size, true, margin ) + "px" );
			});
		};
	});
}

// selectors
function focusable( element, isTabIndexNotNaN ) {
	var nodeName = element.nodeName.toLowerCase();
	if ( "area" === nodeName ) {
		var map = element.parentNode,
			mapName = map.name,
			img;
		if ( !element.href || !mapName || map.nodeName.toLowerCase() !== "map" ) {
			return false;
		}
		img = $( "img[usemap=#" + mapName + "]" )[0];
		return !!img && visible( img );
	}
	return ( /input|select|textarea|button|object/.test( nodeName )
		? !element.disabled
		: "a" == nodeName
			? element.href || isTabIndexNotNaN
			: isTabIndexNotNaN)
		// the element and all of its ancestors must be visible
		&& visible( element );
}

function visible( element ) {
	return !$( element ).parents().andSelf().filter(function() {
		return $.curCSS( this, "visibility" ) === "hidden" ||
			$.expr.filters.hidden( this );
	}).length;
}

$.extend( $.expr[ ":" ], {
	data: $.expr.createPseudo ?
		$.expr.createPseudo(function( dataName ) {
			return function( elem ) {
				return !!$.data( elem, dataName );
			};
		}) :
		// support: jQuery <1.8
		function( elem, i, match ) {
			return !!$.data( elem, match[ 3 ] );
		},

	focusable: function( element ) {
		return focusable( element, !isNaN( $.attr( element, "tabindex" ) ) );
	},

	tabbable: function( element ) {
		var tabIndex = $.attr( element, "tabindex" ),
			isTabIndexNaN = isNaN( tabIndex );
		return ( isTabIndexNaN || tabIndex >= 0 ) && focusable( element, !isTabIndexNaN );
	}
});

// support
$(function() {
	var body = document.body,
		div = body.appendChild( div = document.createElement( "div" ) );

	// access offsetHeight before setting the style to prevent a layout bug
	// in IE 9 which causes the elemnt to continue to take up space even
	// after it is removed from the DOM (#8026)
	div.offsetHeight;

	$.extend( div.style, {
		minHeight: "100px",
		height: "auto",
		padding: 0,
		borderWidth: 0
	});

	$.support.minHeight = div.offsetHeight === 100;
	$.support.selectstart = "onselectstart" in div;

	// set display to none to avoid a layout bug in IE
	// http://dev.jquery.com/ticket/4014
	body.removeChild( div ).style.display = "none";
});

// jQuery <1.4.3 uses curCSS, in 1.4.3 - 1.7.2 curCSS = css, 1.8+ only has css
if ( !$.curCSS ) {
	$.curCSS = $.css;
}





// deprecated
$.extend( $.ui, {
	// $.ui.plugin is deprecated.  Use the proxy pattern instead.
	plugin: {
		add: function( module, option, set ) {
			var proto = $.ui[ module ].prototype;
			for ( var i in set ) {
				proto.plugins[ i ] = proto.plugins[ i ] || [];
				proto.plugins[ i ].push( [ option, set[ i ] ] );
			}
		},
		call: function( instance, name, args ) {
			var set = instance.plugins[ name ];
			if ( !set || !instance.element[ 0 ].parentNode ) {
				return;
			}
	
			for ( var i = 0; i < set.length; i++ ) {
				if ( instance.options[ set[ i ][ 0 ] ] ) {
					set[ i ][ 1 ].apply( instance.element, args );
				}
			}
		}
	},
	
	// will be deprecated when we switch to jQuery 1.4 - use jQuery.contains()
	contains: function( a, b ) {
		return document.compareDocumentPosition ?
			a.compareDocumentPosition( b ) & 16 :
			a !== b && a.contains( b );
	},
	
	// only used by resizable
	hasScroll: function( el, a ) {
	
		//If overflow is hidden, the element might have extra content, but the user wants to hide it
		if ( $( el ).css( "overflow" ) === "hidden") {
			return false;
		}
	
		var scroll = ( a && a === "left" ) ? "scrollLeft" : "scrollTop",
			has = false;
	
		if ( el[ scroll ] > 0 ) {
			return true;
		}
	
		// TODO: determine which cases actually cause this to happen
		// if the element doesn't have the scroll set, see if it's possible to
		// set the scroll
		el[ scroll ] = 1;
		has = ( el[ scroll ] > 0 );
		el[ scroll ] = 0;
		return has;
	},
	
	// these are odd functions, fix the API or move into individual plugins
	isOverAxis: function( x, reference, size ) {
		//Determines when x coordinate is over "b" element axis
		return ( x > reference ) && ( x < ( reference + size ) );
	},
	isOver: function( y, x, top, left, height, width ) {
		//Determines when x, y coordinates is over "b" element
		return $.ui.isOverAxis( y, top, height ) && $.ui.isOverAxis( x, left, width );
	}
});

})( jQuery );

/*!
 * jQuery UI Widget 1.8.24
 *
 * Copyright 2012, AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * http://docs.jquery.com/UI/Widget
 */
(function( $, undefined ) {

// jQuery 1.4+
if ( $.cleanData ) {
	var _cleanData = $.cleanData;
	$.cleanData = function( elems ) {
		for ( var i = 0, elem; (elem = elems[i]) != null; i++ ) {
			try {
				$( elem ).triggerHandler( "remove" );
			// http://bugs.jquery.com/ticket/8235
			} catch( e ) {}
		}
		_cleanData( elems );
	};
} else {
	var _remove = $.fn.remove;
	$.fn.remove = function( selector, keepData ) {
		return this.each(function() {
			if ( !keepData ) {
				if ( !selector || $.filter( selector, [ this ] ).length ) {
					$( "*", this ).add( [ this ] ).each(function() {
						try {
							$( this ).triggerHandler( "remove" );
						// http://bugs.jquery.com/ticket/8235
						} catch( e ) {}
					});
				}
			}
			return _remove.call( $(this), selector, keepData );
		});
	};
}

$.widget = function( name, base, prototype ) {
	var namespace = name.split( "." )[ 0 ],
		fullName;
	name = name.split( "." )[ 1 ];
	fullName = namespace + "-" + name;

	if ( !prototype ) {
		prototype = base;
		base = $.Widget;
	}

	// create selector for plugin
	$.expr[ ":" ][ fullName ] = function( elem ) {
		return !!$.data( elem, name );
	};

	$[ namespace ] = $[ namespace ] || {};
	$[ namespace ][ name ] = function( options, element ) {
		// allow instantiation without initializing for simple inheritance
		if ( arguments.length ) {
			this._createWidget( options, element );
		}
	};

	var basePrototype = new base();
	// we need to make the options hash a property directly on the new instance
	// otherwise we'll modify the options hash on the prototype that we're
	// inheriting from
//	$.each( basePrototype, function( key, val ) {
//		if ( $.isPlainObject(val) ) {
//			basePrototype[ key ] = $.extend( {}, val );
//		}
//	});
	basePrototype.options = $.extend( true, {}, basePrototype.options );
	$[ namespace ][ name ].prototype = $.extend( true, basePrototype, {
		namespace: namespace,
		widgetName: name,
		widgetEventPrefix: $[ namespace ][ name ].prototype.widgetEventPrefix || name,
		widgetBaseClass: fullName
	}, prototype );

	$.widget.bridge( name, $[ namespace ][ name ] );
};

$.widget.bridge = function( name, object ) {
	$.fn[ name ] = function( options ) {
		var isMethodCall = typeof options === "string",
			args = Array.prototype.slice.call( arguments, 1 ),
			returnValue = this;

		// allow multiple hashes to be passed on init
		options = !isMethodCall && args.length ?
			$.extend.apply( null, [ true, options ].concat(args) ) :
			options;

		// prevent calls to internal methods
		if ( isMethodCall && options.charAt( 0 ) === "_" ) {
			return returnValue;
		}

		if ( isMethodCall ) {
			this.each(function() {
				var instance = $.data( this, name ),
					methodValue = instance && $.isFunction( instance[options] ) ?
						instance[ options ].apply( instance, args ) :
						instance;
				// TODO: add this back in 1.9 and use $.error() (see #5972)
//				if ( !instance ) {
//					throw "cannot call methods on " + name + " prior to initialization; " +
//						"attempted to call method '" + options + "'";
//				}
//				if ( !$.isFunction( instance[options] ) ) {
//					throw "no such method '" + options + "' for " + name + " widget instance";
//				}
//				var methodValue = instance[ options ].apply( instance, args );
				if ( methodValue !== instance && methodValue !== undefined ) {
					returnValue = methodValue;
					return false;
				}
			});
		} else {
			this.each(function() {
				var instance = $.data( this, name );
				if ( instance ) {
					instance.option( options || {} )._init();
				} else {
					$.data( this, name, new object( options, this ) );
				}
			});
		}

		return returnValue;
	};
};

$.Widget = function( options, element ) {
	// allow instantiation without initializing for simple inheritance
	if ( arguments.length ) {
		this._createWidget( options, element );
	}
};

$.Widget.prototype = {
	widgetName: "widget",
	widgetEventPrefix: "",
	options: {
		disabled: false
	},
	_createWidget: function( options, element ) {
		// $.widget.bridge stores the plugin instance, but we do it anyway
		// so that it's stored even before the _create function runs
		$.data( element, this.widgetName, this );
		this.element = $( element );
		this.options = $.extend( true, {},
			this.options,
			this._getCreateOptions(),
			options );

		var self = this;
		this.element.bind( "remove." + this.widgetName, function() {
			self.destroy();
		});

		this._create();
		this._trigger( "create" );
		this._init();
	},
	_getCreateOptions: function() {
		return $.metadata && $.metadata.get( this.element[0] )[ this.widgetName ];
	},
	_create: function() {},
	_init: function() {},

	destroy: function() {
		this.element
			.unbind( "." + this.widgetName )
			.removeData( this.widgetName );
		this.widget()
			.unbind( "." + this.widgetName )
			.removeAttr( "aria-disabled" )
			.removeClass(
				this.widgetBaseClass + "-disabled " +
				"ui-state-disabled" );
	},

	widget: function() {
		return this.element;
	},

	option: function( key, value ) {
		var options = key;

		if ( arguments.length === 0 ) {
			// don't return a reference to the internal hash
			return $.extend( {}, this.options );
		}

		if  (typeof key === "string" ) {
			if ( value === undefined ) {
				return this.options[ key ];
			}
			options = {};
			options[ key ] = value;
		}

		this._setOptions( options );

		return this;
	},
	_setOptions: function( options ) {
		var self = this;
		$.each( options, function( key, value ) {
			self._setOption( key, value );
		});

		return this;
	},
	_setOption: function( key, value ) {
		this.options[ key ] = value;

		if ( key === "disabled" ) {
			this.widget()
				[ value ? "addClass" : "removeClass"](
					this.widgetBaseClass + "-disabled" + " " +
					"ui-state-disabled" )
				.attr( "aria-disabled", value );
		}

		return this;
	},

	enable: function() {
		return this._setOption( "disabled", false );
	},
	disable: function() {
		return this._setOption( "disabled", true );
	},

	_trigger: function( type, event, data ) {
		var prop, orig,
			callback = this.options[ type ];

		data = data || {};
		event = $.Event( event );
		event.type = ( type === this.widgetEventPrefix ?
			type :
			this.widgetEventPrefix + type ).toLowerCase();
		// the original event may come from any element
		// so we need to reset the target on the new event
		event.target = this.element[ 0 ];

		// copy original event properties over to the new event
		orig = event.originalEvent;
		if ( orig ) {
			for ( prop in orig ) {
				if ( !( prop in event ) ) {
					event[ prop ] = orig[ prop ];
				}
			}
		}

		this.element.trigger( event, data );

		return !( $.isFunction(callback) &&
			callback.call( this.element[0], event, data ) === false ||
			event.isDefaultPrevented() );
	}
};

})( jQuery );

/*!
 * jQuery UI Mouse 1.8.24
 *
 * Copyright 2012, AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * http://docs.jquery.com/UI/Mouse
 *
 * Depends:
 *	jquery.ui.widget.js
 */
(function( $, undefined ) {

var mouseHandled = false;
$( document ).mouseup( function( e ) {
	mouseHandled = false;
});

$.widget("ui.mouse", {
	options: {
		cancel: ':input,option',
		distance: 1,
		delay: 0
	},
	_mouseInit: function() {
		var self = this;

		this.element
			.bind('mousedown.'+this.widgetName, function(event) {
				return self._mouseDown(event);
			})
			.bind('click.'+this.widgetName, function(event) {
				if (true === $.data(event.target, self.widgetName + '.preventClickEvent')) {
				    $.removeData(event.target, self.widgetName + '.preventClickEvent');
					event.stopImmediatePropagation();
					return false;
				}
			});

		this.started = false;
	},

	// TODO: make sure destroying one instance of mouse doesn't mess with
	// other instances of mouse
	_mouseDestroy: function() {
		this.element.unbind('.'+this.widgetName);
		if ( this._mouseMoveDelegate ) {
			$(document)
				.unbind('mousemove.'+this.widgetName, this._mouseMoveDelegate)
				.unbind('mouseup.'+this.widgetName, this._mouseUpDelegate);
		}
	},

	_mouseDown: function(event) {
		// don't let more than one widget handle mouseStart
		if( mouseHandled ) { return };

		// we may have missed mouseup (out of window)
		(this._mouseStarted && this._mouseUp(event));

		this._mouseDownEvent = event;

		var self = this,
			btnIsLeft = (event.which == 1),
			// event.target.nodeName works around a bug in IE 8 with
			// disabled inputs (#7620)
			elIsCancel = (typeof this.options.cancel == "string" && event.target.nodeName ? $(event.target).closest(this.options.cancel).length : false);
		if (!btnIsLeft || elIsCancel || !this._mouseCapture(event)) {
			return true;
		}

		this.mouseDelayMet = !this.options.delay;
		if (!this.mouseDelayMet) {
			this._mouseDelayTimer = setTimeout(function() {
				self.mouseDelayMet = true;
			}, this.options.delay);
		}

		if (this._mouseDistanceMet(event) && this._mouseDelayMet(event)) {
			this._mouseStarted = (this._mouseStart(event) !== false);
			if (!this._mouseStarted) {
				event.preventDefault();
				return true;
			}
		}

		// Click event may never have fired (Gecko & Opera)
		if (true === $.data(event.target, this.widgetName + '.preventClickEvent')) {
			$.removeData(event.target, this.widgetName + '.preventClickEvent');
		}

		// these delegates are required to keep context
		this._mouseMoveDelegate = function(event) {
			return self._mouseMove(event);
		};
		this._mouseUpDelegate = function(event) {
			return self._mouseUp(event);
		};
		$(document)
			.bind('mousemove.'+this.widgetName, this._mouseMoveDelegate)
			.bind('mouseup.'+this.widgetName, this._mouseUpDelegate);

		event.preventDefault();
		
		mouseHandled = true;
		return true;
	},

	_mouseMove: function(event) {
		// IE mouseup check - mouseup happened when mouse was out of window
		if ($.browser.msie && !(document.documentMode >= 9) && !event.button) {
			return this._mouseUp(event);
		}

		if (this._mouseStarted) {
			this._mouseDrag(event);
			return event.preventDefault();
		}

		if (this._mouseDistanceMet(event) && this._mouseDelayMet(event)) {
			this._mouseStarted =
				(this._mouseStart(this._mouseDownEvent, event) !== false);
			(this._mouseStarted ? this._mouseDrag(event) : this._mouseUp(event));
		}

		return !this._mouseStarted;
	},

	_mouseUp: function(event) {
		$(document)
			.unbind('mousemove.'+this.widgetName, this._mouseMoveDelegate)
			.unbind('mouseup.'+this.widgetName, this._mouseUpDelegate);

		if (this._mouseStarted) {
			this._mouseStarted = false;

			if (event.target == this._mouseDownEvent.target) {
			    $.data(event.target, this.widgetName + '.preventClickEvent', true);
			}

			this._mouseStop(event);
		}

		return false;
	},

	_mouseDistanceMet: function(event) {
		return (Math.max(
				Math.abs(this._mouseDownEvent.pageX - event.pageX),
				Math.abs(this._mouseDownEvent.pageY - event.pageY)
			) >= this.options.distance
		);
	},

	_mouseDelayMet: function(event) {
		return this.mouseDelayMet;
	},

	// These are placeholder methods, to be overriden by extending plugin
	_mouseStart: function(event) {},
	_mouseDrag: function(event) {},
	_mouseStop: function(event) {},
	_mouseCapture: function(event) { return true; }
});

})(jQuery);

/*!
 * jQuery UI Sortable 1.9.2
 * http://jqueryui.com
 *
 * Copyright 2012 jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/sortable/
 *
 * Depends:
 *	jquery.ui.core.js
 *	jquery.ui.mouse.js
 *	jquery.ui.widget.js
 */
(function( $, undefined ) {

$.widget("ui.sortable", $.ui.mouse, {
	version: "1.9.2",
	widgetEventPrefix: "sort",
	ready: false,
	options: {
		appendTo: "parent",
		axis: false,
		connectWith: false,
		containment: false,
		cursor: 'auto',
		cursorAt: false,
		dropOnEmpty: true,
		forcePlaceholderSize: false,
		forceHelperSize: false,
		grid: false,
		handle: false,
		helper: "original",
		items: '> *',
		opacity: false,
		placeholder: false,
		revert: false,
		scroll: true,
		scrollSensitivity: 20,
		scrollSpeed: 20,
		scope: "default",
		tolerance: "intersect",
		zIndex: 1000
	},
	_create: function() {

		var o = this.options;
		this.containerCache = {};
		this.element.addClass("ui-sortable");

		//Get the items
		this.refresh();

		//Let's determine if the items are being displayed horizontally
		this.floating = this.items.length ? o.axis === 'x' || (/left|right/).test(this.items[0].item.css('float')) || (/inline|table-cell/).test(this.items[0].item.css('display')) : false;

		//Let's determine the parent's offset
		this.offset = this.element.offset();

		//Initialize mouse events for interaction
		this._mouseInit();

		//We're ready to go
		this.ready = true

	},

	_destroy: function() {
		this.element
			.removeClass("ui-sortable ui-sortable-disabled");
		this._mouseDestroy();

		for ( var i = this.items.length - 1; i >= 0; i-- )
			this.items[i].item.removeData(this.widgetName + "-item");

		return this;
	},

	_setOption: function(key, value){
		if ( key === "disabled" ) {
			this.options[ key ] = value;

			this.widget().toggleClass( "ui-sortable-disabled", !!value );
		} else {
			// Don't call widget base _setOption for disable as it adds ui-state-disabled class
			$.Widget.prototype._setOption.apply(this, arguments);
		}
	},

	_mouseCapture: function(event, overrideHandle) {
		var that = this;

		if (this.reverting) {
			return false;
		}

		if(this.options.disabled || this.options.type == 'static') return false;

		//We have to refresh the items data once first
		this._refreshItems(event);

		//Find out if the clicked node (or one of its parents) is a actual item in this.items
		var currentItem = null, nodes = $(event.target).parents().each(function() {
			if($.data(this, that.widgetName + '-item') == that) {
				currentItem = $(this);
				return false;
			}
		});
		if($.data(event.target, that.widgetName + '-item') == that) currentItem = $(event.target);

		if(!currentItem) return false;
		if(this.options.handle && !overrideHandle) {
			var validHandle = false;

			$(this.options.handle, currentItem).find("*").andSelf().each(function() { if(this == event.target) validHandle = true; });
			if(!validHandle) return false;
		}

		this.currentItem = currentItem;
		this._removeCurrentsFromItems();
		return true;

	},

	_mouseStart: function(event, overrideHandle, noActivation) {

		var o = this.options;
		this.currentContainer = this;

		//We only need to call refreshPositions, because the refreshItems call has been moved to mouseCapture
		this.refreshPositions();

		//Create and append the visible helper
		this.helper = this._createHelper(event);

		//Cache the helper size
		this._cacheHelperProportions();

		/*
		 * - Position generation -
		 * This block generates everything position related - it's the core of draggables.
		 */

		//Cache the margins of the original element
		this._cacheMargins();

		//Get the next scrolling parent
		this.scrollParent = this.helper.scrollParent();

		//The element's absolute position on the page minus margins
		this.offset = this.currentItem.offset();
		this.offset = {
			top: this.offset.top - this.margins.top,
			left: this.offset.left - this.margins.left
		};

		$.extend(this.offset, {
			click: { //Where the click happened, relative to the element
				left: event.pageX - this.offset.left,
				top: event.pageY - this.offset.top
			},
			parent: this._getParentOffset(),
			relative: this._getRelativeOffset() //This is a relative to absolute position minus the actual position calculation - only used for relative positioned helper
		});

		// Only after we got the offset, we can change the helper's position to absolute
		// TODO: Still need to figure out a way to make relative sorting possible
		this.helper.css("position", "absolute");
		this.cssPosition = this.helper.css("position");

		//Generate the original position
		this.originalPosition = this._generatePosition(event);
		this.originalPageX = event.pageX;
		this.originalPageY = event.pageY;

		//Adjust the mouse offset relative to the helper if 'cursorAt' is supplied
		(o.cursorAt && this._adjustOffsetFromHelper(o.cursorAt));

		//Cache the former DOM position
		this.domPosition = { prev: this.currentItem.prev()[0], parent: this.currentItem.parent()[0] };

		//If the helper is not the original, hide the original so it's not playing any role during the drag, won't cause anything bad this way
		if(this.helper[0] != this.currentItem[0]) {
			this.currentItem.hide();
		}

		//Create the placeholder
		this._createPlaceholder();

		//Set a containment if given in the options
		if(o.containment)
			this._setContainment();

		if(o.cursor) { // cursor option
			if ($('body').css("cursor")) this._storedCursor = $('body').css("cursor");
			$('body').css("cursor", o.cursor);
		}

		if(o.opacity) { // opacity option
			if (this.helper.css("opacity")) this._storedOpacity = this.helper.css("opacity");
			this.helper.css("opacity", o.opacity);
		}

		if(o.zIndex) { // zIndex option
			if (this.helper.css("zIndex")) this._storedZIndex = this.helper.css("zIndex");
			this.helper.css("zIndex", o.zIndex);
		}

		//Prepare scrolling
		if(this.scrollParent[0] != document && this.scrollParent[0].tagName != 'HTML')
			this.overflowOffset = this.scrollParent.offset();

		//Call callbacks
		this._trigger("start", event, this._uiHash());

		//Recache the helper size
		if(!this._preserveHelperProportions)
			this._cacheHelperProportions();


		//Post 'activate' events to possible containers
		if(!noActivation) {
			 for (var i = this.containers.length - 1; i >= 0; i--) { this.containers[i]._trigger("activate", event, this._uiHash(this)); }
		}

		//Prepare possible droppables
		if($.ui.ddmanager)
			$.ui.ddmanager.current = this;

		if ($.ui.ddmanager && !o.dropBehaviour)
			$.ui.ddmanager.prepareOffsets(this, event);

		this.dragging = true;

		this.helper.addClass("ui-sortable-helper");
		this._mouseDrag(event); //Execute the drag once - this causes the helper not to be visible before getting its correct position
		return true;

	},

	_mouseDrag: function(event) {

		//Compute the helpers position
		this.position = this._generatePosition(event);
		this.positionAbs = this._convertPositionTo("absolute");

		if (!this.lastPositionAbs) {
			this.lastPositionAbs = this.positionAbs;
		}

		//Do scrolling
		if(this.options.scroll) {
			var o = this.options, scrolled = false;
			if(this.scrollParent[0] != document && this.scrollParent[0].tagName != 'HTML') {

				if((this.overflowOffset.top + this.scrollParent[0].offsetHeight) - event.pageY < o.scrollSensitivity)
					this.scrollParent[0].scrollTop = scrolled = this.scrollParent[0].scrollTop + o.scrollSpeed;
				else if(event.pageY - this.overflowOffset.top < o.scrollSensitivity)
					this.scrollParent[0].scrollTop = scrolled = this.scrollParent[0].scrollTop - o.scrollSpeed;

				if((this.overflowOffset.left + this.scrollParent[0].offsetWidth) - event.pageX < o.scrollSensitivity)
					this.scrollParent[0].scrollLeft = scrolled = this.scrollParent[0].scrollLeft + o.scrollSpeed;
				else if(event.pageX - this.overflowOffset.left < o.scrollSensitivity)
					this.scrollParent[0].scrollLeft = scrolled = this.scrollParent[0].scrollLeft - o.scrollSpeed;

			} else {

				if(event.pageY - $(document).scrollTop() < o.scrollSensitivity)
					scrolled = $(document).scrollTop($(document).scrollTop() - o.scrollSpeed);
				else if($(window).height() - (event.pageY - $(document).scrollTop()) < o.scrollSensitivity)
					scrolled = $(document).scrollTop($(document).scrollTop() + o.scrollSpeed);

				if(event.pageX - $(document).scrollLeft() < o.scrollSensitivity)
					scrolled = $(document).scrollLeft($(document).scrollLeft() - o.scrollSpeed);
				else if($(window).width() - (event.pageX - $(document).scrollLeft()) < o.scrollSensitivity)
					scrolled = $(document).scrollLeft($(document).scrollLeft() + o.scrollSpeed);

			}

			if(scrolled !== false && $.ui.ddmanager && !o.dropBehaviour)
				$.ui.ddmanager.prepareOffsets(this, event);
		}

		//Regenerate the absolute position used for position checks
		this.positionAbs = this._convertPositionTo("absolute");

		//Set the helper position
		if(!this.options.axis || this.options.axis != "y") this.helper[0].style.left = this.position.left+'px';
		if(!this.options.axis || this.options.axis != "x") this.helper[0].style.top = this.position.top+'px';

		//Rearrange
		for (var i = this.items.length - 1; i >= 0; i--) {

			//Cache variables and intersection, continue if no intersection
			var item = this.items[i], itemElement = item.item[0], intersection = this._intersectsWithPointer(item);
			if (!intersection) continue;

			// Only put the placeholder inside the current Container, skip all
			// items form other containers. This works because when moving
			// an item from one container to another the
			// currentContainer is switched before the placeholder is moved.
			//
			// Without this moving items in "sub-sortables" can cause the placeholder to jitter
			// beetween the outer and inner container.
			if (item.instance !== this.currentContainer) continue;

			if (itemElement != this.currentItem[0] //cannot intersect with itself
				&&	this.placeholder[intersection == 1 ? "next" : "prev"]()[0] != itemElement //no useless actions that have been done before
				&&	!$.contains(this.placeholder[0], itemElement) //no action if the item moved is the parent of the item checked
				&& (this.options.type == 'semi-dynamic' ? !$.contains(this.element[0], itemElement) : true)
				//&& itemElement.parentNode == this.placeholder[0].parentNode // only rearrange items within the same container
			) {

				this.direction = intersection == 1 ? "down" : "up";

				if (this.options.tolerance == "pointer" || this._intersectsWithSides(item)) {
					this._rearrange(event, item);
				} else {
					break;
				}

				this._trigger("change", event, this._uiHash());
				break;
			}
		}

		//Post events to containers
		this._contactContainers(event);

		//Interconnect with droppables
		if($.ui.ddmanager) $.ui.ddmanager.drag(this, event);

		//Call callbacks
		this._trigger('sort', event, this._uiHash());

		this.lastPositionAbs = this.positionAbs;
		return false;

	},

	_mouseStop: function(event, noPropagation) {

		if(!event) return;

		//If we are using droppables, inform the manager about the drop
		if ($.ui.ddmanager && !this.options.dropBehaviour)
			$.ui.ddmanager.drop(this, event);

		if(this.options.revert) {
			var that = this;
			var cur = this.placeholder.offset();

			this.reverting = true;

			$(this.helper).animate({
				left: cur.left - this.offset.parent.left - this.margins.left + (this.offsetParent[0] == document.body ? 0 : this.offsetParent[0].scrollLeft),
				top: cur.top - this.offset.parent.top - this.margins.top + (this.offsetParent[0] == document.body ? 0 : this.offsetParent[0].scrollTop)
			}, parseInt(this.options.revert, 10) || 500, function() {
				that._clear(event);
			});
		} else {
			this._clear(event, noPropagation);
		}

		return false;

	},

	cancel: function() {

		if(this.dragging) {

			this._mouseUp({ target: null });

			if(this.options.helper == "original")
				this.currentItem.css(this._storedCSS).removeClass("ui-sortable-helper");
			else
				this.currentItem.show();

			//Post deactivating events to containers
			for (var i = this.containers.length - 1; i >= 0; i--){
				this.containers[i]._trigger("deactivate", null, this._uiHash(this));
				if(this.containers[i].containerCache.over) {
					this.containers[i]._trigger("out", null, this._uiHash(this));
					this.containers[i].containerCache.over = 0;
				}
			}

		}

		if (this.placeholder) {
			//$(this.placeholder[0]).remove(); would have been the jQuery way - unfortunately, it unbinds ALL events from the original node!
			if(this.placeholder[0].parentNode) this.placeholder[0].parentNode.removeChild(this.placeholder[0]);
			if(this.options.helper != "original" && this.helper && this.helper[0].parentNode) this.helper.remove();

			$.extend(this, {
				helper: null,
				dragging: false,
				reverting: false,
				_noFinalSort: null
			});

			if(this.domPosition.prev) {
				$(this.domPosition.prev).after(this.currentItem);
			} else {
				$(this.domPosition.parent).prepend(this.currentItem);
			}
		}

		return this;

	},

	serialize: function(o) {

		var items = this._getItemsAsjQuery(o && o.connected);
		var str = []; o = o || {};

		$(items).each(function() {
			var res = ($(o.item || this).attr(o.attribute || 'id') || '').match(o.expression || (/(.+)[-=_](.+)/));
			if(res) str.push((o.key || res[1]+'[]')+'='+(o.key && o.expression ? res[1] : res[2]));
		});

		if(!str.length && o.key) {
			str.push(o.key + '=');
		}

		return str.join('&');

	},

	toArray: function(o) {

		var items = this._getItemsAsjQuery(o && o.connected);
		var ret = []; o = o || {};

		items.each(function() { ret.push($(o.item || this).attr(o.attribute || 'id') || ''); });
		return ret;

	},

	/* Be careful with the following core functions */
	_intersectsWith: function(item) {

		var x1 = this.positionAbs.left,
			x2 = x1 + this.helperProportions.width,
			y1 = this.positionAbs.top,
			y2 = y1 + this.helperProportions.height;

		var l = item.left,
			r = l + item.width,
			t = item.top,
			b = t + item.height;

		var dyClick = this.offset.click.top,
			dxClick = this.offset.click.left;

		var isOverElement = (y1 + dyClick) > t && (y1 + dyClick) < b && (x1 + dxClick) > l && (x1 + dxClick) < r;

		if(	   this.options.tolerance == "pointer"
			|| this.options.forcePointerForContainers
			|| (this.options.tolerance != "pointer" && this.helperProportions[this.floating ? 'width' : 'height'] > item[this.floating ? 'width' : 'height'])
		) {
			return isOverElement;
		} else {

			return (l < x1 + (this.helperProportions.width / 2) // Right Half
				&& x2 - (this.helperProportions.width / 2) < r // Left Half
				&& t < y1 + (this.helperProportions.height / 2) // Bottom Half
				&& y2 - (this.helperProportions.height / 2) < b ); // Top Half

		}
	},

	_intersectsWithPointer: function(item) {

		var isOverElementHeight = (this.options.axis === 'x') || $.ui.isOverAxis(this.positionAbs.top + this.offset.click.top, item.top, item.height),
			isOverElementWidth = (this.options.axis === 'y') || $.ui.isOverAxis(this.positionAbs.left + this.offset.click.left, item.left, item.width),
			isOverElement = isOverElementHeight && isOverElementWidth,
			verticalDirection = this._getDragVerticalDirection(),
			horizontalDirection = this._getDragHorizontalDirection();

		if (!isOverElement)
			return false;

		return this.floating ?
			( ((horizontalDirection && horizontalDirection == "right") || verticalDirection == "down") ? 2 : 1 )
			: ( verticalDirection && (verticalDirection == "down" ? 2 : 1) );

	},

	_intersectsWithSides: function(item) {

		var isOverBottomHalf = $.ui.isOverAxis(this.positionAbs.top + this.offset.click.top, item.top + (item.height/2), item.height),
			isOverRightHalf = $.ui.isOverAxis(this.positionAbs.left + this.offset.click.left, item.left + (item.width/2), item.width),
			verticalDirection = this._getDragVerticalDirection(),
			horizontalDirection = this._getDragHorizontalDirection();

		if (this.floating && horizontalDirection) {
			return ((horizontalDirection == "right" && isOverRightHalf) || (horizontalDirection == "left" && !isOverRightHalf));
		} else {
			return verticalDirection && ((verticalDirection == "down" && isOverBottomHalf) || (verticalDirection == "up" && !isOverBottomHalf));
		}

	},

	_getDragVerticalDirection: function() {
		var delta = this.positionAbs.top - this.lastPositionAbs.top;
		return delta != 0 && (delta > 0 ? "down" : "up");
	},

	_getDragHorizontalDirection: function() {
		var delta = this.positionAbs.left - this.lastPositionAbs.left;
		return delta != 0 && (delta > 0 ? "right" : "left");
	},

	refresh: function(event) {
		this._refreshItems(event);
		this.refreshPositions();
		return this;
	},

	_connectWith: function() {
		var options = this.options;
		return options.connectWith.constructor == String
			? [options.connectWith]
			: options.connectWith;
	},

	_getItemsAsjQuery: function(connected) {

		var items = [];
		var queries = [];
		var connectWith = this._connectWith();

		if(connectWith && connected) {
			for (var i = connectWith.length - 1; i >= 0; i--){
				var cur = $(connectWith[i]);
				for (var j = cur.length - 1; j >= 0; j--){
					var inst = $.data(cur[j], this.widgetName);
					if(inst && inst != this && !inst.options.disabled) {
						queries.push([$.isFunction(inst.options.items) ? inst.options.items.call(inst.element) : $(inst.options.items, inst.element).not(".ui-sortable-helper").not('.ui-sortable-placeholder'), inst]);
					}
				};
			};
		}

		queries.push([$.isFunction(this.options.items) ? this.options.items.call(this.element, null, { options: this.options, item: this.currentItem }) : $(this.options.items, this.element).not(".ui-sortable-helper").not('.ui-sortable-placeholder'), this]);

		for (var i = queries.length - 1; i >= 0; i--){
			queries[i][0].each(function() {
				items.push(this);
			});
		};

		return $(items);

	},

	_removeCurrentsFromItems: function() {

		var list = this.currentItem.find(":data(" + this.widgetName + "-item)");

		this.items = $.grep(this.items, function (item) {
			for (var j=0; j < list.length; j++) {
				if(list[j] == item.item[0])
					return false;
			};
			return true;
		});

	},

	_refreshItems: function(event) {

		this.items = [];
		this.containers = [this];
		var items = this.items;
		var queries = [[$.isFunction(this.options.items) ? this.options.items.call(this.element[0], event, { item: this.currentItem }) : $(this.options.items, this.element), this]];
		var connectWith = this._connectWith();

		if(connectWith && this.ready) { //Shouldn't be run the first time through due to massive slow-down
			for (var i = connectWith.length - 1; i >= 0; i--){
				var cur = $(connectWith[i]);
				for (var j = cur.length - 1; j >= 0; j--){
					var inst = $.data(cur[j], this.widgetName);
					if(inst && inst != this && !inst.options.disabled) {
						queries.push([$.isFunction(inst.options.items) ? inst.options.items.call(inst.element[0], event, { item: this.currentItem }) : $(inst.options.items, inst.element), inst]);
						this.containers.push(inst);
					}
				};
			};
		}

		for (var i = queries.length - 1; i >= 0; i--) {
			var targetData = queries[i][1];
			var _queries = queries[i][0];

			for (var j=0, queriesLength = _queries.length; j < queriesLength; j++) {
				var item = $(_queries[j]);

				item.data(this.widgetName + '-item', targetData); // Data for target checking (mouse manager)

				items.push({
					item: item,
					instance: targetData,
					width: 0, height: 0,
					left: 0, top: 0
				});
			};
		};

	},

	refreshPositions: function(fast) {

		//This has to be redone because due to the item being moved out/into the offsetParent, the offsetParent's position will change
		if(this.offsetParent && this.helper) {
			this.offset.parent = this._getParentOffset();
		}

		for (var i = this.items.length - 1; i >= 0; i--){
			var item = this.items[i];

			//We ignore calculating positions of all connected containers when we're not over them
			if(item.instance != this.currentContainer && this.currentContainer && item.item[0] != this.currentItem[0])
				continue;

			var t = this.options.toleranceElement ? $(this.options.toleranceElement, item.item) : item.item;

			if (!fast) {
				item.width = t.outerWidth();
				item.height = t.outerHeight();
			}

			var p = t.offset();
			item.left = p.left;
			item.top = p.top;
		};

		if(this.options.custom && this.options.custom.refreshContainers) {
			this.options.custom.refreshContainers.call(this);
		} else {
			for (var i = this.containers.length - 1; i >= 0; i--){
				var p = this.containers[i].element.offset();
				this.containers[i].containerCache.left = p.left;
				this.containers[i].containerCache.top = p.top;
				this.containers[i].containerCache.width	= this.containers[i].element.outerWidth();
				this.containers[i].containerCache.height = this.containers[i].element.outerHeight();
			};
		}

		return this;
	},

	_createPlaceholder: function(that) {
		that = that || this;
		var o = that.options;

		if(!o.placeholder || o.placeholder.constructor == String) {
			var className = o.placeholder;
			o.placeholder = {
				element: function() {

					var el = $(document.createElement(that.currentItem[0].nodeName))
						.addClass(className || that.currentItem[0].className+" ui-sortable-placeholder")
						.removeClass("ui-sortable-helper")[0];

					if(!className)
						el.style.visibility = "hidden";

					return el;
				},
				update: function(container, p) {

					// 1. If a className is set as 'placeholder option, we don't force sizes - the class is responsible for that
					// 2. The option 'forcePlaceholderSize can be enabled to force it even if a class name is specified
					if(className && !o.forcePlaceholderSize) return;

					//If the element doesn't have a actual height by itself (without styles coming from a stylesheet), it receives the inline height from the dragged item
					if(!p.height()) { p.height(that.currentItem.innerHeight() - parseInt(that.currentItem.css('paddingTop')||0, 10) - parseInt(that.currentItem.css('paddingBottom')||0, 10)); };
					if(!p.width()) { p.width(that.currentItem.innerWidth() - parseInt(that.currentItem.css('paddingLeft')||0, 10) - parseInt(that.currentItem.css('paddingRight')||0, 10)); };
				}
			};
		}

		//Create the placeholder
		that.placeholder = $(o.placeholder.element.call(that.element, that.currentItem));

		//Append it after the actual current item
		that.currentItem.after(that.placeholder);

		//Update the size of the placeholder (TODO: Logic to fuzzy, see line 316/317)
		o.placeholder.update(that, that.placeholder);

	},

	_contactContainers: function(event) {

		// get innermost container that intersects with item
		var innermostContainer = null, innermostIndex = null;


		for (var i = this.containers.length - 1; i >= 0; i--){

			// never consider a container that's located within the item itself
			if($.contains(this.currentItem[0], this.containers[i].element[0]))
				continue;

			if(this._intersectsWith(this.containers[i].containerCache)) {

				// if we've already found a container and it's more "inner" than this, then continue
				if(innermostContainer && $.contains(this.containers[i].element[0], innermostContainer.element[0]))
					continue;

				innermostContainer = this.containers[i];
				innermostIndex = i;

			} else {
				// container doesn't intersect. trigger "out" event if necessary
				if(this.containers[i].containerCache.over) {
					this.containers[i]._trigger("out", event, this._uiHash(this));
					this.containers[i].containerCache.over = 0;
				}
			}

		}

		// if no intersecting containers found, return
		if(!innermostContainer) return;

		// move the item into the container if it's not there already
		if(this.containers.length === 1) {
			this.containers[innermostIndex]._trigger("over", event, this._uiHash(this));
			this.containers[innermostIndex].containerCache.over = 1;
		} else {

			//When entering a new container, we will find the item with the least distance and append our item near it
			var dist = 10000; var itemWithLeastDistance = null;
			var posProperty = this.containers[innermostIndex].floating ? 'left' : 'top';
			var sizeProperty = this.containers[innermostIndex].floating ? 'width' : 'height';
			var base = this.positionAbs[posProperty] + this.offset.click[posProperty];
			for (var j = this.items.length - 1; j >= 0; j--) {
				if(!$.contains(this.containers[innermostIndex].element[0], this.items[j].item[0])) continue;
				if(this.items[j].item[0] == this.currentItem[0]) continue;
				var cur = this.items[j].item.offset()[posProperty];
				var nearBottom = false;
				if(Math.abs(cur - base) > Math.abs(cur + this.items[j][sizeProperty] - base)){
					nearBottom = true;
					cur += this.items[j][sizeProperty];
				}

				if(Math.abs(cur - base) < dist) {
					dist = Math.abs(cur - base); itemWithLeastDistance = this.items[j];
					this.direction = nearBottom ? "up": "down";
				}
			}

			if(!itemWithLeastDistance && !this.options.dropOnEmpty) //Check if dropOnEmpty is enabled
				return;

			this.currentContainer = this.containers[innermostIndex];
			itemWithLeastDistance ? this._rearrange(event, itemWithLeastDistance, null, true) : this._rearrange(event, null, this.containers[innermostIndex].element, true);
			this._trigger("change", event, this._uiHash());
			this.containers[innermostIndex]._trigger("change", event, this._uiHash(this));

			//Update the placeholder
			this.options.placeholder.update(this.currentContainer, this.placeholder);

			this.containers[innermostIndex]._trigger("over", event, this._uiHash(this));
			this.containers[innermostIndex].containerCache.over = 1;
		}


	},

	_createHelper: function(event) {

		var o = this.options;
		var helper = $.isFunction(o.helper) ? $(o.helper.apply(this.element[0], [event, this.currentItem])) : (o.helper == 'clone' ? this.currentItem.clone() : this.currentItem);

		if(!helper.parents('body').length) //Add the helper to the DOM if that didn't happen already
			$(o.appendTo != 'parent' ? o.appendTo : this.currentItem[0].parentNode)[0].appendChild(helper[0]);

		if(helper[0] == this.currentItem[0])
			this._storedCSS = { width: this.currentItem[0].style.width, height: this.currentItem[0].style.height, position: this.currentItem.css("position"), top: this.currentItem.css("top"), left: this.currentItem.css("left") };

		if(helper[0].style.width == '' || o.forceHelperSize) helper.width(this.currentItem.width());
		if(helper[0].style.height == '' || o.forceHelperSize) helper.height(this.currentItem.height());

		return helper;

	},

	_adjustOffsetFromHelper: function(obj) {
		if (typeof obj == 'string') {
			obj = obj.split(' ');
		}
		if ($.isArray(obj)) {
			obj = {left: +obj[0], top: +obj[1] || 0};
		}
		if ('left' in obj) {
			this.offset.click.left = obj.left + this.margins.left;
		}
		if ('right' in obj) {
			this.offset.click.left = this.helperProportions.width - obj.right + this.margins.left;
		}
		if ('top' in obj) {
			this.offset.click.top = obj.top + this.margins.top;
		}
		if ('bottom' in obj) {
			this.offset.click.top = this.helperProportions.height - obj.bottom + this.margins.top;
		}
	},

	_getParentOffset: function() {


		//Get the offsetParent and cache its position
		this.offsetParent = this.helper.offsetParent();
		var po = this.offsetParent.offset();

		// This is a special case where we need to modify a offset calculated on start, since the following happened:
		// 1. The position of the helper is absolute, so it's position is calculated based on the next positioned parent
		// 2. The actual offset parent is a child of the scroll parent, and the scroll parent isn't the document, which means that
		//    the scroll is included in the initial calculation of the offset of the parent, and never recalculated upon drag
		if(this.cssPosition == 'absolute' && this.scrollParent[0] != document && $.contains(this.scrollParent[0], this.offsetParent[0])) {
			po.left += this.scrollParent.scrollLeft();
			po.top += this.scrollParent.scrollTop();
		}

		if((this.offsetParent[0] == document.body) //This needs to be actually done for all browsers, since pageX/pageY includes this information
		|| (this.offsetParent[0].tagName && this.offsetParent[0].tagName.toLowerCase() == 'html' && $.ui.ie)) //Ugly IE fix
			po = { top: 0, left: 0 };

		return {
			top: po.top + (parseInt(this.offsetParent.css("borderTopWidth"),10) || 0),
			left: po.left + (parseInt(this.offsetParent.css("borderLeftWidth"),10) || 0)
		};

	},

	_getRelativeOffset: function() {

		if(this.cssPosition == "relative") {
			var p = this.currentItem.position();
			return {
				top: p.top - (parseInt(this.helper.css("top"),10) || 0) + this.scrollParent.scrollTop(),
				left: p.left - (parseInt(this.helper.css("left"),10) || 0) + this.scrollParent.scrollLeft()
			};
		} else {
			return { top: 0, left: 0 };
		}

	},

	_cacheMargins: function() {
		this.margins = {
			left: (parseInt(this.currentItem.css("marginLeft"),10) || 0),
			top: (parseInt(this.currentItem.css("marginTop"),10) || 0)
		};
	},

	_cacheHelperProportions: function() {
		this.helperProportions = {
			width: this.helper.outerWidth(),
			height: this.helper.outerHeight()
		};
	},

	_setContainment: function() {

		var o = this.options;
		if(o.containment == 'parent') o.containment = this.helper[0].parentNode;
		if(o.containment == 'document' || o.containment == 'window') this.containment = [
			0 - this.offset.relative.left - this.offset.parent.left,
			0 - this.offset.relative.top - this.offset.parent.top,
			$(o.containment == 'document' ? document : window).width() - this.helperProportions.width - this.margins.left,
			($(o.containment == 'document' ? document : window).height() || document.body.parentNode.scrollHeight) - this.helperProportions.height - this.margins.top
		];

		if(!(/^(document|window|parent)$/).test(o.containment)) {
			var ce = $(o.containment)[0];
			var co = $(o.containment).offset();
			var over = ($(ce).css("overflow") != 'hidden');

			this.containment = [
				co.left + (parseInt($(ce).css("borderLeftWidth"),10) || 0) + (parseInt($(ce).css("paddingLeft"),10) || 0) - this.margins.left,
				co.top + (parseInt($(ce).css("borderTopWidth"),10) || 0) + (parseInt($(ce).css("paddingTop"),10) || 0) - this.margins.top,
				co.left+(over ? Math.max(ce.scrollWidth,ce.offsetWidth) : ce.offsetWidth) - (parseInt($(ce).css("borderLeftWidth"),10) || 0) - (parseInt($(ce).css("paddingRight"),10) || 0) - this.helperProportions.width - this.margins.left,
				co.top+(over ? Math.max(ce.scrollHeight,ce.offsetHeight) : ce.offsetHeight) - (parseInt($(ce).css("borderTopWidth"),10) || 0) - (parseInt($(ce).css("paddingBottom"),10) || 0) - this.helperProportions.height - this.margins.top
			];
		}

	},

	_convertPositionTo: function(d, pos) {

		if(!pos) pos = this.position;
		var mod = d == "absolute" ? 1 : -1;
		var o = this.options, scroll = this.cssPosition == 'absolute' && !(this.scrollParent[0] != document && $.contains(this.scrollParent[0], this.offsetParent[0])) ? this.offsetParent : this.scrollParent, scrollIsRootNode = (/(html|body)/i).test(scroll[0].tagName);

		return {
			top: (
				pos.top																	// The absolute mouse position
				+ this.offset.relative.top * mod										// Only for relative positioned nodes: Relative offset from element to offset parent
				+ this.offset.parent.top * mod											// The offsetParent's offset without borders (offset + border)
				- ( ( this.cssPosition == 'fixed' ? -this.scrollParent.scrollTop() : ( scrollIsRootNode ? 0 : scroll.scrollTop() ) ) * mod)
			),
			left: (
				pos.left																// The absolute mouse position
				+ this.offset.relative.left * mod										// Only for relative positioned nodes: Relative offset from element to offset parent
				+ this.offset.parent.left * mod											// The offsetParent's offset without borders (offset + border)
				- ( ( this.cssPosition == 'fixed' ? -this.scrollParent.scrollLeft() : scrollIsRootNode ? 0 : scroll.scrollLeft() ) * mod)
			)
		};

	},

	_generatePosition: function(event) {

		var o = this.options, scroll = this.cssPosition == 'absolute' && !(this.scrollParent[0] != document && $.contains(this.scrollParent[0], this.offsetParent[0])) ? this.offsetParent : this.scrollParent, scrollIsRootNode = (/(html|body)/i).test(scroll[0].tagName);

		// This is another very weird special case that only happens for relative elements:
		// 1. If the css position is relative
		// 2. and the scroll parent is the document or similar to the offset parent
		// we have to refresh the relative offset during the scroll so there are no jumps
		if(this.cssPosition == 'relative' && !(this.scrollParent[0] != document && this.scrollParent[0] != this.offsetParent[0])) {
			this.offset.relative = this._getRelativeOffset();
		}

		var pageX = event.pageX;
		var pageY = event.pageY;

		/*
		 * - Position constraining -
		 * Constrain the position to a mix of grid, containment.
		 */

		if(this.originalPosition) { //If we are not dragging yet, we won't check for options

			if(this.containment) {
				if(event.pageX - this.offset.click.left < this.containment[0]) pageX = this.containment[0] + this.offset.click.left;
				if(event.pageY - this.offset.click.top < this.containment[1]) pageY = this.containment[1] + this.offset.click.top;
				if(event.pageX - this.offset.click.left > this.containment[2]) pageX = this.containment[2] + this.offset.click.left;
				if(event.pageY - this.offset.click.top > this.containment[3]) pageY = this.containment[3] + this.offset.click.top;
			}

			if(o.grid) {
				var top = this.originalPageY + Math.round((pageY - this.originalPageY) / o.grid[1]) * o.grid[1];
				pageY = this.containment ? (!(top - this.offset.click.top < this.containment[1] || top - this.offset.click.top > this.containment[3]) ? top : (!(top - this.offset.click.top < this.containment[1]) ? top - o.grid[1] : top + o.grid[1])) : top;

				var left = this.originalPageX + Math.round((pageX - this.originalPageX) / o.grid[0]) * o.grid[0];
				pageX = this.containment ? (!(left - this.offset.click.left < this.containment[0] || left - this.offset.click.left > this.containment[2]) ? left : (!(left - this.offset.click.left < this.containment[0]) ? left - o.grid[0] : left + o.grid[0])) : left;
			}

		}

		return {
			top: (
				pageY																// The absolute mouse position
				- this.offset.click.top													// Click offset (relative to the element)
				- this.offset.relative.top												// Only for relative positioned nodes: Relative offset from element to offset parent
				- this.offset.parent.top												// The offsetParent's offset without borders (offset + border)
				+ ( ( this.cssPosition == 'fixed' ? -this.scrollParent.scrollTop() : ( scrollIsRootNode ? 0 : scroll.scrollTop() ) ))
			),
			left: (
				pageX																// The absolute mouse position
				- this.offset.click.left												// Click offset (relative to the element)
				- this.offset.relative.left												// Only for relative positioned nodes: Relative offset from element to offset parent
				- this.offset.parent.left												// The offsetParent's offset without borders (offset + border)
				+ ( ( this.cssPosition == 'fixed' ? -this.scrollParent.scrollLeft() : scrollIsRootNode ? 0 : scroll.scrollLeft() ))
			)
		};

	},

	_rearrange: function(event, i, a, hardRefresh) {

		a ? a[0].appendChild(this.placeholder[0]) : i.item[0].parentNode.insertBefore(this.placeholder[0], (this.direction == 'down' ? i.item[0] : i.item[0].nextSibling));

		//Various things done here to improve the performance:
		// 1. we create a setTimeout, that calls refreshPositions
		// 2. on the instance, we have a counter variable, that get's higher after every append
		// 3. on the local scope, we copy the counter variable, and check in the timeout, if it's still the same
		// 4. this lets only the last addition to the timeout stack through
		this.counter = this.counter ? ++this.counter : 1;
		var counter = this.counter;

		this._delay(function() {
			if(counter == this.counter) this.refreshPositions(!hardRefresh); //Precompute after each DOM insertion, NOT on mousemove
		});

	},

	_clear: function(event, noPropagation) {

		this.reverting = false;
		// We delay all events that have to be triggered to after the point where the placeholder has been removed and
		// everything else normalized again
		var delayedTriggers = [];

		// We first have to update the dom position of the actual currentItem
		// Note: don't do it if the current item is already removed (by a user), or it gets reappended (see #4088)
		if(!this._noFinalSort && this.currentItem.parent().length) this.placeholder.before(this.currentItem);
		this._noFinalSort = null;

		if(this.helper[0] == this.currentItem[0]) {
			for(var i in this._storedCSS) {
				if(this._storedCSS[i] == 'auto' || this._storedCSS[i] == 'static') this._storedCSS[i] = '';
			}
			this.currentItem.css(this._storedCSS).removeClass("ui-sortable-helper");
		} else {
			this.currentItem.show();
		}

		if(this.fromOutside && !noPropagation) delayedTriggers.push(function(event) { this._trigger("receive", event, this._uiHash(this.fromOutside)); });
		if((this.fromOutside || this.domPosition.prev != this.currentItem.prev().not(".ui-sortable-helper")[0] || this.domPosition.parent != this.currentItem.parent()[0]) && !noPropagation) delayedTriggers.push(function(event) { this._trigger("update", event, this._uiHash()); }); //Trigger update callback if the DOM position has changed

		// Check if the items Container has Changed and trigger appropriate
		// events.
		if (this !== this.currentContainer) {
			if(!noPropagation) {
				delayedTriggers.push(function(event) { this._trigger("remove", event, this._uiHash()); });
				delayedTriggers.push((function(c) { return function(event) { c._trigger("receive", event, this._uiHash(this)); };  }).call(this, this.currentContainer));
				delayedTriggers.push((function(c) { return function(event) { c._trigger("update", event, this._uiHash(this));  }; }).call(this, this.currentContainer));
			}
		}


		//Post events to containers
		for (var i = this.containers.length - 1; i >= 0; i--){
			if(!noPropagation) delayedTriggers.push((function(c) { return function(event) { c._trigger("deactivate", event, this._uiHash(this)); };  }).call(this, this.containers[i]));
			if(this.containers[i].containerCache.over) {
				delayedTriggers.push((function(c) { return function(event) { c._trigger("out", event, this._uiHash(this)); };  }).call(this, this.containers[i]));
				this.containers[i].containerCache.over = 0;
			}
		}

		//Do what was originally in plugins
		if(this._storedCursor) $('body').css("cursor", this._storedCursor); //Reset cursor
		if(this._storedOpacity) this.helper.css("opacity", this._storedOpacity); //Reset opacity
		if(this._storedZIndex) this.helper.css("zIndex", this._storedZIndex == 'auto' ? '' : this._storedZIndex); //Reset z-index

		this.dragging = false;
		if(this.cancelHelperRemoval) {
			if(!noPropagation) {
				this._trigger("beforeStop", event, this._uiHash());
				for (var i=0; i < delayedTriggers.length; i++) { delayedTriggers[i].call(this, event); }; //Trigger all delayed events
				this._trigger("stop", event, this._uiHash());
			}

			this.fromOutside = false;
			return false;
		}

		if(!noPropagation) this._trigger("beforeStop", event, this._uiHash());

		//$(this.placeholder[0]).remove(); would have been the jQuery way - unfortunately, it unbinds ALL events from the original node!
		this.placeholder[0].parentNode.removeChild(this.placeholder[0]);

		if(this.helper[0] != this.currentItem[0]) this.helper.remove(); this.helper = null;

		if(!noPropagation) {
			for (var i=0; i < delayedTriggers.length; i++) { delayedTriggers[i].call(this, event); }; //Trigger all delayed events
			this._trigger("stop", event, this._uiHash());
		}

		this.fromOutside = false;
		return true;

	},

	_trigger: function() {
		if ($.Widget.prototype._trigger.apply(this, arguments) === false) {
			this.cancel();
		}
	},

	_uiHash: function(_inst) {
		var inst = _inst || this;
		return {
			helper: inst.helper,
			placeholder: inst.placeholder || $([]),
			position: inst.position,
			originalPosition: inst.originalPosition,
			offset: inst.positionAbs,
			item: inst.currentItem,
			sender: _inst ? _inst.element : null
		};
	}

});

})(jQuery);
;/*
 * jQuery UI Widget 1.8.23+amd
 * https://github.com/blueimp/jQuery-File-Upload
 *
 * Copyright 2012, AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * http://docs.jquery.com/UI/Widget
 */

(function (factory) {
    if (typeof define === "function" && define.amd) {
        // Register as an anonymous AMD module:
        define(["jquery"], factory);
    } else {
        // Browser globals:
        factory(jQuery);
    }
}(function( $, undefined ) {

// jQuery 1.4+
if ( $.cleanData ) {
	var _cleanData = $.cleanData;
	$.cleanData = function( elems ) {
		for ( var i = 0, elem; (elem = elems[i]) != null; i++ ) {
			try {
				$( elem ).triggerHandler( "remove" );
			// http://bugs.jquery.com/ticket/8235
			} catch( e ) {}
		}
		_cleanData( elems );
	};
} else {
	var _remove = $.fn.remove;
	$.fn.remove = function( selector, keepData ) {
		return this.each(function() {
			if ( !keepData ) {
				if ( !selector || $.filter( selector, [ this ] ).length ) {
					$( "*", this ).add( [ this ] ).each(function() {
						try {
							$( this ).triggerHandler( "remove" );
						// http://bugs.jquery.com/ticket/8235
						} catch( e ) {}
					});
				}
			}
			return _remove.call( $(this), selector, keepData );
		});
	};
}

$.widget = function( name, base, prototype ) {
	var namespace = name.split( "." )[ 0 ],
		fullName;
	name = name.split( "." )[ 1 ];
	fullName = namespace + "-" + name;

	if ( !prototype ) {
		prototype = base;
		base = $.Widget;
	}

	// create selector for plugin
	$.expr[ ":" ][ fullName ] = function( elem ) {
		return !!$.data( elem, name );
	};

	$[ namespace ] = $[ namespace ] || {};
	$[ namespace ][ name ] = function( options, element ) {
		// allow instantiation without initializing for simple inheritance
		if ( arguments.length ) {
			this._createWidget( options, element );
		}
	};

	var basePrototype = new base();
	// we need to make the options hash a property directly on the new instance
	// otherwise we'll modify the options hash on the prototype that we're
	// inheriting from
//	$.each( basePrototype, function( key, val ) {
//		if ( $.isPlainObject(val) ) {
//			basePrototype[ key ] = $.extend( {}, val );
//		}
//	});
	basePrototype.options = $.extend( true, {}, basePrototype.options );
	$[ namespace ][ name ].prototype = $.extend( true, basePrototype, {
		namespace: namespace,
		widgetName: name,
		widgetEventPrefix: $[ namespace ][ name ].prototype.widgetEventPrefix || name,
		widgetBaseClass: fullName
	}, prototype );

	$.widget.bridge( name, $[ namespace ][ name ] );
};

$.widget.bridge = function( name, object ) {
	$.fn[ name ] = function( options ) {
		var isMethodCall = typeof options === "string",
			args = Array.prototype.slice.call( arguments, 1 ),
			returnValue = this;

		// allow multiple hashes to be passed on init
		options = !isMethodCall && args.length ?
			$.extend.apply( null, [ true, options ].concat(args) ) :
			options;

		// prevent calls to internal methods
		if ( isMethodCall && options.charAt( 0 ) === "_" ) {
			return returnValue;
		}

		if ( isMethodCall ) {
			this.each(function() {
				var instance = $.data( this, name ),
					methodValue = instance && $.isFunction( instance[options] ) ?
						instance[ options ].apply( instance, args ) :
						instance;
				// TODO: add this back in 1.9 and use $.error() (see #5972)
//				if ( !instance ) {
//					throw "cannot call methods on " + name + " prior to initialization; " +
//						"attempted to call method '" + options + "'";
//				}
//				if ( !$.isFunction( instance[options] ) ) {
//					throw "no such method '" + options + "' for " + name + " widget instance";
//				}
//				var methodValue = instance[ options ].apply( instance, args );
				if ( methodValue !== instance && methodValue !== undefined ) {
					returnValue = methodValue;
					return false;
				}
			});
		} else {
			this.each(function() {
				var instance = $.data( this, name );
				if ( instance ) {
					instance.option( options || {} )._init();
				} else {
					$.data( this, name, new object( options, this ) );
				}
			});
		}

		return returnValue;
	};
};

$.Widget = function( options, element ) {
	// allow instantiation without initializing for simple inheritance
	if ( arguments.length ) {
		this._createWidget( options, element );
	}
};

$.Widget.prototype = {
	widgetName: "widget",
	widgetEventPrefix: "",
	options: {
		disabled: false
	},
	_createWidget: function( options, element ) {
		// $.widget.bridge stores the plugin instance, but we do it anyway
		// so that it's stored even before the _create function runs
		$.data( element, this.widgetName, this );
		this.element = $( element );
		this.options = $.extend( true, {},
			this.options,
			this._getCreateOptions(),
			options );

		var self = this;
		this.element.bind( "remove." + this.widgetName, function() {
			self.destroy();
		});

		this._create();
		this._trigger( "create" );
		this._init();
	},
	_getCreateOptions: function() {
		return $.metadata && $.metadata.get( this.element[0] )[ this.widgetName ];
	},
	_create: function() {},
	_init: function() {},

	destroy: function() {
		this.element
			.unbind( "." + this.widgetName )
			.removeData( this.widgetName );
		this.widget()
			.unbind( "." + this.widgetName )
			.removeAttr( "aria-disabled" )
			.removeClass(
				this.widgetBaseClass + "-disabled " +
				"ui-state-disabled" );
	},

	widget: function() {
		return this.element;
	},

	option: function( key, value ) {
		var options = key;

		if ( arguments.length === 0 ) {
			// don't return a reference to the internal hash
			return $.extend( {}, this.options );
		}

		if  (typeof key === "string" ) {
			if ( value === undefined ) {
				return this.options[ key ];
			}
			options = {};
			options[ key ] = value;
		}

		this._setOptions( options );

		return this;
	},
	_setOptions: function( options ) {
		var self = this;
		$.each( options, function( key, value ) {
			self._setOption( key, value );
		});

		return this;
	},
	_setOption: function( key, value ) {
		this.options[ key ] = value;

		if ( key === "disabled" ) {
			this.widget()
				[ value ? "addClass" : "removeClass"](
					this.widgetBaseClass + "-disabled" + " " +
					"ui-state-disabled" )
				.attr( "aria-disabled", value );
		}

		return this;
	},

	enable: function() {
		return this._setOption( "disabled", false );
	},
	disable: function() {
		return this._setOption( "disabled", true );
	},

	_trigger: function( type, event, data ) {
		var prop, orig,
			callback = this.options[ type ];

		data = data || {};
		event = $.Event( event );
		event.type = ( type === this.widgetEventPrefix ?
			type :
			this.widgetEventPrefix + type ).toLowerCase();
		// the original event may come from any element
		// so we need to reset the target on the new event
		event.target = this.element[ 0 ];

		// copy original event properties over to the new event
		orig = event.originalEvent;
		if ( orig ) {
			for ( prop in orig ) {
				if ( !( prop in event ) ) {
					event[ prop ] = orig[ prop ];
				}
			}
		}

		this.element.trigger( event, data );

		return !( $.isFunction(callback) &&
			callback.call( this.element[0], event, data ) === false ||
			event.isDefaultPrevented() );
	}
};

}));
;/*!
 * http://www.JSON.org/json2.js
 * Public Domain
 *
 * JSON.stringify(value, [replacer, [space]])
 * JSON.parse(text, reviver)
 */

/*
    http://www.JSON.org/json2.js
    2009-09-29

    Public Domain.

    NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.

    See http://www.JSON.org/js.html


    This code should be minified before deployment.
    See http://javascript.crockford.com/jsmin.html

    USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
    NOT CONTROL.


    This file creates a global JSON object containing two methods: stringify
    and parse.

        JSON.stringify(value, replacer, space)
            value       any JavaScript value, usually an object or array.

            replacer    an optional parameter that determines how object
                        values are stringified for objects. It can be a
                        function or an array of strings.

            space       an optional parameter that specifies the indentation
                        of nested structures. If it is omitted, the text will
                        be packed without extra whitespace. If it is a number,
                        it will specify the number of spaces to indent at each
                        level. If it is a string (such as '\t' or '&nbsp;'),
                        it contains the characters used to indent at each level.

            This method produces a JSON text from a JavaScript value.

            When an object value is found, if the object contains a toJSON
            method, its toJSON method will be called and the result will be
            stringified. A toJSON method does not serialize: it returns the
            value represented by the name/value pair that should be serialized,
            or undefined if nothing should be serialized. The toJSON method
            will be passed the key associated with the value, and this will be
            bound to the value

            For example, this would serialize Dates as ISO strings.

                Date.prototype.toJSON = function (key) {
                    function f(n) {
                        // Format integers to have at least two digits.
                        return n < 10 ? '0' + n : n;
                    }

                    return this.getUTCFullYear()   + '-' +
                         f(this.getUTCMonth() + 1) + '-' +
                         f(this.getUTCDate())      + 'T' +
                         f(this.getUTCHours())     + ':' +
                         f(this.getUTCMinutes())   + ':' +
                         f(this.getUTCSeconds())   + 'Z';
                };

            You can provide an optional replacer method. It will be passed the
            key and value of each member, with this bound to the containing
            object. The value that is returned from your method will be
            serialized. If your method returns undefined, then the member will
            be excluded from the serialization.

            If the replacer parameter is an array of strings, then it will be
            used to select the members to be serialized. It filters the results
            such that only members with keys listed in the replacer array are
            stringified.

            Values that do not have JSON representations, such as undefined or
            functions, will not be serialized. Such values in objects will be
            dropped; in arrays they will be replaced with null. You can use
            a replacer function to replace those with JSON values.
            JSON.stringify(undefined) returns undefined.

            The optional space parameter produces a stringification of the
            value that is filled with line breaks and indentation to make it
            easier to read.

            If the space parameter is a non-empty string, then that string will
            be used for indentation. If the space parameter is a number, then
            the indentation will be that many spaces.

            Example:

            text = JSON.stringify(['e', {pluribus: 'unum'}]);
            // text is '["e",{"pluribus":"unum"}]'


            text = JSON.stringify(['e', {pluribus: 'unum'}], null, '\t');
            // text is '[\n\t"e",\n\t{\n\t\t"pluribus": "unum"\n\t}\n]'

            text = JSON.stringify([new Date()], function (key, value) {
                return this[key] instanceof Date ?
                    'Date(' + this[key] + ')' : value;
            });
            // text is '["Date(---current time---)"]'


        JSON.parse(text, reviver)
            This method parses a JSON text to produce an object or array.
            It can throw a SyntaxError exception.

            The optional reviver parameter is a function that can filter and
            transform the results. It receives each of the keys and values,
            and its return value is used instead of the original value.
            If it returns what it received, then the structure is not modified.
            If it returns undefined then the member is deleted.

            Example:

            // Parse the text. Values that look like ISO date strings will
            // be converted to Date objects.

            myData = JSON.parse(text, function (key, value) {
                var a;
                if (typeof value === 'string') {
                    a =
/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
                    if (a) {
                        return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4],
                            +a[5], +a[6]));
                    }
                }
                return value;
            });

            myData = JSON.parse('["Date(09/09/2001)"]', function (key, value) {
                var d;
                if (typeof value === 'string' &&
                        value.slice(0, 5) === 'Date(' &&
                        value.slice(-1) === ')') {
                    d = new Date(value.slice(5, -1));
                    if (d) {
                        return d;
                    }
                }
                return value;
            });


    This is a reference implementation. You are free to copy, modify, or
    redistribute.
*/

/*jslint evil: true, strict: false */

/*members "", "\b", "\t", "\n", "\f", "\r", "\"", JSON, "\\", apply,
    call, charCodeAt, getUTCDate, getUTCFullYear, getUTCHours,
    getUTCMinutes, getUTCMonth, getUTCSeconds, hasOwnProperty, join,
    lastIndex, length, parse, prototype, push, replace, slice, stringify,
    test, toJSON, toString, valueOf
*/


// Create a JSON object only if one does not already exist. We create the
// methods in a closure to avoid creating global variables.

if (!this.JSON) {
    this.JSON = {};
}

(function () {

    function f(n) {
        // Format integers to have at least two digits.
        return n < 10 ? '0' + n : n;
    }

    if (typeof Date.prototype.toJSON !== 'function') {

        Date.prototype.toJSON = function (key) {

            return isFinite(this.valueOf()) ?
                   this.getUTCFullYear()   + '-' +
                 f(this.getUTCMonth() + 1) + '-' +
                 f(this.getUTCDate())      + 'T' +
                 f(this.getUTCHours())     + ':' +
                 f(this.getUTCMinutes())   + ':' +
                 f(this.getUTCSeconds())   + 'Z' : null;
        };

        String.prototype.toJSON =
        Number.prototype.toJSON =
        Boolean.prototype.toJSON = function (key) {
            return this.valueOf();
        };
    }

    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        gap,
        indent,
        meta = {    // table of character substitutions
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"' : '\\"',
            '\\': '\\\\'
        },
        rep;


    function quote(string) {

// If the string contains no control characters, no quote characters, and no
// backslash characters, then we can safely slap some quotes around it.
// Otherwise we must also replace the offending characters with safe escape
// sequences.

        escapable.lastIndex = 0;
        return escapable.test(string) ?
            '"' + string.replace(escapable, function (a) {
                var c = meta[a];
                return typeof c === 'string' ? c :
                    '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
            }) + '"' :
            '"' + string + '"';
    }


    function str(key, holder) {

// Produce a string from holder[key].

        var i,          // The loop counter.
            k,          // The member key.
            v,          // The member value.
            length,
            mind = gap,
            partial,
            value = holder[key];

// If the value has a toJSON method, call it to obtain a replacement value.

        if (value && typeof value === 'object' &&
                typeof value.toJSON === 'function') {
            value = value.toJSON(key);
        }

// If we were called with a replacer function, then call the replacer to
// obtain a replacement value.

        if (typeof rep === 'function') {
            value = rep.call(holder, key, value);
        }

// What happens next depends on the value's type.

        switch (typeof value) {
        case 'string':
            return quote(value);

        case 'number':

// JSON numbers must be finite. Encode non-finite numbers as null.

            return isFinite(value) ? String(value) : 'null';

        case 'boolean':
        case 'null':

// If the value is a boolean or null, convert it to a string. Note:
// typeof null does not produce 'null'. The case is included here in
// the remote chance that this gets fixed someday.

            return String(value);

// If the type is 'object', we might be dealing with an object or an array or
// null.

        case 'object':

// Due to a specification blunder in ECMAScript, typeof null is 'object',
// so watch out for that case.

            if (!value) {
                return 'null';
            }

// Make an array to hold the partial results of stringifying this object value.

            gap += indent;
            partial = [];

// Is the value an array?

            if (Object.prototype.toString.apply(value) === '[object Array]') {

// The value is an array. Stringify every element. Use null as a placeholder
// for non-JSON values.

                length = value.length;
                for (i = 0; i < length; i += 1) {
                    partial[i] = str(i, value) || 'null';
                }

// Join all of the elements together, separated with commas, and wrap them in
// brackets.

                v = partial.length === 0 ? '[]' :
                    gap ? '[\n' + gap +
                            partial.join(',\n' + gap) + '\n' +
                                mind + ']' :
                          '[' + partial.join(',') + ']';
                gap = mind;
                return v;
            }

// If the replacer is an array, use it to select the members to be stringified.

            if (rep && typeof rep === 'object') {
                length = rep.length;
                for (i = 0; i < length; i += 1) {
                    k = rep[i];
                    if (typeof k === 'string') {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            } else {

// Otherwise, iterate through all of the keys in the object.

                for (k in value) {
                    if (Object.hasOwnProperty.call(value, k)) {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            }

// Join all of the member texts together, separated with commas,
// and wrap them in braces.

            v = partial.length === 0 ? '{}' :
                gap ? '{\n' + gap + partial.join(',\n' + gap) + '\n' +
                        mind + '}' : '{' + partial.join(',') + '}';
            gap = mind;
            return v;
        }
    }

// If the JSON object does not yet have a stringify method, give it one.

    if (typeof JSON.stringify !== 'function') {
        JSON.stringify = function (value, replacer, space) {

// The stringify method takes a value and an optional replacer, and an optional
// space parameter, and returns a JSON text. The replacer can be a function
// that can replace values, or an array of strings that will select the keys.
// A default replacer method can be provided. Use of the space parameter can
// produce text that is more easily readable.

            var i;
            gap = '';
            indent = '';

// If the space parameter is a number, make an indent string containing that
// many spaces.

            if (typeof space === 'number') {
                for (i = 0; i < space; i += 1) {
                    indent += ' ';
                }

// If the space parameter is a string, it will be used as the indent string.

            } else if (typeof space === 'string') {
                indent = space;
            }

// If there is a replacer, it must be a function or an array.
// Otherwise, throw an error.

            rep = replacer;
            if (replacer && typeof replacer !== 'function' &&
                    (typeof replacer !== 'object' ||
                     typeof replacer.length !== 'number')) {
                throw new Error('JSON.stringify');
            }

// Make a fake root object containing our value under the key of ''.
// Return the result of stringifying the value.

            return str('', {'': value});
        };
    }


// If the JSON object does not yet have a parse method, give it one.

    if (typeof JSON.parse !== 'function') {
        JSON.parse = function (text, reviver) {

// The parse method takes a text and an optional reviver function, and returns
// a JavaScript value if the text is a valid JSON text.

            var j;

            function walk(holder, key) {

// The walk method is used to recursively walk the resulting structure so
// that modifications can be made.

                var k, v, value = holder[key];
                if (value && typeof value === 'object') {
                    for (k in value) {
                        if (Object.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }


// Parsing happens in four stages. In the first stage, we replace certain
// Unicode characters with escape sequences. JavaScript handles many characters
// incorrectly, either silently deleting them, or treating them as line endings.

            cx.lastIndex = 0;
            if (cx.test(text)) {
                text = text.replace(cx, function (a) {
                    return '\\u' +
                        ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                });
            }

// In the second stage, we run the text against regular expressions that look
// for non-JSON patterns. We are especially concerned with '()' and 'new'
// because they can cause invocation, and '=' because it can cause mutation.
// But just to be safe, we want to reject all unexpected forms.

// We split the second stage into 4 regexp operations in order to work around
// crippling inefficiencies in IE's and Safari's regexp engines. First we
// replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
// replace all simple value tokens with ']' characters. Third, we delete all
// open brackets that follow a colon or comma or that begin the text. Finally,
// we look to see that the remaining characters are only whitespace or ']' or
// ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.

            if (/^[\],:{}\s]*$/.
test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@').
replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').
replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

// In the third stage we use the eval function to compile the text into a
// JavaScript structure. The '{' operator is subject to a syntactic ambiguity
// in JavaScript: it can begin a block or an object literal. We wrap the text
// in parens to eliminate the ambiguity.

                j = eval('(' + text + ')');

// In the optional fourth stage, we recursively walk the new structure, passing
// each name/value pair to a reviver function for possible transformation.

                return typeof reviver === 'function' ?
                    walk({'': j}, '') : j;
            }

// If the text is not JSON parseable, then a SyntaxError is thrown.

            throw new SyntaxError('JSON.parse');
        };
    }
}());;/*
	Kailash Nadh (http://nadh.in)
	
	localStorageDB
	September 2011
	A simple database layer for localStorage

	v 1.9 November 2012
	v 2.0 June 2013

	License	:	MIT License
*/

function localStorageDB(db_name, engine) {

	var db_prefix = 'db_',
		db_id = db_prefix + db_name,
		db_new = false,	// this flag determines whether a new database was created during an object initialisation
		db = null;

		try {
			var storage = (engine == sessionStorage ? sessionStorage: localStorage);
		} catch(e) { // ie8 hack
			var storage = engine;
		}

	// if the database doesn't exist, create it
	db = storage[ db_id ];
	if( !( db && (db = JSON.parse(db)) && db.tables && db.data ) ) {
		if(!validateName(db_name)) {
			error("The name '" + db_name + "'" + " contains invalid characters.");
		} else {
			db = {tables: {}, data: {}};
			commit();
			db_new = true;
		}
	}
	
	
	// ______________________ private methods
	
	// _________ database functions
	// drop the database
	function drop() {
		delete storage[db_id];
		db = null;
	}
			
	// number of tables in the database
	function tableCount() {
		var count = 0;
		for(var table in db.tables) {
			if( db.tables.hasOwnProperty(table) ) {
				count++;
			}
		}
		return count;
	}

	// _________ table functions
	
	// check whether a table exists
	function tableExists(table_name) {
		return db.tables[table_name] ? true : false;
	}
	
	// check whether a table exists, and if not, throw an error
	function tableExistsWarn(table_name) {
		if(!tableExists(table_name)) {
			error("The table '" + table_name + "' does not exist.");
		}
	}
		
	// create a table
	function createTable(table_name, fields) {
		db.tables[table_name] = {fields: fields, auto_increment: 1};
		db.data[table_name] = {};
	}
	
	// drop a table
	function dropTable(table_name) {
		delete db.tables[table_name];
		delete db.data[table_name];
	}
	
	// empty a table
	function truncate(table_name) {
		db.tables[table_name].auto_increment = 1;
		db.data[table_name] = {};
	}
	
	// number of rows in a table
	function rowCount(table_name) {
		var count = 0;
		for(var ID in db.data[table_name]) {
			if( db.data[table_name].hasOwnProperty(ID) ) {
				count++;
			}
		}
		return count;
	}
	
	// insert a new row
	function insert(table_name, data) {
		data.ID = db.tables[table_name].auto_increment;
		db.data[table_name][ db.tables[table_name].auto_increment ] = data;
		db.tables[table_name].auto_increment++;
		return data.ID;
	}
	
	// select rows, given a list of IDs of rows in a table
	function select(table_name, ids) {
		var ID = null, results = [], row = null;
		for(var i=0; i<ids.length; i++) {
			ID = ids[i];
			row = db.data[table_name][ID];
			results.push( clone(row) );
		}
		return results;
	}
	
	// select rows in a table by field-value pairs, returns the IDs of matches
	function queryByValues(table_name, data, limit) {
		var result_ids = [],
			exists = false,
			row = null;

		// loop through all the records in the table, looking for matches
		for(var ID in db.data[table_name]) {
			if( !db.data[table_name].hasOwnProperty(ID) ) {
				continue;
			}

			row = db.data[table_name][ID];
			exists = true;

			for(var field in data) {
				if( !data.hasOwnProperty(field) ) {
					continue;
				}

				if(typeof data[field] == 'string') {	// if the field is a string, do a case insensitive comparison
					if( row[field].toString().toLowerCase() != data[field].toString().toLowerCase() ) {
						exists = false;
						break;
					}
				} else {
					if( row[field] != data[field] ) {
						exists = false;
						break;
					}
				}
			}
			if(exists) {
				result_ids.push(ID);
			}
			if(result_ids.length == limit) {
				break;
			}
		}
		return result_ids;
	}
	
	// select rows in a table by a function, returns the IDs of matches
	function queryByFunction(table_name, query_function, limit) {
		var result_ids = [],
			exists = false,
			row = null;

		// loop through all the records in the table, looking for matches
		for(var ID in db.data[table_name]) {
			if( !db.data[table_name].hasOwnProperty(ID) ) {
				continue;
			}

			row = db.data[table_name][ID];

			if( query_function( clone(row) ) == true ) {	// it's a match if the supplied conditional function is satisfied
				result_ids.push(ID);
			}
			if(result_ids.length == limit) {
				break;
			}
		}
		return result_ids;
	}
	
	// return all the IDs in a table
	function getIDs(table_name, limit) {
		var result_ids = [];
		for(var ID in db.data[table_name]) {
			if( db.data[table_name].hasOwnProperty(ID) ) {
				result_ids.push(ID);

				if(result_ids.length == limit) {
					break;
				}
			}
		}
		return result_ids;
	}
	
	// delete rows, given a list of their IDs in a table
	function deleteRows(table_name, ids) {
		for(var i=0; i<ids.length; i++) {
			if( db.data[table_name].hasOwnProperty(ids[i]) ) {
				delete db.data[table_name][ ids[i] ];
			}
		}
		return ids.length;
	}
	
	// update rows
	function update(table_name, ids, update_function) {
		var ID = '', num = 0;

		for(var i=0; i<ids.length; i++) {
			ID = ids[i];

			var updated_data = update_function( clone(db.data[table_name][ID]) );

			if(updated_data) {
				delete updated_data['ID']; // no updates possible to ID

				var new_data = db.data[table_name][ID];				
				// merge updated data with existing data
				for(var field in updated_data) {
					if( updated_data.hasOwnProperty(field) ) {
						new_data[field] = updated_data[field];
					}
				}

				db.data[table_name][ID] = validFields(table_name, new_data);
				num++;
			}
		}
		return num;
	}
	


	// commit the database to localStorage
	function commit() {
		storage[db_id] = JSON.stringify(db);
	}
	
	// serialize the database
	function serialize() {
		return JSON.stringify(db);
	}
	
	// throw an error
	function error(msg) {
		throw new Error(msg);
	}
	
	// clone an object
	function clone(obj) {
		var new_obj = {};
		for(var key in obj) {
			if( obj.hasOwnProperty(key) ) {
				new_obj[key] = obj[key];
			}
		}
		return new_obj;
	}
	
	// validate db, table, field names (alpha-numeric only)
	function validateName(name) {
		return name.match(/[^a-z_0-9]/ig) ? false : true;
	}
	
	// given a data list, only retain valid fields in a table
	function validFields(table_name, data) {
		var field = '', new_data = {};

		for(var i=0; i<db.tables[table_name].fields.length; i++) {
			field = db.tables[table_name].fields[i];
			
			if(data[field]) {
				new_data[field] = data[field];
			}
		}
		return new_data;
	}
	
	// given a data list, populate with valid field names of a table
	function validateData(table_name, data) {
		var field = '', new_data = {};
		for(var i=0; i<db.tables[table_name].fields.length; i++) {
			field = db.tables[table_name].fields[i];
			new_data[field] = data[field] ? data[field] : null;
		}
		return new_data;
	}
	


	// ______________________ public methods

	return {
		// commit the database to localStorage
		commit: function() {
			commit();
		},
		
		// is this instance a newly created database?
		isNew: function() {
			return db_new;
		},
		
		// delete the database
		drop: function() {
			drop();
		},
		
		// serialize the database
		serialize: function() {
			return serialize();
		},
		
		// check whether a table exists
		tableExists: function(table_name) {
			return tableExists(table_name);
		},
		
		// number of tables in the database
		tableCount: function() {
			return tableCount();
		},
		
		// create a table
		createTable: function(table_name, fields) {
			var result = false;
			if(!validateName(table_name)) {
				error("The database name '" + table_name + "'" + " contains invalid characters.");
			} else if(this.tableExists(table_name)) {
				error("The table name '" + table_name + "' already exists.");
			} else {
				// make sure field names are valid
				var is_valid = true;
				for(var i=0; i<fields.length; i++) {
					if(!validateName(fields[i])) {
						is_valid = false;
						break;
					}
				}
				
				if(is_valid) {
					// cannot use indexOf due to <IE9 incompatibility
					// de-duplicate the field list
					var fields_literal = {};
					for(var i=0; i<fields.length; i++) {
						fields_literal[ fields[i] ] = true;
					}
					delete fields_literal['ID']; // ID is a reserved field name

					fields = ['ID'];
					for(var field in fields_literal) {
						if( fields_literal.hasOwnProperty(field) ) {
							fields.push(field);
						}
					}

					createTable(table_name, fields);
					result = true;
				} else {
					error("One or more field names in the table definition contains invalid characters.");
				}
			}

			return result;
		},
		
		// drop a table
		dropTable: function(table_name) {
			tableExistsWarn(table_name);
			dropTable(table_name);
		},
		
		// empty a table
		truncate: function(table_name) {
			tableExistsWarn(table_name);
			truncate(table_name);
		},
		
		// number of rows in a table
		rowCount: function(table_name) {
			tableExistsWarn(table_name);
			return rowCount(table_name);
		},
		
		// insert a row
		insert: function(table_name, data) {
			tableExistsWarn(table_name);
			return insert(table_name, validateData(table_name, data) );
		},

		// insert or update based on a given condition
		insertOrUpdate: function(table_name, query, data) {
			tableExistsWarn(table_name);

			var result_ids = [];
			if(!query) {
				result_ids = getIDs(table_name);				// there is no query. applies to all records
			} else if(typeof query == 'object') {				// the query has key-value pairs provided
				result_ids = queryByValues(table_name, validFields(table_name, query));
			} else if(typeof query == 'function') {				// the query has a conditional map function provided
				result_ids = queryByFunction(table_name, query);
			}

			// no existing records matched, so insert a new row
			if(result_ids.length == 0) {
				return insert(table_name, validateData(table_name, data) );
			} else {
				var ids = [];
				for(var n=0; n<result_ids.length; n++) {
					update(table_name, result_ids, function(o) {
						ids.push(o.ID);
						return data;
					});
				}

				return ids;
			}
		},
		
		// update rows
		update: function(table_name, query, update_function) {
			tableExistsWarn(table_name);

			var result_ids = [];
			if(!query) {
				result_ids = getIDs(table_name);				// there is no query. applies to all records
			} else if(typeof query == 'object') {				// the query has key-value pairs provided
				result_ids = queryByValues(table_name, validFields(table_name, query));
			} else if(typeof query == 'function') {				// the query has a conditional map function provided
				result_ids = queryByFunction(table_name, query);
			}
			return update(table_name, result_ids, update_function);
		},

		// select rows
		query: function(table_name, query, limit) {
			tableExistsWarn(table_name);
			
			var result_ids = [];
			if(!query) {
				result_ids = getIDs(table_name, limit); // no conditions given, return all records
			} else if(typeof query == 'object') {			// the query has key-value pairs provided
				result_ids = queryByValues(table_name, validFields(table_name, query), limit);
			} else if(typeof query == 'function') {		// the query has a conditional map function provided
				result_ids = queryByFunction(table_name, query, limit);
			}
			return select(table_name, result_ids, limit);
		},

		// delete rows
		deleteRows: function(table_name, query) {
			tableExistsWarn(table_name);

			var result_ids = [];
			if(!query) {
				result_ids = getIDs(table_name);
			} else if(typeof query == 'object') {
				result_ids = queryByValues(table_name, validFields(table_name, query));
			} else if(typeof query == 'function') {
				result_ids = queryByFunction(table_name, query);
			}
			return deleteRows(table_name, result_ids);
		}
	}
};var InterfaceBuilder = function() {
	
	var IB = this;
	
	/*------------------------------------------
	 *	Methods
	/* -------------------------------------- */
	
	IB.matrix = function(obj) {
	
		$(obj).each(function() {
			
			var $wrapper = $(this);
		
			var $body = $wrapper.find("tbody");
			var $head = $wrapper.find("thead tr");
			var name  = $wrapper.data('name');
			var columns = [];
			
			$head.find('th').each(function(i) {
				if(i > 0) {
					columns.push($(this).data('col'));
				}
			});
			
			$wrapper.find(".ib-add-row").live('click', function(e) {
				
				var row = $("<tr />");
				var index = $body.find("tr").length;
				
				row.append("<td><div class=\"ib-drag-handle\"></div></td>");
		
				for(var x = 1; x < $head.find("th").length - 1; x++) {
					row.append("<td><input type=\"text\" name=\""+name+"["+index+"]["+columns[x-1]+"]\" value=\"\" class=\"ib-cell\" /></td>");
				}
		
				row.append("<td><a href=\"#"+index+"\" class=\"ib-delete-row\">Delete</a></td>");
		
				$body.append(row);
		
				e.preventDefault();
			});
			
			$wrapper.find(".ib-delete-row").live('click', function() {		
				$(this).parent().parent().remove();
				
				$body.find('tr').each(function(index) {
					
					var td = $(this).find('td');
					var length = td.length;
					
					td.each(function(i) {
						if(i > 0 && (i + 1) < length) {
							var $input = $(this).find('input');
							var name   = $input.attr('name').replace(/(\[\d\]\[)/g, "\["+index+"\][");			
							$input.attr('name', name);
						}	
					});
					
				});
				
				return false;
			});
					
		});
	}
	
	/*------------------------------------------
	 *	Construct
	/* -------------------------------------- */
	
	IB.matrix('.ib-matrix');
	
}
;/*
	Base.js, version 1.1a
	Copyright 2006-2010, Dean Edwards
	License: http://www.opensource.org/licenses/mit-license.php
*/

var Base = function() {
	// dummy
};

Base.extend = function(_instance, _static) { // subclass
	var extend = Base.prototype.extend;
	
	// build the prototype
	Base._prototyping = true;
	var proto = new this;
	extend.call(proto, _instance);
	proto.base = function() {
    	// call this method from any other method to invoke that method's ancestor
    };
	
	delete Base._prototyping;
	
	// create the wrapper for the constructor function
	//var constructor = proto.constructor.valueOf(); //-dean
	var constructor = proto.constructor;
	var klass = proto.constructor = function() {
		if (!Base._prototyping) {
			if (this._constructing || this.constructor == klass) { // instantiation
				this._constructing = true;
				constructor.apply(this, arguments);
				delete this._constructing;
			} else if (arguments[0] != null) { // casting
				return (arguments[0].extend || extend).call(arguments[0], proto);
			}
		}
	};
	
	// build the class interface
	klass.ancestor = this;
	klass.extend = this.extend;
	klass.forEach = this.forEach;
	klass.implement = this.implement;
	klass.prototype = proto;
	klass.toString = this.toString;
	klass.valueOf = function(type) {
		//return (type == "object") ? klass : constructor; //-dean
		return (type == "object") ? klass : constructor.valueOf();
	};
	extend.call(klass, _static);
	// class initialisation
	if (typeof klass.init == "function") klass.init();
	return klass;
};

Base.prototype = {	
	extend: function(source, value) {
		if (arguments.length > 1) { // extending with a name/value pair
			var ancestor = this[source];
			if (ancestor && (typeof value == "function") && // overriding a method?
				// the valueOf() comparison is to avoid circular references
				(!ancestor.valueOf || ancestor.valueOf() != value.valueOf()) &&
				/\bbase\b/.test(value)) {
				// get the underlying method
				var method = value.valueOf();
				// override
				value = function() {
					var previous = this.base || Base.prototype.base;
					this.base = ancestor;
					var returnValue = method.apply(this, arguments);
					this.base = previous;
					return returnValue;
				};
				// point to the underlying method
				value.valueOf = function(type) {
					return (type == "object") ? value : method;
				};
				value.toString = Base.toString;
			}
			this[source] = value;
		} else if (source) { // extending with an object literal
			var extend = Base.prototype.extend;
			// if this object has a customised extend method then use it
			if (!Base._prototyping && typeof this != "function") {
				extend = this.extend || extend;
			}
			var proto = {toSource: null};
			// do the "toString" and other methods manually
			var hidden = ["constructor", "toString", "valueOf"];
			// if we are prototyping then include the constructor
			var i = Base._prototyping ? 0 : 1;
			while (key = hidden[i++]) {
				if (source[key] != proto[key]) {
					extend.call(this, key, source[key]);

				}
			}
			// copy each of the source object's properties to this object
			for (var key in source) {
				if (!proto[key]) extend.call(this, key, source[key]);
			}
		}
		return this;
	}
};

// initialise
Base = Base.extend({
	constructor: function() {
		this.extend(arguments[0]);
	}
}, {
	ancestor: Object,
	version: "1.1",
	
	forEach: function(object, block, context) {
		for (var key in object) {
			if (this.prototype[key] === undefined) {
				block.call(context, object[key], key, object);
			}
		}
	},
		
	implement: function() {
		for (var i = 0; i < arguments.length; i++) {
			if (typeof arguments[i] == "function") {
				// if it's a function, call it
				arguments[i](this.prototype);
			} else {
				// add the interface using the extend method
				this.prototype.extend(arguments[i]);
			}
		}
		return this;
	},
	
	toString: function() {
		return String(this.valueOf());
	}
});
;(function($) {

	PhotoFrame.Buttons.Crop = PhotoFrame.Button.extend({
		
		/**
		 * An array of button objects
		 */
		
		buttons: [],
		
		/**
		 * The button description 
		 */
		
		description: false,
		
		/**
		 * Name of the button
		 */
		
		name: false,
		
		/**
		 * Is the crop enabled?
		 */
		
		enabled: true,
		
		/**
		 * Should Photo Frame render the photo after removing the layer
		 */	
		 
		renderAfterRemovingLayer: false,
		
		/**
		 * The JSON object used for Window settings 
		 */
		
		windowSettings: {
			title: false
		},
		
		constructor: function(buttonBar) {
			var t = this;
			
			this.name                 = PhotoFrame.Lang.crop;
			this.description          = PhotoFrame.Lang.crop_desc;
			this.windowSettings.title = PhotoFrame.Lang.crop;
			
			this.buttons = [{
				text: PhotoFrame.Lang.crop,
				css: 'photo-frame-tool-window-save',
				onclick: function(e) {
					var crop = t.getCrop(true);
					
					if(crop.x || crop.y || crop.x2 || crop.y2) {					
						t.setCrop(crop.x, crop.y, crop.x2, crop.y2);
					}
				}
			}];

			t.base(buttonBar);
		},
		
		setCrop: function(x, y, x2, y2) {
			this.buttonBar.factory.cropPhoto.jcrop.setSelect([x, y, x2, y2]);
		},
		
		apply: function() {	
			if(this.enabled) {
				var crop = this.getCrop(true);			
				var x    = crop.x;
				var y    = crop.y;
				var x2   = crop.x2;
				var y2   = crop.y2;
				
				if(!this.resizeToggleLayer && (x || x2 || y || y2)) {
					this.addManipulation(true, {
						x:  x,
						x2: x2,
						y:  y,
						y2: y2
					});
				}
			}
		},
		
		getCrop: function(formFields) {
			if(!formFields) {
				return this.buttonBar.factory.cropPhoto.cropDimensions();
			}
			else {
				return {
					x:  parseInt(this.window.ui.x.val()),
					y:  parseInt(this.window.ui.y.val()),
					x2: parseInt(this.window.ui.x2.val()),
					y2: parseInt(this.window.ui.y2.val())
				};
			}
		},
		
		startCrop: function() {
			var crop = this.getCrop();
			
			if(crop.x || crop.y || crop.x2 || crop.y2) {
				this.addManipulation(true, {
					x:  crop.x,
					y:  crop.y,
					x2: crop.x2,
					y2: crop.y2
				});
			}
			else {
				var m = this.getManipulation();
				
				if(m && !m.visible) {
					this.disable();
				}
			}
			
			this.refresh();
		},
		
		toggleLayer: function(visibility, render) {
			var m = this.getManipulation();
			
			if(!visibility) {
				this.hideCrop();
			}
			else {
				this.showCrop(m);
			}
			
			this.addManipulation(visibility, m.data);
		},
		
		hideCrop: function() {			
			this.release();
			this.disable();	
		},
		
		showCrop: function(m) {			
			this.enable();	
			this.setCrop(m.data.x, m.data.y, m.data.x2, m.data.y2);
		},
		
		disable: function(omitJcrop) {
			this.enabled = false;
			
			if(!omitJcrop) {
				this.buttonBar.factory.cropPhoto.jcrop.disable();
			}
			
			this.window.ui.content.find('input').attr('disabled', true);
		},
		
		enable: function(omitJcrop) {
			this.enabled = true;
		
			if(!omitJcrop) {			
				this.buttonBar.factory.cropPhoto.jcrop.enable();	
			}
			
			this.window.ui.content.find('input').attr('disabled', false);
		},
		
		release: function() {
			this.buttonBar.factory.cropPhoto.releaseCrop();
		},
		
		removeLayer: function() {
			this.resizeToggleLayer = false;
			this.removeManipulation();
			this.release();
			this.enable();	
		},
		
		reset: function() {
			this.window.ui.x.val('');
			this.window.ui.y.val('');
			this.window.ui.x2.val('');
			this.window.ui.y2.val('');
		},
		
		showWindow: function() {
			this.refresh();
			this.base();
		},
		
		buildWindow: function() {
			this.base({ buttons: this.buttons });
			
			var t    = this;			
			var html = $([
				/*'<div class="photo-frame-grid">',
					'<label for="width">Width</label>',
					'<input type="text" name="width" value="" id="width" class="photo-frame-small" />',
				'</div>',
				'<div class="photo-frame-grid">',
					'<label for="Height">Height</label>',
					'<input type="text" name="height" value="" id="height" class="photo-frame-small" />',
				'</div>',*/
				'<div class="photo-frame-grid">',
					'<label for="x">'+PhotoFrame.Lang.x+'</label>',
					'<input type="text" name="x" value="" id="x" class="photo-frame-small" />',
				'</div>',
				'<div class="photo-frame-grid">',
					'<label for="y">'+PhotoFrame.Lang.y+'</label>',
					'<input type="text" name="y" value="" id="y" class="photo-frame-small" />',
				'</div>',
				'<div class="photo-frame-grid">',
					'<label for="x2">'+PhotoFrame.Lang.x2+'</label>',
					'<input type="text" name="x2" value="" id="x2" class="photo-frame-small" />',
				'</div>',
				'<div class="photo-frame-grid">',
					'<label for="y">'+PhotoFrame.Lang.y2+'</label>',
					'<input type="text" name="y" value="" id="y2" class="photo-frame-small" />',
				'</div>',
			].join(''));
			
			this.window.ui.content.html(html);
			
			this.window.ui.content.find('input').keypress(function(e) {
				if(e.keyCode == 13) {
					t.apply();
					e.preventDefault();
				}
			});
			
			this.window.ui.x  = this.window.ui.content.find('#x');
			this.window.ui.y  = this.window.ui.content.find('#y');
			this.window.ui.x2 = this.window.ui.content.find('#x2');
			this.window.ui.y2 = this.window.ui.content.find('#y2');	
			
			var visibility;
			var resizeVisibility;
			var started;			
			var cancelled = true;
			
			this.resizeToggleLayer = false;
			
			this.bind('startCropBegin', function() {
				started = false;
			});
			
			this.bind('startCropEnd', function() {			
				started = true;
			});
			
			this.bind('jcropOnChange', function(a) {
				if(!this.resizeToggleLayer) {
					var m = t.getManipulation();
					if(m && m.visible) {
						t.enable(true);
					}
					t.buttonBar.factory.cropPhoto.released = false;
					t.refresh();
				}			
			});
			
			this.bind('jcropOnRelease', function(a) {
				if(started && t.getManipulation().visible) {
					if(!t.resizeToggleLayer) {
						t.removeManipulation();
					}
					t.resizeToggleLayer = false;
				}
			});
						
			this.bind('jcropOnSelect', function(a) {
				t.buttonBar.factory.cropPhoto.released = false;
				t.refresh(true);
				t.apply();
			});
			
			this.bind('startRendering', function() {
				visibility = t.getManipulation().visible ? true : false;
				
				if(visibility) {
					t.showManipulation();	
				}
				else {
					t.hideManipulation();
				}
			});
			
			this.bind('stopRendering', function() {
				if(t.getManipulation() && t.getManipulation().visible) {
					if(!t.buttonBar.factory.cancel) {
						t.toggleLayer(visibility);
					}
				}
			});
			
			this.bind('resizeInitCrop', function(obj, manipulation) {
				if(t.cropPhoto().totalManipulations() > 0) {
					var m = t.getManipulation();
					
					t.initCrop(m && !m.visible ? true : false);
				}
			});
			
			this.bind('resizeRemoveLayer', function() {
				t.initCrop(true);
			});
			
			this.bind('rotateReInitCrop', function(obj) {
				t.initCrop();
			});

			this.bind('startCropEnd', function() {
				if(t.buttonBar.factory.settings.photo_frame_disable_regular_crop == 'true') {
					t.disable();
				}
			});
			
			/*
			this.bind('resize', function(obj, width, height) {
				t.resizeObj = obj;
				
				if(t.getManipulation()) {
					//t.cropPhoto().releaseCrop();
				}
			});
			
			this.bind('rotateRemoveLayer', function(obj) {
				//t.removeManipulation();
			});
			
			this.bind('resizeToggleLayer', function(manipulation) {
				//t.toggleLayerCallback(manipulation);
			});
			
			*/
		},

		isActive: function() {
			return this.getSetting('disable_regular_crop') === 'true' ? false : true;
		},
		
		toggleLayerCallback: function(manipulation) {
			// resizeVisibility = manipulation.visible;
				
			var visible = manipulation.visible && this.getManipulation().visible ? true : false;
			
			if(!manipulation.visible) {
				this.resizeToggleLayer = this.getManipulation().data;
				
				this.toggleLayer(visible);
			}	
		},
		
		initCrop: function(init) {	
						
			if(!this.cropPhoto().jcrop) {
				return;
			}
			
			var manipulation = this.getManipulation();
			var released 	 = this.cropPhoto().released;
			var select   	 = this.cropPhoto().jcrop.tellSelect();
			var img      	 = this.cropPhoto().ui.cropPhoto.find('img');
			
			this.cropPhoto().ui.cropPhoto.remove();
			this.cropPhoto().destroyJcrop();				
			this.cropPhoto().ui.cropPhoto = $('<div class="'+this.buttonBar.factory.classes.cropPhoto+'"></div>');
			
			this.buttonBar.factory.ui.crop.append(this.cropPhoto().ui.cropPhoto);				
			this.cropPhoto().ui.cropPhoto.append(img);
			
			this.cropPhoto().initJcrop();
			
			if(!manipulation.visible) {
				this.cropPhoto().releaseCrop();
			}
			
			if(manipulation.data && !released && !init) {
				this.cropPhoto().releaseCrop();				
				this.cropPhoto().jcrop.setSelect([select.x, select.y, select.x2, select.y2])
			}
			
			this.buttonBar.factory.ui.crop.center();	
			this.buttonBar.factory.trigger('initCrop');
		},
		
		refresh: function(formFields) {
			var crop = this.getCrop(formFields)
			
			if(!this.isActive()) {
				this.window.close();
			}

			if(crop.x || crop.y || crop.x2 || crop.y2) {
				this.window.ui.x.val(crop.x);
				this.window.ui.y.val(crop.y);
				this.window.ui.x2.val(crop.x2);
				this.window.ui.y2.val(crop.y2);
			}
			else {
				this.reset();
			}			
		}
	});
	
}(jQuery));;(function($) {
	
	PhotoFrame.Buttons.Layers = PhotoFrame.Button.extend({
		
		/**
		 * An array of button objects
		 */
		
		buttons: [],
		
		/**
		 * An object of css classes
		 */
		
		classes: {
			layer: 'photo-frame-layer',
			layerIcon: 'photo-frame-layer-icon',
			layerEmpty: 'photo-frame-layer-empty',
			layerTitle: 'photo-frame-layer-title',
			layerActions: 'photo-frame-layer-actions',
			visible: 'photo-frame-toggle-visible',
			toggleButton: 'photo-frame-toggle-layer-button',
			trash: 'photo-frame-trash',			
		},
		
		/**
		 * The button description 
		 */
		
		description: false,
		
		/**
		 * The button icon
		 */
		
		icon: 'layers',
		
		/**
		 * An object of icon classes
		 */
		
		icons: {
			eye: 'eye',
			eyeClose: 'eye-off',
			trash: 'trash'
		},
		
		/**
		 * Name of the button
		 */
		
		name: false,
		
		/**
		 * The JSON object used for Window settings 
		 */
		
		windowSettings: {
			css: 'photo-frame-layers',
			title: false
		},
		
		constructor: function(buttonBar) {
			var t = this;
			
			this.buttons = [{
				text: PhotoFrame.Lang.hide_all,
				css: this.classes.toggleButton,
				onclick: function(e, button) {
					var $target = $(e.target);
					
					if($target.html() == PhotoFrame.Lang.hide_all) {
						$target.html(PhotoFrame.Lang.show_all);
						t.hideAll();
					}
					else {
						$target.html(PhotoFrame.Lang.hide_all);
						t.showAll();
					}

					e.preventDefault();
				}
			},{
				text: PhotoFrame.Lang.rerender,
				css: 'photo-frame-tool-window-save',
				onclick: function(e, button) {
					if(t.cropPhoto() && !t.cropPhoto().isRendering()) {
						t.render(function() {
							t.buttonBar.factory.trigger('layerWindowReRender');
						});
						t.refresh();
					}
				}
			}];
			
			this.name				  = PhotoFrame.Lang.layers;
			this.description          = PhotoFrame.Lang.layers_desc;
			this.windowSettings.title = PhotoFrame.Lang.layers;
					
			this.base(buttonBar);
			// this.buttonBar.factory.layerWindow = this;
		},
		
		totalHidden: function() {
			var count = 0;		
			$.each(this.cropPhoto().getManipulations(), function(i, m) {
				if(!m.visible) {
					count++;
				}
			});
			return count;
		},
		
		allHidden: function() {			
			if(this.cropPhoto().totalManipulations() == this.totalHidden()) {
				return true;
			}
			return false;
		},
		
		hideAll: function() {
			this.toggleLayers(false);
		},
		
		showAll: function() {
			this.toggleLayers(true);
		},
		
		toggleLayers: function(visible, render) {	
			if(this.cropPhoto() && !this.cropPhoto().isRendering()) {
				var m = this.cropPhoto().getManipulations();
				for(var i in this.buttonBar.buttons) {
					var button = this.buttonBar.buttons[i];
					
					if(m[button.getPackageName()]) {
						button.toggleLayer(visible, false);
					}
				}
			}
			
			this.refresh();
			this.render();
		},
		
		toggleDisplayButton: function() {				
			if(this.allHidden()) {
				this.window.buttons[0].ui.button.html(PhotoFrame.Lang.show_all);
			}
			else {
				this.window.buttons[0].ui.button.html(PhotoFrame.Lang.hide_all);
			}
		},		
		
		buildWindow: function() {	
			var t = this;
			
			this.base({buttons: this.buttons});
			
			this.buttonBar.factory.bind('startCropEnd', function() {
				t.refresh();
				t.toggleDisplayButton();
			});
			
			this.buttonBar.factory.bind('removeManipulation', function() {
				t.refresh();
			});
			
			this.buttonBar.factory.bind('showManipulation', function() {
				t.refresh();
			});
			
			this.buttonBar.factory.bind('hideManipulation', function() {
				t.refresh();
			});
			
			this.buttonBar.factory.bind('startRendering', function() {
				t.toggleDisplayButton();
			});
			
			this.buttonBar.factory.bind('addManipulation', function(obj, name, exists) {
				var content = $(t.window.ui.content).get(0);
				
				t.refresh();
				
				if(!exists && name != 'crop') {
					content.scrollTop = content.scrollHeight;
				}
			});
			
		},
		
		toggleLayer: function(name, manipulation, ui) {
			manipulation.visible = manipulation.visible ? false : true;
			this.buttonBar.factory.trigger(name+'ToggleLayer', manipulation);
			this.refresh();
		},
		
		removeLayer: function(name, manipulation, ui) {
			this.buttonBar.factory.trigger(name+'RemoveLayer', manipulation);
			delete this.buttonBar.factory.cropPhoto.manipulations[name];			
			this.refresh();
		},
		
		refresh: function(photo) {
			var count = 0, t = this, classes = {}, buttons = {}, photo = photo ? photo : this.cropPhoto();
			
			this.window.ui.content.html('');
			
			for(var y in this.buttonBar.buttons) {
				var button = this.buttonBar.buttons[y];				
				buttons[button.getPackageName()] = button;
			}
			
			$.each(photo.manipulations, function(x, manipulation) {
				var manipulation = photo.manipulations[x];
				var button       = buttons[x];
				
				if(button) {
					var title = button.getPackageName();
					
					var visible = $('<a href="#" class="'+t.classes.visible+'"><i class="icon-'+(manipulation.visible ? t.icons.eye : t.icons.eyeClose)+'"></i></a>');
					var trash   = $('<a href="#" class="'+t.classes.trash+'"><i class="icon-'+t.icons.trash+'"></i></a>');
					
					var html = $([
					'<div class="'+t.classes.layer+' '+t.buttonBar.factory.classes.clearfix+'">',
						'<div class="'+t.classes.layerIcon+'"><a href="#"><i class="icon-'+(button.icon ? button.icon : title)+'"></i></a></div>',
						'<div class="'+t.classes.layerTitle+'">'+button.window.title+'</div>',
						'<div class="'+t.classes.layerActions+'"></div>',
					'</div>'
					].join(''));
					
					html.find('.'+t.classes.layerActions).append(visible);
					html.find('.'+t.classes.layerActions).append(trash);
					
					html.find('.'+t.classes.layerIcon+' > a').click(function(e) {
						button.window.toggle();
						e.preventDefault();
					});
					
					visible.click(function(e) {
						if(t.cropPhoto() && !t.cropPhoto().isRendering()) {
							t.toggleLayer(x, manipulation, visible);
							button.toggleLayer(manipulation.visible);		
							e.preventDefault();
						}
					});
					
					trash.click(function(e) {
						t.removeLayer(x, manipulation, trash);
						if(button.renderAfterRemovingLayer) {
							// no need to render when removing the crop layer
							t.render(function() {								
								button.removeLayer();
							});
						}
						else {
							button.removeLayer();
						}
						e.preventDefault();
					});
					
					t.window.ui.buttons.show();
					t.window.ui.content.append(html);
					count++;
				}
			});			
			
			if(!count) {	
				var html = $([
					'<div class="'+t.classes.layer+' '+t.buttonBar.factory.classes.clearfix+'">',
						'<div class="'+t.classes.layerEmpty+'">'+PhotoFrame.Lang.no_layers+'</div>',
						'<div class="'+t.classes.layerActions+'"></div>',
					'</div>'
				].join(''));
				
				t.window.ui.buttons.hide();				
				t.window.ui.content.append(html);
			}
		},
		
		startCrop: function(photo) {			
			var obj = this.window.buttons[0].ui.button;
			
			this.refresh();			
		}
	});

}(jQuery));;(function($) {
	
	PhotoFrame.Buttons.Resize = PhotoFrame.Button.extend({
		
		/**
		 * An array of button objects
		 */
		
		buttons: [],
		
		/**
		 * The button description 
		 */
		
		description: 'The resize the image.',
		
		/**
		 * Name of the button
		 */
		
		name: 'Resize',
		
		/**
		 * The JSON object used for Window settings 
		 */
		
		windowSettings: {
			title: 'Resize'
		},
		
		constructor: function(buttonBar) {
			var t = this;
			
			this.buttons = [{
				text: PhotoFrame.Lang.resize,
				css: 'photo-frame-tool-window-save',
				onclick: function(e, button) {
					t.apply();
				}
			}];

			this.base(buttonBar);
		},
		
		getWidth: function() {
			return parseInt(this.window.ui.width.val());
		},
		
		getHeight: function() {
			return parseInt(this.window.ui.height.val());
		},
		
		getMaintainAspect: function() {
			return this.window.ui.aspect.attr('checked') === 'checked' ? true : false;
		},
		
		reset: function() {
			if(this.cropPhoto()) {
				this.window.ui.width.val(this.cropPhoto().width());
				this.window.ui.height.val(this.cropPhoto().height());
				this.window.ui.aspect.attr('checked', true);
			}
		},
		
		enable: function() {
			this.window.ui.width.attr('disabled', false);
			this.window.ui.height.attr('disabled', false);	
			this.window.ui.aspect.attr('disabled', false);	
		},
		
		disable: function() {
			this.window.ui.width.attr('disabled', true);
			this.window.ui.height.attr('disabled', true);
			this.window.ui.aspect.attr('disabled', true);		
		},
		
		removeLayer: function() {
			this.reset();
			//this.cropPhoto().jcrop.release();
			this.buttonBar.factory.trigger('resizeRemoveLayer');
		},
		
		startCrop: function() {
			var manipulation = this.getManipulation();
			
			if(manipulation) {
				this.window.ui.width.val(manipulation.data.width);
				this.window.ui.height.val(manipulation.data.height);
				
				if(manipulation.data.aspect === true || manipulation.data.aspect === "true") {
					this.window.ui.aspect.attr('checked', true); 	
				}
				else {					
					this.window.ui.aspect.attr('checked', false);
				}
				
				this.base();
			}
			else {
				this.reset();
			}
		},
		
		apply: function() {
			var t = this;
			
			this.addManipulation(true, {
				aspect: this.getMaintainAspect(),
				width: this.getWidth(),
				height: this.getHeight()
			});
			
			this.buttonBar.factory.trigger('resize', this, this.getWidth(), this.getHeight());
			
			this.render(function() {
				t.buttonBar.factory.trigger('resizeRenderCallback', t, t.getWidth(), t.getHeight());
			});
		},
		
		initCrop: function(manipulation) {
			this.buttonBar.factory.trigger('resizeReInitCrop', this, manipulation);
		},
		
		toggleLayer: function(visibility, render) {
			this.base(visibility, render);
		},
		
		buildWindow: function() {	
			this.base({ buttons: this.buttons });
			
			var t = this, html = $([
				'<div class="photo-frame-inline photo-frame-margin-bottom">',
					'<label for="photo-frame-width" class="photo-frame-small photo-frame-margin-right">'+PhotoFrame.Lang.width+'</label>',
					'<input type="text" name="photo-frame-width" value="" id="photo-frame-width" class="photo-frame-small" />',
				'</div>',
				'<div class="photo-frame-inline">',
					'<label for="photo-frame-height" class="photo-frame-small photo-frame-margin-right">'+PhotoFrame.Lang.height+'</label>',
					'<input type="text" name="photo-frame-height" value="" id="photo-frame-height" class="photo-frame-small" />',
				'</div>',
				'<div class="photo-frame-margin-top">',
					'<label><input type="checkbox" name="photo-frame-maintain-ratio" id="photo-frame-maintain-ratio" /> '+PhotoFrame.Lang.maintain_ratio+'</label>',
				'</div>'
			].join(''));
			
			this.window.ui.content.html(html);
			this.window.ui.width  = this.window.ui.content.find('#photo-frame-width');
			this.window.ui.height = this.window.ui.content.find('#photo-frame-height');
			this.window.ui.aspect = this.window.ui.content.find('#photo-frame-maintain-ratio');	
			
			this.window.ui.content.find('input').keypress(function(e) {
				if(e.keyCode == 13) {
					t.apply();
					e.preventDefault();
				}
			});
			
			this.buttonBar.factory.bind('render', function() {
				if(t.getManipulation()) {
					t.initCrop();
				}
				t.reset();
			});
						
			this.window.ui.content.find('input[type="text"]').keyup(function(e) {
				if(t.getMaintainAspect() && t.cropPhoto()) {
					var aspect, target, val = $(this).val(), id = $(e.target).attr('id');
					
					if(id == 'photo-frame-height') {
						aspect = t.cropPhoto().width() / t.cropPhoto().height();
						target = '#photo-frame-width';
						val   *= aspect;
					}
					else {						
						aspect = t.cropPhoto().height() / t.cropPhoto().width();
						target = '#photo-frame-height';
						val   *= aspect;
					}
					
					t.window.ui.content.find(target).val(t.cropPhoto().round(val, 1));
				}
			});
		}
	});

}(jQuery));;(function($) {
	
	PhotoFrame.Buttons.Rotate = PhotoFrame.Button.extend({
		
		/**
		 * An array of button objects
		 */
		
		buttons: [],
		
		/**
		 * The button description 
		 */
		
		description: false,
		
		/**
		 * Name of the button
		 */
		
		name: false,
		
		/**
		 * The JSON object used for Window settings 
		 */
		
		windowSettings: {
			title: false
		},
		
		constructor: function(buttonBar) {
			var t = this;
			
			this.name                 = PhotoFrame.Lang.rotate;
			this.description          = PhotoFrame.Lang.rotate_desc;	
			this.windowSettings.title = PhotoFrame.Lang.rotate;		
			this.buttons = [{
				text: PhotoFrame.Lang.rotate,
				css: 'photo-frame-tool-window-save',
				onclick: function(e, button) {
					t.apply();
				}
			}];

			this.base(buttonBar);
		},
		
		apply: function() {	
			var t = this;
						
			this.addManipulation(true, {
				degree: this.getDegree()
			});
			
			this.buttonBar.factory.trigger('rotate', this, this.getDegree());
			
			this.render(function() {	
				t.buttonBar.factory.trigger('rotateReInitCrop', t, t.getDegree());			
			});
		},
		
		startCrop: function() {
			var m = this.getManipulation();	
			
			if(m.data && m.data.degree) {
				this.window.ui.input.val(m.data.degree);
				this.base();
			}
		},
		
		getDegree: function() {
			return parseInt(this.window.ui.input.val() == '' ? 0 : this.window.ui.input.val());	
		},
		
		reset: function() {
			this.window.ui.input.val('');	
		},
		
		toggleLayer: function(visibility, render) {			
			this.base(visibility, render);
		},
		
		enable: function() {
			this.window.ui.input.attr('disabled', false);	
		},
		
		disable: function() {
			this.window.ui.input.attr('disabled', true);	
		},
		
		buildWindow: function() {	
			this.base({ buttons: this.buttons });
			
			this.window.ui.input = $('<input type="text" name="photo-frame-rotate" value="" id="photo-frame-rotate" class="photo-frame-small" />');
			
			var t = this, html = $([
				'<div class="photo-frame-inline">',
					'<label for="photo-frame-rotate photo-frame-margin-right">'+PhotoFrame.Lang.degrees+'</label>',
				'</div>'
			].join(''));
			
			html.append(this.window.ui.input);
			
			this.window.ui.content.html(html);			
			this.window.ui.content.find('input').keypress(function(e) {
				if(e.keyCode == 13) {
					t.apply();
					e.preventDefault();
				}
			});
			
			this.bind('stopRendering', function() {
				t.buttonBar.factory.trigger('rotateReInitCrop', t, t.getDegree());				
			});
		}
	});

}(jQuery));;/*!
 * NETEYE Activity Indicator jQuery Plugin
 *
 * Copyright (c) 2010 NETEYE GmbH
 * Licensed under the MIT license
 *
 * Author: Felix Gnass [fgnass at neteye dot de]
 * Version: @{VERSION}
 */
 
/**
 * Plugin that renders a customisable activity indicator (spinner) using SVG or VML.
 */
(function($) {

	$.fn.activity = function(opts) {
		this.each(function() {
			var $this = $(this);
			var el = $this.data('activity');
			if (el) {
				clearInterval(el.data('interval'));
				el.remove();
				$this.removeData('activity');
			}
			if (opts !== false) {
				opts = $.extend({color: $this.css('color')}, $.fn.activity.defaults, opts);
				
				el = render($this, opts).css('position', 'absolute').prependTo(opts.outside ? 'body' : $this);
				var h = $this.outerHeight() - el.height();
				var w = $this.outerWidth() - el.width();
				var margin = {
					top: opts.valign == 'top' ? opts.padding : opts.valign == 'bottom' ? h - opts.padding : Math.floor(h / 2),
					left: opts.align == 'left' ? opts.padding : opts.align == 'right' ? w - opts.padding : Math.floor(w / 2)
				};
				var offset = $this.offset();
				if (opts.outside) {
					el.css({top: offset.top + 'px', left: offset.left + 'px'});
				}
				else {
					margin.top -= el.offset().top - offset.top;
					margin.left -= el.offset().left - offset.left;
				}
				el.css({marginTop: margin.top + 'px', marginLeft: margin.left + 'px'});
				animate(el, opts.segments, Math.round(10 / opts.speed) / 10);
				$this.data('activity', el);
			}
		});
		return this;
	};
	
	$.fn.activity.defaults = {
		segments: 12,
		space: 3,
		length: 7,
		width: 4,
		speed: 1.2,
		align: 'center',
		valign: 'center',
		padding: 4
	};
	
	$.fn.activity.getOpacity = function(opts, i) {
		var steps = opts.steps || opts.segments-1;
		var end = opts.opacity !== undefined ? opts.opacity : 1/steps;
		return 1 - Math.min(i, steps) * (1 - end) / steps;
	};
	
	/**
	 * Default rendering strategy. If neither SVG nor VML is available, a div with class-name 'busy' 
	 * is inserted, that can be styled with CSS to display an animated gif as fallback.
	 */
	var render = function() {
		return $('<div>').addClass('busy');
	};
	
	/**
	 * The default animation strategy does nothing as we expect an animated gif as fallback.
	 */
	var animate = function() {
	};
	
	/**
	 * Utility function to create elements in the SVG namespace.
	 */
	function svg(tag, attr) {
		var el = document.createElementNS("http://www.w3.org/2000/svg", tag || 'svg');
		if (attr) {
			$.each(attr, function(k, v) {
				el.setAttributeNS(null, k, v);
			});
		}
		return $(el);
	}
	
	if (document.createElementNS && document.createElementNS( "http://www.w3.org/2000/svg", "svg").createSVGRect) {
	
		// =======================================================================================
		// SVG Rendering
		// =======================================================================================
		
		/**
		 * Rendering strategy that creates a SVG tree.
		 */
		render = function(target, d) {
			var innerRadius = d.width*2 + d.space;
			var r = (innerRadius + d.length + Math.ceil(d.width / 2) + 1);
			
			var el = svg().width(r*2).height(r*2);
			
			var g = svg('g', {
				'stroke-width': d.width, 
				'stroke-linecap': 'round', 
				stroke: d.color
			}).appendTo(svg('g', {transform: 'translate('+ r +','+ r +')'}).appendTo(el));
			
			for (var i = 0; i < d.segments; i++) {
				g.append(svg('line', {
					x1: 0, 
					y1: innerRadius, 
					x2: 0, 
					y2: innerRadius + d.length, 
					transform: 'rotate(' + (360 / d.segments * i) + ', 0, 0)',
					opacity: $.fn.activity.getOpacity(d, i)
				}));
			}
			return $('<div>').append(el).width(2*r).height(2*r);
		};
				
		// Check if Webkit CSS animations are available, as they work much better on the iPad
		// than setTimeout() based animations.
		
		if (document.createElement('div').style.WebkitAnimationName !== undefined) {

			var animations = {};
		
			/**
			 * Animation strategy that uses dynamically created CSS animation rules.
			 */
			animate = function(el, steps, duration) {
				if (!animations[steps]) {
					var name = 'spin' + steps;
					var rule = '@-webkit-keyframes '+ name +' {';
					for (var i=0; i < steps; i++) {
						var p1 = Math.round(100000 / steps * i) / 1000;
						var p2 = Math.round(100000 / steps * (i+1) - 1) / 1000;
						var value = '% { -webkit-transform:rotate(' + Math.round(360 / steps * i) + 'deg); }\n';
						rule += p1 + value + p2 + value; 
					}
					rule += '100% { -webkit-transform:rotate(100deg); }\n}';
					document.styleSheets[0].insertRule(rule, 0);
					animations[steps] = name;
				}
				el.css('-webkit-animation', animations[steps] + ' ' + duration +'s linear infinite');
			};
		}
		else {
		
			/**
			 * Animation strategy that transforms a SVG element using setInterval().
			 */
			animate = function(el, steps, duration) {
				var rotation = 0;
				var g = el.find('g g').get(0);
				el.data('interval', setInterval(function() {
					g.setAttributeNS(null, 'transform', 'rotate(' + (++rotation % steps * (360 / steps)) + ')');
				},  duration * 1000 / steps));
			};
		}
		
	}
	else {
		
		// =======================================================================================
		// VML Rendering
		// =======================================================================================
		
		var s = $('div').appendTo('body').html('<v:shape id="vml_flag1" adj="1" />');

		s = s.find(':first').css('behavior', 'url(#default#VML)');

		if ((s[0] ? typeof s[0].adj == "object" : true)) {
		
			// VML support detected. Insert CSS rules for group, shape and stroke.
			var sheet = document.createStyleSheet();
			$.each(['group', 'shape', 'stroke'], function() {
				sheet.addRule(this, "behavior:url(#default#VML);");
			});
			
			/**
			 * Rendering strategy that creates a VML tree. 
			 */
			render = function(target, d) {
			
				var innerRadius = d.width*2 + d.space;
				var r = (innerRadius + d.length + Math.ceil(d.width / 2) + 1);
				var s = r*2;
				var o = -Math.ceil(s/2);
				
				var el = $('<group>', {coordsize: s + ' ' + s, coordorigin: o + ' ' + o}).css({top: o, left: o, width: s, height: s});
				for (var i = 0; i < d.segments; i++) {
					el.append($('<shape>', {path: 'm ' + innerRadius + ',0  l ' + (innerRadius + d.length) + ',0'}).css({
						width: s,
						height: s,
						rotation: (360 / d.segments * i) + 'deg'
					}).append($('<stroke>', {color: d.color, weight: d.width + 'px', endcap: 'round', opacity: $.fn.activity.getOpacity(d, i)})));
				}
				return $('<group>', {coordsize: s + ' ' + s}).css({width: s, height: s, overflow: 'hidden'}).append(el);
			};
		
			/**
		     * Animation strategy that modifies the VML rotation property using setInterval().
		     */
			animate = function(el, steps, duration) {
				var rotation = 0;
				var g = el.get(0);
				el.data('interval', setInterval(function() {
					g.style.rotation = ++rotation % steps * (360 / steps);
				},  duration * 1000 / steps));
			};
		}
		$(s).parent().remove();
	}

})(jQuery);;/*
 * jQuery Color Animations
 * Copyright 2007 John Resig
 * Released under the MIT and GPL licenses.
 */

(function(jQuery){

	// We override the animation for all of these color styles
	jQuery.each(['backgroundColor', 'borderBottomColor', 'borderLeftColor', 'borderRightColor', 'borderTopColor', 'color', 'outlineColor'], function(i,attr){
		jQuery.fx.step[attr] = function(fx){
			if ( fx.state == 0 ) {
				fx.start = getColor( fx.elem, attr );
				fx.end = getRGB( fx.end );
			}

			fx.elem.style[attr] = "rgb(" + [
				Math.max(Math.min( parseInt((fx.pos * (fx.end[0] - fx.start[0])) + fx.start[0]), 255), 0),
				Math.max(Math.min( parseInt((fx.pos * (fx.end[1] - fx.start[1])) + fx.start[1]), 255), 0),
				Math.max(Math.min( parseInt((fx.pos * (fx.end[2] - fx.start[2])) + fx.start[2]), 255), 0)
			].join(",") + ")";
		}
	});

	// Color Conversion functions from highlightFade
	// By Blair Mitchelmore
	// http://jquery.offput.ca/highlightFade/

	// Parse strings looking for color tuples [255,255,255]
	function getRGB(color) {
		var result;

		// Check if we're already dealing with an array of colors
		if ( color && color.constructor == Array && color.length == 3 )
			return color;

		// Look for rgb(num,num,num)
		if (result = /rgb\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*\)/.exec(color))
			return [parseInt(result[1]), parseInt(result[2]), parseInt(result[3])];

		// Look for rgb(num%,num%,num%)
		if (result = /rgb\(\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*\)/.exec(color))
			return [parseFloat(result[1])*2.55, parseFloat(result[2])*2.55, parseFloat(result[3])*2.55];

		// Look for #a0b1c2
		if (result = /#([a-fA-F0-9]{2})([a-fA-F0-9]{2})([a-fA-F0-9]{2})/.exec(color))
			return [parseInt(result[1],16), parseInt(result[2],16), parseInt(result[3],16)];

		// Look for #fff
		if (result = /#([a-fA-F0-9])([a-fA-F0-9])([a-fA-F0-9])/.exec(color))
			return [parseInt(result[1]+result[1],16), parseInt(result[2]+result[2],16), parseInt(result[3]+result[3],16)];

		// Otherwise, we're most likely dealing with a named color
		return colors[jQuery.trim(color).toLowerCase()];
	}
	
	function getColor(elem, attr) {
		var color;

		do {
			color = jQuery.curCSS(elem, attr);

			// Keep going until we find an element that has color, or we hit the body
			if ( color != '' && color != 'transparent' || jQuery.nodeName(elem, "body") )
				break; 

			attr = "backgroundColor";
		} while ( elem = elem.parentNode );

		return getRGB(color);
	};
	
	// Some named colors to work with
	// From Interface by Stefan Petre
	// http://interface.eyecon.ro/

	var colors = {
		aqua:[0,255,255],
		azure:[240,255,255],
		beige:[245,245,220],
		black:[0,0,0],
		blue:[0,0,255],
		brown:[165,42,42],
		cyan:[0,255,255],
		darkblue:[0,0,139],
		darkcyan:[0,139,139],
		darkgrey:[169,169,169],
		darkgreen:[0,100,0],
		darkkhaki:[189,183,107],
		darkmagenta:[139,0,139],
		darkolivegreen:[85,107,47],
		darkorange:[255,140,0],
		darkorchid:[153,50,204],
		darkred:[139,0,0],
		darksalmon:[233,150,122],
		darkviolet:[148,0,211],
		fuchsia:[255,0,255],
		gold:[255,215,0],
		green:[0,128,0],
		indigo:[75,0,130],
		khaki:[240,230,140],
		lightblue:[173,216,230],
		lightcyan:[224,255,255],
		lightgreen:[144,238,144],
		lightgrey:[211,211,211],
		lightpink:[255,182,193],
		lightyellow:[255,255,224],
		lime:[0,255,0],
		magenta:[255,0,255],
		maroon:[128,0,0],
		navy:[0,0,128],
		olive:[128,128,0],
		orange:[255,165,0],
		pink:[255,192,203],
		purple:[128,0,128],
		violet:[128,0,128],
		red:[255,0,0],
		silver:[192,192,192],
		white:[255,255,255],
		yellow:[255,255,0]
	};
	
})(jQuery);
;/*
 * jQuery File Upload File Processing Plugin 1.0
 * https://github.com/blueimp/jQuery-File-Upload
 *
 * Copyright 2012, Sebastian Tschan
 * https://blueimp.net
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */

/*jslint nomen: true, unparam: true, regexp: true */
/*global define, window, document */

(function (factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        // Register as an anonymous AMD module:
        define([
            'jquery',
            'load-image',
            'canvas-to-blob',
            './jquery.fileupload'
        ], factory);
    } else {
        // Browser globals:
        factory(
            window.jQuery,
            window.loadImage
        );
    }
}(function ($, loadImage) {
    'use strict';

    // The File Upload IP version extends the basic fileupload widget
    // with file processing functionality:
    $.widget('blueimpFP.fileupload', $.blueimp.fileupload, {

        options: {
            // The list of file processing actions:
            process: [
            /*
                {
                    action: 'load',
                    fileTypes: /^image\/(gif|jpeg|png)$/,
                    maxFileSize: 20000000 // 20MB
                },
                {
                    action: 'resize',
                    maxWidth: 1920,
                    maxHeight: 1200,
                    minWidth: 800,
                    minHeight: 600
                },
                {
                    action: 'save'
                }
            */
            ],

            // The add callback is invoked as soon as files are added to the
            // fileupload widget (via file input selection, drag & drop or add
            // API call). See the basic file upload widget for more information:
            add: function (e, data) {
                $(this).fileupload('process', data).done(function () {
                    data.submit();
                });
            }
        },

        processActions: {
            // Loads the image given via data.files and data.index
            // as canvas element.
            // Accepts the options fileTypes (regular expression)
            // and maxFileSize (integer) to limit the files to load:
            load: function (data, options) {
                var that = this,
                    file = data.files[data.index],
                    dfd = $.Deferred();
                if (window.HTMLCanvasElement &&
                        window.HTMLCanvasElement.prototype.toBlob &&
                        ($.type(options.maxFileSize) !== 'number' ||
                            file.size < options.maxFileSize) &&
                        (!options.fileTypes ||
                            options.fileTypes.test(file.type))) {
                    loadImage(
                        file,
                        function (canvas) {
                            data.canvas = canvas;
                            dfd.resolveWith(that, [data]);
                        },
                        {canvas: true}
                    );
                } else {
                    dfd.rejectWith(that, [data]);
                }
                return dfd.promise();
            },
            // Resizes the image given as data.canvas and updates
            // data.canvas with the resized image.
            // Accepts the options maxWidth, maxHeight, minWidth and
            // minHeight to scale the given image:
            resize: function (data, options) {
                if (data.canvas) {
                    var canvas = loadImage.scale(data.canvas, options);
                    if (canvas.width !== data.canvas.width ||
                            canvas.height !== data.canvas.height) {
                        data.canvas = canvas;
                        data.processed = true;
                    }
                }
                return data;
            },
            // Saves the processed image given as data.canvas
            // inplace at data.index of data.files:
            save: function (data, options) {
                // Do nothing if no processing has happened:
                if (!data.canvas || !data.processed) {
                    return data;
                }
                var that = this,
                    file = data.files[data.index],
                    name = file.name,
                    dfd = $.Deferred(),
                    callback = function (blob) {
                        if (!blob.name) {
                            if (file.type === blob.type) {
                                blob.name = file.name;
                            } else if (file.name) {
                                blob.name = file.name.replace(
                                    /\..+$/,
                                    '.' + blob.type.substr(6)
                                );
                            }
                        }
                        // Store the created blob at the position
                        // of the original file in the files list:
                        data.files[data.index] = blob;
                        dfd.resolveWith(that, [data]);
                    };
                // Use canvas.mozGetAsFile directly, to retain the filename, as
                // Gecko doesn't support the filename option for FormData.append:
                if (data.canvas.mozGetAsFile) {
                    callback(data.canvas.mozGetAsFile(
                        (/^image\/(jpeg|png)$/.test(file.type) && name) ||
                            ((name && name.replace(/\..+$/, '')) ||
                                'blob') + '.png',
                        file.type
                    ));
                } else {
                    data.canvas.toBlob(callback, file.type);
                }
                return dfd.promise();
            }
        },

        // Resizes the file at the given index and stores the created blob at
        // the original position of the files list, returns a Promise object:
        _processFile: function (files, index, options) {
            var that = this,
                dfd = $.Deferred().resolveWith(that, [{
                    files: files,
                    index: index
                }]),
                chain = dfd.promise();
            that._processing += 1;
            $.each(options.process, function (i, settings) {
                chain = chain.pipe(function (data) {
                    return that.processActions[settings.action]
                        .call(this, data, settings);
                });
            });
            chain.always(function () {
                that._processing -= 1;
                if (that._processing === 0) {
                    that.element
                        .removeClass('fileupload-processing');
                }
            });
            if (that._processing === 1) {
                that.element.addClass('fileupload-processing');
            }
            return chain;
        },

        // Processes the files given as files property of the data parameter,
        // returns a Promise object that allows to bind a done handler, which
        // will be invoked after processing all files (inplace) is done:
        process: function (data) {
            var that = this,
                options = $.extend({}, this.options, data);
            if (options.process && options.process.length &&
                    this._isXHRUpload(options)) {
                $.each(data.files, function (index, file) {
                    that._processingQueue = that._processingQueue.pipe(
                        function () {
                            var dfd = $.Deferred();
                            that._processFile(data.files, index, options)
                                .always(function () {
                                    dfd.resolveWith(that);
                                });
                            return dfd.promise();
                        }
                    );
                });
            }
            return this._processingQueue;
        },

        _create: function () {
            $.blueimp.fileupload.prototype._create.call(this);
            this._processing = 0;
            this._processingQueue = $.Deferred().resolveWith(this)
                .promise();
        }

    });

}));
;/*
 * jQuery File Upload User Interface Plugin 6.9.5
 * https://github.com/blueimp/jQuery-File-Upload
 *
 * Copyright 2010, Sebastian Tschan
 * https://blueimp.net
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */

/*jslint nomen: true, unparam: true, regexp: true */
/*global define, window, document, URL, webkitURL, FileReader */

(function (factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        // Register as an anonymous AMD module:
        define([
            'jquery',
            'tmpl',
            'load-image',
            './jquery.fileupload-fp'
        ], factory);
    } else {
        // Browser globals:
        factory(
            window.jQuery,
            window.tmpl,
            window.loadImage
        );
    }
}(function ($, tmpl, loadImage) {
    'use strict';

    // The UI version extends the FP (file processing) version or the basic
    // file upload widget and adds complete user interface interaction:
    var parentWidget = ($.blueimpFP || $.blueimp).fileupload;
    $.widget('blueimpUI.fileupload', parentWidget, {

        options: {
            // By default, files added to the widget are uploaded as soon
            // as the user clicks on the start buttons. To enable automatic
            // uploads, set the following option to true:
            autoUpload: false,
            // The following option limits the number of files that are
            // allowed to be uploaded using this widget:
            maxNumberOfFiles: undefined,
            // The maximum allowed file size:
            maxFileSize: undefined,
            // The minimum allowed file size:
            minFileSize: undefined,
            // The regular expression for allowed file types, matches
            // against either file type or file name:
            acceptFileTypes:  /.+$/i,
            // The regular expression to define for which files a preview
            // image is shown, matched against the file type:
            previewSourceFileTypes: /^image\/(gif|jpeg|png)$/,
            // The maximum file size of images that are to be displayed as preview:
            previewSourceMaxFileSize: 5000000, // 5MB
            // The maximum width of the preview images:
            previewMaxWidth: 80,
            // The maximum height of the preview images:
            previewMaxHeight: 80,
            // By default, preview images are displayed as canvas elements
            // if supported by the browser. Set the following option to false
            // to always display preview images as img elements:
            previewAsCanvas: true,
            // The ID of the upload template:
            uploadTemplateId: 'template-upload',
            // The ID of the download template:
            downloadTemplateId: 'template-download',
            // The container for the list of files. If undefined, it is set to
            // an element with class "files" inside of the widget element:
            filesContainer: undefined,
            // By default, files are appended to the files container.
            // Set the following option to true, to prepend files instead:
            prependFiles: false,
            // The expected data type of the upload response, sets the dataType
            // option of the $.ajax upload requests:
            dataType: 'json',

            // The add callback is invoked as soon as files are added to the fileupload
            // widget (via file input selection, drag & drop or add API call).
            // See the basic file upload widget for more information:
            add: function (e, data) {
                var that = $(this).data('fileupload'),
                    options = that.options,
                    files = data.files;
                $(this).fileupload('process', data).done(function () {
                    that._adjustMaxNumberOfFiles(-files.length);
                    data.maxNumberOfFilesAdjusted = true;
                    data.files.valid = data.isValidated = that._validate(files);
                    data.context = that._renderUpload(files).data('data', data);
                    options.filesContainer[
                        options.prependFiles ? 'prepend' : 'append'
                    ](data.context);
                    that._renderPreviews(files, data.context);
                    that._forceReflow(data.context);
                    that._transition(data.context).done(
                        function () {
                            if ((that._trigger('added', e, data) !== false) &&
                                    (options.autoUpload || data.autoUpload) &&
                                    data.autoUpload !== false && data.isValidated) {
                                data.submit();
                            }
                        }
                    );
                });
            },
            // Callback for the start of each file upload request:
            send: function (e, data) {
                var that = $(this).data('fileupload');
                if (!data.isValidated) {
                    if (!data.maxNumberOfFilesAdjusted) {
                        that._adjustMaxNumberOfFiles(-data.files.length);
                        data.maxNumberOfFilesAdjusted = true;
                    }
                    if (!that._validate(data.files)) {
                        return false;
                    }
                }
                if (data.context && data.dataType &&
                        data.dataType.substr(0, 6) === 'iframe') {
                    // Iframe Transport does not support progress events.
                    // In lack of an indeterminate progress bar, we set
                    // the progress to 100%, showing the full animated bar:
                    data.context
                        .find('.progress').addClass(
                            !$.support.transition && 'progress-animated'
                        )
                        .attr('aria-valuenow', 100)
                        .find('.bar').css(
                            'width',
                            '100%'
                        );
                }
                return that._trigger('sent', e, data);
            },
            // Callback for successful uploads:
            done: function (e, data) {
                var that = $(this).data('fileupload'),
                    template;
                if (data.context) {
                    data.context.each(function (index) {
                        var file = ($.isArray(data.result) &&
                                data.result[index]) || {error: 'emptyResult'};
                        if (file.error) {
                            that._adjustMaxNumberOfFiles(1);
                        }
                        that._transition($(this)).done(
                            function () {
                                var node = $(this);
                                template = that._renderDownload([file])
                                    .replaceAll(node);
                                that._forceReflow(template);
                                that._transition(template).done(
                                    function () {
                                        data.context = $(this);
                                        that._trigger('completed', e, data);
                                    }
                                );
                            }
                        );
                    });
                } else {
                    if ($.isArray(data.result)) {
                        $.each(data.result, function (index, file) {
                            if (data.maxNumberOfFilesAdjusted && file.error) {
                                that._adjustMaxNumberOfFiles(1);
                            } else if (!data.maxNumberOfFilesAdjusted &&
                                    !file.error) {
                                that._adjustMaxNumberOfFiles(-1);
                            }
                        });
                        data.maxNumberOfFilesAdjusted = true;
                    }
                    template = that._renderDownload(data.result)
                        .appendTo(that.options.filesContainer);
                    that._forceReflow(template);
                    that._transition(template).done(
                        function () {
                            data.context = $(this);
                            that._trigger('completed', e, data);
                        }
                    );
                }
            },
            // Callback for failed (abort or error) uploads:
            fail: function (e, data) {
                var that = $(this).data('fileupload'),
                    template;
                if (data.maxNumberOfFilesAdjusted) {
                    that._adjustMaxNumberOfFiles(data.files.length);
                }
                if (data.context) {
                    data.context.each(function (index) {
                        if (data.errorThrown !== 'abort') {
                            var file = data.files[index];
                            file.error = file.error || data.errorThrown ||
                                true;
                            that._transition($(this)).done(
                                function () {
                                    var node = $(this);
                                    template = that._renderDownload([file])
                                        .replaceAll(node);
                                    that._forceReflow(template);
                                    that._transition(template).done(
                                        function () {
                                            data.context = $(this);
                                            that._trigger('failed', e, data);
                                        }
                                    );
                                }
                            );
                        } else {
                            that._transition($(this)).done(
                                function () {
                                    $(this).remove();
                                    that._trigger('failed', e, data);
                                }
                            );
                        }
                    });
                } else if (data.errorThrown !== 'abort') {
                    data.context = that._renderUpload(data.files)
                        .appendTo(that.options.filesContainer)
                        .data('data', data);
                    that._forceReflow(data.context);
                    that._transition(data.context).done(
                        function () {
                            data.context = $(this);
                            that._trigger('failed', e, data);
                        }
                    );
                } else {
                    that._trigger('failed', e, data);
                }
            },
            // Callback for upload progress events:
            progress: function (e, data) {
                if (data.context) {
                    var progress = parseInt(data.loaded / data.total * 100, 10);
                    data.context.find('.progress')
                        .attr('aria-valuenow', progress)
                        .find('.bar').css(
                            'width',
                            progress + '%'
                        );
                }
            },
            // Callback for global upload progress events:
            progressall: function (e, data) {
                var $this = $(this),
                    progress = parseInt(data.loaded / data.total * 100, 10),
                    globalProgressNode = $this.find('.fileupload-progress'),
                    extendedProgressNode = globalProgressNode
                        .find('.progress-extended');
                if (extendedProgressNode.length) {
                    extendedProgressNode.html(
                        $this.data('fileupload')._renderExtendedProgress(data)
                    );
                }
                globalProgressNode
                    .find('.progress')
                    .attr('aria-valuenow', progress)
                    .find('.bar').css(
                        'width',
                        progress + '%'
                    );
            },
            // Callback for uploads start, equivalent to the global ajaxStart event:
            start: function (e) {
                var that = $(this).data('fileupload');
                that._transition($(this).find('.fileupload-progress')).done(
                    function () {
                        that._trigger('started', e);
                    }
                );
            },
            // Callback for uploads stop, equivalent to the global ajaxStop event:
            stop: function (e) {
                var that = $(this).data('fileupload');
                that._transition($(this).find('.fileupload-progress')).done(
                    function () {
                        $(this).find('.progress')
                            .attr('aria-valuenow', '0')
                            .find('.bar').css('width', '0%');
                        $(this).find('.progress-extended').html('&nbsp;');
                        that._trigger('stopped', e);
                    }
                );
            },
            // Callback for file deletion:
            destroy: function (e, data) {
                var that = $(this).data('fileupload');
                if (data.url) {
                    $.ajax(data);
                    that._adjustMaxNumberOfFiles(1);
                }
                that._transition(data.context).done(
                    function () {
                        $(this).remove();
                        that._trigger('destroyed', e, data);
                    }
                );
            }
        },

        // Link handler, that allows to download files
        // by drag & drop of the links to the desktop:
        _enableDragToDesktop: function () {
            var link = $(this),
                url = link.prop('href'),
                name = link.prop('download'),
                type = 'application/octet-stream';
            link.bind('dragstart', function (e) {
                try {
                    e.originalEvent.dataTransfer.setData(
                        'DownloadURL',
                        [type, name, url].join(':')
                    );
                } catch (err) {}
            });
        },

        _adjustMaxNumberOfFiles: function (operand) {
            if (typeof this.options.maxNumberOfFiles === 'number') {
                this.options.maxNumberOfFiles += operand;
                if (this.options.maxNumberOfFiles < 1) {
                    this._disableFileInputButton();
                } else {
                    this._enableFileInputButton();
                }
            }
        },

        _formatFileSize: function (bytes) {
            if (typeof bytes !== 'number') {
                return '';
            }
            if (bytes >= 1000000000) {
                return (bytes / 1000000000).toFixed(2) + ' GB';
            }
            if (bytes >= 1000000) {
                return (bytes / 1000000).toFixed(2) + ' MB';
            }
            return (bytes / 1000).toFixed(2) + ' KB';
        },

        _formatBitrate: function (bits) {
            if (typeof bits !== 'number') {
                return '';
            }
            if (bits >= 1000000000) {
                return (bits / 1000000000).toFixed(2) + ' Gbit/s';
            }
            if (bits >= 1000000) {
                return (bits / 1000000).toFixed(2) + ' Mbit/s';
            }
            if (bits >= 1000) {
                return (bits / 1000).toFixed(2) + ' kbit/s';
            }
            return bits + ' bit/s';
        },

        _formatTime: function (seconds) {
            var date = new Date(seconds * 1000),
                days = parseInt(seconds / 86400, 10);
            days = days ? days + 'd ' : '';
            return days +
                ('0' + date.getUTCHours()).slice(-2) + ':' +
                ('0' + date.getUTCMinutes()).slice(-2) + ':' +
                ('0' + date.getUTCSeconds()).slice(-2);
        },

        _formatPercentage: function (floatValue) {
            return (floatValue * 100).toFixed(2) + ' %';
        },

        _renderExtendedProgress: function (data) {
            return this._formatBitrate(data.bitrate) + ' | ' +
                this._formatTime(
                    (data.total - data.loaded) * 8 / data.bitrate
                ) + ' | ' +
                this._formatPercentage(
                    data.loaded / data.total
                ) + ' | ' +
                this._formatFileSize(data.loaded) + ' / ' +
                this._formatFileSize(data.total);
        },

        _hasError: function (file) {
            if (file.error) {
                return file.error;
            }
            // The number of added files is subtracted from
            // maxNumberOfFiles before validation, so we check if
            // maxNumberOfFiles is below 0 (instead of below 1):
            if (this.options.maxNumberOfFiles < 0) {
                return 'maxNumberOfFiles';
            }
            // Files are accepted if either the file type or the file name
            // matches against the acceptFileTypes regular expression, as
            // only browsers with support for the File API report the type:
            if (!(this.options.acceptFileTypes.test(file.type) ||
                    this.options.acceptFileTypes.test(file.name))) {
                return 'acceptFileTypes';
            }
            if (this.options.maxFileSize &&
                    file.size > this.options.maxFileSize) {
                return 'maxFileSize';
            }
            if (typeof file.size === 'number' &&
                    file.size < this.options.minFileSize) {
                return 'minFileSize';
            }
            return null;
        },

        _validate: function (files) {
            var that = this,
                valid = !!files.length;
            $.each(files, function (index, file) {
                file.error = that._hasError(file);
                if (file.error) {
                    valid = false;
                }
            });
            return valid;
        },

        _renderTemplate: function (func, files) {
            if (!func) {
                return $();
            }
            var result = func({
                files: files,
                formatFileSize: this._formatFileSize,
                options: this.options
            });
            if (result instanceof $) {
                return result;
            }
            return $(this.options.templatesContainer).html(result).children();
        },

        _renderPreview: function (file, node) {
            var that = this,
                options = this.options,
                dfd = $.Deferred();
            return ((loadImage && loadImage(
                file,
                function (img) {
                    node.append(img);
                    that._forceReflow(node);
                    that._transition(node).done(function () {
                        dfd.resolveWith(node);
                    });
                    if (!$.contains(document.body, node[0])) {
                        // If the element is not part of the DOM,
                        // transition events are not triggered,
                        // so we have to resolve manually:
                        dfd.resolveWith(node);
                    }
                },
                {
                    maxWidth: options.previewMaxWidth,
                    maxHeight: options.previewMaxHeight,
                    canvas: options.previewAsCanvas
                }
            )) || dfd.resolveWith(node)) && dfd;
        },

        _renderPreviews: function (files, nodes) {
            var that = this,
                options = this.options;
            nodes.find('.preview span').each(function (index, element) {
                var file = files[index];
                if (options.previewSourceFileTypes.test(file.type) &&
                        ($.type(options.previewSourceMaxFileSize) !== 'number' ||
                        file.size < options.previewSourceMaxFileSize)) {
                    that._processingQueue = that._processingQueue.pipe(function () {
                        var dfd = $.Deferred();
                        that._renderPreview(file, $(element)).done(
                            function () {
                                dfd.resolveWith(that);
                            }
                        );
                        return dfd.promise();
                    });
                }
            });
            return this._processingQueue;
        },

        _renderUpload: function (files) {
            return this._renderTemplate(
                this.options.uploadTemplate,
                files
            );
        },

        _renderDownload: function (files) {
            return this._renderTemplate(
                this.options.downloadTemplate,
                files
            ).find('a[download]').each(this._enableDragToDesktop).end();
        },

        _startHandler: function (e) {
            e.preventDefault();
            var button = $(this),
                template = button.closest('.template-upload'),
                data = template.data('data');
            if (data && data.submit && !data.jqXHR && data.submit()) {
                button.prop('disabled', true);
            }
        },

        _cancelHandler: function (e) {
            e.preventDefault();
            var template = $(this).closest('.template-upload'),
                data = template.data('data') || {};
            if (!data.jqXHR) {
                data.errorThrown = 'abort';
                e.data.fileupload._trigger('fail', e, data);
            } else {
                data.jqXHR.abort();
            }
        },

        _deleteHandler: function (e) {
            e.preventDefault();
            var button = $(this);
            e.data.fileupload._trigger('destroy', e, {
                context: button.closest('.template-download'),
                url: button.attr('data-url'),
                type: button.attr('data-type') || 'DELETE',
                dataType: e.data.fileupload.options.dataType
            });
        },

        _forceReflow: function (node) {
            return $.support.transition && node.length &&
                node[0].offsetWidth;
        },

        _transition: function (node) {
            var dfd = $.Deferred();
            if ($.support.transition && node.hasClass('fade')) {
                node.bind(
                    $.support.transition.end,
                    function (e) {
                        // Make sure we don't respond to other transitions events
                        // in the container element, e.g. from button elements:
                        if (e.target === node[0]) {
                            node.unbind($.support.transition.end);
                            dfd.resolveWith(node);
                        }
                    }
                ).toggleClass('in');
            } else {
                node.toggleClass('in');
                dfd.resolveWith(node);
            }
            return dfd;
        },

        _initButtonBarEventHandlers: function () {
            var fileUploadButtonBar = this.element.find('.fileupload-buttonbar'),
                filesList = this.options.filesContainer,
                ns = this.options.namespace;
            fileUploadButtonBar.find('.start')
                .bind('click.' + ns, function (e) {
                    e.preventDefault();
                    filesList.find('.start button').click();
                });
            fileUploadButtonBar.find('.cancel')
                .bind('click.' + ns, function (e) {
                    e.preventDefault();
                    filesList.find('.cancel button').click();
                });
            fileUploadButtonBar.find('.delete')
                .bind('click.' + ns, function (e) {
                    e.preventDefault();
                    filesList.find('.delete input:checked')
                        .siblings('button').click();
                    fileUploadButtonBar.find('.toggle')
                        .prop('checked', false);
                });
            fileUploadButtonBar.find('.toggle')
                .bind('change.' + ns, function (e) {
                    filesList.find('.delete input').prop(
                        'checked',
                        $(this).is(':checked')
                    );
                });
        },

        _destroyButtonBarEventHandlers: function () {
            this.element.find('.fileupload-buttonbar button')
                .unbind('click.' + this.options.namespace);
            this.element.find('.fileupload-buttonbar .toggle')
                .unbind('change.' + this.options.namespace);
        },

        _initEventHandlers: function () {
            parentWidget.prototype._initEventHandlers.call(this);
            var eventData = {fileupload: this};
            this.options.filesContainer
                .delegate(
                    '.start button',
                    'click.' + this.options.namespace,
                    eventData,
                    this._startHandler
                )
                .delegate(
                    '.cancel button',
                    'click.' + this.options.namespace,
                    eventData,
                    this._cancelHandler
                )
                .delegate(
                    '.delete button',
                    'click.' + this.options.namespace,
                    eventData,
                    this._deleteHandler
                );
            this._initButtonBarEventHandlers();
        },

        _destroyEventHandlers: function () {
            var options = this.options;
            this._destroyButtonBarEventHandlers();
            options.filesContainer
                .undelegate('.start button', 'click.' + options.namespace)
                .undelegate('.cancel button', 'click.' + options.namespace)
                .undelegate('.delete button', 'click.' + options.namespace);
            parentWidget.prototype._destroyEventHandlers.call(this);
        },

        _enableFileInputButton: function () {
            this.element.find('.fileinput-button input')
                .prop('disabled', false)
                .parent().removeClass('disabled');
        },

        _disableFileInputButton: function () {
            this.element.find('.fileinput-button input')
                .prop('disabled', true)
                .parent().addClass('disabled');
        },

        _initTemplates: function () {
            var options = this.options;
            options.templatesContainer = document.createElement(
                options.filesContainer.prop('nodeName')
            );
            if (tmpl) {
                if (options.uploadTemplateId) {
                    options.uploadTemplate = tmpl(options.uploadTemplateId);
                }
                if (options.downloadTemplateId) {
                    options.downloadTemplate = tmpl(options.downloadTemplateId);
                }
            }
        },

        _initFilesContainer: function () {
            var options = this.options;
            if (options.filesContainer === undefined) {
                options.filesContainer = this.element.find('.files');
            } else if (!(options.filesContainer instanceof $)) {
                options.filesContainer = $(options.filesContainer);
            }
        },

        _stringToRegExp: function (str) {
            var parts = str.split('/'),
                modifiers = parts.pop();
            parts.shift();
            return new RegExp(parts.join('/'), modifiers);
        },

        _initRegExpOptions: function () {
            var options = this.options;
            if ($.type(options.acceptFileTypes) === 'string') {
                options.acceptFileTypes = this._stringToRegExp(
                    options.acceptFileTypes
                );
            }
            if ($.type(options.previewSourceFileTypes) === 'string') {
                options.previewSourceFileTypes = this._stringToRegExp(
                    options.previewSourceFileTypes
                );
            }
        },

        _initSpecialOptions: function () {
            parentWidget.prototype._initSpecialOptions.call(this);
            this._initFilesContainer();
            this._initTemplates();
            this._initRegExpOptions();
        },

        _create: function () {
            parentWidget.prototype._create.call(this);
            this._refreshOptionsList.push(
                'filesContainer',
                'uploadTemplateId',
                'downloadTemplateId'
            );
            if (!$.blueimpFP) {
                this._processingQueue = $.Deferred().resolveWith(this).promise();
                this.process = function () {
                    return this._processingQueue;
                };
            }
        },

        enable: function () {
            var wasDisabled = false;
            if (this.options.disabled) {
                wasDisabled = true;
            }
            parentWidget.prototype.enable.call(this);
            if (wasDisabled) {
                this.element.find('input, button').prop('disabled', false);
                this._enableFileInputButton();
            }
        },

        disable: function () {
            if (!this.options.disabled) {
                this.element.find('input, button').prop('disabled', true);
                this._disableFileInputButton();
            }
            parentWidget.prototype.disable.call(this);
        }

    });

}));
;/*
 * jQuery File Upload Plugin 5.17.1
 * https://github.com/blueimp/jQuery-File-Upload
 *
 * Copyright 2010, Sebastian Tschan
 * https://blueimp.net
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */

/*jslint nomen: true, unparam: true, regexp: true */
/*global define, window, document, Blob, FormData, location */

(function (factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        // Register as an anonymous AMD module:
        define([
            'jquery',
        ], factory);
    } else {
        // Browser globals:
        factory(window.jQuery);
    }
}(function ($) {
    'use strict';

    // The FileReader API is not actually used, but works as feature detection,
    // as e.g. Safari supports XHR file uploads via the FormData API,
    // but not non-multipart XHR file uploads:
    $.support.xhrFileUpload = !!(window.XMLHttpRequestUpload && window.FileReader);
    $.support.xhrFormDataFileUpload = !!window.FormData;

    // The fileupload widget listens for change events on file input fields defined
    // via fileInput setting and paste or drop events of the given dropZone.
    // In addition to the default jQuery Widget methods, the fileupload widget
    // exposes the "add" and "send" methods, to add or directly send files using
    // the fileupload API.
    // By default, files added via file input selection, paste, drag & drop or
    // "add" method are uploaded immediately, but it is possible to override
    // the "add" callback option to queue file uploads.
    $.widget('blueimp.fileupload', {

        options: {
            // The namespace used for event handler binding on the fileInput,
            // dropZone and pasteZone document nodes.
            // If not set, the name of the widget ("fileupload") is used.
            namespace: undefined,
            // The drop target element(s), by the default the complete document.
            // Set to null to disable drag & drop support:
            dropZone: $(document),
            // The paste target element(s), by the default the complete document.
            // Set to null to disable paste support:
            pasteZone: $(document),
            // The file input field(s), that are listened to for change events.
            // If undefined, it is set to the file input fields inside
            // of the widget element on plugin initialization.
            // Set to null to disable the change listener.
            fileInput: undefined,
            // By default, the file input field is replaced with a clone after
            // each input field change event. This is required for iframe transport
            // queues and allows change events to be fired for the same file
            // selection, but can be disabled by setting the following option to false:
            replaceFileInput: true,
            // The parameter name for the file form data (the request argument name).
            // If undefined or empty, the name property of the file input field is
            // used, or "files[]" if the file input name property is also empty,
            // can be a string or an array of strings:
            paramName: undefined,
            // By default, each file of a selection is uploaded using an individual
            // request for XHR type uploads. Set to false to upload file
            // selections in one request each:
            singleFileUploads: true,
            // To limit the number of files uploaded with one XHR request,
            // set the following option to an integer greater than 0:
            limitMultiFileUploads: undefined,
            // Set the following option to true to issue all file upload requests
            // in a sequential order:
            sequentialUploads: false,
            // To limit the number of concurrent uploads,
            // set the following option to an integer greater than 0:
            limitConcurrentUploads: undefined,
            // Set the following option to true to force iframe transport uploads:
            forceIframeTransport: false,
            // Set the following option to the location of a redirect url on the
            // origin server, for cross-domain iframe transport uploads:
            redirect: undefined,
            // The parameter name for the redirect url, sent as part of the form
            // data and set to 'redirect' if this option is empty:
            redirectParamName: undefined,
            // Set the following option to the location of a postMessage window,
            // to enable postMessage transport uploads:
            postMessage: undefined,
            // By default, XHR file uploads are sent as multipart/form-data.
            // The iframe transport is always using multipart/form-data.
            // Set to false to enable non-multipart XHR uploads:
            multipart: true,
            // To upload large files in smaller chunks, set the following option
            // to a preferred maximum chunk size. If set to 0, null or undefined,
            // or the browser does not support the required Blob API, files will
            // be uploaded as a whole.
            maxChunkSize: undefined,
            // When a non-multipart upload or a chunked multipart upload has been
            // aborted, this option can be used to resume the upload by setting
            // it to the size of the already uploaded bytes. This option is most
            // useful when modifying the options object inside of the "add" or
            // "send" callbacks, as the options are cloned for each file upload.
            uploadedBytes: undefined,
            // By default, failed (abort or error) file uploads are removed from the
            // global progress calculation. Set the following option to false to
            // prevent recalculating the global progress data:
            recalculateProgress: true,
            // Interval in milliseconds to calculate and trigger progress events:
            progressInterval: 100,
            // Interval in milliseconds to calculate progress bitrate:
            bitrateInterval: 500,

            // Additional form data to be sent along with the file uploads can be set
            // using this option, which accepts an array of objects with name and
            // value properties, a function returning such an array, a FormData
            // object (for XHR file uploads), or a simple object.
            // The form of the first fileInput is given as parameter to the function:
            formData: function (form) {
                return form.serializeArray();
            },

            // The add callback is invoked as soon as files are added to the fileupload
            // widget (via file input selection, drag & drop, paste or add API call).
            // If the singleFileUploads option is enabled, this callback will be
            // called once for each file in the selection for XHR file uplaods, else
            // once for each file selection.
            // The upload starts when the submit method is invoked on the data parameter.
            // The data object contains a files property holding the added files
            // and allows to override plugin options as well as define ajax settings.
            // Listeners for this callback can also be bound the following way:
            // .bind('fileuploadadd', func);
            // data.submit() returns a Promise object and allows to attach additional
            // handlers using jQuery's Deferred callbacks:
            // data.submit().done(func).fail(func).always(func);
            add: function (e, data) {
                data.submit();
            },

            // Other callbacks:
            // Callback for the submit event of each file upload:
            // submit: function (e, data) {}, // .bind('fileuploadsubmit', func);
            // Callback for the start of each file upload request:
            // send: function (e, data) {}, // .bind('fileuploadsend', func);
            // Callback for successful uploads:
            // done: function (e, data) {}, // .bind('fileuploaddone', func);
            // Callback for failed (abort or error) uploads:
            // fail: function (e, data) {}, // .bind('fileuploadfail', func);
            // Callback for completed (success, abort or error) requests:
            // always: function (e, data) {}, // .bind('fileuploadalways', func);
            // Callback for upload progress events:
            // progress: function (e, data) {}, // .bind('fileuploadprogress', func);
            // Callback for global upload progress events:
            // progressall: function (e, data) {}, // .bind('fileuploadprogressall', func);
            // Callback for uploads start, equivalent to the global ajaxStart event:
            // start: function (e) {}, // .bind('fileuploadstart', func);
            // Callback for uploads stop, equivalent to the global ajaxStop event:
            // stop: function (e) {}, // .bind('fileuploadstop', func);
            // Callback for change events of the fileInput(s):
            // change: function (e, data) {}, // .bind('fileuploadchange', func);
            // Callback for paste events to the pasteZone(s):
            // paste: function (e, data) {}, // .bind('fileuploadpaste', func);
            // Callback for drop events of the dropZone(s):
            // drop: function (e, data) {}, // .bind('fileuploaddrop', func);
            // Callback for dragover events of the dropZone(s):
            // dragover: function (e) {}, // .bind('fileuploaddragover', func);

            // The plugin options are used as settings object for the ajax calls.
            // The following are jQuery ajax settings required for the file uploads:
            processData: false,
            contentType: false,
            cache: false
        },

        // A list of options that require a refresh after assigning a new value:
        _refreshOptionsList: [
            'namespace',
            'fileInput',
            'dropZone',
            'pasteZone',
            'multipart',
            'forceIframeTransport'
        ],

        _BitrateTimer: function () {
            this.timestamp = +(new Date());
            this.loaded = 0;
            this.bitrate = 0;
            this.getBitrate = function (now, loaded, interval) {
                var timeDiff = now - this.timestamp;
                if (!this.bitrate || !interval || timeDiff > interval) {
                    this.bitrate = (loaded - this.loaded) * (1000 / timeDiff) * 8;
                    this.loaded = loaded;
                    this.timestamp = now;
                }
                return this.bitrate;
            };
        },

        _isXHRUpload: function (options) {
            return !options.forceIframeTransport &&
                ((!options.multipart && $.support.xhrFileUpload) ||
                $.support.xhrFormDataFileUpload);
        },

        _getFormData: function (options) {
            var formData;
            if (typeof options.formData === 'function') {
                return options.formData(options.form);
            }
			if ($.isArray(options.formData)) {
                return options.formData;
            }
			if (options.formData) {
                formData = [];
                $.each(options.formData, function (name, value) {
                    formData.push({name: name, value: value});
                });
                return formData;
            }
            return [];
        },

        _getTotal: function (files) {
            var total = 0;
            $.each(files, function (index, file) {
                total += file.size || 1;
            });
            return total;
        },

        _onProgress: function (e, data) {
            if (e.lengthComputable) {
                var now = +(new Date()),
                    total,
                    loaded;
                if (data._time && data.progressInterval &&
                        (now - data._time < data.progressInterval) &&
                        e.loaded !== e.total) {
                    return;
                }
                data._time = now;
                total = data.total || this._getTotal(data.files);
                loaded = parseInt(
                    e.loaded / e.total * (data.chunkSize || total),
                    10
                ) + (data.uploadedBytes || 0);
                this._loaded += loaded - (data.loaded || data.uploadedBytes || 0);
                data.lengthComputable = true;
                data.loaded = loaded;
                data.total = total;
                data.bitrate = data._bitrateTimer.getBitrate(
                    now,
                    loaded,
                    data.bitrateInterval
                );
                // Trigger a custom progress event with a total data property set
                // to the file size(s) of the current upload and a loaded data
                // property calculated accordingly:
                this._trigger('progress', e, data);
                // Trigger a global progress event for all current file uploads,
                // including ajax calls queued for sequential file uploads:
                this._trigger('progressall', e, {
                    lengthComputable: true,
                    loaded: this._loaded,
                    total: this._total,
                    bitrate: this._bitrateTimer.getBitrate(
                        now,
                        this._loaded,
                        data.bitrateInterval
                    )
                });
            }
        },

        _initProgressListener: function (options) {
            var that = this,
                xhr = options.xhr ? options.xhr() : $.ajaxSettings.xhr();
            // Accesss to the native XHR object is required to add event listeners
            // for the upload progress event:
            if (xhr.upload) {
                $(xhr.upload).bind('progress', function (e) {
                    var oe = e.originalEvent;
                    // Make sure the progress event properties get copied over:
                    e.lengthComputable = oe.lengthComputable;
                    e.loaded = oe.loaded;
                    e.total = oe.total;
                    that._onProgress(e, options);
                });
                options.xhr = function () {
                    return xhr;
                };
            }
        },

        _initXHRData: function (options) {
            var formData,
                file = options.files[0],
                // Ignore non-multipart setting if not supported:
                multipart = options.multipart || !$.support.xhrFileUpload,
                paramName = options.paramName[0];
            if (!multipart || options.blob) {
                // For non-multipart uploads and chunked uploads,
                // file meta data is not part of the request body,
                // so we transmit this data as part of the HTTP headers.
                // For cross domain requests, these headers must be allowed
                // via Access-Control-Allow-Headers or removed using
                // the beforeSend callback:
                options.headers = $.extend(options.headers, {
                    'X-File-Name': file.name,
                    'X-File-Type': file.type,
                    'X-File-Size': file.size
                });
                if (!options.blob) {
                    // Non-chunked non-multipart upload:
                    options.contentType = file.type;
                    options.data = file;
                } else if (!multipart) {
                    // Chunked non-multipart upload:
                    options.contentType = 'application/octet-stream';
                    options.data = options.blob;
                }
            }
            if (multipart && $.support.xhrFormDataFileUpload) {
                if (options.postMessage) {
                    // window.postMessage does not allow sending FormData
                    // objects, so we just add the File/Blob objects to
                    // the formData array and let the postMessage window
                    // create the FormData object out of this array:
                    formData = this._getFormData(options);
                    if (options.blob) {
                        formData.push({
                            name: paramName,
                            value: options.blob
                        });
                    } else {
                        $.each(options.files, function (index, file) {
                            formData.push({
                                name: options.paramName[index] || paramName,
                                value: file
                            });
                        });
                    }
                } else {
                    if (options.formData instanceof FormData) {
                        formData = options.formData;
                    } else {
                        formData = new FormData();
                        $.each(this._getFormData(options), function (index, field) {
                            formData.append(field.name, field.value);
                        });
                    }
                    if (options.blob) {
                        formData.append(paramName, options.blob, file.name);
                    } else {
                        $.each(options.files, function (index, file) {
                            // File objects are also Blob instances.
                            // This check allows the tests to run with
                            // dummy objects:
                            if (file instanceof Blob) {
                                formData.append(
                                    options.paramName[index] || paramName,
                                    file,
                                    file.name
                                );
                            }
                        });
                    }
                }
                options.data = formData;
            }
            // Blob reference is not needed anymore, free memory:
            options.blob = null;
        },

        _initIframeSettings: function (options) {
            // Setting the dataType to iframe enables the iframe transport:
            options.dataType = 'iframe ' + (options.dataType || '');
            // The iframe transport accepts a serialized array as form data:
            options.formData = this._getFormData(options);
            // Add redirect url to form data on cross-domain uploads:
            if (options.redirect && $('<a></a>').prop('href', options.url)
                    .prop('host') !== location.host) {
                options.formData.push({
                    name: options.redirectParamName || 'redirect',
                    value: options.redirect
                });
            }
        },

        _initDataSettings: function (options) {
            if (this._isXHRUpload(options)) {
                if (!this._chunkedUpload(options, true)) {
                    if (!options.data) {
                        this._initXHRData(options);
                    }
                    this._initProgressListener(options);
                }
                if (options.postMessage) {
                    // Setting the dataType to postmessage enables the
                    // postMessage transport:
                    options.dataType = 'postmessage ' + (options.dataType || '');
                }
            } else {
                this._initIframeSettings(options, 'iframe');
            }
        },

        _getParamName: function (options) {
            var fileInput = $(options.fileInput),
                paramName = options.paramName;
            if (!paramName) {
                paramName = [];
                fileInput.each(function () {
                    var input = $(this),
                        name = input.prop('name') || 'files[]',
                        i = (input.prop('files') || [1]).length;
                    while (i) {
                        paramName.push(name);
                        i -= 1;
                    }
                });
                if (!paramName.length) {
                    paramName = [fileInput.prop('name') || 'files[]'];
                }
            } else if (!$.isArray(paramName)) {
                paramName = [paramName];
            }
            return paramName;
        },

        _initFormSettings: function (options) {
            // Retrieve missing options from the input field and the
            // associated form, if available:
            if (!options.form || !options.form.length) {
                options.form = $(options.fileInput.prop('form'));
                // If the given file input doesn't have an associated form,
                // use the default widget file input's form:
                if (!options.form.length) {
                    options.form = $(this.options.fileInput.prop('form'));
                }
            }
            options.paramName = this._getParamName(options);
            if (!options.url) {
                options.url = options.form.prop('action') || location.href;
            }
            // The HTTP request method must be "POST" or "PUT":
            options.type = (options.type || options.form.prop('method') || '')
                .toUpperCase();
            if (options.type !== 'POST' && options.type !== 'PUT') {
                options.type = 'POST';
            }
            if (!options.formAcceptCharset) {
                options.formAcceptCharset = options.form.attr('accept-charset');
            }
        },

        _getAJAXSettings: function (data) {
            var options = $.extend({}, this.options, data);
            this._initFormSettings(options);
            this._initDataSettings(options);
            return options;
        },

        // Maps jqXHR callbacks to the equivalent
        // methods of the given Promise object:
        _enhancePromise: function (promise) {
            promise.success = promise.done;
            promise.error = promise.fail;
            promise.complete = promise.always;
            return promise;
        },

        // Creates and returns a Promise object enhanced with
        // the jqXHR methods abort, success, error and complete:
        _getXHRPromise: function (resolveOrReject, context, args) {
            var dfd = $.Deferred(),
                promise = dfd.promise();
            context = context || this.options.context || promise;
            if (resolveOrReject === true) {
                dfd.resolveWith(context, args);
            } else if (resolveOrReject === false) {
                dfd.rejectWith(context, args);
            }
            promise.abort = dfd.promise;
            return this._enhancePromise(promise);
        },

        // Uploads a file in multiple, sequential requests
        // by splitting the file up in multiple blob chunks.
        // If the second parameter is true, only tests if the file
        // should be uploaded in chunks, but does not invoke any
        // upload requests:
        _chunkedUpload: function (options, testOnly) {
            var that = this,
                file = options.files[0],
                fs = file.size,
                ub = options.uploadedBytes = options.uploadedBytes || 0,
                mcs = options.maxChunkSize || fs,
                // Use the Blob methods with the slice implementation
                // according to the W3C Blob API specification:
                slice = file.webkitSlice || file.mozSlice || file.slice,
                upload,
                n,
                jqXHR,
                pipe;
            if (!(this._isXHRUpload(options) && slice && (ub || mcs < fs)) ||
                    options.data) {
                return false;
            }
            if (testOnly) {
                return true;
            }
            if (ub >= fs) {
                file.error = 'uploadedBytes';
                return this._getXHRPromise(
                    false,
                    options.context,
                    [null, 'error', file.error]
                );
            }
            // n is the number of blobs to upload,
            // calculated via filesize, uploaded bytes and max chunk size:
            n = Math.ceil((fs - ub) / mcs);
            // The chunk upload method accepting the chunk number as parameter:
            upload = function (i) {
                if (!i) {
                    return that._getXHRPromise(true, options.context);
                }
                // Upload the blobs in sequential order:
                return upload(i -= 1).pipe(function () {
                    // Clone the options object for each chunk upload:
                    var o = $.extend({}, options);
                    o.blob = slice.call(
                        file,
                        ub + i * mcs,
                        ub + (i + 1) * mcs
                    );
                    // Expose the chunk index:
                    o.chunkIndex = i;
                    // Expose the number of chunks:
                    o.chunksNumber = n;
                    // Store the current chunk size, as the blob itself
                    // will be dereferenced after data processing:
                    o.chunkSize = o.blob.size;
                    // Process the upload data (the blob and potential form data):
                    that._initXHRData(o);
                    // Add progress listeners for this chunk upload:
                    that._initProgressListener(o);
                    jqXHR = ($.ajax(o) || that._getXHRPromise(false, o.context))
                        .done(function () {
                            // Create a progress event if upload is done and
                            // no progress event has been invoked for this chunk:
                            if (!o.loaded) {
                                that._onProgress($.Event('progress', {
                                    lengthComputable: true,
                                    loaded: o.chunkSize,
                                    total: o.chunkSize
                                }), o);
                            }
                            options.uploadedBytes = o.uploadedBytes +=
                                o.chunkSize;
                        });
                    return jqXHR;
                });
            };
            // Return the piped Promise object, enhanced with an abort method,
            // which is delegated to the jqXHR object of the current upload,
            // and jqXHR callbacks mapped to the equivalent Promise methods:
            pipe = upload(n);
            pipe.abort = function () {
                return jqXHR.abort();
            };
            return this._enhancePromise(pipe);
        },

        _beforeSend: function (e, data) {
            if (this._active === 0) {
                // the start callback is triggered when an upload starts
                // and no other uploads are currently running,
                // equivalent to the global ajaxStart event:
                this._trigger('start');
                // Set timer for global bitrate progress calculation:
                this._bitrateTimer = new this._BitrateTimer();
            }
            this._active += 1;
            // Initialize the global progress values:
            this._loaded += data.uploadedBytes || 0;
            this._total += this._getTotal(data.files);
        },

        _onDone: function (result, textStatus, jqXHR, options) {
            if (!this._isXHRUpload(options)) {
                // Create a progress event for each iframe load:
                this._onProgress($.Event('progress', {
                    lengthComputable: true,
                    loaded: 1,
                    total: 1
                }), options);
            }
            options.result = result;
            options.textStatus = textStatus;
            options.jqXHR = jqXHR;
            this._trigger('done', null, options);
        },

        _onFail: function (jqXHR, textStatus, errorThrown, options) {
            options.jqXHR = jqXHR;
            options.textStatus = textStatus;
            options.errorThrown = errorThrown;
            this._trigger('fail', null, options);
            if (options.recalculateProgress) {
                // Remove the failed (error or abort) file upload from
                // the global progress calculation:
                this._loaded -= options.loaded || options.uploadedBytes || 0;
                this._total -= options.total || this._getTotal(options.files);
            }
        },

        _onAlways: function (jqXHRorResult, textStatus, jqXHRorError, options) {
            this._active -= 1;
            options.textStatus = textStatus;
            if (jqXHRorError && jqXHRorError.always) {
                options.jqXHR = jqXHRorError;
                options.result = jqXHRorResult;
            } else {
                options.jqXHR = jqXHRorResult;
                options.errorThrown = jqXHRorError;
            }
            this._trigger('always', null, options);
            if (this._active === 0) {
                // The stop callback is triggered when all uploads have
                // been completed, equivalent to the global ajaxStop event:
                this._trigger('stop');
                // Reset the global progress values:
                this._loaded = this._total = 0;
                this._bitrateTimer = null;
            }
        },

        _onSend: function (e, data) {
            var that = this,
                jqXHR,
                slot,
                pipe,
                options = that._getAJAXSettings(data),
                send = function (resolve, args) {
                    that._sending += 1;
                    // Set timer for bitrate progress calculation:
                    options._bitrateTimer = new that._BitrateTimer();
                    jqXHR = jqXHR || (
                        (resolve !== false &&
                        that._trigger('send', e, options) !== false &&
                        (that._chunkedUpload(options) || $.ajax(options))) ||
                        that._getXHRPromise(false, options.context, args)
                    ).done(function (result, textStatus, jqXHR) {
                        that._onDone(result, textStatus, jqXHR, options);
                    }).fail(function (jqXHR, textStatus, errorThrown) {
                        that._onFail(jqXHR, textStatus, errorThrown, options);
                    }).always(function (jqXHRorResult, textStatus, jqXHRorError) {
                        that._sending -= 1;
                        that._onAlways(
                            jqXHRorResult,
                            textStatus,
                            jqXHRorError,
                            options
                        );
                        if (options.limitConcurrentUploads &&
                                options.limitConcurrentUploads > that._sending) {
                            // Start the next queued upload,
                            // that has not been aborted:
                            var nextSlot = that._slots.shift(),
                                isPending;
                            while (nextSlot) {
                                // jQuery 1.6 doesn't provide .state(),
                                // while jQuery 1.8+ removed .isRejected():
                                isPending = nextSlot.state ?
                                        nextSlot.state() === 'pending' :
                                        !nextSlot.isRejected();
                                if (isPending) {
                                    nextSlot.resolve();
                                    break;
                                }
                                nextSlot = that._slots.shift();
                            }
                        }
                    });
                    return jqXHR;
                };
            this._beforeSend(e, options);
            if (this.options.sequentialUploads ||
                    (this.options.limitConcurrentUploads &&
                    this.options.limitConcurrentUploads <= this._sending)) {
                if (this.options.limitConcurrentUploads > 1) {
                    slot = $.Deferred();
                    this._slots.push(slot);
                    pipe = slot.pipe(send);
                } else {
                    pipe = (this._sequence = this._sequence.pipe(send, send));
                }
                // Return the piped Promise object, enhanced with an abort method,
                // which is delegated to the jqXHR object of the current upload,
                // and jqXHR callbacks mapped to the equivalent Promise methods:
                pipe.abort = function () {
                    var args = [undefined, 'abort', 'abort'];
                    if (!jqXHR) {
                        if (slot) {
                            slot.rejectWith(pipe, args);
                        }
                        return send(false, args);
                    }
                    return jqXHR.abort();
                };
                return this._enhancePromise(pipe);
            }
            return send();
        },

        _onAdd: function (e, data) {
            var that = this,
                result = true,
                options = $.extend({}, this.options, data),
                limit = options.limitMultiFileUploads,
                paramName = this._getParamName(options),
                paramNameSet,
                paramNameSlice,
                fileSet,
                i;
            if (!(options.singleFileUploads || limit) ||
                    !this._isXHRUpload(options)) {
                fileSet = [data.files];
                paramNameSet = [paramName];
            } else if (!options.singleFileUploads && limit) {
                fileSet = [];
                paramNameSet = [];
                for (i = 0; i < data.files.length; i += limit) {
                    fileSet.push(data.files.slice(i, i + limit));
                    paramNameSlice = paramName.slice(i, i + limit);
                    if (!paramNameSlice.length) {
                        paramNameSlice = paramName;
                    }
                    paramNameSet.push(paramNameSlice);
                }
            } else {
                paramNameSet = paramName;
            }
            data.originalFiles = data.files;
            $.each(fileSet || data.files, function (index, element) {
                var newData = $.extend({}, data);
                newData.files = fileSet ? element : [element];
                newData.paramName = paramNameSet[index];
                newData.submit = function () {
                    newData.jqXHR = this.jqXHR =
                        (that._trigger('submit', e, this) !== false) &&
                        that._onSend(e, this);
                    return this.jqXHR;
                };
                return (result = that._trigger('add', e, newData));
            });
            return result;
        },

        _replaceFileInput: function (input) {
            var inputClone = input.clone(true);
            $('<form></form>').append(inputClone)[0].reset();
            // Detaching allows to insert the fileInput on another form
            // without loosing the file input value:
            input.after(inputClone).detach();
            // Avoid memory leaks with the detached file input:
            $.cleanData(input.unbind('remove'));
            // Replace the original file input element in the fileInput
            // elements set with the clone, which has been copied including
            // event handlers:
            this.options.fileInput = this.options.fileInput.map(function (i, el) {
                if (el === input[0]) {
                    return inputClone[0];
                }
                return el;
            });
            // If the widget has been initialized on the file input itself,
            // override this.element with the file input clone:
            if (input[0] === this.element[0]) {
                this.element = inputClone;
            }
        },

        _handleFileTreeEntry: function (entry, path) {
            var that = this,
                dfd = $.Deferred(),
                errorHandler = function () {
                    dfd.reject();
                },
                dirReader;
            path = path || '';
            if (entry.isFile) {
                entry.file(function (file) {
                    file.relativePath = path;
                    dfd.resolve(file);
                }, errorHandler);
            } else if (entry.isDirectory) {
                dirReader = entry.createReader();
                dirReader.readEntries(function (entries) {
                    that._handleFileTreeEntries(
                        entries,
                        path + entry.name + '/'
                    ).done(function (files) {
                        dfd.resolve(files);
                    }).fail(errorHandler);
                }, errorHandler);
            } else {
                errorHandler();
            }
            return dfd.promise();
        },

        _handleFileTreeEntries: function (entries, path) {
            var that = this;
            return $.when.apply(
                $,
                $.map(entries, function (entry) {
                    return that._handleFileTreeEntry(entry, path);
                })
            ).pipe(function () {
                return Array.prototype.concat.apply(
                    [],
                    arguments
                );
            });
        },

        _getDroppedFiles: function (dataTransfer) {
            dataTransfer = dataTransfer || {};
            var items = dataTransfer.items;
            if (items && items.length && (items[0].webkitGetAsEntry ||
                    items[0].getAsEntry)) {
                return this._handleFileTreeEntries(
                    $.map(items, function (item) {
                        if (item.webkitGetAsEntry) {
                            return item.webkitGetAsEntry();
                        }
                        return item.getAsEntry();
                    })
                );
            }
            return $.Deferred().resolve(
                $.makeArray(dataTransfer.files)
            ).promise();
        },

        _getSingleFileInputFiles: function (fileInput) {
            fileInput = $(fileInput);
            var entries = fileInput.prop('webkitEntries') ||
                    fileInput.prop('entries'),
                files,
                value;
            if (entries && entries.length) {
                return this._handleFileTreeEntries(entries);
            }
            files = $.makeArray(fileInput.prop('files'));
            if (!files.length) {
                value = fileInput.prop('value');
                if (!value) {
                    return $.Deferred().resolve([]).promise();
                }
                // If the files property is not available, the browser does not
                // support the File API and we add a pseudo File object with
                // the input value as name with path information removed:
                files = [{name: value.replace(/^.*\\/, '')}];
            }
            return $.Deferred().resolve(files).promise();
        },

        _getFileInputFiles: function (fileInput) {
            if (!(fileInput instanceof $) || fileInput.length === 1) {
                return this._getSingleFileInputFiles(fileInput);
            }
            return $.when.apply(
                $,
                $.map(fileInput, this._getSingleFileInputFiles)
            ).pipe(function () {
                return Array.prototype.concat.apply(
                    [],
                    arguments
                );
            });
        },

        _onChange: function (e) {
            var that = e.data.fileupload,
                data = {
                    fileInput: $(e.target),
                    form: $(e.target.form)
                };
            that._getFileInputFiles(data.fileInput).always(function (files) {
                data.files = files;
                if (that.options.replaceFileInput) {
                    that._replaceFileInput(data.fileInput);
                }
                if (that._trigger('change', e, data) !== false) {
                    that._onAdd(e, data);
                }
            });
        },

        _onPaste: function (e) {
            var that = e.data.fileupload,
                cbd = e.originalEvent.clipboardData,
                items = (cbd && cbd.items) || [],
                data = {files: []};
            $.each(items, function (index, item) {
                var file = item.getAsFile && item.getAsFile();
                if (file) {
                    data.files.push(file);
                }
            });
            if (that._trigger('paste', e, data) === false ||
                    that._onAdd(e, data) === false) {
                return false;
            }
        },

        _onDrop: function (e) {
            e.preventDefault();
            var that = e.data.fileupload,
                dataTransfer = e.dataTransfer = e.originalEvent.dataTransfer,
                data = {};
            that._getDroppedFiles(dataTransfer).always(function (files) {
                data.files = files;
                if (that._trigger('drop', e, data) !== false) {
                    that._onAdd(e, data);
                }
            });
        },

        _onDragOver: function (e) {
            var that = e.data.fileupload,
                dataTransfer = e.dataTransfer = e.originalEvent.dataTransfer;
            if (that._trigger('dragover', e) === false) {
                return false;
            }
            if (dataTransfer) {
                dataTransfer.dropEffect = 'copy';
            }
            e.preventDefault();
        },

        _initEventHandlers: function () {
            var ns = this.options.namespace;
            if (this._isXHRUpload(this.options)) {
                this.options.dropZone
                    .bind('dragover.' + ns, {fileupload: this}, this._onDragOver)
                    .bind('drop.' + ns, {fileupload: this}, this._onDrop);
                this.options.pasteZone
                    .bind('paste.' + ns, {fileupload: this}, this._onPaste);
            }
            this.options.fileInput
                .bind('change.' + ns, {fileupload: this}, this._onChange);
        },

        _destroyEventHandlers: function () {
            var ns = this.options.namespace;
            this.options.dropZone
                .unbind('dragover.' + ns, this._onDragOver)
                .unbind('drop.' + ns, this._onDrop);
            this.options.pasteZone
                .unbind('paste.' + ns, this._onPaste);
            this.options.fileInput
                .unbind('change.' + ns, this._onChange);
        },

        _setOption: function (key, value) {
            var refresh = $.inArray(key, this._refreshOptionsList) !== -1;
            if (refresh) {
                this._destroyEventHandlers();
            }
            $.Widget.prototype._setOption.call(this, key, value);
            if (refresh) {
                this._initSpecialOptions();
                this._initEventHandlers();
            }
        },

        _initSpecialOptions: function () {
            var options = this.options;
            if (options.fileInput === undefined) {
                options.fileInput = this.element.is('input[type="file"]') ?
                        this.element : this.element.find('input[type="file"]');
            } else if (!(options.fileInput instanceof $)) {
                options.fileInput = $(options.fileInput);
            }
            if (!(options.dropZone instanceof $)) {
                options.dropZone = $(options.dropZone);
            }
            if (!(options.pasteZone instanceof $)) {
                options.pasteZone = $(options.pasteZone);
            }
        },

        _create: function () {
            var options = this.options;
            // Initialize options set via HTML5 data-attributes:
            $.extend(options, $(this.element[0].cloneNode(false)).data());
            options.namespace = options.namespace || this.widgetName;
            this._initSpecialOptions();
            this._slots = [];
            this._sequence = this._getXHRPromise(true);
            this._sending = this._active = this._loaded = this._total = 0;
            this._initEventHandlers();
        },

        destroy: function () {
            this._destroyEventHandlers();
            $.Widget.prototype.destroy.call(this);
        },

        enable: function () {
            var wasDisabled = false;
            if (this.options.disabled) {
                wasDisabled = true;
            }
            $.Widget.prototype.enable.call(this);
            if (wasDisabled) {
                this._initEventHandlers();
            }
        },

        disable: function () {
            if (!this.options.disabled) {
                this._destroyEventHandlers();
            }
            $.Widget.prototype.disable.call(this);
        },

        // This method is exposed to the widget API and allows adding files
        // using the fileupload API. The data parameter accepts an object which
        // must have a files property and can contain additional options:
        // .fileupload('add', {files: filesList});
        add: function (data) {
            var that = this;
            if (!data || this.options.disabled) {
                return;
            }
            if (data.fileInput && !data.files) {
                this._getFileInputFiles(data.fileInput).always(function (files) {
                    data.files = files;
                    that._onAdd(null, data);
                });
            } else {
                data.files = $.makeArray(data.files);
                this._onAdd(null, data);
            }
        },

        // This method is exposed to the widget API and allows sending files
        // using the fileupload API. The data parameter accepts an object which
        // must have a files or fileInput property and can contain additional options:
        // .fileupload('send', {files: filesList});
        // The method returns a Promise object for the file upload call.
        send: function (data) {
            if (data && !this.options.disabled) {
                if (data.fileInput && !data.files) {
                    var that = this,
                        dfd = $.Deferred(),
                        promise = dfd.promise(),
                        jqXHR,
                        aborted;
                    promise.abort = function () {
                        aborted = true;
                        if (jqXHR) {
                            return jqXHR.abort();
                        }
                        dfd.reject(null, 'abort', 'abort');
                        return promise;
                    };
                    this._getFileInputFiles(data.fileInput).always(
                        function (files) {
                            if (aborted) {
                                return;
                            }
                            data.files = files;
                            jqXHR = that._onSend(null, data).then(
                                function (result, textStatus, jqXHR) {
                                    dfd.resolve(result, textStatus, jqXHR);
                                },
                                function (jqXHR, textStatus, errorThrown) {
                                    dfd.reject(jqXHR, textStatus, errorThrown);
                                }
                            );
                        }
                    );
                    return this._enhancePromise(promise);
                }
                data.files = $.makeArray(data.files);
                if (data.files.length) {
                    return this._onSend(null, data);
                }
            }
            return this._getXHRPromise(false, data && data.context);
        }

    });

}));
;/*
 * jQuery Iframe Transport Plugin 1.5
 * https://github.com/blueimp/jQuery-File-Upload
 *
 * Copyright 2011, Sebastian Tschan
 * https://blueimp.net
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */

/*jslint unparam: true, nomen: true */
/*global define, window, document */

(function (factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        // Register as an anonymous AMD module:
        define(['jquery'], factory);
    } else {
        // Browser globals:
        factory(window.jQuery);
    }
}(function ($) {
    'use strict';

    // Helper variable to create unique names for the transport iframes:
    var counter = 0;

    // The iframe transport accepts three additional options:
    // options.fileInput: a jQuery collection of file input fields
    // options.paramName: the parameter name for the file form data,
    //  overrides the name property of the file input field(s),
    //  can be a string or an array of strings.
    // options.formData: an array of objects with name and value properties,
    //  equivalent to the return data of .serializeArray(), e.g.:
    //  [{name: 'a', value: 1}, {name: 'b', value: 2}]
    $.ajaxTransport('iframe', function (options) {
        if (options.async && (options.type === 'POST' || options.type === 'GET')) {
            var form,
                iframe;
            return {
                send: function (_, completeCallback) {
                    form = $('<form style="display:none;"></form>');
                    form.attr('accept-charset', options.formAcceptCharset);
                    // javascript:false as initial iframe src
                    // prevents warning popups on HTTPS in IE6.
                    // IE versions below IE8 cannot set the name property of
                    // elements that have already been added to the DOM,
                    // so we set the name along with the iframe HTML markup:
                    iframe = $(
                        '<iframe src="javascript:false;" name="iframe-transport-' +
                            (counter += 1) + '"></iframe>'
                    ).bind('load', function () {
                        var fileInputClones,
                            paramNames = $.isArray(options.paramName) ?
                                    options.paramName : [options.paramName];
                        iframe
                            .unbind('load')
                            .bind('load', function () {
                                var response;
                                // Wrap in a try/catch block to catch exceptions thrown
                                // when trying to access cross-domain iframe contents:
                                try {
                                    response = iframe.contents();
                                    // Google Chrome and Firefox do not throw an
                                    // exception when calling iframe.contents() on
                                    // cross-domain requests, so we unify the response:
                                    if (!response.length || !response[0].firstChild) {
                                        throw new Error();
                                    }
                                } catch (e) {
                                    response = undefined;
                                }
                                // The complete callback returns the
                                // iframe content document as response object:
                                completeCallback(
                                    200,
                                    'success',
                                    {'iframe': response}
                                );
                                // Fix for IE endless progress bar activity bug
                                // (happens on form submits to iframe targets):
                                $('<iframe src="javascript:false;"></iframe>')
                                    .appendTo(form);
                                form.remove();
                            });
                        form
                            .prop('target', iframe.prop('name'))
                            .prop('action', options.url)
                            .prop('method', options.type);
                        if (options.formData) {
                            $.each(options.formData, function (index, field) {
                                $('<input type="hidden"/>')
                                    .prop('name', field.name)
                                    .val(field.value)
                                    .appendTo(form);
                            });
                        }
                        if (options.fileInput && options.fileInput.length &&
                                options.type === 'POST') {
                            fileInputClones = options.fileInput.clone();
                            // Insert a clone for each file input field:
                            options.fileInput.after(function (index) {
                                return fileInputClones[index];
                            });
                            if (options.paramName) {
                                options.fileInput.each(function (index) {
                                    $(this).prop(
                                        'name',
                                        paramNames[index] || options.paramName
                                    );
                                });
                            }
                            // Appending the file input fields to the hidden form
                            // removes them from their original location:
                            form
                                .append(options.fileInput)
                                .prop('enctype', 'multipart/form-data')
                                // enctype must be set as encoding for IE:
                                .prop('encoding', 'multipart/form-data');
                        }
                        form.submit();
                        // Insert the file input fields at their original location
                        // by replacing the clones with the originals:
                        if (fileInputClones && fileInputClones.length) {
                            options.fileInput.each(function (index, input) {
                                var clone = $(fileInputClones[index]);
                                $(input).prop('name', clone.prop('name'));
                                clone.replaceWith(input);
                            });
                        }
                    });
                    form.append(iframe).appendTo(document.body);
                },
                abort: function () {
                    if (iframe) {
                        // javascript:false as iframe src aborts the request
                        // and prevents warning popups on HTTPS in IE6.
                        // concat is used to avoid the "Script URL" JSLint error:
                        iframe
                            .unbind('load')
                            .prop('src', 'javascript'.concat(':false;'));
                    }
                    if (form) {
                        form.remove();
                    }
                }
            };
        }
    });

    // The iframe transport returns the iframe content document as response.
    // The following adds converters from iframe to text, json, html, and script:
    $.ajaxSetup({
        converters: {
            'iframe text': function (iframe) {
                return $(iframe[0].body).text();
            },
            'iframe json': function (iframe) {
                return $.parseJSON($(iframe[0].body).text());
            },
            'iframe html': function (iframe) {
                return $(iframe[0].body).html();
            },
            'iframe script': function (iframe) {
                return $.globalEval($(iframe[0].body).text());
            }
        }
    });

}));
;/**
 * jquery.Jcrop.min.js v0.9.12 (build:20130202)
 * jQuery Image Cropping Plugin - released under MIT License
 * Copyright (c) 2008-2013 Tapmodo Interactive LLC
 * https://github.com/tapmodo/Jcrop
 */
(function(a){a.Jcrop=function(b,c){function i(a){return Math.round(a)+"px"}function j(a){return d.baseClass+"-"+a}function k(){return a.fx.step.hasOwnProperty("backgroundColor")}function l(b){var c=a(b).offset();return[c.left,c.top]}function m(a){return[a.pageX-e[0],a.pageY-e[1]]}function n(b){typeof b!="object"&&(b={}),d=a.extend(d,b),a.each(["onChange","onSelect","onRelease","onDblClick"],function(a,b){typeof d[b]!="function"&&(d[b]=function(){})})}function o(a,b,c){e=l(D),bc.setCursor(a==="move"?a:a+"-resize");if(a==="move")return bc.activateHandlers(q(b),v,c);var d=_.getFixed(),f=r(a),g=_.getCorner(r(f));_.setPressed(_.getCorner(f)),_.setCurrent(g),bc.activateHandlers(p(a,d),v,c)}function p(a,b){return function(c){if(!d.aspectRatio)switch(a){case"e":c[1]=b.y2;break;case"w":c[1]=b.y2;break;case"n":c[0]=b.x2;break;case"s":c[0]=b.x2}else switch(a){case"e":c[1]=b.y+1;break;case"w":c[1]=b.y+1;break;case"n":c[0]=b.x+1;break;case"s":c[0]=b.x+1}_.setCurrent(c),bb.update()}}function q(a){var b=a;return bd.watchKeys
(),function(a){_.moveOffset([a[0]-b[0],a[1]-b[1]]),b=a,bb.update()}}function r(a){switch(a){case"n":return"sw";case"s":return"nw";case"e":return"nw";case"w":return"ne";case"ne":return"sw";case"nw":return"se";case"se":return"nw";case"sw":return"ne"}}function s(a){return function(b){return d.disabled?!1:a==="move"&&!d.allowMove?!1:(e=l(D),W=!0,o(a,m(b)),b.stopPropagation(),b.preventDefault(),!1)}}function t(a,b,c){var d=a.width(),e=a.height();d>b&&b>0&&(d=b,e=b/a.width()*a.height()),e>c&&c>0&&(e=c,d=c/a.height()*a.width()),T=a.width()/d,U=a.height()/e,a.width(d).height(e)}function u(a){return{x:a.x*T,y:a.y*U,x2:a.x2*T,y2:a.y2*U,w:a.w*T,h:a.h*U}}function v(a){var b=_.getFixed();b.w>d.minSelect[0]&&b.h>d.minSelect[1]?(bb.enableHandles(),bb.done()):bb.release(),bc.setCursor(d.allowSelect?"crosshair":"default")}function w(a){if(d.disabled)return!1;if(!d.allowSelect)return!1;W=!0,e=l(D),bb.disableHandles(),bc.setCursor("crosshair");var b=m(a);return _.setPressed(b),bb.update(),bc.activateHandlers(x,v,a.type.substring
(0,5)==="touch"),bd.watchKeys(),a.stopPropagation(),a.preventDefault(),!1}function x(a){_.setCurrent(a),bb.update()}function y(){var b=a("<div></div>").addClass(j("tracker"));return g&&b.css({opacity:0,backgroundColor:"white"}),b}function be(a){G.removeClass().addClass(j("holder")).addClass(a)}function bf(a,b){function t(){window.setTimeout(u,l)}var c=a[0]/T,e=a[1]/U,f=a[2]/T,g=a[3]/U;if(X)return;var h=_.flipCoords(c,e,f,g),i=_.getFixed(),j=[i.x,i.y,i.x2,i.y2],k=j,l=d.animationDelay,m=h[0]-j[0],n=h[1]-j[1],o=h[2]-j[2],p=h[3]-j[3],q=0,r=d.swingSpeed;c=k[0],e=k[1],f=k[2],g=k[3],bb.animMode(!0);var s,u=function(){return function(){q+=(100-q)/r,k[0]=Math.round(c+q/100*m),k[1]=Math.round(e+q/100*n),k[2]=Math.round(f+q/100*o),k[3]=Math.round(g+q/100*p),q>=99.8&&(q=100),q<100?(bh(k),t()):(bb.done(),bb.animMode(!1),typeof b=="function"&&b.call(bs))}}();t()}function bg(a){bh([a[0]/T,a[1]/U,a[2]/T,a[3]/U]),d.onSelect.call(bs,u(_.getFixed())),bb.enableHandles()}function bh(a){_.setPressed([a[0],a[1]]),_.setCurrent([a[2],
a[3]]),bb.update()}function bi(){return u(_.getFixed())}function bj(){return _.getFixed()}function bk(a){n(a),br()}function bl(){d.disabled=!0,bb.disableHandles(),bb.setCursor("default"),bc.setCursor("default")}function bm(){d.disabled=!1,br()}function bn(){bb.done(),bc.activateHandlers(null,null)}function bo(){G.remove(),A.show(),A.css("visibility","visible"),a(b).removeData("Jcrop")}function bp(a,b){bb.release(),bl();var c=new Image;c.onload=function(){var e=c.width,f=c.height,g=d.boxWidth,h=d.boxHeight;D.width(e).height(f),D.attr("src",a),H.attr("src",a),t(D,g,h),E=D.width(),F=D.height(),H.width(E).height(F),M.width(E+L*2).height(F+L*2),G.width(E).height(F),ba.resize(E,F),bm(),typeof b=="function"&&b.call(bs)},c.src=a}function bq(a,b,c){var e=b||d.bgColor;d.bgFade&&k()&&d.fadeTime&&!c?a.animate({backgroundColor:e},{queue:!1,duration:d.fadeTime}):a.css("backgroundColor",e)}function br(a){d.allowResize?a?bb.enableOnly():bb.enableHandles():bb.disableHandles(),bc.setCursor(d.allowSelect?"crosshair":"default"),bb
.setCursor(d.allowMove?"move":"default"),d.hasOwnProperty("trueSize")&&(T=d.trueSize[0]/E,U=d.trueSize[1]/F),d.hasOwnProperty("setSelect")&&(bg(d.setSelect),bb.done(),delete d.setSelect),ba.refresh(),d.bgColor!=N&&(bq(d.shade?ba.getShades():G,d.shade?d.shadeColor||d.bgColor:d.bgColor),N=d.bgColor),O!=d.bgOpacity&&(O=d.bgOpacity,d.shade?ba.refresh():bb.setBgOpacity(O)),P=d.maxSize[0]||0,Q=d.maxSize[1]||0,R=d.minSize[0]||0,S=d.minSize[1]||0,d.hasOwnProperty("outerImage")&&(D.attr("src",d.outerImage),delete d.outerImage),bb.refresh()}var d=a.extend({},a.Jcrop.defaults),e,f=navigator.userAgent.toLowerCase(),g=/msie/.test(f),h=/msie [1-6]\./.test(f);typeof b!="object"&&(b=a(b)[0]),typeof c!="object"&&(c={}),n(c);var z={border:"none",visibility:"visible",margin:0,padding:0,position:"absolute",top:0,left:0},A=a(b),B=!0;if(b.tagName=="IMG"){if(A[0].width!=0&&A[0].height!=0)A.width(A[0].width),A.height(A[0].height);else{var C=new Image;C.src=A[0].src,A.width(C.width),A.height(C.height)}var D=A.clone().removeAttr("id").
css(z).show();D.width(A.width()),D.height(A.height()),A.after(D).hide()}else D=A.css(z).show(),B=!1,d.shade===null&&(d.shade=!0);t(D,d.boxWidth,d.boxHeight);var E=D.width(),F=D.height(),G=a("<div />").width(E).height(F).addClass(j("holder")).css({position:"relative",backgroundColor:d.bgColor}).insertAfter(A).append(D);d.addClass&&G.addClass(d.addClass);var H=a("<div />"),I=a("<div />").width("100%").height("100%").css({zIndex:310,position:"absolute",overflow:"hidden"}),J=a("<div />").width("100%").height("100%").css("zIndex",320),K=a("<div />").css({position:"absolute",zIndex:600}).dblclick(function(){var a=_.getFixed();d.onDblClick.call(bs,a)}).insertBefore(D).append(I,J);B&&(H=a("<img />").attr("src",D.attr("src")).css(z).width(E).height(F),I.append(H)),h&&K.css({overflowY:"hidden"});var L=d.boundary,M=y().width(E+L*2).height(F+L*2).css({position:"absolute",top:i(-L),left:i(-L),zIndex:290}).mousedown(w),N=d.bgColor,O=d.bgOpacity,P,Q,R,S,T,U,V=!0,W,X,Y;e=l(D);var Z=function(){function a(){var a={},b=["touchstart"
,"touchmove","touchend"],c=document.createElement("div"),d;try{for(d=0;d<b.length;d++){var e=b[d];e="on"+e;var f=e in c;f||(c.setAttribute(e,"return;"),f=typeof c[e]=="function"),a[b[d]]=f}return a.touchstart&&a.touchend&&a.touchmove}catch(g){return!1}}function b(){return d.touchSupport===!0||d.touchSupport===!1?d.touchSupport:a()}return{createDragger:function(a){return function(b){return d.disabled?!1:a==="move"&&!d.allowMove?!1:(e=l(D),W=!0,o(a,m(Z.cfilter(b)),!0),b.stopPropagation(),b.preventDefault(),!1)}},newSelection:function(a){return w(Z.cfilter(a))},cfilter:function(a){return a.pageX=a.originalEvent.changedTouches[0].pageX,a.pageY=a.originalEvent.changedTouches[0].pageY,a},isSupported:a,support:b()}}(),_=function(){function h(d){d=n(d),c=a=d[0],e=b=d[1]}function i(a){a=n(a),f=a[0]-c,g=a[1]-e,c=a[0],e=a[1]}function j(){return[f,g]}function k(d){var f=d[0],g=d[1];0>a+f&&(f-=f+a),0>b+g&&(g-=g+b),F<e+g&&(g+=F-(e+g)),E<c+f&&(f+=E-(c+f)),a+=f,c+=f,b+=g,e+=g}function l(a){var b=m();switch(a){case"ne":return[
b.x2,b.y];case"nw":return[b.x,b.y];case"se":return[b.x2,b.y2];case"sw":return[b.x,b.y2]}}function m(){if(!d.aspectRatio)return p();var f=d.aspectRatio,g=d.minSize[0]/T,h=d.maxSize[0]/T,i=d.maxSize[1]/U,j=c-a,k=e-b,l=Math.abs(j),m=Math.abs(k),n=l/m,r,s,t,u;return h===0&&(h=E*10),i===0&&(i=F*10),n<f?(s=e,t=m*f,r=j<0?a-t:t+a,r<0?(r=0,u=Math.abs((r-a)/f),s=k<0?b-u:u+b):r>E&&(r=E,u=Math.abs((r-a)/f),s=k<0?b-u:u+b)):(r=c,u=l/f,s=k<0?b-u:b+u,s<0?(s=0,t=Math.abs((s-b)*f),r=j<0?a-t:t+a):s>F&&(s=F,t=Math.abs(s-b)*f,r=j<0?a-t:t+a)),r>a?(r-a<g?r=a+g:r-a>h&&(r=a+h),s>b?s=b+(r-a)/f:s=b-(r-a)/f):r<a&&(a-r<g?r=a-g:a-r>h&&(r=a-h),s>b?s=b+(a-r)/f:s=b-(a-r)/f),r<0?(a-=r,r=0):r>E&&(a-=r-E,r=E),s<0?(b-=s,s=0):s>F&&(b-=s-F,s=F),q(o(a,b,r,s))}function n(a){return a[0]<0&&(a[0]=0),a[1]<0&&(a[1]=0),a[0]>E&&(a[0]=E),a[1]>F&&(a[1]=F),[Math.round(a[0]),Math.round(a[1])]}function o(a,b,c,d){var e=a,f=c,g=b,h=d;return c<a&&(e=c,f=a),d<b&&(g=d,h=b),[e,g,f,h]}function p(){var d=c-a,f=e-b,g;return P&&Math.abs(d)>P&&(c=d>0?a+P:a-P),Q&&Math.abs
(f)>Q&&(e=f>0?b+Q:b-Q),S/U&&Math.abs(f)<S/U&&(e=f>0?b+S/U:b-S/U),R/T&&Math.abs(d)<R/T&&(c=d>0?a+R/T:a-R/T),a<0&&(c-=a,a-=a),b<0&&(e-=b,b-=b),c<0&&(a-=c,c-=c),e<0&&(b-=e,e-=e),c>E&&(g=c-E,a-=g,c-=g),e>F&&(g=e-F,b-=g,e-=g),a>E&&(g=a-F,e-=g,b-=g),b>F&&(g=b-F,e-=g,b-=g),q(o(a,b,c,e))}function q(a){return{x:a[0],y:a[1],x2:a[2],y2:a[3],w:a[2]-a[0],h:a[3]-a[1]}}var a=0,b=0,c=0,e=0,f,g;return{flipCoords:o,setPressed:h,setCurrent:i,getOffset:j,moveOffset:k,getCorner:l,getFixed:m}}(),ba=function(){function f(a,b){e.left.css({height:i(b)}),e.right.css({height:i(b)})}function g(){return h(_.getFixed())}function h(a){e.top.css({left:i(a.x),width:i(a.w),height:i(a.y)}),e.bottom.css({top:i(a.y2),left:i(a.x),width:i(a.w),height:i(F-a.y2)}),e.right.css({left:i(a.x2),width:i(E-a.x2)}),e.left.css({width:i(a.x)})}function j(){return a("<div />").css({position:"absolute",backgroundColor:d.shadeColor||d.bgColor}).appendTo(c)}function k(){b||(b=!0,c.insertBefore(D),g(),bb.setBgOpacity(1,0,1),H.hide(),l(d.shadeColor||d.bgColor,1),bb.
isAwake()?n(d.bgOpacity,1):n(1,1))}function l(a,b){bq(p(),a,b)}function m(){b&&(c.remove(),H.show(),b=!1,bb.isAwake()?bb.setBgOpacity(d.bgOpacity,1,1):(bb.setBgOpacity(1,1,1),bb.disableHandles()),bq(G,0,1))}function n(a,e){b&&(d.bgFade&&!e?c.animate({opacity:1-a},{queue:!1,duration:d.fadeTime}):c.css({opacity:1-a}))}function o(){d.shade?k():m(),bb.isAwake()&&n(d.bgOpacity)}function p(){return c.children()}var b=!1,c=a("<div />").css({position:"absolute",zIndex:240,opacity:0}),e={top:j(),left:j().height(F),right:j().height(F),bottom:j()};return{update:g,updateRaw:h,getShades:p,setBgColor:l,enable:k,disable:m,resize:f,refresh:o,opacity:n}}(),bb=function(){function k(b){var c=a("<div />").css({position:"absolute",opacity:d.borderOpacity}).addClass(j(b));return I.append(c),c}function l(b,c){var d=a("<div />").mousedown(s(b)).css({cursor:b+"-resize",position:"absolute",zIndex:c}).addClass("ord-"+b);return Z.support&&d.bind("touchstart.jcrop",Z.createDragger(b)),J.append(d),d}function m(a){var b=d.handleSize,e=l(a,c++
).css({opacity:d.handleOpacity}).addClass(j("handle"));return b&&e.width(b).height(b),e}function n(a){return l(a,c++).addClass("jcrop-dragbar")}function o(a){var b;for(b=0;b<a.length;b++)g[a[b]]=n(a[b])}function p(a){var b,c;for(c=0;c<a.length;c++){switch(a[c]){case"n":b="hline";break;case"s":b="hline bottom";break;case"e":b="vline right";break;case"w":b="vline"}e[a[c]]=k(b)}}function q(a){var b;for(b=0;b<a.length;b++)f[a[b]]=m(a[b])}function r(a,b){d.shade||H.css({top:i(-b),left:i(-a)}),K.css({top:i(b),left:i(a)})}function t(a,b){K.width(Math.round(a)).height(Math.round(b))}function v(){var a=_.getFixed();_.setPressed([a.x,a.y]),_.setCurrent([a.x2,a.y2]),w()}function w(a){if(b)return x(a)}function x(a){var c=_.getFixed();t(c.w,c.h),r(c.x,c.y),d.shade&&ba.updateRaw(c),b||A(),a?d.onSelect.call(bs,u(c)):d.onChange.call(bs,u(c))}function z(a,c,e){if(!b&&!c)return;d.bgFade&&!e?D.animate({opacity:a},{queue:!1,duration:d.fadeTime}):D.css("opacity",a)}function A(){K.show(),d.shade?ba.opacity(O):z(O,!0),b=!0}function B
(){F(),K.hide(),d.shade?ba.opacity(1):z(1),b=!1,d.onRelease.call(bs)}function C(){h&&J.show()}function E(){h=!0;if(d.allowResize)return J.show(),!0}function F(){h=!1,J.hide()}function G(a){a?(X=!0,F()):(X=!1,E())}function L(){G(!1),v()}var b,c=370,e={},f={},g={},h=!1;d.dragEdges&&a.isArray(d.createDragbars)&&o(d.createDragbars),a.isArray(d.createHandles)&&q(d.createHandles),d.drawBorders&&a.isArray(d.createBorders)&&p(d.createBorders),a(document).bind("touchstart.jcrop-ios",function(b){a(b.currentTarget).hasClass("jcrop-tracker")&&b.stopPropagation()});var M=y().mousedown(s("move")).css({cursor:"move",position:"absolute",zIndex:360});return Z.support&&M.bind("touchstart.jcrop",Z.createDragger("move")),I.append(M),F(),{updateVisible:w,update:x,release:B,refresh:v,isAwake:function(){return b},setCursor:function(a){M.css("cursor",a)},enableHandles:E,enableOnly:function(){h=!0},showHandles:C,disableHandles:F,animMode:G,setBgOpacity:z,done:L}}(),bc=function(){function f(b){M.css({zIndex:450}),b?a(document).bind("touchmove.jcrop"
,k).bind("touchend.jcrop",l):e&&a(document).bind("mousemove.jcrop",h).bind("mouseup.jcrop",i)}function g(){M.css({zIndex:290}),a(document).unbind(".jcrop")}function h(a){return b(m(a)),!1}function i(a){return a.preventDefault(),a.stopPropagation(),W&&(W=!1,c(m(a)),bb.isAwake()&&d.onSelect.call(bs,u(_.getFixed())),g(),b=function(){},c=function(){}),!1}function j(a,d,e){return W=!0,b=a,c=d,f(e),!1}function k(a){return b(m(Z.cfilter(a))),!1}function l(a){return i(Z.cfilter(a))}function n(a){M.css("cursor",a)}var b=function(){},c=function(){},e=d.trackDocument;return e||M.mousemove(h).mouseup(i).mouseout(i),D.before(M),{activateHandlers:j,setCursor:n}}(),bd=function(){function e(){d.keySupport&&(b.show(),b.focus())}function f(a){b.hide()}function g(a,b,c){d.allowMove&&(_.moveOffset([b,c]),bb.updateVisible(!0)),a.preventDefault(),a.stopPropagation()}function i(a){if(a.ctrlKey||a.metaKey)return!0;Y=a.shiftKey?!0:!1;var b=Y?10:1;switch(a.keyCode){case 37:g(a,-b,0);break;case 39:g(a,b,0);break;case 38:g(a,0,-b);break;
case 40:g(a,0,b);break;case 27:d.allowSelect&&bb.release();break;case 9:return!0}return!1}var b=a('<input type="radio" />').css({position:"fixed",left:"-120px",width:"12px"}).addClass("jcrop-keymgr"),c=a("<div />").css({position:"absolute",overflow:"hidden"}).append(b);return d.keySupport&&(b.keydown(i).blur(f),h||!d.fixedSupport?(b.css({position:"absolute",left:"-20px"}),c.append(b).insertBefore(D)):b.insertBefore(D)),{watchKeys:e}}();Z.support&&M.bind("touchstart.jcrop",Z.newSelection),J.hide(),br(!0);var bs={setImage:bp,animateTo:bf,setSelect:bg,setOptions:bk,tellSelect:bi,tellScaled:bj,setClass:be,disable:bl,enable:bm,cancel:bn,release:bb.release,destroy:bo,focus:bd.watchKeys,getBounds:function(){return[E*T,F*U]},getWidgetSize:function(){return[E,F]},getScaleFactor:function(){return[T,U]},getOptions:function(){return d},ui:{holder:G,selection:K}};return g&&G.bind("selectstart",function(){return!1}),A.data("Jcrop",bs),bs},a.fn.Jcrop=function(b,c){var d;return this.each(function(){if(a(this).data("Jcrop")){if(
b==="api")return a(this).data("Jcrop");a(this).data("Jcrop").setOptions(b)}else this.tagName=="IMG"?a.Jcrop.Loader(this,function(){a(this).css({display:"block",visibility:"hidden"}),d=a.Jcrop(this,b),a.isFunction(c)&&c.call(d)}):(a(this).css({display:"block",visibility:"hidden"}),d=a.Jcrop(this,b),a.isFunction(c)&&c.call(d))}),this},a.Jcrop.Loader=function(b,c,d){function g(){f.complete?(e.unbind(".jcloader"),a.isFunction(c)&&c.call(f)):window.setTimeout(g,50)}var e=a(b),f=e[0];e.bind("load.jcloader",g).bind("error.jcloader",function(b){e.unbind(".jcloader"),a.isFunction(d)&&d.call(f)}),f.complete&&a.isFunction(c)&&(e.unbind(".jcloader"),c.call(f))},a.Jcrop.defaults={allowSelect:!0,allowMove:!0,allowResize:!0,trackDocument:!0,baseClass:"jcrop",addClass:null,bgColor:"black",bgOpacity:.6,bgFade:!1,borderOpacity:.4,handleOpacity:.5,handleSize:null,aspectRatio:0,keySupport:!0,createHandles:["n","s","e","w","nw","ne","se","sw"],createDragbars:["n","s","e","w"],createBorders:["n","s","e","w"],drawBorders:!0,dragEdges
:!0,fixedSupport:!0,touchSupport:null,shade:null,boxWidth:0,boxHeight:0,boundary:2,fadeTime:400,animationDelay:20,swingSpeed:3,minSelect:[0,0],maxSize:[0,0],minSize:[0,0],onChange:function(){},onSelect:function(){},onDblClick:function(){},onRelease:function(){}}})(jQuery);;/*
 * JavaScript Load Image 1.2.2
 * https://github.com/blueimp/JavaScript-Load-Image
 *
 * Copyright 2011, Sebastian Tschan
 * https://blueimp.net
 *
 * iOS image scaling fixes based on
 * https://github.com/stomita/ios-imagefile-megapixel
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */

/*jslint nomen: true, bitwise: true */
/*global window, document, URL, webkitURL, Blob, File, FileReader, define */

(function ($) {
    'use strict';

    // Loads an image for a given File object.
    // Invokes the callback with an img or optional canvas
    // element (if supported by the browser) as parameter:
    var loadImage = function (file, callback, options) {
            var img = document.createElement('img'),
                url,
                oUrl,
                date = new Date();
            img.onerror = callback;
            img.onload = function () {
                if (oUrl && !(options && options.noRevoke)) {
                    loadImage.revokeObjectURL(oUrl);
                }
                callback(loadImage.scale(img, options));
            };
            if ((window.Blob && file instanceof Blob) ||
                // Files are also Blob instances, but some browsers
                // (Firefox 3.6) support the File API but not Blobs:
                    (window.File && file instanceof File)) {
                url = oUrl = loadImage.createObjectURL(file);
                // Store the file type for resize processing:
                img._type = file.type;
            } else {
                url = file;
            }
            url += '?_'+date.getTime();
            if (url) {
                img.src = url;
                return img;
            }
            return loadImage.readFile(file, function (url) {
                img.src = url;
            });
        },
        // The check for URL.revokeObjectURL fixes an issue with Opera 12,
        // which provides URL.createObjectURL but doesn't properly implement it:
        urlAPI = (window.createObjectURL && window) ||
            (window.URL && URL.revokeObjectURL && URL) ||
            (window.webkitURL && webkitURL);

    // Detects subsampling in JPEG images:
    loadImage.detectSubsampling = function (img) {
        var iw = img.width,
            ih = img.height,
            canvas,
            ctx;
            
        if (iw * ih > 1024 * 1024) { // only consider mexapixel images
            canvas = document.createElement('canvas');
            canvas.width = canvas.height = 1;
            ctx = canvas.getContext('2d');
            ctx.drawImage(img, -iw + 1, 0);
            // subsampled image becomes half smaller in rendering size.
            // check alpha channel value to confirm image is covering edge pixel or not.
            // if alpha value is 0 image is not covering, hence subsampled.
            return ctx.getImageData(0, 0, 1, 1).data[3] === 0;
        }
        return false;
    };

    // Detects vertical squash in JPEG images:
    loadImage.detectVerticalSquash = function (img, ih) {
        var canvas = document.createElement('canvas'),
            ctx = canvas.getContext('2d'),
            data,
            sy,
            ey,
            py,
            alpha;
        canvas.width = 1;
        canvas.height = ih;
        ctx.drawImage(img, 0, 0);
        data = ctx.getImageData(0, 0, 1, ih).data;
        // search image edge pixel position in case it is squashed vertically:
        sy = 0;
        ey = ih;
        py = ih;
        while (py > sy) {
            alpha = data[(py - 1) * 4 + 3];
            if (alpha === 0) {
                ey = py;
            } else {
                sy = py;
            }
            py = (ey + sy) >> 1;
        }
        return py / ih;
    };

    // Renders image to canvas while working around iOS image scaling bugs:
    // https://github.com/blueimp/JavaScript-Load-Image/issues/13
    loadImage.renderImageToCanvas = function (img, canvas, width, height) {
        var iw = img.width,
            ih = img.height,
            ctx = canvas.getContext('2d'),
            vertSquashRatio,
            d = 1024, // size of tiling canvas
            tmpCanvas = document.createElement('canvas'),
            tmpCtx,
            sy,
            sh,
            sx,
            sw;
        ctx.save();
        if (loadImage.detectSubsampling(img)) {
            iw /= 2;
            ih /= 2;
        }
        vertSquashRatio = loadImage.detectVerticalSquash(img, ih);
        tmpCanvas.width = tmpCanvas.height = d;
        tmpCtx = tmpCanvas.getContext('2d');
        sy = 0;
        while (sy < ih) {
            sh = sy + d > ih ? ih - sy : d;
            sx = 0;
            while (sx < iw) {
                sw = sx + d > iw ? iw - sx : d;
                tmpCtx.clearRect(0, 0, d, d);
                tmpCtx.drawImage(img, -sx, -sy);
                ctx.drawImage(
                    tmpCanvas,
                    0,
                    0,
                    sw,
                    sh,
                    Math.floor(sx * width / iw),
                    Math.floor(sy * height / ih / vertSquashRatio),
                    Math.ceil(sw * width / iw),
                    Math.ceil(sh * height / ih / vertSquashRatio)
                );
                sx += d;
            }
            sy += d;
        }
        ctx.restore();
        tmpCanvas = tmpCtx = null;
    };

    // Scales the given image (img or canvas HTML element)
    // using the given options.
    // Returns a canvas object if the browser supports canvas
    // and the canvas option is true or a canvas object is passed
    // as image, else the scaled image:
    loadImage.scale = function (img, options) {
        options = options || {};
        var canvas = document.createElement('canvas'),
            width = img.width,
            height = img.height,
            scale = Math.max(
                (options.minWidth || width) / width,
                (options.minHeight || height) / height
            );
        if (scale > 1) {
            width = parseInt(width * scale, 10);
            height = parseInt(height * scale, 10);
        }
        scale = Math.min(
            (options.maxWidth || width) / width,
            (options.maxHeight || height) / height
        );
        if (scale < 1) {
            width = parseInt(width * scale, 10);
            height = parseInt(height * scale, 10);
        }
        if (img.getContext || (options.canvas && canvas.getContext)) {
            canvas.width = width;
            canvas.height = height;
            if (img._type === 'image/jpeg') {
                loadImage
                    .renderImageToCanvas(img, canvas, width, height);
            } else {
                canvas.getContext('2d')
                    .drawImage(img, 0, 0, width, height);
            }
            return canvas;
        }
        
        return img;
    };

    loadImage.createObjectURL = function (file) {
        return urlAPI ? urlAPI.createObjectURL(file) : false;
    };

    loadImage.revokeObjectURL = function (url) {
        return urlAPI ? urlAPI.revokeObjectURL(url) : false;
    };

    // Loads a given File object via FileReader interface,
    // invokes the callback with a data url:
    loadImage.readFile = function (file, callback) {
        if (window.FileReader && FileReader.prototype.readAsDataURL) {
            var fileReader = new FileReader();
            fileReader.onload = function (e) {
                callback(e.target.result);
            };
            fileReader.readAsDataURL(file);
            return fileReader;
        }
        return false;
    };

    $.loadImage = loadImage;
    
}(this));
;/*!
 * jQuery UI 1.8.24
 *
 * Copyright 2012, AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * http://docs.jquery.com/UI
 */
(function( $, undefined ) {

// prevent duplicate loading
// this is only a problem because we proxy existing functions
// and we don't want to double proxy them
$.ui = $.ui || {};
if ( $.ui.version ) {
	return;
}

$.extend( $.ui, {
	version: "1.8.24",

	keyCode: {
		ALT: 18,
		BACKSPACE: 8,
		CAPS_LOCK: 20,
		COMMA: 188,
		COMMAND: 91,
		COMMAND_LEFT: 91, // COMMAND
		COMMAND_RIGHT: 93,
		CONTROL: 17,
		DELETE: 46,
		DOWN: 40,
		END: 35,
		ENTER: 13,
		ESCAPE: 27,
		HOME: 36,
		INSERT: 45,
		LEFT: 37,
		MENU: 93, // COMMAND_RIGHT
		NUMPAD_ADD: 107,
		NUMPAD_DECIMAL: 110,
		NUMPAD_DIVIDE: 111,
		NUMPAD_ENTER: 108,
		NUMPAD_MULTIPLY: 106,
		NUMPAD_SUBTRACT: 109,
		PAGE_DOWN: 34,
		PAGE_UP: 33,
		PERIOD: 190,
		RIGHT: 39,
		SHIFT: 16,
		SPACE: 32,
		TAB: 9,
		UP: 38,
		WINDOWS: 91 // COMMAND
	}
});

// plugins
$.fn.extend({
	propAttr: $.fn.prop || $.fn.attr,

	_focus: $.fn.focus,
	focus: function( delay, fn ) {
		return typeof delay === "number" ?
			this.each(function() {
				var elem = this;
				setTimeout(function() {
					$( elem ).focus();
					if ( fn ) {
						fn.call( elem );
					}
				}, delay );
			}) :
			this._focus.apply( this, arguments );
	},

	scrollParent: function() {
		var scrollParent;
		if (($.browser.msie && (/(static|relative)/).test(this.css('position'))) || (/absolute/).test(this.css('position'))) {
			scrollParent = this.parents().filter(function() {
				return (/(relative|absolute|fixed)/).test($.curCSS(this,'position',1)) && (/(auto|scroll)/).test($.curCSS(this,'overflow',1)+$.curCSS(this,'overflow-y',1)+$.curCSS(this,'overflow-x',1));
			}).eq(0);
		} else {
			scrollParent = this.parents().filter(function() {
				return (/(auto|scroll)/).test($.curCSS(this,'overflow',1)+$.curCSS(this,'overflow-y',1)+$.curCSS(this,'overflow-x',1));
			}).eq(0);
		}

		return (/fixed/).test(this.css('position')) || !scrollParent.length ? $(document) : scrollParent;
	},

	zIndex: function( zIndex ) {
		if ( zIndex !== undefined ) {
			return this.css( "zIndex", zIndex );
		}

		if ( this.length ) {
			var elem = $( this[ 0 ] ), position, value;
			while ( elem.length && elem[ 0 ] !== document ) {
				// Ignore z-index if position is set to a value where z-index is ignored by the browser
				// This makes behavior of this function consistent across browsers
				// WebKit always returns auto if the element is positioned
				position = elem.css( "position" );
				if ( position === "absolute" || position === "relative" || position === "fixed" ) {
					// IE returns 0 when zIndex is not specified
					// other browsers return a string
					// we ignore the case of nested elements with an explicit value of 0
					// <div style="z-index: -10;"><div style="z-index: 0;"></div></div>
					value = parseInt( elem.css( "zIndex" ), 10 );
					if ( !isNaN( value ) && value !== 0 ) {
						return value;
					}
				}
				elem = elem.parent();
			}
		}

		return 0;
	},

	disableSelection: function() {
		return this.bind( ( $.support.selectstart ? "selectstart" : "mousedown" ) +
			".ui-disableSelection", function( event ) {
				event.preventDefault();
			});
	},

	enableSelection: function() {
		return this.unbind( ".ui-disableSelection" );
	}
});

// support: jQuery <1.8
if ( !$( "<a>" ).outerWidth( 1 ).jquery ) {
	$.each( [ "Width", "Height" ], function( i, name ) {
		var side = name === "Width" ? [ "Left", "Right" ] : [ "Top", "Bottom" ],
			type = name.toLowerCase(),
			orig = {
				innerWidth: $.fn.innerWidth,
				innerHeight: $.fn.innerHeight,
				outerWidth: $.fn.outerWidth,
				outerHeight: $.fn.outerHeight
			};

		function reduce( elem, size, border, margin ) {
			$.each( side, function() {
				size -= parseFloat( $.curCSS( elem, "padding" + this, true) ) || 0;
				if ( border ) {
					size -= parseFloat( $.curCSS( elem, "border" + this + "Width", true) ) || 0;
				}
				if ( margin ) {
					size -= parseFloat( $.curCSS( elem, "margin" + this, true) ) || 0;
				}
			});
			return size;
		}

		$.fn[ "inner" + name ] = function( size ) {
			if ( size === undefined ) {
				return orig[ "inner" + name ].call( this );
			}

			return this.each(function() {
				$( this ).css( type, reduce( this, size ) + "px" );
			});
		};

		$.fn[ "outer" + name] = function( size, margin ) {
			if ( typeof size !== "number" ) {
				return orig[ "outer" + name ].call( this, size );
			}

			return this.each(function() {
				$( this).css( type, reduce( this, size, true, margin ) + "px" );
			});
		};
	});
}

// selectors
function focusable( element, isTabIndexNotNaN ) {
	var nodeName = element.nodeName.toLowerCase();
	if ( "area" === nodeName ) {
		var map = element.parentNode,
			mapName = map.name,
			img;
		if ( !element.href || !mapName || map.nodeName.toLowerCase() !== "map" ) {
			return false;
		}
		img = $( "img[usemap=#" + mapName + "]" )[0];
		return !!img && visible( img );
	}
	return ( /input|select|textarea|button|object/.test( nodeName )
		? !element.disabled
		: "a" == nodeName
			? element.href || isTabIndexNotNaN
			: isTabIndexNotNaN)
		// the element and all of its ancestors must be visible
		&& visible( element );
}

function visible( element ) {
	return !$( element ).parents().andSelf().filter(function() {
		return $.curCSS( this, "visibility" ) === "hidden" ||
			$.expr.filters.hidden( this );
	}).length;
}

$.extend( $.expr[ ":" ], {
	data: $.expr.createPseudo ?
		$.expr.createPseudo(function( dataName ) {
			return function( elem ) {
				return !!$.data( elem, dataName );
			};
		}) :
		// support: jQuery <1.8
		function( elem, i, match ) {
			return !!$.data( elem, match[ 3 ] );
		},

	focusable: function( element ) {
		return focusable( element, !isNaN( $.attr( element, "tabindex" ) ) );
	},

	tabbable: function( element ) {
		var tabIndex = $.attr( element, "tabindex" ),
			isTabIndexNaN = isNaN( tabIndex );
		return ( isTabIndexNaN || tabIndex >= 0 ) && focusable( element, !isTabIndexNaN );
	}
});

// support
$(function() {
	var body = document.body,
		div = body.appendChild( div = document.createElement( "div" ) );

	// access offsetHeight before setting the style to prevent a layout bug
	// in IE 9 which causes the elemnt to continue to take up space even
	// after it is removed from the DOM (#8026)
	div.offsetHeight;

	$.extend( div.style, {
		minHeight: "100px",
		height: "auto",
		padding: 0,
		borderWidth: 0
	});

	$.support.minHeight = div.offsetHeight === 100;
	$.support.selectstart = "onselectstart" in div;

	// set display to none to avoid a layout bug in IE
	// http://dev.jquery.com/ticket/4014
	body.removeChild( div ).style.display = "none";
});

// jQuery <1.4.3 uses curCSS, in 1.4.3 - 1.7.2 curCSS = css, 1.8+ only has css
if ( !$.curCSS ) {
	$.curCSS = $.css;
}





// deprecated
$.extend( $.ui, {
	// $.ui.plugin is deprecated.  Use the proxy pattern instead.
	plugin: {
		add: function( module, option, set ) {
			var proto = $.ui[ module ].prototype;
			for ( var i in set ) {
				proto.plugins[ i ] = proto.plugins[ i ] || [];
				proto.plugins[ i ].push( [ option, set[ i ] ] );
			}
		},
		call: function( instance, name, args ) {
			var set = instance.plugins[ name ];
			if ( !set || !instance.element[ 0 ].parentNode ) {
				return;
			}
	
			for ( var i = 0; i < set.length; i++ ) {
				if ( instance.options[ set[ i ][ 0 ] ] ) {
					set[ i ][ 1 ].apply( instance.element, args );
				}
			}
		}
	},
	
	// will be deprecated when we switch to jQuery 1.4 - use jQuery.contains()
	contains: function( a, b ) {
		return document.compareDocumentPosition ?
			a.compareDocumentPosition( b ) & 16 :
			a !== b && a.contains( b );
	},
	
	// only used by resizable
	hasScroll: function( el, a ) {
	
		//If overflow is hidden, the element might have extra content, but the user wants to hide it
		if ( $( el ).css( "overflow" ) === "hidden") {
			return false;
		}
	
		var scroll = ( a && a === "left" ) ? "scrollLeft" : "scrollTop",
			has = false;
	
		if ( el[ scroll ] > 0 ) {
			return true;
		}
	
		// TODO: determine which cases actually cause this to happen
		// if the element doesn't have the scroll set, see if it's possible to
		// set the scroll
		el[ scroll ] = 1;
		has = ( el[ scroll ] > 0 );
		el[ scroll ] = 0;
		return has;
	},
	
	// these are odd functions, fix the API or move into individual plugins
	isOverAxis: function( x, reference, size ) {
		//Determines when x coordinate is over "b" element axis
		return ( x > reference ) && ( x < ( reference + size ) );
	},
	isOver: function( y, x, top, left, height, width ) {
		//Determines when x, y coordinates is over "b" element
		return $.ui.isOverAxis( y, top, height ) && $.ui.isOverAxis( x, left, width );
	}
});

})( jQuery );

/*!
 * jQuery UI Widget 1.8.24
 *
 * Copyright 2012, AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * http://docs.jquery.com/UI/Widget
 */
(function( $, undefined ) {

// jQuery 1.4+
if ( $.cleanData ) {
	var _cleanData = $.cleanData;
	$.cleanData = function( elems ) {
		for ( var i = 0, elem; (elem = elems[i]) != null; i++ ) {
			try {
				$( elem ).triggerHandler( "remove" );
			// http://bugs.jquery.com/ticket/8235
			} catch( e ) {}
		}
		_cleanData( elems );
	};
} else {
	var _remove = $.fn.remove;
	$.fn.remove = function( selector, keepData ) {
		return this.each(function() {
			if ( !keepData ) {
				if ( !selector || $.filter( selector, [ this ] ).length ) {
					$( "*", this ).add( [ this ] ).each(function() {
						try {
							$( this ).triggerHandler( "remove" );
						// http://bugs.jquery.com/ticket/8235
						} catch( e ) {}
					});
				}
			}
			return _remove.call( $(this), selector, keepData );
		});
	};
}

$.widget = function( name, base, prototype ) {
	var namespace = name.split( "." )[ 0 ],
		fullName;
	name = name.split( "." )[ 1 ];
	fullName = namespace + "-" + name;

	if ( !prototype ) {
		prototype = base;
		base = $.Widget;
	}

	// create selector for plugin
	$.expr[ ":" ][ fullName ] = function( elem ) {
		return !!$.data( elem, name );
	};

	$[ namespace ] = $[ namespace ] || {};
	$[ namespace ][ name ] = function( options, element ) {
		// allow instantiation without initializing for simple inheritance
		if ( arguments.length ) {
			this._createWidget( options, element );
		}
	};

	var basePrototype = new base();
	// we need to make the options hash a property directly on the new instance
	// otherwise we'll modify the options hash on the prototype that we're
	// inheriting from
//	$.each( basePrototype, function( key, val ) {
//		if ( $.isPlainObject(val) ) {
//			basePrototype[ key ] = $.extend( {}, val );
//		}
//	});
	basePrototype.options = $.extend( true, {}, basePrototype.options );
	$[ namespace ][ name ].prototype = $.extend( true, basePrototype, {
		namespace: namespace,
		widgetName: name,
		widgetEventPrefix: $[ namespace ][ name ].prototype.widgetEventPrefix || name,
		widgetBaseClass: fullName
	}, prototype );

	$.widget.bridge( name, $[ namespace ][ name ] );
};

$.widget.bridge = function( name, object ) {
	$.fn[ name ] = function( options ) {
		var isMethodCall = typeof options === "string",
			args = Array.prototype.slice.call( arguments, 1 ),
			returnValue = this;

		// allow multiple hashes to be passed on init
		options = !isMethodCall && args.length ?
			$.extend.apply( null, [ true, options ].concat(args) ) :
			options;

		// prevent calls to internal methods
		if ( isMethodCall && options.charAt( 0 ) === "_" ) {
			return returnValue;
		}

		if ( isMethodCall ) {
			this.each(function() {
				var instance = $.data( this, name ),
					methodValue = instance && $.isFunction( instance[options] ) ?
						instance[ options ].apply( instance, args ) :
						instance;
				// TODO: add this back in 1.9 and use $.error() (see #5972)
//				if ( !instance ) {
//					throw "cannot call methods on " + name + " prior to initialization; " +
//						"attempted to call method '" + options + "'";
//				}
//				if ( !$.isFunction( instance[options] ) ) {
//					throw "no such method '" + options + "' for " + name + " widget instance";
//				}
//				var methodValue = instance[ options ].apply( instance, args );
				if ( methodValue !== instance && methodValue !== undefined ) {
					returnValue = methodValue;
					return false;
				}
			});
		} else {
			this.each(function() {
				var instance = $.data( this, name );
				if ( instance ) {
					instance.option( options || {} )._init();
				} else {
					$.data( this, name, new object( options, this ) );
				}
			});
		}

		return returnValue;
	};
};

$.Widget = function( options, element ) {
	// allow instantiation without initializing for simple inheritance
	if ( arguments.length ) {
		this._createWidget( options, element );
	}
};

$.Widget.prototype = {
	widgetName: "widget",
	widgetEventPrefix: "",
	options: {
		disabled: false
	},
	_createWidget: function( options, element ) {
		// $.widget.bridge stores the plugin instance, but we do it anyway
		// so that it's stored even before the _create function runs
		$.data( element, this.widgetName, this );
		this.element = $( element );
		this.options = $.extend( true, {},
			this.options,
			this._getCreateOptions(),
			options );

		var self = this;
		this.element.bind( "remove." + this.widgetName, function() {
			self.destroy();
		});

		this._create();
		this._trigger( "create" );
		this._init();
	},
	_getCreateOptions: function() {
		return $.metadata && $.metadata.get( this.element[0] )[ this.widgetName ];
	},
	_create: function() {},
	_init: function() {},

	destroy: function() {
		this.element
			.unbind( "." + this.widgetName )
			.removeData( this.widgetName );
		this.widget()
			.unbind( "." + this.widgetName )
			.removeAttr( "aria-disabled" )
			.removeClass(
				this.widgetBaseClass + "-disabled " +
				"ui-state-disabled" );
	},

	widget: function() {
		return this.element;
	},

	option: function( key, value ) {
		var options = key;

		if ( arguments.length === 0 ) {
			// don't return a reference to the internal hash
			return $.extend( {}, this.options );
		}

		if  (typeof key === "string" ) {
			if ( value === undefined ) {
				return this.options[ key ];
			}
			options = {};
			options[ key ] = value;
		}

		this._setOptions( options );

		return this;
	},
	_setOptions: function( options ) {
		var self = this;
		$.each( options, function( key, value ) {
			self._setOption( key, value );
		});

		return this;
	},
	_setOption: function( key, value ) {
		this.options[ key ] = value;

		if ( key === "disabled" ) {
			this.widget()
				[ value ? "addClass" : "removeClass"](
					this.widgetBaseClass + "-disabled" + " " +
					"ui-state-disabled" )
				.attr( "aria-disabled", value );
		}

		return this;
	},

	enable: function() {
		return this._setOption( "disabled", false );
	},
	disable: function() {
		return this._setOption( "disabled", true );
	},

	_trigger: function( type, event, data ) {
		var prop, orig,
			callback = this.options[ type ];

		data = data || {};
		event = $.Event( event );
		event.type = ( type === this.widgetEventPrefix ?
			type :
			this.widgetEventPrefix + type ).toLowerCase();
		// the original event may come from any element
		// so we need to reset the target on the new event
		event.target = this.element[ 0 ];

		// copy original event properties over to the new event
		orig = event.originalEvent;
		if ( orig ) {
			for ( prop in orig ) {
				if ( !( prop in event ) ) {
					event[ prop ] = orig[ prop ];
				}
			}
		}

		this.element.trigger( event, data );

		return !( $.isFunction(callback) &&
			callback.call( this.element[0], event, data ) === false ||
			event.isDefaultPrevented() );
	}
};

})( jQuery );

/*!
 * jQuery UI Mouse 1.8.24
 *
 * Copyright 2012, AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * http://docs.jquery.com/UI/Mouse
 *
 * Depends:
 *	jquery.ui.widget.js
 */
(function( $, undefined ) {

var mouseHandled = false;
$( document ).mouseup( function( e ) {
	mouseHandled = false;
});

$.widget("ui.mouse", {
	options: {
		cancel: ':input,option',
		distance: 1,
		delay: 0
	},
	_mouseInit: function() {
		var self = this;

		this.element
			.bind('mousedown.'+this.widgetName, function(event) {
				return self._mouseDown(event);
			})
			.bind('click.'+this.widgetName, function(event) {
				if (true === $.data(event.target, self.widgetName + '.preventClickEvent')) {
				    $.removeData(event.target, self.widgetName + '.preventClickEvent');
					event.stopImmediatePropagation();
					return false;
				}
			});

		this.started = false;
	},

	// TODO: make sure destroying one instance of mouse doesn't mess with
	// other instances of mouse
	_mouseDestroy: function() {
		this.element.unbind('.'+this.widgetName);
		if ( this._mouseMoveDelegate ) {
			$(document)
				.unbind('mousemove.'+this.widgetName, this._mouseMoveDelegate)
				.unbind('mouseup.'+this.widgetName, this._mouseUpDelegate);
		}
	},

	_mouseDown: function(event) {
		// don't let more than one widget handle mouseStart
		if( mouseHandled ) { return };

		// we may have missed mouseup (out of window)
		(this._mouseStarted && this._mouseUp(event));

		this._mouseDownEvent = event;

		var self = this,
			btnIsLeft = (event.which == 1),
			// event.target.nodeName works around a bug in IE 8 with
			// disabled inputs (#7620)
			elIsCancel = (typeof this.options.cancel == "string" && event.target.nodeName ? $(event.target).closest(this.options.cancel).length : false);
		if (!btnIsLeft || elIsCancel || !this._mouseCapture(event)) {
			return true;
		}

		this.mouseDelayMet = !this.options.delay;
		if (!this.mouseDelayMet) {
			this._mouseDelayTimer = setTimeout(function() {
				self.mouseDelayMet = true;
			}, this.options.delay);
		}

		if (this._mouseDistanceMet(event) && this._mouseDelayMet(event)) {
			this._mouseStarted = (this._mouseStart(event) !== false);
			if (!this._mouseStarted) {
				event.preventDefault();
				return true;
			}
		}

		// Click event may never have fired (Gecko & Opera)
		if (true === $.data(event.target, this.widgetName + '.preventClickEvent')) {
			$.removeData(event.target, this.widgetName + '.preventClickEvent');
		}

		// these delegates are required to keep context
		this._mouseMoveDelegate = function(event) {
			return self._mouseMove(event);
		};
		this._mouseUpDelegate = function(event) {
			return self._mouseUp(event);
		};
		$(document)
			.bind('mousemove.'+this.widgetName, this._mouseMoveDelegate)
			.bind('mouseup.'+this.widgetName, this._mouseUpDelegate);

		event.preventDefault();
		
		mouseHandled = true;
		return true;
	},

	_mouseMove: function(event) {
		// IE mouseup check - mouseup happened when mouse was out of window
		if ($.browser.msie && !(document.documentMode >= 9) && !event.button) {
			return this._mouseUp(event);
		}

		if (this._mouseStarted) {
			this._mouseDrag(event);
			return event.preventDefault();
		}

		if (this._mouseDistanceMet(event) && this._mouseDelayMet(event)) {
			this._mouseStarted =
				(this._mouseStart(this._mouseDownEvent, event) !== false);
			(this._mouseStarted ? this._mouseDrag(event) : this._mouseUp(event));
		}

		return !this._mouseStarted;
	},

	_mouseUp: function(event) {
		$(document)
			.unbind('mousemove.'+this.widgetName, this._mouseMoveDelegate)
			.unbind('mouseup.'+this.widgetName, this._mouseUpDelegate);

		if (this._mouseStarted) {
			this._mouseStarted = false;

			if (event.target == this._mouseDownEvent.target) {
			    $.data(event.target, this.widgetName + '.preventClickEvent', true);
			}

			this._mouseStop(event);
		}

		return false;
	},

	_mouseDistanceMet: function(event) {
		return (Math.max(
				Math.abs(this._mouseDownEvent.pageX - event.pageX),
				Math.abs(this._mouseDownEvent.pageY - event.pageY)
			) >= this.options.distance
		);
	},

	_mouseDelayMet: function(event) {
		return this.mouseDelayMet;
	},

	// These are placeholder methods, to be overriden by extending plugin
	_mouseStart: function(event) {},
	_mouseDrag: function(event) {},
	_mouseStop: function(event) {},
	_mouseCapture: function(event) { return true; }
});

})(jQuery);

/*!
 * jQuery UI Sortable 1.9.2
 * http://jqueryui.com
 *
 * Copyright 2012 jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/sortable/
 *
 * Depends:
 *	jquery.ui.core.js
 *	jquery.ui.mouse.js
 *	jquery.ui.widget.js
 */
(function( $, undefined ) {

$.widget("ui.sortable", $.ui.mouse, {
	version: "1.9.2",
	widgetEventPrefix: "sort",
	ready: false,
	options: {
		appendTo: "parent",
		axis: false,
		connectWith: false,
		containment: false,
		cursor: 'auto',
		cursorAt: false,
		dropOnEmpty: true,
		forcePlaceholderSize: false,
		forceHelperSize: false,
		grid: false,
		handle: false,
		helper: "original",
		items: '> *',
		opacity: false,
		placeholder: false,
		revert: false,
		scroll: true,
		scrollSensitivity: 20,
		scrollSpeed: 20,
		scope: "default",
		tolerance: "intersect",
		zIndex: 1000
	},
	_create: function() {

		var o = this.options;
		this.containerCache = {};
		this.element.addClass("ui-sortable");

		//Get the items
		this.refresh();

		//Let's determine if the items are being displayed horizontally
		this.floating = this.items.length ? o.axis === 'x' || (/left|right/).test(this.items[0].item.css('float')) || (/inline|table-cell/).test(this.items[0].item.css('display')) : false;

		//Let's determine the parent's offset
		this.offset = this.element.offset();

		//Initialize mouse events for interaction
		this._mouseInit();

		//We're ready to go
		this.ready = true

	},

	_destroy: function() {
		this.element
			.removeClass("ui-sortable ui-sortable-disabled");
		this._mouseDestroy();

		for ( var i = this.items.length - 1; i >= 0; i-- )
			this.items[i].item.removeData(this.widgetName + "-item");

		return this;
	},

	_setOption: function(key, value){
		if ( key === "disabled" ) {
			this.options[ key ] = value;

			this.widget().toggleClass( "ui-sortable-disabled", !!value );
		} else {
			// Don't call widget base _setOption for disable as it adds ui-state-disabled class
			$.Widget.prototype._setOption.apply(this, arguments);
		}
	},

	_mouseCapture: function(event, overrideHandle) {
		var that = this;

		if (this.reverting) {
			return false;
		}

		if(this.options.disabled || this.options.type == 'static') return false;

		//We have to refresh the items data once first
		this._refreshItems(event);

		//Find out if the clicked node (or one of its parents) is a actual item in this.items
		var currentItem = null, nodes = $(event.target).parents().each(function() {
			if($.data(this, that.widgetName + '-item') == that) {
				currentItem = $(this);
				return false;
			}
		});
		if($.data(event.target, that.widgetName + '-item') == that) currentItem = $(event.target);

		if(!currentItem) return false;
		if(this.options.handle && !overrideHandle) {
			var validHandle = false;

			$(this.options.handle, currentItem).find("*").andSelf().each(function() { if(this == event.target) validHandle = true; });
			if(!validHandle) return false;
		}

		this.currentItem = currentItem;
		this._removeCurrentsFromItems();
		return true;

	},

	_mouseStart: function(event, overrideHandle, noActivation) {

		var o = this.options;
		this.currentContainer = this;

		//We only need to call refreshPositions, because the refreshItems call has been moved to mouseCapture
		this.refreshPositions();

		//Create and append the visible helper
		this.helper = this._createHelper(event);

		//Cache the helper size
		this._cacheHelperProportions();

		/*
		 * - Position generation -
		 * This block generates everything position related - it's the core of draggables.
		 */

		//Cache the margins of the original element
		this._cacheMargins();

		//Get the next scrolling parent
		this.scrollParent = this.helper.scrollParent();

		//The element's absolute position on the page minus margins
		this.offset = this.currentItem.offset();
		this.offset = {
			top: this.offset.top - this.margins.top,
			left: this.offset.left - this.margins.left
		};

		$.extend(this.offset, {
			click: { //Where the click happened, relative to the element
				left: event.pageX - this.offset.left,
				top: event.pageY - this.offset.top
			},
			parent: this._getParentOffset(),
			relative: this._getRelativeOffset() //This is a relative to absolute position minus the actual position calculation - only used for relative positioned helper
		});

		// Only after we got the offset, we can change the helper's position to absolute
		// TODO: Still need to figure out a way to make relative sorting possible
		this.helper.css("position", "absolute");
		this.cssPosition = this.helper.css("position");

		//Generate the original position
		this.originalPosition = this._generatePosition(event);
		this.originalPageX = event.pageX;
		this.originalPageY = event.pageY;

		//Adjust the mouse offset relative to the helper if 'cursorAt' is supplied
		(o.cursorAt && this._adjustOffsetFromHelper(o.cursorAt));

		//Cache the former DOM position
		this.domPosition = { prev: this.currentItem.prev()[0], parent: this.currentItem.parent()[0] };

		//If the helper is not the original, hide the original so it's not playing any role during the drag, won't cause anything bad this way
		if(this.helper[0] != this.currentItem[0]) {
			this.currentItem.hide();
		}

		//Create the placeholder
		this._createPlaceholder();

		//Set a containment if given in the options
		if(o.containment)
			this._setContainment();

		if(o.cursor) { // cursor option
			if ($('body').css("cursor")) this._storedCursor = $('body').css("cursor");
			$('body').css("cursor", o.cursor);
		}

		if(o.opacity) { // opacity option
			if (this.helper.css("opacity")) this._storedOpacity = this.helper.css("opacity");
			this.helper.css("opacity", o.opacity);
		}

		if(o.zIndex) { // zIndex option
			if (this.helper.css("zIndex")) this._storedZIndex = this.helper.css("zIndex");
			this.helper.css("zIndex", o.zIndex);
		}

		//Prepare scrolling
		if(this.scrollParent[0] != document && this.scrollParent[0].tagName != 'HTML')
			this.overflowOffset = this.scrollParent.offset();

		//Call callbacks
		this._trigger("start", event, this._uiHash());

		//Recache the helper size
		if(!this._preserveHelperProportions)
			this._cacheHelperProportions();


		//Post 'activate' events to possible containers
		if(!noActivation) {
			 for (var i = this.containers.length - 1; i >= 0; i--) { this.containers[i]._trigger("activate", event, this._uiHash(this)); }
		}

		//Prepare possible droppables
		if($.ui.ddmanager)
			$.ui.ddmanager.current = this;

		if ($.ui.ddmanager && !o.dropBehaviour)
			$.ui.ddmanager.prepareOffsets(this, event);

		this.dragging = true;

		this.helper.addClass("ui-sortable-helper");
		this._mouseDrag(event); //Execute the drag once - this causes the helper not to be visible before getting its correct position
		return true;

	},

	_mouseDrag: function(event) {

		//Compute the helpers position
		this.position = this._generatePosition(event);
		this.positionAbs = this._convertPositionTo("absolute");

		if (!this.lastPositionAbs) {
			this.lastPositionAbs = this.positionAbs;
		}

		//Do scrolling
		if(this.options.scroll) {
			var o = this.options, scrolled = false;
			if(this.scrollParent[0] != document && this.scrollParent[0].tagName != 'HTML') {

				if((this.overflowOffset.top + this.scrollParent[0].offsetHeight) - event.pageY < o.scrollSensitivity)
					this.scrollParent[0].scrollTop = scrolled = this.scrollParent[0].scrollTop + o.scrollSpeed;
				else if(event.pageY - this.overflowOffset.top < o.scrollSensitivity)
					this.scrollParent[0].scrollTop = scrolled = this.scrollParent[0].scrollTop - o.scrollSpeed;

				if((this.overflowOffset.left + this.scrollParent[0].offsetWidth) - event.pageX < o.scrollSensitivity)
					this.scrollParent[0].scrollLeft = scrolled = this.scrollParent[0].scrollLeft + o.scrollSpeed;
				else if(event.pageX - this.overflowOffset.left < o.scrollSensitivity)
					this.scrollParent[0].scrollLeft = scrolled = this.scrollParent[0].scrollLeft - o.scrollSpeed;

			} else {

				if(event.pageY - $(document).scrollTop() < o.scrollSensitivity)
					scrolled = $(document).scrollTop($(document).scrollTop() - o.scrollSpeed);
				else if($(window).height() - (event.pageY - $(document).scrollTop()) < o.scrollSensitivity)
					scrolled = $(document).scrollTop($(document).scrollTop() + o.scrollSpeed);

				if(event.pageX - $(document).scrollLeft() < o.scrollSensitivity)
					scrolled = $(document).scrollLeft($(document).scrollLeft() - o.scrollSpeed);
				else if($(window).width() - (event.pageX - $(document).scrollLeft()) < o.scrollSensitivity)
					scrolled = $(document).scrollLeft($(document).scrollLeft() + o.scrollSpeed);

			}

			if(scrolled !== false && $.ui.ddmanager && !o.dropBehaviour)
				$.ui.ddmanager.prepareOffsets(this, event);
		}

		//Regenerate the absolute position used for position checks
		this.positionAbs = this._convertPositionTo("absolute");

		//Set the helper position
		if(!this.options.axis || this.options.axis != "y") this.helper[0].style.left = this.position.left+'px';
		if(!this.options.axis || this.options.axis != "x") this.helper[0].style.top = this.position.top+'px';

		//Rearrange
		for (var i = this.items.length - 1; i >= 0; i--) {

			//Cache variables and intersection, continue if no intersection
			var item = this.items[i], itemElement = item.item[0], intersection = this._intersectsWithPointer(item);
			if (!intersection) continue;

			// Only put the placeholder inside the current Container, skip all
			// items form other containers. This works because when moving
			// an item from one container to another the
			// currentContainer is switched before the placeholder is moved.
			//
			// Without this moving items in "sub-sortables" can cause the placeholder to jitter
			// beetween the outer and inner container.
			if (item.instance !== this.currentContainer) continue;

			if (itemElement != this.currentItem[0] //cannot intersect with itself
				&&	this.placeholder[intersection == 1 ? "next" : "prev"]()[0] != itemElement //no useless actions that have been done before
				&&	!$.contains(this.placeholder[0], itemElement) //no action if the item moved is the parent of the item checked
				&& (this.options.type == 'semi-dynamic' ? !$.contains(this.element[0], itemElement) : true)
				//&& itemElement.parentNode == this.placeholder[0].parentNode // only rearrange items within the same container
			) {

				this.direction = intersection == 1 ? "down" : "up";

				if (this.options.tolerance == "pointer" || this._intersectsWithSides(item)) {
					this._rearrange(event, item);
				} else {
					break;
				}

				this._trigger("change", event, this._uiHash());
				break;
			}
		}

		//Post events to containers
		this._contactContainers(event);

		//Interconnect with droppables
		if($.ui.ddmanager) $.ui.ddmanager.drag(this, event);

		//Call callbacks
		this._trigger('sort', event, this._uiHash());

		this.lastPositionAbs = this.positionAbs;
		return false;

	},

	_mouseStop: function(event, noPropagation) {

		if(!event) return;

		//If we are using droppables, inform the manager about the drop
		if ($.ui.ddmanager && !this.options.dropBehaviour)
			$.ui.ddmanager.drop(this, event);

		if(this.options.revert) {
			var that = this;
			var cur = this.placeholder.offset();

			this.reverting = true;

			$(this.helper).animate({
				left: cur.left - this.offset.parent.left - this.margins.left + (this.offsetParent[0] == document.body ? 0 : this.offsetParent[0].scrollLeft),
				top: cur.top - this.offset.parent.top - this.margins.top + (this.offsetParent[0] == document.body ? 0 : this.offsetParent[0].scrollTop)
			}, parseInt(this.options.revert, 10) || 500, function() {
				that._clear(event);
			});
		} else {
			this._clear(event, noPropagation);
		}

		return false;

	},

	cancel: function() {

		if(this.dragging) {

			this._mouseUp({ target: null });

			if(this.options.helper == "original")
				this.currentItem.css(this._storedCSS).removeClass("ui-sortable-helper");
			else
				this.currentItem.show();

			//Post deactivating events to containers
			for (var i = this.containers.length - 1; i >= 0; i--){
				this.containers[i]._trigger("deactivate", null, this._uiHash(this));
				if(this.containers[i].containerCache.over) {
					this.containers[i]._trigger("out", null, this._uiHash(this));
					this.containers[i].containerCache.over = 0;
				}
			}

		}

		if (this.placeholder) {
			//$(this.placeholder[0]).remove(); would have been the jQuery way - unfortunately, it unbinds ALL events from the original node!
			if(this.placeholder[0].parentNode) this.placeholder[0].parentNode.removeChild(this.placeholder[0]);
			if(this.options.helper != "original" && this.helper && this.helper[0].parentNode) this.helper.remove();

			$.extend(this, {
				helper: null,
				dragging: false,
				reverting: false,
				_noFinalSort: null
			});

			if(this.domPosition.prev) {
				$(this.domPosition.prev).after(this.currentItem);
			} else {
				$(this.domPosition.parent).prepend(this.currentItem);
			}
		}

		return this;

	},

	serialize: function(o) {

		var items = this._getItemsAsjQuery(o && o.connected);
		var str = []; o = o || {};

		$(items).each(function() {
			var res = ($(o.item || this).attr(o.attribute || 'id') || '').match(o.expression || (/(.+)[-=_](.+)/));
			if(res) str.push((o.key || res[1]+'[]')+'='+(o.key && o.expression ? res[1] : res[2]));
		});

		if(!str.length && o.key) {
			str.push(o.key + '=');
		}

		return str.join('&');

	},

	toArray: function(o) {

		var items = this._getItemsAsjQuery(o && o.connected);
		var ret = []; o = o || {};

		items.each(function() { ret.push($(o.item || this).attr(o.attribute || 'id') || ''); });
		return ret;

	},

	/* Be careful with the following core functions */
	_intersectsWith: function(item) {

		var x1 = this.positionAbs.left,
			x2 = x1 + this.helperProportions.width,
			y1 = this.positionAbs.top,
			y2 = y1 + this.helperProportions.height;

		var l = item.left,
			r = l + item.width,
			t = item.top,
			b = t + item.height;

		var dyClick = this.offset.click.top,
			dxClick = this.offset.click.left;

		var isOverElement = (y1 + dyClick) > t && (y1 + dyClick) < b && (x1 + dxClick) > l && (x1 + dxClick) < r;

		if(	   this.options.tolerance == "pointer"
			|| this.options.forcePointerForContainers
			|| (this.options.tolerance != "pointer" && this.helperProportions[this.floating ? 'width' : 'height'] > item[this.floating ? 'width' : 'height'])
		) {
			return isOverElement;
		} else {

			return (l < x1 + (this.helperProportions.width / 2) // Right Half
				&& x2 - (this.helperProportions.width / 2) < r // Left Half
				&& t < y1 + (this.helperProportions.height / 2) // Bottom Half
				&& y2 - (this.helperProportions.height / 2) < b ); // Top Half

		}
	},

	_intersectsWithPointer: function(item) {

		var isOverElementHeight = (this.options.axis === 'x') || $.ui.isOverAxis(this.positionAbs.top + this.offset.click.top, item.top, item.height),
			isOverElementWidth = (this.options.axis === 'y') || $.ui.isOverAxis(this.positionAbs.left + this.offset.click.left, item.left, item.width),
			isOverElement = isOverElementHeight && isOverElementWidth,
			verticalDirection = this._getDragVerticalDirection(),
			horizontalDirection = this._getDragHorizontalDirection();

		if (!isOverElement)
			return false;

		return this.floating ?
			( ((horizontalDirection && horizontalDirection == "right") || verticalDirection == "down") ? 2 : 1 )
			: ( verticalDirection && (verticalDirection == "down" ? 2 : 1) );

	},

	_intersectsWithSides: function(item) {

		var isOverBottomHalf = $.ui.isOverAxis(this.positionAbs.top + this.offset.click.top, item.top + (item.height/2), item.height),
			isOverRightHalf = $.ui.isOverAxis(this.positionAbs.left + this.offset.click.left, item.left + (item.width/2), item.width),
			verticalDirection = this._getDragVerticalDirection(),
			horizontalDirection = this._getDragHorizontalDirection();

		if (this.floating && horizontalDirection) {
			return ((horizontalDirection == "right" && isOverRightHalf) || (horizontalDirection == "left" && !isOverRightHalf));
		} else {
			return verticalDirection && ((verticalDirection == "down" && isOverBottomHalf) || (verticalDirection == "up" && !isOverBottomHalf));
		}

	},

	_getDragVerticalDirection: function() {
		var delta = this.positionAbs.top - this.lastPositionAbs.top;
		return delta != 0 && (delta > 0 ? "down" : "up");
	},

	_getDragHorizontalDirection: function() {
		var delta = this.positionAbs.left - this.lastPositionAbs.left;
		return delta != 0 && (delta > 0 ? "right" : "left");
	},

	refresh: function(event) {
		this._refreshItems(event);
		this.refreshPositions();
		return this;
	},

	_connectWith: function() {
		var options = this.options;
		return options.connectWith.constructor == String
			? [options.connectWith]
			: options.connectWith;
	},

	_getItemsAsjQuery: function(connected) {

		var items = [];
		var queries = [];
		var connectWith = this._connectWith();

		if(connectWith && connected) {
			for (var i = connectWith.length - 1; i >= 0; i--){
				var cur = $(connectWith[i]);
				for (var j = cur.length - 1; j >= 0; j--){
					var inst = $.data(cur[j], this.widgetName);
					if(inst && inst != this && !inst.options.disabled) {
						queries.push([$.isFunction(inst.options.items) ? inst.options.items.call(inst.element) : $(inst.options.items, inst.element).not(".ui-sortable-helper").not('.ui-sortable-placeholder'), inst]);
					}
				};
			};
		}

		queries.push([$.isFunction(this.options.items) ? this.options.items.call(this.element, null, { options: this.options, item: this.currentItem }) : $(this.options.items, this.element).not(".ui-sortable-helper").not('.ui-sortable-placeholder'), this]);

		for (var i = queries.length - 1; i >= 0; i--){
			queries[i][0].each(function() {
				items.push(this);
			});
		};

		return $(items);

	},

	_removeCurrentsFromItems: function() {

		var list = this.currentItem.find(":data(" + this.widgetName + "-item)");

		this.items = $.grep(this.items, function (item) {
			for (var j=0; j < list.length; j++) {
				if(list[j] == item.item[0])
					return false;
			};
			return true;
		});

	},

	_refreshItems: function(event) {

		this.items = [];
		this.containers = [this];
		var items = this.items;
		var queries = [[$.isFunction(this.options.items) ? this.options.items.call(this.element[0], event, { item: this.currentItem }) : $(this.options.items, this.element), this]];
		var connectWith = this._connectWith();

		if(connectWith && this.ready) { //Shouldn't be run the first time through due to massive slow-down
			for (var i = connectWith.length - 1; i >= 0; i--){
				var cur = $(connectWith[i]);
				for (var j = cur.length - 1; j >= 0; j--){
					var inst = $.data(cur[j], this.widgetName);
					if(inst && inst != this && !inst.options.disabled) {
						queries.push([$.isFunction(inst.options.items) ? inst.options.items.call(inst.element[0], event, { item: this.currentItem }) : $(inst.options.items, inst.element), inst]);
						this.containers.push(inst);
					}
				};
			};
		}

		for (var i = queries.length - 1; i >= 0; i--) {
			var targetData = queries[i][1];
			var _queries = queries[i][0];

			for (var j=0, queriesLength = _queries.length; j < queriesLength; j++) {
				var item = $(_queries[j]);

				item.data(this.widgetName + '-item', targetData); // Data for target checking (mouse manager)

				items.push({
					item: item,
					instance: targetData,
					width: 0, height: 0,
					left: 0, top: 0
				});
			};
		};

	},

	refreshPositions: function(fast) {

		//This has to be redone because due to the item being moved out/into the offsetParent, the offsetParent's position will change
		if(this.offsetParent && this.helper) {
			this.offset.parent = this._getParentOffset();
		}

		for (var i = this.items.length - 1; i >= 0; i--){
			var item = this.items[i];

			//We ignore calculating positions of all connected containers when we're not over them
			if(item.instance != this.currentContainer && this.currentContainer && item.item[0] != this.currentItem[0])
				continue;

			var t = this.options.toleranceElement ? $(this.options.toleranceElement, item.item) : item.item;

			if (!fast) {
				item.width = t.outerWidth();
				item.height = t.outerHeight();
			}

			var p = t.offset();
			item.left = p.left;
			item.top = p.top;
		};

		if(this.options.custom && this.options.custom.refreshContainers) {
			this.options.custom.refreshContainers.call(this);
		} else {
			for (var i = this.containers.length - 1; i >= 0; i--){
				var p = this.containers[i].element.offset();
				this.containers[i].containerCache.left = p.left;
				this.containers[i].containerCache.top = p.top;
				this.containers[i].containerCache.width	= this.containers[i].element.outerWidth();
				this.containers[i].containerCache.height = this.containers[i].element.outerHeight();
			};
		}

		return this;
	},

	_createPlaceholder: function(that) {
		that = that || this;
		var o = that.options;

		if(!o.placeholder || o.placeholder.constructor == String) {
			var className = o.placeholder;
			o.placeholder = {
				element: function() {

					var el = $(document.createElement(that.currentItem[0].nodeName))
						.addClass(className || that.currentItem[0].className+" ui-sortable-placeholder")
						.removeClass("ui-sortable-helper")[0];

					if(!className)
						el.style.visibility = "hidden";

					return el;
				},
				update: function(container, p) {

					// 1. If a className is set as 'placeholder option, we don't force sizes - the class is responsible for that
					// 2. The option 'forcePlaceholderSize can be enabled to force it even if a class name is specified
					if(className && !o.forcePlaceholderSize) return;

					//If the element doesn't have a actual height by itself (without styles coming from a stylesheet), it receives the inline height from the dragged item
					if(!p.height()) { p.height(that.currentItem.innerHeight() - parseInt(that.currentItem.css('paddingTop')||0, 10) - parseInt(that.currentItem.css('paddingBottom')||0, 10)); };
					if(!p.width()) { p.width(that.currentItem.innerWidth() - parseInt(that.currentItem.css('paddingLeft')||0, 10) - parseInt(that.currentItem.css('paddingRight')||0, 10)); };
				}
			};
		}

		//Create the placeholder
		that.placeholder = $(o.placeholder.element.call(that.element, that.currentItem));

		//Append it after the actual current item
		that.currentItem.after(that.placeholder);

		//Update the size of the placeholder (TODO: Logic to fuzzy, see line 316/317)
		o.placeholder.update(that, that.placeholder);

	},

	_contactContainers: function(event) {

		// get innermost container that intersects with item
		var innermostContainer = null, innermostIndex = null;


		for (var i = this.containers.length - 1; i >= 0; i--){

			// never consider a container that's located within the item itself
			if($.contains(this.currentItem[0], this.containers[i].element[0]))
				continue;

			if(this._intersectsWith(this.containers[i].containerCache)) {

				// if we've already found a container and it's more "inner" than this, then continue
				if(innermostContainer && $.contains(this.containers[i].element[0], innermostContainer.element[0]))
					continue;

				innermostContainer = this.containers[i];
				innermostIndex = i;

			} else {
				// container doesn't intersect. trigger "out" event if necessary
				if(this.containers[i].containerCache.over) {
					this.containers[i]._trigger("out", event, this._uiHash(this));
					this.containers[i].containerCache.over = 0;
				}
			}

		}

		// if no intersecting containers found, return
		if(!innermostContainer) return;

		// move the item into the container if it's not there already
		if(this.containers.length === 1) {
			this.containers[innermostIndex]._trigger("over", event, this._uiHash(this));
			this.containers[innermostIndex].containerCache.over = 1;
		} else {

			//When entering a new container, we will find the item with the least distance and append our item near it
			var dist = 10000; var itemWithLeastDistance = null;
			var posProperty = this.containers[innermostIndex].floating ? 'left' : 'top';
			var sizeProperty = this.containers[innermostIndex].floating ? 'width' : 'height';
			var base = this.positionAbs[posProperty] + this.offset.click[posProperty];
			for (var j = this.items.length - 1; j >= 0; j--) {
				if(!$.contains(this.containers[innermostIndex].element[0], this.items[j].item[0])) continue;
				if(this.items[j].item[0] == this.currentItem[0]) continue;
				var cur = this.items[j].item.offset()[posProperty];
				var nearBottom = false;
				if(Math.abs(cur - base) > Math.abs(cur + this.items[j][sizeProperty] - base)){
					nearBottom = true;
					cur += this.items[j][sizeProperty];
				}

				if(Math.abs(cur - base) < dist) {
					dist = Math.abs(cur - base); itemWithLeastDistance = this.items[j];
					this.direction = nearBottom ? "up": "down";
				}
			}

			if(!itemWithLeastDistance && !this.options.dropOnEmpty) //Check if dropOnEmpty is enabled
				return;

			this.currentContainer = this.containers[innermostIndex];
			itemWithLeastDistance ? this._rearrange(event, itemWithLeastDistance, null, true) : this._rearrange(event, null, this.containers[innermostIndex].element, true);
			this._trigger("change", event, this._uiHash());
			this.containers[innermostIndex]._trigger("change", event, this._uiHash(this));

			//Update the placeholder
			this.options.placeholder.update(this.currentContainer, this.placeholder);

			this.containers[innermostIndex]._trigger("over", event, this._uiHash(this));
			this.containers[innermostIndex].containerCache.over = 1;
		}


	},

	_createHelper: function(event) {

		var o = this.options;
		var helper = $.isFunction(o.helper) ? $(o.helper.apply(this.element[0], [event, this.currentItem])) : (o.helper == 'clone' ? this.currentItem.clone() : this.currentItem);

		if(!helper.parents('body').length) //Add the helper to the DOM if that didn't happen already
			$(o.appendTo != 'parent' ? o.appendTo : this.currentItem[0].parentNode)[0].appendChild(helper[0]);

		if(helper[0] == this.currentItem[0])
			this._storedCSS = { width: this.currentItem[0].style.width, height: this.currentItem[0].style.height, position: this.currentItem.css("position"), top: this.currentItem.css("top"), left: this.currentItem.css("left") };

		if(helper[0].style.width == '' || o.forceHelperSize) helper.width(this.currentItem.width());
		if(helper[0].style.height == '' || o.forceHelperSize) helper.height(this.currentItem.height());

		return helper;

	},

	_adjustOffsetFromHelper: function(obj) {
		if (typeof obj == 'string') {
			obj = obj.split(' ');
		}
		if ($.isArray(obj)) {
			obj = {left: +obj[0], top: +obj[1] || 0};
		}
		if ('left' in obj) {
			this.offset.click.left = obj.left + this.margins.left;
		}
		if ('right' in obj) {
			this.offset.click.left = this.helperProportions.width - obj.right + this.margins.left;
		}
		if ('top' in obj) {
			this.offset.click.top = obj.top + this.margins.top;
		}
		if ('bottom' in obj) {
			this.offset.click.top = this.helperProportions.height - obj.bottom + this.margins.top;
		}
	},

	_getParentOffset: function() {


		//Get the offsetParent and cache its position
		this.offsetParent = this.helper.offsetParent();
		var po = this.offsetParent.offset();

		// This is a special case where we need to modify a offset calculated on start, since the following happened:
		// 1. The position of the helper is absolute, so it's position is calculated based on the next positioned parent
		// 2. The actual offset parent is a child of the scroll parent, and the scroll parent isn't the document, which means that
		//    the scroll is included in the initial calculation of the offset of the parent, and never recalculated upon drag
		if(this.cssPosition == 'absolute' && this.scrollParent[0] != document && $.contains(this.scrollParent[0], this.offsetParent[0])) {
			po.left += this.scrollParent.scrollLeft();
			po.top += this.scrollParent.scrollTop();
		}

		if((this.offsetParent[0] == document.body) //This needs to be actually done for all browsers, since pageX/pageY includes this information
		|| (this.offsetParent[0].tagName && this.offsetParent[0].tagName.toLowerCase() == 'html' && $.ui.ie)) //Ugly IE fix
			po = { top: 0, left: 0 };

		return {
			top: po.top + (parseInt(this.offsetParent.css("borderTopWidth"),10) || 0),
			left: po.left + (parseInt(this.offsetParent.css("borderLeftWidth"),10) || 0)
		};

	},

	_getRelativeOffset: function() {

		if(this.cssPosition == "relative") {
			var p = this.currentItem.position();
			return {
				top: p.top - (parseInt(this.helper.css("top"),10) || 0) + this.scrollParent.scrollTop(),
				left: p.left - (parseInt(this.helper.css("left"),10) || 0) + this.scrollParent.scrollLeft()
			};
		} else {
			return { top: 0, left: 0 };
		}

	},

	_cacheMargins: function() {
		this.margins = {
			left: (parseInt(this.currentItem.css("marginLeft"),10) || 0),
			top: (parseInt(this.currentItem.css("marginTop"),10) || 0)
		};
	},

	_cacheHelperProportions: function() {
		this.helperProportions = {
			width: this.helper.outerWidth(),
			height: this.helper.outerHeight()
		};
	},

	_setContainment: function() {

		var o = this.options;
		if(o.containment == 'parent') o.containment = this.helper[0].parentNode;
		if(o.containment == 'document' || o.containment == 'window') this.containment = [
			0 - this.offset.relative.left - this.offset.parent.left,
			0 - this.offset.relative.top - this.offset.parent.top,
			$(o.containment == 'document' ? document : window).width() - this.helperProportions.width - this.margins.left,
			($(o.containment == 'document' ? document : window).height() || document.body.parentNode.scrollHeight) - this.helperProportions.height - this.margins.top
		];

		if(!(/^(document|window|parent)$/).test(o.containment)) {
			var ce = $(o.containment)[0];
			var co = $(o.containment).offset();
			var over = ($(ce).css("overflow") != 'hidden');

			this.containment = [
				co.left + (parseInt($(ce).css("borderLeftWidth"),10) || 0) + (parseInt($(ce).css("paddingLeft"),10) || 0) - this.margins.left,
				co.top + (parseInt($(ce).css("borderTopWidth"),10) || 0) + (parseInt($(ce).css("paddingTop"),10) || 0) - this.margins.top,
				co.left+(over ? Math.max(ce.scrollWidth,ce.offsetWidth) : ce.offsetWidth) - (parseInt($(ce).css("borderLeftWidth"),10) || 0) - (parseInt($(ce).css("paddingRight"),10) || 0) - this.helperProportions.width - this.margins.left,
				co.top+(over ? Math.max(ce.scrollHeight,ce.offsetHeight) : ce.offsetHeight) - (parseInt($(ce).css("borderTopWidth"),10) || 0) - (parseInt($(ce).css("paddingBottom"),10) || 0) - this.helperProportions.height - this.margins.top
			];
		}

	},

	_convertPositionTo: function(d, pos) {

		if(!pos) pos = this.position;
		var mod = d == "absolute" ? 1 : -1;
		var o = this.options, scroll = this.cssPosition == 'absolute' && !(this.scrollParent[0] != document && $.contains(this.scrollParent[0], this.offsetParent[0])) ? this.offsetParent : this.scrollParent, scrollIsRootNode = (/(html|body)/i).test(scroll[0].tagName);

		return {
			top: (
				pos.top																	// The absolute mouse position
				+ this.offset.relative.top * mod										// Only for relative positioned nodes: Relative offset from element to offset parent
				+ this.offset.parent.top * mod											// The offsetParent's offset without borders (offset + border)
				- ( ( this.cssPosition == 'fixed' ? -this.scrollParent.scrollTop() : ( scrollIsRootNode ? 0 : scroll.scrollTop() ) ) * mod)
			),
			left: (
				pos.left																// The absolute mouse position
				+ this.offset.relative.left * mod										// Only for relative positioned nodes: Relative offset from element to offset parent
				+ this.offset.parent.left * mod											// The offsetParent's offset without borders (offset + border)
				- ( ( this.cssPosition == 'fixed' ? -this.scrollParent.scrollLeft() : scrollIsRootNode ? 0 : scroll.scrollLeft() ) * mod)
			)
		};

	},

	_generatePosition: function(event) {

		var o = this.options, scroll = this.cssPosition == 'absolute' && !(this.scrollParent[0] != document && $.contains(this.scrollParent[0], this.offsetParent[0])) ? this.offsetParent : this.scrollParent, scrollIsRootNode = (/(html|body)/i).test(scroll[0].tagName);

		// This is another very weird special case that only happens for relative elements:
		// 1. If the css position is relative
		// 2. and the scroll parent is the document or similar to the offset parent
		// we have to refresh the relative offset during the scroll so there are no jumps
		if(this.cssPosition == 'relative' && !(this.scrollParent[0] != document && this.scrollParent[0] != this.offsetParent[0])) {
			this.offset.relative = this._getRelativeOffset();
		}

		var pageX = event.pageX;
		var pageY = event.pageY;

		/*
		 * - Position constraining -
		 * Constrain the position to a mix of grid, containment.
		 */

		if(this.originalPosition) { //If we are not dragging yet, we won't check for options

			if(this.containment) {
				if(event.pageX - this.offset.click.left < this.containment[0]) pageX = this.containment[0] + this.offset.click.left;
				if(event.pageY - this.offset.click.top < this.containment[1]) pageY = this.containment[1] + this.offset.click.top;
				if(event.pageX - this.offset.click.left > this.containment[2]) pageX = this.containment[2] + this.offset.click.left;
				if(event.pageY - this.offset.click.top > this.containment[3]) pageY = this.containment[3] + this.offset.click.top;
			}

			if(o.grid) {
				var top = this.originalPageY + Math.round((pageY - this.originalPageY) / o.grid[1]) * o.grid[1];
				pageY = this.containment ? (!(top - this.offset.click.top < this.containment[1] || top - this.offset.click.top > this.containment[3]) ? top : (!(top - this.offset.click.top < this.containment[1]) ? top - o.grid[1] : top + o.grid[1])) : top;

				var left = this.originalPageX + Math.round((pageX - this.originalPageX) / o.grid[0]) * o.grid[0];
				pageX = this.containment ? (!(left - this.offset.click.left < this.containment[0] || left - this.offset.click.left > this.containment[2]) ? left : (!(left - this.offset.click.left < this.containment[0]) ? left - o.grid[0] : left + o.grid[0])) : left;
			}

		}

		return {
			top: (
				pageY																// The absolute mouse position
				- this.offset.click.top													// Click offset (relative to the element)
				- this.offset.relative.top												// Only for relative positioned nodes: Relative offset from element to offset parent
				- this.offset.parent.top												// The offsetParent's offset without borders (offset + border)
				+ ( ( this.cssPosition == 'fixed' ? -this.scrollParent.scrollTop() : ( scrollIsRootNode ? 0 : scroll.scrollTop() ) ))
			),
			left: (
				pageX																// The absolute mouse position
				- this.offset.click.left												// Click offset (relative to the element)
				- this.offset.relative.left												// Only for relative positioned nodes: Relative offset from element to offset parent
				- this.offset.parent.left												// The offsetParent's offset without borders (offset + border)
				+ ( ( this.cssPosition == 'fixed' ? -this.scrollParent.scrollLeft() : scrollIsRootNode ? 0 : scroll.scrollLeft() ))
			)
		};

	},

	_rearrange: function(event, i, a, hardRefresh) {

		a ? a[0].appendChild(this.placeholder[0]) : i.item[0].parentNode.insertBefore(this.placeholder[0], (this.direction == 'down' ? i.item[0] : i.item[0].nextSibling));

		//Various things done here to improve the performance:
		// 1. we create a setTimeout, that calls refreshPositions
		// 2. on the instance, we have a counter variable, that get's higher after every append
		// 3. on the local scope, we copy the counter variable, and check in the timeout, if it's still the same
		// 4. this lets only the last addition to the timeout stack through
		this.counter = this.counter ? ++this.counter : 1;
		var counter = this.counter;

		this._delay(function() {
			if(counter == this.counter) this.refreshPositions(!hardRefresh); //Precompute after each DOM insertion, NOT on mousemove
		});

	},

	_clear: function(event, noPropagation) {

		this.reverting = false;
		// We delay all events that have to be triggered to after the point where the placeholder has been removed and
		// everything else normalized again
		var delayedTriggers = [];

		// We first have to update the dom position of the actual currentItem
		// Note: don't do it if the current item is already removed (by a user), or it gets reappended (see #4088)
		if(!this._noFinalSort && this.currentItem.parent().length) this.placeholder.before(this.currentItem);
		this._noFinalSort = null;

		if(this.helper[0] == this.currentItem[0]) {
			for(var i in this._storedCSS) {
				if(this._storedCSS[i] == 'auto' || this._storedCSS[i] == 'static') this._storedCSS[i] = '';
			}
			this.currentItem.css(this._storedCSS).removeClass("ui-sortable-helper");
		} else {
			this.currentItem.show();
		}

		if(this.fromOutside && !noPropagation) delayedTriggers.push(function(event) { this._trigger("receive", event, this._uiHash(this.fromOutside)); });
		if((this.fromOutside || this.domPosition.prev != this.currentItem.prev().not(".ui-sortable-helper")[0] || this.domPosition.parent != this.currentItem.parent()[0]) && !noPropagation) delayedTriggers.push(function(event) { this._trigger("update", event, this._uiHash()); }); //Trigger update callback if the DOM position has changed

		// Check if the items Container has Changed and trigger appropriate
		// events.
		if (this !== this.currentContainer) {
			if(!noPropagation) {
				delayedTriggers.push(function(event) { this._trigger("remove", event, this._uiHash()); });
				delayedTriggers.push((function(c) { return function(event) { c._trigger("receive", event, this._uiHash(this)); };  }).call(this, this.currentContainer));
				delayedTriggers.push((function(c) { return function(event) { c._trigger("update", event, this._uiHash(this));  }; }).call(this, this.currentContainer));
			}
		}


		//Post events to containers
		for (var i = this.containers.length - 1; i >= 0; i--){
			if(!noPropagation) delayedTriggers.push((function(c) { return function(event) { c._trigger("deactivate", event, this._uiHash(this)); };  }).call(this, this.containers[i]));
			if(this.containers[i].containerCache.over) {
				delayedTriggers.push((function(c) { return function(event) { c._trigger("out", event, this._uiHash(this)); };  }).call(this, this.containers[i]));
				this.containers[i].containerCache.over = 0;
			}
		}

		//Do what was originally in plugins
		if(this._storedCursor) $('body').css("cursor", this._storedCursor); //Reset cursor
		if(this._storedOpacity) this.helper.css("opacity", this._storedOpacity); //Reset opacity
		if(this._storedZIndex) this.helper.css("zIndex", this._storedZIndex == 'auto' ? '' : this._storedZIndex); //Reset z-index

		this.dragging = false;
		if(this.cancelHelperRemoval) {
			if(!noPropagation) {
				this._trigger("beforeStop", event, this._uiHash());
				for (var i=0; i < delayedTriggers.length; i++) { delayedTriggers[i].call(this, event); }; //Trigger all delayed events
				this._trigger("stop", event, this._uiHash());
			}

			this.fromOutside = false;
			return false;
		}

		if(!noPropagation) this._trigger("beforeStop", event, this._uiHash());

		//$(this.placeholder[0]).remove(); would have been the jQuery way - unfortunately, it unbinds ALL events from the original node!
		this.placeholder[0].parentNode.removeChild(this.placeholder[0]);

		if(this.helper[0] != this.currentItem[0]) this.helper.remove(); this.helper = null;

		if(!noPropagation) {
			for (var i=0; i < delayedTriggers.length; i++) { delayedTriggers[i].call(this, event); }; //Trigger all delayed events
			this._trigger("stop", event, this._uiHash());
		}

		this.fromOutside = false;
		return true;

	},

	_trigger: function() {
		if ($.Widget.prototype._trigger.apply(this, arguments) === false) {
			this.cancel();
		}
	},

	_uiHash: function(_inst) {
		var inst = _inst || this;
		return {
			helper: inst.helper,
			placeholder: inst.placeholder || $([]),
			position: inst.position,
			originalPosition: inst.originalPosition,
			offset: inst.positionAbs,
			item: inst.currentItem,
			sender: _inst ? _inst.element : null
		};
	}

});

})(jQuery);
;/*
 * jQuery UI Widget 1.8.23+amd
 * https://github.com/blueimp/jQuery-File-Upload
 *
 * Copyright 2012, AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * http://docs.jquery.com/UI/Widget
 */

(function (factory) {
    if (typeof define === "function" && define.amd) {
        // Register as an anonymous AMD module:
        define(["jquery"], factory);
    } else {
        // Browser globals:
        factory(jQuery);
    }
}(function( $, undefined ) {

// jQuery 1.4+
if ( $.cleanData ) {
	var _cleanData = $.cleanData;
	$.cleanData = function( elems ) {
		for ( var i = 0, elem; (elem = elems[i]) != null; i++ ) {
			try {
				$( elem ).triggerHandler( "remove" );
			// http://bugs.jquery.com/ticket/8235
			} catch( e ) {}
		}
		_cleanData( elems );
	};
} else {
	var _remove = $.fn.remove;
	$.fn.remove = function( selector, keepData ) {
		return this.each(function() {
			if ( !keepData ) {
				if ( !selector || $.filter( selector, [ this ] ).length ) {
					$( "*", this ).add( [ this ] ).each(function() {
						try {
							$( this ).triggerHandler( "remove" );
						// http://bugs.jquery.com/ticket/8235
						} catch( e ) {}
					});
				}
			}
			return _remove.call( $(this), selector, keepData );
		});
	};
}

$.widget = function( name, base, prototype ) {
	var namespace = name.split( "." )[ 0 ],
		fullName;
	name = name.split( "." )[ 1 ];
	fullName = namespace + "-" + name;

	if ( !prototype ) {
		prototype = base;
		base = $.Widget;
	}

	// create selector for plugin
	$.expr[ ":" ][ fullName ] = function( elem ) {
		return !!$.data( elem, name );
	};

	$[ namespace ] = $[ namespace ] || {};
	$[ namespace ][ name ] = function( options, element ) {
		// allow instantiation without initializing for simple inheritance
		if ( arguments.length ) {
			this._createWidget( options, element );
		}
	};

	var basePrototype = new base();
	// we need to make the options hash a property directly on the new instance
	// otherwise we'll modify the options hash on the prototype that we're
	// inheriting from
//	$.each( basePrototype, function( key, val ) {
//		if ( $.isPlainObject(val) ) {
//			basePrototype[ key ] = $.extend( {}, val );
//		}
//	});
	basePrototype.options = $.extend( true, {}, basePrototype.options );
	$[ namespace ][ name ].prototype = $.extend( true, basePrototype, {
		namespace: namespace,
		widgetName: name,
		widgetEventPrefix: $[ namespace ][ name ].prototype.widgetEventPrefix || name,
		widgetBaseClass: fullName
	}, prototype );

	$.widget.bridge( name, $[ namespace ][ name ] );
};

$.widget.bridge = function( name, object ) {
	$.fn[ name ] = function( options ) {
		var isMethodCall = typeof options === "string",
			args = Array.prototype.slice.call( arguments, 1 ),
			returnValue = this;

		// allow multiple hashes to be passed on init
		options = !isMethodCall && args.length ?
			$.extend.apply( null, [ true, options ].concat(args) ) :
			options;

		// prevent calls to internal methods
		if ( isMethodCall && options.charAt( 0 ) === "_" ) {
			return returnValue;
		}

		if ( isMethodCall ) {
			this.each(function() {
				var instance = $.data( this, name ),
					methodValue = instance && $.isFunction( instance[options] ) ?
						instance[ options ].apply( instance, args ) :
						instance;
				// TODO: add this back in 1.9 and use $.error() (see #5972)
//				if ( !instance ) {
//					throw "cannot call methods on " + name + " prior to initialization; " +
//						"attempted to call method '" + options + "'";
//				}
//				if ( !$.isFunction( instance[options] ) ) {
//					throw "no such method '" + options + "' for " + name + " widget instance";
//				}
//				var methodValue = instance[ options ].apply( instance, args );
				if ( methodValue !== instance && methodValue !== undefined ) {
					returnValue = methodValue;
					return false;
				}
			});
		} else {
			this.each(function() {
				var instance = $.data( this, name );
				if ( instance ) {
					instance.option( options || {} )._init();
				} else {
					$.data( this, name, new object( options, this ) );
				}
			});
		}

		return returnValue;
	};
};

$.Widget = function( options, element ) {
	// allow instantiation without initializing for simple inheritance
	if ( arguments.length ) {
		this._createWidget( options, element );
	}
};

$.Widget.prototype = {
	widgetName: "widget",
	widgetEventPrefix: "",
	options: {
		disabled: false
	},
	_createWidget: function( options, element ) {
		// $.widget.bridge stores the plugin instance, but we do it anyway
		// so that it's stored even before the _create function runs
		$.data( element, this.widgetName, this );
		this.element = $( element );
		this.options = $.extend( true, {},
			this.options,
			this._getCreateOptions(),
			options );

		var self = this;
		this.element.bind( "remove." + this.widgetName, function() {
			self.destroy();
		});

		this._create();
		this._trigger( "create" );
		this._init();
	},
	_getCreateOptions: function() {
		return $.metadata && $.metadata.get( this.element[0] )[ this.widgetName ];
	},
	_create: function() {},
	_init: function() {},

	destroy: function() {
		this.element
			.unbind( "." + this.widgetName )
			.removeData( this.widgetName );
		this.widget()
			.unbind( "." + this.widgetName )
			.removeAttr( "aria-disabled" )
			.removeClass(
				this.widgetBaseClass + "-disabled " +
				"ui-state-disabled" );
	},

	widget: function() {
		return this.element;
	},

	option: function( key, value ) {
		var options = key;

		if ( arguments.length === 0 ) {
			// don't return a reference to the internal hash
			return $.extend( {}, this.options );
		}

		if  (typeof key === "string" ) {
			if ( value === undefined ) {
				return this.options[ key ];
			}
			options = {};
			options[ key ] = value;
		}

		this._setOptions( options );

		return this;
	},
	_setOptions: function( options ) {
		var self = this;
		$.each( options, function( key, value ) {
			self._setOption( key, value );
		});

		return this;
	},
	_setOption: function( key, value ) {
		this.options[ key ] = value;

		if ( key === "disabled" ) {
			this.widget()
				[ value ? "addClass" : "removeClass"](
					this.widgetBaseClass + "-disabled" + " " +
					"ui-state-disabled" )
				.attr( "aria-disabled", value );
		}

		return this;
	},

	enable: function() {
		return this._setOption( "disabled", false );
	},
	disable: function() {
		return this._setOption( "disabled", true );
	},

	_trigger: function( type, event, data ) {
		var prop, orig,
			callback = this.options[ type ];

		data = data || {};
		event = $.Event( event );
		event.type = ( type === this.widgetEventPrefix ?
			type :
			this.widgetEventPrefix + type ).toLowerCase();
		// the original event may come from any element
		// so we need to reset the target on the new event
		event.target = this.element[ 0 ];

		// copy original event properties over to the new event
		orig = event.originalEvent;
		if ( orig ) {
			for ( prop in orig ) {
				if ( !( prop in event ) ) {
					event[ prop ] = orig[ prop ];
				}
			}
		}

		this.element.trigger( event, data );

		return !( $.isFunction(callback) &&
			callback.call( this.element[0], event, data ) === false ||
			event.isDefaultPrevented() );
	}
};

}));
;/*!
 * http://www.JSON.org/json2.js
 * Public Domain
 *
 * JSON.stringify(value, [replacer, [space]])
 * JSON.parse(text, reviver)
 */

/*
    http://www.JSON.org/json2.js
    2009-09-29

    Public Domain.

    NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.

    See http://www.JSON.org/js.html


    This code should be minified before deployment.
    See http://javascript.crockford.com/jsmin.html

    USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
    NOT CONTROL.


    This file creates a global JSON object containing two methods: stringify
    and parse.

        JSON.stringify(value, replacer, space)
            value       any JavaScript value, usually an object or array.

            replacer    an optional parameter that determines how object
                        values are stringified for objects. It can be a
                        function or an array of strings.

            space       an optional parameter that specifies the indentation
                        of nested structures. If it is omitted, the text will
                        be packed without extra whitespace. If it is a number,
                        it will specify the number of spaces to indent at each
                        level. If it is a string (such as '\t' or '&nbsp;'),
                        it contains the characters used to indent at each level.

            This method produces a JSON text from a JavaScript value.

            When an object value is found, if the object contains a toJSON
            method, its toJSON method will be called and the result will be
            stringified. A toJSON method does not serialize: it returns the
            value represented by the name/value pair that should be serialized,
            or undefined if nothing should be serialized. The toJSON method
            will be passed the key associated with the value, and this will be
            bound to the value

            For example, this would serialize Dates as ISO strings.

                Date.prototype.toJSON = function (key) {
                    function f(n) {
                        // Format integers to have at least two digits.
                        return n < 10 ? '0' + n : n;
                    }

                    return this.getUTCFullYear()   + '-' +
                         f(this.getUTCMonth() + 1) + '-' +
                         f(this.getUTCDate())      + 'T' +
                         f(this.getUTCHours())     + ':' +
                         f(this.getUTCMinutes())   + ':' +
                         f(this.getUTCSeconds())   + 'Z';
                };

            You can provide an optional replacer method. It will be passed the
            key and value of each member, with this bound to the containing
            object. The value that is returned from your method will be
            serialized. If your method returns undefined, then the member will
            be excluded from the serialization.

            If the replacer parameter is an array of strings, then it will be
            used to select the members to be serialized. It filters the results
            such that only members with keys listed in the replacer array are
            stringified.

            Values that do not have JSON representations, such as undefined or
            functions, will not be serialized. Such values in objects will be
            dropped; in arrays they will be replaced with null. You can use
            a replacer function to replace those with JSON values.
            JSON.stringify(undefined) returns undefined.

            The optional space parameter produces a stringification of the
            value that is filled with line breaks and indentation to make it
            easier to read.

            If the space parameter is a non-empty string, then that string will
            be used for indentation. If the space parameter is a number, then
            the indentation will be that many spaces.

            Example:

            text = JSON.stringify(['e', {pluribus: 'unum'}]);
            // text is '["e",{"pluribus":"unum"}]'


            text = JSON.stringify(['e', {pluribus: 'unum'}], null, '\t');
            // text is '[\n\t"e",\n\t{\n\t\t"pluribus": "unum"\n\t}\n]'

            text = JSON.stringify([new Date()], function (key, value) {
                return this[key] instanceof Date ?
                    'Date(' + this[key] + ')' : value;
            });
            // text is '["Date(---current time---)"]'


        JSON.parse(text, reviver)
            This method parses a JSON text to produce an object or array.
            It can throw a SyntaxError exception.

            The optional reviver parameter is a function that can filter and
            transform the results. It receives each of the keys and values,
            and its return value is used instead of the original value.
            If it returns what it received, then the structure is not modified.
            If it returns undefined then the member is deleted.

            Example:

            // Parse the text. Values that look like ISO date strings will
            // be converted to Date objects.

            myData = JSON.parse(text, function (key, value) {
                var a;
                if (typeof value === 'string') {
                    a =
/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
                    if (a) {
                        return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4],
                            +a[5], +a[6]));
                    }
                }
                return value;
            });

            myData = JSON.parse('["Date(09/09/2001)"]', function (key, value) {
                var d;
                if (typeof value === 'string' &&
                        value.slice(0, 5) === 'Date(' &&
                        value.slice(-1) === ')') {
                    d = new Date(value.slice(5, -1));
                    if (d) {
                        return d;
                    }
                }
                return value;
            });


    This is a reference implementation. You are free to copy, modify, or
    redistribute.
*/

/*jslint evil: true, strict: false */

/*members "", "\b", "\t", "\n", "\f", "\r", "\"", JSON, "\\", apply,
    call, charCodeAt, getUTCDate, getUTCFullYear, getUTCHours,
    getUTCMinutes, getUTCMonth, getUTCSeconds, hasOwnProperty, join,
    lastIndex, length, parse, prototype, push, replace, slice, stringify,
    test, toJSON, toString, valueOf
*/


// Create a JSON object only if one does not already exist. We create the
// methods in a closure to avoid creating global variables.

if (!this.JSON) {
    this.JSON = {};
}

(function () {

    function f(n) {
        // Format integers to have at least two digits.
        return n < 10 ? '0' + n : n;
    }

    if (typeof Date.prototype.toJSON !== 'function') {

        Date.prototype.toJSON = function (key) {

            return isFinite(this.valueOf()) ?
                   this.getUTCFullYear()   + '-' +
                 f(this.getUTCMonth() + 1) + '-' +
                 f(this.getUTCDate())      + 'T' +
                 f(this.getUTCHours())     + ':' +
                 f(this.getUTCMinutes())   + ':' +
                 f(this.getUTCSeconds())   + 'Z' : null;
        };

        String.prototype.toJSON =
        Number.prototype.toJSON =
        Boolean.prototype.toJSON = function (key) {
            return this.valueOf();
        };
    }

    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        gap,
        indent,
        meta = {    // table of character substitutions
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"' : '\\"',
            '\\': '\\\\'
        },
        rep;


    function quote(string) {

// If the string contains no control characters, no quote characters, and no
// backslash characters, then we can safely slap some quotes around it.
// Otherwise we must also replace the offending characters with safe escape
// sequences.

        escapable.lastIndex = 0;
        return escapable.test(string) ?
            '"' + string.replace(escapable, function (a) {
                var c = meta[a];
                return typeof c === 'string' ? c :
                    '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
            }) + '"' :
            '"' + string + '"';
    }


    function str(key, holder) {

// Produce a string from holder[key].

        var i,          // The loop counter.
            k,          // The member key.
            v,          // The member value.
            length,
            mind = gap,
            partial,
            value = holder[key];

// If the value has a toJSON method, call it to obtain a replacement value.

        if (value && typeof value === 'object' &&
                typeof value.toJSON === 'function') {
            value = value.toJSON(key);
        }

// If we were called with a replacer function, then call the replacer to
// obtain a replacement value.

        if (typeof rep === 'function') {
            value = rep.call(holder, key, value);
        }

// What happens next depends on the value's type.

        switch (typeof value) {
        case 'string':
            return quote(value);

        case 'number':

// JSON numbers must be finite. Encode non-finite numbers as null.

            return isFinite(value) ? String(value) : 'null';

        case 'boolean':
        case 'null':

// If the value is a boolean or null, convert it to a string. Note:
// typeof null does not produce 'null'. The case is included here in
// the remote chance that this gets fixed someday.

            return String(value);

// If the type is 'object', we might be dealing with an object or an array or
// null.

        case 'object':

// Due to a specification blunder in ECMAScript, typeof null is 'object',
// so watch out for that case.

            if (!value) {
                return 'null';
            }

// Make an array to hold the partial results of stringifying this object value.

            gap += indent;
            partial = [];

// Is the value an array?

            if (Object.prototype.toString.apply(value) === '[object Array]') {

// The value is an array. Stringify every element. Use null as a placeholder
// for non-JSON values.

                length = value.length;
                for (i = 0; i < length; i += 1) {
                    partial[i] = str(i, value) || 'null';
                }

// Join all of the elements together, separated with commas, and wrap them in
// brackets.

                v = partial.length === 0 ? '[]' :
                    gap ? '[\n' + gap +
                            partial.join(',\n' + gap) + '\n' +
                                mind + ']' :
                          '[' + partial.join(',') + ']';
                gap = mind;
                return v;
            }

// If the replacer is an array, use it to select the members to be stringified.

            if (rep && typeof rep === 'object') {
                length = rep.length;
                for (i = 0; i < length; i += 1) {
                    k = rep[i];
                    if (typeof k === 'string') {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            } else {

// Otherwise, iterate through all of the keys in the object.

                for (k in value) {
                    if (Object.hasOwnProperty.call(value, k)) {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            }

// Join all of the member texts together, separated with commas,
// and wrap them in braces.

            v = partial.length === 0 ? '{}' :
                gap ? '{\n' + gap + partial.join(',\n' + gap) + '\n' +
                        mind + '}' : '{' + partial.join(',') + '}';
            gap = mind;
            return v;
        }
    }

// If the JSON object does not yet have a stringify method, give it one.

    if (typeof JSON.stringify !== 'function') {
        JSON.stringify = function (value, replacer, space) {

// The stringify method takes a value and an optional replacer, and an optional
// space parameter, and returns a JSON text. The replacer can be a function
// that can replace values, or an array of strings that will select the keys.
// A default replacer method can be provided. Use of the space parameter can
// produce text that is more easily readable.

            var i;
            gap = '';
            indent = '';

// If the space parameter is a number, make an indent string containing that
// many spaces.

            if (typeof space === 'number') {
                for (i = 0; i < space; i += 1) {
                    indent += ' ';
                }

// If the space parameter is a string, it will be used as the indent string.

            } else if (typeof space === 'string') {
                indent = space;
            }

// If there is a replacer, it must be a function or an array.
// Otherwise, throw an error.

            rep = replacer;
            if (replacer && typeof replacer !== 'function' &&
                    (typeof replacer !== 'object' ||
                     typeof replacer.length !== 'number')) {
                throw new Error('JSON.stringify');
            }

// Make a fake root object containing our value under the key of ''.
// Return the result of stringifying the value.

            return str('', {'': value});
        };
    }


// If the JSON object does not yet have a parse method, give it one.

    if (typeof JSON.parse !== 'function') {
        JSON.parse = function (text, reviver) {

// The parse method takes a text and an optional reviver function, and returns
// a JavaScript value if the text is a valid JSON text.

            var j;

            function walk(holder, key) {

// The walk method is used to recursively walk the resulting structure so
// that modifications can be made.

                var k, v, value = holder[key];
                if (value && typeof value === 'object') {
                    for (k in value) {
                        if (Object.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }


// Parsing happens in four stages. In the first stage, we replace certain
// Unicode characters with escape sequences. JavaScript handles many characters
// incorrectly, either silently deleting them, or treating them as line endings.

            cx.lastIndex = 0;
            if (cx.test(text)) {
                text = text.replace(cx, function (a) {
                    return '\\u' +
                        ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                });
            }

// In the second stage, we run the text against regular expressions that look
// for non-JSON patterns. We are especially concerned with '()' and 'new'
// because they can cause invocation, and '=' because it can cause mutation.
// But just to be safe, we want to reject all unexpected forms.

// We split the second stage into 4 regexp operations in order to work around
// crippling inefficiencies in IE's and Safari's regexp engines. First we
// replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
// replace all simple value tokens with ']' characters. Third, we delete all
// open brackets that follow a colon or comma or that begin the text. Finally,
// we look to see that the remaining characters are only whitespace or ']' or
// ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.

            if (/^[\],:{}\s]*$/.
test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@').
replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').
replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

// In the third stage we use the eval function to compile the text into a
// JavaScript structure. The '{' operator is subject to a syntactic ambiguity
// in JavaScript: it can begin a block or an object literal. We wrap the text
// in parens to eliminate the ambiguity.

                j = eval('(' + text + ')');

// In the optional fourth stage, we recursively walk the new structure, passing
// each name/value pair to a reviver function for possible transformation.

                return typeof reviver === 'function' ?
                    walk({'': j}, '') : j;
            }

// If the text is not JSON parseable, then a SyntaxError is thrown.

            throw new SyntaxError('JSON.parse');
        };
    }
}());;/*
	Kailash Nadh (http://nadh.in)
	
	localStorageDB
	September 2011
	A simple database layer for localStorage

	v 1.9 November 2012
	v 2.0 June 2013

	License	:	MIT License
*/

function localStorageDB(db_name, engine) {

	var db_prefix = 'db_',
		db_id = db_prefix + db_name,
		db_new = false,	// this flag determines whether a new database was created during an object initialisation
		db = null;

		try {
			var storage = (engine == sessionStorage ? sessionStorage: localStorage);
		} catch(e) { // ie8 hack
			var storage = engine;
		}

	// if the database doesn't exist, create it
	db = storage[ db_id ];
	if( !( db && (db = JSON.parse(db)) && db.tables && db.data ) ) {
		if(!validateName(db_name)) {
			error("The name '" + db_name + "'" + " contains invalid characters.");
		} else {
			db = {tables: {}, data: {}};
			commit();
			db_new = true;
		}
	}
	
	
	// ______________________ private methods
	
	// _________ database functions
	// drop the database
	function drop() {
		delete storage[db_id];
		db = null;
	}
			
	// number of tables in the database
	function tableCount() {
		var count = 0;
		for(var table in db.tables) {
			if( db.tables.hasOwnProperty(table) ) {
				count++;
			}
		}
		return count;
	}

	// _________ table functions
	
	// check whether a table exists
	function tableExists(table_name) {
		return db.tables[table_name] ? true : false;
	}
	
	// check whether a table exists, and if not, throw an error
	function tableExistsWarn(table_name) {
		if(!tableExists(table_name)) {
			error("The table '" + table_name + "' does not exist.");
		}
	}
		
	// create a table
	function createTable(table_name, fields) {
		db.tables[table_name] = {fields: fields, auto_increment: 1};
		db.data[table_name] = {};
	}
	
	// drop a table
	function dropTable(table_name) {
		delete db.tables[table_name];
		delete db.data[table_name];
	}
	
	// empty a table
	function truncate(table_name) {
		db.tables[table_name].auto_increment = 1;
		db.data[table_name] = {};
	}
	
	// number of rows in a table
	function rowCount(table_name) {
		var count = 0;
		for(var ID in db.data[table_name]) {
			if( db.data[table_name].hasOwnProperty(ID) ) {
				count++;
			}
		}
		return count;
	}
	
	// insert a new row
	function insert(table_name, data) {
		data.ID = db.tables[table_name].auto_increment;
		db.data[table_name][ db.tables[table_name].auto_increment ] = data;
		db.tables[table_name].auto_increment++;
		return data.ID;
	}
	
	// select rows, given a list of IDs of rows in a table
	function select(table_name, ids) {
		var ID = null, results = [], row = null;
		for(var i=0; i<ids.length; i++) {
			ID = ids[i];
			row = db.data[table_name][ID];
			results.push( clone(row) );
		}
		return results;
	}
	
	// select rows in a table by field-value pairs, returns the IDs of matches
	function queryByValues(table_name, data, limit) {
		var result_ids = [],
			exists = false,
			row = null;

		// loop through all the records in the table, looking for matches
		for(var ID in db.data[table_name]) {
			if( !db.data[table_name].hasOwnProperty(ID) ) {
				continue;
			}

			row = db.data[table_name][ID];
			exists = true;

			for(var field in data) {
				if( !data.hasOwnProperty(field) ) {
					continue;
				}

				if(typeof data[field] == 'string') {	// if the field is a string, do a case insensitive comparison
					if( row[field].toString().toLowerCase() != data[field].toString().toLowerCase() ) {
						exists = false;
						break;
					}
				} else {
					if( row[field] != data[field] ) {
						exists = false;
						break;
					}
				}
			}
			if(exists) {
				result_ids.push(ID);
			}
			if(result_ids.length == limit) {
				break;
			}
		}
		return result_ids;
	}
	
	// select rows in a table by a function, returns the IDs of matches
	function queryByFunction(table_name, query_function, limit) {
		var result_ids = [],
			exists = false,
			row = null;

		// loop through all the records in the table, looking for matches
		for(var ID in db.data[table_name]) {
			if( !db.data[table_name].hasOwnProperty(ID) ) {
				continue;
			}

			row = db.data[table_name][ID];

			if( query_function( clone(row) ) == true ) {	// it's a match if the supplied conditional function is satisfied
				result_ids.push(ID);
			}
			if(result_ids.length == limit) {
				break;
			}
		}
		return result_ids;
	}
	
	// return all the IDs in a table
	function getIDs(table_name, limit) {
		var result_ids = [];
		for(var ID in db.data[table_name]) {
			if( db.data[table_name].hasOwnProperty(ID) ) {
				result_ids.push(ID);

				if(result_ids.length == limit) {
					break;
				}
			}
		}
		return result_ids;
	}
	
	// delete rows, given a list of their IDs in a table
	function deleteRows(table_name, ids) {
		for(var i=0; i<ids.length; i++) {
			if( db.data[table_name].hasOwnProperty(ids[i]) ) {
				delete db.data[table_name][ ids[i] ];
			}
		}
		return ids.length;
	}
	
	// update rows
	function update(table_name, ids, update_function) {
		var ID = '', num = 0;

		for(var i=0; i<ids.length; i++) {
			ID = ids[i];

			var updated_data = update_function( clone(db.data[table_name][ID]) );

			if(updated_data) {
				delete updated_data['ID']; // no updates possible to ID

				var new_data = db.data[table_name][ID];				
				// merge updated data with existing data
				for(var field in updated_data) {
					if( updated_data.hasOwnProperty(field) ) {
						new_data[field] = updated_data[field];
					}
				}

				db.data[table_name][ID] = validFields(table_name, new_data);
				num++;
			}
		}
		return num;
	}
	


	// commit the database to localStorage
	function commit() {
		storage[db_id] = JSON.stringify(db);
	}
	
	// serialize the database
	function serialize() {
		return JSON.stringify(db);
	}
	
	// throw an error
	function error(msg) {
		throw new Error(msg);
	}
	
	// clone an object
	function clone(obj) {
		var new_obj = {};
		for(var key in obj) {
			if( obj.hasOwnProperty(key) ) {
				new_obj[key] = obj[key];
			}
		}
		return new_obj;
	}
	
	// validate db, table, field names (alpha-numeric only)
	function validateName(name) {
		return name.match(/[^a-z_0-9]/ig) ? false : true;
	}
	
	// given a data list, only retain valid fields in a table
	function validFields(table_name, data) {
		var field = '', new_data = {};

		for(var i=0; i<db.tables[table_name].fields.length; i++) {
			field = db.tables[table_name].fields[i];
			
			if(data[field]) {
				new_data[field] = data[field];
			}
		}
		return new_data;
	}
	
	// given a data list, populate with valid field names of a table
	function validateData(table_name, data) {
		var field = '', new_data = {};
		for(var i=0; i<db.tables[table_name].fields.length; i++) {
			field = db.tables[table_name].fields[i];
			new_data[field] = data[field] ? data[field] : null;
		}
		return new_data;
	}
	


	// ______________________ public methods

	return {
		// commit the database to localStorage
		commit: function() {
			commit();
		},
		
		// is this instance a newly created database?
		isNew: function() {
			return db_new;
		},
		
		// delete the database
		drop: function() {
			drop();
		},
		
		// serialize the database
		serialize: function() {
			return serialize();
		},
		
		// check whether a table exists
		tableExists: function(table_name) {
			return tableExists(table_name);
		},
		
		// number of tables in the database
		tableCount: function() {
			return tableCount();
		},
		
		// create a table
		createTable: function(table_name, fields) {
			var result = false;
			if(!validateName(table_name)) {
				error("The database name '" + table_name + "'" + " contains invalid characters.");
			} else if(this.tableExists(table_name)) {
				error("The table name '" + table_name + "' already exists.");
			} else {
				// make sure field names are valid
				var is_valid = true;
				for(var i=0; i<fields.length; i++) {
					if(!validateName(fields[i])) {
						is_valid = false;
						break;
					}
				}
				
				if(is_valid) {
					// cannot use indexOf due to <IE9 incompatibility
					// de-duplicate the field list
					var fields_literal = {};
					for(var i=0; i<fields.length; i++) {
						fields_literal[ fields[i] ] = true;
					}
					delete fields_literal['ID']; // ID is a reserved field name

					fields = ['ID'];
					for(var field in fields_literal) {
						if( fields_literal.hasOwnProperty(field) ) {
							fields.push(field);
						}
					}

					createTable(table_name, fields);
					result = true;
				} else {
					error("One or more field names in the table definition contains invalid characters.");
				}
			}

			return result;
		},
		
		// drop a table
		dropTable: function(table_name) {
			tableExistsWarn(table_name);
			dropTable(table_name);
		},
		
		// empty a table
		truncate: function(table_name) {
			tableExistsWarn(table_name);
			truncate(table_name);
		},
		
		// number of rows in a table
		rowCount: function(table_name) {
			tableExistsWarn(table_name);
			return rowCount(table_name);
		},
		
		// insert a row
		insert: function(table_name, data) {
			tableExistsWarn(table_name);
			return insert(table_name, validateData(table_name, data) );
		},

		// insert or update based on a given condition
		insertOrUpdate: function(table_name, query, data) {
			tableExistsWarn(table_name);

			var result_ids = [];
			if(!query) {
				result_ids = getIDs(table_name);				// there is no query. applies to all records
			} else if(typeof query == 'object') {				// the query has key-value pairs provided
				result_ids = queryByValues(table_name, validFields(table_name, query));
			} else if(typeof query == 'function') {				// the query has a conditional map function provided
				result_ids = queryByFunction(table_name, query);
			}

			// no existing records matched, so insert a new row
			if(result_ids.length == 0) {
				return insert(table_name, validateData(table_name, data) );
			} else {
				var ids = [];
				for(var n=0; n<result_ids.length; n++) {
					update(table_name, result_ids, function(o) {
						ids.push(o.ID);
						return data;
					});
				}

				return ids;
			}
		},
		
		// update rows
		update: function(table_name, query, update_function) {
			tableExistsWarn(table_name);

			var result_ids = [];
			if(!query) {
				result_ids = getIDs(table_name);				// there is no query. applies to all records
			} else if(typeof query == 'object') {				// the query has key-value pairs provided
				result_ids = queryByValues(table_name, validFields(table_name, query));
			} else if(typeof query == 'function') {				// the query has a conditional map function provided
				result_ids = queryByFunction(table_name, query);
			}
			return update(table_name, result_ids, update_function);
		},

		// select rows
		query: function(table_name, query, limit) {
			tableExistsWarn(table_name);
			
			var result_ids = [];
			if(!query) {
				result_ids = getIDs(table_name, limit); // no conditions given, return all records
			} else if(typeof query == 'object') {			// the query has key-value pairs provided
				result_ids = queryByValues(table_name, validFields(table_name, query), limit);
			} else if(typeof query == 'function') {		// the query has a conditional map function provided
				result_ids = queryByFunction(table_name, query, limit);
			}
			return select(table_name, result_ids, limit);
		},

		// delete rows
		deleteRows: function(table_name, query) {
			tableExistsWarn(table_name);

			var result_ids = [];
			if(!query) {
				result_ids = getIDs(table_name);
			} else if(typeof query == 'object') {
				result_ids = queryByValues(table_name, validFields(table_name, query));
			} else if(typeof query == 'function') {
				result_ids = queryByFunction(table_name, query);
			}
			return deleteRows(table_name, result_ids);
		}
	}
};var PhotoFrame = {};

(function($) {
	
	/**
	 * An object of PhotoFrame.Database objects
	 */
	 
	PhotoFrame.Model  = {};	
	
	/**
	 * An array of PhotoFrame.Factory objects
	 */
	 
	PhotoFrame.instances = [];
	
	/**
	 * An array of PhotoFrame.Factory matrix objects
	 */
	 
	PhotoFrame.matrix    = [];
	
	/**
	 * An array of PhotoFrame.Button objects
	 */
	 
	PhotoFrame.Buttons   = [];


	PhotoFrame.Class = Base.extend({
		
		/**
		 * Build Date
		 */
		 
		buildDate: '2013-09-05',
		
		/**
		 * Version
		 */
		 
		version: '1.2.0',
		
		/**
		 * Sets the default options
		 *
		 * @param	object 	The default options
		 * @param	object 	The override options
		 */
		 
		constructor: function(_default, options) {
			if(typeof _default != "object") {
				var _default = {};
			}
			if(typeof options != "object") {
				var options = {};
			}
			this.setOptions($.extend(true, {}, _default, options));
		},
		
		/**
		 * Delegates the callback to the defined method
		 *
		 * @param	object 	The default options
		 * @param	object 	The override options
		 */
		 
		callback: function(method) {
		 	if(typeof method === "function") {
				var args = [];
								
				for(var x = 1; x <= arguments.length; x++) {
					if(arguments[x]) {
						args.push(arguments[x]);
					}
				}
				
				method.apply(this, args);
			}
		},
		 
		/**
		 * Log a string into the console if it exists
		 *
		 * @param 	string 	The name of the option
		 * @return	mixed
		 */		
		 
		log: function(str) {
			if(window.console && console.log) {
				console.log(str);
			}
		},
		 
		/**
		 * Get an single option value. Returns false if option does not exist
		 *
		 * @param 	string 	The name of the option
		 * @return	mixed
		 */		
		 
		getOption: function(index) {
			if(this[index]) {
				return this[index];
			}
			return false;
		},
		
		/**
		 * Get all options
		 *
		 * @return	bool
		 */		
		 
		getOptions: function() {
			return this;
		},
		
		/**
		 * Set a single option value
		 *
		 * @param 	string 	The name of the option
		 * @param 	mixed 	The value of the option
		 */		
		 
		setOption: function(index, value) {
			this[index] = value;
		},
		
		/**
		 * Set a multiple options by passing a JSON object
		 *
		 * @param 	object 	The object with the options
		 * @param 	mixed 	The value of the option
		 */		
		
		setOptions: function(options) {
  			for(key in options) {
	  			this.setOption(key, options[key]);
  			}
		},
		
		/**
		 * Remove an index from an array
		 *
		 * @param 	array 	The subject array
		 * @param 	int 	The index to remove from the array
		 * @return  array
		 */		
		
		removeIndex: function(array, index) {
			 for(var i=0; i<array.length; i++) {
		        if(array[i] == index) {
		            array.splice(i, 1);
		            break;
		        }
		    }
		    
		    return array;
		},

		/**
		 * Parse string into a JSON object (or array)
		 *
		 * @param 	string 	The string to parse
		 * @return  mixed
		 */		
		
		jsonEncode: function(str) {
			return JSON.parse(str);
		},

		/**
		 * Convert a JSON object (or array) to a string
		 *
		 * @param 	mixed 	The value to decode
		 * @return  string
		 */		
		
		jsonDecode: function(obj) {
			return JSON.stringify(obj);
		},

		isRetina: function() {
			return window.devicePixelRatio > 1;
		}

	});
	
	PhotoFrame.BaseElement = PhotoFrame.Class.extend({

		/**
		 * An object of callback methods
		 */	
		 
		callbacks: {},

		/**
		 * The PhotoFrame.Factory object
		 */	

		factory: false,

		/**
		 * The object's unique identifier (optional)
		 */	

		id: false,

		/**
		 * The parent jQuery object
		 */	

		parent: false,

		/**
		 * An object of UI elements
		 */	
		 
		ui: {},

		constructor: function(factory, parent, options) {
			var t 		  = this;
			var callbacks = (typeof options == "object" ? options.callbacks : {});

		 	this.ui 	   = {};
		 	this.factory   = factory;
			this.parent    = parent;
			this.base(options);
			this.callbacks = $.extend(true, {}, this.callbacks, callbacks);
		}
		
	});

	PhotoFrame.Factory = PhotoFrame.Class.extend({
		
		/**
		 * An array of buttons to use to build the buttonBar
		 */
		 
		buttons: [],
		 
		/**
		 * The PhotoFrame.ButtonBar object
		 */	
		 
		buttonBar: false,
		
		/**
		 * Has user cancelled upload?
		 */	
		 
		cancel: false,
		
		/**
		 * An object of global callback methods
		 */	
		 
		callbacks: {},
		
		/**
		 * The default CSS classes
		 */		
		
		classes: {
			actionBar: 'photo-frame-action-bar',
			activity: 'photo-frame-activity',
			aspect: 'aspect',
			barButton: 'photo-frame-bar-button',
			browse: 'photo-frame-browse',
			button: 'photo-frame-button',
			cancel: 'photo-frame-cancel',
			clearfix: 'clearfix',
			close: 'photo-frame-close',
			crop: 'photo-frame-crop',
			cropPhoto: 'photo-frame-crop-photo',
			editPhoto: 'photo-frame-edit',
			deletePhoto: 'photo-frame-delete',
			dimmer: 'photo-frame-dimmer',
			dragging: 'photo-frame-dragging',
			dropCover: 'photo-frame-drop-cover',
			dropText: 'photo-frame-drop-text',
			dropZone: 'photo-frame-drop-zone',
			errors: 'photo-frame-errors',
			form: 'photo-frame-form',
			floatLeft: 'photo-frame-float-left',
			floatRight: 'photo-frame-float-right',
			helper: 'photo-frame-helper',
			icons: 'photo-frame-icons',
			invalid: 'photo-frame-invalid',
			ie: 'photo-frame-ie',
			indicator: 'photo-frame-indicator',
			infoToggle: 'photo-frame-toggle-info',
			instructions: 'photo-frame-instructions',
			infoPanel: 'photo-frame-info-panel',
			jcropTracker: 'jcrop-tracker',
			jcropHolder: 'jcrop-holder',
			message: 'photo-frame-message',
			meta: 'photo-frame-meta',
			metaToggle: 'photo-frame-meta-toggle',
			metaClose: 'photo-frame-close-meta',
			panel: 'photo-frame-panel',
			photo: 'photo-frame-photo',
			progress: 'photo-frame-progress',
			preview: 'photo-frame-preview',
			rendering: 'photo-frame-rendering',
			renderBg: 'photo-frame-render-bg',
			renderText: 'photo-frame-render-text',
			save: 'photo-frame-save',
			saving: 'photo-frame-saving',
			size: 'size',
			sortable: 'photo-frame-sortable',
			sortablePlaceholder: 'photo-frame-sortable-placeholder',
			toolbar: 'photo-frame-toolbar',
			//toolBarTools: 'photo-frame-toolbar-tools',
			toolBarToggle: 'photo-frame-toolbar-toggle',
			tools: 'photo-frame-tools',
			upload: 'photo-frame-upload',
			wrapper: 'photo-frame-wrapper'
		},	
		
		/**
		 * Crop Settings
		 */		
		 
		cropSettings: {},
		
		/**
		 * Is the file browser response in progress?
		 */		
		
		fileBrowserResponseInProgress: false,

		/**
		 * Force users to crop new photos?
		 */		
		 
		forceCrop: true,
		 
		/**
		 * Disable users from cropping photos?
		 */		
		 
		disableCrop: false,
		
		/**
		 * An object/array events that have been bound to PhotoFrame
		 */		
		 
		events: {},
		
		/**
		 * Icon Classes
		 */		
		 
		icons: {
			cancel: 'icon-cancel',
			editPhoto: 'icon-edit',
			deletePhoto: 'icon-trash',
			info: 'icon-info',
			cog: 'icon-cog',
			rotate: 'icon-rotate',
			save: 'icon-save',
			tools: 'icon-tools',
			warningSign: 'icon-warning-sign'
		},
		
		/**
		 * The Layer window object
		 */		
		 
		// layerWindow: false,
		
		/**
		 * This is the overflow property of the window when crop is started
		 */
		 
		overflow: false,	
		 	
		/**
		 * Photos Array.
		 */		
		 
		photos: [],
		
		/**
		 * Settings.
		 */		
		 
		settings: {},
				
		/**
		 * An object of UI elements.
		 */		
		 
		ui: {},
			
		/**
		 * An array of PhotoFrame.Window objects.
		 */		
		 
		windows: [],
		
		/**
		 * The wrapping DOM object
		 */		
		 
		$wrapper: false,
				
		/**
		 * Global zIndex count.
		 */		
		 
		zIndexCount: 1,
		
		/**
		 * Constructor to set the options and UI events.
		 *
		 * @param object  The wrapper object
		 * @param object  An array of options to be set
		 */		
		 
		constructor: function(obj, options) {

			var t      = this;
			var photos = $.extend(true, {}, options.photos);
				
			t.events   	   = {};
			t.settings 	   = {};
			t.cropSettings = {};
			t.windows      = [];
			t.index        = PhotoFrame.instances.length;
			
			// Global default callbacks
			
			t.callbacks = $.extend(true, {
				browse: function() {},
				buildUploadUrl: function() { return false; }, // return false by default
				init: function() {},
				responseHandlerSettings: function() { return {}; }	
			}, options.callbacks);
			
			//options.callbacks = $.extend(true, {}, t.callbacks);
			//options.photos    = $.merge(true, [], photos);
			
			PhotoFrame.instances.push(t)
			
			t.$wrapper = $(obj);
			
			t.sortable();	
			t.base(options);	
			
			t.ui = {
				body: $('body'),
				browse: t.$wrapper.find('.'+t.classes.browse),
				upload: t.$wrapper.find('.'+t.classes.upload),
				form: $('#'+t.classes.upload),
				dimmer: $('.'+t.classes.dimmer),
				activity: $('.'+t.classes.activity),
				preview: t.$wrapper.find('.'+t.classes.preview),
				//del: t.$wrapper.find('.photo-frame-delete'),
				//edit: t.$wrapper.find('.photo-frame-edit'),
				helper: t.$wrapper.find('.'+t.classes.helper)
			}
			
			var html = [
				'<form id="'+t.classes.upload+'" class="'+t.classes.form+' '+t.classes.wrapper+' '+t.classes.icons+'" action="'+PhotoFrame.Actions.upload_photo+(t.IE() ? '&ie=true' : '')+'&index='+t.index+'" method="POST" enctype="multipart/form-data" id="'+t.classes.upload+'-'+t.index+'" '+(t.IE() ? 'target="photo-frame-iframe-'+t.index+'"' : '')+'>',
					'<h3>'+PhotoFrame.Lang.select_file+'</h3>',
					'<input type="file" name="files[]" multiple>',
					'<button type="submit" class="'+t.classes.button+'"><span class="icon-upload"></span>'+t.buttonText+'</button>',
				'</form>'
			].join('');
			
			t.ui.form = $(html);
			t.ui.form.submit(function() {
				if(t.IE()) {
					t.ui.form.hide();
					t.showProgress(0, function() {
						t.startUpload();
					});
				}
			});
			
			t.ui.body.append(t.ui.form);
			t.ui.window = $(window);
			
			var html = [
				'<div class="'+t.classes.dimmer+' '+t.classes.icons+'">',
					'<a href="#" class="'+t.classes.metaToggle+'"><span class="'+t.icons.info+'"></span></a>',
					'<div class="'+t.classes.infoPanel+'">',
						'<a href="#" class="'+t.classes.close+'"><span class="'+t.icons.cancel+'"></span></a>',
						'<p class="'+t.classes.size+'">W: <span class="width"></span> H: <span class="height"></span></p>',
						'<div class="coords">',
							'<p>',
								'<label><b>X</b>: <span class="x"></span></label>',
								'<label><b>Y</b>: <span class="y"></span></label>',
							'</p>',
							'<p>',
								'<label><b>X2</b>: <span class="x2"></span></label>',
								'<label><b>Y2</b>: <span class="y2"></span></label>',
							'</p>',
						'</div>',
						'<p class="'+t.classes.aspect+'"></p>',
					'</div>',
					'<div class="'+t.classes.activity+'">',
						'<span class="'+t.classes.indicator+'"></span> <p>'+PhotoFrame.Lang.uploading+'</p>',
						'<a class="'+t.classes.button+' '+t.classes.cancel+'"><span class="'+t.icons.cancel+'"></span> Cancel</a>',
					'</div>',
					'<div class="'+t.classes.progress+'"></div>',
					'<div class="'+t.classes.errors+'">',
						'<h3>'+PhotoFrame.Lang.errors+'</h3>',
						'<ul></ul>',
						'<a class="'+t.classes.button+' '+t.classes.cancel+'"><span class="'+t.icons.cancel+'"></span> Close</a>',
					'</div>',
					'<div class="'+t.classes.crop+'">',
						'<div class="'+t.classes.cropPhoto+'"></div>',
						'<div class="'+t.classes.renderBg+'"><div class="'+t.classes.renderText+'">'+PhotoFrame.Lang.rendering+'</div></div>',
						'<div class="'+t.classes.meta+'">',
							'<a href="#" class="'+t.classes.metaClose+' '+t.classes.floatRight+'"><span class="'+t.icons.cancel+'"></span></a>',
							'<h3>'+PhotoFrame.Lang.photo_details+'</h3>',
							'<ul>',
								'<li>',
									'<label for="title">'+PhotoFrame.Lang.title+'</label>',
									'<input type="text" name="title" value="" id="title" />',
								'</li>',
								'<!-- <li>',
									'<label for="keywords">'+PhotoFrame.Lang.keywords+'</label>',
									'<input type="text" name="keywords" value="" id="keywords" />',
								'</li> -->',
								'<li>',
									'<label for="title">'+PhotoFrame.Lang.description+'</label>',
									'<textarea name="description" id="description"></textarea>',
								'</li>',
							'</ul>',
						'</div>',
						'<div class="'+t.classes.toolbar+'">',
							'<div class="'+t.classes.tools+'">',
								'<a href="#" class="'+t.classes.toolBarToggle+'"><i class="'+t.icons.tools+'"></i></a>',
								/*'<a class="'+t.classes.infoToggle+'"><i class="'+t.icons.info+'"></i></a>',*/
							'</div>',
							'<a href="#"  class="'+t.classes.barButton+' '+t.classes.cancel+' '+t.classes.floatLeft+'"><span class="'+t.icons.cancel+'"></span> '+PhotoFrame.Lang.cancel+'</a>',
							'<a href="#"  class="'+t.classes.barButton+' '+t.classes.save+' '+t.classes.floatRight+'"><span class="'+t.icons.save+'"></span> '+PhotoFrame.Lang.save+'</a>',
						'</div>',
					'</div>',
				'</div>'
			].join('');
			
			t.ui.dimmer        = $(html);
			t.ui.toolbar       = t.ui.dimmer.find('.'+t.classes.toolbar);
			t.ui.tools         = t.ui.toolbar.find('.'+t.classes.tools);
			t.ui.toolBarToggle = t.ui.toolbar.find('.'+t.classes.toolBarToggle);
			t.ui.infoToggle    = t.ui.toolbar.find('.'+t.classes.infoToggle);
			
			t.ui.toolbar.hide();
			t.ui.body.append(t.ui.dimmer);

			if(t.infoPanel) {
				t.ui.info = t.ui.dimmer.find('.'+t.classes.infoPanel);
				t.ui.info.draggable();
				t.ui.info.find('.'+t.classes.close).click(function(e) {			
					t.ui.info.fadeOut();
					e.preventDefault();
				});
			}
					
			//t.ui.activity = t.ui.dimmer.find('.'+t.classes.activity);
			//t.ui.activity.find('.photo-frame-indicator').activity({color: '#fff'});
			
			t.ui.progress        = t.ui.dimmer.find('.'+t.classes.progress);
			t.ui.save            = t.ui.dimmer.find('.'+t.classes.save);
			t.ui.cancel          = t.ui.dimmer.find('.'+t.classes.cancel);
			t.ui.errors          = t.ui.dimmer.find('.'+t.classes.errors);
			t.ui.errorCancel     = t.ui.dimmer.find('.'+t.classes.errors+' .'+t.classes.cancel);
			t.ui.crop            = t.ui.dimmer.find('.'+t.classes.crop);
			t.ui.cropPhoto       = t.ui.dimmer.find('.'+t.classes.cropPhoto);
			t.ui.meta            = t.ui.dimmer.find('.'+t.classes.meta);
			t.ui.metaToggle      = t.ui.dimmer.find('.'+t.classes.metaToggle);
			t.ui.metaClose       = t.ui.dimmer.find('.'+t.classes.metaClose);
			t.ui.metaTitle       = t.ui.meta.find('#title');
			t.ui.metaDescription = t.ui.meta.find('#description');
			t.ui.metaKeywords    = t.ui.meta.find('#keywords');
			t.ui.dropZone        = t.$wrapper.find('.'+t.classes.dropZone);
					
			t.buttonBar = new PhotoFrame.ButtonBar(t, t.buttons, {
				title: PhotoFrame.Lang.tools
			});

			t.buttonBar.ui.window.addClass('photo-frame-button-bar');
				
			$(window).keyup(function(e) {
				if (e.keyCode == 27) { 
					t.ui.cancel.click();
				} 
			});
				
			t.progressBar   = new PhotoFrame.ProgressBar(t.ui.progress, {
				callbacks: {
					cancel: function() {
						t.cancel = true;
						
						if(t.jqXHR) {
							t.jqXHR.abort();
						}
						
						t.ui.dimmer.fadeOut();
						t.resetProgress();
					}
				}
			});
			
			t.ui.errorCancel.click(function(e) {			
				t.clearNotices();			
				t.ui.dimmer.fadeOut('fast');	
				t.hideMeta();
				t.hideProgress();
				e.preventDefault();
			});
			
			if(!t.IE()) {
				
				t.ui.form.fileupload({
					//url: '/live/home/index',
					started: function() {
						//t.ui.dropZone.hide();
						t.showProgress(0);
					},
					progress: function(e, data) {
						t.showProgress(parseInt(data.loaded / data.total * 100) * .5);
					},
					pasteZone: null,
					singleFileUploads: false,
					dropZone: t.ui.dropZone,
					url: t.getUploadUrl(),
					add: function (e, data) {
						if(t.maxPhotos > 0 && (t.maxPhotos <= t.getTotalPhotos())) {
							t.showErrors([PhotoFrame.Lang.max_photos_error], {
								max_photos: t.maxPhotos,
								max_photos_name: (t.maxPhotos == 1 ? 'photo' : 'photos')
							});
						}	
						else {
							if(data.files.length > 0) {
								t.ui.dropZone.hide();
								t.initialized = false;
								t.showProgress(0);
								t.startUpload(data.files, function() {
									t.jqXHR = data.submit();
								});
							}
						}
					},
					fail: function (e, data) {
						if(!t.cancel) {
							t.showErrors([PhotoFrame.Lang.unexpected_error]);	
						}						
						t.cancel = false;
					},
					done: function (e, data) {
						var errors = [];
						
						if(typeof data.result[0] == "undefined" || typeof data.result == "string") {
							errors = [PhotoFrame.Lang.unexpected_error];
						}	
						
						if(typeof data.result == "object" && data.result.length == 1) {
							t.showProgress(75, function() {
								t._uploadResponseHandler(data.result[0]);
							});
						}
						else {
							var count = 1;
							if(typeof data.result[0].success != "undefined") {
								t.showProgress(100, function() {
									$.each(data.result, function(i, result) {
										t._uploadResponseHandler(result, true, true, function() {
											if(count == data.result.length) {
												t.hideProgress();
												t.hideDimmer();
											}
											count++;
										});
									});
								});
							}
							else {
								t.hideProgress();
								t.showErrors(errors);
								t.log(data.result);
							}
						}
					}
		    	});
	    	}
	    	else {
		    	t.ui.iframe = $('<iframe name="photo-frame-iframe-'+t.index+'" id="photo-frame-iframe-'+t.index+'" src="" style="display:none;width:0;height:0"></iframe>');
		    	t.ui.body.append(t.ui.iframe);
	    	}

			t.photos  = [];

	    	for(var x in photos) {
		    	var photo = photos[x];
		    	
		    	new PhotoFrame.Photo(t, photo, {
		    		id: photo.id,
		    		manipulations: photo.manipulations,
		    		index: x,
		    		cropSettings: $.extend({}, options.cropSettings, {
			    		setSelect: [photo.x, photo.y, photo.x2, photo.y2]	
		    		}),
			    	$wrapper: t.$wrapper.find('#'+t.classes.photo+'-'+t.fieldId+'-'+x)
		    	});
	    	}
	    				
			$(window).resize(function() {
				if(t.ui.crop.css('display') != 'none') {
					t.ui.crop.center();
				}				
				if(t.ui.meta.css('display') != 'none') {
					t.ui.meta.center();
				}				
				if(t.ui.saving) {
					t.ui.saving.center();
				}				
				if(t.ui.errors.css('display') != 'none') {
					t.ui.errors.center();
				}
			});
			
	    	t.ui.metaToggle.click(function(e) {
		    	t.toggleMeta();	    		    	
		    	e.preventDefault();
	    	});
	    	
	    	t.ui.metaClose.click(function(e) {
	    		t.hideMeta();
		    	e.preventDefault();
	    	});

			t.ui.browse.click(function() {
				t.callback(t.callbacks.browse);
			});
						
			t.ui.toolBarToggle.click(function(e) {
				t.toggleTools();
				e.preventDefault();
			});
			
			t.ui.infoToggle.click(function(e) {
		    	t.toggleMeta();
				e.preventDefault();
			});
			
			t.$wrapper.bind('dragover', function(e) {
				var obj 	= t.$wrapper.find('.'+t.classes.dropText);
				var parent  = obj.parent();
				
				if(t.maxPhotos == 0 || (t.maxPhotos > t.getTotalPhotos())) {
							
					t.ui.dropZone.show();
					
					obj.position({
						of: parent,
						my: 'center',
						at: 'center'
					});
					
					t.$wrapper.addClass(t.classes.dragging);					
				}

				e.preventDefault();
			});
			
			t.$wrapper.find('.'+t.classes.dropCover).bind('drop dragleave', function(e) {
				
				if(!$(e.target).hasClass(t.classes.dropTag)) {				
					t.$wrapper.removeClass(t.classes.dragging);
				}
				
				e.preventDefault();
			});
				
			t.ui.upload.click(function(e) {
				t.isNewPhoto = true;
				
				if(!t.IE()) {
					// All this extra code is there to support older versions of Chrome and 
					// Safari. File inputs cannot be triggered if the form or field is hidden.
					// This is best hack I could find at the time. - 1/9/2013
					t.ui.form.css({
						position: 'absolute',
						left: -1000	
					}).show();
					
					t.ui.form.find('input').show().click();
				}
				else {
					t.ui.dimmer.show();
					t.ui.crop.hide();
					
					if(t.ui.instructions) {
						t.ui.instructions.hide();
					}
					
					//t.ui.cropPhoto.hide();
					t.ui.form.show().center();
				}
						
				e.preventDefault();
			});
			
			t.bind('startCropBegin', function() {
				t.hideOverflow();
			});
			
			t.bind('saveEnd', function() {
				t.resetOverflow();
			});
			
			t.bind('cancel', function() {
				t.resetOverflow();
			});
			
			t.callback(t.callbacks.init);
		},

		getSettings: function() {
			return this.settings;
		},
		
		getSetting: function(index) {
			var settings = this.getSettings(), index = 'photo_frame_'+index;

		 	if(settings[index]) {
		 		return settings[index];
		 	}

		 	return undefined;
		},

		getUploadUrl: function() {
			var _default = PhotoFrame.Actions.upload_photo
			var url = this.callbacks.buildUploadUrl();
			
			return url ? url : _default;	
		},

		parse: function(string, vars, value) {
			if(typeof vars != "object") {
				var obj   = {};
				obj[vars] = value;
				vars      = obj;
			}
			$.each(vars, function(i, value) {
				string = string.replace('{'+i+'}', value);
			});
			return string;
		},
		
		showError: function(error, vars) {
			var t = this;
			error = this.parse(error, vars);

			t.hideProgress(function() {
				t.ui.errors.find('ul').append('<li>'+error+'</li>');
				t.ui.errors.show();
				t.ui.errors.center();
				t.ui.dimmer.fadeIn();
				t.progressBar.reset();
			});
		},
		
		showErrors: function(errors, vars) {
			var t = this;
			t.ui.errors.find('ul').html('');
			t.ui.errors.hide();
			t.ui.activity.hide();
			t.ui.crop.hide();
			t.ui.form.hide();
			t.progressBar.hide();

			$.each(errors, function(i, error) {
				t.showError(error, vars);
			});
		},
		
		hideDimmer: function(callback) {
			if(this.buttonBar) {
				this.buttonBar.hide(false);
			}
			
			this.hideInstructions();
			this.ui.dimmer.hide(callback);
			this.ui.form.hide();
			this.ui.errors.fadeOut();
			this.progressBar.reset();
		},
		
		sortable: function() {    	
			if(this.sortable) {
			    this.ui.list = this.$wrapper.find('.'+this.classes.sortable);
			    this.ui.list.sortable({placeholder:this.classes.sortablePlaceholder});
	            this.ui.list.disableSelection();
			}
		},
		
		clearNotices: function(callback) {
			for(var x in this.notices) {
				this.notices[x].clear(callback);
			}			
		},
		
		notify: function(notifications, delay, animation) {
			var t = this;
			var $panel   = $('.'+t.classes.panel);
			var messages = [];
				
			if(!delay) {
				delay = 190;	
			}
			
			if(!animation) {
				animation = 300;
			}
			
			function show() {
				var html = $('<div class="'+t.classes.panel+' '+t.classes.icons+'" />');
				
				$.each(notifications, function(i, message) {
					message = $([
						'<div class="'+t.classes.message+'">',
							'<p><span class="'+t.icons.warningSign+'"></span>'+message+'</p>',
							'<a href="#" class="'+t.classes.close+'"><span class="'+t.icons.cancel+'"></span></a>',
						'</div>'
					].join(''));
					
					messages.push(message);
					html.append(message);
				});
				
				$('body').append(html);
			}
			
			if($panel.length == 1) {
				$panel.fadeOut(function() {
					$panel.remove();
					t.notify(notifications, delay, animation);
				});
			}
			else {
				show();
			}
			
			var loopDelay  = 0;
			var closeDelay = 0;
			
			$.each(messages, function(i, message) {
			
				setTimeout(function() {
					
					$(message).animate({
						right: 50
					}, animation, function() {
						
						setTimeout(function() { 
							$(message).animate({right: -$(message).width()-75}, animation);
						}, 5000 + closeDelay);
						
						closeDelay = (delay*(i+1));
					});
					
				}, loopDelay);
				
				loopDelay = (delay*(i+1));
			});
			
			$('.photo-frame-message .photo-frame-close').click(function() {
				$(this).parent().fadeOut('fast');
			});
			
			return notifications;
		},
		
		getTotalPhotos: function() {
			var count = 0;
			
			$.each(this.photos, function(i, photo) {
				if(photo) {
					count++;
				}	
			});
			
			return count;	
		},
		
		hideOverflow: function() {
			this.overflow = $('body').css('overflow');
			$('body').css('overflow', 'hidden');	
		},
		
		resetOverflow: function() {
			$('body').css('overflow', this.overflow);
		},
		
		_assetResponseHandler: function(response, progress, callback) {
			var t = this;
			
			if(typeof progress == "function") {
    			callback = progress;
    			progress = 100;
			}
			
			if(typeof progress == "undefined" || progress === false) {
				var progress = 100;
			}
			
			t.showProgress(progress, function() {
				t._uploadResponseHandler(response, true, true, function(response) {
					
	    			t.hideDimmer();
	    			//t.resetProgress();
	    			//t.hideProgress();
	    			
	    			if(typeof callback == "function") {
		    			callback(response);
	    			}
    			
				});
			});
		},
		
		_uploadResponseHandler: function(response, existingAsset, noCrop, callback) {
			
			if(typeof existingAssets == "function") {
				callback = existingAsset;
				existingAssets = false;
			}
			if(typeof noCrop == "function") {
				callback = existingAsset;
				noCrop   = false;
			}
			
			this.response = response;			
			this.ui.toolbar.hide();
			
			if(this.response.success) {
				if(!existingAsset) {
					this.$wrapper.append('<textarea name="'+this.fieldName+'[][uploaded]" style="display:none">{"field_id": "'+this.fieldId+'", "col_id": "'+this.colId+'", "row_id": "'+this.rowId+'", "path": "'+this.response.file_path+'", "original_path": "'+this.response.original_path+'", "file": "'+this.response.file_name+'"}</textarea>');
				}
				
				var props = {
					cropSettings: this.cropSettings,
					compression: this.compression,
					size: this.size,
					forceCrop: this.forceCrop,
					disableCrop: this.disableCrop,
					manipulations: {},
					//resize: this.resize,
					//resizeMax: this.resizeMax,
					index: this.photos.length,
				};
				
				var photo = new PhotoFrame.Photo(this, response, props);
				
				if(!noCrop && photo.forceCrop && !photo.disableCrop) {
					//this.hideProgress(function() {
						photo.startCrop();
					//});
				}
				else {
					photo._loadFromResponse(response, function() {
						photo.factory.hideProgress(function() {
							photo.factory.hideDimmer();
							if(typeof callback == "function") {
								callback();
							}
						});
					});
				}
			}
			else {
				this.showErrors(this.response.errors);	
			}
		},
		
		/**
		 * Returns TRUE if the user is using InternetExplorer, otherwise
		 * returns FALSE.
		 *
		 * @return	bool
		 */		
		 
		IE: function() {
			return this.$wrapper.children().hasClass(this.classes.ie);
		},
		
		hideInstructions: function() {
			if(this.ui.instructions) {
				this.ui.instructions.hide();
				this.ui.instructions.remove();
			}	
		},
		
		_fileBrowserResponseHandler: function(file, id, callback) {
			if(typeof id == "function") {
				callback = id;
				id = false;
			}

			var t = this;
			var options = {
				fieldId: t.fieldId,
				varId: t.varId, 
				colId: t.colId,
				siteId: t.siteId,
				file: file,
				assetId: (id ? id : false),
				gridId: (t.gridId ? t.gridId : false)
			};
			
			options = $.extend({}, options, this.callbacks.responseHandlerSettings());
			if(!this.fileBrowserResponseInProgress) {
				this.fileBrowserResponseInProgress = true;
				$.get(PhotoFrame.Actions.photo_response, options, function(response) {
					t.fileBrowserResponseInProgress = false;
					if(typeof response != "object") {
						t.log(response);
						t.showErrors([PhotoFrame.Lang.unexpected_error]);
					}
					else {
						if(typeof callback == "function") {				
							callback(response);
						}
					}
				});
			}
		},
		
		hideMeta: function() {	
			this.ui.metaToggle.removeClass('active');	
			this.ui.meta.fadeOut('fast');
		},
		
		hideUpload: function() {
			this.ui.upload.hide();
			this.ui.browse.hide();
			this.ui.helper.hide();
		},
		
		/**
		 * Show the progress bar.
		 */	
		 	
		hideProgress: function(callback) {
			this.progressBar.hide(callback);
		},
		
		resetMeta: function() {	
			this.ui.metaTitle.val('');
			this.ui.metaKeywords.val('');
			this.ui.metaDescription.val('');
		},
		
		hash: function(length, r) {
			var m = m || length; s = '', r = r ? r : 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
			for (var i=0; i < m; i++) { s += r.charAt(Math.floor(Math.random()*r.length)); }
			return s;
		},
		
		/**
		 * Resets the progress bar.
		 */		
		 
		resetProgress: function() {
			if(typeof show == "undefined") {
				var show = true;	
			};
			
			this.ui.crop.hide();
			this.ui.activity.hide();
			this.progressBar.reset();
		},
						
		showMeta: function() {
			this.ui.metaToggle.addClass('active');	
			this.ui.meta.fadeIn('fast');
			this.ui.meta.center();
			this.ui.metaTitle.focus();
		},
		
		showUpload: function() {
			this.ui.upload.show();
			this.ui.browse.show();
			this.ui.helper.show();	
		},
		
		startUpload: function(files, callback) {
			var t = this;
			
			if(typeof files == "function") {
				callback = files;
				files    = [];	
			}
			
			if(t.IE()) {
				t.ui.form.hide();
			}
			else {
				if(files.length == 1) {
					t.ui.errors.hide();
					t.ui.crop.hide();
				}
			}
			
			t.ui.crop.hide();
			t.ui.dimmer.fadeIn(function() {
				if(typeof callback == "function") {
					callback();	
				}
			});
		},
		
		/**
		 * Show the progress bar.
		 */		
		showProgress: function(progress, callback) {
			this.ui.dimmer.fadeIn();
			this.ui.errors.hide();
			this.progressBar.show();
			this.progressBar.set(progress, callback);
			this.hideMeta();
			this.hideInfo();
		},
				
		toggleMeta: function() {
			if(this.ui.meta.css('display') == 'none') {
				this.showMeta();
			}
			else {
				this.hideMeta();
			}
		},
				
		toggleTools: function() {
			if(this.buttonBar) {
				if(!this.buttonBar.isVisible()) {
					this.showTools();
				}
				else {
					this.hideTools();
				}
			}
		},
		
		showTools: function(callback) {
			if(this.buttonBar) {
				this.buttonBar.show(callback);
			}
		},
		
		hideTools: function(callback) {
			if(this.buttonBar) {
				this.buttonBar.hide(callback);
			}
		},
		
		hideInfo: function(callback) {
			if(this.ui.info) {
				this.ui.info.hide(callback);
			}
		},
		
		showInfo: function(callback) {
			if(this.ui.info) {
				this.ui.info.fadeIn
				(callback);
			}
		},
		
		bind: function(event, callback) {
			if(!this.events[event]) {
				this.events[event] = [];
			}
			
			if(typeof callback == "function") {
				this.events[event].push(callback);
			}
		},
		
		trigger: function(event) {
			var t = this;
			var newArgs = arguments;
			var args = [];
					
			for(var x = 1; x <= newArgs.length; x++) {
				if(typeof newArgs[x] != "undefined") {
					args.push(newArgs[x]);
				}
			}
			
			if(this.events[event]) {
				$.each(this.events[event], function(i, callback) {
					callback.apply(this, args);				
				});
			}
		}
		
	});
	
	PhotoFrame.ButtonBar = PhotoFrame.Class.extend({
		
		/**
		 * An array of PhotoFrame.Button objects
		 */	
		 
		buttons: [],
		
		/**
		 * An object of classes
		 */	
		 
		classes: {
			active: 'photo-frame-active',
			wrapper: 'photo-frame-toolbar-tools',
			list: 'photo-frame-toolbar-tools-list',
			titleBar: 'photo-frame-toolbar-tools-title'
		},
		
		/**
		 * The parent PhotoFrame.Factory
		 */	
		 
		factory: false,

		/**
		 * The title of the button bar
		 */	
		 
		title: false,
				
		/**
		 * The child DOM objects
		 */	
		 
		ui: {
			list: false,
			titleBar: false,
			window: false
		},
		
		/**
		 * The wrapping DOM object
		 */	
		 
		// $wrapper: false,
				
		
		constructor: function(factory, buttons, options) {
			this.ui 	 = {};			
			this.buttons = [];
			this.base(options);
			this.factory = factory;
			this._buildButtonBar();
			this.addButtons(buttons);
			this.savePosition();
			
			if(this.buttons.length === 0) {
				this.factory.ui.tools.hide();
			}
		},
		
		addButton: function(button, options) {
			var button = this.loadButton(button, options);
			
			if(button && button.isActive()) {
				var item = $('<li />').append(button.$obj);
				
				this.ui.list.append(item);
			}			
			
			this.buttons.push(button);
		},				
		
		addButtons: function(buttons, options) {
			var t = this;
			
			for(var x in buttons) {
				var button = buttons[x];
				
				this.addButton(button, options);
			}
		},
		
		unclick: function() {
			
		},
		
		click: function() {
			//this.ui.list.find('.'+this.classes.active).removeClass(this.classes.active);	
		},	
		
		loadButton: function(type, options) {
			if(typeof options != "object") {
				options = {};
			}
			
			if(PhotoFrame.Buttons[type.ucfirst()]) {
				var button = new PhotoFrame.Buttons[type.ucfirst()](this, $.extend(true, {}, {
					name: type
				}, options));
							
				return button;
			}
			else {
				this.log('The "'+type.ucfirst()+'" button does not exist.');
			}			
		},
		
		isVisible: function(callback) {
			return this.ui.window.css('display') != 'none' ? true : false;
		},
		
		show: function(save, callback) {
			if(typeof save == "undefined") {
				save = true;
			}
			else if(typeof save == "function") {
				callback = save;
				save = true;
			}
			
			if(this.buttons.length > 0) {
				this.factory.ui.toolBarToggle.addClass(this.classes.active);
				this.ui.window.fadeIn(callback);
				
				if(save) {
					this.setVisibility(true);
				}			
				this.showWindows();
			}
			
			this.savePosition();
		},
		
		hide: function(save, callback) {
			var t = this;
			
			if(typeof save == "undefined") {
				save = true;
			}
			else if(typeof save == "function") {
				callback = save;
				save = true;
			}
			
			for(var x in this.factory.windows) {
				this.factory.windows[x].close(false);
			}
			
			this.ui.list.find('.'+this.classes.active).removeClass(this.classes.active);			
			
			this.ui.window.fadeOut(function() {
				t.factory.ui.toolBarToggle.removeClass(t.factory.classes.active);
			});
			
			if(save) {
				this.setVisibility(false);
			}	
			
			this.savePosition();
		},
		
		showWindows: function() {
			for(var x in this.factory.windows) {
				var window = this.factory.windows[x];
				if(window.visible) {
					window.open();
				}
			}
		},
		
		hideWindows: function() {
			for(var x in this.factory.windows) {
				var window = this.factory.windows[x];
				if(!window.visible) {
					window.close(false);
				}
			}
		},
		
		position: function() {			
			if(this.hasPosition()) {
				var pos = this.getPosition();
				this.ui.window.css({
					left: pos.x,
					top: pos.y,
					position: 'fixed'
				});
				this.savePosition();
			}		
		},	
		
		_buildButtonBar: function() {
			var t = this;
			
			this.ui.window = $([
				'<div class="'+this.classes.wrapper+'">',
					'<div class="'+this.classes.titleBar+'">'+this.title+'</div>',
					'<ul class="'+this.classes.list+'"></ul>',
				'</div>'
			].join(''))
			.css('z-index', 1);
			
			this.ui.titleBar = this.ui.window.find('.'+this.classes.titleBar);
			this.ui.list     = this.ui.window.find('.'+this.classes.list);
			
			this.factory.ui.dimmer.append(this.ui.window);
			
			this.ui.window.draggable({
				handle: this.ui.titleBar,
				containment: 'parent',
				scroll: false,
				start: function() {
					t.bringToFront();
				},
				stop: function(e) {
					t.savePosition();
				}
			});
			
			this.ui.titleBar.mousedown(function() {
				t.bringToFront();
			});
			
			this.position();
		}
		
	});
	
	PhotoFrame.Button = PhotoFrame.Class.extend({
		
		/**
		 * The PhotoFrame.ButtonBar object
		 */	
		 
		buttonBar: false,
		
		/**
		 * The class of the icon to use
		 */	
		 
		icon: false,
		
		/**
		 * The name of the button
		 */	
		 
		name: false,
		
		/**
		 * A description of what the button does
		 */	
		 
		description: false,	
		
		/**
		 * The DOM object
		 */	
		 
		$obj: false,
	
		/**
		 * The name of the package. If name, default to name property
		 */	
		 
		packageName: false,
		
		/**
		 * Should Photo Frame render the photo after removing the layer
		 */	
		 
		renderAfterRemovingLayer: true,
		
		/**
		 * The primary PhotoFrame.Window object 
		 */
		
		window: false,
		
		/**
		 * The JSON object used for Window settings 
		 */
		
		windowSettings: {
			css: '',
			title: false
		},
		
		/**
		 * Constructor method for the button
		 *
		 * @param	object  The PhotoFrame.ButtonBar object
		 * @param	object  A JSON object of options to override params
		 * @param	bool    If TRUE or undefined, the window will be built
		 * @return	object
		 */
		
		constructor: function(buttonBar, options, buildWindow) {
			var t = this;					
			
			if(typeof buildWindow === "undefined") {
				buildWindow = true;
			}
			
			this.ui  	   = {};
			this.buttonBar = buttonBar;
			this.base(options);
			this.$obj = $('<a href="#" title="'+this.description.replace('"', '')+'"></a>');
			this.$obj.append('<i />').find('i').addClass('icon-'+(this.icon ? this.icon : this.name.toLowerCase()));
			
			this.$obj.click(function(e) {
				t.click(e);
				e.preventDefault();
			});
			
			if(!this.packageName) {
				this.packageName = this.name;
			}

			if(buildWindow === true) {
				this.buildWindow();
			}
		},	
		
		getPackageName: function() {
			return (this.packageName ? this.packageName : this.name).toLowerCase();
		},

		/**
		 * Show the manipulation
		 *
		 * @return	void
		 */
		
		showManipulation: function() {
			this.cropPhoto().showManipulation(this.getPackageName());
		},
		
		/**
		 * Hide the manipulation
		 *
		 * @return	void
		 */
		
		hideManipulation: function() {
			this.cropPhoto().hideManipulation(this.getPackageName());
		},
		
		/**
		 * Add the manipulation
		 *
		 * @param	bool	If true, the manipulation will be visible
		 * @param	object  A JSON object used to build the effect
		 * @return	void
		 */
		
		addManipulation: function(visible, data) {
			this.cropPhoto().addManipulation(this.getPackageName(), visible, data);
		},
		
		/**
		 * Get the photo being cropped
		 *
		 * @return	object  PhotoFrame.Photo
		 */
		
		cropPhoto: function() {
			return this.buttonBar.factory.cropPhoto;
		},
		
		/**
		 * Update the manipulation JSON without an AJAX callback
		 *
		 * @return	void
		 */
		
		updateJson: function() {
			this.cropPhoto().updateJson();	
		},
		
		/**
		 * Render the manipulation
		 *
		 * @param	callback  A callback function triggered after the effects triggers
		 * @return	void
		 */
		
		render: function(callback) {
			this.cropPhoto().render(callback);	
		},
		
		/**
		 * Remove the manipulation
		 *
		 * @return	void
		 */
		
		removeManipulation: function() {
			delete this.buttonBar.factory.cropPhoto.manipulations[this.getPackageName()];
			this.buttonBar.factory.trigger('removeManipulation', this);
		},
		
		/**
		 * Bind an event
		 *
		 * @param	bool	  The name of the event used to bind the callback
		 * @param	callback  The function called with the bound event
		 * @return	void
		 */
		
		bind: function(event, callback) {
			this.buttonBar.factory.bind(event, callback);
		},
		
		/**
		 * Build the PhotoFrame.Window object
		 *
		 * @param	object  A JSON object used to build the effect
		 * @return	void
		 */
		
		buildWindow: function(options) {
			if(typeof options == "object") {
				this.windowSettings = $.extend(true, {}, this.windowSettings, options);
			}
			this.window = new PhotoFrame.Window(this.buttonBar.factory, this.$obj, this.windowSettings);
		},
		
		/**
		 * This method is triggered when the button is clicked
		 *
		 * @param	object  The event object
		 * @return	void
		 */
		
		click: function(e) {
			if(this.$obj.hasClass(this.buttonBar.classes.active)) {
				this.buttonBar.unclick();
				this.$obj.removeClass(this.buttonBar.classes.active);
				this.window.close();
			}
			else {
				this.buttonBar.click();
				this.$obj.addClass(this.buttonBar.classes.active);
				this.window.open();
			}			
		},
		
		/**
		 * Hide the window
		 *
		 * @param	callback  This callback is triggered when the window is hidden
		 * @return	void
		 */
		
		hideWindow: function(callback) {
			this.$obj.removeClass(this.buttonBar.classes.active);
			this.window.close();
		},
		
		/**
		 * Is button active (visible) in the tool bar?
		 *
		 * @return	bool
		 */

		isActive: function() {
		 	return true;
		},
		
		/**
		 * Show the window
		 *
		 * @param	callback  This callback is triggered when the window is hidden
		 * @return	void
		 */
		
		showWindow: function(callback) {		
			this.$obj.addClass(this.buttonBar.classes.active);		
			this.window.open();			
			this.window.position();
		},
		
		/**
		 * Get the manipulation visibility
		 *
		 * @return	bool
		 */
		
		getVisibility: function() {
			return this.getManipulation() ? this.getManipulation().visible : true;
		},
		
		/**
		 * Get the manipulation
		 *
		 * @return	mixed  Returns the manipulation object or FALSE is doesn't exist
		 */
		
		getManipulation: function() {
			if(this.cropPhoto()) {
				return this.cropPhoto().getManipulation(this.getPackageName());
			}
			return false;
		},
		
		/**
		 * Set the manipulation visibility to true or false
		 *
		 * @param	bool  True if visible, false for hidden
		 * @return	void
		 */
		
		setManipulation: function(visibility) {
			var m = this.getManipulation();
			m.visible = visibility;
		},
		
		/**
		 * This method is triggered when the layer is removed
		 *
		 * @return	void
		 */
		
		removeLayer: function() {
			this.reset();		
		},
		
		/**
		 * Start the rendering
		 *
		 * @param	callback  This callback is triggered when the photo starts rendering
		 * @return	void
		 */
		
		startRendering: function(callback) {
			this.cropPhoto().startRendering(callback);	
		},
		
		/**
		 * Stop the rendering
		 *
		 * @param	callback  This callback is triggered when the photo stops rendering
		 * @return	void
		 */
		
		stopRendering: function(callback) {
			this.cropPhoto().stopRendering(callback);	
		},
		
		/**
		 * This method is triggered when the photo starts being cropped
		 *
		 * @param	object  The PhotoFrame.Photo object
		 * @return	void
		 */
		
		startCrop: function(photo) {
			var m = this.getManipulation();	
			
			if(m) {
				if(m.visible) {
					this.enable();
				}
				else {
					this.disable();
				}
			}
		},
		
		/**
		 * This method toggles the layer's visibility and renders it
		 *
		 * @param	bool  The layer's visibility
		 * @param	bool  True to render the photo, false to skip rendering
		 * @return	void
		 */
		
		toggleLayer: function(visibility, render) {			
			if(!visibility) {
				this.disable();	
			}
			else {
				this.enable();
			}
			
			this.setManipulation(visibility);
			
			if(typeof render == "undefined" || render === true) {
				this.render();
			}
		},
		
		/**
		 * Get the data used for the save() method
		 *
		 * @return	object
		 */
		
		getData: function() {
			return {};
		},

		/**
		 * Get the settings object
		 *
		 * @return	object
		 */

		getSettings: function() {
		 	return this.buttonBar.factory.getSettings();
		},

		/**
		 * Get a single setting value
		 *
		 * @return	object
		 */

		getSetting: function(index) {
		 	return this.buttonBar.factory.getSetting(index);
		},
		
		/**
		 * Add a manipulation and save the refreshed JSON object.
		 * Note, this method is different than render().
		 *
		 * @return	object
		 */
		
		save: function(data, forceSave) {
			if(data.length > 0 || forceSave) {
				this.addManipulation(this.getVisibility(), data);
			}
			this.updateJson();
		},

		/**
		 * Apply the effect to the photo
		 *
		 * @return	void
		 */
		
		apply: function() {},
		
		/**
		 * Enable the button controls
		 *
		 * @return	void
		 */
		
		enable: function() {},
		
		/**
		 * Disable the button controls
		 *
		 * @return	void
		 */
		
		disable: function() {},
		
		/**
		 * Reset the button controls
		 *
		 * @return	void
		 */
		
		reset: function() {},

		/**
		 * Triggers each time the startCropCallback is called
		 *
		 * @return	void
		 */
		
		startCropCallback: function() {},

		/**
		 * Triggers each time the startCropCallbackFailed is called
		 *
		 * @return	void
		 */
		
		startCropCallbackFailed: function() {}
		
	});
		
	PhotoFrame.Window = PhotoFrame.Class.extend({
		
		/**
		 * An an array of button objects
		 */	
		 
		buttons: [],
			
		/**
		 * These are CSS classes appended to the window (string)
		 */
		
		css: '',
		
		/**
		 * An object of callback functions
		 */	
		 
		callbacks: {
			drag: function() {},
			dragstart: function() {},
			dragend: function() {},
			close: function() {},
			open: function() {}
		},
		
		/**
		 * An object of classes
		 */	
		 
		classes: {
			close: 'photo-frame-tool-window-close',
			title: 'photo-frame-tool-window-title',
			window: 'photo-frame-tool-window',
			content: 'photo-frame-tool-window-content',
			buttons: 'photo-frame-tool-window-buttons',
			button: 'photo-frame-tool-window-button',
			save: 'photo-frame-tool-window-save',
			wrapper: 'photo-frame-toolbar-tools'
		},
		
		/**
		 * The animation duration
		 */	
		 
		duration: 333,
		
		/**
		 * The easeIn animation
		 */	
		 
		easeIn: 'easeInElastic',
		
		/**
		 * The easeOut animation
		 */	
		 
		easeOut: 'easeOutElastic',
		
		/**
		 * The parent PhotoFrame.Factory object
		 */	
		 
		factory: false,
		
		/**
		 * An object of icon classes
		 */	
		 
		icons: {
			close: 'icon-cancel'	 
		},
		 
		/**
		 * The parent jQuery obj used to position the window
		 */
		
		parent: false,
		 
		/**
		 * The window title
		 */
		
		title: false,
			
		/**
		 * The children DOM object
		 */	
		 
		ui: {
			close: false,
			content: false,
			title: false,
			window: false	
		},
			
		/**
		 * The window width (int)
		 */	
		 
		width: false,
		
		constructor: function(factory, parent, options) {
			this.ui      = {};
			this.factory = factory;
			this.parent  = parent;
			
			this.base(options);	
			
			if(!this.title) {
				this.title = 'New Window '+this.factory.windows.length;
			}
						
			this.buildWindow();
			
			this.visible = this.getVisibility();
			
			factory.windows.push(this);
		},
		
		bringToFront: function() {
			this.factory.zIndexCount++;
			this.ui.window.css('z-index', this.factory.zIndexCount);
		},
		
		buildButtons: function() {
		
			var t = this;
			
			$.each(this.buttons, function(i, button) {
				var css  = button.css ? button.css : '';
				var text = button.text ? button.text : '';
				var icon = button.icon ? '<i class="'+button.icon+'"></i>' : '';
				var $btn = $('<a href="#" class="'+css+' '+t.classes.button+'">'+icon+text+'</a>');
				
				button.ui = {
					button: $btn
				}
				
				if(typeof button.init === "function") {
					button.init(button);
				}
				
				if(typeof button.onclick === "function") {
					$btn.click(function(e) {
						button.onclick(e, button);
						e.preventDefault();
						return false;
					});
				}
				
				t.ui.buttons.append($btn);
			});
		},
		
		buildWindow: function() {			
			var t    = this;					
			var html = $([
				'<div class="'+this.classes.wrapper+' '+this.classes.window+'">',
					'<a href="#" class="'+this.classes.close+'"><i class="'+this.icons.close+'"></i></a>',
					'<div class="'+this.classes.title+'">'+(this.title ? this.title.ucfirst() : 'N/A')+'</div>',
					'<div class="'+this.classes.content+'"></div>',
					'<div class="'+this.classes.buttons+' '+this.factory.classes.clearfix+'"></div>',
				'</div>'
			].join(''));
			
			this.ui.window  = html;
			this.ui.buttons = html.find('.'+this.classes.buttons);
			this.ui.close   = html.find('.'+this.classes.close);
			this.ui.content = html.find('.'+this.classes.content);
			this.ui.title   = html.find('.'+this.classes.title);
			
			this.ui.window.addClass(this.css);
			
			this.ui.window.draggable({
				handle: this.ui.title,
				containment: 'parent',
				scroll: false,
				drag: this.callbacks.drag,
				start: function(e) {
					t.bringToFront();
					t.callback(t.callbacks.dragstart, e);
				},
				stop: function(e) {
					t.savePosition();
					t.callback(t.callbacks.dragend, e);
				}
			});
			
			if(this.width) {
				this.ui.window.width(this.width);
			}
			
			this.ui.window.mousedown(function() {
				t.factory.trigger('windowMousedown', t);
				t.bringToFront();
			})
			
			this.ui.close.click(function(e) {
				t.close();
				e.preventDefault();
			});
			
			this.buildButtons();
			this.factory.ui.dimmer.append(html);
		},
		
		close: function(save, callback) {	
			var t = this;
			
			if(typeof save == "undefined") {
				save = true;
			}
			else if(typeof save == "function") {
				callback = save;
				save = true;
			}
			
			this.parent.removeClass(this.factory.buttonBar.classes.active);			
			this.ui.window.fadeOut({
				duration: this.duration
			}, function() {
				t.callback(t.callbacks.close);
				t.callback(callback);
			});
			
			if(save) {
				this.setVisibility(false);
			}
		},
		
		open: function(save, callback) {
			var t = this;
			
			this.factory.trigger('windowOpenBegin', this);
			
			if(typeof save == "undefined") {
				save = true;
			}
			else if(typeof save == "function") {
				callback = save;
				save = true;
			}
			
			this.parent.addClass(this.factory.buttonBar.classes.active);
			
			this.ui.window.fadeIn({
				duration: this.duration,
				//easing: this.easeIn
			})
			.css('display', 'inline-block')
			.css('position', 'fixed');
			
			setTimeout(function() {
				t.callback(t.callbacks.open);
				t.callback(callback);
				t.factory.trigger('windowOpenEnd', t);
			}, this.duration);
			
			if(this.ui.window.data('open') != 1) {
				this.position();
			}
			
			this.bringToFront();	
			this.ui.window.data('open', 1);
			this.setVisibility(true);
			this.savePosition();			
		},
		
		position: function() {			
			var left, index  = parseInt(this.ui.window.parent().index()) + 1;
			
			var pos = this.getPosition();
			var x   = pos ? parseInt(pos.x.replace('px', '')) : 0;
			
			this.ui.window.position({
				of: this.parent,
				my: 'left top',
				at: 'right top',
				collision: 'flip'
			});
					
			if(x+this.ui.window.width() > $(window).width()) {
				pos.x = ($(window).width() - this.ui.window.width()) + 'px';
			}
					
			if(this.hasPosition()) {
				this.ui.window.css({
					left: pos.x,
					top: pos.y
				})
				.position('collision', 'fit');
			}
			else {	
				var width = 16;
				
				if(index % 2 == 0) {
					this.shift('left', width);
				}		
				
				this.shift('left', width);
			}

			this.bringToFront();
			this.savePosition();	
		},
				
		shift: function(prop, value) {
			var current = parseInt(this.ui.window.css(prop).replace('px', ''));
			
			this.ui.window.css(prop, current+value);
		},
		
		isOpen: function() {
			return this.ui.window.css('display') == 'none' ? false : true;
		},
		
		toggle: function() {
			if(this.isOpen()) {
				this.close();
			}
			else {
				this.open();
			}
		}	
	});

	PhotoFrame.Photo = PhotoFrame.Class.extend({
			
		/**
		 * The random string used to cache the photo
		 */			 
		
		cache: false,
			
		/**
		 * The cached photo URL. This property is set in the render() callback
		 */			 
		
		cacheUrl: false,
			
		/**
		 * Image Compression (1-100)
		 */	
		 
		compression: 100,
		 
		/**
		 * Crop Settings
		 */
		 
		cropSettings: {},
		
		/**
		 * Photo Description
		 */	
		 
		description: '',
		 	
		/**
		 * Disable users from cropping photos?
		 */		
		 
		disableCrop: false,
		
		/**
		 * Is this photo being edit? If false, then a new photo
		 */	
		 
		edit: false,
		 
		/**
		 * The Photo Frame Factory object
		 */	
		
		factory: false,
			 
		/**
		 * Force users to crop new photos?
		 */		
		 
		forceCrop: true,
		 
		/**
		 * Photo Index
		 */	
		 
		index: false,
		
		/**
		 * Has the photo cropping been initialized?
		 */	
		 
		initialized: false,
		
		/**
		 * Photo ID
		 */	
		 
		id: false,
			
		/**
		 * jCrop object
		 */	
		 
		jcrop: false,
		
		/**
		 * Photo Keywords
		 */	
		 
		keywords: '',
		
		/**
		 * Image Manipulations
		 */
		 
		manipulations: {},
		 
		/**
		 * Original Image Manipulation
		 */
		 
		originalManipulations: {},
		 
		/**
		 * The original file path
		 */
		 
		originalPath: false,
		 
		/**
		 * The original file URL
		 */
		 
		originalUrl: false,
		 
		/**
		 * The framed file path
		 */
		 
		path: false,
		 
		/**
		 * The framed file path
		 */
		 
		rendering: false,
		 
		/**
		 * Default Crop Size
		 */
		 
		size: false,
		
		/**
		 * Photo Title
		 */	
		 
		title: '',
		 		
		/**
		 * An object of UI elements
		 */	
		 
		ui: {
			actionBar: false,
			edit: false,
			del: false,
			image: false,
			photo: false,
			rendering: false,
			saving: false
		},
					
		/**
		 * The photo URL
		 */
		 
		url: false,
		
		/**
		 * use the cache image?
		 */
		 
		useCache: false,
		 			
		/**
		 * Has the crop utility been released?
		 */
		 
		released: false,
				
		/**
		 * The wrapping DOM object
		 */
		 
		$wrapper: false,
		
		/**
		 * Constructor to set the options and UI events.
		 *
		 * @param object  The wrapper object
		 * @param object  An array of options to be set
		 */	
		 	
		constructor: function(factory, response, options) {
			var t = this;
			
			this.ui       = {};
			this.$wrapper = false
			this.cache    = factory.hash(12);
			
			this.base(options);

			this.factory      = factory;
		    this.title        = response.title;
		    this.description  = response.description;
		    this.keywords     = response.keywords;
			this.response     = response;
			this.originalPath = response.original_path;
			this.originalUrl  = response.original_url;
			this.url          = response.url;
			this.path         = response.file_path;
			
			this.ui.rendering	  = this.factory.ui.crop.find('.'+this.factory.classes.renderBg);
			this.ui.renderingTxt  = this.factory.ui.crop.find('.'+this.factory.classes.renderText);
			
			if(!this.manipulations) {
				this.manipulations = {};
			}
			
			if(!this.index) {
				this.index = this.factory.getTotalPhotos();
			}

			if(this.$wrapper) {
				this._loadFromObj(this.$wrapper);
			}
			else {
				this._bindClickEvents();
			}
			
			factory.photos.push(t);
		},
		
		_loadFromResponse: function(response, callback) {
			var t    = this;
			var html = $([
			    '<li>',
    				'<div class="'+t.factory.classes.photo+'" id="'+t.factory.classes.photo+'-'+t.factory.fieldId+'-'+t.index+'">',			
    					'<div class="'+t.factory.classes.actionBar+'">',
    						(!t.factory.disableCrop ? '<a href="#'+t.index+'" class="'+t.factory.classes.editPhoto+'"><span class="'+t.factory.icons.editPhoto+'"></span></a>' : ''),
    						'<a href="#'+t.index+'" class="'+t.factory.classes.deletePhoto+'"><span class="'+t.factory.icons.deletePhoto+'"></span></a>',
    					'</div>',
    				'</div>',
				'</li>'
			].join(''));
			
			t.load(response.file_url, function(img) {
				var obj = html.find('.'+t.factory.classes.photo);
				
				if(!t.cachePath) {
					t.cachePath = response.directory.server_path + t.cache + '.' + t.extension(response.file_name);
				}

				t._sendCropRequest(function(cropResponse) {
					obj.prepend(img).append(t._generateNewDataField(cropResponse.save_data));
					t.factory.ui.preview.find('ul').append(html);
					t._loadFromObj(obj, callback);
				});				
			});
		},
		
		_loadFromObj: function(obj, callback) {
			var t    = this;
			
			t.edit 		   = t;	
			t.ui.photo 	   = $(obj);
			t.ui.parent    = t.ui.photo.parent();
			t.ui.actionBar = t.ui.parent.find('.'+t.factory.classes.actionBar);
			t.ui.edit	   = t.ui.actionBar.find('.'+t.factory.classes.editPhoto);
			t.ui.del	   = t.ui.actionBar.find('.'+t.factory.classes.deletePhoto);
			t.ui.field     = t.ui.photo.find('textarea');
			
			t._bindClickEvents();
			
			if(typeof callback == "function") {
				callback();
			}
		},
		
		_bindClickEvents: function() {
			var t = this;
			
			if(t.ui.edit) {
				t.ui.edit.unbind('click').click(function(e) {
					t.showProgress(0);
					t.startCrop();					
					e.preventDefault();
				});
			}
			
			if(t.ui.del) {
				t.ui.del.unbind('click').click(function(e) {
					t.remove();									
					e.preventDefault();
				});
			}
		},
		
		extension: function(filename) {
			return filename.split('.').pop();
		},
		
		remove: function() {
			var t = this;
			
			t.ui.field.remove();
			
			if(t.id !== false) {
				t.factory.$wrapper.append('<input type="hidden" name="photo_frame_delete_photos['+t.factory.delId+'][]" value="'+t.id+'" />');
			}
					
			t.ui.parent.fadeOut(function() {
				t.ui.parent.remove();

				if((t.factory.maxPhotos > 0 && t.factory.maxPhotos > t.factory.getTotalPhotos() - 1) || (t.factory.minPhotos == 0 && t.factory.maxPhotos == 0)) {
					t.factory.showUpload();
				}
				else {
					t.factory.hideUpload();
				}
				
				t.factory.photos[t.index] = false;								
			});
		},
		
		hideManipulation: function(title) {			
			var name   = title.toLowerCase();
			var exists = this.manipulations[name] ? this.manipulations[name] : false;
			if(this.manipulations[name]) {
				this.manipulations[name].visible = false;
			}
			this.factory.trigger('hideManipulation', this, name, exists);
		},
		
		showManipulation: function(title) {			
			var name   = title.toLowerCase();
			var exists = this.manipulations[name] ? this.manipulations[name] : false;
			if(this.manipulations[name]) {
				this.manipulations[name].visible = true;
			}
			this.factory.trigger('showManipulation', this, name, exists);
		},
		
		addManipulation: function(title, visibility, data) {
			var name   = title.toLowerCase();
			var exists = this.manipulations[name] ? this.manipulations[name] : false;
			
			if(data) {
				this.manipulations[name] = {
					visible: visibility,
					data: data
				};		
			}	
			
			this.factory.trigger('addManipulation', this, name, exists);
		},
		
		getManipulation: function(name) {
			name = name.toLowerCase();
			if(this.manipulations[name]) {
				return this.manipulations[name];
			}	
			return false;
		},
		
		getManipulations: function() {
			return this.manipulations;	
		},
		
		showMeta: function() {
			this.factory.showMeta();	
		},
		
		hideMeta: function() {
			this.factory.hideMeta();	
		},
		
		hideInstructions: function() {
			this.factory.hideInstructions();
		},
		
		initJcrop: function(callback, debug) {
			var t = this;
			
			t.factory.ui.toolbar.show();
			
			if(t.initialized) {
				t.destroyJcrop();
			}

            t.cropSettings.onChange = function() {
            	t.hideInstructions();
	          	t.updateInfo();	
	            this.released = false;
	            t.factory.trigger('jcropOnChange', this);
            };
            
            t.cropSettings.onRelease = function() {
	            this.released = true;            	
	            t.factory.trigger('jcropOnRelease', this);
            };
            
            t.cropSettings.onSelect = function() {
	            this.released = false;	            
	            t.factory.trigger('jcropOnSelect', this);
            }
            
			if(t.cropSettings.setSelect) {
				var size = 0;
				
				for(var x in t.cropSettings.setSelect) {
					size += t.cropSettings.setSelect[x];
				}
				
				if(size == 0) {
					delete t.cropSettings.setSelect;
				}
			}
			
			t.ui.cropPhoto.Jcrop(t.cropSettings, function() {
				t.jcrop = this;
	            if(typeof callback == "function") {
		            callback(this);
	            }
	        });
        
			t.initialized = true;
		},
		
		destroyJcrop: function() {
			if(this.jcrop) {
				this.jcrop.destroy();
			};
			
			this.jcrop 	     = false;
			this.initialized = false;
		},
		
		releaseCrop: function() {
			this.jcrop.setSelect([0, 0, 0, 0]);
			this.jcrop.release();
			this.released = true;
		},
			
		hideProgress: function() {
			this.factory.hideProgress();
		},
		
		showProgress: function() {
			this.factory.showProgress();
		},
		
		clearNotices: function(callback) {
			this.factory.clearNotices(callback);
		}, 

		getSaveData: function() {
			if(this.ui.field) {
				return this.ui.field.val();
			}
			else  {
				return false;
			}
		},

		setSaveData: function(data) {
			if(this.ui.field) {
				this.ui.field.val(data).html(data);
			}
		},

		updateJson: function() {
			var saveData = this.jsonEncode(this.getSaveData());

			saveData.manipulations = this.getManipulations();

			this.setSaveData(this.jsonDecode(saveData));
		},
		
		render: function(callback) {
			var t = this;
			
			if(!this.isRendering() && t.ui.cropPhoto) {
				this.startRendering();
				this.useCache = true;
				
				$.post(PhotoFrame.Actions.render, 
					{
						fieldId: this.factory.fieldId,
						colId: this.factory.colId,
						varId: this.factory.varId,
						gridId: this.factory.gridId,
						path: this.path,
						// url: this.url,
						originalPath: this.originalPath,
						originalUrl: this.originalUrl,
						cachePath: this.cachePath,
						cacheUrl: this.cacheUrl,
						cache: this.cache,
						manipulations: t.getManipulations(),
						directory: this.factory.directory,
						preview: true
					}, function(data) {
						t.cacheUrl = data.url;
						t.load(data.url, function(img) {			
							t.ui.cropPhoto.html(img); 
							t.stopRendering();
							t.callback(callback, data);
							t.factory.trigger('render');
						});
					}
				);
			}
			else {
				t.callback(callback);
			}
		},
		
		totalManipulations: function() {
			var count = 0;
			
			for(var x in this.manipulations) {
				count++;
			}
			
			return count;
		},
		
		needsRendered: function() {
			var total = this.totalManipulations();
			
			if(!total || total == 1 && this.manipulations['crop']) {
				return false;
			}
			
			if(total > 0) {
				return true;
			}
		},
		
		needsRendering: function() {
			return this.needsRendered();	
		},
		
		isRendering: function() {
			return this.rendering;	
		},
		
		startRendering: function(callback) {
			this.rendering = true;
			this.factory.trigger('startRendering');
			this.factory.ui.dimmer.addClass(this.factory.classes.rendering);
			this.callback(callback);
		},
		
		stopRendering: function(callback) {
			this.rendering = false;
			this.factory.trigger('stopRendering');
			this.factory.ui.dimmer.removeClass(this.factory.classes.rendering);
			this.callback(callback);
		},
		
		tellScaled: function() {
			if(this.jcrop) {
				return this.jcrop.tellScaled();
			}
			return [0,0,0,0];
		},
		
		/*
		setScale: function(scale) {
			if(scale) {
				t.scale = scale;
			}	
				
			if(t.scale != 1) {
		        var img = t.ui.cropPhoto.find('img');
		        var w = parseInt(img.css('width').replace('px', ''));
		        var h = parseInt(img.css('height').replace('px', ''));
		        
		        w = w * t.scale;
		        h = h * t.scale;
		        	            
		        img.css({
		           width: w,
		           height: h 
		        });
		        
		        $(window).resize();
	        }
		},
		*/
		
		updateInfo: function() {
			var t = this;
			
			if(t.factory.ui.info) {		
				var crop = t.cropDimensions();		
				var aspect = crop.a;
				
				t.factory.ui.info.fadeIn();
				t.factory.ui.info.find('.size .width').html(Math.ceil(crop.w)+'px');
				t.factory.ui.info.find('.size .height').html(Math.ceil(crop.h)+'px');
				t.factory.ui.info.find('.aspect').html('('+aspect[0]+':'+aspect[1]+')');
				t.factory.ui.info.find('.x').html(Math.ceil(crop.x)+'px');
				t.factory.ui.info.find('.x2').html(Math.ceil(crop.x2)+'px');
				t.factory.ui.info.find('.y').html(Math.ceil(crop.y)+'px');
				t.factory.ui.info.find('.y2').html(Math.ceil(crop.y2)+'px');
				
				var errors = t.validate(true);
				
				t.factory.ui.info.find('.width').removeClass(t.factory.classes.invalid);
				t.factory.ui.info.find('.height').removeClass(t.factory.classes.invalid);
				t.factory.ui.info.find('.aspect').removeClass(t.factory.classes.invalid);
				
				if(!errors.validWidth) {
					t.factory.ui.info.find('.width').addClass(t.factory.classes.invalid);
				}
				
				if(!errors.validHeight) {
					t.factory.ui.info.find('.height').addClass(t.factory.classes.invalid);
				}
				
				if(!errors.validRatio) {
					t.factory.ui.info.find('.aspect').addClass(t.factory.classes.invalid);
				}
			}	
			
            if(t.factory.ui.instructions && t.factory.ui.instructions.css('display') != 'none') {	            
	            if(t.factory.initialized) {
	            	t.factory.ui.instructions.fadeOut();
	            }            
            }
		},
		
		load: function(file, callback) {
			if(typeof file == "function") {
				callback = file;
				file = this.photoUrl();
			}
			window.loadImage(file, function(img) {
				if(typeof callback == "function") {
					callback(img);
				}
			});	
		},
		
		photoUrl: function() {	
			return this.useCache ? this.cacheUrl : this.originalUrl;	
		},
		
		startCrop: function(callback) {
		    			    	
			this.factory.cropPhoto = this;
			
			var t   = this;
			var obj = {
				fieldId: this.factory.fieldId ? this.factory.fieldId : false,
				varId: this.factory.varId ? this.factory.varId : false,
				colId: this.factory.colId ? this.factory.colId : false,
				gridId: this.factory.gridId ? this.factory.gridId : false,
				cache: this.cache,
				//url: this.originalUrl,
				originalUrl: this.originalUrl,
				originalPath: this.originalPath,
				exifData: this.response.exif_string ? this.response.exif_string : '',
				//path: this.factory.directory.server_path,
				manipulations: this.manipulations,
				directory: this.factory.directory
			};
			
			t.originalManipulations = $.extend(true, {}, t.manipulations);
			
			if(t.factory.buttonBar) {
				$.each(t.factory.buttonBar.buttons, function(i, button) {
					button.reset();	
				});
			}
			
	        t.factory.trigger('startCropBegin', t);
	        
			t.factory.ui.dimmer.fadeIn('fast');
			
			if(!t.initialized) {
				t.factory.ui.cropPhoto.remove();
			}
			
			t.factory.resetMeta();
			
			//t.factory.showProgress();
				
			$.post(PhotoFrame.Actions.start_crop, obj, function(response) {
			
				if(response.success) {
					t.factory.showProgress(100, function() {
						
						t.useCache  = true;
						t.cacheUrl  = response.cacheUrl;
						t.cachePath = response.cachePath;
						
						if(response.success) {
							$.each(t.factory.buttonBar.buttons, function(i, button) {
								button.startCropCallback(t, obj, response.data);
							});
							t.factory.trigger('startCropCallback', t, obj, response.data);
						}
						else {
							$.each(t.factory.buttonBar.buttons, function(i, button) {
								button.startCropCallbackFailed(t, obj, response.data);
							});
							t.factory.trigger('startCropCallbackFailed', t, obj, response);
						}
						
						t.load(t.photoUrl(), function(img) {
							
							t.factory.hideProgress();
							
							t.ui.cropPhoto = $('<div class="'+t.factory.classes.cropPhoto+'"></div>');
							t.factory.ui.cropPhoto = t.ui.cropPhoto;
							t.factory.trigger('cropPhotoLoaded', t, img);
				        	t.ui.instructions = $('<div class="" />').html(PhotoFrame.Lang.instructions);	
				        	
				        	if(t.factory.settings.photo_frame_hide_instructions != 'true') {
					        	if(t.factory.instructions && t.edit === false) {
					        		t.factory.ui.instructions = $('<div class="'+t.factory.classes.instructions+'" />').html(t.factory.instructions);
					        		t.factory.ui.dimmer.append(t.factory.ui.instructions);
					        	}
					        	else {
					        		if(t.factory.ui.instructions) {
						        		t.factory.ui.instructions.hide();
						        	}
					        	}
					        }
				        	
				            t.ui.cropPhoto.html(img);	            
					        t.factory.ui.crop.prepend(t.ui.cropPhoto);         	
				            t.factory.ui.crop.center();
				            t.factory.ui.crop.show();
				        	   	
				            t.hideMeta();
				            
				            if(t.factory.buttonBar && t.factory.buttonBar.getVisibility()) {
					            t.factory.showTools();
				            }
				            
				            if(t.edit === false && t.size !== false) {
				            	var size = t.size.split('x');
				            	
				            	size[0] = parseInt(size[0]);
				            	size[1] = parseInt(size[1]);
				            	
				           		var x  = (t.ui.cropPhoto.width()  / 2) - (size[0] / 2);
				           		var x2 = x + size[0];
				           		var y  = (t.ui.cropPhoto.height() / 2) - (size[1] / 2);
				           		var y2 = y + size[1];
				           		
				           		t.cropSettings.setSelect = [x, y, x2, y2];
				            }
				            
			            	if(t.title) {
				        		t.factory.ui.metaTitle.val(t.title);
				        	}
					        	
				        	if(t.keywords) {
				        		t.factory.ui.metaKeywords.val(t.keywords);
				        	}
				        	
				        	if(t.description) {
				        		t.factory.ui.metaDescription.val(t.description);
				        	}
				        	
				            t.initJcrop(callback);
				            
				        	t.updateInfo();
				        	
				            $(window).resize();
				            if(t.factory.buttonBar) {
					            for(var x in t.factory.buttons) {				            
						            t.factory.buttonBar.buttons[x].startCrop(t);
					            }
				            }
				            if(t.needsRendered()) {
					            t.render(function() {
					            	t.factory.trigger('startCropEnd', t);
					            });
				            }
				            else {
					           t.factory.trigger('startCropEnd', t);
				            }
						});
							
					});
				}
				else {
					if(response.errors) {
						t.factory.showErrors(response.errors);
					}
					else {
						t.log(response);
						t.factory.showErrors([PhotoFrame.Lang.unexpected_error]);
					}
				}
			});
			
			t.factory.ui.save.unbind('click').bind('click', function(e) {
				
				if(t.factory.showMetaOnSave && t.factory.ui.meta.css('display') == 'none') {
	    			var errors = t.validate();
	    		
	    			if(errors.length == 0) {
			    		t.showMeta();
			    	}
			    	else {
				    	t.factory.notify(errors);
			    	}
		    	}
		    	else {
		    		t.hideMeta();		    		
			    	t.saveCrop();
		    	}

		    	e.preventDefault();
			});
			
			t.factory.ui.cancel.unbind('click').click(function(e) {
				
				t.clearNotices();				
				t.hideMeta();
				t.hideProgress();
				
				t.manipulations  = $.extend(true, {}, t.originalManipulations);
				t.factory.cancel = true;
				t.render();
				t.factory.hideDimmer();
				t.factory.resetProgress();
				
				if(t.factory.cropPhoto) {
					t.factory.cropPhoto.destroyJcrop();	
				}	
				
				if(t.ui.saving) {
					t.ui.saving.fadeOut(function() {
						$(this).remove();
					});
				}
				
				t.factory.trigger('cancel', t);
												
				e.preventDefault();
			});
		},
		
		save: function(saveData) {
			var t 	 = this;			
			var date = new Date();
			var edit = t.edit;
			
			this.factory.trigger('saveBegin', this);
			
			if(!edit) {			
				t._createPhoto(saveData);
			}
			else {				
				t._updatePhoto(saveData);	
			}
			
			t.load(t.cropResponse.url, function(img) {
				if(t.factory.maxPhotos > 0 && (t.factory.maxPhotos <= t.factory.getTotalPhotos())) {
					t.factory.hideUpload();
				}	
				
				if(!edit) {					    
					t.factory.ui.preview.find('ul').append(t.ui.parent);
				}
	       		
	       		t.ui.photo.find('img').remove();
	       		t.ui.photo.append(img);
	       		
				if(t.ui.saving) {			
					t.ui.saving.remove();
				}
				
				t.hideProgress();
				t.hideDimmer();
				
				t.factory.trigger('saveEnd', t);
			});
		},
		
		hideDimmer: function() {
			this.factory.hideDimmer();
		},
		
		_createPhoto: function(saveData) {	
			var t    = this;	
			var html = $([
			    '<li>',
    				'<div class="'+t.factory.classes.photo+'" id="'+t.factory.classes.photo+'-'+t.factory.fieldId+'-'+t.index+'">',			
    					'<div class="'+t.factory.classes.actionBar+'">',
    						'<a href="#'+t.index+'" class="'+t.factory.classes.editPhoto+'"><span class="'+t.factory.icons.editPhoto+'"></span></a>',
    						'<a href="#'+t.index+'" class="'+t.factory.classes.deletePhoto+'"><span class="'+t.factory.icons.deletePhoto+'"></span></a>',
    					'</div>',
    				'</div>',
				'</li>'
			].join(''));
			
			t.edit 		   = t;	
			t.ui.parent    = $(html);
			t.ui.photo 	   = t.ui.parent.find('.'+t.factory.classes.photo);
			t.ui.actionBar = t.ui.parent.find('.'+t.factory.classes.actionBar);
			t.ui.edit	   = t.ui.actionBar.find('.'+t.factory.classes.editPhoto);
			t.ui.del	   = t.ui.actionBar.find('.'+t.factory.classes.deletePhoto);
			t.ui.field     = t._generateNewDataField(saveData);
			
			t.ui.photo.append(t.ui.field);	

			t._bindClickEvents();
		},
		
		_generateNewDataField: function(saveData) {
			return $('<textarea name="'+this.factory.fieldName+'[][new]" id="'+this.factory.classes.editPhoto+'-'+this.factory.fieldId+'-'+this.index+'" style="display:none">'+saveData+'</textarea>');
		},
		
		_updatePhoto: function(saveData) {
			this.ui.field.val(saveData).html(saveData);
		},
		
		saveCrop: function() {
			var t    = this;
			
			this.factory.trigger('saveCropStart', t);
			
			var errors = t.validate();
			  
			if(errors.length > 0) {
				t.factory.notify(errors);
			}
			else {
				t.clearNotices();
				
				t.ui.saving = $('<div class="'+t.factory.classes.saving+'"><span></span> '+PhotoFrame.Lang.saving+'</div>');
				
				t.factory.ui.dimmer.append(t.ui.saving);			
				t.factory.ui.dimmer.find('.'+t.factory.classes.saving+' span').activity();			
				t.factory.ui.crop.fadeOut();
				
				if(t.ui.info) {
					t.ui.info.fadeOut();
				}
				
				t.hideMeta();
				t.ui.saving.center();
				
				t.title       = t.factory.ui.metaTitle.val();
				t.description = t.factory.ui.metaDescription.val();
				t.keywords    = t.factory.ui.metaKeywords.val();
				
				t._sendCropRequest(function(cropResponse) {
					t.cropResponse      = cropResponse;
					t.factory.cropPhoto = false;
					t.destroyJcrop();		
					t.save(cropResponse.save_data);	
					t.factory.trigger('saveCropStop', t, cropResponse);
				});
			}
		},
		
		_sendCropRequest: function(response, callback) {
			if(typeof response == "function") {
				callback = response;
				response = false;
			}
			
			if(!response) {
				var response = this.response;
			}
			
			var t = this;
					
			var _defaultSize = {
    			 x: 0,
    			 y: 0,
    			x2: 0,
    			y2: 0,
    			 w: 0,
    			 h: 0
    		};
    		
    		var size = t.released ? _defaultSize : t.tellScaled();
    		
    		if(!size.w || !size.h || this.factory.settings.photo_frame_disable_regular_crop === 'true') {
    			size = _defaultSize;
	    		delete t.cropSettings.setSelect;
    		}
    		else {
    			t.cropSettings.setSelect = [size.x, size.y, size.x2, size.y2];
    		}

			$.post(PhotoFrame.Actions.crop_photo, {
				fieldId: t.factory.fieldId,
				varId: t.factory.varId,
				colId: t.factory.colId,
				gridId: t.factory.gridId,
				cache: t.cache,
				useCache: t.useCache,
				cacheUrl: t.cacheUrl ? t.cacheUrl : response.file_url,
				cachePath: t.cachePath ? t.cachePath : response.file_path,
				id: t.factory.directory.id,
				assetId: t.response.asset_id,
				index: t.factory.index,
				photo_id: t.id,
				image: response.file_path,
				name: response.file_name,
				manipulations: t.manipulations,
				directory: t.factory.directory,
				original: response.original_path,
				original_file: response.original_file,
				exifData: response.exif_string,
				url: response.url,
				edit: t.edit !== false ? true : false,
				height: size.h,
				width: size.w,
				scale: t.scale,
				rotate: t.rotate,
				resize: t.resize,
				resizeMax: t.resizeMax,
				x: size.x,
				x2: size.x2,
				y: size.y,
				y2: size.y2,
				title: t.title,
				description: t.description,
				keywords: t.keywords,
				compression: t.compression
			}, function(cropResponse) {
				if(typeof callback == "function") {
					callback(cropResponse);		
				}
			});
		},
		
		isCropped: function(cropSize) {
			
			if(!cropSize) {
				var cropSize = this.cropDimensions();
			}
			
			if(!cropSize && this.jcrop.tellSelect) {
				var cropSize = this.jcrop.tellScalled();
			}
			
			if(this.factory.ui.dimmer.find('.jcrop-tracker').width() == 0) {
				return false;
			}
			
			return typeof cropSize == "undefined" || cropSize.x || cropSize.y || cropSize.x2 || cropSize.y2 ? true : false;	
		},
		
		reduce: function(numerator, denominator) {
			var gcd = function gcd (a, b) {
	            return (b == 0) ? a : gcd (b, a%b);
	        }
			
			gcd = gcd(numerator,denominator);
			
			return [numerator/gcd, denominator/gcd];
		},
		
		cropDimensions: function(cropSize) {
			var defaultCropSize = {
				w: 0,
				h: 0,
				x: 0,
				x2: 0,
				y: 0,
				y2: 0
			}
				
			if(!cropSize && this.jcrop.tellSelect) {
				var cropSize = this.jcrop.tellSelect();
			}
			else {
				var cropSize = defaultCropSize;
			}
			
			var image = {
				w: this.ui.cropPhoto.find('img').width(),
				h: this.ui.cropPhoto.find('img').height()
			};
			
			cropSize.w = cropSize.w == 0 ? image.w : cropSize.w;
			cropSize.h = cropSize.h == 0 ? image.h : cropSize.h;
			
			if(!this.cropSettings.aspectRatio) {
				var aspect = this.reduce(Math.ceil(cropSize.w), Math.ceil(cropSize.h));
			}
			else {
				var aspect = this.cropSettings.aspectRatioString.split(':');
				
				if(typeof aspect[0] == "undefined") {
					aspect[0] = 0;
				}	
				
				if(typeof aspect[1] == "undefined") {
					aspect[1] = 0;
				}	
				
				if(!this.isCropped(cropSize)) {
					aspect = [cropSize.w, cropSize.h];	
				}
				
				aspect = this.reduce(aspect[0], aspect[1]);
			}
			
			if(!this.isCropped(cropSize)) {
				cropSize   = defaultCropSize;
				cropSize.w = image.w;
				cropSize.h = image.h;
				
				aspect = this.reduce(image.w, image.h);
			};
			
			cropSize.a = aspect;		
			
			return cropSize;
		},
		
		round: function(number, place) {
			if(!place) {
				var place = 100;
			}
			return Math.round(number * place) / place;
		},
		
		aspectRatio: function(d) {
		    var df = 1, top = 1, bot = 1;
		    var limit = 1e5; //Increase the limit to get more precision.
		 
		    while (df != d && limit-- > 0) {
		        if (df < d) {
		            top += 1;
		        }
		        else {
		            bot += 1;
		            top = parseInt(d * bot, 10);
		        }
		        df = top / bot;
		    }
		  
		    return top + '/' + bot;
		},
		
		width: function() {
			return this.ui.cropPhoto ? this.ui.cropPhoto.find('img').width() : 0;
		},
		
		height: function() {
			return this.ui.cropPhoto ? this.ui.cropPhoto.find('img').height() : 0;
		},
		
		validate: function(json) {
			var t = this;
			
			if(!json) {
				var json = false;	
			}
			
			var ratio       = t.cropSettings.aspectRatio ? t.cropSettings.aspectRatio : false;
			var cropSize    = t.cropDimensions();
			
			var cropWidth   = cropSize.w;
			var cropHeight  = cropSize.h;
			var minWidth    = t.cropSettings.minSize ? t.cropSettings.minSize[0] : 0;
			var minHeight   = t.cropSettings.minSize ? t.cropSettings.minSize[1] : 0;
			var maxWidth    = t.cropSettings.maxSize ? t.cropSettings.maxSize[0] : 0;
			var maxHeight   = t.cropSettings.maxSize ? t.cropSettings.maxSize[1] : 0;
			var isCropped   = t.isCropped(cropSize);
			
			var height      = Math.ceil(cropSize.h);
			var width       = Math.ceil(cropSize.w);
			var errors      = [];
			var imgWidth    = Math.ceil(this.width());
			var imgHeight   = Math.ceil(this.height());
			
			var response    = {
				validWidth: true,
				validHeight: true,
				validRatio: true,
				minWidth: minWidth,
				minHeight: minHeight,
				maxWidth: maxWidth,
				maxHeight: maxHeight,
				width: cropSize.w,
				height: cropSize.h,
				x: cropSize.x,
				x2: cropSize.x2,
				y: cropSize.y,
				y2: cropSize.y2,
				ratio: ratio,
				ratioString: t.cropSettings.aspectRatioString
			};

			if(minWidth > 0 && minWidth > width) {
				response.validWidth = false;
				errors.push(this.factory.parse(PhotoFrame.Lang.min_width, 'min_width', minWidth));
			}
			
			if(minHeight > 0 && minHeight > height) {
				response.validHeight = false;
				errors.push(this.factory.parse(PhotoFrame.Lang.min_height, 'min_height', minHeight));
			}
			
			if(maxWidth > 0 && maxWidth < width) {
				response.validWidth = false;
				errors.push(this.factory.parse(PhotoFrame.Lang.max_width, 'max_width', maxWidth));
			}
			
			if(maxHeight > 0 && maxHeight < height) {
				response.validHeight = false;
				errors.push(this.factory.parse(PhotoFrame.Lang.max_height, 'max_height', maxHeight));
			}
			
			if(!isCropped && ratio) {
				if(t.round(ratio, 100) != t.round(cropWidth / cropHeight, 100)) {
					response.validRatio = false;
					errors.push(this.factory.parse(PhotoFrame.Lang.required_ratio, 'aspect_ratio', t.cropSettings.aspectRatioString));
				}
			}
			
			response.errors = errors;
				
			if(json) {
				return response;
			}
			
			return errors;
		}	
	});
	
	PhotoFrame.ProgressBar = PhotoFrame.Class.extend({
				
		/**
		 * The progress percentage.
		 */		
		 
		progress: 0,				
			
		/**
		 * An object of UI elements.
		 */		
		 
		ui: {},
		
		/**
		 * The wrapping DOM object.
		 */		
		 
		$wrapper: false,
			
		/**
		 * Constructor to set the options and UI events.
		 *
		 * @param object  The wrapper object
		 * @param object  An array of options to be set
		 */	
		 
		constructor: function(obj, progress, options) {	
			var t = this;
			
			t.progress = 0;
			t.ui 	   = {};
			t.$wrapper = $(obj);
						
			if(typeof progress == "object") {
				options  = progress;
				progress = 0;
			}
			
			if(typeof progress == "undefined") {
				var progress = 0;
			}
			
			if(typeof options == "undefined") {
				var options = {};
			}

			var _default = {
				callbacks: {
					init: function() {},
					cancel: function() {},
					progress: function() {},	
					hide: function() {},	
					show: function() {},	
					reset: function() {},	
				},
				duration: 333,
				classes: {
					progress: 'photo-frame-progress-fill',
					cancel: 'photo-frame-progress-cancel',
					wrapper: 'photo-frame-progress-wrapper'
				}	
			};
			
			t.ui = {
				obj: t.$wrapper,
				parent: t.$wrapper.parent(),
				fill: t.$wrapper.find	
			};
			
			t.base(_default, options);
			
			if(!t.ui.obj.data('init')) {
				t.ui.fill    = $('<div class="'+t.classes.progress+'" />');
				t.ui.cancel  = $('<a href="#" class="'+t.classes.cancel+'"><span class="icon-cancel"></span></a>');
				
				t.ui.obj.wrap('<div class="'+t.classes.wrapper+' '+t.classes.icons+'" />');
				t.ui.cancel.insertBefore(t.ui.obj);
				t.ui.obj.append(t.ui.fill);
				t.ui.obj.data('init', 'true');
				
				t.ui.wrapper = t.ui.obj.parent('.'+t.classes.wrapper);
				
				t.ui.cancel.click(function(e) {	
					
					t.callbacks.cancel(t, e);
					
					t.hide(function() {
						t.reset(0);
					});
					
					e.preventDefault();
				});
				
				t.callbacks.init(t);
					
				t.set(t.progress);
			}
			
			$(window).resize(function() {
				t.center();				
			});
		},
		
		/**
		 * Reset the progress bar back to zero
		 */	
		 
		reset: function(callback) {
			var t = this;
			
			t.set(0, function() {				
				t.callbacks.reset(t);
				
				if(typeof callback == "function") {
					callback();
				}
			});
		}, 
		
		/**
		 * Set the progress bar to a defined value.
		 *
		 * @param object    The progress value
		 * @param callback  A function to be used for a callback
		 */	
		 
		set: function(value, callback) {
			var t      = this;
			var outer  = t.ui.obj.outerWidth();
			var width  = outer && !isNaN(outer) && outer > 0 ? outer : t.ui.obj.width();

			t.progress = parseInt(value) > 100 ? 100 : parseInt(value);
			t.progress = parseInt(width * (value / 100));
			
			t.ui.fill.css('width', t.progress);
			
			t.callbacks.progress(t, t.progress);
			
			setTimeout(function() {
				if(typeof callback == "function") {
					callback(t);
				}
			}, t.duration);
		},
		
		/**
		 * Get the progress bar value.
		 *
		 * @return int The amount of progress in the bar
		 */	
		 
		get: function() {
			return this.progress;
		},
		
		/**
		 * Center the progress bar within the parent.
		 */	
		 
		center: function() {		
			this.ui.wrapper.position({
				of: this.ui.parent,
				my: 'center',
				at: 'center'
			});	
		},
		
		/**
		 * Show the progress bar.
		 *
		 * @param mixed  The animation duration.
		 * @param mixed  The callback function.
		 */	
		 
		show: function(duration, callback) {
			var t = this;
			
			if(typeof duration == "function") {
				callback = duration;
				duration = undefined;
			}
			
			if(typeof duration == "undefined") {
				var duration = t.duration;
			}
			
			t.center();
			
			t.ui.wrapper.fadeIn(duration, function() {
				t.callbacks.show(t);
			
				if(typeof callback == "function") {
					callback(t);
				}				
			});
			
			t.center();
		},
		
		/**
		 * Hide the progress bar.
		 *
		 * @param mixed  The animation duration.
		 * @param mixed  The callback function.
		 */	
		 
		hide: function(duration, callback) {
			var t = this;
			
			if(typeof duration == "function") {
				callback = duration;
				duration = undefined;
			}
			
			if(typeof duration == "undefined") {
				var duration = t.duration;
			}
			
			t.ui.wrapper.fadeOut(duration, function() {	
				t.callbacks.hide(t);
				
				if(typeof callback == "function") {
					callback(t);
				}				
			});
		}
	});
		
	PhotoFrame.Database = PhotoFrame.Class.extend({
		
		/**
		 * The driver used
		 */	
		 
		driver: 'localStorage',
		
		/**
		 * Datatable Fields
		 */	
		 
		fields: [],
		
		/**
		 * The localStorageDB object
		 */	
		 
		model: false,
		
		/**
		 * The name of the datatable
		 */	
		 
		name: false,
		
		/**
		 * If TRUE the datatable will be reset with each page load
		 */	
		 
		reset: false,
		
		/**
		 * Easily istantiate a database using localStorage
		 *
		 * @param 	string 	The name of the datatable
		 * @param 	string 	The storage driver (defaults to localStorage)
		 * @return	mixed
		 */		
		 
		constructor: function(options) {			
			this.base(options);
			this.model = new localStorageDB('PhotoFrame', this.driver);
			if(this.reset) {
				this.clear();
			}
			this._firstRun();
		},
		
		/**
		 * Clear the datatable
		 *
		 * @return	void
		 */		
		 
		clear: function() {
			this.model.dropTable(this.name);
			this.model.commit();
		},
		
		/**
		 * Create the datatable
		 *
		 * @return	void
		 */		
		 
		create: function() {
			this.model.createTable(this.name, this.fields);
			this.model.commit();
		},
		
		/**
		 * Drop the datatable
		 *
		 * @return	void
		 */		
		 
		drop: function() {
			this.model.dropTable(this,name);
			this.model.commit();
		},
		
		/**
		 * Does the datatable exist?
		 *
		 * @return	bool  Returns TRUE if exists
		 */		
		 
		exists: function() {
			return this.model.tableExists(this.name);
		},
		
		/**
		 * Get the data from the datatable
		 *
		 * @param   object  A data object used filter the results
		 * @return	bool  Returns TRUE if exists
		 */		
		 
		get: function(data) {
			return this.model.query(this.name, data);
		},
		
		/**
		 * Inserts data into the datatable
		 *
		 * @param   object  An object of data to insert
		 * @return	void
		 */		
		 
		insert: function(data) {
			this.model.insert(this.name, data);
			this.model.commit();
		},
		
		/**
		 * Insert if data does not exist
		 *
		 * @param   object  An object of data to insert
		 * @return	void
		 */		
		 
		insertIfNew: function(data) {
			if(this.model.query(this.name, data).length == 0) {
				this.model.insert(this.name, data);
				this.model.commit();
			}
		},
		
		/**
		 * Insert or update
		 *
		 * @param   object  An object of data to insert
		 * @return	void
		 */		
		 
		insertOrUpdate: function(query, data) {
			this.model.insertOrUpdate(this.name, query, data);
			this.model.commit();
		},
		
		/**
		 * Update data in the datatable
		 *
		 * @param   object  The row ID to update
		 * @param   object  An object of data to update
		 * @return	void
		 */		
		
		update: function(query, data) {
			if(typeof query != "object") {
				query = {ID: query};
			}
			this.model.update(this.name, query, function(row) {
				return $.extend(true, {}, row, data);
			});
			this.model.commit();
		},
		
		/**
		 * Remove data from the datatable
		 *
		 * @param   object  The row ID to update
		 * @return	void
		 */	
		 
		remove: function(id) {
			this.model.deleteRows(this.name, {ID: id});
			this.model.commit();
		},
		
		/**
		 * The database first run
		 *
		 * @return	void
		 */	
		
		_firstRun: function() {
			if(!this.exists()) {
				this.create();
			}
		}
		
	});

	PhotoFrame.Slider = PhotoFrame.BaseElement.extend({

		/**
		 * Slider animation speed
		 */	

		animate: false,

		/**
		 * An object of callback methods
		 */	
		 
		callbacks: {
			create: function(event, ui) {},
			start: function(event, ui) {},
			slide: function(event, ui) {},
			stop: function(event, ui) {}
		},

		/**
		 * Is slider disabled?
		 */	

		disabled: false,
		 
		/**
		 * The PhotoFrame.Factory object
		 */	

		factory: false,

		/**
		 * Minimum slider value
		 */	

		min: false,
		 
		/**
		 * Maximum slider value
		 */	

		max: false,

		/**
		 * The slider's orientation
		 */	

		orientation: false,

		/**
		 * The parent jQuery object to append the slider
		 */	

		parent: false,

		/**
		 * Use the min & max for the slider's range?
		 */	

		range: false,

		/**
		 * The slider's increment value
		 */	

		step: 1,

		/**
		 * An object of UI elements
		 */	
		 
		ui: {
		 	slider: false,
			tooltip: false
		},

		/**
		 * Should the slider use the preferences?
		 */	

		usePreferences: false,

		/**
		 * The slider value
		 */	

		value: false,

		/**
		 * Constructor method
		 *
		 * @param   object  The PhotoFrame.Factory object
		 * @param   object  The parent jQuery object to append the slider
		 * @param   object  An object of options
		 * @return  void
		 */		
		 
		constructor: function(factory, parent, options) {
			this.base(factory, parent, options);
			this.buildSlider();
		},

		/**
		 * Build the slider HTML
		 *
		 * @return  void
		 */		
		 
		buildSlider: function() {
			var t 	    = this;
			var classes = 'photo-frame-slider-tooltip photo-frame-hidden';
			
		 	this.ui.slider  = $('<div class="photo-frame-slider"></div>');
		 	this.ui.tooltip = $('<div class="'+classes+'"></div>');

		 	this.parent.append(this.ui.slider);
		 	this.parent.append(this.ui.tooltip);

		 	this.ui.slider.slider({
		 		animate: this.animate,
		 		disabled: this.disabled,
				min: this.min,
				max: this.max,
				orientation: this.orientation,
				range: this.range,
				step: this.step,
				value: this.value,
				start: function(e, ui) {
					t.showTooltip();
					t.positionTooltip(ui);
					t.factory.trigger('sliderStart', t);
					t.callback(t.callbacks.start, e, ui);
				},
				create: function(e, ui) {
					t.positionTooltip(ui);
					t.factory.trigger('sliderCreate', t);
					t.callback(t.callbacks.create, e, ui);
				},
				slide: function(e, ui) {
					t.positionTooltip(ui);
					t.factory.trigger('sliderSlide', t);
					t.callback(t.callbacks.slide, e, ui);
					t.setPreference();
				},
				stop: function(e, ui) {
					t.hideTooltip();
					t.positionTooltip(ui);
					t.factory.trigger('sliderStop', t);
					t.callback(t.callbacks.stop, e, ui);
				}
			});

		 	this.setValueFromPreferences();
		},

		/**
		 * Position the tooltip
		 *
		 * @param   object  The slider UI object
		 * @return  void
		 */		
		 
		positionTooltip: function(ui) {			
			this.ui.tooltip.html(ui.value);		
			this.ui.tooltip.position({
				of: ui.handle,
				my: 'center top',
				at: 'center bottom'
			});
			
			var top = parseInt(this.ui.tooltip.css('top').replace('px', ''), 10);
			
			this.ui.tooltip.css('top', top+10);			
		},

		/**
		 * Show the tooltip
		 *
		 * @return  void
		 */		
		 
		showTooltip: function() {
			this.ui.tooltip.removeClass('photo-frame-hidden');
		},

		/**
		 * Hide the tooltip
		 *
		 * @return  void
		 */		
		 
		hideTooltip: function() {
			this.ui.tooltip.addClass('photo-frame-hidden');
		},

		/**
		 * Enable the slider
		 *
		 * @return  void
		 */		
		 
		enable: function() {
			this.disabled = false;
			this.ui.slider.slider('enable');
		},

		/**
		 * Disable the tooltip
		 *
		 * @return  void
		 */		
		 
		disable: function() {
			this.disabled = true;
			this.ui.slider.slider('disable');
		},

		/**
		 * Get the slider option
		 *
		 * @param   string  The slider option name
		 * @return  mixed
		 */		
		 
		getSliderOption: function(option) {
			return this.ui.slider.slider(option);
		},

		/**
		 * Show the tooltip
		 *
		 * @param   string  The option to set
		 * @param   mixed   The option value
		 * @return  void
		 */		
		 
		setSliderOption: function(option, value) {
			this.ui.slider.slider(option, value);
		},

		/**
		 * Set the slider value
		 *
		 * @param   mixed   The slider value
		 * @return  void
		 */		
		 
		setValue: function(value) {
			this.setSliderOption('value', value);
		},

		/**
		 * Get the slider value
		 *
		 * @return  int
		 */		
		 
		getValue: function() {
			return this.getSliderOption('value');
		},

		/**
		 * Is the slider enabled?
		 *
		 * @return  bool
		 */		
		 
		isEnabled: function() {
			return this.getSliderOption('disabled') ? false : true;
		},

		/**
		 * Is the slider disabled?
		 *
		 * @return  bool
		 */		
		 
		isDisabled: function() {
			return this.getSliderOption('disabled');
		},

		/**
		 * Set the last slider value to the preferences
		 *
		 * @return  void
		 */		
		 
		setPreference: function() {
			if(this.usePreferences) {
				PhotoFrame.Model.Preferences.setPreference('sliderLastValue', this.getValue());
			}
		},

		/**
		 * Get the last slider value to the preferences
		 *
		 * @return  mixed
		 */		
		 
		getPreference: function() {
			if(this.usePreferences) {
				return PhotoFrame.Model.Preferences.getPreference('sliderLastValue');
			}
			return false;
		},

		/**
		 * Set the slider value from the preferences
		 *
		 * @return  value
		 */		
		 
		setValueFromPreferences: function() {
			if(this.usePreferences && this.value === false) {
				this.setValue(this.getPreference());
			}
		}

	});
	
	PhotoFrame.ColorPicker = PhotoFrame.BaseElement.extend({

		/**
		 * An object of callback methods
		 */	

		callbacks: {
			init: function() {},
			change: function(color) {},
			move: function(color) {},
			hide: function(color) {},
			show: function(color) {},
			beforeShow: function(color) {},
		},

		/**
		 * Override the default cancel button text
		 */	

		cancelText: false,

		/**
		 * Override the default choose button text
		 */	

		chooseText: false,

		/**
		 * Add an additional class name to the color picker
		 */	

		className: 'photo-frame-color-picker',

		/**
		 * When clicking outside the colorpicker, force to change the value
		 */	

		clickoutFiresChange: false,

		/**
		 * The default color string
		 */	

		color: false,

		/**
		 * Disable the color picker by default
		 */	

		disabled: false,

		/**
		 * Flat mode
		 */	

		flat: false,

		/**
		 * Fonts PhotoFrame.Window object ID
		 */

		fontWindowId: 'fontWindowColorPicker',

		/**
		 * The default colors in the palette
		 */	

		palette: [],

		/**
		 * Change the preferred output of the color format
		 * Accepted Values: hex|hex6|hsl|rgb|name
		 */	

		preferredFormat: 'hex',

		/**
		 * Show the alpha transparency option
		 */	

		showAlpha: false,

		/**
		 * Show the cancel and choose buttons
		 */	

		showButtons: false,

		/**
		 * Show the initial color beside the new color
		 */	

		showInitial: false,

		/**
		 * Allow free form typing via text input
		 */	

		showInput: false,

		/**
		 * Show the user created color palette
		 */	

		showPalette: false,

		/**
		 * Show the color that is selected within the palette
		 */	

		showSelectionPalette: false,

		/**
		 * Should the slider use the preferences?
		 */	

		usePreferences: false,


		constructor: function(factory, parent, options) {
			this.base(factory, parent, options);
			this.buildColorPicker();

			if(!this.color) {
				this.setColorFromPreferences();
			}
		},

		buildColorPicker: function() {
			var t = this;

			this.parent.spectrum({
				cancelText: this.cancelText,
				chooseText: this.chooseText,
				className: this.className,
				clickoutFiresChange: this.clickoutFiresChange,
				color: this.color,
				disabled: this.disabled,
				flat: this.flat,
				palette: this.palette,
				preferredFormat: this.preferredFormat,
				showAlpha: this.showAlpha,
				showButtons: this.showButtons,
				showInitial: this.showInitial,
				showInput: this.showInput,
				showPalette: this.showPalette,
				showSelectionPalette: this.showSelectionPalette,
				change: function(color) {
					t.setPreference();
					t.callback(t.callbacks.change, color);
					t.factory.trigger('colorPickerChange', t, color);
				},
				move: function(color) {
					t.callback(t.callbacks.move, color);
					t.factory.trigger('colorPickerMove', t, color);
				},
				hide: function(color) {
					t.callback(t.callbacks.hide, color);
					t.factory.trigger('colorPickerHide', t, color);
				},
				show: function(color) {
					t.callback(t.callbacks.show, color);
					t.factory.trigger('colorPickerShow', t, color);
				},
				beforeShow: function(color) {
					t.callback(t.callbacks.beforeShow, color);
					t.factory.trigger('colorPickerBeforeShow', t, color);
				}
			});

			this.callback(this.callbacks.init);
			this.factory.trigger('colorPickerInit');
		},

		get: function() {
			return this.getColor();
		},

		set: function(color) {
			this.setColor(color);
		},

		getRgb: function() {
			return this.getColor().toRgb();
		},
		
		getRgbString: function() {
			return this.getColor().toRgbString();
		},

		getHsl: function() {
			return this.getColor().toHsl();
		},
		
		getHslString: function() {
			return this.getColor().toHslString();
		},

		getName: function() {
			return this.getColor().toName();
		},
		
		getPercentageRgb: function() {
			return this.getColor().toPercentageRgb();
		},
		
		getPercentageRgbString: function() {
			return this.getColor().toPercentageRgbString();
		},
		
		getHex: function() {
			return this.getColor().toHex();
		},

		getHexString: function() {
			return this.getColor().toHexString();
		},

		getColor: function() {
			return this.parent.spectrum('get');
		},
		
		getString: function(format) {
			return this.getColor().toString(format);
		},

		setColor: function(color) {
			this.parent.spectrum('set', color);
			this.setPreference();
		},
		
		enable: function() {
			this.parent.spectrum('enable');
			this.factory.trigger('colorPickerEnable');
		},

		disable: function() {
			this.parent.spectrum('disable');
			this.factory.trigger('colorPickerDiable');
		},

		destroy: function() {
			this.parent.spectrum('destroy');
			this.factory.trigger('colorPickerDestroy');
		},

		show: function() {
			this.parent.spectrum('show');
			this.factory.trigger('colorPickerShow');
		},

		hide: function() {
			this.parent.spectrum('hide');
			this.factory.trigger('colorPickerHide');
		},

		toggle: function() {
			this.parent.spectrum('toggle');
			this.factory.trigger('colorPickerToggle');
		},

		getPreference: function() {
			var _return = {
				rgb: PhotoFrame.Model.Preferences.getPreference('colorPickerLastColorRgb'),
				hex: PhotoFrame.Model.Preferences.getPreference('colorPickerLastColorHex')
			};

			if(!this.usePreferences && typeof _return == "array" && _return.length == 0) {
				return false;
			}

			return _return;
		},

		setPreference: function() {
			if(this.usePreferences) {
				PhotoFrame.Model.Preferences.setPreference('colorPickerLastColorRgb', this.getRgbString());
				PhotoFrame.Model.Preferences.setPreference('colorPickerLastColorHex', this.getHexString());
			}
		},

		setColorFromPreferences: function() {
			if(this.usePreferences) {
				this.setColor(this.getPreference().hex);
			}
		}
	});

	/**
	 * This datatable stores the locations of the windows
	 */
	 
	PhotoFrame.Model.Preferences = new PhotoFrame.Database({
		
		/**
		 * The name of the datatable
		 */
		 
		name: 'photoFramePrefs',
		
		/**
		 * An array of datatable columns
		 */
		 
		fields: ['key', 'value'],

		/**
		 * Get one or more preferences by defining a key.
		 * If no key is present, all preferences are returned.
		 *
		 * @param   mixed  A preference name (the key)
		 * @return  bool
		 */		
		 
		getPreference: function(key) {
			if(typeof key != "undefined") {
				var _return = PhotoFrame.Model.Preferences.get({key: key});

				if(_return.length > 0) {
					return _return[0].value;
				}

				return false;
			}
			return PhotoFrame.Model.Preferences.get();
		},
		
		/**
		 * Set one or preferences by passing a key and value.
		 * If an object is passed, it will set multiple prefs.
		 *
		 * @param  mixed  The preference name (Or object of keys and values)
		 * @param  mixed  The preference value
		 * @return void
		 */		
		 
		setPreference: function(key, value) {
			if(typeof key == "object") {
				var obj = key;
				for(key in obj) {
		  			this.setPreference(key, obj[key]);
	  			}
			}
			else {
				PhotoFrame.Model.Preferences.insertOrUpdate({key: key}, {
					key: key,
					value: value
				});	
			}
		}

	});
	
	/**
	 * This datatable stores the locations of the windows
	 */
	 
	PhotoFrame.Model.WindowLocations = new PhotoFrame.Database({
		
		/**
		 * The name of the datatable
		 */
		 
		name: 'windowLocations',
		
		/**
		 * An array of datatable columns
		 */
		 
		fields: ['title', 'x', 'y', 'visible']
		
	});
	
	PhotoFrame.WindowControls = PhotoFrame.Class.extend({
		
		/**
		 * Is the window visible by default?
		 */	
		 
		visible: false,
		
		/**
		 * Get the window visibility
		 *
		 * @return  bool
		 */		
		 
		getVisibility: function() {
			var data = PhotoFrame.Model.WindowLocations.get({title: this.title});
			
			return data.length > 0 && data[0].visible ? data[0].visible : false;
		},
		
		/**
		 * Set the window visibility
		 *
		 * @return  void
		 */		
		 
		setVisibility: function(visible) {
			visible = visible ? true : false;
			
			PhotoFrame.Model.WindowLocations.update({title: this.title}, {
				visible: visible
			});	
			
			this.visible = visible;
		},
		
		/**
		 * Save the window position
		 *
		 * @return  void
		 */		
		 
		savePosition: function() {
			PhotoFrame.Model.WindowLocations.insertOrUpdate({title: this.title}, {
				visible: this.getVisibility(),
				title: this.title,
				y: this.ui.window.css('top'),
				x: this.ui.window.css('left')
			});	
		},
		
		/**
		 * Bring window to the front
		 *
		 * @return  void
		 */		
		 
		bringToFront: function() {
			this.factory.zIndexCount++;
			this.ui.window.css('z-index', this.factory.zIndexCount);
		},
		
		/**
		 * Does the window have a position?
		 *
		 * @return  bool
		 */		
		 
		hasPosition: function() {
			return this.getPosition() ? true : false;	
		},
		
		/**
		 * Get the window position
		 *
		 * @return  object
		 */		
		 
		getPosition: function() {
			var pos = PhotoFrame.Model.WindowLocations.get({title: this.title});
			
			if(pos.length == 0) {
				return false;
			}
			
			return pos[0];
		},
		
		/**
		 * Restore the window position
		 *
		 * @return  void
		 */		
		 
		restorePosition: function() {
			var position = this.getPosition();
			
			this.setPosition(position.x, position.y);
		},
		
		/**
		 * Set the window position
		 *
		 * @return  void
		 */		
		 
		setPosition: function(x, y) {
			this.ui.window.css('left', x).css('top', y);
		}
		
	});

	PhotoFrame.Window.implement(PhotoFrame.WindowControls);
	PhotoFrame.ButtonBar.implement(PhotoFrame.WindowControls);
		
}(jQuery));

/**
 * Get the current jQuery version and test is similar to version_compare();
 *
 * @param	string 	First version to compare
 * @param	string 	Comparison operator
 * @param	string 	Second version to compare (optional)
 *
 * @return	mixed;
 */

jQuery.isVersion = function(left, oper, right) {
    if (left) {
        var pre = /pre/i,
            replace = /[^\d]+/g,
            oper = oper || "==",
            right = right || jQuery.fn.jquery,
            l = left.replace(replace, ''),
            r = right.replace(replace, ''),
            l_len = l.length, r_len = r.length,
            l_pre = pre.test(left), r_pre = pre.test(right);

        l = (r_len > l_len ? parseInt(l) * ((r_len - l_len) * 10) : parseInt(l));
        r = (l_len > r_len ? parseInt(r) * ((l_len - r_len) * 10) : parseInt(r));

        switch(oper) {
            case "==": {
                return (true === (l == r && (l_pre == r_pre)));
            }
            case ">=": {
                return (true === (l >= r && (!l_pre || l_pre == r_pre)));
            }
            case "<=": {
                return (true === (l <= r && (!r_pre || r_pre == l_pre)));
            }
            case ">": {
                return (true === (l > r || (l == r && r_pre)));
            }
            case "<": {
                return (true === (l < r || (l == r && l_pre)));
            }
        }
    }

    return false;
}

/**
 * Center a specific element on the screen. Works with various versions of jQuery
 *
 * @return object;
 */

jQuery.fn.center = function () {
    var w = $(window);
    this.css("position","fixed");
    
    if($.isVersion('1.7.0', '<=') && w.outerHeight() != null && w.outerWidth() != null && 
       !isNaN(w.outerHeight()) && !isNaN(w.outerWidth())) {
	    var outerHeight = w.outerHeight();
	    var outerWidth  = w.outerWidth();
    } else {
    	var outerHeight = w.height();
	    var outerWidth  = w.width();
    }
    
    this.css("top",outerHeight/2-this.height()/2 + "px");
    this.css("left",outerWidth/2-this.width()/2  + "px");
    
    return this;
}

/**
 * Capitalize the first letter in a string
 *
 * @return string
 */
 
String.prototype.ucfirst = function() {
	return this.substr(0, 1).toUpperCase() + this.substr(1);
};;// Spectrum Colorpicker v1.1.1
// https://github.com/bgrins/spectrum
// Author: Brian Grinstead
// License: MIT

(function (window, $, undefined) {
    var defaultOpts = {

        // Callbacks
        beforeShow: noop,
        move: noop,
        change: noop,
        show: noop,
        hide: noop,

        // Options
        color: false,
        flat: false,
        showInput: false,
        showButtons: true,
        clickoutFiresChange: false,
        showInitial: false,
        showPalette: false,
        showPaletteOnly: false,
        showSelectionPalette: true,
        localStorageKey: false,
        appendTo: "body",
        maxSelectionSize: 7,
        cancelText: "cancel",
        chooseText: "choose",
        preferredFormat: false,
        className: "",
        showAlpha: false,
        theme: "sp-light",
        palette: ['fff', '000'],
        selectionPalette: [],
        disabled: false
    },
    spectrums = [],
    IE = !!/msie/i.exec( window.navigator.userAgent ),
    rgbaSupport = (function() {
        function contains( str, substr ) {
            return !!~('' + str).indexOf(substr);
        }

        var elem = document.createElement('div');
        var style = elem.style;
        style.cssText = 'background-color:rgba(0,0,0,.5)';
        return contains(style.backgroundColor, 'rgba') || contains(style.backgroundColor, 'hsla');
    })(),
    replaceInput = [
        "<div class='sp-replacer'>",
            "<div class='sp-preview'><div class='sp-preview-inner'></div></div>",
            "<div class='sp-dd'>&#9660;</div>",
        "</div>"
    ].join(''),
    markup = (function () {

        // IE does not support gradients with multiple stops, so we need to simulate
        //  that for the rainbow slider with 8 divs that each have a single gradient
        var gradientFix = "";
        if (IE) {
            for (var i = 1; i <= 6; i++) {
                gradientFix += "<div class='sp-" + i + "'></div>";
            }
        }

        return [
            "<div class='sp-container sp-hidden'>",
                "<div class='sp-palette-container'>",
                    "<div class='sp-palette sp-thumb sp-cf'></div>",
                "</div>",
                "<div class='sp-picker-container'>",
                    "<div class='sp-top sp-cf'>",
                        "<div class='sp-fill'></div>",
                        "<div class='sp-top-inner'>",
                            "<div class='sp-color'>",
                                "<div class='sp-sat'>",
                                    "<div class='sp-val'>",
                                        "<div class='sp-dragger'></div>",
                                    "</div>",
                                "</div>",
                            "</div>",
                            "<div class='sp-hue'>",
                                "<div class='sp-slider'></div>",
                                gradientFix,
                            "</div>",
                        "</div>",
                        "<div class='sp-alpha'><div class='sp-alpha-inner'><div class='sp-alpha-handle'></div></div></div>",
                    "</div>",
                    "<div class='sp-input-container sp-cf'>",
                        "<input class='sp-input' type='text' spellcheck='false'  />",
                    "</div>",
                    "<div class='sp-initial sp-thumb sp-cf'></div>",
                    "<div class='sp-button-container sp-cf'>",
                        "<a class='sp-cancel' href='#'></a>",
                        "<button class='sp-choose'></button>",
                    "</div>",
                "</div>",
            "</div>"
        ].join("");
    })();

    function paletteTemplate (p, color, className) {
        var html = [];
        for (var i = 0; i < p.length; i++) {
            var tiny = tinycolor(p[i]);
            var c = tiny.toHsl().l < 0.5 ? "sp-thumb-el sp-thumb-dark" : "sp-thumb-el sp-thumb-light";
            c += (tinycolor.equals(color, p[i])) ? " sp-thumb-active" : "";

            var swatchStyle = rgbaSupport ? ("background-color:" + tiny.toRgbString()) : "filter:" + tiny.toFilter();
            html.push('<span title="' + tiny.toRgbString() + '" data-color="' + tiny.toRgbString() + '" class="' + c + '"><span class="sp-thumb-inner" style="' + swatchStyle + ';" /></span>');
        }
        return "<div class='sp-cf " + className + "'>" + html.join('') + "</div>";
    }

    function hideAll() {
        for (var i = 0; i < spectrums.length; i++) {
            if (spectrums[i]) {
                spectrums[i].hide();
            }
        }
    }

    function instanceOptions(o, callbackContext) {
        var opts = $.extend({}, defaultOpts, o);
        opts.callbacks = {
            'move': bind(opts.move, callbackContext),
            'change': bind(opts.change, callbackContext),
            'show': bind(opts.show, callbackContext),
            'hide': bind(opts.hide, callbackContext),
            'beforeShow': bind(opts.beforeShow, callbackContext)
        };

        return opts;
    }

    function spectrum(element, o) {

        var opts = instanceOptions(o, element),
            flat = opts.flat,
            showSelectionPalette = opts.showSelectionPalette,
            localStorageKey = opts.localStorageKey,
            theme = opts.theme,
            callbacks = opts.callbacks,
            resize = throttle(reflow, 10),
            visible = false,
            dragWidth = 0,
            dragHeight = 0,
            dragHelperHeight = 0,
            slideHeight = 0,
            slideWidth = 0,
            alphaWidth = 0,
            alphaSlideHelperWidth = 0,
            slideHelperHeight = 0,
            currentHue = 0,
            currentSaturation = 0,
            currentValue = 0,
            currentAlpha = 1,
            palette = opts.palette.slice(0),
            paletteArray = $.isArray(palette[0]) ? palette : [palette],
            selectionPalette = opts.selectionPalette.slice(0),
            maxSelectionSize = opts.maxSelectionSize,
            draggingClass = "sp-dragging",
            shiftMovementDirection = null;

        var doc = element.ownerDocument,
            body = doc.body,
            boundElement = $(element),
            disabled = false,
            container = $(markup, doc).addClass(theme),
            dragger = container.find(".sp-color"),
            dragHelper = container.find(".sp-dragger"),
            slider = container.find(".sp-hue"),
            slideHelper = container.find(".sp-slider"),
            alphaSliderInner = container.find(".sp-alpha-inner"),
            alphaSlider = container.find(".sp-alpha"),
            alphaSlideHelper = container.find(".sp-alpha-handle"),
            textInput = container.find(".sp-input"),
            paletteContainer = container.find(".sp-palette"),
            initialColorContainer = container.find(".sp-initial"),
            cancelButton = container.find(".sp-cancel"),
            chooseButton = container.find(".sp-choose"),
            isInput = boundElement.is("input"),
            shouldReplace = isInput && !flat,
            replacer = (shouldReplace) ? $(replaceInput).addClass(theme).addClass(opts.className) : $([]),
            offsetElement = (shouldReplace) ? replacer : boundElement,
            previewElement = replacer.find(".sp-preview-inner"),
            initialColor = opts.color || (isInput && boundElement.val()),
            colorOnShow = false,
            preferredFormat = opts.preferredFormat,
            currentPreferredFormat = preferredFormat,
            clickoutFiresChange = !opts.showButtons || opts.clickoutFiresChange;


        function applyOptions() {

            container.toggleClass("sp-flat", flat);
            container.toggleClass("sp-input-disabled", !opts.showInput);
            container.toggleClass("sp-alpha-enabled", opts.showAlpha);
            container.toggleClass("sp-buttons-disabled", !opts.showButtons);
            container.toggleClass("sp-palette-disabled", !opts.showPalette);
            container.toggleClass("sp-palette-only", opts.showPaletteOnly);
            container.toggleClass("sp-initial-disabled", !opts.showInitial);
            container.addClass(opts.className);

            reflow();
        }

        function initialize() {

            if (IE) {
                container.find("*:not(input)").attr("unselectable", "on");
            }

            applyOptions();

            if (shouldReplace) {
                boundElement.after(replacer).hide();
            }

            if (flat) {
                boundElement.after(container).hide();
            }
            else {

                var appendTo = opts.appendTo === "parent" ? boundElement.parent() : $(opts.appendTo);
                if (appendTo.length !== 1) {
                    appendTo = $("body");
                }

                appendTo.append(container);
            }

            if (localStorageKey && window.localStorage) {

                // Migrate old palettes over to new format.  May want to remove this eventually.
                try {
                    var oldPalette = window.localStorage[localStorageKey].split(",#");
                    if (oldPalette.length > 1) {
                        delete window.localStorage[localStorageKey];
                        $.each(oldPalette, function(i, c) {
                             addColorToSelectionPalette(c);
                        });
                    }
                }
                catch(e) { }

                try {
                    selectionPalette = window.localStorage[localStorageKey].split(";");
                }
                catch (e) { }
            }

            offsetElement.bind("click.spectrum touchstart.spectrum", function (e) {
                if (!disabled) {
                    toggle();
                }

                e.stopPropagation();

                if (!$(e.target).is("input")) {
                    e.preventDefault();
                }
            });

            if(boundElement.is(":disabled") || (opts.disabled === true)) {
                disable();
            }

            // Prevent clicks from bubbling up to document.  This would cause it to be hidden.
            container.click(stopPropagation);

            // Handle user typed input
            textInput.change(setFromTextInput);
            textInput.bind("paste", function () {
                setTimeout(setFromTextInput, 1);
            });
            textInput.keydown(function (e) { if (e.keyCode == 13) { setFromTextInput(); } });

            cancelButton.text(opts.cancelText);
            cancelButton.bind("click.spectrum", function (e) {
                e.stopPropagation();
                e.preventDefault();
                hide("cancel");
            });

            chooseButton.text(opts.chooseText);
            chooseButton.bind("click.spectrum", function (e) {
                e.stopPropagation();
                e.preventDefault();

                if (isValid()) {
                    updateOriginalInput(true);
                    hide();
                }
            });

            draggable(alphaSlider, function (dragX, dragY, e) {
                currentAlpha = (dragX / alphaWidth);
                if (e.shiftKey) {
                    currentAlpha = Math.round(currentAlpha * 10) / 10;
                }

                move();
            });

            draggable(slider, function (dragX, dragY) {
                currentHue = parseFloat(dragY / slideHeight);
                move();
            }, dragStart, dragStop);

            draggable(dragger, function (dragX, dragY, e) {

                // shift+drag should snap the movement to either the x or y axis.
                if (!e.shiftKey) {
                    shiftMovementDirection = null;
                }
                else if (!shiftMovementDirection) {
                    var oldDragX = currentSaturation * dragWidth;
                    var oldDragY = dragHeight - (currentValue * dragHeight);
                    var furtherFromX = Math.abs(dragX - oldDragX) > Math.abs(dragY - oldDragY);

                    shiftMovementDirection = furtherFromX ? "x" : "y";
                }

                var setSaturation = !shiftMovementDirection || shiftMovementDirection === "x";
                var setValue = !shiftMovementDirection || shiftMovementDirection === "y";

                if (setSaturation) {
                    currentSaturation = parseFloat(dragX / dragWidth);
                }
                if (setValue) {
                    currentValue = parseFloat((dragHeight - dragY) / dragHeight);
                }

                move();

            }, dragStart, dragStop);

            if (!!initialColor) {
                set(initialColor);

                // In case color was black - update the preview UI and set the format
                // since the set function will not run (default color is black).
                updateUI();
                currentPreferredFormat = preferredFormat || tinycolor(initialColor).format;

                addColorToSelectionPalette(initialColor);
            }
            else {
                updateUI();
            }

            if (flat) {
                show();
            }

            function palletElementClick(e) {
                if (e.data && e.data.ignore) {
                    set($(this).data("color"));
                    move();
                }
                else {
                    set($(this).data("color"));
                    updateOriginalInput(true);
                    move();
                    hide();
                }

                return false;
            }

            var paletteEvent = IE ? "mousedown.spectrum" : "click.spectrum touchstart.spectrum";
            paletteContainer.delegate(".sp-thumb-el", paletteEvent, palletElementClick);
            initialColorContainer.delegate(".sp-thumb-el:nth-child(1)", paletteEvent, { ignore: true }, palletElementClick);
        }

        function addColorToSelectionPalette(color) {
            if (showSelectionPalette) {
                var colorRgb = tinycolor(color).toRgbString();
                if ($.inArray(colorRgb, selectionPalette) === -1) {
                    selectionPalette.push(colorRgb);
                    while(selectionPalette.length > maxSelectionSize) {
                        selectionPalette.shift();
                    }
                }

                if (localStorageKey && window.localStorage) {
                    try {
                        window.localStorage[localStorageKey] = selectionPalette.join(";");
                    }
                    catch(e) { }
                }
            }
        }

        function getUniqueSelectionPalette() {
            var unique = [];
            var p = selectionPalette;
            var paletteLookup = {};
            var rgb;

            if (opts.showPalette) {

                for (var i = 0; i < paletteArray.length; i++) {
                    for (var j = 0; j < paletteArray[i].length; j++) {
                        rgb = tinycolor(paletteArray[i][j]).toRgbString();
                        paletteLookup[rgb] = true;
                    }
                }

                for (i = 0; i < p.length; i++) {
                    rgb = tinycolor(p[i]).toRgbString();

                    if (!paletteLookup.hasOwnProperty(rgb)) {
                        unique.push(p[i]);
                        paletteLookup[rgb] = true;
                    }
                }
            }

            return unique.reverse().slice(0, opts.maxSelectionSize);
        }

        function drawPalette() {

            var currentColor = get();

            var html = $.map(paletteArray, function (palette, i) {
                return paletteTemplate(palette, currentColor, "sp-palette-row sp-palette-row-" + i);
            });

            if (selectionPalette) {
                html.push(paletteTemplate(getUniqueSelectionPalette(), currentColor, "sp-palette-row sp-palette-row-selection"));
            }

            paletteContainer.html(html.join(""));
        }

        function drawInitial() {
            if (opts.showInitial) {
                var initial = colorOnShow;
                var current = get();
                initialColorContainer.html(paletteTemplate([initial, current], current, "sp-palette-row-initial"));
            }
        }

        function dragStart() {
            if (dragHeight <= 0 || dragWidth <= 0 || slideHeight <= 0) {
                reflow();
            }
            container.addClass(draggingClass);
            shiftMovementDirection = null;
        }

        function dragStop() {
            container.removeClass(draggingClass);
        }

        function setFromTextInput() {
            var tiny = tinycolor(textInput.val());
            if (tiny.ok) {
                set(tiny);
            }
            else {
                textInput.addClass("sp-validation-error");
            }
        }

        function toggle() {
            if (visible) {
                hide();
            }
            else {
                show();
            }
        }

        function show() {
            var event = $.Event('beforeShow.spectrum');

            if (visible) {
                reflow();
                return;
            }

            boundElement.trigger(event, [ get() ]);

            if (callbacks.beforeShow(get()) === false || event.isDefaultPrevented()) {
                return;
            }

            hideAll();
            visible = true;

            $(doc).bind("click.spectrum", hide);
            $(window).bind("resize.spectrum", resize);
            replacer.addClass("sp-active");
            container.removeClass("sp-hidden");

            if (opts.showPalette) {
                drawPalette();
            }
            reflow();
            updateUI();

            colorOnShow = get();

            drawInitial();
            callbacks.show(colorOnShow);
            boundElement.trigger('show.spectrum', [ colorOnShow ]);
        }

        function hide(e) {

            // Return on right click
            if (e && e.type == "click" && e.button == 2) { return; }

            // Return if hiding is unnecessary
            if (!visible || flat) { return; }
            visible = false;

            $(doc).unbind("click.spectrum", hide);
            $(window).unbind("resize.spectrum", resize);

            replacer.removeClass("sp-active");
            container.addClass("sp-hidden");

            var colorHasChanged = !tinycolor.equals(get(), colorOnShow);

            if (colorHasChanged) {
                if (clickoutFiresChange && e !== "cancel") {
                    updateOriginalInput(true);
                }
                else {
                    revert();
                }
            }

            callbacks.hide(get());
            boundElement.trigger('hide.spectrum', [ get() ]);
        }

        function revert() {
            set(colorOnShow, true);
        }

        function set(color, ignoreFormatChange) {
            if (tinycolor.equals(color, get())) {
                return;
            }

            var newColor = tinycolor(color);
            var newHsv = newColor.toHsv();

            currentHue = (newHsv.h % 360) / 360;
            currentSaturation = newHsv.s;
            currentValue = newHsv.v;
            currentAlpha = newHsv.a;

            updateUI();

            if (newColor.ok && !ignoreFormatChange) {
                currentPreferredFormat = preferredFormat || newColor.format;
            }
        }

        function get(opts) {
            opts = opts || { };
            return tinycolor.fromRatio({
                h: currentHue,
                s: currentSaturation,
                v: currentValue,
                a: Math.round(currentAlpha * 100) / 100
            }, { format: opts.format || currentPreferredFormat });
        }

        function isValid() {
            return !textInput.hasClass("sp-validation-error");
        }

        function move() {
            updateUI();

            callbacks.move(get());
            boundElement.trigger('move.spectrum', [ get() ]);
        }

        function updateUI() {

            textInput.removeClass("sp-validation-error");

            updateHelperLocations();

            // Update dragger background color (gradients take care of saturation and value).
            var flatColor = tinycolor.fromRatio({ h: currentHue, s: 1, v: 1 });
            dragger.css("background-color", flatColor.toHexString());

            // Get a format that alpha will be included in (hex and names ignore alpha)
            var format = currentPreferredFormat;
            if (currentAlpha < 1) {
                if (format === "hex" || format === "hex3" || format === "hex6" || format === "name") {
                    format = "rgb";
                }
            }

            var realColor = get({ format: format }),
                realHex = realColor.toHexString(),
                realRgb = realColor.toRgbString();

            // Update the replaced elements background color (with actual selected color)
            if (rgbaSupport || realColor.alpha === 1) {
                previewElement.css("background-color", realRgb);
            }
            else {
                previewElement.css("background-color", "transparent");
                previewElement.css("filter", realColor.toFilter());
            }

            if (opts.showAlpha) {
                var rgb = realColor.toRgb();
                rgb.a = 0;
                var realAlpha = tinycolor(rgb).toRgbString();
                var gradient = "linear-gradient(left, " + realAlpha + ", " + realHex + ")";

                if (IE) {
                    alphaSliderInner.css("filter", tinycolor(realAlpha).toFilter({ gradientType: 1 }, realHex));
                }
                else {
                    alphaSliderInner.css("background", "-webkit-" + gradient);
                    alphaSliderInner.css("background", "-moz-" + gradient);
                    alphaSliderInner.css("background", "-ms-" + gradient);
                    alphaSliderInner.css("background", gradient);
                }
            }


            // Update the text entry input as it changes happen
            if (opts.showInput) {
                textInput.val(realColor.toString(format));
            }

            if (opts.showPalette) {
                drawPalette();
            }

            drawInitial();
        }

        function updateHelperLocations() {
            var s = currentSaturation;
            var v = currentValue;

            // Where to show the little circle in that displays your current selected color
            var dragX = s * dragWidth;
            var dragY = dragHeight - (v * dragHeight);
            dragX = Math.max(
                -dragHelperHeight,
                Math.min(dragWidth - dragHelperHeight, dragX - dragHelperHeight)
            );
            dragY = Math.max(
                -dragHelperHeight,
                Math.min(dragHeight - dragHelperHeight, dragY - dragHelperHeight)
            );
            dragHelper.css({
                "top": dragY,
                "left": dragX
            });

            var alphaX = currentAlpha * alphaWidth;
            alphaSlideHelper.css({
                "left": alphaX - (alphaSlideHelperWidth / 2)
            });

            // Where to show the bar that displays your current selected hue
            var slideY = (currentHue) * slideHeight;
            slideHelper.css({
                "top": slideY - slideHelperHeight
            });
        }

        function updateOriginalInput(fireCallback) {
            var color = get();

            if (isInput) {
                boundElement.val(color.toString(currentPreferredFormat)).change();
            }

            var hasChanged = !tinycolor.equals(color, colorOnShow);
            colorOnShow = color;

            // Update the selection palette with the current color
            addColorToSelectionPalette(color);
            if (fireCallback && hasChanged) {
                callbacks.change(color);
                boundElement.trigger('change.spectrum', [ color ]);
            }
        }

        function reflow() {
            dragWidth = dragger.width();
            dragHeight = dragger.height();
            dragHelperHeight = dragHelper.height();
            slideWidth = slider.width();
            slideHeight = slider.height();
            slideHelperHeight = slideHelper.height();
            alphaWidth = alphaSlider.width();
            alphaSlideHelperWidth = alphaSlideHelper.width();

            if (!flat) {
                container.css("position", "absolute");
                container.offset(getOffset(container, offsetElement));
            }

            updateHelperLocations();
        }

        function destroy() {
            boundElement.show();
            offsetElement.unbind("click.spectrum touchstart.spectrum");
            container.remove();
            replacer.remove();
            spectrums[spect.id] = null;
        }

        function option(optionName, optionValue) {
            if (optionName === undefined) {
                return $.extend({}, opts);
            }
            if (optionValue === undefined) {
                return opts[optionName];
            }

            opts[optionName] = optionValue;
            applyOptions();
        }

        function enable() {
            disabled = false;
            boundElement.attr("disabled", false);
            offsetElement.removeClass("sp-disabled");
        }

        function disable() {
            hide();
            disabled = true;
            boundElement.attr("disabled", true);
            offsetElement.addClass("sp-disabled");
        }

        initialize();

        var spect = {
            show: show,
            hide: hide,
            toggle: toggle,
            reflow: reflow,
            option: option,
            enable: enable,
            disable: disable,
            set: function (c) {
                set(c);
                updateOriginalInput();
            },
            get: get,
            destroy: destroy,
            container: container
        };

        spect.id = spectrums.push(spect) - 1;

        return spect;
    }

    /**
    * checkOffset - get the offset below/above and left/right element depending on screen position
    * Thanks https://github.com/jquery/jquery-ui/blob/master/ui/jquery.ui.datepicker.js
    */
    function getOffset(picker, input) {
        var extraY = 0;
        var dpWidth = picker.outerWidth();
        var dpHeight = picker.outerHeight();
        var inputHeight = input.outerHeight();
        var doc = picker[0].ownerDocument;
        var docElem = doc.documentElement;
        var viewWidth = docElem.clientWidth + $(doc).scrollLeft();
        var viewHeight = docElem.clientHeight + $(doc).scrollTop();
        var offset = input.offset();
        offset.top += inputHeight;

        offset.left -=
            Math.min(offset.left, (offset.left + dpWidth > viewWidth && viewWidth > dpWidth) ?
            Math.abs(offset.left + dpWidth - viewWidth) : 0);

        offset.top -=
            Math.min(offset.top, ((offset.top + dpHeight > viewHeight && viewHeight > dpHeight) ?
            Math.abs(dpHeight + inputHeight - extraY) : extraY));

        return offset;
    }

    /**
    * noop - do nothing
    */
    function noop() {

    }

    /**
    * stopPropagation - makes the code only doing this a little easier to read in line
    */
    function stopPropagation(e) {
        e.stopPropagation();
    }

    /**
    * Create a function bound to a given object
    * Thanks to underscore.js
    */
    function bind(func, obj) {
        var slice = Array.prototype.slice;
        var args = slice.call(arguments, 2);
        return function () {
            return func.apply(obj, args.concat(slice.call(arguments)));
        };
    }

    /**
    * Lightweight drag helper.  Handles containment within the element, so that
    * when dragging, the x is within [0,element.width] and y is within [0,element.height]
    */
    function draggable(element, onmove, onstart, onstop) {
        onmove = onmove || function () { };
        onstart = onstart || function () { };
        onstop = onstop || function () { };
        var doc = element.ownerDocument || document;
        var dragging = false;
        var offset = {};
        var maxHeight = 0;
        var maxWidth = 0;
        var hasTouch = ('ontouchstart' in window);

        var duringDragEvents = {};
        duringDragEvents["selectstart"] = prevent;
        duringDragEvents["dragstart"] = prevent;
        duringDragEvents["touchmove mousemove"] = move;
        duringDragEvents["touchend mouseup"] = stop;

        function prevent(e) {
            if (e.stopPropagation) {
                e.stopPropagation();
            }
            if (e.preventDefault) {
                e.preventDefault();
            }
            e.returnValue = false;
        }

        function move(e) {
            if (dragging) {
                // Mouseup happened outside of window
                if (IE && document.documentMode < 9 && !e.button) {
                    return stop();
                }

                var touches = e.originalEvent.touches;
                var pageX = touches ? touches[0].pageX : e.pageX;
                var pageY = touches ? touches[0].pageY : e.pageY;

                var dragX = Math.max(0, Math.min(pageX - offset.left, maxWidth));
                var dragY = Math.max(0, Math.min(pageY - offset.top, maxHeight));

                if (hasTouch) {
                    // Stop scrolling in iOS
                    prevent(e);
                }

                onmove.apply(element, [dragX, dragY, e]);
            }
        }
        function start(e) {
            var rightclick = (e.which) ? (e.which == 3) : (e.button == 2);
            var touches = e.originalEvent.touches;

            if (!rightclick && !dragging) {
                if (onstart.apply(element, arguments) !== false) {
                    dragging = true;
                    maxHeight = $(element).height();
                    maxWidth = $(element).width();
                    offset = $(element).offset();

                    $(doc).bind(duringDragEvents);
                    $(doc.body).addClass("sp-dragging");

                    if (!hasTouch) {
                        move(e);
                    }

                    prevent(e);
                }
            }
        }
        function stop() {
            if (dragging) {
                $(doc).unbind(duringDragEvents);
                $(doc.body).removeClass("sp-dragging");
                onstop.apply(element, arguments);
            }
            dragging = false;
        }

        $(element).bind("touchstart mousedown", start);
    }

    function throttle(func, wait, debounce) {
        var timeout;
        return function () {
            var context = this, args = arguments;
            var throttler = function () {
                timeout = null;
                func.apply(context, args);
            };
            if (debounce) clearTimeout(timeout);
            if (debounce || !timeout) timeout = setTimeout(throttler, wait);
        };
    }


    function log(){/* jshint -W021 */if(window.console){if(Function.prototype.bind)log=Function.prototype.bind.call(console.log,console);else log=function(){Function.prototype.apply.call(console.log,console,arguments);};log.apply(this,arguments);}}

    /**
    * Define a jQuery plugin
    */
    var dataID = "spectrum.id";
    $.fn.spectrum = function (opts, extra) {

        if (typeof opts == "string") {

            var returnValue = this;
            var args = Array.prototype.slice.call( arguments, 1 );

            this.each(function () {
                var spect = spectrums[$(this).data(dataID)];
                if (spect) {

                    var method = spect[opts];
                    if (!method) {
                        throw new Error( "Spectrum: no such method: '" + opts + "'" );
                    }

                    if (opts == "get") {
                        returnValue = spect.get();
                    }
                    else if (opts == "container") {
                        returnValue = spect.container;
                    }
                    else if (opts == "option") {
                        returnValue = spect.option.apply(spect, args);
                    }
                    else if (opts == "destroy") {
                        spect.destroy();
                        $(this).removeData(dataID);
                    }
                    else {
                        method.apply(spect, args);
                    }
                }
            });

            return returnValue;
        }

        // Initializing a new instance of spectrum
        return this.spectrum("destroy").each(function () {
            var spect = spectrum(this, opts);
            $(this).data(dataID, spect.id);
        });
    };

    $.fn.spectrum.load = true;
    $.fn.spectrum.loadOpts = {};
    $.fn.spectrum.draggable = draggable;
    $.fn.spectrum.defaults = defaultOpts;

    $.spectrum = { };
    $.spectrum.localization = { };
    $.spectrum.palettes = { };

    $.fn.spectrum.processNativeColorInputs = function () {
        var colorInput = $("<input type='color' value='!' />")[0];
        var supportsColor = colorInput.type === "color" && colorInput.value != "!";

        if (!supportsColor) {
            $("input[type=color]").spectrum({
                preferredFormat: "hex6"
            });
        }
    };
    // TinyColor v0.9.14
    // https://github.com/bgrins/TinyColor
    // 2013-02-24, Brian Grinstead, MIT License

    (function(root) {

        var trimLeft = /^[\s,#]+/,
            trimRight = /\s+$/,
            tinyCounter = 0,
            math = Math,
            mathRound = math.round,
            mathMin = math.min,
            mathMax = math.max,
            mathRandom = math.random;

        function tinycolor (color, opts) {

            color = (color) ? color : '';
            opts = opts || { };

            // If input is already a tinycolor, return itself
            if (typeof color == "object" && color.hasOwnProperty("_tc_id")) {
               return color;
            }
            var rgb = inputToRGB(color);
            var r = rgb.r,
                g = rgb.g,
                b = rgb.b,
                a = rgb.a,
                roundA = mathRound(100*a) / 100,
                format = opts.format || rgb.format;

            // Don't let the range of [0,255] come back in [0,1].
            // Potentially lose a little bit of precision here, but will fix issues where
            // .5 gets interpreted as half of the total, instead of half of 1
            // If it was supposed to be 128, this was already taken care of by `inputToRgb`
            if (r < 1) { r = mathRound(r); }
            if (g < 1) { g = mathRound(g); }
            if (b < 1) { b = mathRound(b); }

            return {
                ok: rgb.ok,
                format: format,
                _tc_id: tinyCounter++,
                alpha: a,
                toHsv: function() {
                    var hsv = rgbToHsv(r, g, b);
                    return { h: hsv.h * 360, s: hsv.s, v: hsv.v, a: a };
                },
                toHsvString: function() {
                    var hsv = rgbToHsv(r, g, b);
                    var h = mathRound(hsv.h * 360), s = mathRound(hsv.s * 100), v = mathRound(hsv.v * 100);
                    return (a == 1) ?
                      "hsv("  + h + ", " + s + "%, " + v + "%)" :
                      "hsva(" + h + ", " + s + "%, " + v + "%, "+ roundA + ")";
                },
                toHsl: function() {
                    var hsl = rgbToHsl(r, g, b);
                    return { h: hsl.h * 360, s: hsl.s, l: hsl.l, a: a };
                },
                toHslString: function() {
                    var hsl = rgbToHsl(r, g, b);
                    var h = mathRound(hsl.h * 360), s = mathRound(hsl.s * 100), l = mathRound(hsl.l * 100);
                    return (a == 1) ?
                      "hsl("  + h + ", " + s + "%, " + l + "%)" :
                      "hsla(" + h + ", " + s + "%, " + l + "%, "+ roundA + ")";
                },
                toHex: function(allow3Char) {
                    return rgbToHex(r, g, b, allow3Char);
                },
                toHexString: function(allow3Char) {
                    return '#' + rgbToHex(r, g, b, allow3Char);
                },
                toRgb: function() {
                    return { r: mathRound(r), g: mathRound(g), b: mathRound(b), a: a };
                },
                toRgbString: function() {
                    return (a == 1) ?
                      "rgb("  + mathRound(r) + ", " + mathRound(g) + ", " + mathRound(b) + ")" :
                      "rgba(" + mathRound(r) + ", " + mathRound(g) + ", " + mathRound(b) + ", " + roundA + ")";
                },
                toPercentageRgb: function() {
                    return { r: mathRound(bound01(r, 255) * 100) + "%", g: mathRound(bound01(g, 255) * 100) + "%", b: mathRound(bound01(b, 255) * 100) + "%", a: a };
                },
                toPercentageRgbString: function() {
                    return (a == 1) ?
                      "rgb("  + mathRound(bound01(r, 255) * 100) + "%, " + mathRound(bound01(g, 255) * 100) + "%, " + mathRound(bound01(b, 255) * 100) + "%)" :
                      "rgba(" + mathRound(bound01(r, 255) * 100) + "%, " + mathRound(bound01(g, 255) * 100) + "%, " + mathRound(bound01(b, 255) * 100) + "%, " + roundA + ")";
                },
                toName: function() {
                    return hexNames[rgbToHex(r, g, b, true)] || false;
                },
                toFilter: function(secondColor) {
                    var hex = rgbToHex(r, g, b);
                    var secondHex = hex;
                    var alphaHex = Math.round(parseFloat(a) * 255).toString(16);
                    var secondAlphaHex = alphaHex;
                    var gradientType = opts && opts.gradientType ? "GradientType = 1, " : "";

                    if (secondColor) {
                        var s = tinycolor(secondColor);
                        secondHex = s.toHex();
                        secondAlphaHex = Math.round(parseFloat(s.alpha) * 255).toString(16);
                    }

                    return "progid:DXImageTransform.Microsoft.gradient("+gradientType+"startColorstr=#" + pad2(alphaHex) + hex + ",endColorstr=#" + pad2(secondAlphaHex) + secondHex + ")";
                },
                toString: function(format) {
                    format = format || this.format;
                    var formattedString = false;
                    if (format === "rgb") {
                        formattedString = this.toRgbString();
                    }
                    if (format === "prgb") {
                        formattedString = this.toPercentageRgbString();
                    }
                    if (format === "hex" || format === "hex6") {
                        formattedString = this.toHexString();
                    }
                    if (format === "hex3") {
                        formattedString = this.toHexString(true);
                    }
                    if (format === "name") {
                        formattedString = this.toName();
                    }
                    if (format === "hsl") {
                        formattedString = this.toHslString();
                    }
                    if (format === "hsv") {
                        formattedString = this.toHsvString();
                    }

                    return formattedString || this.toHexString();
                }
            };
        }

        // If input is an object, force 1 into "1.0" to handle ratios properly
        // String input requires "1.0" as input, so 1 will be treated as 1
        tinycolor.fromRatio = function(color, opts) {
            if (typeof color == "object") {
                var newColor = {};
                for (var i in color) {
                    if (color.hasOwnProperty(i)) {
                        if (i === "a") {
                            newColor[i] = color[i];
                        }
                        else {
                            newColor[i] = convertToPercentage(color[i]);
                        }
                    }
                }
                color = newColor;
            }

            return tinycolor(color, opts);
        };

        // Given a string or object, convert that input to RGB
        // Possible string inputs:
        //
        //     "red"
        //     "#f00" or "f00"
        //     "#ff0000" or "ff0000"
        //     "rgb 255 0 0" or "rgb (255, 0, 0)"
        //     "rgb 1.0 0 0" or "rgb (1, 0, 0)"
        //     "rgba (255, 0, 0, 1)" or "rgba 255, 0, 0, 1"
        //     "rgba (1.0, 0, 0, 1)" or "rgba 1.0, 0, 0, 1"
        //     "hsl(0, 100%, 50%)" or "hsl 0 100% 50%"
        //     "hsla(0, 100%, 50%, 1)" or "hsla 0 100% 50%, 1"
        //     "hsv(0, 100%, 100%)" or "hsv 0 100% 100%"
        //
        function inputToRGB(color) {

            var rgb = { r: 0, g: 0, b: 0 };
            var a = 1;
            var ok = false;
            var format = false;

            if (typeof color == "string") {
                color = stringInputToObject(color);
            }

            if (typeof color == "object") {
                if (color.hasOwnProperty("r") && color.hasOwnProperty("g") && color.hasOwnProperty("b")) {
                    rgb = rgbToRgb(color.r, color.g, color.b);
                    ok = true;
                    format = String(color.r).substr(-1) === "%" ? "prgb" : "rgb";
                }
                else if (color.hasOwnProperty("h") && color.hasOwnProperty("s") && color.hasOwnProperty("v")) {
                    color.s = convertToPercentage(color.s);
                    color.v = convertToPercentage(color.v);
                    rgb = hsvToRgb(color.h, color.s, color.v);
                    ok = true;
                    format = "hsv";
                }
                else if (color.hasOwnProperty("h") && color.hasOwnProperty("s") && color.hasOwnProperty("l")) {
                    color.s = convertToPercentage(color.s);
                    color.l = convertToPercentage(color.l);
                    rgb = hslToRgb(color.h, color.s, color.l);
                    ok = true;
                    format = "hsl";
                }

                if (color.hasOwnProperty("a")) {
                    a = color.a;
                }
            }

            a = parseFloat(a);

            // Handle invalid alpha characters by setting to 1
            if (isNaN(a) || a < 0 || a > 1) {
                a = 1;
            }

            return {
                ok: ok,
                format: color.format || format,
                r: mathMin(255, mathMax(rgb.r, 0)),
                g: mathMin(255, mathMax(rgb.g, 0)),
                b: mathMin(255, mathMax(rgb.b, 0)),
                a: a
            };
        }



        // Conversion Functions
        // --------------------

        // `rgbToHsl`, `rgbToHsv`, `hslToRgb`, `hsvToRgb` modified from:
        // <http://mjijackson.com/2008/02/rgb-to-hsl-and-rgb-to-hsv-color-model-conversion-algorithms-in-javascript>

        // `rgbToRgb`
        // Handle bounds / percentage checking to conform to CSS color spec
        // <http://www.w3.org/TR/css3-color/>
        // *Assumes:* r, g, b in [0, 255] or [0, 1]
        // *Returns:* { r, g, b } in [0, 255]
        function rgbToRgb(r, g, b){
            return {
                r: bound01(r, 255) * 255,
                g: bound01(g, 255) * 255,
                b: bound01(b, 255) * 255
            };
        }

        // `rgbToHsl`
        // Converts an RGB color value to HSL.
        // *Assumes:* r, g, and b are contained in [0, 255] or [0, 1]
        // *Returns:* { h, s, l } in [0,1]
        function rgbToHsl(r, g, b) {

            r = bound01(r, 255);
            g = bound01(g, 255);
            b = bound01(b, 255);

            var max = mathMax(r, g, b), min = mathMin(r, g, b);
            var h, s, l = (max + min) / 2;

            if(max == min) {
                h = s = 0; // achromatic
            }
            else {
                var d = max - min;
                s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
                switch(max) {
                    case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                    case g: h = (b - r) / d + 2; break;
                    case b: h = (r - g) / d + 4; break;
                }

                h /= 6;
            }

            return { h: h, s: s, l: l };
        }

        // `hslToRgb`
        // Converts an HSL color value to RGB.
        // *Assumes:* h is contained in [0, 1] or [0, 360] and s and l are contained [0, 1] or [0, 100]
        // *Returns:* { r, g, b } in the set [0, 255]
        function hslToRgb(h, s, l) {
            var r, g, b;

            h = bound01(h, 360);
            s = bound01(s, 100);
            l = bound01(l, 100);

            function hue2rgb(p, q, t) {
                if(t < 0) t += 1;
                if(t > 1) t -= 1;
                if(t < 1/6) return p + (q - p) * 6 * t;
                if(t < 1/2) return q;
                if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            }

            if(s === 0) {
                r = g = b = l; // achromatic
            }
            else {
                var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
                var p = 2 * l - q;
                r = hue2rgb(p, q, h + 1/3);
                g = hue2rgb(p, q, h);
                b = hue2rgb(p, q, h - 1/3);
            }

            return { r: r * 255, g: g * 255, b: b * 255 };
        }

        // `rgbToHsv`
        // Converts an RGB color value to HSV
        // *Assumes:* r, g, and b are contained in the set [0, 255] or [0, 1]
        // *Returns:* { h, s, v } in [0,1]
        function rgbToHsv(r, g, b) {

            r = bound01(r, 255);
            g = bound01(g, 255);
            b = bound01(b, 255);

            var max = mathMax(r, g, b), min = mathMin(r, g, b);
            var h, s, v = max;

            var d = max - min;
            s = max === 0 ? 0 : d / max;

            if(max == min) {
                h = 0; // achromatic
            }
            else {
                switch(max) {
                    case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                    case g: h = (b - r) / d + 2; break;
                    case b: h = (r - g) / d + 4; break;
                }
                h /= 6;
            }
            return { h: h, s: s, v: v };
        }

        // `hsvToRgb`
        // Converts an HSV color value to RGB.
        // *Assumes:* h is contained in [0, 1] or [0, 360] and s and v are contained in [0, 1] or [0, 100]
        // *Returns:* { r, g, b } in the set [0, 255]
         function hsvToRgb(h, s, v) {

            h = bound01(h, 360) * 6;
            s = bound01(s, 100);
            v = bound01(v, 100);

            var i = math.floor(h),
                f = h - i,
                p = v * (1 - s),
                q = v * (1 - f * s),
                t = v * (1 - (1 - f) * s),
                mod = i % 6,
                r = [v, q, p, p, t, v][mod],
                g = [t, v, v, q, p, p][mod],
                b = [p, p, t, v, v, q][mod];

            return { r: r * 255, g: g * 255, b: b * 255 };
        }

        // `rgbToHex`
        // Converts an RGB color to hex
        // Assumes r, g, and b are contained in the set [0, 255]
        // Returns a 3 or 6 character hex
        function rgbToHex(r, g, b, allow3Char) {

            var hex = [
                pad2(mathRound(r).toString(16)),
                pad2(mathRound(g).toString(16)),
                pad2(mathRound(b).toString(16))
            ];

            // Return a 3 character hex if possible
            if (allow3Char && hex[0].charAt(0) == hex[0].charAt(1) && hex[1].charAt(0) == hex[1].charAt(1) && hex[2].charAt(0) == hex[2].charAt(1)) {
                return hex[0].charAt(0) + hex[1].charAt(0) + hex[2].charAt(0);
            }

            return hex.join("");
        }

        // `equals`
        // Can be called with any tinycolor input
        tinycolor.equals = function (color1, color2) {
            if (!color1 || !color2) { return false; }
            return tinycolor(color1).toRgbString() == tinycolor(color2).toRgbString();
        };
        tinycolor.random = function() {
            return tinycolor.fromRatio({
                r: mathRandom(),
                g: mathRandom(),
                b: mathRandom()
            });
        };


        // Modification Functions
        // ----------------------
        // Thanks to less.js for some of the basics here
        // <https://github.com/cloudhead/less.js/blob/master/lib/less/functions.js>


        tinycolor.desaturate = function (color, amount) {
            var hsl = tinycolor(color).toHsl();
            hsl.s -= ((amount || 10) / 100);
            hsl.s = clamp01(hsl.s);
            return tinycolor(hsl);
        };
        tinycolor.saturate = function (color, amount) {
            var hsl = tinycolor(color).toHsl();
            hsl.s += ((amount || 10) / 100);
            hsl.s = clamp01(hsl.s);
            return tinycolor(hsl);
        };
        tinycolor.greyscale = function(color) {
            return tinycolor.desaturate(color, 100);
        };
        tinycolor.lighten = function(color, amount) {
            var hsl = tinycolor(color).toHsl();
            hsl.l += ((amount || 10) / 100);
            hsl.l = clamp01(hsl.l);
            return tinycolor(hsl);
        };
        tinycolor.darken = function (color, amount) {
            var hsl = tinycolor(color).toHsl();
            hsl.l -= ((amount || 10) / 100);
            hsl.l = clamp01(hsl.l);
            return tinycolor(hsl);
        };
        tinycolor.complement = function(color) {
            var hsl = tinycolor(color).toHsl();
            hsl.h = (hsl.h + 180) % 360;
            return tinycolor(hsl);
        };


        // Combination Functions
        // ---------------------
        // Thanks to jQuery xColor for some of the ideas behind these
        // <https://github.com/infusion/jQuery-xcolor/blob/master/jquery.xcolor.js>

        tinycolor.triad = function(color) {
            var hsl = tinycolor(color).toHsl();
            var h = hsl.h;
            return [
                tinycolor(color),
                tinycolor({ h: (h + 120) % 360, s: hsl.s, l: hsl.l }),
                tinycolor({ h: (h + 240) % 360, s: hsl.s, l: hsl.l })
            ];
        };
        tinycolor.tetrad = function(color) {
            var hsl = tinycolor(color).toHsl();
            var h = hsl.h;
            return [
                tinycolor(color),
                tinycolor({ h: (h + 90) % 360, s: hsl.s, l: hsl.l }),
                tinycolor({ h: (h + 180) % 360, s: hsl.s, l: hsl.l }),
                tinycolor({ h: (h + 270) % 360, s: hsl.s, l: hsl.l })
            ];
        };
        tinycolor.splitcomplement = function(color) {
            var hsl = tinycolor(color).toHsl();
            var h = hsl.h;
            return [
                tinycolor(color),
                tinycolor({ h: (h + 72) % 360, s: hsl.s, l: hsl.l}),
                tinycolor({ h: (h + 216) % 360, s: hsl.s, l: hsl.l})
            ];
        };
        tinycolor.analogous = function(color, results, slices) {
            results = results || 6;
            slices = slices || 30;

            var hsl = tinycolor(color).toHsl();
            var part = 360 / slices;
            var ret = [tinycolor(color)];

            for (hsl.h = ((hsl.h - (part * results >> 1)) + 720) % 360; --results; ) {
                hsl.h = (hsl.h + part) % 360;
                ret.push(tinycolor(hsl));
            }
            return ret;
        };
        tinycolor.monochromatic = function(color, results) {
            results = results || 6;
            var hsv = tinycolor(color).toHsv();
            var h = hsv.h, s = hsv.s, v = hsv.v;
            var ret = [];
            var modification = 1 / results;

            while (results--) {
                ret.push(tinycolor({ h: h, s: s, v: v}));
                v = (v + modification) % 1;
            }

            return ret;
        };

        // Readability Functions
        // ---------------------
        // <http://www.w3.org/TR/AERT#color-contrast>

        // `readability`
        // Analyze the 2 colors and returns an object with the following properties:
        //    `brightness`: difference in brightness between the two colors
        //    `color`: difference in color/hue between the two colors
        tinycolor.readability = function(color1, color2) {
            var a = tinycolor(color1).toRgb();
            var b = tinycolor(color2).toRgb();
            var brightnessA = (a.r * 299 + a.g * 587 + a.b * 114) / 1000;
            var brightnessB = (b.r * 299 + b.g * 587 + b.b * 114) / 1000;
            var colorDiff = (
                Math.max(a.r, b.r) - Math.min(a.r, b.r) +
                Math.max(a.g, b.g) - Math.min(a.g, b.g) +
                Math.max(a.b, b.b) - Math.min(a.b, b.b)
            );

            return {
                brightness: Math.abs(brightnessA - brightnessB),
                color: colorDiff
            };
        };

        // `readable`
        // http://www.w3.org/TR/AERT#color-contrast
        // Ensure that foreground and background color combinations provide sufficient contrast.
        // *Example*
        //    tinycolor.readable("#000", "#111") => false
        tinycolor.readable = function(color1, color2) {
            var readability = tinycolor.readability(color1, color2);
            return readability.brightness > 125 && readability.color > 500;
        };

        // `mostReadable`
        // Given a base color and a list of possible foreground or background
        // colors for that base, returns the most readable color.
        // *Example*
        //    tinycolor.mostReadable("#123", ["#fff", "#000"]) => "#000"
        tinycolor.mostReadable = function(baseColor, colorList) {
            var bestColor = null;
            var bestScore = 0;
            var bestIsReadable = false;
            for (var i=0; i < colorList.length; i++) {

                // We normalize both around the "acceptable" breaking point,
                // but rank brightness constrast higher than hue.

                var readability = tinycolor.readability(baseColor, colorList[i]);
                var readable = readability.brightness > 125 && readability.color > 500;
                var score = 3 * (readability.brightness / 125) + (readability.color / 500);

                if ((readable && ! bestIsReadable) ||
                    (readable && bestIsReadable && score > bestScore) ||
                    ((! readable) && (! bestIsReadable) && score > bestScore)) {
                    bestIsReadable = readable;
                    bestScore = score;
                    bestColor = tinycolor(colorList[i]);
                }
            }
            return bestColor;
        };


        // Big List of Colors
        // ------------------
        // <http://www.w3.org/TR/css3-color/#svg-color>
        var names = tinycolor.names = {
            aliceblue: "f0f8ff",
            antiquewhite: "faebd7",
            aqua: "0ff",
            aquamarine: "7fffd4",
            azure: "f0ffff",
            beige: "f5f5dc",
            bisque: "ffe4c4",
            black: "000",
            blanchedalmond: "ffebcd",
            blue: "00f",
            blueviolet: "8a2be2",
            brown: "a52a2a",
            burlywood: "deb887",
            burntsienna: "ea7e5d",
            cadetblue: "5f9ea0",
            chartreuse: "7fff00",
            chocolate: "d2691e",
            coral: "ff7f50",
            cornflowerblue: "6495ed",
            cornsilk: "fff8dc",
            crimson: "dc143c",
            cyan: "0ff",
            darkblue: "00008b",
            darkcyan: "008b8b",
            darkgoldenrod: "b8860b",
            darkgray: "a9a9a9",
            darkgreen: "006400",
            darkgrey: "a9a9a9",
            darkkhaki: "bdb76b",
            darkmagenta: "8b008b",
            darkolivegreen: "556b2f",
            darkorange: "ff8c00",
            darkorchid: "9932cc",
            darkred: "8b0000",
            darksalmon: "e9967a",
            darkseagreen: "8fbc8f",
            darkslateblue: "483d8b",
            darkslategray: "2f4f4f",
            darkslategrey: "2f4f4f",
            darkturquoise: "00ced1",
            darkviolet: "9400d3",
            deeppink: "ff1493",
            deepskyblue: "00bfff",
            dimgray: "696969",
            dimgrey: "696969",
            dodgerblue: "1e90ff",
            firebrick: "b22222",
            floralwhite: "fffaf0",
            forestgreen: "228b22",
            fuchsia: "f0f",
            gainsboro: "dcdcdc",
            ghostwhite: "f8f8ff",
            gold: "ffd700",
            goldenrod: "daa520",
            gray: "808080",
            green: "008000",
            greenyellow: "adff2f",
            grey: "808080",
            honeydew: "f0fff0",
            hotpink: "ff69b4",
            indianred: "cd5c5c",
            indigo: "4b0082",
            ivory: "fffff0",
            khaki: "f0e68c",
            lavender: "e6e6fa",
            lavenderblush: "fff0f5",
            lawngreen: "7cfc00",
            lemonchiffon: "fffacd",
            lightblue: "add8e6",
            lightcoral: "f08080",
            lightcyan: "e0ffff",
            lightgoldenrodyellow: "fafad2",
            lightgray: "d3d3d3",
            lightgreen: "90ee90",
            lightgrey: "d3d3d3",
            lightpink: "ffb6c1",
            lightsalmon: "ffa07a",
            lightseagreen: "20b2aa",
            lightskyblue: "87cefa",
            lightslategray: "789",
            lightslategrey: "789",
            lightsteelblue: "b0c4de",
            lightyellow: "ffffe0",
            lime: "0f0",
            limegreen: "32cd32",
            linen: "faf0e6",
            magenta: "f0f",
            maroon: "800000",
            mediumaquamarine: "66cdaa",
            mediumblue: "0000cd",
            mediumorchid: "ba55d3",
            mediumpurple: "9370db",
            mediumseagreen: "3cb371",
            mediumslateblue: "7b68ee",
            mediumspringgreen: "00fa9a",
            mediumturquoise: "48d1cc",
            mediumvioletred: "c71585",
            midnightblue: "191970",
            mintcream: "f5fffa",
            mistyrose: "ffe4e1",
            moccasin: "ffe4b5",
            navajowhite: "ffdead",
            navy: "000080",
            oldlace: "fdf5e6",
            olive: "808000",
            olivedrab: "6b8e23",
            orange: "ffa500",
            orangered: "ff4500",
            orchid: "da70d6",
            palegoldenrod: "eee8aa",
            palegreen: "98fb98",
            paleturquoise: "afeeee",
            palevioletred: "db7093",
            papayawhip: "ffefd5",
            peachpuff: "ffdab9",
            peru: "cd853f",
            pink: "ffc0cb",
            plum: "dda0dd",
            powderblue: "b0e0e6",
            purple: "800080",
            red: "f00",
            rosybrown: "bc8f8f",
            royalblue: "4169e1",
            saddlebrown: "8b4513",
            salmon: "fa8072",
            sandybrown: "f4a460",
            seagreen: "2e8b57",
            seashell: "fff5ee",
            sienna: "a0522d",
            silver: "c0c0c0",
            skyblue: "87ceeb",
            slateblue: "6a5acd",
            slategray: "708090",
            slategrey: "708090",
            snow: "fffafa",
            springgreen: "00ff7f",
            steelblue: "4682b4",
            tan: "d2b48c",
            teal: "008080",
            thistle: "d8bfd8",
            tomato: "ff6347",
            turquoise: "40e0d0",
            violet: "ee82ee",
            wheat: "f5deb3",
            white: "fff",
            whitesmoke: "f5f5f5",
            yellow: "ff0",
            yellowgreen: "9acd32"
        };

        // Make it easy to access colors via `hexNames[hex]`
        var hexNames = tinycolor.hexNames = flip(names);


        // Utilities
        // ---------

        // `{ 'name1': 'val1' }` becomes `{ 'val1': 'name1' }`
        function flip(o) {
            var flipped = { };
            for (var i in o) {
                if (o.hasOwnProperty(i)) {
                    flipped[o[i]] = i;
                }
            }
            return flipped;
        }

        // Take input from [0, n] and return it as [0, 1]
        function bound01(n, max) {
            if (isOnePointZero(n)) { n = "100%"; }

            var processPercent = isPercentage(n);
            n = mathMin(max, mathMax(0, parseFloat(n)));

            // Automatically convert percentage into number
            if (processPercent) {
                n = parseInt(n * max, 10) / 100;
            }

            // Handle floating point rounding errors
            if ((math.abs(n - max) < 0.000001)) {
                return 1;
            }

            // Convert into [0, 1] range if it isn't already
            return (n % max) / parseFloat(max);
        }

        // Force a number between 0 and 1
        function clamp01(val) {
            return mathMin(1, mathMax(0, val));
        }

        // Parse an integer into hex
        function parseHex(val) {
            return parseInt(val, 16);
        }

        // Need to handle 1.0 as 100%, since once it is a number, there is no difference between it and 1
        // <http://stackoverflow.com/questions/7422072/javascript-how-to-detect-number-as-a-decimal-including-1-0>
        function isOnePointZero(n) {
            return typeof n == "string" && n.indexOf('.') != -1 && parseFloat(n) === 1;
        }

        // Check to see if string passed in is a percentage
        function isPercentage(n) {
            return typeof n === "string" && n.indexOf('%') != -1;
        }

        // Force a hex value to have 2 characters
        function pad2(c) {
            return c.length == 1 ? '0' + c : '' + c;
        }

        // Replace a decimal with it's percentage value
        function convertToPercentage(n) {
            if (n <= 1) {
                n = (n * 100) + "%";
            }

            return n;
        }

        var matchers = (function() {

            // <http://www.w3.org/TR/css3-values/#integers>
            var CSS_INTEGER = "[-\\+]?\\d+%?";

            // <http://www.w3.org/TR/css3-values/#number-value>
            var CSS_NUMBER = "[-\\+]?\\d*\\.\\d+%?";

            // Allow positive/negative integer/number.  Don't capture the either/or, just the entire outcome.
            var CSS_UNIT = "(?:" + CSS_NUMBER + ")|(?:" + CSS_INTEGER + ")";

            // Actual matching.
            // Parentheses and commas are optional, but not required.
            // Whitespace can take the place of commas or opening paren
            var PERMISSIVE_MATCH3 = "[\\s|\\(]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")\\s*\\)?";
            var PERMISSIVE_MATCH4 = "[\\s|\\(]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")\\s*\\)?";

            return {
                rgb: new RegExp("rgb" + PERMISSIVE_MATCH3),
                rgba: new RegExp("rgba" + PERMISSIVE_MATCH4),
                hsl: new RegExp("hsl" + PERMISSIVE_MATCH3),
                hsla: new RegExp("hsla" + PERMISSIVE_MATCH4),
                hsv: new RegExp("hsv" + PERMISSIVE_MATCH3),
                hex3: /^([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/,
                hex6: /^([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/
            };
        })();

        // `stringInputToObject`
        // Permissive string parsing.  Take in a number of formats, and output an object
        // based on detected format.  Returns `{ r, g, b }` or `{ h, s, l }` or `{ h, s, v}`
        function stringInputToObject(color) {

            color = color.replace(trimLeft,'').replace(trimRight, '').toLowerCase();
            var named = false;
            if (names[color]) {
                color = names[color];
                named = true;
            }
            else if (color == 'transparent') {
                return { r: 0, g: 0, b: 0, a: 0 };
            }

            // Try to match string input using regular expressions.
            // Keep most of the number bounding out of this function - don't worry about [0,1] or [0,100] or [0,360]
            // Just return an object and let the conversion functions handle that.
            // This way the result will be the same whether the tinycolor is initialized with string or object.
            var match;
            if ((match = matchers.rgb.exec(color))) {
                return { r: match[1], g: match[2], b: match[3] };
            }
            if ((match = matchers.rgba.exec(color))) {
                return { r: match[1], g: match[2], b: match[3], a: match[4] };
            }
            if ((match = matchers.hsl.exec(color))) {
                return { h: match[1], s: match[2], l: match[3] };
            }
            if ((match = matchers.hsla.exec(color))) {
                return { h: match[1], s: match[2], l: match[3], a: match[4] };
            }
            if ((match = matchers.hsv.exec(color))) {
                return { h: match[1], s: match[2], v: match[3] };
            }
            if ((match = matchers.hex6.exec(color))) {
                return {
                    r: parseHex(match[1]),
                    g: parseHex(match[2]),
                    b: parseHex(match[3]),
                    format: named ? "name" : "hex"
                };
            }
            if ((match = matchers.hex3.exec(color))) {
                return {
                    r: parseHex(match[1] + '' + match[1]),
                    g: parseHex(match[2] + '' + match[2]),
                    b: parseHex(match[3] + '' + match[3]),
                    format: named ? "name" : "hex"
                };
            }

            return false;
        }

        root.tinycolor = tinycolor;

    })(this);

    $(function () {
        if ($.fn.spectrum.load) {
            $.fn.spectrum.processNativeColorInputs();
        }
    });

})(window, jQuery);
;var PhotoFrame = {};

(function($) {
	
	/**
	 * An object of PhotoFrame.Database objects
	 */
	 
	PhotoFrame.Model  = {};	
	
	/**
	 * An array of PhotoFrame.Factory objects
	 */
	 
	PhotoFrame.instances = [];
	
	/**
	 * An array of PhotoFrame.Factory matrix objects
	 */
	 
	PhotoFrame.matrix    = [];
	
	/**
	 * An array of PhotoFrame.Button objects
	 */
	 
	PhotoFrame.Buttons   = [];


	PhotoFrame.Class = Base.extend({
		
		/**
		 * Build Date
		 */
		 
		buildDate: '2013-09-05',
		
		/**
		 * Version
		 */
		 
		version: '1.2.0',
		
		/**
		 * Sets the default options
		 *
		 * @param	object 	The default options
		 * @param	object 	The override options
		 */
		 
		constructor: function(_default, options) {
			if(typeof _default != "object") {
				var _default = {};
			}
			if(typeof options != "object") {
				var options = {};
			}
			this.setOptions($.extend(true, {}, _default, options));
		},
		
		/**
		 * Delegates the callback to the defined method
		 *
		 * @param	object 	The default options
		 * @param	object 	The override options
		 */
		 
		callback: function(method) {
		 	if(typeof method === "function") {
				var args = [];
								
				for(var x = 1; x <= arguments.length; x++) {
					if(arguments[x]) {
						args.push(arguments[x]);
					}
				}
				
				method.apply(this, args);
			}
		},
		 
		/**
		 * Log a string into the console if it exists
		 *
		 * @param 	string 	The name of the option
		 * @return	mixed
		 */		
		 
		log: function(str) {
			if(window.console && console.log) {
				console.log(str);
			}
		},
		 
		/**
		 * Get an single option value. Returns false if option does not exist
		 *
		 * @param 	string 	The name of the option
		 * @return	mixed
		 */		
		 
		getOption: function(index) {
			if(this[index]) {
				return this[index];
			}
			return false;
		},
		
		/**
		 * Get all options
		 *
		 * @return	bool
		 */		
		 
		getOptions: function() {
			return this;
		},
		
		/**
		 * Set a single option value
		 *
		 * @param 	string 	The name of the option
		 * @param 	mixed 	The value of the option
		 */		
		 
		setOption: function(index, value) {
			this[index] = value;
		},
		
		/**
		 * Set a multiple options by passing a JSON object
		 *
		 * @param 	object 	The object with the options
		 * @param 	mixed 	The value of the option
		 */		
		
		setOptions: function(options) {
  			for(key in options) {
	  			this.setOption(key, options[key]);
  			}
		},
		
		/**
		 * Remove an index from an array
		 *
		 * @param 	array 	The subject array
		 * @param 	int 	The index to remove from the array
		 * @return  array
		 */		
		
		removeIndex: function(array, index) {
			 for(var i=0; i<array.length; i++) {
		        if(array[i] == index) {
		            array.splice(i, 1);
		            break;
		        }
		    }
		    
		    return array;
		},

		/**
		 * Parse string into a JSON object (or array)
		 *
		 * @param 	string 	The string to parse
		 * @return  mixed
		 */		
		
		jsonEncode: function(str) {
			return JSON.parse(str);
		},

		/**
		 * Convert a JSON object (or array) to a string
		 *
		 * @param 	mixed 	The value to decode
		 * @return  string
		 */		
		
		jsonDecode: function(obj) {
			return JSON.stringify(obj);
		},

		isRetina: function() {
			return window.devicePixelRatio > 1;
		}

	});
	
	PhotoFrame.BaseElement = PhotoFrame.Class.extend({

		/**
		 * An object of callback methods
		 */	
		 
		callbacks: {},

		/**
		 * The PhotoFrame.Factory object
		 */	

		factory: false,

		/**
		 * The object's unique identifier (optional)
		 */	

		id: false,

		/**
		 * The parent jQuery object
		 */	

		parent: false,

		/**
		 * An object of UI elements
		 */	
		 
		ui: {},

		constructor: function(factory, parent, options) {
			var t 		  = this;
			var callbacks = (typeof options == "object" ? options.callbacks : {});

		 	this.ui 	   = {};
		 	this.factory   = factory;
			this.parent    = parent;
			this.base(options);
			this.callbacks = $.extend(true, {}, this.callbacks, callbacks);
		}
		
	});

	PhotoFrame.Factory = PhotoFrame.Class.extend({
		
		/**
		 * An array of buttons to use to build the buttonBar
		 */
		 
		buttons: [],
		 
		/**
		 * The PhotoFrame.ButtonBar object
		 */	
		 
		buttonBar: false,
		
		/**
		 * Has user cancelled upload?
		 */	
		 
		cancel: false,
		
		/**
		 * An object of global callback methods
		 */	
		 
		callbacks: {},
		
		/**
		 * The default CSS classes
		 */		
		
		classes: {
			actionBar: 'photo-frame-action-bar',
			activity: 'photo-frame-activity',
			aspect: 'aspect',
			barButton: 'photo-frame-bar-button',
			browse: 'photo-frame-browse',
			button: 'photo-frame-button',
			cancel: 'photo-frame-cancel',
			clearfix: 'clearfix',
			close: 'photo-frame-close',
			crop: 'photo-frame-crop',
			cropPhoto: 'photo-frame-crop-photo',
			editPhoto: 'photo-frame-edit',
			deletePhoto: 'photo-frame-delete',
			dimmer: 'photo-frame-dimmer',
			dragging: 'photo-frame-dragging',
			dropCover: 'photo-frame-drop-cover',
			dropText: 'photo-frame-drop-text',
			dropZone: 'photo-frame-drop-zone',
			errors: 'photo-frame-errors',
			form: 'photo-frame-form',
			floatLeft: 'photo-frame-float-left',
			floatRight: 'photo-frame-float-right',
			helper: 'photo-frame-helper',
			icons: 'photo-frame-icons',
			invalid: 'photo-frame-invalid',
			ie: 'photo-frame-ie',
			indicator: 'photo-frame-indicator',
			infoToggle: 'photo-frame-toggle-info',
			instructions: 'photo-frame-instructions',
			infoPanel: 'photo-frame-info-panel',
			jcropTracker: 'jcrop-tracker',
			jcropHolder: 'jcrop-holder',
			message: 'photo-frame-message',
			meta: 'photo-frame-meta',
			metaToggle: 'photo-frame-meta-toggle',
			metaClose: 'photo-frame-close-meta',
			panel: 'photo-frame-panel',
			photo: 'photo-frame-photo',
			progress: 'photo-frame-progress',
			preview: 'photo-frame-preview',
			rendering: 'photo-frame-rendering',
			renderBg: 'photo-frame-render-bg',
			renderText: 'photo-frame-render-text',
			save: 'photo-frame-save',
			saving: 'photo-frame-saving',
			size: 'size',
			sortable: 'photo-frame-sortable',
			sortablePlaceholder: 'photo-frame-sortable-placeholder',
			toolbar: 'photo-frame-toolbar',
			//toolBarTools: 'photo-frame-toolbar-tools',
			toolBarToggle: 'photo-frame-toolbar-toggle',
			tools: 'photo-frame-tools',
			upload: 'photo-frame-upload',
			wrapper: 'photo-frame-wrapper'
		},	
		
		/**
		 * Crop Settings
		 */		
		 
		cropSettings: {},
		
		/**
		 * Is the file browser response in progress?
		 */		
		
		fileBrowserResponseInProgress: false,

		/**
		 * Force users to crop new photos?
		 */		
		 
		forceCrop: true,
		 
		/**
		 * Disable users from cropping photos?
		 */		
		 
		disableCrop: false,
		
		/**
		 * An object/array events that have been bound to PhotoFrame
		 */		
		 
		events: {},
		
		/**
		 * Icon Classes
		 */		
		 
		icons: {
			cancel: 'icon-cancel',
			editPhoto: 'icon-edit',
			deletePhoto: 'icon-trash',
			info: 'icon-info',
			cog: 'icon-cog',
			rotate: 'icon-rotate',
			save: 'icon-save',
			tools: 'icon-tools',
			warningSign: 'icon-warning-sign'
		},
		
		/**
		 * The Layer window object
		 */		
		 
		// layerWindow: false,
		
		/**
		 * This is the overflow property of the window when crop is started
		 */
		 
		overflow: false,	
		 	
		/**
		 * Photos Array.
		 */		
		 
		photos: [],
		
		/**
		 * Settings.
		 */		
		 
		settings: {},
				
		/**
		 * An object of UI elements.
		 */		
		 
		ui: {},
			
		/**
		 * An array of PhotoFrame.Window objects.
		 */		
		 
		windows: [],
		
		/**
		 * The wrapping DOM object
		 */		
		 
		$wrapper: false,
				
		/**
		 * Global zIndex count.
		 */		
		 
		zIndexCount: 1,
		
		/**
		 * Constructor to set the options and UI events.
		 *
		 * @param object  The wrapper object
		 * @param object  An array of options to be set
		 */		
		 
		constructor: function(obj, options) {

			var t      = this;
			var photos = $.extend(true, {}, options.photos);
				
			t.events   	   = {};
			t.settings 	   = {};
			t.cropSettings = {};
			t.windows      = [];
			t.index        = PhotoFrame.instances.length;
			
			// Global default callbacks
			
			t.callbacks = $.extend(true, {
				browse: function() {},
				buildUploadUrl: function() { return false; }, // return false by default
				init: function() {},
				responseHandlerSettings: function() { return {}; }	
			}, options.callbacks);
			
			//options.callbacks = $.extend(true, {}, t.callbacks);
			//options.photos    = $.merge(true, [], photos);
			
			PhotoFrame.instances.push(t)
			
			t.$wrapper = $(obj);
			
			t.sortable();	
			t.base(options);	
			
			t.ui = {
				body: $('body'),
				browse: t.$wrapper.find('.'+t.classes.browse),
				upload: t.$wrapper.find('.'+t.classes.upload),
				form: $('#'+t.classes.upload),
				dimmer: $('.'+t.classes.dimmer),
				activity: $('.'+t.classes.activity),
				preview: t.$wrapper.find('.'+t.classes.preview),
				//del: t.$wrapper.find('.photo-frame-delete'),
				//edit: t.$wrapper.find('.photo-frame-edit'),
				helper: t.$wrapper.find('.'+t.classes.helper)
			}
			
			var html = [
				'<form id="'+t.classes.upload+'" class="'+t.classes.form+' '+t.classes.wrapper+' '+t.classes.icons+'" action="'+PhotoFrame.Actions.upload_photo+(t.IE() ? '&ie=true' : '')+'&index='+t.index+'" method="POST" enctype="multipart/form-data" id="'+t.classes.upload+'-'+t.index+'" '+(t.IE() ? 'target="photo-frame-iframe-'+t.index+'"' : '')+'>',
					'<h3>'+PhotoFrame.Lang.select_file+'</h3>',
					'<input type="file" name="files[]" multiple>',
					'<button type="submit" class="'+t.classes.button+'"><span class="icon-upload"></span>'+t.buttonText+'</button>',
				'</form>'
			].join('');
			
			t.ui.form = $(html);
			t.ui.form.submit(function() {
				if(t.IE()) {
					t.ui.form.hide();
					t.showProgress(0, function() {
						t.startUpload();
					});
				}
			});
			
			t.ui.body.append(t.ui.form);
			t.ui.window = $(window);
			
			var html = [
				'<div class="'+t.classes.dimmer+' '+t.classes.icons+'">',
					'<a href="#" class="'+t.classes.metaToggle+'"><span class="'+t.icons.info+'"></span></a>',
					'<div class="'+t.classes.infoPanel+'">',
						'<a href="#" class="'+t.classes.close+'"><span class="'+t.icons.cancel+'"></span></a>',
						'<p class="'+t.classes.size+'">W: <span class="width"></span> H: <span class="height"></span></p>',
						'<div class="coords">',
							'<p>',
								'<label><b>X</b>: <span class="x"></span></label>',
								'<label><b>Y</b>: <span class="y"></span></label>',
							'</p>',
							'<p>',
								'<label><b>X2</b>: <span class="x2"></span></label>',
								'<label><b>Y2</b>: <span class="y2"></span></label>',
							'</p>',
						'</div>',
						'<p class="'+t.classes.aspect+'"></p>',
					'</div>',
					'<div class="'+t.classes.activity+'">',
						'<span class="'+t.classes.indicator+'"></span> <p>'+PhotoFrame.Lang.uploading+'</p>',
						'<a class="'+t.classes.button+' '+t.classes.cancel+'"><span class="'+t.icons.cancel+'"></span> Cancel</a>',
					'</div>',
					'<div class="'+t.classes.progress+'"></div>',
					'<div class="'+t.classes.errors+'">',
						'<h3>'+PhotoFrame.Lang.errors+'</h3>',
						'<ul></ul>',
						'<a class="'+t.classes.button+' '+t.classes.cancel+'"><span class="'+t.icons.cancel+'"></span> Close</a>',
					'</div>',
					'<div class="'+t.classes.crop+'">',
						'<div class="'+t.classes.cropPhoto+'"></div>',
						'<div class="'+t.classes.renderBg+'"><div class="'+t.classes.renderText+'">'+PhotoFrame.Lang.rendering+'</div></div>',
						'<div class="'+t.classes.meta+'">',
							'<a href="#" class="'+t.classes.metaClose+' '+t.classes.floatRight+'"><span class="'+t.icons.cancel+'"></span></a>',
							'<h3>'+PhotoFrame.Lang.photo_details+'</h3>',
							'<ul>',
								'<li>',
									'<label for="title">'+PhotoFrame.Lang.title+'</label>',
									'<input type="text" name="title" value="" id="title" />',
								'</li>',
								'<!-- <li>',
									'<label for="keywords">'+PhotoFrame.Lang.keywords+'</label>',
									'<input type="text" name="keywords" value="" id="keywords" />',
								'</li> -->',
								'<li>',
									'<label for="title">'+PhotoFrame.Lang.description+'</label>',
									'<textarea name="description" id="description"></textarea>',
								'</li>',
							'</ul>',
						'</div>',
						'<div class="'+t.classes.toolbar+'">',
							'<div class="'+t.classes.tools+'">',
								'<a href="#" class="'+t.classes.toolBarToggle+'"><i class="'+t.icons.tools+'"></i></a>',
								/*'<a class="'+t.classes.infoToggle+'"><i class="'+t.icons.info+'"></i></a>',*/
							'</div>',
							'<a href="#"  class="'+t.classes.barButton+' '+t.classes.cancel+' '+t.classes.floatLeft+'"><span class="'+t.icons.cancel+'"></span> '+PhotoFrame.Lang.cancel+'</a>',
							'<a href="#"  class="'+t.classes.barButton+' '+t.classes.save+' '+t.classes.floatRight+'"><span class="'+t.icons.save+'"></span> '+PhotoFrame.Lang.save+'</a>',
						'</div>',
					'</div>',
				'</div>'
			].join('');
			
			t.ui.dimmer        = $(html);
			t.ui.toolbar       = t.ui.dimmer.find('.'+t.classes.toolbar);
			t.ui.tools         = t.ui.toolbar.find('.'+t.classes.tools);
			t.ui.toolBarToggle = t.ui.toolbar.find('.'+t.classes.toolBarToggle);
			t.ui.infoToggle    = t.ui.toolbar.find('.'+t.classes.infoToggle);
			
			t.ui.toolbar.hide();
			t.ui.body.append(t.ui.dimmer);

			if(t.infoPanel) {
				t.ui.info = t.ui.dimmer.find('.'+t.classes.infoPanel);
				t.ui.info.draggable();
				t.ui.info.find('.'+t.classes.close).click(function(e) {			
					t.ui.info.fadeOut();
					e.preventDefault();
				});
			}
					
			//t.ui.activity = t.ui.dimmer.find('.'+t.classes.activity);
			//t.ui.activity.find('.photo-frame-indicator').activity({color: '#fff'});
			
			t.ui.progress        = t.ui.dimmer.find('.'+t.classes.progress);
			t.ui.save            = t.ui.dimmer.find('.'+t.classes.save);
			t.ui.cancel          = t.ui.dimmer.find('.'+t.classes.cancel);
			t.ui.errors          = t.ui.dimmer.find('.'+t.classes.errors);
			t.ui.errorCancel     = t.ui.dimmer.find('.'+t.classes.errors+' .'+t.classes.cancel);
			t.ui.crop            = t.ui.dimmer.find('.'+t.classes.crop);
			t.ui.cropPhoto       = t.ui.dimmer.find('.'+t.classes.cropPhoto);
			t.ui.meta            = t.ui.dimmer.find('.'+t.classes.meta);
			t.ui.metaToggle      = t.ui.dimmer.find('.'+t.classes.metaToggle);
			t.ui.metaClose       = t.ui.dimmer.find('.'+t.classes.metaClose);
			t.ui.metaTitle       = t.ui.meta.find('#title');
			t.ui.metaDescription = t.ui.meta.find('#description');
			t.ui.metaKeywords    = t.ui.meta.find('#keywords');
			t.ui.dropZone        = t.$wrapper.find('.'+t.classes.dropZone);
					
			t.buttonBar = new PhotoFrame.ButtonBar(t, t.buttons, {
				title: PhotoFrame.Lang.tools
			});

			t.buttonBar.ui.window.addClass('photo-frame-button-bar');
				
			$(window).keyup(function(e) {
				if (e.keyCode == 27) { 
					t.ui.cancel.click();
				} 
			});
				
			t.progressBar   = new PhotoFrame.ProgressBar(t.ui.progress, {
				callbacks: {
					cancel: function() {
						t.cancel = true;
						
						if(t.jqXHR) {
							t.jqXHR.abort();
						}
						
						t.ui.dimmer.fadeOut();
						t.resetProgress();
					}
				}
			});
			
			t.ui.errorCancel.click(function(e) {			
				t.clearNotices();			
				t.ui.dimmer.fadeOut('fast');	
				t.hideMeta();
				t.hideProgress();
				e.preventDefault();
			});
			
			if(!t.IE()) {
				
				t.ui.form.fileupload({
					//url: '/live/home/index',
					started: function() {
						//t.ui.dropZone.hide();
						t.showProgress(0);
					},
					progress: function(e, data) {
						t.showProgress(parseInt(data.loaded / data.total * 100) * .5);
					},
					pasteZone: null,
					singleFileUploads: false,
					dropZone: t.ui.dropZone,
					url: t.getUploadUrl(),
					add: function (e, data) {
						if(t.maxPhotos > 0 && (t.maxPhotos <= t.getTotalPhotos())) {
							t.showErrors([PhotoFrame.Lang.max_photos_error], {
								max_photos: t.maxPhotos,
								max_photos_name: (t.maxPhotos == 1 ? 'photo' : 'photos')
							});
						}	
						else {
							if(data.files.length > 0) {
								t.ui.dropZone.hide();
								t.initialized = false;
								t.showProgress(0);
								t.startUpload(data.files, function() {
									t.jqXHR = data.submit();
								});
							}
						}
					},
					fail: function (e, data) {
						if(!t.cancel) {
							t.showErrors([PhotoFrame.Lang.unexpected_error]);	
						}						
						t.cancel = false;
					},
					done: function (e, data) {
						var errors = [];
						
						if(typeof data.result[0] == "undefined" || typeof data.result == "string") {
							errors = [PhotoFrame.Lang.unexpected_error];
						}	
						
						if(typeof data.result == "object" && data.result.length == 1) {
							t.showProgress(75, function() {
								t._uploadResponseHandler(data.result[0]);
							});
						}
						else {
							var count = 1;
							if(typeof data.result[0].success != "undefined") {
								t.showProgress(100, function() {
									$.each(data.result, function(i, result) {
										t._uploadResponseHandler(result, true, true, function() {
											if(count == data.result.length) {
												t.hideProgress();
												t.hideDimmer();
											}
											count++;
										});
									});
								});
							}
							else {
								t.hideProgress();
								t.showErrors(errors);
								t.log(data.result);
							}
						}
					}
		    	});
	    	}
	    	else {
		    	t.ui.iframe = $('<iframe name="photo-frame-iframe-'+t.index+'" id="photo-frame-iframe-'+t.index+'" src="" style="display:none;width:0;height:0"></iframe>');
		    	t.ui.body.append(t.ui.iframe);
	    	}

			t.photos  = [];

	    	for(var x in photos) {
		    	var photo = photos[x];
		    	
		    	new PhotoFrame.Photo(t, photo, {
		    		id: photo.id,
		    		manipulations: photo.manipulations,
		    		index: x,
		    		cropSettings: $.extend({}, options.cropSettings, {
			    		setSelect: [photo.x, photo.y, photo.x2, photo.y2]	
		    		}),
			    	$wrapper: t.$wrapper.find('#'+t.classes.photo+'-'+t.fieldId+'-'+x)
		    	});
	    	}
	    				
			$(window).resize(function() {
				if(t.ui.crop.css('display') != 'none') {
					t.ui.crop.center();
				}				
				if(t.ui.meta.css('display') != 'none') {
					t.ui.meta.center();
				}				
				if(t.ui.saving) {
					t.ui.saving.center();
				}				
				if(t.ui.errors.css('display') != 'none') {
					t.ui.errors.center();
				}
			});
			
	    	t.ui.metaToggle.click(function(e) {
		    	t.toggleMeta();	    		    	
		    	e.preventDefault();
	    	});
	    	
	    	t.ui.metaClose.click(function(e) {
	    		t.hideMeta();
		    	e.preventDefault();
	    	});

			t.ui.browse.click(function() {
				t.callback(t.callbacks.browse);
			});
						
			t.ui.toolBarToggle.click(function(e) {
				t.toggleTools();
				e.preventDefault();
			});
			
			t.ui.infoToggle.click(function(e) {
		    	t.toggleMeta();
				e.preventDefault();
			});
			
			t.$wrapper.bind('dragover', function(e) {
				var obj 	= t.$wrapper.find('.'+t.classes.dropText);
				var parent  = obj.parent();
				
				if(t.maxPhotos == 0 || (t.maxPhotos > t.getTotalPhotos())) {
							
					t.ui.dropZone.show();
					
					obj.position({
						of: parent,
						my: 'center',
						at: 'center'
					});
					
					t.$wrapper.addClass(t.classes.dragging);					
				}

				e.preventDefault();
			});
			
			t.$wrapper.find('.'+t.classes.dropCover).bind('drop dragleave', function(e) {
				
				if(!$(e.target).hasClass(t.classes.dropTag)) {				
					t.$wrapper.removeClass(t.classes.dragging);
				}
				
				e.preventDefault();
			});
				
			t.ui.upload.click(function(e) {
				t.isNewPhoto = true;
				
				if(!t.IE()) {
					// All this extra code is there to support older versions of Chrome and 
					// Safari. File inputs cannot be triggered if the form or field is hidden.
					// This is best hack I could find at the time. - 1/9/2013
					t.ui.form.css({
						position: 'absolute',
						left: -1000	
					}).show();
					
					t.ui.form.find('input').show().click();
				}
				else {
					t.ui.dimmer.show();
					t.ui.crop.hide();
					
					if(t.ui.instructions) {
						t.ui.instructions.hide();
					}
					
					//t.ui.cropPhoto.hide();
					t.ui.form.show().center();
				}
						
				e.preventDefault();
			});
			
			t.bind('startCropBegin', function() {
				t.hideOverflow();
			});
			
			t.bind('saveEnd', function() {
				t.resetOverflow();
			});
			
			t.bind('cancel', function() {
				t.resetOverflow();
			});
			
			t.callback(t.callbacks.init);
		},

		getSettings: function() {
			return this.settings;
		},
		
		getSetting: function(index) {
			var settings = this.getSettings(), index = 'photo_frame_'+index;

		 	if(settings[index]) {
		 		return settings[index];
		 	}

		 	return undefined;
		},

		getUploadUrl: function() {
			var _default = PhotoFrame.Actions.upload_photo
			var url = this.callbacks.buildUploadUrl();
			
			return url ? url : _default;	
		},

		parse: function(string, vars, value) {
			if(typeof vars != "object") {
				var obj   = {};
				obj[vars] = value;
				vars      = obj;
			}
			$.each(vars, function(i, value) {
				string = string.replace('{'+i+'}', value);
			});
			return string;
		},
		
		showError: function(error, vars) {
			var t = this;
			error = this.parse(error, vars);

			t.hideProgress(function() {
				t.ui.errors.find('ul').append('<li>'+error+'</li>');
				t.ui.errors.show();
				t.ui.errors.center();
				t.ui.dimmer.fadeIn();
				t.progressBar.reset();
			});
		},
		
		showErrors: function(errors, vars) {
			var t = this;
			t.ui.errors.find('ul').html('');
			t.ui.errors.hide();
			t.ui.activity.hide();
			t.ui.crop.hide();
			t.ui.form.hide();
			t.progressBar.hide();

			$.each(errors, function(i, error) {
				t.showError(error, vars);
			});
		},
		
		hideDimmer: function(callback) {
			if(this.buttonBar) {
				this.buttonBar.hide(false);
			}
			
			this.hideInstructions();
			this.ui.dimmer.hide(callback);
			this.ui.form.hide();
			this.ui.errors.fadeOut();
			this.progressBar.reset();
		},
		
		sortable: function() {    	
			if(this.sortable) {
			    this.ui.list = this.$wrapper.find('.'+this.classes.sortable);
			    this.ui.list.sortable({placeholder:this.classes.sortablePlaceholder});
	            this.ui.list.disableSelection();
			}
		},
		
		clearNotices: function(callback) {
			for(var x in this.notices) {
				this.notices[x].clear(callback);
			}			
		},
		
		notify: function(notifications, delay, animation) {
			var t = this;
			var $panel   = $('.'+t.classes.panel);
			var messages = [];
				
			if(!delay) {
				delay = 190;	
			}
			
			if(!animation) {
				animation = 300;
			}
			
			function show() {
				var html = $('<div class="'+t.classes.panel+' '+t.classes.icons+'" />');
				
				$.each(notifications, function(i, message) {
					message = $([
						'<div class="'+t.classes.message+'">',
							'<p><span class="'+t.icons.warningSign+'"></span>'+message+'</p>',
							'<a href="#" class="'+t.classes.close+'"><span class="'+t.icons.cancel+'"></span></a>',
						'</div>'
					].join(''));
					
					messages.push(message);
					html.append(message);
				});
				
				$('body').append(html);
			}
			
			if($panel.length == 1) {
				$panel.fadeOut(function() {
					$panel.remove();
					t.notify(notifications, delay, animation);
				});
			}
			else {
				show();
			}
			
			var loopDelay  = 0;
			var closeDelay = 0;
			
			$.each(messages, function(i, message) {
			
				setTimeout(function() {
					
					$(message).animate({
						right: 50
					}, animation, function() {
						
						setTimeout(function() { 
							$(message).animate({right: -$(message).width()-75}, animation);
						}, 5000 + closeDelay);
						
						closeDelay = (delay*(i+1));
					});
					
				}, loopDelay);
				
				loopDelay = (delay*(i+1));
			});
			
			$('.photo-frame-message .photo-frame-close').click(function() {
				$(this).parent().fadeOut('fast');
			});
			
			return notifications;
		},
		
		getTotalPhotos: function() {
			var count = 0;
			
			$.each(this.photos, function(i, photo) {
				if(photo) {
					count++;
				}	
			});
			
			return count;	
		},
		
		hideOverflow: function() {
			this.overflow = $('body').css('overflow');
			$('body').css('overflow', 'hidden');	
		},
		
		resetOverflow: function() {
			$('body').css('overflow', this.overflow);
		},
		
		_assetResponseHandler: function(response, progress, callback) {
			var t = this;
			
			if(typeof progress == "function") {
    			callback = progress;
    			progress = 100;
			}
			
			if(typeof progress == "undefined" || progress === false) {
				var progress = 100;
			}
			
			t.showProgress(progress, function() {
				t._uploadResponseHandler(response, true, true, function(response) {
					
	    			t.hideDimmer();
	    			//t.resetProgress();
	    			//t.hideProgress();
	    			
	    			if(typeof callback == "function") {
		    			callback(response);
	    			}
    			
				});
			});
		},
		
		_uploadResponseHandler: function(response, existingAsset, noCrop, callback) {
			
			if(typeof existingAssets == "function") {
				callback = existingAsset;
				existingAssets = false;
			}
			if(typeof noCrop == "function") {
				callback = existingAsset;
				noCrop   = false;
			}
			
			this.response = response;			
			this.ui.toolbar.hide();
			
			if(this.response.success) {
				if(!existingAsset) {
					this.$wrapper.append('<textarea name="'+this.fieldName+'[][uploaded]" style="display:none">{"field_id": "'+this.fieldId+'", "col_id": "'+this.colId+'", "row_id": "'+this.rowId+'", "path": "'+this.response.file_path+'", "original_path": "'+this.response.original_path+'", "file": "'+this.response.file_name+'"}</textarea>');
				}
				
				var props = {
					cropSettings: this.cropSettings,
					compression: this.compression,
					size: this.size,
					forceCrop: this.forceCrop,
					disableCrop: this.disableCrop,
					manipulations: {},
					//resize: this.resize,
					//resizeMax: this.resizeMax,
					index: this.photos.length,
				};
				
				var photo = new PhotoFrame.Photo(this, response, props);
				
				if(!noCrop && photo.forceCrop && !photo.disableCrop) {
					//this.hideProgress(function() {
						photo.startCrop();
					//});
				}
				else {
					photo._loadFromResponse(response, function() {
						photo.factory.hideProgress(function() {
							photo.factory.hideDimmer();
							if(typeof callback == "function") {
								callback();
							}
						});
					});
				}
			}
			else {
				this.showErrors(this.response.errors);	
			}
		},
		
		/**
		 * Returns TRUE if the user is using InternetExplorer, otherwise
		 * returns FALSE.
		 *
		 * @return	bool
		 */		
		 
		IE: function() {
			return this.$wrapper.children().hasClass(this.classes.ie);
		},
		
		hideInstructions: function() {
			if(this.ui.instructions) {
				this.ui.instructions.hide();
				this.ui.instructions.remove();
			}	
		},
		
		_fileBrowserResponseHandler: function(file, id, callback) {
			if(typeof id == "function") {
				callback = id;
				id = false;
			}

			var t = this;
			var options = {
				fieldId: t.fieldId,
				varId: t.varId, 
				colId: t.colId,
				siteId: t.siteId,
				file: file,
				assetId: (id ? id : false),
				gridId: (t.gridId ? t.gridId : false)
			};
			
			options = $.extend({}, options, this.callbacks.responseHandlerSettings());
			if(!this.fileBrowserResponseInProgress) {
				this.fileBrowserResponseInProgress = true;
				$.get(PhotoFrame.Actions.photo_response, options, function(response) {
					t.fileBrowserResponseInProgress = false;
					if(typeof response != "object") {
						t.log(response);
						t.showErrors([PhotoFrame.Lang.unexpected_error]);
					}
					else {
						if(typeof callback == "function") {				
							callback(response);
						}
					}
				});
			}
		},
		
		hideMeta: function() {	
			this.ui.metaToggle.removeClass('active');	
			this.ui.meta.fadeOut('fast');
		},
		
		hideUpload: function() {
			this.ui.upload.hide();
			this.ui.browse.hide();
			this.ui.helper.hide();
		},
		
		/**
		 * Show the progress bar.
		 */	
		 	
		hideProgress: function(callback) {
			this.progressBar.hide(callback);
		},
		
		resetMeta: function() {	
			this.ui.metaTitle.val('');
			this.ui.metaKeywords.val('');
			this.ui.metaDescription.val('');
		},
		
		hash: function(length, r) {
			var m = m || length; s = '', r = r ? r : 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
			for (var i=0; i < m; i++) { s += r.charAt(Math.floor(Math.random()*r.length)); }
			return s;
		},
		
		/**
		 * Resets the progress bar.
		 */		
		 
		resetProgress: function() {
			if(typeof show == "undefined") {
				var show = true;	
			};
			
			this.ui.crop.hide();
			this.ui.activity.hide();
			this.progressBar.reset();
		},
						
		showMeta: function() {
			this.ui.metaToggle.addClass('active');	
			this.ui.meta.fadeIn('fast');
			this.ui.meta.center();
			this.ui.metaTitle.focus();
		},
		
		showUpload: function() {
			this.ui.upload.show();
			this.ui.browse.show();
			this.ui.helper.show();	
		},
		
		startUpload: function(files, callback) {
			var t = this;
			
			if(typeof files == "function") {
				callback = files;
				files    = [];	
			}
			
			if(t.IE()) {
				t.ui.form.hide();
			}
			else {
				if(files.length == 1) {
					t.ui.errors.hide();
					t.ui.crop.hide();
				}
			}
			
			t.ui.crop.hide();
			t.ui.dimmer.fadeIn(function() {
				if(typeof callback == "function") {
					callback();	
				}
			});
		},
		
		/**
		 * Show the progress bar.
		 */		
		showProgress: function(progress, callback) {
			this.ui.dimmer.fadeIn();
			this.ui.errors.hide();
			this.progressBar.show();
			this.progressBar.set(progress, callback);
			this.hideMeta();
			this.hideInfo();
		},
				
		toggleMeta: function() {
			if(this.ui.meta.css('display') == 'none') {
				this.showMeta();
			}
			else {
				this.hideMeta();
			}
		},
				
		toggleTools: function() {
			if(this.buttonBar) {
				if(!this.buttonBar.isVisible()) {
					this.showTools();
				}
				else {
					this.hideTools();
				}
			}
		},
		
		showTools: function(callback) {
			if(this.buttonBar) {
				this.buttonBar.show(callback);
			}
		},
		
		hideTools: function(callback) {
			if(this.buttonBar) {
				this.buttonBar.hide(callback);
			}
		},
		
		hideInfo: function(callback) {
			if(this.ui.info) {
				this.ui.info.hide(callback);
			}
		},
		
		showInfo: function(callback) {
			if(this.ui.info) {
				this.ui.info.fadeIn
				(callback);
			}
		},
		
		bind: function(event, callback) {
			if(!this.events[event]) {
				this.events[event] = [];
			}
			
			if(typeof callback == "function") {
				this.events[event].push(callback);
			}
		},
		
		trigger: function(event) {
			var t = this;
			var newArgs = arguments;
			var args = [];
					
			for(var x = 1; x <= newArgs.length; x++) {
				if(typeof newArgs[x] != "undefined") {
					args.push(newArgs[x]);
				}
			}
			
			if(this.events[event]) {
				$.each(this.events[event], function(i, callback) {
					callback.apply(this, args);				
				});
			}
		}
		
	});
	
	PhotoFrame.ButtonBar = PhotoFrame.Class.extend({
		
		/**
		 * An array of PhotoFrame.Button objects
		 */	
		 
		buttons: [],
		
		/**
		 * An object of classes
		 */	
		 
		classes: {
			active: 'photo-frame-active',
			wrapper: 'photo-frame-toolbar-tools',
			list: 'photo-frame-toolbar-tools-list',
			titleBar: 'photo-frame-toolbar-tools-title'
		},
		
		/**
		 * The parent PhotoFrame.Factory
		 */	
		 
		factory: false,

		/**
		 * The title of the button bar
		 */	
		 
		title: false,
				
		/**
		 * The child DOM objects
		 */	
		 
		ui: {
			list: false,
			titleBar: false,
			window: false
		},
		
		/**
		 * The wrapping DOM object
		 */	
		 
		// $wrapper: false,
				
		
		constructor: function(factory, buttons, options) {
			this.ui 	 = {};			
			this.buttons = [];
			this.base(options);
			this.factory = factory;
			this._buildButtonBar();
			this.addButtons(buttons);
			this.savePosition();
			
			if(this.buttons.length === 0) {
				this.factory.ui.tools.hide();
			}
		},
		
		addButton: function(button, options) {
			var button = this.loadButton(button, options);
			
			if(button && button.isActive()) {
				var item = $('<li />').append(button.$obj);
				
				this.ui.list.append(item);
			}			
			
			this.buttons.push(button);
		},				
		
		addButtons: function(buttons, options) {
			var t = this;
			
			for(var x in buttons) {
				var button = buttons[x];
				
				this.addButton(button, options);
			}
		},
		
		unclick: function() {
			
		},
		
		click: function() {
			//this.ui.list.find('.'+this.classes.active).removeClass(this.classes.active);	
		},	
		
		loadButton: function(type, options) {
			if(typeof options != "object") {
				options = {};
			}
			
			if(PhotoFrame.Buttons[type.ucfirst()]) {
				var button = new PhotoFrame.Buttons[type.ucfirst()](this, $.extend(true, {}, {
					name: type
				}, options));
							
				return button;
			}
			else {
				this.log('The "'+type.ucfirst()+'" button does not exist.');
			}			
		},
		
		isVisible: function(callback) {
			return this.ui.window.css('display') != 'none' ? true : false;
		},
		
		show: function(save, callback) {
			if(typeof save == "undefined") {
				save = true;
			}
			else if(typeof save == "function") {
				callback = save;
				save = true;
			}
			
			if(this.buttons.length > 0) {
				this.factory.ui.toolBarToggle.addClass(this.classes.active);
				this.ui.window.fadeIn(callback);
				
				if(save) {
					this.setVisibility(true);
				}			
				this.showWindows();
			}
			
			this.savePosition();
		},
		
		hide: function(save, callback) {
			var t = this;
			
			if(typeof save == "undefined") {
				save = true;
			}
			else if(typeof save == "function") {
				callback = save;
				save = true;
			}
			
			for(var x in this.factory.windows) {
				this.factory.windows[x].close(false);
			}
			
			this.ui.list.find('.'+this.classes.active).removeClass(this.classes.active);			
			
			this.ui.window.fadeOut(function() {
				t.factory.ui.toolBarToggle.removeClass(t.factory.classes.active);
			});
			
			if(save) {
				this.setVisibility(false);
			}	
			
			this.savePosition();
		},
		
		showWindows: function() {
			for(var x in this.factory.windows) {
				var window = this.factory.windows[x];
				if(window.visible) {
					window.open();
				}
			}
		},
		
		hideWindows: function() {
			for(var x in this.factory.windows) {
				var window = this.factory.windows[x];
				if(!window.visible) {
					window.close(false);
				}
			}
		},
		
		position: function() {			
			if(this.hasPosition()) {
				var pos = this.getPosition();
				this.ui.window.css({
					left: pos.x,
					top: pos.y,
					position: 'fixed'
				});
				this.savePosition();
			}		
		},	
		
		_buildButtonBar: function() {
			var t = this;
			
			this.ui.window = $([
				'<div class="'+this.classes.wrapper+'">',
					'<div class="'+this.classes.titleBar+'">'+this.title+'</div>',
					'<ul class="'+this.classes.list+'"></ul>',
				'</div>'
			].join(''))
			.css('z-index', 1);
			
			this.ui.titleBar = this.ui.window.find('.'+this.classes.titleBar);
			this.ui.list     = this.ui.window.find('.'+this.classes.list);
			
			this.factory.ui.dimmer.append(this.ui.window);
			
			this.ui.window.draggable({
				handle: this.ui.titleBar,
				containment: 'parent',
				scroll: false,
				start: function() {
					t.bringToFront();
				},
				stop: function(e) {
					t.savePosition();
				}
			});
			
			this.ui.titleBar.mousedown(function() {
				t.bringToFront();
			});
			
			this.position();
		}
		
	});
	
	PhotoFrame.Button = PhotoFrame.Class.extend({
		
		/**
		 * The PhotoFrame.ButtonBar object
		 */	
		 
		buttonBar: false,
		
		/**
		 * The class of the icon to use
		 */	
		 
		icon: false,
		
		/**
		 * The name of the button
		 */	
		 
		name: false,
		
		/**
		 * A description of what the button does
		 */	
		 
		description: false,	
		
		/**
		 * The DOM object
		 */	
		 
		$obj: false,
	
		/**
		 * The name of the package. If name, default to name property
		 */	
		 
		packageName: false,
		
		/**
		 * Should Photo Frame render the photo after removing the layer
		 */	
		 
		renderAfterRemovingLayer: true,
		
		/**
		 * The primary PhotoFrame.Window object 
		 */
		
		window: false,
		
		/**
		 * The JSON object used for Window settings 
		 */
		
		windowSettings: {
			css: '',
			title: false
		},
		
		/**
		 * Constructor method for the button
		 *
		 * @param	object  The PhotoFrame.ButtonBar object
		 * @param	object  A JSON object of options to override params
		 * @param	bool    If TRUE or undefined, the window will be built
		 * @return	object
		 */
		
		constructor: function(buttonBar, options, buildWindow) {
			var t = this;					
			
			if(typeof buildWindow === "undefined") {
				buildWindow = true;
			}
			
			this.ui  	   = {};
			this.buttonBar = buttonBar;
			this.base(options);
			this.$obj = $('<a href="#" title="'+this.description.replace('"', '')+'"></a>');
			this.$obj.append('<i />').find('i').addClass('icon-'+(this.icon ? this.icon : this.name.toLowerCase()));
			
			this.$obj.click(function(e) {
				t.click(e);
				e.preventDefault();
			});
			
			if(!this.packageName) {
				this.packageName = this.name;
			}

			if(buildWindow === true) {
				this.buildWindow();
			}
		},	
		
		getPackageName: function() {
			return (this.packageName ? this.packageName : this.name).toLowerCase();
		},

		/**
		 * Show the manipulation
		 *
		 * @return	void
		 */
		
		showManipulation: function() {
			this.cropPhoto().showManipulation(this.getPackageName());
		},
		
		/**
		 * Hide the manipulation
		 *
		 * @return	void
		 */
		
		hideManipulation: function() {
			this.cropPhoto().hideManipulation(this.getPackageName());
		},
		
		/**
		 * Add the manipulation
		 *
		 * @param	bool	If true, the manipulation will be visible
		 * @param	object  A JSON object used to build the effect
		 * @return	void
		 */
		
		addManipulation: function(visible, data) {
			this.cropPhoto().addManipulation(this.getPackageName(), visible, data);
		},
		
		/**
		 * Get the photo being cropped
		 *
		 * @return	object  PhotoFrame.Photo
		 */
		
		cropPhoto: function() {
			return this.buttonBar.factory.cropPhoto;
		},
		
		/**
		 * Update the manipulation JSON without an AJAX callback
		 *
		 * @return	void
		 */
		
		updateJson: function() {
			this.cropPhoto().updateJson();	
		},
		
		/**
		 * Render the manipulation
		 *
		 * @param	callback  A callback function triggered after the effects triggers
		 * @return	void
		 */
		
		render: function(callback) {
			this.cropPhoto().render(callback);	
		},
		
		/**
		 * Remove the manipulation
		 *
		 * @return	void
		 */
		
		removeManipulation: function() {
			delete this.buttonBar.factory.cropPhoto.manipulations[this.getPackageName()];
			this.buttonBar.factory.trigger('removeManipulation', this);
		},
		
		/**
		 * Bind an event
		 *
		 * @param	bool	  The name of the event used to bind the callback
		 * @param	callback  The function called with the bound event
		 * @return	void
		 */
		
		bind: function(event, callback) {
			this.buttonBar.factory.bind(event, callback);
		},
		
		/**
		 * Build the PhotoFrame.Window object
		 *
		 * @param	object  A JSON object used to build the effect
		 * @return	void
		 */
		
		buildWindow: function(options) {
			if(typeof options == "object") {
				this.windowSettings = $.extend(true, {}, this.windowSettings, options);
			}
			this.window = new PhotoFrame.Window(this.buttonBar.factory, this.$obj, this.windowSettings);
		},
		
		/**
		 * This method is triggered when the button is clicked
		 *
		 * @param	object  The event object
		 * @return	void
		 */
		
		click: function(e) {
			if(this.$obj.hasClass(this.buttonBar.classes.active)) {
				this.buttonBar.unclick();
				this.$obj.removeClass(this.buttonBar.classes.active);
				this.window.close();
			}
			else {
				this.buttonBar.click();
				this.$obj.addClass(this.buttonBar.classes.active);
				this.window.open();
			}			
		},
		
		/**
		 * Hide the window
		 *
		 * @param	callback  This callback is triggered when the window is hidden
		 * @return	void
		 */
		
		hideWindow: function(callback) {
			this.$obj.removeClass(this.buttonBar.classes.active);
			this.window.close();
		},
		
		/**
		 * Is button active (visible) in the tool bar?
		 *
		 * @return	bool
		 */

		isActive: function() {
		 	return true;
		},
		
		/**
		 * Show the window
		 *
		 * @param	callback  This callback is triggered when the window is hidden
		 * @return	void
		 */
		
		showWindow: function(callback) {		
			this.$obj.addClass(this.buttonBar.classes.active);		
			this.window.open();			
			this.window.position();
		},
		
		/**
		 * Get the manipulation visibility
		 *
		 * @return	bool
		 */
		
		getVisibility: function() {
			return this.getManipulation() ? this.getManipulation().visible : true;
		},
		
		/**
		 * Get the manipulation
		 *
		 * @return	mixed  Returns the manipulation object or FALSE is doesn't exist
		 */
		
		getManipulation: function() {
			if(this.cropPhoto()) {
				return this.cropPhoto().getManipulation(this.getPackageName());
			}
			return false;
		},
		
		/**
		 * Set the manipulation visibility to true or false
		 *
		 * @param	bool  True if visible, false for hidden
		 * @return	void
		 */
		
		setManipulation: function(visibility) {
			var m = this.getManipulation();
			m.visible = visibility;
		},
		
		/**
		 * This method is triggered when the layer is removed
		 *
		 * @return	void
		 */
		
		removeLayer: function() {
			this.reset();		
		},
		
		/**
		 * Start the rendering
		 *
		 * @param	callback  This callback is triggered when the photo starts rendering
		 * @return	void
		 */
		
		startRendering: function(callback) {
			this.cropPhoto().startRendering(callback);	
		},
		
		/**
		 * Stop the rendering
		 *
		 * @param	callback  This callback is triggered when the photo stops rendering
		 * @return	void
		 */
		
		stopRendering: function(callback) {
			this.cropPhoto().stopRendering(callback);	
		},
		
		/**
		 * This method is triggered when the photo starts being cropped
		 *
		 * @param	object  The PhotoFrame.Photo object
		 * @return	void
		 */
		
		startCrop: function(photo) {
			var m = this.getManipulation();	
			
			if(m) {
				if(m.visible) {
					this.enable();
				}
				else {
					this.disable();
				}
			}
		},
		
		/**
		 * This method toggles the layer's visibility and renders it
		 *
		 * @param	bool  The layer's visibility
		 * @param	bool  True to render the photo, false to skip rendering
		 * @return	void
		 */
		
		toggleLayer: function(visibility, render) {			
			if(!visibility) {
				this.disable();	
			}
			else {
				this.enable();
			}
			
			this.setManipulation(visibility);
			
			if(typeof render == "undefined" || render === true) {
				this.render();
			}
		},
		
		/**
		 * Get the data used for the save() method
		 *
		 * @return	object
		 */
		
		getData: function() {
			return {};
		},

		/**
		 * Get the settings object
		 *
		 * @return	object
		 */

		getSettings: function() {
		 	return this.buttonBar.factory.getSettings();
		},

		/**
		 * Get a single setting value
		 *
		 * @return	object
		 */

		getSetting: function(index) {
		 	return this.buttonBar.factory.getSetting(index);
		},
		
		/**
		 * Add a manipulation and save the refreshed JSON object.
		 * Note, this method is different than render().
		 *
		 * @return	object
		 */
		
		save: function(data, forceSave) {
			if(data.length > 0 || forceSave) {
				this.addManipulation(this.getVisibility(), data);
			}
			this.updateJson();
		},

		/**
		 * Apply the effect to the photo
		 *
		 * @return	void
		 */
		
		apply: function() {},
		
		/**
		 * Enable the button controls
		 *
		 * @return	void
		 */
		
		enable: function() {},
		
		/**
		 * Disable the button controls
		 *
		 * @return	void
		 */
		
		disable: function() {},
		
		/**
		 * Reset the button controls
		 *
		 * @return	void
		 */
		
		reset: function() {},

		/**
		 * Triggers each time the startCropCallback is called
		 *
		 * @return	void
		 */
		
		startCropCallback: function() {},

		/**
		 * Triggers each time the startCropCallbackFailed is called
		 *
		 * @return	void
		 */
		
		startCropCallbackFailed: function() {}
		
	});
		
	PhotoFrame.Window = PhotoFrame.Class.extend({
		
		/**
		 * An an array of button objects
		 */	
		 
		buttons: [],
			
		/**
		 * These are CSS classes appended to the window (string)
		 */
		
		css: '',
		
		/**
		 * An object of callback functions
		 */	
		 
		callbacks: {
			drag: function() {},
			dragstart: function() {},
			dragend: function() {},
			close: function() {},
			open: function() {}
		},
		
		/**
		 * An object of classes
		 */	
		 
		classes: {
			close: 'photo-frame-tool-window-close',
			title: 'photo-frame-tool-window-title',
			window: 'photo-frame-tool-window',
			content: 'photo-frame-tool-window-content',
			buttons: 'photo-frame-tool-window-buttons',
			button: 'photo-frame-tool-window-button',
			save: 'photo-frame-tool-window-save',
			wrapper: 'photo-frame-toolbar-tools'
		},
		
		/**
		 * The animation duration
		 */	
		 
		duration: 333,
		
		/**
		 * The easeIn animation
		 */	
		 
		easeIn: 'easeInElastic',
		
		/**
		 * The easeOut animation
		 */	
		 
		easeOut: 'easeOutElastic',
		
		/**
		 * The parent PhotoFrame.Factory object
		 */	
		 
		factory: false,
		
		/**
		 * An object of icon classes
		 */	
		 
		icons: {
			close: 'icon-cancel'	 
		},
		 
		/**
		 * The parent jQuery obj used to position the window
		 */
		
		parent: false,
		 
		/**
		 * The window title
		 */
		
		title: false,
			
		/**
		 * The children DOM object
		 */	
		 
		ui: {
			close: false,
			content: false,
			title: false,
			window: false	
		},
			
		/**
		 * The window width (int)
		 */	
		 
		width: false,
		
		constructor: function(factory, parent, options) {
			this.ui      = {};
			this.factory = factory;
			this.parent  = parent;
			
			this.base(options);	
			
			if(!this.title) {
				this.title = 'New Window '+this.factory.windows.length;
			}
						
			this.buildWindow();
			
			this.visible = this.getVisibility();
			
			factory.windows.push(this);
		},
		
		bringToFront: function() {
			this.factory.zIndexCount++;
			this.ui.window.css('z-index', this.factory.zIndexCount);
		},
		
		buildButtons: function() {
		
			var t = this;
			
			$.each(this.buttons, function(i, button) {
				var css  = button.css ? button.css : '';
				var text = button.text ? button.text : '';
				var icon = button.icon ? '<i class="'+button.icon+'"></i>' : '';
				var $btn = $('<a href="#" class="'+css+' '+t.classes.button+'">'+icon+text+'</a>');
				
				button.ui = {
					button: $btn
				}
				
				if(typeof button.init === "function") {
					button.init(button);
				}
				
				if(typeof button.onclick === "function") {
					$btn.click(function(e) {
						button.onclick(e, button);
						e.preventDefault();
						return false;
					});
				}
				
				t.ui.buttons.append($btn);
			});
		},
		
		buildWindow: function() {			
			var t    = this;					
			var html = $([
				'<div class="'+this.classes.wrapper+' '+this.classes.window+'">',
					'<a href="#" class="'+this.classes.close+'"><i class="'+this.icons.close+'"></i></a>',
					'<div class="'+this.classes.title+'">'+(this.title ? this.title.ucfirst() : 'N/A')+'</div>',
					'<div class="'+this.classes.content+'"></div>',
					'<div class="'+this.classes.buttons+' '+this.factory.classes.clearfix+'"></div>',
				'</div>'
			].join(''));
			
			this.ui.window  = html;
			this.ui.buttons = html.find('.'+this.classes.buttons);
			this.ui.close   = html.find('.'+this.classes.close);
			this.ui.content = html.find('.'+this.classes.content);
			this.ui.title   = html.find('.'+this.classes.title);
			
			this.ui.window.addClass(this.css);
			
			this.ui.window.draggable({
				handle: this.ui.title,
				containment: 'parent',
				scroll: false,
				drag: this.callbacks.drag,
				start: function(e) {
					t.bringToFront();
					t.callback(t.callbacks.dragstart, e);
				},
				stop: function(e) {
					t.savePosition();
					t.callback(t.callbacks.dragend, e);
				}
			});
			
			if(this.width) {
				this.ui.window.width(this.width);
			}
			
			this.ui.window.mousedown(function() {
				t.factory.trigger('windowMousedown', t);
				t.bringToFront();
			})
			
			this.ui.close.click(function(e) {
				t.close();
				e.preventDefault();
			});
			
			this.buildButtons();
			this.factory.ui.dimmer.append(html);
		},
		
		close: function(save, callback) {	
			var t = this;
			
			if(typeof save == "undefined") {
				save = true;
			}
			else if(typeof save == "function") {
				callback = save;
				save = true;
			}
			
			this.parent.removeClass(this.factory.buttonBar.classes.active);			
			this.ui.window.fadeOut({
				duration: this.duration
			}, function() {
				t.callback(t.callbacks.close);
				t.callback(callback);
			});
			
			if(save) {
				this.setVisibility(false);
			}
		},
		
		open: function(save, callback) {
			var t = this;
			
			this.factory.trigger('windowOpenBegin', this);
			
			if(typeof save == "undefined") {
				save = true;
			}
			else if(typeof save == "function") {
				callback = save;
				save = true;
			}
			
			this.parent.addClass(this.factory.buttonBar.classes.active);
			
			this.ui.window.fadeIn({
				duration: this.duration,
				//easing: this.easeIn
			})
			.css('display', 'inline-block')
			.css('position', 'fixed');
			
			setTimeout(function() {
				t.callback(t.callbacks.open);
				t.callback(callback);
				t.factory.trigger('windowOpenEnd', t);
			}, this.duration);
			
			if(this.ui.window.data('open') != 1) {
				this.position();
			}
			
			this.bringToFront();	
			this.ui.window.data('open', 1);
			this.setVisibility(true);
			this.savePosition();			
		},
		
		position: function() {			
			var left, index  = parseInt(this.ui.window.parent().index()) + 1;
			
			var pos = this.getPosition();
			var x   = pos ? parseInt(pos.x.replace('px', '')) : 0;
			
			this.ui.window.position({
				of: this.parent,
				my: 'left top',
				at: 'right top',
				collision: 'flip'
			});
					
			if(x+this.ui.window.width() > $(window).width()) {
				pos.x = ($(window).width() - this.ui.window.width()) + 'px';
			}
					
			if(this.hasPosition()) {
				this.ui.window.css({
					left: pos.x,
					top: pos.y
				})
				.position('collision', 'fit');
			}
			else {	
				var width = 16;
				
				if(index % 2 == 0) {
					this.shift('left', width);
				}		
				
				this.shift('left', width);
			}

			this.bringToFront();
			this.savePosition();	
		},
				
		shift: function(prop, value) {
			var current = parseInt(this.ui.window.css(prop).replace('px', ''));
			
			this.ui.window.css(prop, current+value);
		},
		
		isOpen: function() {
			return this.ui.window.css('display') == 'none' ? false : true;
		},
		
		toggle: function() {
			if(this.isOpen()) {
				this.close();
			}
			else {
				this.open();
			}
		}	
	});

	PhotoFrame.Photo = PhotoFrame.Class.extend({
			
		/**
		 * The random string used to cache the photo
		 */			 
		
		cache: false,
			
		/**
		 * The cached photo URL. This property is set in the render() callback
		 */			 
		
		cacheUrl: false,
			
		/**
		 * Image Compression (1-100)
		 */	
		 
		compression: 100,
		 
		/**
		 * Crop Settings
		 */
		 
		cropSettings: {},
		
		/**
		 * Photo Description
		 */	
		 
		description: '',
		 	
		/**
		 * Disable users from cropping photos?
		 */		
		 
		disableCrop: false,
		
		/**
		 * Is this photo being edit? If false, then a new photo
		 */	
		 
		edit: false,
		 
		/**
		 * The Photo Frame Factory object
		 */	
		
		factory: false,
			 
		/**
		 * Force users to crop new photos?
		 */		
		 
		forceCrop: true,
		 
		/**
		 * Photo Index
		 */	
		 
		index: false,
		
		/**
		 * Has the photo cropping been initialized?
		 */	
		 
		initialized: false,
		
		/**
		 * Photo ID
		 */	
		 
		id: false,
			
		/**
		 * jCrop object
		 */	
		 
		jcrop: false,
		
		/**
		 * Photo Keywords
		 */	
		 
		keywords: '',
		
		/**
		 * Image Manipulations
		 */
		 
		manipulations: {},
		 
		/**
		 * Original Image Manipulation
		 */
		 
		originalManipulations: {},
		 
		/**
		 * The original file path
		 */
		 
		originalPath: false,
		 
		/**
		 * The original file URL
		 */
		 
		originalUrl: false,
		 
		/**
		 * The framed file path
		 */
		 
		path: false,
		 
		/**
		 * The framed file path
		 */
		 
		rendering: false,
		 
		/**
		 * Default Crop Size
		 */
		 
		size: false,
		
		/**
		 * Photo Title
		 */	
		 
		title: '',
		 		
		/**
		 * An object of UI elements
		 */	
		 
		ui: {
			actionBar: false,
			edit: false,
			del: false,
			image: false,
			photo: false,
			rendering: false,
			saving: false
		},
					
		/**
		 * The photo URL
		 */
		 
		url: false,
		
		/**
		 * use the cache image?
		 */
		 
		useCache: false,
		 			
		/**
		 * Has the crop utility been released?
		 */
		 
		released: false,
				
		/**
		 * The wrapping DOM object
		 */
		 
		$wrapper: false,
		
		/**
		 * Constructor to set the options and UI events.
		 *
		 * @param object  The wrapper object
		 * @param object  An array of options to be set
		 */	
		 	
		constructor: function(factory, response, options) {
			var t = this;
			
			this.ui       = {};
			this.$wrapper = false
			this.cache    = factory.hash(12);
			
			this.base(options);

			this.factory      = factory;
		    this.title        = response.title;
		    this.description  = response.description;
		    this.keywords     = response.keywords;
			this.response     = response;
			this.originalPath = response.original_path;
			this.originalUrl  = response.original_url;
			this.url          = response.url;
			this.path         = response.file_path;
			
			this.ui.rendering	  = this.factory.ui.crop.find('.'+this.factory.classes.renderBg);
			this.ui.renderingTxt  = this.factory.ui.crop.find('.'+this.factory.classes.renderText);
			
			if(!this.manipulations) {
				this.manipulations = {};
			}
			
			if(!this.index) {
				this.index = this.factory.getTotalPhotos();
			}

			if(this.$wrapper) {
				this._loadFromObj(this.$wrapper);
			}
			else {
				this._bindClickEvents();
			}
			
			factory.photos.push(t);
		},
		
		_loadFromResponse: function(response, callback) {
			var t    = this;
			var html = $([
			    '<li>',
    				'<div class="'+t.factory.classes.photo+'" id="'+t.factory.classes.photo+'-'+t.factory.fieldId+'-'+t.index+'">',			
    					'<div class="'+t.factory.classes.actionBar+'">',
    						(!t.factory.disableCrop ? '<a href="#'+t.index+'" class="'+t.factory.classes.editPhoto+'"><span class="'+t.factory.icons.editPhoto+'"></span></a>' : ''),
    						'<a href="#'+t.index+'" class="'+t.factory.classes.deletePhoto+'"><span class="'+t.factory.icons.deletePhoto+'"></span></a>',
    					'</div>',
    				'</div>',
				'</li>'
			].join(''));
			
			t.load(response.file_url, function(img) {
				var obj = html.find('.'+t.factory.classes.photo);
				
				if(!t.cachePath) {
					t.cachePath = response.directory.server_path + t.cache + '.' + t.extension(response.file_name);
				}

				t._sendCropRequest(function(cropResponse) {
					obj.prepend(img).append(t._generateNewDataField(cropResponse.save_data));
					t.factory.ui.preview.find('ul').append(html);
					t._loadFromObj(obj, callback);
				});				
			});
		},
		
		_loadFromObj: function(obj, callback) {
			var t    = this;
			
			t.edit 		   = t;	
			t.ui.photo 	   = $(obj);
			t.ui.parent    = t.ui.photo.parent();
			t.ui.actionBar = t.ui.parent.find('.'+t.factory.classes.actionBar);
			t.ui.edit	   = t.ui.actionBar.find('.'+t.factory.classes.editPhoto);
			t.ui.del	   = t.ui.actionBar.find('.'+t.factory.classes.deletePhoto);
			t.ui.field     = t.ui.photo.find('textarea');
			
			t._bindClickEvents();
			
			if(typeof callback == "function") {
				callback();
			}
		},
		
		_bindClickEvents: function() {
			var t = this;
			
			if(t.ui.edit) {
				t.ui.edit.unbind('click').click(function(e) {
					t.showProgress(0);
					t.startCrop();					
					e.preventDefault();
				});
			}
			
			if(t.ui.del) {
				t.ui.del.unbind('click').click(function(e) {
					t.remove();									
					e.preventDefault();
				});
			}
		},
		
		extension: function(filename) {
			return filename.split('.').pop();
		},
		
		remove: function() {
			var t = this;
			
			t.ui.field.remove();
			
			if(t.id !== false) {
				t.factory.$wrapper.append('<input type="hidden" name="photo_frame_delete_photos['+t.factory.delId+'][]" value="'+t.id+'" />');
			}
					
			t.ui.parent.fadeOut(function() {
				t.ui.parent.remove();

				if((t.factory.maxPhotos > 0 && t.factory.maxPhotos > t.factory.getTotalPhotos() - 1) || (t.factory.minPhotos == 0 && t.factory.maxPhotos == 0)) {
					t.factory.showUpload();
				}
				else {
					t.factory.hideUpload();
				}
				
				t.factory.photos[t.index] = false;								
			});
		},
		
		hideManipulation: function(title) {			
			var name   = title.toLowerCase();
			var exists = this.manipulations[name] ? this.manipulations[name] : false;
			if(this.manipulations[name]) {
				this.manipulations[name].visible = false;
			}
			this.factory.trigger('hideManipulation', this, name, exists);
		},
		
		showManipulation: function(title) {			
			var name   = title.toLowerCase();
			var exists = this.manipulations[name] ? this.manipulations[name] : false;
			if(this.manipulations[name]) {
				this.manipulations[name].visible = true;
			}
			this.factory.trigger('showManipulation', this, name, exists);
		},
		
		addManipulation: function(title, visibility, data) {
			var name   = title.toLowerCase();
			var exists = this.manipulations[name] ? this.manipulations[name] : false;
			
			if(data) {
				this.manipulations[name] = {
					visible: visibility,
					data: data
				};		
			}	
			
			this.factory.trigger('addManipulation', this, name, exists);
		},
		
		getManipulation: function(name) {
			name = name.toLowerCase();
			if(this.manipulations[name]) {
				return this.manipulations[name];
			}	
			return false;
		},
		
		getManipulations: function() {
			return this.manipulations;	
		},
		
		showMeta: function() {
			this.factory.showMeta();	
		},
		
		hideMeta: function() {
			this.factory.hideMeta();	
		},
		
		hideInstructions: function() {
			this.factory.hideInstructions();
		},
		
		initJcrop: function(callback, debug) {
			var t = this;
			
			t.factory.ui.toolbar.show();
			
			if(t.initialized) {
				t.destroyJcrop();
			}

            t.cropSettings.onChange = function() {
            	t.hideInstructions();
	          	t.updateInfo();	
	            this.released = false;
	            t.factory.trigger('jcropOnChange', this);
            };
            
            t.cropSettings.onRelease = function() {
	            this.released = true;            	
	            t.factory.trigger('jcropOnRelease', this);
            };
            
            t.cropSettings.onSelect = function() {
	            this.released = false;	            
	            t.factory.trigger('jcropOnSelect', this);
            }
            
			if(t.cropSettings.setSelect) {
				var size = 0;
				
				for(var x in t.cropSettings.setSelect) {
					size += t.cropSettings.setSelect[x];
				}
				
				if(size == 0) {
					delete t.cropSettings.setSelect;
				}
			}
			
			t.ui.cropPhoto.Jcrop(t.cropSettings, function() {
				t.jcrop = this;
	            if(typeof callback == "function") {
		            callback(this);
	            }
	        });
        
			t.initialized = true;
		},
		
		destroyJcrop: function() {
			if(this.jcrop) {
				this.jcrop.destroy();
			};
			
			this.jcrop 	     = false;
			this.initialized = false;
		},
		
		releaseCrop: function() {
			this.jcrop.setSelect([0, 0, 0, 0]);
			this.jcrop.release();
			this.released = true;
		},
			
		hideProgress: function() {
			this.factory.hideProgress();
		},
		
		showProgress: function() {
			this.factory.showProgress();
		},
		
		clearNotices: function(callback) {
			this.factory.clearNotices(callback);
		}, 

		getSaveData: function() {
			if(this.ui.field) {
				return this.ui.field.val();
			}
			else  {
				return false;
			}
		},

		setSaveData: function(data) {
			if(this.ui.field) {
				this.ui.field.val(data).html(data);
			}
		},

		updateJson: function() {
			var saveData = this.jsonEncode(this.getSaveData());

			saveData.manipulations = this.getManipulations();

			this.setSaveData(this.jsonDecode(saveData));
		},
		
		render: function(callback) {
			var t = this;
			
			if(!this.isRendering() && t.ui.cropPhoto) {
				this.startRendering();
				this.useCache = true;
				
				$.post(PhotoFrame.Actions.render, 
					{
						fieldId: this.factory.fieldId,
						colId: this.factory.colId,
						varId: this.factory.varId,
						gridId: this.factory.gridId,
						path: this.path,
						// url: this.url,
						originalPath: this.originalPath,
						originalUrl: this.originalUrl,
						cachePath: this.cachePath,
						cacheUrl: this.cacheUrl,
						cache: this.cache,
						manipulations: t.getManipulations(),
						directory: this.factory.directory,
						preview: true
					}, function(data) {
						t.cacheUrl = data.url;
						t.load(data.url, function(img) {			
							t.ui.cropPhoto.html(img); 
							t.stopRendering();
							t.callback(callback, data);
							t.factory.trigger('render');
						});
					}
				);
			}
			else {
				t.callback(callback);
			}
		},
		
		totalManipulations: function() {
			var count = 0;
			
			for(var x in this.manipulations) {
				count++;
			}
			
			return count;
		},
		
		needsRendered: function() {
			var total = this.totalManipulations();
			
			if(!total || total == 1 && this.manipulations['crop']) {
				return false;
			}
			
			if(total > 0) {
				return true;
			}
		},
		
		needsRendering: function() {
			return this.needsRendered();	
		},
		
		isRendering: function() {
			return this.rendering;	
		},
		
		startRendering: function(callback) {
			this.rendering = true;
			this.factory.trigger('startRendering');
			this.factory.ui.dimmer.addClass(this.factory.classes.rendering);
			this.callback(callback);
		},
		
		stopRendering: function(callback) {
			this.rendering = false;
			this.factory.trigger('stopRendering');
			this.factory.ui.dimmer.removeClass(this.factory.classes.rendering);
			this.callback(callback);
		},
		
		tellScaled: function() {
			if(this.jcrop) {
				return this.jcrop.tellScaled();
			}
			return [0,0,0,0];
		},
		
		/*
		setScale: function(scale) {
			if(scale) {
				t.scale = scale;
			}	
				
			if(t.scale != 1) {
		        var img = t.ui.cropPhoto.find('img');
		        var w = parseInt(img.css('width').replace('px', ''));
		        var h = parseInt(img.css('height').replace('px', ''));
		        
		        w = w * t.scale;
		        h = h * t.scale;
		        	            
		        img.css({
		           width: w,
		           height: h 
		        });
		        
		        $(window).resize();
	        }
		},
		*/
		
		updateInfo: function() {
			var t = this;
			
			if(t.factory.ui.info) {		
				var crop = t.cropDimensions();		
				var aspect = crop.a;
				
				t.factory.ui.info.fadeIn();
				t.factory.ui.info.find('.size .width').html(Math.ceil(crop.w)+'px');
				t.factory.ui.info.find('.size .height').html(Math.ceil(crop.h)+'px');
				t.factory.ui.info.find('.aspect').html('('+aspect[0]+':'+aspect[1]+')');
				t.factory.ui.info.find('.x').html(Math.ceil(crop.x)+'px');
				t.factory.ui.info.find('.x2').html(Math.ceil(crop.x2)+'px');
				t.factory.ui.info.find('.y').html(Math.ceil(crop.y)+'px');
				t.factory.ui.info.find('.y2').html(Math.ceil(crop.y2)+'px');
				
				var errors = t.validate(true);
				
				t.factory.ui.info.find('.width').removeClass(t.factory.classes.invalid);
				t.factory.ui.info.find('.height').removeClass(t.factory.classes.invalid);
				t.factory.ui.info.find('.aspect').removeClass(t.factory.classes.invalid);
				
				if(!errors.validWidth) {
					t.factory.ui.info.find('.width').addClass(t.factory.classes.invalid);
				}
				
				if(!errors.validHeight) {
					t.factory.ui.info.find('.height').addClass(t.factory.classes.invalid);
				}
				
				if(!errors.validRatio) {
					t.factory.ui.info.find('.aspect').addClass(t.factory.classes.invalid);
				}
			}	
			
            if(t.factory.ui.instructions && t.factory.ui.instructions.css('display') != 'none') {	            
	            if(t.factory.initialized) {
	            	t.factory.ui.instructions.fadeOut();
	            }            
            }
		},
		
		load: function(file, callback) {
			if(typeof file == "function") {
				callback = file;
				file = this.photoUrl();
			}
			window.loadImage(file, function(img) {
				if(typeof callback == "function") {
					callback(img);
				}
			});	
		},
		
		photoUrl: function() {	
			return this.useCache ? this.cacheUrl : this.originalUrl;	
		},
		
		startCrop: function(callback) {
		    			    	
			this.factory.cropPhoto = this;
			
			var t   = this;
			var obj = {
				fieldId: this.factory.fieldId ? this.factory.fieldId : false,
				varId: this.factory.varId ? this.factory.varId : false,
				colId: this.factory.colId ? this.factory.colId : false,
				gridId: this.factory.gridId ? this.factory.gridId : false,
				cache: this.cache,
				//url: this.originalUrl,
				originalUrl: this.originalUrl,
				originalPath: this.originalPath,
				exifData: this.response.exif_string ? this.response.exif_string : '',
				//path: this.factory.directory.server_path,
				manipulations: this.manipulations,
				directory: this.factory.directory
			};
			
			t.originalManipulations = $.extend(true, {}, t.manipulations);
			
			if(t.factory.buttonBar) {
				$.each(t.factory.buttonBar.buttons, function(i, button) {
					button.reset();	
				});
			}
			
	        t.factory.trigger('startCropBegin', t);
	        
			t.factory.ui.dimmer.fadeIn('fast');
			
			if(!t.initialized) {
				t.factory.ui.cropPhoto.remove();
			}
			
			t.factory.resetMeta();
			
			//t.factory.showProgress();
				
			$.post(PhotoFrame.Actions.start_crop, obj, function(response) {
			
				if(response.success) {
					t.factory.showProgress(100, function() {
						
						t.useCache  = true;
						t.cacheUrl  = response.cacheUrl;
						t.cachePath = response.cachePath;
						
						if(response.success) {
							$.each(t.factory.buttonBar.buttons, function(i, button) {
								button.startCropCallback(t, obj, response.data);
							});
							t.factory.trigger('startCropCallback', t, obj, response.data);
						}
						else {
							$.each(t.factory.buttonBar.buttons, function(i, button) {
								button.startCropCallbackFailed(t, obj, response.data);
							});
							t.factory.trigger('startCropCallbackFailed', t, obj, response);
						}
						
						t.load(t.photoUrl(), function(img) {
							
							t.factory.hideProgress();
							
							t.ui.cropPhoto = $('<div class="'+t.factory.classes.cropPhoto+'"></div>');
							t.factory.ui.cropPhoto = t.ui.cropPhoto;
							t.factory.trigger('cropPhotoLoaded', t, img);
				        	t.ui.instructions = $('<div class="" />').html(PhotoFrame.Lang.instructions);	
				        	
				        	if(t.factory.settings.photo_frame_hide_instructions != 'true') {
					        	if(t.factory.instructions && t.edit === false) {
					        		t.factory.ui.instructions = $('<div class="'+t.factory.classes.instructions+'" />').html(t.factory.instructions);
					        		t.factory.ui.dimmer.append(t.factory.ui.instructions);
					        	}
					        	else {
					        		if(t.factory.ui.instructions) {
						        		t.factory.ui.instructions.hide();
						        	}
					        	}
					        }
				        	
				            t.ui.cropPhoto.html(img);	            
					        t.factory.ui.crop.prepend(t.ui.cropPhoto);         	
				            t.factory.ui.crop.center();
				            t.factory.ui.crop.show();
				        	   	
				            t.hideMeta();
				            
				            if(t.factory.buttonBar && t.factory.buttonBar.getVisibility()) {
					            t.factory.showTools();
				            }
				            
				            if(t.edit === false && t.size !== false) {
				            	var size = t.size.split('x');
				            	
				            	size[0] = parseInt(size[0]);
				            	size[1] = parseInt(size[1]);
				            	
				           		var x  = (t.ui.cropPhoto.width()  / 2) - (size[0] / 2);
				           		var x2 = x + size[0];
				           		var y  = (t.ui.cropPhoto.height() / 2) - (size[1] / 2);
				           		var y2 = y + size[1];
				           		
				           		t.cropSettings.setSelect = [x, y, x2, y2];
				            }
				            
			            	if(t.title) {
				        		t.factory.ui.metaTitle.val(t.title);
				        	}
					        	
				        	if(t.keywords) {
				        		t.factory.ui.metaKeywords.val(t.keywords);
				        	}
				        	
				        	if(t.description) {
				        		t.factory.ui.metaDescription.val(t.description);
				        	}
				        	
				            t.initJcrop(callback);
				            
				        	t.updateInfo();
				        	
				            $(window).resize();
				            if(t.factory.buttonBar) {
					            for(var x in t.factory.buttons) {				            
						            t.factory.buttonBar.buttons[x].startCrop(t);
					            }
				            }
				            if(t.needsRendered()) {
					            t.render(function() {
					            	t.factory.trigger('startCropEnd', t);
					            });
				            }
				            else {
					           t.factory.trigger('startCropEnd', t);
				            }
						});
							
					});
				}
				else {
					if(response.errors) {
						t.factory.showErrors(response.errors);
					}
					else {
						t.log(response);
						t.factory.showErrors([PhotoFrame.Lang.unexpected_error]);
					}
				}
			});
			
			t.factory.ui.save.unbind('click').bind('click', function(e) {
				
				if(t.factory.showMetaOnSave && t.factory.ui.meta.css('display') == 'none') {
	    			var errors = t.validate();
	    		
	    			if(errors.length == 0) {
			    		t.showMeta();
			    	}
			    	else {
				    	t.factory.notify(errors);
			    	}
		    	}
		    	else {
		    		t.hideMeta();		    		
			    	t.saveCrop();
		    	}

		    	e.preventDefault();
			});
			
			t.factory.ui.cancel.unbind('click').click(function(e) {
				
				t.clearNotices();				
				t.hideMeta();
				t.hideProgress();
				
				t.manipulations  = $.extend(true, {}, t.originalManipulations);
				t.factory.cancel = true;
				t.render();
				t.factory.hideDimmer();
				t.factory.resetProgress();
				
				if(t.factory.cropPhoto) {
					t.factory.cropPhoto.destroyJcrop();	
				}	
				
				if(t.ui.saving) {
					t.ui.saving.fadeOut(function() {
						$(this).remove();
					});
				}
				
				t.factory.trigger('cancel', t);
												
				e.preventDefault();
			});
		},
		
		save: function(saveData) {
			var t 	 = this;			
			var date = new Date();
			var edit = t.edit;
			
			this.factory.trigger('saveBegin', this);
			
			if(!edit) {			
				t._createPhoto(saveData);
			}
			else {				
				t._updatePhoto(saveData);	
			}
			
			t.load(t.cropResponse.url, function(img) {
				if(t.factory.maxPhotos > 0 && (t.factory.maxPhotos <= t.factory.getTotalPhotos())) {
					t.factory.hideUpload();
				}	
				
				if(!edit) {					    
					t.factory.ui.preview.find('ul').append(t.ui.parent);
				}
	       		
	       		t.ui.photo.find('img').remove();
	       		t.ui.photo.append(img);
	       		
				if(t.ui.saving) {			
					t.ui.saving.remove();
				}
				
				t.hideProgress();
				t.hideDimmer();
				
				t.factory.trigger('saveEnd', t);
			});
		},
		
		hideDimmer: function() {
			this.factory.hideDimmer();
		},
		
		_createPhoto: function(saveData) {	
			var t    = this;	
			var html = $([
			    '<li>',
    				'<div class="'+t.factory.classes.photo+'" id="'+t.factory.classes.photo+'-'+t.factory.fieldId+'-'+t.index+'">',			
    					'<div class="'+t.factory.classes.actionBar+'">',
    						'<a href="#'+t.index+'" class="'+t.factory.classes.editPhoto+'"><span class="'+t.factory.icons.editPhoto+'"></span></a>',
    						'<a href="#'+t.index+'" class="'+t.factory.classes.deletePhoto+'"><span class="'+t.factory.icons.deletePhoto+'"></span></a>',
    					'</div>',
    				'</div>',
				'</li>'
			].join(''));
			
			t.edit 		   = t;	
			t.ui.parent    = $(html);
			t.ui.photo 	   = t.ui.parent.find('.'+t.factory.classes.photo);
			t.ui.actionBar = t.ui.parent.find('.'+t.factory.classes.actionBar);
			t.ui.edit	   = t.ui.actionBar.find('.'+t.factory.classes.editPhoto);
			t.ui.del	   = t.ui.actionBar.find('.'+t.factory.classes.deletePhoto);
			t.ui.field     = t._generateNewDataField(saveData);
			
			t.ui.photo.append(t.ui.field);	

			t._bindClickEvents();
		},
		
		_generateNewDataField: function(saveData) {
			return $('<textarea name="'+this.factory.fieldName+'[][new]" id="'+this.factory.classes.editPhoto+'-'+this.factory.fieldId+'-'+this.index+'" style="display:none">'+saveData+'</textarea>');
		},
		
		_updatePhoto: function(saveData) {
			this.ui.field.val(saveData).html(saveData);
		},
		
		saveCrop: function() {
			var t    = this;
			
			this.factory.trigger('saveCropStart', t);
			
			var errors = t.validate();
			  
			if(errors.length > 0) {
				t.factory.notify(errors);
			}
			else {
				t.clearNotices();
				
				t.ui.saving = $('<div class="'+t.factory.classes.saving+'"><span></span> '+PhotoFrame.Lang.saving+'</div>');
				
				t.factory.ui.dimmer.append(t.ui.saving);			
				t.factory.ui.dimmer.find('.'+t.factory.classes.saving+' span').activity();			
				t.factory.ui.crop.fadeOut();
				
				if(t.ui.info) {
					t.ui.info.fadeOut();
				}
				
				t.hideMeta();
				t.ui.saving.center();
				
				t.title       = t.factory.ui.metaTitle.val();
				t.description = t.factory.ui.metaDescription.val();
				t.keywords    = t.factory.ui.metaKeywords.val();
				
				t._sendCropRequest(function(cropResponse) {
					t.cropResponse      = cropResponse;
					t.factory.cropPhoto = false;
					t.destroyJcrop();		
					t.save(cropResponse.save_data);	
					t.factory.trigger('saveCropStop', t, cropResponse);
				});
			}
		},
		
		_sendCropRequest: function(response, callback) {
			if(typeof response == "function") {
				callback = response;
				response = false;
			}
			
			if(!response) {
				var response = this.response;
			}
			
			var t = this;
					
			var _defaultSize = {
    			 x: 0,
    			 y: 0,
    			x2: 0,
    			y2: 0,
    			 w: 0,
    			 h: 0
    		};
    		
    		var size = t.released ? _defaultSize : t.tellScaled();
    		
    		if(!size.w || !size.h || this.factory.settings.photo_frame_disable_regular_crop === 'true') {
    			size = _defaultSize;
	    		delete t.cropSettings.setSelect;
    		}
    		else {
    			t.cropSettings.setSelect = [size.x, size.y, size.x2, size.y2];
    		}

			$.post(PhotoFrame.Actions.crop_photo, {
				fieldId: t.factory.fieldId,
				varId: t.factory.varId,
				colId: t.factory.colId,
				gridId: t.factory.gridId,
				cache: t.cache,
				useCache: t.useCache,
				cacheUrl: t.cacheUrl ? t.cacheUrl : response.file_url,
				cachePath: t.cachePath ? t.cachePath : response.file_path,
				id: t.factory.directory.id,
				assetId: t.response.asset_id,
				index: t.factory.index,
				photo_id: t.id,
				image: response.file_path,
				name: response.file_name,
				manipulations: t.manipulations,
				directory: t.factory.directory,
				original: response.original_path,
				original_file: response.original_file,
				exifData: response.exif_string,
				url: response.url,
				edit: t.edit !== false ? true : false,
				height: size.h,
				width: size.w,
				scale: t.scale,
				rotate: t.rotate,
				resize: t.resize,
				resizeMax: t.resizeMax,
				x: size.x,
				x2: size.x2,
				y: size.y,
				y2: size.y2,
				title: t.title,
				description: t.description,
				keywords: t.keywords,
				compression: t.compression
			}, function(cropResponse) {
				if(typeof callback == "function") {
					callback(cropResponse);		
				}
			});
		},
		
		isCropped: function(cropSize) {
			
			if(!cropSize) {
				var cropSize = this.cropDimensions();
			}
			
			if(!cropSize && this.jcrop.tellSelect) {
				var cropSize = this.jcrop.tellScalled();
			}
			
			if(this.factory.ui.dimmer.find('.jcrop-tracker').width() == 0) {
				return false;
			}
			
			return typeof cropSize == "undefined" || cropSize.x || cropSize.y || cropSize.x2 || cropSize.y2 ? true : false;	
		},
		
		reduce: function(numerator, denominator) {
			var gcd = function gcd (a, b) {
	            return (b == 0) ? a : gcd (b, a%b);
	        }
			
			gcd = gcd(numerator,denominator);
			
			return [numerator/gcd, denominator/gcd];
		},
		
		cropDimensions: function(cropSize) {
			var defaultCropSize = {
				w: 0,
				h: 0,
				x: 0,
				x2: 0,
				y: 0,
				y2: 0
			}
				
			if(!cropSize && this.jcrop.tellSelect) {
				var cropSize = this.jcrop.tellSelect();
			}
			else {
				var cropSize = defaultCropSize;
			}
			
			var image = {
				w: this.ui.cropPhoto.find('img').width(),
				h: this.ui.cropPhoto.find('img').height()
			};
			
			cropSize.w = cropSize.w == 0 ? image.w : cropSize.w;
			cropSize.h = cropSize.h == 0 ? image.h : cropSize.h;
			
			if(!this.cropSettings.aspectRatio) {
				var aspect = this.reduce(Math.ceil(cropSize.w), Math.ceil(cropSize.h));
			}
			else {
				var aspect = this.cropSettings.aspectRatioString.split(':');
				
				if(typeof aspect[0] == "undefined") {
					aspect[0] = 0;
				}	
				
				if(typeof aspect[1] == "undefined") {
					aspect[1] = 0;
				}	
				
				if(!this.isCropped(cropSize)) {
					aspect = [cropSize.w, cropSize.h];	
				}
				
				aspect = this.reduce(aspect[0], aspect[1]);
			}
			
			if(!this.isCropped(cropSize)) {
				cropSize   = defaultCropSize;
				cropSize.w = image.w;
				cropSize.h = image.h;
				
				aspect = this.reduce(image.w, image.h);
			};
			
			cropSize.a = aspect;		
			
			return cropSize;
		},
		
		round: function(number, place) {
			if(!place) {
				var place = 100;
			}
			return Math.round(number * place) / place;
		},
		
		aspectRatio: function(d) {
		    var df = 1, top = 1, bot = 1;
		    var limit = 1e5; //Increase the limit to get more precision.
		 
		    while (df != d && limit-- > 0) {
		        if (df < d) {
		            top += 1;
		        }
		        else {
		            bot += 1;
		            top = parseInt(d * bot, 10);
		        }
		        df = top / bot;
		    }
		  
		    return top + '/' + bot;
		},
		
		width: function() {
			return this.ui.cropPhoto ? this.ui.cropPhoto.find('img').width() : 0;
		},
		
		height: function() {
			return this.ui.cropPhoto ? this.ui.cropPhoto.find('img').height() : 0;
		},
		
		validate: function(json) {
			var t = this;
			
			if(!json) {
				var json = false;	
			}
			
			var ratio       = t.cropSettings.aspectRatio ? t.cropSettings.aspectRatio : false;
			var cropSize    = t.cropDimensions();
			
			var cropWidth   = cropSize.w;
			var cropHeight  = cropSize.h;
			var minWidth    = t.cropSettings.minSize ? t.cropSettings.minSize[0] : 0;
			var minHeight   = t.cropSettings.minSize ? t.cropSettings.minSize[1] : 0;
			var maxWidth    = t.cropSettings.maxSize ? t.cropSettings.maxSize[0] : 0;
			var maxHeight   = t.cropSettings.maxSize ? t.cropSettings.maxSize[1] : 0;
			var isCropped   = t.isCropped(cropSize);
			
			var height      = Math.ceil(cropSize.h);
			var width       = Math.ceil(cropSize.w);
			var errors      = [];
			var imgWidth    = Math.ceil(this.width());
			var imgHeight   = Math.ceil(this.height());
			
			var response    = {
				validWidth: true,
				validHeight: true,
				validRatio: true,
				minWidth: minWidth,
				minHeight: minHeight,
				maxWidth: maxWidth,
				maxHeight: maxHeight,
				width: cropSize.w,
				height: cropSize.h,
				x: cropSize.x,
				x2: cropSize.x2,
				y: cropSize.y,
				y2: cropSize.y2,
				ratio: ratio,
				ratioString: t.cropSettings.aspectRatioString
			};

			if(minWidth > 0 && minWidth > width) {
				response.validWidth = false;
				errors.push(this.factory.parse(PhotoFrame.Lang.min_width, 'min_width', minWidth));
			}
			
			if(minHeight > 0 && minHeight > height) {
				response.validHeight = false;
				errors.push(this.factory.parse(PhotoFrame.Lang.min_height, 'min_height', minHeight));
			}
			
			if(maxWidth > 0 && maxWidth < width) {
				response.validWidth = false;
				errors.push(this.factory.parse(PhotoFrame.Lang.max_width, 'max_width', maxWidth));
			}
			
			if(maxHeight > 0 && maxHeight < height) {
				response.validHeight = false;
				errors.push(this.factory.parse(PhotoFrame.Lang.max_height, 'max_height', maxHeight));
			}
			
			if(!isCropped && ratio) {
				if(t.round(ratio, 100) != t.round(cropWidth / cropHeight, 100)) {
					response.validRatio = false;
					errors.push(this.factory.parse(PhotoFrame.Lang.required_ratio, 'aspect_ratio', t.cropSettings.aspectRatioString));
				}
			}
			
			response.errors = errors;
				
			if(json) {
				return response;
			}
			
			return errors;
		}	
	});
	
	PhotoFrame.ProgressBar = PhotoFrame.Class.extend({
				
		/**
		 * The progress percentage.
		 */		
		 
		progress: 0,				
			
		/**
		 * An object of UI elements.
		 */		
		 
		ui: {},
		
		/**
		 * The wrapping DOM object.
		 */		
		 
		$wrapper: false,
			
		/**
		 * Constructor to set the options and UI events.
		 *
		 * @param object  The wrapper object
		 * @param object  An array of options to be set
		 */	
		 
		constructor: function(obj, progress, options) {	
			var t = this;
			
			t.progress = 0;
			t.ui 	   = {};
			t.$wrapper = $(obj);
						
			if(typeof progress == "object") {
				options  = progress;
				progress = 0;
			}
			
			if(typeof progress == "undefined") {
				var progress = 0;
			}
			
			if(typeof options == "undefined") {
				var options = {};
			}

			var _default = {
				callbacks: {
					init: function() {},
					cancel: function() {},
					progress: function() {},	
					hide: function() {},	
					show: function() {},	
					reset: function() {},	
				},
				duration: 333,
				classes: {
					progress: 'photo-frame-progress-fill',
					cancel: 'photo-frame-progress-cancel',
					wrapper: 'photo-frame-progress-wrapper'
				}	
			};
			
			t.ui = {
				obj: t.$wrapper,
				parent: t.$wrapper.parent(),
				fill: t.$wrapper.find	
			};
			
			t.base(_default, options);
			
			if(!t.ui.obj.data('init')) {
				t.ui.fill    = $('<div class="'+t.classes.progress+'" />');
				t.ui.cancel  = $('<a href="#" class="'+t.classes.cancel+'"><span class="icon-cancel"></span></a>');
				
				t.ui.obj.wrap('<div class="'+t.classes.wrapper+' '+t.classes.icons+'" />');
				t.ui.cancel.insertBefore(t.ui.obj);
				t.ui.obj.append(t.ui.fill);
				t.ui.obj.data('init', 'true');
				
				t.ui.wrapper = t.ui.obj.parent('.'+t.classes.wrapper);
				
				t.ui.cancel.click(function(e) {	
					
					t.callbacks.cancel(t, e);
					
					t.hide(function() {
						t.reset(0);
					});
					
					e.preventDefault();
				});
				
				t.callbacks.init(t);
					
				t.set(t.progress);
			}
			
			$(window).resize(function() {
				t.center();				
			});
		},
		
		/**
		 * Reset the progress bar back to zero
		 */	
		 
		reset: function(callback) {
			var t = this;
			
			t.set(0, function() {				
				t.callbacks.reset(t);
				
				if(typeof callback == "function") {
					callback();
				}
			});
		}, 
		
		/**
		 * Set the progress bar to a defined value.
		 *
		 * @param object    The progress value
		 * @param callback  A function to be used for a callback
		 */	
		 
		set: function(value, callback) {
			var t      = this;
			var outer  = t.ui.obj.outerWidth();
			var width  = outer && !isNaN(outer) && outer > 0 ? outer : t.ui.obj.width();

			t.progress = parseInt(value) > 100 ? 100 : parseInt(value);
			t.progress = parseInt(width * (value / 100));
			
			t.ui.fill.css('width', t.progress);
			
			t.callbacks.progress(t, t.progress);
			
			setTimeout(function() {
				if(typeof callback == "function") {
					callback(t);
				}
			}, t.duration);
		},
		
		/**
		 * Get the progress bar value.
		 *
		 * @return int The amount of progress in the bar
		 */	
		 
		get: function() {
			return this.progress;
		},
		
		/**
		 * Center the progress bar within the parent.
		 */	
		 
		center: function() {		
			this.ui.wrapper.position({
				of: this.ui.parent,
				my: 'center',
				at: 'center'
			});	
		},
		
		/**
		 * Show the progress bar.
		 *
		 * @param mixed  The animation duration.
		 * @param mixed  The callback function.
		 */	
		 
		show: function(duration, callback) {
			var t = this;
			
			if(typeof duration == "function") {
				callback = duration;
				duration = undefined;
			}
			
			if(typeof duration == "undefined") {
				var duration = t.duration;
			}
			
			t.center();
			
			t.ui.wrapper.fadeIn(duration, function() {
				t.callbacks.show(t);
			
				if(typeof callback == "function") {
					callback(t);
				}				
			});
			
			t.center();
		},
		
		/**
		 * Hide the progress bar.
		 *
		 * @param mixed  The animation duration.
		 * @param mixed  The callback function.
		 */	
		 
		hide: function(duration, callback) {
			var t = this;
			
			if(typeof duration == "function") {
				callback = duration;
				duration = undefined;
			}
			
			if(typeof duration == "undefined") {
				var duration = t.duration;
			}
			
			t.ui.wrapper.fadeOut(duration, function() {	
				t.callbacks.hide(t);
				
				if(typeof callback == "function") {
					callback(t);
				}				
			});
		}
	});
		
	PhotoFrame.Database = PhotoFrame.Class.extend({
		
		/**
		 * The driver used
		 */	
		 
		driver: 'localStorage',
		
		/**
		 * Datatable Fields
		 */	
		 
		fields: [],
		
		/**
		 * The localStorageDB object
		 */	
		 
		model: false,
		
		/**
		 * The name of the datatable
		 */	
		 
		name: false,
		
		/**
		 * If TRUE the datatable will be reset with each page load
		 */	
		 
		reset: false,
		
		/**
		 * Easily istantiate a database using localStorage
		 *
		 * @param 	string 	The name of the datatable
		 * @param 	string 	The storage driver (defaults to localStorage)
		 * @return	mixed
		 */		
		 
		constructor: function(options) {			
			this.base(options);
			this.model = new localStorageDB('PhotoFrame', this.driver);
			if(this.reset) {
				this.clear();
			}
			this._firstRun();
		},
		
		/**
		 * Clear the datatable
		 *
		 * @return	void
		 */		
		 
		clear: function() {
			this.model.dropTable(this.name);
			this.model.commit();
		},
		
		/**
		 * Create the datatable
		 *
		 * @return	void
		 */		
		 
		create: function() {
			this.model.createTable(this.name, this.fields);
			this.model.commit();
		},
		
		/**
		 * Drop the datatable
		 *
		 * @return	void
		 */		
		 
		drop: function() {
			this.model.dropTable(this,name);
			this.model.commit();
		},
		
		/**
		 * Does the datatable exist?
		 *
		 * @return	bool  Returns TRUE if exists
		 */		
		 
		exists: function() {
			return this.model.tableExists(this.name);
		},
		
		/**
		 * Get the data from the datatable
		 *
		 * @param   object  A data object used filter the results
		 * @return	bool  Returns TRUE if exists
		 */		
		 
		get: function(data) {
			return this.model.query(this.name, data);
		},
		
		/**
		 * Inserts data into the datatable
		 *
		 * @param   object  An object of data to insert
		 * @return	void
		 */		
		 
		insert: function(data) {
			this.model.insert(this.name, data);
			this.model.commit();
		},
		
		/**
		 * Insert if data does not exist
		 *
		 * @param   object  An object of data to insert
		 * @return	void
		 */		
		 
		insertIfNew: function(data) {
			if(this.model.query(this.name, data).length == 0) {
				this.model.insert(this.name, data);
				this.model.commit();
			}
		},
		
		/**
		 * Insert or update
		 *
		 * @param   object  An object of data to insert
		 * @return	void
		 */		
		 
		insertOrUpdate: function(query, data) {
			this.model.insertOrUpdate(this.name, query, data);
			this.model.commit();
		},
		
		/**
		 * Update data in the datatable
		 *
		 * @param   object  The row ID to update
		 * @param   object  An object of data to update
		 * @return	void
		 */		
		
		update: function(query, data) {
			if(typeof query != "object") {
				query = {ID: query};
			}
			this.model.update(this.name, query, function(row) {
				return $.extend(true, {}, row, data);
			});
			this.model.commit();
		},
		
		/**
		 * Remove data from the datatable
		 *
		 * @param   object  The row ID to update
		 * @return	void
		 */	
		 
		remove: function(id) {
			this.model.deleteRows(this.name, {ID: id});
			this.model.commit();
		},
		
		/**
		 * The database first run
		 *
		 * @return	void
		 */	
		
		_firstRun: function() {
			if(!this.exists()) {
				this.create();
			}
		}
		
	});

	PhotoFrame.Slider = PhotoFrame.BaseElement.extend({

		/**
		 * Slider animation speed
		 */	

		animate: false,

		/**
		 * An object of callback methods
		 */	
		 
		callbacks: {
			create: function(event, ui) {},
			start: function(event, ui) {},
			slide: function(event, ui) {},
			stop: function(event, ui) {}
		},

		/**
		 * Is slider disabled?
		 */	

		disabled: false,
		 
		/**
		 * The PhotoFrame.Factory object
		 */	

		factory: false,

		/**
		 * Minimum slider value
		 */	

		min: false,
		 
		/**
		 * Maximum slider value
		 */	

		max: false,

		/**
		 * The slider's orientation
		 */	

		orientation: false,

		/**
		 * The parent jQuery object to append the slider
		 */	

		parent: false,

		/**
		 * Use the min & max for the slider's range?
		 */	

		range: false,

		/**
		 * The slider's increment value
		 */	

		step: 1,

		/**
		 * An object of UI elements
		 */	
		 
		ui: {
		 	slider: false,
			tooltip: false
		},

		/**
		 * Should the slider use the preferences?
		 */	

		usePreferences: false,

		/**
		 * The slider value
		 */	

		value: false,

		/**
		 * Constructor method
		 *
		 * @param   object  The PhotoFrame.Factory object
		 * @param   object  The parent jQuery object to append the slider
		 * @param   object  An object of options
		 * @return  void
		 */		
		 
		constructor: function(factory, parent, options) {
			this.base(factory, parent, options);
			this.buildSlider();
		},

		/**
		 * Build the slider HTML
		 *
		 * @return  void
		 */		
		 
		buildSlider: function() {
			var t 	    = this;
			var classes = 'photo-frame-slider-tooltip photo-frame-hidden';
			
		 	this.ui.slider  = $('<div class="photo-frame-slider"></div>');
		 	this.ui.tooltip = $('<div class="'+classes+'"></div>');

		 	this.parent.append(this.ui.slider);
		 	this.parent.append(this.ui.tooltip);

		 	this.ui.slider.slider({
		 		animate: this.animate,
		 		disabled: this.disabled,
				min: this.min,
				max: this.max,
				orientation: this.orientation,
				range: this.range,
				step: this.step,
				value: this.value,
				start: function(e, ui) {
					t.showTooltip();
					t.positionTooltip(ui);
					t.factory.trigger('sliderStart', t);
					t.callback(t.callbacks.start, e, ui);
				},
				create: function(e, ui) {
					t.positionTooltip(ui);
					t.factory.trigger('sliderCreate', t);
					t.callback(t.callbacks.create, e, ui);
				},
				slide: function(e, ui) {
					t.positionTooltip(ui);
					t.factory.trigger('sliderSlide', t);
					t.callback(t.callbacks.slide, e, ui);
					t.setPreference();
				},
				stop: function(e, ui) {
					t.hideTooltip();
					t.positionTooltip(ui);
					t.factory.trigger('sliderStop', t);
					t.callback(t.callbacks.stop, e, ui);
				}
			});

		 	this.setValueFromPreferences();
		},

		/**
		 * Position the tooltip
		 *
		 * @param   object  The slider UI object
		 * @return  void
		 */		
		 
		positionTooltip: function(ui) {			
			this.ui.tooltip.html(ui.value);		
			this.ui.tooltip.position({
				of: ui.handle,
				my: 'center top',
				at: 'center bottom'
			});
			
			var top = parseInt(this.ui.tooltip.css('top').replace('px', ''), 10);
			
			this.ui.tooltip.css('top', top+10);			
		},

		/**
		 * Show the tooltip
		 *
		 * @return  void
		 */		
		 
		showTooltip: function() {
			this.ui.tooltip.removeClass('photo-frame-hidden');
		},

		/**
		 * Hide the tooltip
		 *
		 * @return  void
		 */		
		 
		hideTooltip: function() {
			this.ui.tooltip.addClass('photo-frame-hidden');
		},

		/**
		 * Enable the slider
		 *
		 * @return  void
		 */		
		 
		enable: function() {
			this.disabled = false;
			this.ui.slider.slider('enable');
		},

		/**
		 * Disable the tooltip
		 *
		 * @return  void
		 */		
		 
		disable: function() {
			this.disabled = true;
			this.ui.slider.slider('disable');
		},

		/**
		 * Get the slider option
		 *
		 * @param   string  The slider option name
		 * @return  mixed
		 */		
		 
		getSliderOption: function(option) {
			return this.ui.slider.slider(option);
		},

		/**
		 * Show the tooltip
		 *
		 * @param   string  The option to set
		 * @param   mixed   The option value
		 * @return  void
		 */		
		 
		setSliderOption: function(option, value) {
			this.ui.slider.slider(option, value);
		},

		/**
		 * Set the slider value
		 *
		 * @param   mixed   The slider value
		 * @return  void
		 */		
		 
		setValue: function(value) {
			this.setSliderOption('value', value);
		},

		/**
		 * Get the slider value
		 *
		 * @return  int
		 */		
		 
		getValue: function() {
			return this.getSliderOption('value');
		},

		/**
		 * Is the slider enabled?
		 *
		 * @return  bool
		 */		
		 
		isEnabled: function() {
			return this.getSliderOption('disabled') ? false : true;
		},

		/**
		 * Is the slider disabled?
		 *
		 * @return  bool
		 */		
		 
		isDisabled: function() {
			return this.getSliderOption('disabled');
		},

		/**
		 * Set the last slider value to the preferences
		 *
		 * @return  void
		 */		
		 
		setPreference: function() {
			if(this.usePreferences) {
				PhotoFrame.Model.Preferences.setPreference('sliderLastValue', this.getValue());
			}
		},

		/**
		 * Get the last slider value to the preferences
		 *
		 * @return  mixed
		 */		
		 
		getPreference: function() {
			if(this.usePreferences) {
				return PhotoFrame.Model.Preferences.getPreference('sliderLastValue');
			}
			return false;
		},

		/**
		 * Set the slider value from the preferences
		 *
		 * @return  value
		 */		
		 
		setValueFromPreferences: function() {
			if(this.usePreferences && this.value === false) {
				this.setValue(this.getPreference());
			}
		}

	});
	
	PhotoFrame.ColorPicker = PhotoFrame.BaseElement.extend({

		/**
		 * An object of callback methods
		 */	

		callbacks: {
			init: function() {},
			change: function(color) {},
			move: function(color) {},
			hide: function(color) {},
			show: function(color) {},
			beforeShow: function(color) {},
		},

		/**
		 * Override the default cancel button text
		 */	

		cancelText: false,

		/**
		 * Override the default choose button text
		 */	

		chooseText: false,

		/**
		 * Add an additional class name to the color picker
		 */	

		className: 'photo-frame-color-picker',

		/**
		 * When clicking outside the colorpicker, force to change the value
		 */	

		clickoutFiresChange: false,

		/**
		 * The default color string
		 */	

		color: false,

		/**
		 * Disable the color picker by default
		 */	

		disabled: false,

		/**
		 * Flat mode
		 */	

		flat: false,

		/**
		 * Fonts PhotoFrame.Window object ID
		 */

		fontWindowId: 'fontWindowColorPicker',

		/**
		 * The default colors in the palette
		 */	

		palette: [],

		/**
		 * Change the preferred output of the color format
		 * Accepted Values: hex|hex6|hsl|rgb|name
		 */	

		preferredFormat: 'hex',

		/**
		 * Show the alpha transparency option
		 */	

		showAlpha: false,

		/**
		 * Show the cancel and choose buttons
		 */	

		showButtons: false,

		/**
		 * Show the initial color beside the new color
		 */	

		showInitial: false,

		/**
		 * Allow free form typing via text input
		 */	

		showInput: false,

		/**
		 * Show the user created color palette
		 */	

		showPalette: false,

		/**
		 * Show the color that is selected within the palette
		 */	

		showSelectionPalette: false,

		/**
		 * Should the slider use the preferences?
		 */	

		usePreferences: false,


		constructor: function(factory, parent, options) {
			this.base(factory, parent, options);
			this.buildColorPicker();

			if(!this.color) {
				this.setColorFromPreferences();
			}
		},

		buildColorPicker: function() {
			var t = this;

			this.parent.spectrum({
				cancelText: this.cancelText,
				chooseText: this.chooseText,
				className: this.className,
				clickoutFiresChange: this.clickoutFiresChange,
				color: this.color,
				disabled: this.disabled,
				flat: this.flat,
				palette: this.palette,
				preferredFormat: this.preferredFormat,
				showAlpha: this.showAlpha,
				showButtons: this.showButtons,
				showInitial: this.showInitial,
				showInput: this.showInput,
				showPalette: this.showPalette,
				showSelectionPalette: this.showSelectionPalette,
				change: function(color) {
					t.setPreference();
					t.callback(t.callbacks.change, color);
					t.factory.trigger('colorPickerChange', t, color);
				},
				move: function(color) {
					t.callback(t.callbacks.move, color);
					t.factory.trigger('colorPickerMove', t, color);
				},
				hide: function(color) {
					t.callback(t.callbacks.hide, color);
					t.factory.trigger('colorPickerHide', t, color);
				},
				show: function(color) {
					t.callback(t.callbacks.show, color);
					t.factory.trigger('colorPickerShow', t, color);
				},
				beforeShow: function(color) {
					t.callback(t.callbacks.beforeShow, color);
					t.factory.trigger('colorPickerBeforeShow', t, color);
				}
			});

			this.callback(this.callbacks.init);
			this.factory.trigger('colorPickerInit');
		},

		get: function() {
			return this.getColor();
		},

		set: function(color) {
			this.setColor(color);
		},

		getRgb: function() {
			return this.getColor().toRgb();
		},
		
		getRgbString: function() {
			return this.getColor().toRgbString();
		},

		getHsl: function() {
			return this.getColor().toHsl();
		},
		
		getHslString: function() {
			return this.getColor().toHslString();
		},

		getName: function() {
			return this.getColor().toName();
		},
		
		getPercentageRgb: function() {
			return this.getColor().toPercentageRgb();
		},
		
		getPercentageRgbString: function() {
			return this.getColor().toPercentageRgbString();
		},
		
		getHex: function() {
			return this.getColor().toHex();
		},

		getHexString: function() {
			return this.getColor().toHexString();
		},

		getColor: function() {
			return this.parent.spectrum('get');
		},
		
		getString: function(format) {
			return this.getColor().toString(format);
		},

		setColor: function(color) {
			this.parent.spectrum('set', color);
			this.setPreference();
		},
		
		enable: function() {
			this.parent.spectrum('enable');
			this.factory.trigger('colorPickerEnable');
		},

		disable: function() {
			this.parent.spectrum('disable');
			this.factory.trigger('colorPickerDiable');
		},

		destroy: function() {
			this.parent.spectrum('destroy');
			this.factory.trigger('colorPickerDestroy');
		},

		show: function() {
			this.parent.spectrum('show');
			this.factory.trigger('colorPickerShow');
		},

		hide: function() {
			this.parent.spectrum('hide');
			this.factory.trigger('colorPickerHide');
		},

		toggle: function() {
			this.parent.spectrum('toggle');
			this.factory.trigger('colorPickerToggle');
		},

		getPreference: function() {
			var _return = {
				rgb: PhotoFrame.Model.Preferences.getPreference('colorPickerLastColorRgb'),
				hex: PhotoFrame.Model.Preferences.getPreference('colorPickerLastColorHex')
			};

			if(!this.usePreferences && typeof _return == "array" && _return.length == 0) {
				return false;
			}

			return _return;
		},

		setPreference: function() {
			if(this.usePreferences) {
				PhotoFrame.Model.Preferences.setPreference('colorPickerLastColorRgb', this.getRgbString());
				PhotoFrame.Model.Preferences.setPreference('colorPickerLastColorHex', this.getHexString());
			}
		},

		setColorFromPreferences: function() {
			if(this.usePreferences) {
				this.setColor(this.getPreference().hex);
			}
		}
	});

	/**
	 * This datatable stores the locations of the windows
	 */
	 
	PhotoFrame.Model.Preferences = new PhotoFrame.Database({
		
		/**
		 * The name of the datatable
		 */
		 
		name: 'photoFramePrefs',
		
		/**
		 * An array of datatable columns
		 */
		 
		fields: ['key', 'value'],

		/**
		 * Get one or more preferences by defining a key.
		 * If no key is present, all preferences are returned.
		 *
		 * @param   mixed  A preference name (the key)
		 * @return  bool
		 */		
		 
		getPreference: function(key) {
			if(typeof key != "undefined") {
				var _return = PhotoFrame.Model.Preferences.get({key: key});

				if(_return.length > 0) {
					return _return[0].value;
				}

				return false;
			}
			return PhotoFrame.Model.Preferences.get();
		},
		
		/**
		 * Set one or preferences by passing a key and value.
		 * If an object is passed, it will set multiple prefs.
		 *
		 * @param  mixed  The preference name (Or object of keys and values)
		 * @param  mixed  The preference value
		 * @return void
		 */		
		 
		setPreference: function(key, value) {
			if(typeof key == "object") {
				var obj = key;
				for(key in obj) {
		  			this.setPreference(key, obj[key]);
	  			}
			}
			else {
				PhotoFrame.Model.Preferences.insertOrUpdate({key: key}, {
					key: key,
					value: value
				});	
			}
		}

	});
	
	/**
	 * This datatable stores the locations of the windows
	 */
	 
	PhotoFrame.Model.WindowLocations = new PhotoFrame.Database({
		
		/**
		 * The name of the datatable
		 */
		 
		name: 'windowLocations',
		
		/**
		 * An array of datatable columns
		 */
		 
		fields: ['title', 'x', 'y', 'visible']
		
	});
	
	PhotoFrame.WindowControls = PhotoFrame.Class.extend({
		
		/**
		 * Is the window visible by default?
		 */	
		 
		visible: false,
		
		/**
		 * Get the window visibility
		 *
		 * @return  bool
		 */		
		 
		getVisibility: function() {
			var data = PhotoFrame.Model.WindowLocations.get({title: this.title});
			
			return data.length > 0 && data[0].visible ? data[0].visible : false;
		},
		
		/**
		 * Set the window visibility
		 *
		 * @return  void
		 */		
		 
		setVisibility: function(visible) {
			visible = visible ? true : false;
			
			PhotoFrame.Model.WindowLocations.update({title: this.title}, {
				visible: visible
			});	
			
			this.visible = visible;
		},
		
		/**
		 * Save the window position
		 *
		 * @return  void
		 */		
		 
		savePosition: function() {
			PhotoFrame.Model.WindowLocations.insertOrUpdate({title: this.title}, {
				visible: this.getVisibility(),
				title: this.title,
				y: this.ui.window.css('top'),
				x: this.ui.window.css('left')
			});	
		},
		
		/**
		 * Bring window to the front
		 *
		 * @return  void
		 */		
		 
		bringToFront: function() {
			this.factory.zIndexCount++;
			this.ui.window.css('z-index', this.factory.zIndexCount);
		},
		
		/**
		 * Does the window have a position?
		 *
		 * @return  bool
		 */		
		 
		hasPosition: function() {
			return this.getPosition() ? true : false;	
		},
		
		/**
		 * Get the window position
		 *
		 * @return  object
		 */		
		 
		getPosition: function() {
			var pos = PhotoFrame.Model.WindowLocations.get({title: this.title});
			
			if(pos.length == 0) {
				return false;
			}
			
			return pos[0];
		},
		
		/**
		 * Restore the window position
		 *
		 * @return  void
		 */		
		 
		restorePosition: function() {
			var position = this.getPosition();
			
			this.setPosition(position.x, position.y);
		},
		
		/**
		 * Set the window position
		 *
		 * @return  void
		 */		
		 
		setPosition: function(x, y) {
			this.ui.window.css('left', x).css('top', y);
		}
		
	});

	PhotoFrame.Window.implement(PhotoFrame.WindowControls);
	PhotoFrame.ButtonBar.implement(PhotoFrame.WindowControls);
		
}(jQuery));

/**
 * Get the current jQuery version and test is similar to version_compare();
 *
 * @param	string 	First version to compare
 * @param	string 	Comparison operator
 * @param	string 	Second version to compare (optional)
 *
 * @return	mixed;
 */

jQuery.isVersion = function(left, oper, right) {
    if (left) {
        var pre = /pre/i,
            replace = /[^\d]+/g,
            oper = oper || "==",
            right = right || jQuery.fn.jquery,
            l = left.replace(replace, ''),
            r = right.replace(replace, ''),
            l_len = l.length, r_len = r.length,
            l_pre = pre.test(left), r_pre = pre.test(right);

        l = (r_len > l_len ? parseInt(l) * ((r_len - l_len) * 10) : parseInt(l));
        r = (l_len > r_len ? parseInt(r) * ((l_len - r_len) * 10) : parseInt(r));

        switch(oper) {
            case "==": {
                return (true === (l == r && (l_pre == r_pre)));
            }
            case ">=": {
                return (true === (l >= r && (!l_pre || l_pre == r_pre)));
            }
            case "<=": {
                return (true === (l <= r && (!r_pre || r_pre == l_pre)));
            }
            case ">": {
                return (true === (l > r || (l == r && r_pre)));
            }
            case "<": {
                return (true === (l < r || (l == r && l_pre)));
            }
        }
    }

    return false;
}

/**
 * Center a specific element on the screen. Works with various versions of jQuery
 *
 * @return object;
 */

jQuery.fn.center = function () {
    var w = $(window);
    this.css("position","fixed");
    
    if($.isVersion('1.7.0', '<=') && w.outerHeight() != null && w.outerWidth() != null && 
       !isNaN(w.outerHeight()) && !isNaN(w.outerWidth())) {
	    var outerHeight = w.outerHeight();
	    var outerWidth  = w.outerWidth();
    } else {
    	var outerHeight = w.height();
	    var outerWidth  = w.width();
    }
    
    this.css("top",outerHeight/2-this.height()/2 + "px");
    this.css("left",outerWidth/2-this.width()/2  + "px");
    
    return this;
}

/**
 * Capitalize the first letter in a string
 *
 * @return string
 */
 
String.prototype.ucfirst = function() {
	return this.substr(0, 1).toUpperCase() + this.substr(1);
};;// Spectrum Colorpicker v1.1.1
// https://github.com/bgrins/spectrum
// Author: Brian Grinstead
// License: MIT

(function (window, $, undefined) {
    var defaultOpts = {

        // Callbacks
        beforeShow: noop,
        move: noop,
        change: noop,
        show: noop,
        hide: noop,

        // Options
        color: false,
        flat: false,
        showInput: false,
        showButtons: true,
        clickoutFiresChange: false,
        showInitial: false,
        showPalette: false,
        showPaletteOnly: false,
        showSelectionPalette: true,
        localStorageKey: false,
        appendTo: "body",
        maxSelectionSize: 7,
        cancelText: "cancel",
        chooseText: "choose",
        preferredFormat: false,
        className: "",
        showAlpha: false,
        theme: "sp-light",
        palette: ['fff', '000'],
        selectionPalette: [],
        disabled: false
    },
    spectrums = [],
    IE = !!/msie/i.exec( window.navigator.userAgent ),
    rgbaSupport = (function() {
        function contains( str, substr ) {
            return !!~('' + str).indexOf(substr);
        }

        var elem = document.createElement('div');
        var style = elem.style;
        style.cssText = 'background-color:rgba(0,0,0,.5)';
        return contains(style.backgroundColor, 'rgba') || contains(style.backgroundColor, 'hsla');
    })(),
    replaceInput = [
        "<div class='sp-replacer'>",
            "<div class='sp-preview'><div class='sp-preview-inner'></div></div>",
            "<div class='sp-dd'>&#9660;</div>",
        "</div>"
    ].join(''),
    markup = (function () {

        // IE does not support gradients with multiple stops, so we need to simulate
        //  that for the rainbow slider with 8 divs that each have a single gradient
        var gradientFix = "";
        if (IE) {
            for (var i = 1; i <= 6; i++) {
                gradientFix += "<div class='sp-" + i + "'></div>";
            }
        }

        return [
            "<div class='sp-container sp-hidden'>",
                "<div class='sp-palette-container'>",
                    "<div class='sp-palette sp-thumb sp-cf'></div>",
                "</div>",
                "<div class='sp-picker-container'>",
                    "<div class='sp-top sp-cf'>",
                        "<div class='sp-fill'></div>",
                        "<div class='sp-top-inner'>",
                            "<div class='sp-color'>",
                                "<div class='sp-sat'>",
                                    "<div class='sp-val'>",
                                        "<div class='sp-dragger'></div>",
                                    "</div>",
                                "</div>",
                            "</div>",
                            "<div class='sp-hue'>",
                                "<div class='sp-slider'></div>",
                                gradientFix,
                            "</div>",
                        "</div>",
                        "<div class='sp-alpha'><div class='sp-alpha-inner'><div class='sp-alpha-handle'></div></div></div>",
                    "</div>",
                    "<div class='sp-input-container sp-cf'>",
                        "<input class='sp-input' type='text' spellcheck='false'  />",
                    "</div>",
                    "<div class='sp-initial sp-thumb sp-cf'></div>",
                    "<div class='sp-button-container sp-cf'>",
                        "<a class='sp-cancel' href='#'></a>",
                        "<button class='sp-choose'></button>",
                    "</div>",
                "</div>",
            "</div>"
        ].join("");
    })();

    function paletteTemplate (p, color, className) {
        var html = [];
        for (var i = 0; i < p.length; i++) {
            var tiny = tinycolor(p[i]);
            var c = tiny.toHsl().l < 0.5 ? "sp-thumb-el sp-thumb-dark" : "sp-thumb-el sp-thumb-light";
            c += (tinycolor.equals(color, p[i])) ? " sp-thumb-active" : "";

            var swatchStyle = rgbaSupport ? ("background-color:" + tiny.toRgbString()) : "filter:" + tiny.toFilter();
            html.push('<span title="' + tiny.toRgbString() + '" data-color="' + tiny.toRgbString() + '" class="' + c + '"><span class="sp-thumb-inner" style="' + swatchStyle + ';" /></span>');
        }
        return "<div class='sp-cf " + className + "'>" + html.join('') + "</div>";
    }

    function hideAll() {
        for (var i = 0; i < spectrums.length; i++) {
            if (spectrums[i]) {
                spectrums[i].hide();
            }
        }
    }

    function instanceOptions(o, callbackContext) {
        var opts = $.extend({}, defaultOpts, o);
        opts.callbacks = {
            'move': bind(opts.move, callbackContext),
            'change': bind(opts.change, callbackContext),
            'show': bind(opts.show, callbackContext),
            'hide': bind(opts.hide, callbackContext),
            'beforeShow': bind(opts.beforeShow, callbackContext)
        };

        return opts;
    }

    function spectrum(element, o) {

        var opts = instanceOptions(o, element),
            flat = opts.flat,
            showSelectionPalette = opts.showSelectionPalette,
            localStorageKey = opts.localStorageKey,
            theme = opts.theme,
            callbacks = opts.callbacks,
            resize = throttle(reflow, 10),
            visible = false,
            dragWidth = 0,
            dragHeight = 0,
            dragHelperHeight = 0,
            slideHeight = 0,
            slideWidth = 0,
            alphaWidth = 0,
            alphaSlideHelperWidth = 0,
            slideHelperHeight = 0,
            currentHue = 0,
            currentSaturation = 0,
            currentValue = 0,
            currentAlpha = 1,
            palette = opts.palette.slice(0),
            paletteArray = $.isArray(palette[0]) ? palette : [palette],
            selectionPalette = opts.selectionPalette.slice(0),
            maxSelectionSize = opts.maxSelectionSize,
            draggingClass = "sp-dragging",
            shiftMovementDirection = null;

        var doc = element.ownerDocument,
            body = doc.body,
            boundElement = $(element),
            disabled = false,
            container = $(markup, doc).addClass(theme),
            dragger = container.find(".sp-color"),
            dragHelper = container.find(".sp-dragger"),
            slider = container.find(".sp-hue"),
            slideHelper = container.find(".sp-slider"),
            alphaSliderInner = container.find(".sp-alpha-inner"),
            alphaSlider = container.find(".sp-alpha"),
            alphaSlideHelper = container.find(".sp-alpha-handle"),
            textInput = container.find(".sp-input"),
            paletteContainer = container.find(".sp-palette"),
            initialColorContainer = container.find(".sp-initial"),
            cancelButton = container.find(".sp-cancel"),
            chooseButton = container.find(".sp-choose"),
            isInput = boundElement.is("input"),
            shouldReplace = isInput && !flat,
            replacer = (shouldReplace) ? $(replaceInput).addClass(theme).addClass(opts.className) : $([]),
            offsetElement = (shouldReplace) ? replacer : boundElement,
            previewElement = replacer.find(".sp-preview-inner"),
            initialColor = opts.color || (isInput && boundElement.val()),
            colorOnShow = false,
            preferredFormat = opts.preferredFormat,
            currentPreferredFormat = preferredFormat,
            clickoutFiresChange = !opts.showButtons || opts.clickoutFiresChange;


        function applyOptions() {

            container.toggleClass("sp-flat", flat);
            container.toggleClass("sp-input-disabled", !opts.showInput);
            container.toggleClass("sp-alpha-enabled", opts.showAlpha);
            container.toggleClass("sp-buttons-disabled", !opts.showButtons);
            container.toggleClass("sp-palette-disabled", !opts.showPalette);
            container.toggleClass("sp-palette-only", opts.showPaletteOnly);
            container.toggleClass("sp-initial-disabled", !opts.showInitial);
            container.addClass(opts.className);

            reflow();
        }

        function initialize() {

            if (IE) {
                container.find("*:not(input)").attr("unselectable", "on");
            }

            applyOptions();

            if (shouldReplace) {
                boundElement.after(replacer).hide();
            }

            if (flat) {
                boundElement.after(container).hide();
            }
            else {

                var appendTo = opts.appendTo === "parent" ? boundElement.parent() : $(opts.appendTo);
                if (appendTo.length !== 1) {
                    appendTo = $("body");
                }

                appendTo.append(container);
            }

            if (localStorageKey && window.localStorage) {

                // Migrate old palettes over to new format.  May want to remove this eventually.
                try {
                    var oldPalette = window.localStorage[localStorageKey].split(",#");
                    if (oldPalette.length > 1) {
                        delete window.localStorage[localStorageKey];
                        $.each(oldPalette, function(i, c) {
                             addColorToSelectionPalette(c);
                        });
                    }
                }
                catch(e) { }

                try {
                    selectionPalette = window.localStorage[localStorageKey].split(";");
                }
                catch (e) { }
            }

            offsetElement.bind("click.spectrum touchstart.spectrum", function (e) {
                if (!disabled) {
                    toggle();
                }

                e.stopPropagation();

                if (!$(e.target).is("input")) {
                    e.preventDefault();
                }
            });

            if(boundElement.is(":disabled") || (opts.disabled === true)) {
                disable();
            }

            // Prevent clicks from bubbling up to document.  This would cause it to be hidden.
            container.click(stopPropagation);

            // Handle user typed input
            textInput.change(setFromTextInput);
            textInput.bind("paste", function () {
                setTimeout(setFromTextInput, 1);
            });
            textInput.keydown(function (e) { if (e.keyCode == 13) { setFromTextInput(); } });

            cancelButton.text(opts.cancelText);
            cancelButton.bind("click.spectrum", function (e) {
                e.stopPropagation();
                e.preventDefault();
                hide("cancel");
            });

            chooseButton.text(opts.chooseText);
            chooseButton.bind("click.spectrum", function (e) {
                e.stopPropagation();
                e.preventDefault();

                if (isValid()) {
                    updateOriginalInput(true);
                    hide();
                }
            });

            draggable(alphaSlider, function (dragX, dragY, e) {
                currentAlpha = (dragX / alphaWidth);
                if (e.shiftKey) {
                    currentAlpha = Math.round(currentAlpha * 10) / 10;
                }

                move();
            });

            draggable(slider, function (dragX, dragY) {
                currentHue = parseFloat(dragY / slideHeight);
                move();
            }, dragStart, dragStop);

            draggable(dragger, function (dragX, dragY, e) {

                // shift+drag should snap the movement to either the x or y axis.
                if (!e.shiftKey) {
                    shiftMovementDirection = null;
                }
                else if (!shiftMovementDirection) {
                    var oldDragX = currentSaturation * dragWidth;
                    var oldDragY = dragHeight - (currentValue * dragHeight);
                    var furtherFromX = Math.abs(dragX - oldDragX) > Math.abs(dragY - oldDragY);

                    shiftMovementDirection = furtherFromX ? "x" : "y";
                }

                var setSaturation = !shiftMovementDirection || shiftMovementDirection === "x";
                var setValue = !shiftMovementDirection || shiftMovementDirection === "y";

                if (setSaturation) {
                    currentSaturation = parseFloat(dragX / dragWidth);
                }
                if (setValue) {
                    currentValue = parseFloat((dragHeight - dragY) / dragHeight);
                }

                move();

            }, dragStart, dragStop);

            if (!!initialColor) {
                set(initialColor);

                // In case color was black - update the preview UI and set the format
                // since the set function will not run (default color is black).
                updateUI();
                currentPreferredFormat = preferredFormat || tinycolor(initialColor).format;

                addColorToSelectionPalette(initialColor);
            }
            else {
                updateUI();
            }

            if (flat) {
                show();
            }

            function palletElementClick(e) {
                if (e.data && e.data.ignore) {
                    set($(this).data("color"));
                    move();
                }
                else {
                    set($(this).data("color"));
                    updateOriginalInput(true);
                    move();
                    hide();
                }

                return false;
            }

            var paletteEvent = IE ? "mousedown.spectrum" : "click.spectrum touchstart.spectrum";
            paletteContainer.delegate(".sp-thumb-el", paletteEvent, palletElementClick);
            initialColorContainer.delegate(".sp-thumb-el:nth-child(1)", paletteEvent, { ignore: true }, palletElementClick);
        }

        function addColorToSelectionPalette(color) {
            if (showSelectionPalette) {
                var colorRgb = tinycolor(color).toRgbString();
                if ($.inArray(colorRgb, selectionPalette) === -1) {
                    selectionPalette.push(colorRgb);
                    while(selectionPalette.length > maxSelectionSize) {
                        selectionPalette.shift();
                    }
                }

                if (localStorageKey && window.localStorage) {
                    try {
                        window.localStorage[localStorageKey] = selectionPalette.join(";");
                    }
                    catch(e) { }
                }
            }
        }

        function getUniqueSelectionPalette() {
            var unique = [];
            var p = selectionPalette;
            var paletteLookup = {};
            var rgb;

            if (opts.showPalette) {

                for (var i = 0; i < paletteArray.length; i++) {
                    for (var j = 0; j < paletteArray[i].length; j++) {
                        rgb = tinycolor(paletteArray[i][j]).toRgbString();
                        paletteLookup[rgb] = true;
                    }
                }

                for (i = 0; i < p.length; i++) {
                    rgb = tinycolor(p[i]).toRgbString();

                    if (!paletteLookup.hasOwnProperty(rgb)) {
                        unique.push(p[i]);
                        paletteLookup[rgb] = true;
                    }
                }
            }

            return unique.reverse().slice(0, opts.maxSelectionSize);
        }

        function drawPalette() {

            var currentColor = get();

            var html = $.map(paletteArray, function (palette, i) {
                return paletteTemplate(palette, currentColor, "sp-palette-row sp-palette-row-" + i);
            });

            if (selectionPalette) {
                html.push(paletteTemplate(getUniqueSelectionPalette(), currentColor, "sp-palette-row sp-palette-row-selection"));
            }

            paletteContainer.html(html.join(""));
        }

        function drawInitial() {
            if (opts.showInitial) {
                var initial = colorOnShow;
                var current = get();
                initialColorContainer.html(paletteTemplate([initial, current], current, "sp-palette-row-initial"));
            }
        }

        function dragStart() {
            if (dragHeight <= 0 || dragWidth <= 0 || slideHeight <= 0) {
                reflow();
            }
            container.addClass(draggingClass);
            shiftMovementDirection = null;
        }

        function dragStop() {
            container.removeClass(draggingClass);
        }

        function setFromTextInput() {
            var tiny = tinycolor(textInput.val());
            if (tiny.ok) {
                set(tiny);
            }
            else {
                textInput.addClass("sp-validation-error");
            }
        }

        function toggle() {
            if (visible) {
                hide();
            }
            else {
                show();
            }
        }

        function show() {
            var event = $.Event('beforeShow.spectrum');

            if (visible) {
                reflow();
                return;
            }

            boundElement.trigger(event, [ get() ]);

            if (callbacks.beforeShow(get()) === false || event.isDefaultPrevented()) {
                return;
            }

            hideAll();
            visible = true;

            $(doc).bind("click.spectrum", hide);
            $(window).bind("resize.spectrum", resize);
            replacer.addClass("sp-active");
            container.removeClass("sp-hidden");

            if (opts.showPalette) {
                drawPalette();
            }
            reflow();
            updateUI();

            colorOnShow = get();

            drawInitial();
            callbacks.show(colorOnShow);
            boundElement.trigger('show.spectrum', [ colorOnShow ]);
        }

        function hide(e) {

            // Return on right click
            if (e && e.type == "click" && e.button == 2) { return; }

            // Return if hiding is unnecessary
            if (!visible || flat) { return; }
            visible = false;

            $(doc).unbind("click.spectrum", hide);
            $(window).unbind("resize.spectrum", resize);

            replacer.removeClass("sp-active");
            container.addClass("sp-hidden");

            var colorHasChanged = !tinycolor.equals(get(), colorOnShow);

            if (colorHasChanged) {
                if (clickoutFiresChange && e !== "cancel") {
                    updateOriginalInput(true);
                }
                else {
                    revert();
                }
            }

            callbacks.hide(get());
            boundElement.trigger('hide.spectrum', [ get() ]);
        }

        function revert() {
            set(colorOnShow, true);
        }

        function set(color, ignoreFormatChange) {
            if (tinycolor.equals(color, get())) {
                return;
            }

            var newColor = tinycolor(color);
            var newHsv = newColor.toHsv();

            currentHue = (newHsv.h % 360) / 360;
            currentSaturation = newHsv.s;
            currentValue = newHsv.v;
            currentAlpha = newHsv.a;

            updateUI();

            if (newColor.ok && !ignoreFormatChange) {
                currentPreferredFormat = preferredFormat || newColor.format;
            }
        }

        function get(opts) {
            opts = opts || { };
            return tinycolor.fromRatio({
                h: currentHue,
                s: currentSaturation,
                v: currentValue,
                a: Math.round(currentAlpha * 100) / 100
            }, { format: opts.format || currentPreferredFormat });
        }

        function isValid() {
            return !textInput.hasClass("sp-validation-error");
        }

        function move() {
            updateUI();

            callbacks.move(get());
            boundElement.trigger('move.spectrum', [ get() ]);
        }

        function updateUI() {

            textInput.removeClass("sp-validation-error");

            updateHelperLocations();

            // Update dragger background color (gradients take care of saturation and value).
            var flatColor = tinycolor.fromRatio({ h: currentHue, s: 1, v: 1 });
            dragger.css("background-color", flatColor.toHexString());

            // Get a format that alpha will be included in (hex and names ignore alpha)
            var format = currentPreferredFormat;
            if (currentAlpha < 1) {
                if (format === "hex" || format === "hex3" || format === "hex6" || format === "name") {
                    format = "rgb";
                }
            }

            var realColor = get({ format: format }),
                realHex = realColor.toHexString(),
                realRgb = realColor.toRgbString();

            // Update the replaced elements background color (with actual selected color)
            if (rgbaSupport || realColor.alpha === 1) {
                previewElement.css("background-color", realRgb);
            }
            else {
                previewElement.css("background-color", "transparent");
                previewElement.css("filter", realColor.toFilter());
            }

            if (opts.showAlpha) {
                var rgb = realColor.toRgb();
                rgb.a = 0;
                var realAlpha = tinycolor(rgb).toRgbString();
                var gradient = "linear-gradient(left, " + realAlpha + ", " + realHex + ")";

                if (IE) {
                    alphaSliderInner.css("filter", tinycolor(realAlpha).toFilter({ gradientType: 1 }, realHex));
                }
                else {
                    alphaSliderInner.css("background", "-webkit-" + gradient);
                    alphaSliderInner.css("background", "-moz-" + gradient);
                    alphaSliderInner.css("background", "-ms-" + gradient);
                    alphaSliderInner.css("background", gradient);
                }
            }


            // Update the text entry input as it changes happen
            if (opts.showInput) {
                textInput.val(realColor.toString(format));
            }

            if (opts.showPalette) {
                drawPalette();
            }

            drawInitial();
        }

        function updateHelperLocations() {
            var s = currentSaturation;
            var v = currentValue;

            // Where to show the little circle in that displays your current selected color
            var dragX = s * dragWidth;
            var dragY = dragHeight - (v * dragHeight);
            dragX = Math.max(
                -dragHelperHeight,
                Math.min(dragWidth - dragHelperHeight, dragX - dragHelperHeight)
            );
            dragY = Math.max(
                -dragHelperHeight,
                Math.min(dragHeight - dragHelperHeight, dragY - dragHelperHeight)
            );
            dragHelper.css({
                "top": dragY,
                "left": dragX
            });

            var alphaX = currentAlpha * alphaWidth;
            alphaSlideHelper.css({
                "left": alphaX - (alphaSlideHelperWidth / 2)
            });

            // Where to show the bar that displays your current selected hue
            var slideY = (currentHue) * slideHeight;
            slideHelper.css({
                "top": slideY - slideHelperHeight
            });
        }

        function updateOriginalInput(fireCallback) {
            var color = get();

            if (isInput) {
                boundElement.val(color.toString(currentPreferredFormat)).change();
            }

            var hasChanged = !tinycolor.equals(color, colorOnShow);
            colorOnShow = color;

            // Update the selection palette with the current color
            addColorToSelectionPalette(color);
            if (fireCallback && hasChanged) {
                callbacks.change(color);
                boundElement.trigger('change.spectrum', [ color ]);
            }
        }

        function reflow() {
            dragWidth = dragger.width();
            dragHeight = dragger.height();
            dragHelperHeight = dragHelper.height();
            slideWidth = slider.width();
            slideHeight = slider.height();
            slideHelperHeight = slideHelper.height();
            alphaWidth = alphaSlider.width();
            alphaSlideHelperWidth = alphaSlideHelper.width();

            if (!flat) {
                container.css("position", "absolute");
                container.offset(getOffset(container, offsetElement));
            }

            updateHelperLocations();
        }

        function destroy() {
            boundElement.show();
            offsetElement.unbind("click.spectrum touchstart.spectrum");
            container.remove();
            replacer.remove();
            spectrums[spect.id] = null;
        }

        function option(optionName, optionValue) {
            if (optionName === undefined) {
                return $.extend({}, opts);
            }
            if (optionValue === undefined) {
                return opts[optionName];
            }

            opts[optionName] = optionValue;
            applyOptions();
        }

        function enable() {
            disabled = false;
            boundElement.attr("disabled", false);
            offsetElement.removeClass("sp-disabled");
        }

        function disable() {
            hide();
            disabled = true;
            boundElement.attr("disabled", true);
            offsetElement.addClass("sp-disabled");
        }

        initialize();

        var spect = {
            show: show,
            hide: hide,
            toggle: toggle,
            reflow: reflow,
            option: option,
            enable: enable,
            disable: disable,
            set: function (c) {
                set(c);
                updateOriginalInput();
            },
            get: get,
            destroy: destroy,
            container: container
        };

        spect.id = spectrums.push(spect) - 1;

        return spect;
    }

    /**
    * checkOffset - get the offset below/above and left/right element depending on screen position
    * Thanks https://github.com/jquery/jquery-ui/blob/master/ui/jquery.ui.datepicker.js
    */
    function getOffset(picker, input) {
        var extraY = 0;
        var dpWidth = picker.outerWidth();
        var dpHeight = picker.outerHeight();
        var inputHeight = input.outerHeight();
        var doc = picker[0].ownerDocument;
        var docElem = doc.documentElement;
        var viewWidth = docElem.clientWidth + $(doc).scrollLeft();
        var viewHeight = docElem.clientHeight + $(doc).scrollTop();
        var offset = input.offset();
        offset.top += inputHeight;

        offset.left -=
            Math.min(offset.left, (offset.left + dpWidth > viewWidth && viewWidth > dpWidth) ?
            Math.abs(offset.left + dpWidth - viewWidth) : 0);

        offset.top -=
            Math.min(offset.top, ((offset.top + dpHeight > viewHeight && viewHeight > dpHeight) ?
            Math.abs(dpHeight + inputHeight - extraY) : extraY));

        return offset;
    }

    /**
    * noop - do nothing
    */
    function noop() {

    }

    /**
    * stopPropagation - makes the code only doing this a little easier to read in line
    */
    function stopPropagation(e) {
        e.stopPropagation();
    }

    /**
    * Create a function bound to a given object
    * Thanks to underscore.js
    */
    function bind(func, obj) {
        var slice = Array.prototype.slice;
        var args = slice.call(arguments, 2);
        return function () {
            return func.apply(obj, args.concat(slice.call(arguments)));
        };
    }

    /**
    * Lightweight drag helper.  Handles containment within the element, so that
    * when dragging, the x is within [0,element.width] and y is within [0,element.height]
    */
    function draggable(element, onmove, onstart, onstop) {
        onmove = onmove || function () { };
        onstart = onstart || function () { };
        onstop = onstop || function () { };
        var doc = element.ownerDocument || document;
        var dragging = false;
        var offset = {};
        var maxHeight = 0;
        var maxWidth = 0;
        var hasTouch = ('ontouchstart' in window);

        var duringDragEvents = {};
        duringDragEvents["selectstart"] = prevent;
        duringDragEvents["dragstart"] = prevent;
        duringDragEvents["touchmove mousemove"] = move;
        duringDragEvents["touchend mouseup"] = stop;

        function prevent(e) {
            if (e.stopPropagation) {
                e.stopPropagation();
            }
            if (e.preventDefault) {
                e.preventDefault();
            }
            e.returnValue = false;
        }

        function move(e) {
            if (dragging) {
                // Mouseup happened outside of window
                if (IE && document.documentMode < 9 && !e.button) {
                    return stop();
                }

                var touches = e.originalEvent.touches;
                var pageX = touches ? touches[0].pageX : e.pageX;
                var pageY = touches ? touches[0].pageY : e.pageY;

                var dragX = Math.max(0, Math.min(pageX - offset.left, maxWidth));
                var dragY = Math.max(0, Math.min(pageY - offset.top, maxHeight));

                if (hasTouch) {
                    // Stop scrolling in iOS
                    prevent(e);
                }

                onmove.apply(element, [dragX, dragY, e]);
            }
        }
        function start(e) {
            var rightclick = (e.which) ? (e.which == 3) : (e.button == 2);
            var touches = e.originalEvent.touches;

            if (!rightclick && !dragging) {
                if (onstart.apply(element, arguments) !== false) {
                    dragging = true;
                    maxHeight = $(element).height();
                    maxWidth = $(element).width();
                    offset = $(element).offset();

                    $(doc).bind(duringDragEvents);
                    $(doc.body).addClass("sp-dragging");

                    if (!hasTouch) {
                        move(e);
                    }

                    prevent(e);
                }
            }
        }
        function stop() {
            if (dragging) {
                $(doc).unbind(duringDragEvents);
                $(doc.body).removeClass("sp-dragging");
                onstop.apply(element, arguments);
            }
            dragging = false;
        }

        $(element).bind("touchstart mousedown", start);
    }

    function throttle(func, wait, debounce) {
        var timeout;
        return function () {
            var context = this, args = arguments;
            var throttler = function () {
                timeout = null;
                func.apply(context, args);
            };
            if (debounce) clearTimeout(timeout);
            if (debounce || !timeout) timeout = setTimeout(throttler, wait);
        };
    }


    function log(){/* jshint -W021 */if(window.console){if(Function.prototype.bind)log=Function.prototype.bind.call(console.log,console);else log=function(){Function.prototype.apply.call(console.log,console,arguments);};log.apply(this,arguments);}}

    /**
    * Define a jQuery plugin
    */
    var dataID = "spectrum.id";
    $.fn.spectrum = function (opts, extra) {

        if (typeof opts == "string") {

            var returnValue = this;
            var args = Array.prototype.slice.call( arguments, 1 );

            this.each(function () {
                var spect = spectrums[$(this).data(dataID)];
                if (spect) {

                    var method = spect[opts];
                    if (!method) {
                        throw new Error( "Spectrum: no such method: '" + opts + "'" );
                    }

                    if (opts == "get") {
                        returnValue = spect.get();
                    }
                    else if (opts == "container") {
                        returnValue = spect.container;
                    }
                    else if (opts == "option") {
                        returnValue = spect.option.apply(spect, args);
                    }
                    else if (opts == "destroy") {
                        spect.destroy();
                        $(this).removeData(dataID);
                    }
                    else {
                        method.apply(spect, args);
                    }
                }
            });

            return returnValue;
        }

        // Initializing a new instance of spectrum
        return this.spectrum("destroy").each(function () {
            var spect = spectrum(this, opts);
            $(this).data(dataID, spect.id);
        });
    };

    $.fn.spectrum.load = true;
    $.fn.spectrum.loadOpts = {};
    $.fn.spectrum.draggable = draggable;
    $.fn.spectrum.defaults = defaultOpts;

    $.spectrum = { };
    $.spectrum.localization = { };
    $.spectrum.palettes = { };

    $.fn.spectrum.processNativeColorInputs = function () {
        var colorInput = $("<input type='color' value='!' />")[0];
        var supportsColor = colorInput.type === "color" && colorInput.value != "!";

        if (!supportsColor) {
            $("input[type=color]").spectrum({
                preferredFormat: "hex6"
            });
        }
    };
    // TinyColor v0.9.14
    // https://github.com/bgrins/TinyColor
    // 2013-02-24, Brian Grinstead, MIT License

    (function(root) {

        var trimLeft = /^[\s,#]+/,
            trimRight = /\s+$/,
            tinyCounter = 0,
            math = Math,
            mathRound = math.round,
            mathMin = math.min,
            mathMax = math.max,
            mathRandom = math.random;

        function tinycolor (color, opts) {

            color = (color) ? color : '';
            opts = opts || { };

            // If input is already a tinycolor, return itself
            if (typeof color == "object" && color.hasOwnProperty("_tc_id")) {
               return color;
            }
            var rgb = inputToRGB(color);
            var r = rgb.r,
                g = rgb.g,
                b = rgb.b,
                a = rgb.a,
                roundA = mathRound(100*a) / 100,
                format = opts.format || rgb.format;

            // Don't let the range of [0,255] come back in [0,1].
            // Potentially lose a little bit of precision here, but will fix issues where
            // .5 gets interpreted as half of the total, instead of half of 1
            // If it was supposed to be 128, this was already taken care of by `inputToRgb`
            if (r < 1) { r = mathRound(r); }
            if (g < 1) { g = mathRound(g); }
            if (b < 1) { b = mathRound(b); }

            return {
                ok: rgb.ok,
                format: format,
                _tc_id: tinyCounter++,
                alpha: a,
                toHsv: function() {
                    var hsv = rgbToHsv(r, g, b);
                    return { h: hsv.h * 360, s: hsv.s, v: hsv.v, a: a };
                },
                toHsvString: function() {
                    var hsv = rgbToHsv(r, g, b);
                    var h = mathRound(hsv.h * 360), s = mathRound(hsv.s * 100), v = mathRound(hsv.v * 100);
                    return (a == 1) ?
                      "hsv("  + h + ", " + s + "%, " + v + "%)" :
                      "hsva(" + h + ", " + s + "%, " + v + "%, "+ roundA + ")";
                },
                toHsl: function() {
                    var hsl = rgbToHsl(r, g, b);
                    return { h: hsl.h * 360, s: hsl.s, l: hsl.l, a: a };
                },
                toHslString: function() {
                    var hsl = rgbToHsl(r, g, b);
                    var h = mathRound(hsl.h * 360), s = mathRound(hsl.s * 100), l = mathRound(hsl.l * 100);
                    return (a == 1) ?
                      "hsl("  + h + ", " + s + "%, " + l + "%)" :
                      "hsla(" + h + ", " + s + "%, " + l + "%, "+ roundA + ")";
                },
                toHex: function(allow3Char) {
                    return rgbToHex(r, g, b, allow3Char);
                },
                toHexString: function(allow3Char) {
                    return '#' + rgbToHex(r, g, b, allow3Char);
                },
                toRgb: function() {
                    return { r: mathRound(r), g: mathRound(g), b: mathRound(b), a: a };
                },
                toRgbString: function() {
                    return (a == 1) ?
                      "rgb("  + mathRound(r) + ", " + mathRound(g) + ", " + mathRound(b) + ")" :
                      "rgba(" + mathRound(r) + ", " + mathRound(g) + ", " + mathRound(b) + ", " + roundA + ")";
                },
                toPercentageRgb: function() {
                    return { r: mathRound(bound01(r, 255) * 100) + "%", g: mathRound(bound01(g, 255) * 100) + "%", b: mathRound(bound01(b, 255) * 100) + "%", a: a };
                },
                toPercentageRgbString: function() {
                    return (a == 1) ?
                      "rgb("  + mathRound(bound01(r, 255) * 100) + "%, " + mathRound(bound01(g, 255) * 100) + "%, " + mathRound(bound01(b, 255) * 100) + "%)" :
                      "rgba(" + mathRound(bound01(r, 255) * 100) + "%, " + mathRound(bound01(g, 255) * 100) + "%, " + mathRound(bound01(b, 255) * 100) + "%, " + roundA + ")";
                },
                toName: function() {
                    return hexNames[rgbToHex(r, g, b, true)] || false;
                },
                toFilter: function(secondColor) {
                    var hex = rgbToHex(r, g, b);
                    var secondHex = hex;
                    var alphaHex = Math.round(parseFloat(a) * 255).toString(16);
                    var secondAlphaHex = alphaHex;
                    var gradientType = opts && opts.gradientType ? "GradientType = 1, " : "";

                    if (secondColor) {
                        var s = tinycolor(secondColor);
                        secondHex = s.toHex();
                        secondAlphaHex = Math.round(parseFloat(s.alpha) * 255).toString(16);
                    }

                    return "progid:DXImageTransform.Microsoft.gradient("+gradientType+"startColorstr=#" + pad2(alphaHex) + hex + ",endColorstr=#" + pad2(secondAlphaHex) + secondHex + ")";
                },
                toString: function(format) {
                    format = format || this.format;
                    var formattedString = false;
                    if (format === "rgb") {
                        formattedString = this.toRgbString();
                    }
                    if (format === "prgb") {
                        formattedString = this.toPercentageRgbString();
                    }
                    if (format === "hex" || format === "hex6") {
                        formattedString = this.toHexString();
                    }
                    if (format === "hex3") {
                        formattedString = this.toHexString(true);
                    }
                    if (format === "name") {
                        formattedString = this.toName();
                    }
                    if (format === "hsl") {
                        formattedString = this.toHslString();
                    }
                    if (format === "hsv") {
                        formattedString = this.toHsvString();
                    }

                    return formattedString || this.toHexString();
                }
            };
        }

        // If input is an object, force 1 into "1.0" to handle ratios properly
        // String input requires "1.0" as input, so 1 will be treated as 1
        tinycolor.fromRatio = function(color, opts) {
            if (typeof color == "object") {
                var newColor = {};
                for (var i in color) {
                    if (color.hasOwnProperty(i)) {
                        if (i === "a") {
                            newColor[i] = color[i];
                        }
                        else {
                            newColor[i] = convertToPercentage(color[i]);
                        }
                    }
                }
                color = newColor;
            }

            return tinycolor(color, opts);
        };

        // Given a string or object, convert that input to RGB
        // Possible string inputs:
        //
        //     "red"
        //     "#f00" or "f00"
        //     "#ff0000" or "ff0000"
        //     "rgb 255 0 0" or "rgb (255, 0, 0)"
        //     "rgb 1.0 0 0" or "rgb (1, 0, 0)"
        //     "rgba (255, 0, 0, 1)" or "rgba 255, 0, 0, 1"
        //     "rgba (1.0, 0, 0, 1)" or "rgba 1.0, 0, 0, 1"
        //     "hsl(0, 100%, 50%)" or "hsl 0 100% 50%"
        //     "hsla(0, 100%, 50%, 1)" or "hsla 0 100% 50%, 1"
        //     "hsv(0, 100%, 100%)" or "hsv 0 100% 100%"
        //
        function inputToRGB(color) {

            var rgb = { r: 0, g: 0, b: 0 };
            var a = 1;
            var ok = false;
            var format = false;

            if (typeof color == "string") {
                color = stringInputToObject(color);
            }

            if (typeof color == "object") {
                if (color.hasOwnProperty("r") && color.hasOwnProperty("g") && color.hasOwnProperty("b")) {
                    rgb = rgbToRgb(color.r, color.g, color.b);
                    ok = true;
                    format = String(color.r).substr(-1) === "%" ? "prgb" : "rgb";
                }
                else if (color.hasOwnProperty("h") && color.hasOwnProperty("s") && color.hasOwnProperty("v")) {
                    color.s = convertToPercentage(color.s);
                    color.v = convertToPercentage(color.v);
                    rgb = hsvToRgb(color.h, color.s, color.v);
                    ok = true;
                    format = "hsv";
                }
                else if (color.hasOwnProperty("h") && color.hasOwnProperty("s") && color.hasOwnProperty("l")) {
                    color.s = convertToPercentage(color.s);
                    color.l = convertToPercentage(color.l);
                    rgb = hslToRgb(color.h, color.s, color.l);
                    ok = true;
                    format = "hsl";
                }

                if (color.hasOwnProperty("a")) {
                    a = color.a;
                }
            }

            a = parseFloat(a);

            // Handle invalid alpha characters by setting to 1
            if (isNaN(a) || a < 0 || a > 1) {
                a = 1;
            }

            return {
                ok: ok,
                format: color.format || format,
                r: mathMin(255, mathMax(rgb.r, 0)),
                g: mathMin(255, mathMax(rgb.g, 0)),
                b: mathMin(255, mathMax(rgb.b, 0)),
                a: a
            };
        }



        // Conversion Functions
        // --------------------

        // `rgbToHsl`, `rgbToHsv`, `hslToRgb`, `hsvToRgb` modified from:
        // <http://mjijackson.com/2008/02/rgb-to-hsl-and-rgb-to-hsv-color-model-conversion-algorithms-in-javascript>

        // `rgbToRgb`
        // Handle bounds / percentage checking to conform to CSS color spec
        // <http://www.w3.org/TR/css3-color/>
        // *Assumes:* r, g, b in [0, 255] or [0, 1]
        // *Returns:* { r, g, b } in [0, 255]
        function rgbToRgb(r, g, b){
            return {
                r: bound01(r, 255) * 255,
                g: bound01(g, 255) * 255,
                b: bound01(b, 255) * 255
            };
        }

        // `rgbToHsl`
        // Converts an RGB color value to HSL.
        // *Assumes:* r, g, and b are contained in [0, 255] or [0, 1]
        // *Returns:* { h, s, l } in [0,1]
        function rgbToHsl(r, g, b) {

            r = bound01(r, 255);
            g = bound01(g, 255);
            b = bound01(b, 255);

            var max = mathMax(r, g, b), min = mathMin(r, g, b);
            var h, s, l = (max + min) / 2;

            if(max == min) {
                h = s = 0; // achromatic
            }
            else {
                var d = max - min;
                s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
                switch(max) {
                    case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                    case g: h = (b - r) / d + 2; break;
                    case b: h = (r - g) / d + 4; break;
                }

                h /= 6;
            }

            return { h: h, s: s, l: l };
        }

        // `hslToRgb`
        // Converts an HSL color value to RGB.
        // *Assumes:* h is contained in [0, 1] or [0, 360] and s and l are contained [0, 1] or [0, 100]
        // *Returns:* { r, g, b } in the set [0, 255]
        function hslToRgb(h, s, l) {
            var r, g, b;

            h = bound01(h, 360);
            s = bound01(s, 100);
            l = bound01(l, 100);

            function hue2rgb(p, q, t) {
                if(t < 0) t += 1;
                if(t > 1) t -= 1;
                if(t < 1/6) return p + (q - p) * 6 * t;
                if(t < 1/2) return q;
                if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            }

            if(s === 0) {
                r = g = b = l; // achromatic
            }
            else {
                var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
                var p = 2 * l - q;
                r = hue2rgb(p, q, h + 1/3);
                g = hue2rgb(p, q, h);
                b = hue2rgb(p, q, h - 1/3);
            }

            return { r: r * 255, g: g * 255, b: b * 255 };
        }

        // `rgbToHsv`
        // Converts an RGB color value to HSV
        // *Assumes:* r, g, and b are contained in the set [0, 255] or [0, 1]
        // *Returns:* { h, s, v } in [0,1]
        function rgbToHsv(r, g, b) {

            r = bound01(r, 255);
            g = bound01(g, 255);
            b = bound01(b, 255);

            var max = mathMax(r, g, b), min = mathMin(r, g, b);
            var h, s, v = max;

            var d = max - min;
            s = max === 0 ? 0 : d / max;

            if(max == min) {
                h = 0; // achromatic
            }
            else {
                switch(max) {
                    case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                    case g: h = (b - r) / d + 2; break;
                    case b: h = (r - g) / d + 4; break;
                }
                h /= 6;
            }
            return { h: h, s: s, v: v };
        }

        // `hsvToRgb`
        // Converts an HSV color value to RGB.
        // *Assumes:* h is contained in [0, 1] or [0, 360] and s and v are contained in [0, 1] or [0, 100]
        // *Returns:* { r, g, b } in the set [0, 255]
         function hsvToRgb(h, s, v) {

            h = bound01(h, 360) * 6;
            s = bound01(s, 100);
            v = bound01(v, 100);

            var i = math.floor(h),
                f = h - i,
                p = v * (1 - s),
                q = v * (1 - f * s),
                t = v * (1 - (1 - f) * s),
                mod = i % 6,
                r = [v, q, p, p, t, v][mod],
                g = [t, v, v, q, p, p][mod],
                b = [p, p, t, v, v, q][mod];

            return { r: r * 255, g: g * 255, b: b * 255 };
        }

        // `rgbToHex`
        // Converts an RGB color to hex
        // Assumes r, g, and b are contained in the set [0, 255]
        // Returns a 3 or 6 character hex
        function rgbToHex(r, g, b, allow3Char) {

            var hex = [
                pad2(mathRound(r).toString(16)),
                pad2(mathRound(g).toString(16)),
                pad2(mathRound(b).toString(16))
            ];

            // Return a 3 character hex if possible
            if (allow3Char && hex[0].charAt(0) == hex[0].charAt(1) && hex[1].charAt(0) == hex[1].charAt(1) && hex[2].charAt(0) == hex[2].charAt(1)) {
                return hex[0].charAt(0) + hex[1].charAt(0) + hex[2].charAt(0);
            }

            return hex.join("");
        }

        // `equals`
        // Can be called with any tinycolor input
        tinycolor.equals = function (color1, color2) {
            if (!color1 || !color2) { return false; }
            return tinycolor(color1).toRgbString() == tinycolor(color2).toRgbString();
        };
        tinycolor.random = function() {
            return tinycolor.fromRatio({
                r: mathRandom(),
                g: mathRandom(),
                b: mathRandom()
            });
        };


        // Modification Functions
        // ----------------------
        // Thanks to less.js for some of the basics here
        // <https://github.com/cloudhead/less.js/blob/master/lib/less/functions.js>


        tinycolor.desaturate = function (color, amount) {
            var hsl = tinycolor(color).toHsl();
            hsl.s -= ((amount || 10) / 100);
            hsl.s = clamp01(hsl.s);
            return tinycolor(hsl);
        };
        tinycolor.saturate = function (color, amount) {
            var hsl = tinycolor(color).toHsl();
            hsl.s += ((amount || 10) / 100);
            hsl.s = clamp01(hsl.s);
            return tinycolor(hsl);
        };
        tinycolor.greyscale = function(color) {
            return tinycolor.desaturate(color, 100);
        };
        tinycolor.lighten = function(color, amount) {
            var hsl = tinycolor(color).toHsl();
            hsl.l += ((amount || 10) / 100);
            hsl.l = clamp01(hsl.l);
            return tinycolor(hsl);
        };
        tinycolor.darken = function (color, amount) {
            var hsl = tinycolor(color).toHsl();
            hsl.l -= ((amount || 10) / 100);
            hsl.l = clamp01(hsl.l);
            return tinycolor(hsl);
        };
        tinycolor.complement = function(color) {
            var hsl = tinycolor(color).toHsl();
            hsl.h = (hsl.h + 180) % 360;
            return tinycolor(hsl);
        };


        // Combination Functions
        // ---------------------
        // Thanks to jQuery xColor for some of the ideas behind these
        // <https://github.com/infusion/jQuery-xcolor/blob/master/jquery.xcolor.js>

        tinycolor.triad = function(color) {
            var hsl = tinycolor(color).toHsl();
            var h = hsl.h;
            return [
                tinycolor(color),
                tinycolor({ h: (h + 120) % 360, s: hsl.s, l: hsl.l }),
                tinycolor({ h: (h + 240) % 360, s: hsl.s, l: hsl.l })
            ];
        };
        tinycolor.tetrad = function(color) {
            var hsl = tinycolor(color).toHsl();
            var h = hsl.h;
            return [
                tinycolor(color),
                tinycolor({ h: (h + 90) % 360, s: hsl.s, l: hsl.l }),
                tinycolor({ h: (h + 180) % 360, s: hsl.s, l: hsl.l }),
                tinycolor({ h: (h + 270) % 360, s: hsl.s, l: hsl.l })
            ];
        };
        tinycolor.splitcomplement = function(color) {
            var hsl = tinycolor(color).toHsl();
            var h = hsl.h;
            return [
                tinycolor(color),
                tinycolor({ h: (h + 72) % 360, s: hsl.s, l: hsl.l}),
                tinycolor({ h: (h + 216) % 360, s: hsl.s, l: hsl.l})
            ];
        };
        tinycolor.analogous = function(color, results, slices) {
            results = results || 6;
            slices = slices || 30;

            var hsl = tinycolor(color).toHsl();
            var part = 360 / slices;
            var ret = [tinycolor(color)];

            for (hsl.h = ((hsl.h - (part * results >> 1)) + 720) % 360; --results; ) {
                hsl.h = (hsl.h + part) % 360;
                ret.push(tinycolor(hsl));
            }
            return ret;
        };
        tinycolor.monochromatic = function(color, results) {
            results = results || 6;
            var hsv = tinycolor(color).toHsv();
            var h = hsv.h, s = hsv.s, v = hsv.v;
            var ret = [];
            var modification = 1 / results;

            while (results--) {
                ret.push(tinycolor({ h: h, s: s, v: v}));
                v = (v + modification) % 1;
            }

            return ret;
        };

        // Readability Functions
        // ---------------------
        // <http://www.w3.org/TR/AERT#color-contrast>

        // `readability`
        // Analyze the 2 colors and returns an object with the following properties:
        //    `brightness`: difference in brightness between the two colors
        //    `color`: difference in color/hue between the two colors
        tinycolor.readability = function(color1, color2) {
            var a = tinycolor(color1).toRgb();
            var b = tinycolor(color2).toRgb();
            var brightnessA = (a.r * 299 + a.g * 587 + a.b * 114) / 1000;
            var brightnessB = (b.r * 299 + b.g * 587 + b.b * 114) / 1000;
            var colorDiff = (
                Math.max(a.r, b.r) - Math.min(a.r, b.r) +
                Math.max(a.g, b.g) - Math.min(a.g, b.g) +
                Math.max(a.b, b.b) - Math.min(a.b, b.b)
            );

            return {
                brightness: Math.abs(brightnessA - brightnessB),
                color: colorDiff
            };
        };

        // `readable`
        // http://www.w3.org/TR/AERT#color-contrast
        // Ensure that foreground and background color combinations provide sufficient contrast.
        // *Example*
        //    tinycolor.readable("#000", "#111") => false
        tinycolor.readable = function(color1, color2) {
            var readability = tinycolor.readability(color1, color2);
            return readability.brightness > 125 && readability.color > 500;
        };

        // `mostReadable`
        // Given a base color and a list of possible foreground or background
        // colors for that base, returns the most readable color.
        // *Example*
        //    tinycolor.mostReadable("#123", ["#fff", "#000"]) => "#000"
        tinycolor.mostReadable = function(baseColor, colorList) {
            var bestColor = null;
            var bestScore = 0;
            var bestIsReadable = false;
            for (var i=0; i < colorList.length; i++) {

                // We normalize both around the "acceptable" breaking point,
                // but rank brightness constrast higher than hue.

                var readability = tinycolor.readability(baseColor, colorList[i]);
                var readable = readability.brightness > 125 && readability.color > 500;
                var score = 3 * (readability.brightness / 125) + (readability.color / 500);

                if ((readable && ! bestIsReadable) ||
                    (readable && bestIsReadable && score > bestScore) ||
                    ((! readable) && (! bestIsReadable) && score > bestScore)) {
                    bestIsReadable = readable;
                    bestScore = score;
                    bestColor = tinycolor(colorList[i]);
                }
            }
            return bestColor;
        };


        // Big List of Colors
        // ------------------
        // <http://www.w3.org/TR/css3-color/#svg-color>
        var names = tinycolor.names = {
            aliceblue: "f0f8ff",
            antiquewhite: "faebd7",
            aqua: "0ff",
            aquamarine: "7fffd4",
            azure: "f0ffff",
            beige: "f5f5dc",
            bisque: "ffe4c4",
            black: "000",
            blanchedalmond: "ffebcd",
            blue: "00f",
            blueviolet: "8a2be2",
            brown: "a52a2a",
            burlywood: "deb887",
            burntsienna: "ea7e5d",
            cadetblue: "5f9ea0",
            chartreuse: "7fff00",
            chocolate: "d2691e",
            coral: "ff7f50",
            cornflowerblue: "6495ed",
            cornsilk: "fff8dc",
            crimson: "dc143c",
            cyan: "0ff",
            darkblue: "00008b",
            darkcyan: "008b8b",
            darkgoldenrod: "b8860b",
            darkgray: "a9a9a9",
            darkgreen: "006400",
            darkgrey: "a9a9a9",
            darkkhaki: "bdb76b",
            darkmagenta: "8b008b",
            darkolivegreen: "556b2f",
            darkorange: "ff8c00",
            darkorchid: "9932cc",
            darkred: "8b0000",
            darksalmon: "e9967a",
            darkseagreen: "8fbc8f",
            darkslateblue: "483d8b",
            darkslategray: "2f4f4f",
            darkslategrey: "2f4f4f",
            darkturquoise: "00ced1",
            darkviolet: "9400d3",
            deeppink: "ff1493",
            deepskyblue: "00bfff",
            dimgray: "696969",
            dimgrey: "696969",
            dodgerblue: "1e90ff",
            firebrick: "b22222",
            floralwhite: "fffaf0",
            forestgreen: "228b22",
            fuchsia: "f0f",
            gainsboro: "dcdcdc",
            ghostwhite: "f8f8ff",
            gold: "ffd700",
            goldenrod: "daa520",
            gray: "808080",
            green: "008000",
            greenyellow: "adff2f",
            grey: "808080",
            honeydew: "f0fff0",
            hotpink: "ff69b4",
            indianred: "cd5c5c",
            indigo: "4b0082",
            ivory: "fffff0",
            khaki: "f0e68c",
            lavender: "e6e6fa",
            lavenderblush: "fff0f5",
            lawngreen: "7cfc00",
            lemonchiffon: "fffacd",
            lightblue: "add8e6",
            lightcoral: "f08080",
            lightcyan: "e0ffff",
            lightgoldenrodyellow: "fafad2",
            lightgray: "d3d3d3",
            lightgreen: "90ee90",
            lightgrey: "d3d3d3",
            lightpink: "ffb6c1",
            lightsalmon: "ffa07a",
            lightseagreen: "20b2aa",
            lightskyblue: "87cefa",
            lightslategray: "789",
            lightslategrey: "789",
            lightsteelblue: "b0c4de",
            lightyellow: "ffffe0",
            lime: "0f0",
            limegreen: "32cd32",
            linen: "faf0e6",
            magenta: "f0f",
            maroon: "800000",
            mediumaquamarine: "66cdaa",
            mediumblue: "0000cd",
            mediumorchid: "ba55d3",
            mediumpurple: "9370db",
            mediumseagreen: "3cb371",
            mediumslateblue: "7b68ee",
            mediumspringgreen: "00fa9a",
            mediumturquoise: "48d1cc",
            mediumvioletred: "c71585",
            midnightblue: "191970",
            mintcream: "f5fffa",
            mistyrose: "ffe4e1",
            moccasin: "ffe4b5",
            navajowhite: "ffdead",
            navy: "000080",
            oldlace: "fdf5e6",
            olive: "808000",
            olivedrab: "6b8e23",
            orange: "ffa500",
            orangered: "ff4500",
            orchid: "da70d6",
            palegoldenrod: "eee8aa",
            palegreen: "98fb98",
            paleturquoise: "afeeee",
            palevioletred: "db7093",
            papayawhip: "ffefd5",
            peachpuff: "ffdab9",
            peru: "cd853f",
            pink: "ffc0cb",
            plum: "dda0dd",
            powderblue: "b0e0e6",
            purple: "800080",
            red: "f00",
            rosybrown: "bc8f8f",
            royalblue: "4169e1",
            saddlebrown: "8b4513",
            salmon: "fa8072",
            sandybrown: "f4a460",
            seagreen: "2e8b57",
            seashell: "fff5ee",
            sienna: "a0522d",
            silver: "c0c0c0",
            skyblue: "87ceeb",
            slateblue: "6a5acd",
            slategray: "708090",
            slategrey: "708090",
            snow: "fffafa",
            springgreen: "00ff7f",
            steelblue: "4682b4",
            tan: "d2b48c",
            teal: "008080",
            thistle: "d8bfd8",
            tomato: "ff6347",
            turquoise: "40e0d0",
            violet: "ee82ee",
            wheat: "f5deb3",
            white: "fff",
            whitesmoke: "f5f5f5",
            yellow: "ff0",
            yellowgreen: "9acd32"
        };

        // Make it easy to access colors via `hexNames[hex]`
        var hexNames = tinycolor.hexNames = flip(names);


        // Utilities
        // ---------

        // `{ 'name1': 'val1' }` becomes `{ 'val1': 'name1' }`
        function flip(o) {
            var flipped = { };
            for (var i in o) {
                if (o.hasOwnProperty(i)) {
                    flipped[o[i]] = i;
                }
            }
            return flipped;
        }

        // Take input from [0, n] and return it as [0, 1]
        function bound01(n, max) {
            if (isOnePointZero(n)) { n = "100%"; }

            var processPercent = isPercentage(n);
            n = mathMin(max, mathMax(0, parseFloat(n)));

            // Automatically convert percentage into number
            if (processPercent) {
                n = parseInt(n * max, 10) / 100;
            }

            // Handle floating point rounding errors
            if ((math.abs(n - max) < 0.000001)) {
                return 1;
            }

            // Convert into [0, 1] range if it isn't already
            return (n % max) / parseFloat(max);
        }

        // Force a number between 0 and 1
        function clamp01(val) {
            return mathMin(1, mathMax(0, val));
        }

        // Parse an integer into hex
        function parseHex(val) {
            return parseInt(val, 16);
        }

        // Need to handle 1.0 as 100%, since once it is a number, there is no difference between it and 1
        // <http://stackoverflow.com/questions/7422072/javascript-how-to-detect-number-as-a-decimal-including-1-0>
        function isOnePointZero(n) {
            return typeof n == "string" && n.indexOf('.') != -1 && parseFloat(n) === 1;
        }

        // Check to see if string passed in is a percentage
        function isPercentage(n) {
            return typeof n === "string" && n.indexOf('%') != -1;
        }

        // Force a hex value to have 2 characters
        function pad2(c) {
            return c.length == 1 ? '0' + c : '' + c;
        }

        // Replace a decimal with it's percentage value
        function convertToPercentage(n) {
            if (n <= 1) {
                n = (n * 100) + "%";
            }

            return n;
        }

        var matchers = (function() {

            // <http://www.w3.org/TR/css3-values/#integers>
            var CSS_INTEGER = "[-\\+]?\\d+%?";

            // <http://www.w3.org/TR/css3-values/#number-value>
            var CSS_NUMBER = "[-\\+]?\\d*\\.\\d+%?";

            // Allow positive/negative integer/number.  Don't capture the either/or, just the entire outcome.
            var CSS_UNIT = "(?:" + CSS_NUMBER + ")|(?:" + CSS_INTEGER + ")";

            // Actual matching.
            // Parentheses and commas are optional, but not required.
            // Whitespace can take the place of commas or opening paren
            var PERMISSIVE_MATCH3 = "[\\s|\\(]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")\\s*\\)?";
            var PERMISSIVE_MATCH4 = "[\\s|\\(]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")\\s*\\)?";

            return {
                rgb: new RegExp("rgb" + PERMISSIVE_MATCH3),
                rgba: new RegExp("rgba" + PERMISSIVE_MATCH4),
                hsl: new RegExp("hsl" + PERMISSIVE_MATCH3),
                hsla: new RegExp("hsla" + PERMISSIVE_MATCH4),
                hsv: new RegExp("hsv" + PERMISSIVE_MATCH3),
                hex3: /^([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/,
                hex6: /^([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/
            };
        })();

        // `stringInputToObject`
        // Permissive string parsing.  Take in a number of formats, and output an object
        // based on detected format.  Returns `{ r, g, b }` or `{ h, s, l }` or `{ h, s, v}`
        function stringInputToObject(color) {

            color = color.replace(trimLeft,'').replace(trimRight, '').toLowerCase();
            var named = false;
            if (names[color]) {
                color = names[color];
                named = true;
            }
            else if (color == 'transparent') {
                return { r: 0, g: 0, b: 0, a: 0 };
            }

            // Try to match string input using regular expressions.
            // Keep most of the number bounding out of this function - don't worry about [0,1] or [0,100] or [0,360]
            // Just return an object and let the conversion functions handle that.
            // This way the result will be the same whether the tinycolor is initialized with string or object.
            var match;
            if ((match = matchers.rgb.exec(color))) {
                return { r: match[1], g: match[2], b: match[3] };
            }
            if ((match = matchers.rgba.exec(color))) {
                return { r: match[1], g: match[2], b: match[3], a: match[4] };
            }
            if ((match = matchers.hsl.exec(color))) {
                return { h: match[1], s: match[2], l: match[3] };
            }
            if ((match = matchers.hsla.exec(color))) {
                return { h: match[1], s: match[2], l: match[3], a: match[4] };
            }
            if ((match = matchers.hsv.exec(color))) {
                return { h: match[1], s: match[2], v: match[3] };
            }
            if ((match = matchers.hex6.exec(color))) {
                return {
                    r: parseHex(match[1]),
                    g: parseHex(match[2]),
                    b: parseHex(match[3]),
                    format: named ? "name" : "hex"
                };
            }
            if ((match = matchers.hex3.exec(color))) {
                return {
                    r: parseHex(match[1] + '' + match[1]),
                    g: parseHex(match[2] + '' + match[2]),
                    b: parseHex(match[3] + '' + match[3]),
                    format: named ? "name" : "hex"
                };
            }

            return false;
        }

        root.tinycolor = tinycolor;

    })(this);

    $(function () {
        if ($.fn.spectrum.load) {
            $.fn.spectrum.processNativeColorInputs();
        }
    });

})(window, jQuery);
