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
			
			this.buttonBar.factory.trigger('rotate', this, this.getDegree());
			this.render();
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
		
		toggleLayer: function(visibility) {
			this.base(visibility);
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