(function($) {
	
	PhotoFrame.Buttons.Rgb = PhotoFrame.Button.extend({
		
		/**
		 * An array of button objects
		 */
		
		buttons: [],
		
		/**
		 * The button description 
		 */
		
		description: 'Adjust the rgb colors in the photo.',
		
		/**
		 * The button icon
		 */
		
		icon: 'palette',
		
		/**
		 * Name of the button
		 */
		
		name: 'RGB',
		
		/**
		 * The JSON object used for Window settings 
		 */
		
		windowSettings: {
			css: 'photo-frame-rgb photo-frame-slider-window',
			title: 'Color Adjustment',
			width: 186
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
		
		apply: function() {	
			console.log('click');
			//var d = parseInt(this.ui.window.find('#photo-frame-rotate').val());	
		},
		
		buildWindow: function() {	
			this.base({ buttons: this.buttons });
						
			var t    = this;	
			var html = $([
				'<div class="photo-frame-inline photo-frame-margin-bottom">',
					'<div class="photo-frame-inline-block photo-frame-big-margin-right">R</div>',
					'<div class="photo-frame-inline-block">',
						'<div class="photo-frame-slider"></div>',
					'</div>',
				'</div>',
				'<div class="photo-frame-inline photo-frame-margin-bottom">',
					'<div class="photo-frame-inline-block photo-frame-big-margin-right">G</div>',
					'<div class="photo-frame-inline-block">',
						'<div class="photo-frame-slider"></div>',
					'</div>',
				'</div>',
				'<div class="photo-frame-inline photo-frame-margin-bottom">',
					'<div class="photo-frame-inline-block photo-frame-big-margin-right">B</div>',
					'<div class="photo-frame-inline-block">',
						'<div class="photo-frame-slider"></div>',
					'</div>',
				'</div>',
				'<div class="photo-frame-inline photo-frame-margin-bottom">',
					'<div class="photo-frame-inline-block photo-frame-big-margin-right">A</div>',
					'<div class="photo-frame-inline-block">',
						'<div class="photo-frame-slider"></div>',
					'</div>',
				'</div>'
			].join(''));
			
			function position(ui) {		
				t.window.ui.value.html(ui.value);		
				t.window.ui.value.position({
					of: ui.handle,
					my: 'center top',
					at: 'center bottom'
				});
				
				var top = parseInt(t.window.ui.value.css('top').replace('px', ''), 10);
				
				t.window.ui.value.css('top', top+10);
			}
			
			this.window.ui.slider = html.find('.photo-frame-slider');
			this.window.ui.content.html(html);
			//this.window.ui.value = $('<div class="photo-frame-control-value photo-frame-hidden photo-frame-inline-block photo-frame-fixed"></div>');
			this.window.ui.content.append(this.window.ui.value);
			this.window.ui.slider.slider();		
		}
	});

}(jQuery));