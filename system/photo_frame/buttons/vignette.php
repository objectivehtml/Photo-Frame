<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class VignetteButton extends PhotoFrameButton {
	
	public $name = 'Vignette';
	
	public function render($manipulation = array())
	{
		$sharp = (float) $manipulation->data->sharp * .1;
		$level = (float) $manipulation->data->level * .01;
		
		$this->image->vignette($sharp, $level);
	}
}