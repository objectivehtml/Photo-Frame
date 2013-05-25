(function($) {
	
	PhotoFrame.Buttons.Flip = PhotoFrame.Button.extend({
		
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
		
		icon: 'arrows-cw',
		
		/**
		 * The JSON object used for Window settings 
		 */
		
		windowSettings: {
		 	css: 'photo-frame-flip photo-frame-slider-window',		
			title: false,
			width: 120
		},
		
		constructor: function(buttonBar) {
			var t = this;
			
			this.name				  = PhotoFrame.Lang.flip;
			this.description		  = PhotoFrame.Lang.flip_desc;
			this.windowSettings.title = PhotoFrame.Lang.flip;
			
			/*
			this.buttons = [{
				text: PhotoFrame.Lang.flip,
				css: 'photo-frame-tool-window-save',
				onclick: function(e, button) {
					t.apply();
				}
			}];
			*/
			
			this.base(buttonBar);
		},
		
		startCrop: function() {
			var m = this.getManipulation();
			
			if(m) {
				if(m.data.direction == 'horizontal' || m.data.direction == 'both') {
					this.window.ui.h.attr('checked', 'checked'); 
				}
				if(m.data.direction == 'vertical' || m.data.direction == 'both') {
					this.window.ui.v.attr('checked', 'checked'); 
				}
				this.base();
			}
		},
		
		apply: function() {
			this.addManipulation(true, {
				direction: this.getDirection()
			});
			this.render();
		},
		
		toggleLayer: function(visibility, render) {
			this.base(visibility, render);
		},
		
		enable: function() {
			this.window.ui.h.attr('disabled', false);
			this.window.ui.v.attr('disabled', false);	
		},
		
		disable: function() {
			this.window.ui.h.attr('disabled', true);
			this.window.ui.v.attr('disabled', true);	
		},
		
		reset: function() {
			this.window.ui.h.val('').attr('checked', false);
			this.window.ui.v.val('').attr('checked', false);
		},
		
		getDirection: function() {
			var d = {
				h: this.window.ui.h.attr('checked') == 'checked' ? true : false,
				v: this.window.ui.v.attr('checked') == 'checked' ? true : false, 		
			};
			
			if(d.h && d.v) {
				return 'both';
			}
			else if(d.h) {
				return 'horizontal';
			}
			else if(d.v) {
				return 'vertical';
			}
			else {
				return 'none'
			}
		},
		
		buildWindow: function() {	
			this.base({ buttons: this.buttons });
						
			var t = this;	
						
			var html = $([
			'<div class="photo-frame-checkboxes">',
				'<label class="photo-frame-block photo-frame-margin-bottom"><input type="checkbox" name="photo-frame-flip[horizontal]" value="true" id="photo-frame-flip-h" class="photo-frame-small-margin-right photo-frame-small" /> Horizontally</label>',
				'<label class="photo-frame-block photo-frame-margin-bottom"><input type="checkbox" name="photo-frame-flip[vertically]" value="true" id="photo-frame-flip-v" class="photo-frame-small-margin-right photo-frame-small" /> Vertically</label>',
			'</div>'
			].join(''));
			
			this.window.ui.h = html.find('#photo-frame-flip-h');
			this.window.ui.v = html.find('#photo-frame-flip-v');
			
			html.find('input').change(function() {
				t.apply();	
			});
			
			this.window.ui.content.html(html);	
		}
	});

}(jQuery));