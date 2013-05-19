<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class RotateButton extends PhotoFrameButton {
	
	public $name = 'Rotate';
	
	public function render($manipulation = array())
	{
		$this->image->rotate((float) $manipulation->data->degree);
	}
}