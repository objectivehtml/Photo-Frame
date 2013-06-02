<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Photo_frame_colors {
	
	public function __construct()
	{
		$this->EE =& get_instance();
		
		$this->EE->load->config('photo_frame_color_index');
		
		require_once(APPPATH . 'config/colors.php');
		
		$this->config_colors = $colors;
	}
	
	public function color_index($color)
	{
		$photo_frame_colors = config_item('photo_frame_color_index');
			
		if(isset($photo_frame_colors[$color]))
		{
			return explode(',', $photo_frame_colors[$color]);
		}
		else
		{
			if(!isset($this->config_colors[$color]))
			{
				if(preg_match('/(^rgb\\((.*)\\)$)/u', $color, $matches))
				{
					$color = explode(',', $matches[2]);
					
					return $this->trim_array($color);
				}
				
				if(preg_match("/^#.{6}$/u", $color))
				{
					$color = $this->hex2rgb($color);
					
					return $color['red'].','.$color['green'].','.$color['blue'];
				}
				
				if(preg_match('/\\d*,(\\s|)|\\d*$/u', $color))
				{					
					return $this->trim_array(explode(',', $color));
				}
				
				return FALSE;
			}
			
			return $this->hex2rgb($this->config_colors[$color]);
		}	
		
		return FALSE;
	}
	
	public function trim_array($array)
	{		
		foreach($array as $index => $value)
		{
			$array[$index] = trim($value);
		}
	
		return $array;		
	}
	
	public function rgb2hex($rgb)
	{
		$hex = "#";
		$hex .= str_pad(dechex($rgb[0]), 2, "0", STR_PAD_LEFT);
		$hex .= str_pad(dechex($rgb[1]), 2, "0", STR_PAD_LEFT);
		$hex .= str_pad(dechex($rgb[2]), 2, "0", STR_PAD_LEFT);
	
		return $hex; // returns the hex value including the number sign (#)
	}
	
	public function hex2rgb($hexStr, $returnAsString = false, $seperator = ',')
	{
	    $hexStr = preg_replace("/[^0-9A-Fa-f]/", '', $hexStr); // Gets a proper hex string
	    $rgbArray = array();
	    if (strlen($hexStr) == 6) { //If a proper hex code, convert using bitwise operation. No overhead... faster
	        $colorVal = hexdec($hexStr);
	        $rgbArray['red'] = 0xFF & ($colorVal >> 0x10);
	        $rgbArray['green'] = 0xFF & ($colorVal >> 0x8);
	        $rgbArray['blue'] = 0xFF & $colorVal;
	    } elseif (strlen($hexStr) == 3) { //if shorthand notation, need some string manipulations
	        $rgbArray['red'] = hexdec(str_repeat(substr($hexStr, 0, 1), 2));
	        $rgbArray['green'] = hexdec(str_repeat(substr($hexStr, 1, 1), 2));
	        $rgbArray['blue'] = hexdec(str_repeat(substr($hexStr, 2, 1), 2));
	    } else {
	        return false; //Invalid hex color code
	    }
	    return $returnAsString ? implode($seperator, $rgbArray) : $rgbArray; // returns the rgb string or the associative array
	}
	
}