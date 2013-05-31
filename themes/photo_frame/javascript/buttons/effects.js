(function($) {
	
	PhotoFrame.Buttons.Effects = PhotoFrame.Button.extend({
		
		/**
		 * An array of button objects
		 */
		
		buttons: [],
		
		/**
		 * An object of classes
		 */
		
		classes: {
			loading: 'photo-frame-loading',
		},
		
		/**
		 * The button description 
		 */
		
		description: false,
		
		/**
		 * An array of effects
		 */
		
		effects: [],
		
		/**
		 * Name of the button
		 */
		
		name: false,
		
		/**
		 * Name of the button
		 */
		
		icon: 'magic',
		
		/**
		 * The JSON object used for Window settings 
		 */
		
		windowSettings: {
		 	css: 'photo-frame-effects photo-frame-slider-window',		
			title: false,
			width: 268
		},
		
		constructor: function(buttonBar) {
			var t = this;
			
			this.name				  = PhotoFrame.Lang.effects;
			this.description		  = PhotoFrame.Lang.effects_desc;
			this.windowSettings.title = PhotoFrame.Lang.effects;

			this.base(buttonBar);
		},
		
		apply: function() {
			this.addManipulation(true, {
				value: this.getBrightness()
			});
			this.render();
		},
		
		toggleLayer: function(visibility, render) {
			this.base(visibility, render);	
		},
		
		removeLayer: function() {
			this.effects = [];
			this.reset();	
		},
		
		startCrop: function() {
			var t = this, m = this.getManipulation();
			
			if(m) {
				t.effects = [];
				
				$.each(m.data.effects, function(i, effect) {
					t.effects.push(effect);
				});
			}
			
			this.base();
		},
		
		enable: function() {
		},
		
		disable: function() {
		},
		
		reset: function() {
			var t = this;
			
			this.window.ui.content.find('a').removeClass('active');
			
			$.each(this.effects, function(i, effect) {
				t.window.ui.content.find('a[data-effect="'+effect+'"]').addClass('active');
			});
		},
		
		refresh: function() {						
			if(this.effects.length > 0) {
				this.addManipulation(true, {
					effects: this.effects
				});
			}
			else {
				this.removeManipulation();
			}
			
			this.render();
		},
		
		buildWindow: function() {	
			this.base({ buttons: this.buttons });
			var t = this;
			
			this.bind('startCropBegin', function() {
				t.window.ui.content.html('<p class="'+t.classes.loading+'"><span></span> '+PhotoFrame.Lang.loading+'</p>');
				t.window.ui.content.find('span').activity({
					segments: 12, 
					steps: 4, 
					width: 3, 
					space: 1, 
					length: 4, 
					color: '#ffffff', 
					speed: 1.5
				});	
			});
			
			this.bind('startCropCallbackFailed', function(photo, obj, data) {
				var error = PhotoFrame.Lang.effects_error;
				
				if(data.validPath === false) {
					error = PhotoFrame.Lang.invalid_thumbnail;			
					t.log('Invalid thumbnail: '+data.path);
				}
				else {
					t.log(data);
				}
				
				t.window.ui.content.html('<p class="photo-frame-error">'+error+'</p>');			
			});
			
			this.bind('startCropCallback', function(photo, obj, data) {
			
				var html  = $('<ul class="photo-frame-block-grid three-up" />');
				var count = 0;
				 
				$.each(data.effects, function(i, obj) {
					
					var effect = obj.method;
					var active = false;
					
					$.each(t.effects, function(i, subject) {
						if(subject == effect) {
							active = true;
						}
					});
					
					var item   = $([
						'<li>',
							'<a href="#" class="clearfix '+(active ? 'active' : '')+'" data-effect="'+effect+'">',
								'<span class="info">'+obj.name+'</span>',
							'</a>',
						'</li>'
					].join(''));
										
					t.cropPhoto().load(obj.url, function(img) {
						count++;
					
						item.find('a').prepend(img);
						
						if(count == data.effects.length) {
							t.window.ui.content.html(html);	
						}
					});
					
					html.append(item);
				});
				
				html.find('a').click(function(e) {
					var $t = $(this), effect = $t.data('effect'), m = t.getManipulation();
					
					if(!m || m.visible) {
						if($t.hasClass('active')) {
							$t.removeClass('active');
							
							if(t.effects.length > 1) {
								t.effects = t.removeIndex(t.effects, effect);
							}
							else {
								t.effects = [];
							}
						}
						else {
							$t.addClass('active');
							t.effects.push(effect);
						}
						
						t.refresh();	
					}
								
					e.preventDefault();
				});				
			});
			
			
			this.bind('save', function() {
				t.window.ui.content.html('');
			});
			
			this.bind('cancel', function() {
				t.window.ui.content.html('');
			});
			
		}
	});

}(jQuery));