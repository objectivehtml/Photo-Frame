(function($) {

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
				
				/*
				if(!this.resizeToggleLayer) {
					if(x || x2 || y || y2) {
						this.addManipulation(true, {
							x:  x,
							x2: x2,
							y:  y,
							y2: y2
						});
					}
					else {
						//this.showManipulation();
					}
				}
				else {
					//console.log('insert correct crop size here', this.resizeToggleLayer);
					//this.addManipulation(false, this.resizeToggleLayer);
					//this.resizeToggleLayer = false;
				}
				*/
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
				this.disable();
			}
		},
		
		toggleLayer: function(visibility) {
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
			
			this.window.ui.x  = this.window.ui.content.find('#x');
			this.window.ui.y  = this.window.ui.content.find('#y');
			this.window.ui.x2 = this.window.ui.content.find('#x2');
			this.window.ui.y2 = this.window.ui.content.find('#y2');	
			
			var visibility;
			var resizeVisibility;
			var started;			
			
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
					t.toggleLayer(visibility);
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
			
			/*
			this.bind('resize', function(obj, width, height) {
				t.resizeObj = obj;
				
				if(t.getManipulation()) {
					//t.cropPhoto().releaseCrop();
				}
			});
			
			this.bind('rotate', function(obj) {
				//t.cropPhoto().releaseCrop();
			});
			
			this.bind('rotateRemoveLayer', function(obj) {
				//t.removeManipulation();
			});
			
			this.bind('resizeToggleLayer', function(manipulation) {
				//t.toggleLayerCallback(manipulation);
			});
			
			this.bind('rotateToggleLayer', function(manipulation) {
				//t.toggleLayerCallback(manipulation);
			});
			*/
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
			var manipulation = this.getManipulation();
			var released 	 = this.cropPhoto().released;
			var select   	 = this.cropPhoto().jcrop.tellSelect();
			var img      	 = this.cropPhoto().ui.cropPhoto.find('img');
			
			this.cropPhoto().destroyJcrop();				
			this.cropPhoto().ui.cropPhoto = $('<div class="'+this.buttonBar.factory.classes.cropPhoto+'"></div>');
			this.buttonBar.factory.ui.crop.append(this.buttonBar.factory.cropPhoto.ui.cropPhoto);				
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
		},
		
		refresh: function(formFields) {
			var crop = this.getCrop(formFields)
			
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
	
}(jQuery));