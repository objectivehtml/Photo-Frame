(function($) {
	
	PhotoFrame.Buttons.Layers = PhotoFrame.Button.extend({
		
		/**
		 * An array of button objects
		 */
		
		buttons: [],
		
		/**
		 * An object of css classes
		 */
		
		classes: {
			layer: 'photo-frame-layer',
			layerIcon: 'photo-frame-layer-icon',
			layerEmpty: 'photo-frame-layer-empty',
			layerTitle: 'photo-frame-layer-title',
			layerActions: 'photo-frame-layer-actions',
			visible: 'photo-frame-toggle-visible',
			trash: 'photo-frame-trash',			
		},
		
		/**
		 * The button description 
		 */
		
		description: false,
		
		/**
		 * The button icon
		 */
		
		icon: 'layers',
		
		/**
		 * An object of icon classes
		 */
		
		icons: {
			eye: 'eye',
			eyeClose: 'eye-off',
			trash: 'trash'
		},
		
		/**
		 * Name of the button
		 */
		
		name: false,
		
		/**
		 * The JSON object used for Window settings 
		 */
		
		windowSettings: {
			css: 'photo-frame-layers',
			title: false
		},
		
		constructor: function(buttonBar) {
			var t = this;
			
			this.buttons = [{
				text: PhotoFrame.Lang.rerender,
				css: 'photo-frame-tool-window-save',
				onclick: function(e, button) {
					t.render(function() {
						t.buttonBar.factory.trigger('layerWindowReRender');
					});
					t.refresh();
				}
			}];
			
			this.name				  = PhotoFrame.Lang.layers;
			this.description          = PhotoFrame.Lang.layers_desc;
			this.windowSettings.title = PhotoFrame.Lang.layers;
					
			this.base(buttonBar);
			// this.buttonBar.factory.layerWindow = this;
		},
		
		buildWindow: function() {	
			var t = this;
			
			this.base({buttons: this.buttons});
			
			this.buttonBar.factory.bind('startCropEnd', function() {
				t.refresh();
			});
			
			this.buttonBar.factory.bind('removeManipulation', function() {
				t.refresh();
			});
			
			this.buttonBar.factory.bind('showManipulation', function() {
				t.refresh();
			});
			
			this.buttonBar.factory.bind('hideManipulation', function() {
				t.refresh();
			});
			
			this.buttonBar.factory.bind('addManipulation', function(obj, name, exists) {
				var content = $(t.window.ui.content).get(0);
				
				t.refresh();
				
				if(!exists) {
					content.scrollTop = content.scrollHeight;
				}
			});
			
		},
		
		toggleLayer: function(name, manipulation, ui) {
			manipulation.visible = manipulation.visible ? false : true;
			this.buttonBar.factory.trigger(name+'ToggleLayer', manipulation);
			this.refresh();
		},
		
		removeLayer: function(name, manipulation, ui) {
			this.buttonBar.factory.trigger(name+'RemoveLayer', manipulation);
			delete this.buttonBar.factory.cropPhoto.manipulations[name];			
			this.refresh();
		},
		
		refresh: function(photo) {
			var count = 0, t = this, classes = {}, buttons = {}, photo = photo ? photo : this.buttonBar.factory.cropPhoto;
						
			this.window.ui.content.html('');
			
			for(var y in this.buttonBar.buttons) {
				var button = this.buttonBar.buttons[y];				
				buttons[button.name.toLowerCase()] = button;
			}
			
			$.each(photo.manipulations, function(x, manipulation) {
				var manipulation = photo.manipulations[x];
				var button       = buttons[x];
				
				if(button) {
					var title = button.name.toLowerCase();
					
					var visible = $('<a href="#" class="'+t.classes.visible+'"><i class="icon-'+(manipulation.visible ? t.icons.eye : t.icons.eyeClose)+'"></i></a>');
					var trash   = $('<a href="#" class="'+t.classes.trash+'"><i class="icon-'+t.icons.trash+'"></i></a>');
					
					var html = $([
					'<div class="'+t.classes.layer+' '+t.buttonBar.factory.classes.clearfix+'">',
						'<div class="'+t.classes.layerIcon+'"><i class="icon-'+(button.icon ? button.icon : title)+'"></i></div>',
						'<div class="'+t.classes.layerTitle+'">'+button.window.title+'</div>',
						'<div class="'+t.classes.layerActions+'"></div>',
					'</div>'
					].join(''));
					
					html.find('.'+t.classes.layerActions).append(visible);
					html.find('.'+t.classes.layerActions).append(trash);
					
					visible.click(function(e) {
						t.toggleLayer(x, manipulation, visible);
						button.toggleLayer(manipulation.visible);		
						e.preventDefault();
					});
					
					trash.click(function(e) {
						t.removeLayer(x, manipulation, trash);
						button.removeLayer();
						if(x != 'crop') {
							// no need to render when removing the crop layer
							t.render();
						}
						e.preventDefault();
					});
					
					t.window.ui.buttons.show();
					t.window.ui.content.append(html);
					count++;
				}
			});			
			
			if(!count) {	
				var html = $([
					'<div class="'+t.classes.layer+' '+t.buttonBar.factory.classes.clearfix+'">',
						'<div class="'+t.classes.layerEmpty+'">'+PhotoFrame.Lang.no_layers+'</div>',
						'<div class="'+t.classes.layerActions+'"></div>',
					'</div>'
				].join(''));
				
				t.window.ui.buttons.hide();				
				t.window.ui.content.append(html);
			}
		},
		
		startCrop: function(photo) {			
			this.refresh(photo);			
		}
	});

}(jQuery));