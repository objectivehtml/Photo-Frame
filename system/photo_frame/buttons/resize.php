<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class ResizeButton extends PhotoFrameButton {
	
	public $name = 'Resize';
	
	public function render($manipulation = array())
	{
		$this->image->resize((int) $manipulation->data->width, (int) $manipulation->data->height);
	}
}