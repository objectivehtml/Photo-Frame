<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

/**
 * Authenticate
 * 
 * @package		Authenticate
 * @author		Justin Kimbrell
 * @copyright	Copyright (c) 2012, Justin Kimbrell
 * @link 		http://www.objectivehtml.com/authenticate
 * @version		1.2.1
 * @build		20120627
 */
 
class Photo_frame {
	
	public function __construct()
	{
		$this->EE =& get_instance();
	}
	
	public function crop_action()
	{		
		$this->EE->load->library('photo_frame_lib');
		
		$this->EE->photo_frame_lib->crop_action();
	}
	
	private function parse($vars, $tagdata = FALSE)
	{
		if($tagdata === FALSE)
		{
			$tagdata = $this->EE->TMPL->tagdata;
		}
			
		return $this->EE->TMPL->parse_variables($tagdata, $vars);
	}
	
	private function param($param, $default = FALSE, $boolean = FALSE, $required = FALSE)
	{
		$name	= $param;
		$param 	= $this->EE->TMPL->fetch_param($param);
		
		if($required && !$param) show_error('You must define a "'.$name.'" parameter in the '.__CLASS__.' tag.');
			
		if($param === FALSE && $default !== FALSE)
		{
			$param = $default;
		}
		else
		{				
			if($boolean)
			{
				$param = strtolower($param);
				$param = ($param == 'true' || $param == 'yes') ? TRUE : FALSE;
			}			
		}
		
		return $param;			
	}
}