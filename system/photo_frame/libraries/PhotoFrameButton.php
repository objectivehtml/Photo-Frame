<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

abstract class PhotoFrameButton {
	
	public $name;
	
	public $description;
	
	public function css()
	{
		return array();
	}
	
	public function javascript()
	{
		return array();
	}
	
}