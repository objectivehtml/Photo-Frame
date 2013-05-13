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
					t.apply();
				}
			}];

			t.base(buttonBar);
			
			t.buttonBar.factory.bind('jcropOnChange', function(a) {
				t._populateWindow();
			});
		},
		
		apply: function() {			
			var x  = parseInt(this.window.ui.content.find('#x').val());
			var y  = parseInt(this.window.ui.content.find('#y').val());
			var x2 = parseInt(this.window.ui.content.find('#x2').val());
			var y2 = parseInt(this.window.ui.content.find('#y2').val());
			
			this.buttonBar.factory.cropPhoto.jcrop.setSelect([x, y, x2, y2]);
		},
		
		buildWindow: function() {
			this.base({ buttons: this.buttons });
			
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
		},
		
		showWindow: function() {
			this._populateWindow();
			this.base();
		},
		
		_populateWindow: function() {
			var crop = this.buttonBar.factory.cropPhoto.cropDimensions();
					
			this.window.ui.content.find('#x').val(crop.x);
			this.window.ui.content.find('#y').val(crop.y);
			this.window.ui.content.find('#x2').val(crop.x2);
			this.window.ui.content.find('#y2').val(crop.y2);
		}
	});
	
}(jQuery));