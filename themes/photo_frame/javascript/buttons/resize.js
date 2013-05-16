(function($) {
	
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
				text: PhotoFrame.Lang.save,
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
		
		reset: function() {
			this.window.ui.width.val('');
			this.window.ui.height.val('');
		},
		
		removeLayer: function() {
			this.reset();	
		},
		
		startCrop: function() {
			var manipulation = this.getManipulation();
			
			this.window.ui.width.val(manipulation.data.width);
			this.window.ui.height.val(manipulation.data.height);
		},
		
		apply: function() {
			var t = this;
			
			this.startRendering(function() {
				console.log('test');
				
				setTimeout(function() {
					t.stopRendering();
				}, 500)	
			});
			
			this.addManipulation(true, {
				width: this.getWidth(),
				height: this.getHeight()
			});
		},
		
		buildWindow: function() {	
			this.base({ buttons: this.buttons });
			
			var html = $([
				'<div class="photo-frame-inline photo-frame-margin-bottom">',
					'<label for="photo-frame-width" class="photo-frame-small">'+PhotoFrame.Lang.width+'</label>',
					'<input type="text" name="photo-frame-width" value="" id="photo-frame-width" class="photo-frame-small" />',
				'</div>',
				'<div class="photo-frame-inline">',
					'<label for="photo-frame-height" class="photo-frame-small">'+PhotoFrame.Lang.height+'</label>',
					'<input type="text" name="photo-frame-height" value="" id="photo-frame-height" class="photo-frame-small" />',
				'</div>'
			].join(''));
			
			this.window.ui.content.html(html);
			this.window.ui.width  = this.window.ui.content.find('#photo-frame-width');
			this.window.ui.height = this.window.ui.content.find('#photo-frame-height');			
		}
	});

}(jQuery));