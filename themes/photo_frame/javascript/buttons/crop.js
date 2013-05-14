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
			var crop = this.getCrop(true);			
			var x    = crop.x;
			var y    = crop.y;
			var x2   = crop.x2;
			var y2   = crop.y2;
			
			this.addManipulation(true, {
				x:  x,
				x2: x2,
				y:  y,
				y2: y2
			});
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
				this.refresh();
			}
		},
		
		removeLayer: function() {
			this.buttonBar.factory.cropPhoto.releaseCrop();
			this.removeManipulation();	
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
				
			this.bind('jcropOnChange', function(a) {
				t.buttonBar.factory.cropPhoto.released = false;
				t.refresh();
			});
			
			this.bind('jcropOnRelease', function(a) {
				t.removeManipulation();
			});
			
			this.bind('jcropOnSelect', function(a) {
				t.buttonBar.factory.cropPhoto.released = false;
				t.refresh(true);
				t.apply();
			});
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