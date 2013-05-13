(function($) {
	
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
			console.log('click');
			//var d = parseInt(this.ui.window.find('#photo-frame-rotate').val());	
		},
		
		buildWindow: function() {	
			this.base({ buttons: this.buttons });
			
			var html = $([
				'<div class="photo-frame-inline">',
					'<label for="photo-frame-rotate">'+PhotoFrame.Lang.degrees+'</label>',
					'<input type="text" name="photo-frame-rotate" value="" id="photo-frame-rotate" class="photo-frame-small" />',
				'</div>'
			].join(''));
			
			this.window.ui.content.html(html);
		}
	});

}(jQuery));