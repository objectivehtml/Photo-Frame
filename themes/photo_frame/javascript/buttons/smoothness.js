(function($) {
	
	PhotoFrame.Buttons.Smoothness = PhotoFrame.Button.extend({
		
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
		 * Name of the button
		 */
		
		icon: 'leaf',
		
		/**
		 * The JSON object used for Window settings 
		 */
		
		windowSettings: {
		 	css: 'photo-frame-brightness photo-frame-slider-window',		
			title: false
		},
		
		constructor: function(buttonBar) {
			var t = this;
			
			this.name				  = PhotoFrame.Lang.smoothness;
			this.description		  = PhotoFrame.Lang.smoothness_desc;
			this.windowSettings.title = PhotoFrame.Lang.smoothness;
			
			this.buttons = [{
				text: PhotoFrame.Lang.adjust,
				css: 'photo-frame-tool-window-save',
				onclick: function(e, button) {
					t.apply();
				}
			}];

			this.base(buttonBar);
		},
		
		getValue: function() {
			return this.window.ui.slider.slider('option', 'value');
		},
		
		apply: function() {
			this.addManipulation(true, {
				value: this.getValue()
			});
			this.render();
		},
		
		startCrop: function() {
			var manipulation = this.getManipulation();
			
			if(manipulation && manipulation.data) {
				this.window.ui.slider.slider('option', 'value', manipulation.data.value);
			}
			
			this.base();
		},
		
		reset: function() {
			this.window.ui.slider.slider('option', 'value', 0);	
		},
		
		enable: function() {
			this.window.ui.slider.slider('option', 'disabled', false);
		},
		
		disable: function() {
			this.window.ui.slider.slider('option', 'disabled', true);
		},
		
		buildWindow: function() {	
			this.base({ buttons: this.buttons });
						
			var t    = this;	
			var html = $([
				'<div class="photo-frame-inline">',
					'<div class="photo-frame-inline-block photo-frame-med-margin-right">',
						'<i class="icon-minus"></i>',
					'</div>',
					'<div class="photo-frame-inline-block">',
						'<div class="photo-frame-slider"></div>',
					'</div>',
					'<div class="photo-frame-inline-block photo-frame-med-margin-left">',
						'<i class="icon-plus"></i>',
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
				create: function(e, ui) {
					position(ui);
				},
				stop: function(e, ui) {
					position(ui);
					t.window.ui.value.hide();
					t.apply();
				}
			});		
		}
	});

}(jQuery));