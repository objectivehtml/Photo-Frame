<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Input_IBFieldType extends InterfaceBuilderField {

	public $input_type;

	public function displayField($data = FALSE)
	{
		if($data !== FALSE)
		{
			$this->data = $data;	
		}
		
		$input_type = 'text';
			
		if(isset($this->settings['type']))
		{
			$input_type = $this->settings['type'];
		}
		
		return '<input type="'.$input_type.'" name="'.$this->getName().'" value="'.$this->formPrep($this->getData()).'" id="'.$this->getId().'" />';
	}
}
