<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class BlurButton extends PhotoFrameButton {
	
	public $name = 'Blur';
	
	public function render($manipulation = array())
	{
		$value = (int) $manipulation->data->value;
		
		$gaussian = array(array(1.0, 2.0, 1.0), array(2.0, 4.0, 2.0), array(1.0, 2.0, 1.0));

		for($x = 1; $x <= $value; $x++)
		{
			$this->image->convolution($gaussian, 16);
		}
	}	
}