(function($) {
	
	PhotoFrame.Buttons.Layers = PhotoFrame.Button.extend({
		
		/**
		 * An array of button objects
		 */
		
		buttons: [],
		
		/**
		 * The button description 
		 */
		
		description: 'Manage the various layers of manipulations.',
		
		/**
		 * The button icon
		 */
		
		icon: 'layers',
		
		/**
		 * Name of the button
		 */
		
		name: 'Layers',
		
		/**
		 * The JSON object used for Window settings 
		 */
		
		windowSettings: {
			css: 'photo-frame-layers',
			title: false
		},
		
		constructor: function(buttonBar) {
			var t = this;
			
			this.windowSettings.title = PhotoFrame.Lang.layers;
			
			this.base(buttonBar);
		},
		
		apply: function() {	
			console.log('click');
			//var d = parseInt(this.ui.window.find('#photo-frame-rotate').val());	
		},
		
		buildWindow: function() {	
			this.base({ buttons: this.buttons });
			
			var html = $([
				'<div class="photo-frame-layer">',
					'<div class="photo-frame-layer-icon"><i class="icon-rotate"></i></div>',
					'<div class="photo-frame-layer-title">Rotate</div>',
					'<div class="photo-frame-layer-actions">',
						'<a href="#"><i class="icon-eye"></i></a>',
						'<a href="#"><i class="icon-trash"></i></a>',
					'</div>',
				'</div>',
				'<div class="photo-frame-layer">',
					'<div class="photo-frame-layer-icon"><i class="icon-rotate"></i></div>',
					'<div class="photo-frame-layer-title">Rotate</div>',
					'<div class="photo-frame-layer-actions">',
						'<a href="#"><i class="icon-eye"></i></a>',
						'<a href="#"><i class="icon-trash"></i></a>',
					'</div>',
				'</div>',
				'<div class="photo-frame-layer">',
					'<div class="photo-frame-layer-icon"><i class="icon-rotate"></i></div>',
					'<div class="photo-frame-layer-title">Rotate</div>',
					'<div class="photo-frame-layer-actions">',
						'<a href="#"><i class="icon-eye"></i></a>',
						'<a href="#"><i class="icon-trash"></i></a>',
					'</div>',
				'</div>'
			].join(''));
			
			this.window.ui.content.html(html);
			this.buttonBar.factory.layerWindow = this.window;
		}
	});

}(jQuery));