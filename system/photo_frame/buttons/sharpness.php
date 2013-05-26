<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class SharpnessButton extends PhotoFrameButton {
	
	public $name = 'Sharpness';
	
	public function render($manipulation = array())
	{
		$level = 3 - ((float) $manipulation->data->value * .01);
		
		$this->image->sharpness($level, $level);
	}
}