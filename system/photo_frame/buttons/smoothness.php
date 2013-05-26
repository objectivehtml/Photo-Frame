<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class SmoothnessButton extends PhotoFrameButton {
	
	public $name = 'Smoothness';
	
	public function render($manipulation = array())
	{
		$this->image->smoothness((float) $manipulation->data->value);
	}
}