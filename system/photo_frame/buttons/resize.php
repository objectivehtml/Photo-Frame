<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class ResizeButton extends PhotoFrameButton {
	
	protected $name = 'Resize';
	
	public function startCrop($data = array(), $settings = array())
	{
		ee()->photo_frame_lib->resize_maximum_size($data['cacheImgPath'], $settings);
		
		return array();
	}
	
	public function render($manipulation = array())
	{
		$this->image->resize((int) $manipulation->data->width, (int) $manipulation->data->height);
	}
}