(function($) {
	
	PhotoFrame.Buttons.Vignette = PhotoFrame.Button.extend({
		
		/**
		 * An array of button objects
		 */
		
		buttons: [],
		
		/**
		 * The button description 
		 */
		
		description: false,
		
		/**
		 * The button icon
		 */
		
		icon: 'target',
		
		/**
		 * Name of the button
		 */
		
		name: false,
		
		/**
		 * The JSON object used for Window settings 
		 */
		
		windowSettings: {
			css: 'photo-frame-vignette photo-frame-slider-window',
			title: false,
			width: 240
		},
		
		constructor: function(buttonBar) {
			var t = this;
			
			this.description          = PhotoFrame.Lang.vignette_desc;
			this.name                 = PhotoFrame.Lang.vignette;
			this.windowSettings.title = PhotoFrame.Lang.vignette;
			
			this.buttons = [{
				text: PhotoFrame.Lang.apply,
				css: 'photo-frame-tool-window-save',
				onclick: function(e, button) {
					t.apply();
				}
			}];

			this.base(buttonBar);
		},
		
		apply: function() {			
			this.addManipulation(true, {
				sharp: this.window.ui.sharp.slider('value'),
				level: this.window.ui.level.slider('value')
			});
			
			this.render();
		},
		
		toggleLayer: function(visibility, render) {
			this.base(visibility, render);
		},
		
		startCrop: function() {
			var manipulation = this.getManipulation();
			
			if(manipulation) {
				this.window.ui.sharp.slider('option', 'value', manipulation.data.sharp);
				this.window.ui.level.slider('option', 'value', manipulation.data.level);
				this.base();
			}			
		},
		
		enable: function() {
			this.window.ui.sharp.slider('option', 'disabled', false);
			this.window.ui.level.slider('option', 'disabled', false);
		},
		
		disable: function() {
			this.window.ui.sharp.slider('option', 'disabled', true);
			this.window.ui.level.slider('option', 'disabled', true);
		},
		
		reset: function() {
			this.window.ui.sharp.slider('option', 'value', .4);
			this.window.ui.level.slider('option', 'value', .7);
		},
		
		buildWindow: function() {	
			this.base({ buttons: this.buttons });
						
			var t    = this;	
			var html = $([
				'<div class="photo-frame-inline photo-frame-margin-bottom">',
					'<div class="photo-frame-inline-block photo-frame-big-margin-right">Sharp</div>',
					'<div class="photo-frame-inline-block">',
					'</div>',
				'</div>',
				'<div class="photo-frame-inline photo-frame-margin-bottom">',
					'<div class="photo-frame-inline-block photo-frame-big-margin-right">Level</div>',
					'<div class="photo-frame-inline-block">',
					'</div>',
				'</div>',
			].join(''));
			
			this.window.ui.content.html(html);
			
			var classes = 'photo-frame-control-value photo-frame-hidden photo-frame-inline-block photo-frame-fixed';
			
			this.window.ui.value = {};
			
			this.window.ui.value.sharp = $('<div class="'+classes+'"></div>');
			this.window.ui.value.level = $('<div class="'+classes+'"></div>');
			
			this.window.ui.sharp = $('<div class="photo-frame-slider" data-type="sharp"></div>');
			this.window.ui.level = $('<div class="photo-frame-slider" data-type="level"></div>');
			
			this.window.ui.content.find('.photo-frame-inline').eq(0).find('div:last-child').append(this.window.ui.sharp);
			this.window.ui.content.find('.photo-frame-inline').eq(1).find('div:last-child').append(this.window.ui.level);
			
			this.window.ui.content.append(this.window.ui.value.sharp);
			this.window.ui.content.append(this.window.ui.value.level);
			
			function position(type, ui) {				
				t.window.ui.value[type].html(ui.value);		
				t.window.ui.value[type].position({
					of: ui.handle,
					my: 'center top',
					at: 'center bottom'
				});
				
				var top = parseInt(t.window.ui.value[type].css('top').replace('px', ''), 10);
				
				t.window.ui.value[type].css('top', top+10);
			}
			
			this.window.ui.slider = this.window.ui.content.find('.photo-frame-slider');
			this.window.ui.slider.slider({
				min: 0,
				max: 100,
				start: function(e, ui) {
					var type = $(this).data('type');
					t.window.ui.value[type].fadeIn('fast');
					position(type, ui);
				},
				create: function(e, ui) {
					position($(this).data('type'), ui);
				},
				slide: function(e, ui) {
					position($(this).data('type'), ui);
				},
				stop: function(e, ui) {
					var type = $(this).data('type');					
					position(type, ui);				
					t.apply();	
					t.window.ui.value[type].fadeOut('fast');
				}
			});	
			
			this.window.ui.content.append(this.window.ui.value);		
		}
	});

}(jQuery));