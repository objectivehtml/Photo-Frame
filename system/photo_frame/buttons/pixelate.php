<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class PixelateButton extends PhotoFrameButton {
	
	public $name = 'Pixelate';
	
	public function render($manipulation = array())
	{
		$this->image->pixelate((float) $manipulation->data->value, TRUE);
	}
}