(function($) {
	
	PhotoFrame.Buttons.Brightness = PhotoFrame.Button.extend({
		
		/**
		 * An array of button objects
		 */
		
		buttons: [],
		
		/**
		 * The button description 
		 */
		
		description: 'Adjust the brightness of the photo.',
		
		/**
		 * Name of the button
		 */
		
		name: 'Brightness',
		
		/**
		 * Name of the button
		 */
		
		icon: 'brightness',
		
		/**
		 * The JSON object used for Window settings 
		 */
		
		windowSettings: {
		 	css: 'photo-frame-brightness photo-frame-slider-window',		
			title: false
		},
		
		constructor: function(buttonBar) {
			var t = this;
			
			this.windowSettings.title = PhotoFrame.Lang.brightness;
			
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
				'<div class="photo-frame-inline">',
					'<div class="photo-frame-inline-block photo-frame-med-margin-right">',
						'<i class="icon-light-down"></i>',
					'</div>',
					'<div class="photo-frame-inline-block">',
						'<div class="photo-frame-slider"></div>',
					'</div>',
					'<div class="photo-frame-inline-block photo-frame-med-margin-left">',
						'<i class="icon-light-up"></i>',
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
			this.window.ui.value = $('<div class="photo-frame-control-value photo-frame-hidden photo-frame-inline-block photo-frame-fixed"></div>');
			this.window.ui.content.append(this.window.ui.value);
			this.window.ui.slider.slider({
				min: -255,
				max: 255,
				start: function(e, ui) {
					t.window.ui.value.fadeIn();
					position(ui);
				},
				slide: function(e, ui) {
					position(ui);
				},
				stop: function(e, ui) {
					position(ui);
					
					setTimeout(function() {
						t.window.ui.value.fadeOut();
					}, 750);
				}
			});		
		}
	});

}(jQuery));