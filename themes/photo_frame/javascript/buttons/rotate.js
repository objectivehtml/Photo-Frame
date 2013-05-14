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
			this.addManipulation(true, {
				degree: this.getDegree()
			});
		},
		
		startCrop: function() {
			var manipulation = this.getManipulation();	
			
			this.window.ui.input.val(manipulation.data.degree);
		},
		
		getDegree: function() {
			return parseInt(this.window.ui.input.val() == '' ? 0 : this.window.ui.input.val());	
		},
		
		reset: function() {
			this.window.ui.input.val(0);	
		},
		
		buildWindow: function() {	
			this.base({ buttons: this.buttons });
			
			this.window.ui.input = $('<input type="text" name="photo-frame-rotate" value="" id="photo-frame-rotate" class="photo-frame-small" />');
			
			var html = $([
				'<div class="photo-frame-inline">',
					'<label for="photo-frame-rotate">'+PhotoFrame.Lang.degrees+'</label>',
				'</div>'
			].join(''));
			
			html.append(this.window.ui.input);
			
			this.window.ui.content.html(html);
		}
	});

}(jQuery));