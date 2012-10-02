<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Textarea_IBField extends IBFieldtype {

	public function display_field($data = '')
	{
		return '<textarea name="'.$this->name.'" id="'.$this->id.'">'.$data.'</textarea>';
	}

}