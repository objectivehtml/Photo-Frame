<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class FlipButton extends PhotoFrameButton {
	
	public $name = 'Flip';
	
	public function render($manipulation = array())
	{
		$this->image->flip($manipulation->data->direction);
	}
}