(function($) {
	
	PhotoFrame.Buttons.Rgba = PhotoFrame.Button.extend({
		
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
		
		icon: 'palette',
		
		/**
		 * Name of the button
		 */
		
		name: false,
		
		/**
		 * The JSON object used for Window settings 
		 */
		
		windowSettings: {
			css: 'photo-frame-rgb photo-frame-slider-window',
			title: false,
			width: 220
		},
		
		constructor: function(buttonBar) {
			var t = this;
			
			this.description          = PhotoFrame.Lang.rgba_desc;
			this.name                 = PhotoFrame.Lang.rgba;
			this.windowSettings.title = PhotoFrame.Lang.color_adjustment;
			
			this.buttons = [{
				text: PhotoFrame.Lang.adjust,
				css: 'photo-frame-tool-window-save',
				onclick: function(e, button) {
					t.apply();
				}
			}];

			this.base(buttonBar);
		},
		
		apply: function() {			
			this.addManipulation(true, {
				r: this.window.ui.r.slider('value'),
				g: this.window.ui.g.slider('value'),
				b: this.window.ui.b.slider('value'),
				a: this.window.ui.a.slider('value')
			});
			
			this.render();
		},
		
		toggleLayer: function(visibility, render) {
			this.base(visibility, render);
		},
		
		startCrop: function() {
			var manipulation = this.getManipulation();
			
			if(manipulation) {
				this.window.ui.r.slider('option', 'value', manipulation.data.r);
				this.window.ui.g.slider('option', 'value', manipulation.data.g);
				this.window.ui.b.slider('option', 'value', manipulation.data.b);
				this.window.ui.a.slider('option', 'value', manipulation.data.a);
				this.base();
			}			
		},
		
		enable: function() {
			this.window.ui.r.slider('option', 'disabled', false);
			this.window.ui.g.slider('option', 'disabled', false);
			this.window.ui.b.slider('option', 'disabled', false);
			this.window.ui.a.slider('option', 'disabled', false);
		},
		
		disable: function() {
			this.window.ui.r.slider('option', 'disabled', true);
			this.window.ui.g.slider('option', 'disabled', true);
			this.window.ui.b.slider('option', 'disabled', true);
			this.window.ui.a.slider('option', 'disabled', true);
		},
		
		reset: function() {
			this.window.ui.r.slider('option', 'value', 0);
			this.window.ui.g.slider('option', 'value', 0);
			this.window.ui.b.slider('option', 'value', 0);
			this.window.ui.a.slider('option', 'value', 0);	
		},
		
		buildWindow: function() {	
			this.base({ buttons: this.buttons });
						
			var t    = this;	
			var html = $([
				'<div class="photo-frame-inline photo-frame-margin-bottom">',
					'<div class="photo-frame-inline-block photo-frame-big-margin-right">R</div>',
					'<div class="photo-frame-inline-block">',
					'</div>',
				'</div>',
				'<div class="photo-frame-inline photo-frame-margin-bottom">',
					'<div class="photo-frame-inline-block photo-frame-big-margin-right">G</div>',
					'<div class="photo-frame-inline-block">',
					'</div>',
				'</div>',
				'<div class="photo-frame-inline photo-frame-margin-bottom">',
					'<div class="photo-frame-inline-block photo-frame-big-margin-right">B</div>',
					'<div class="photo-frame-inline-block">',
					'</div>',
				'</div>',
				'<div class="photo-frame-inline photo-frame-margin-bottom">',
					'<div class="photo-frame-inline-block photo-frame-big-margin-right">A</div>',
					'<div class="photo-frame-inline-block">',
					'</div>',
				'</div>'
			].join(''));
			
			this.window.ui.content.html(html);
			
			var classes = 'photo-frame-control-value photo-frame-hidden photo-frame-inline-block photo-frame-fixed';
			
			this.window.ui.value = {};
			
			this.window.ui.value.r = $('<div class="'+classes+'"></div>');
			this.window.ui.value.g = $('<div class="'+classes+'"></div>');
			this.window.ui.value.b = $('<div class="'+classes+'"></div>');
			this.window.ui.value.a = $('<div class="'+classes+'"></div>');
			
			this.window.ui.r = $('<div class="photo-frame-slider" data-type="r"></div>');
			this.window.ui.g = $('<div class="photo-frame-slider" data-type="g"></div>');
			this.window.ui.b = $('<div class="photo-frame-slider" data-type="b"></div>');
			this.window.ui.a = $('<div class="photo-frame-slider" data-type="a"></div>');
			
			this.window.ui.content.find('.photo-frame-inline').eq(0).find('div:last-child').append(this.window.ui.r);
			this.window.ui.content.find('.photo-frame-inline').eq(1).find('div:last-child').append(this.window.ui.g);
			this.window.ui.content.find('.photo-frame-inline').eq(2).find('div:last-child').append(this.window.ui.b);
			this.window.ui.content.find('.photo-frame-inline').eq(3).find('div:last-child').append(this.window.ui.a);
			
			this.window.ui.content.append(this.window.ui.value.r);
			this.window.ui.content.append(this.window.ui.value.g);
			this.window.ui.content.append(this.window.ui.value.b);
			this.window.ui.content.append(this.window.ui.value.a);
			
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
				max: 255,
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
			
			this.window.ui.a.slider('option', 'min', 0);
			this.window.ui.a.slider('option', 'max', 127);
			this.window.ui.content.append(this.window.ui.value);		
		}
	});

}(jQuery));