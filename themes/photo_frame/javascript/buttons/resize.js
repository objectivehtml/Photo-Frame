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
				text: PhotoFrame.Lang.resize,
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
		
		getMaintainAspect: function() {
			return this.window.ui.aspect.attr('checked') === 'checked' ? true : false;
		},
		
		reset: function() {
			if(this.cropPhoto()) {
				this.window.ui.width.val(this.cropPhoto().width());
				this.window.ui.height.val(this.cropPhoto().height());
				this.window.ui.aspect.attr('checked', true);
			}
		},
		
		enable: function() {
			this.window.ui.width.attr('disabled', false);
			this.window.ui.height.attr('disabled', false);	
			this.window.ui.aspect.attr('disabled', false);	
		},
		
		disable: function() {
			this.window.ui.width.attr('disabled', true);
			this.window.ui.height.attr('disabled', true);
			this.window.ui.aspect.attr('disabled', true);		
		},
		
		removeLayer: function() {
			this.reset();
			//this.cropPhoto().jcrop.release();
			this.buttonBar.factory.trigger('resizeRemoveLayer');
		},
		
		startCrop: function() {
			var manipulation = this.getManipulation();
			
			if(manipulation) {
				this.window.ui.width.val(manipulation.data.width);
				this.window.ui.height.val(manipulation.data.height);
				
				if(manipulation.data.aspect === true || manipulation.data.aspect === "true") {
					this.window.ui.aspect.attr('checked', true); 	
				}
				else {					
					this.window.ui.aspect.attr('checked', false);
				}
				
				this.base();
			}
			else {
				this.reset();
			}
		},
		
		apply: function() {
			var t = this;
			
			this.addManipulation(true, {
				aspect: this.getMaintainAspect(),
				width: this.getWidth(),
				height: this.getHeight()
			});
			
			this.buttonBar.factory.trigger('resize', this,this.getWidth(), this.getHeight());
			this.render();
		},
		
		initCrop: function(manipulation) {
			this.buttonBar.factory.trigger('resizeInitCrop', this, manipulation);
		},
		
		toggleLayer: function(visibility, render) {
			this.base(visibility, render);
		},
		
		buildWindow: function() {	
			this.base({ buttons: this.buttons });
			
			var t = this, html = $([
				'<div class="photo-frame-inline photo-frame-margin-bottom">',
					'<label for="photo-frame-width" class="photo-frame-small photo-frame-margin-right">'+PhotoFrame.Lang.width+'</label>',
					'<input type="text" name="photo-frame-width" value="" id="photo-frame-width" class="photo-frame-small" />',
				'</div>',
				'<div class="photo-frame-inline">',
					'<label for="photo-frame-height" class="photo-frame-small photo-frame-margin-right">'+PhotoFrame.Lang.height+'</label>',
					'<input type="text" name="photo-frame-height" value="" id="photo-frame-height" class="photo-frame-small" />',
				'</div>',
				'<div class="photo-frame-margin-top">',
					'<label><input type="checkbox" name="photo-frame-maintain-ratio" id="photo-frame-maintain-ratio" /> '+PhotoFrame.Lang.maintain_ratio+'</label>',
				'</div>'
			].join(''));
			
			this.window.ui.content.html(html);
			this.window.ui.width  = this.window.ui.content.find('#photo-frame-width');
			this.window.ui.height = this.window.ui.content.find('#photo-frame-height');
			this.window.ui.aspect = this.window.ui.content.find('#photo-frame-maintain-ratio');	
			
			this.window.ui.content.find('input').keypress(function(e) {
				if(e.keyCode == 13) {
					t.apply();
					e.preventDefault();
				}
			});
			
			this.buttonBar.factory.bind('render', function() {
				if(t.getManipulation()) {
					t.initCrop();
				}
			});
			
			this.window.ui.content.find('input[type="text"]').keyup(function(e) {
				if(t.getMaintainAspect() && t.cropPhoto()) {
					var aspect, target, val = $(this).val(), id = $(e.target).attr('id');
					
					if(id == 'photo-frame-height') {
						aspect = t.cropPhoto().width() / t.cropPhoto().height();
						target = '#photo-frame-width';
						val   *= aspect;
					}
					else {						
						aspect = t.cropPhoto().height() / t.cropPhoto().width();
						target = '#photo-frame-height';
						val   *= aspect;
					}
					
					t.window.ui.content.find(target).val(t.cropPhoto().round(val, 1));
				}
			});
		}
	});

}(jQuery));