(function($) {
	
	PhotoFrame.Buttons.Rotate = PhotoFrame.Button.extend({
		
		/**
		 * An array of button objects
		 */
		
		buttons: [],
		
		/**
		 * The button description 
		 */
		
		description: 'The rotate an image by the defined degree.',
		
		/**
		 * Name of the button
		 */
		
		name: 'Rotate',
		
		/**
		 * The JSON object used for Window settings 
		 */
		
		windowSettings: {
			title: 'Rotate'
		},
		
		constructor: function(buttonBar) {
			var t = this;
			
			this.buttons = [{
				text: 'Rotate',
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