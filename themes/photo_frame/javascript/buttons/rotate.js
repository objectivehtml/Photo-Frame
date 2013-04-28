(function($) {
	
	PhotoFrame.Buttons.Rotate = PhotoFrame.Button.extend({
		
		name: 'Rotate',
	
		description: 'The rotate an image by the defined degree.',
		
		constructor: function(buttonBar) {
			this.windowButtonText = PhotoFrame.Lang.rotate;	
			this.base(buttonBar);
		},
		
		apply: function() {			
			var d         = parseInt(this.ui.window.find('#photo-frame-rotate').val());
			var photo     = this.buttonBar.factory.ui.cropPhoto;
			var cropPhoto = this.buttonBar.factory.cropPhoto;
						
			photo.css({
				'-moz-transform':'rotate('+d+'deg)',
				'-webkit-transform':'rotate('+d+'deg)',
				'-o-transform':'rotate('+d+'deg)',
				'-ms-transform':'rotate('+d+'deg)'
			});
						
			cropPhoto.destroyJcrop();	
					
			this.buttonBar.factory.ui.crop.prepend(cropPhoto.ui.cropPhoto);
			cropPhoto.ui.cropPhoto.center();
			//cropPhoto.initJcrop();
			
		},
		
		buildWindow: function() {
			this.base();
			
			var html = $([
				'<div class="photo-frame-inline">',
					'<label for="photo-frame-rotate">'+PhotoFrame.Lang.degrees+'</label>',
					'<input type="text" name="photo-frame-rotate" value="" id="photo-frame-rotate" class="photo-frame-small" />',
				'</div>'
			].join(''));
			
			this.ui.windowContent.html(html);
		}
		
	});

}(jQuery));