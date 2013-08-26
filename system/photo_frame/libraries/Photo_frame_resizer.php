<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

/**
 * Photo Frame
 * 
 * @package		Photo Frame
 * @author		Justin Kimbrell
 * @copyright	Copyright (c) 2012, Justin Kimbrell
 * @link 		http://www.objectivehtml.com/photo-frame
 * @version		0.7.0
 * @build		20121031
 */

if(class_exists('ImageEditor'))
{
	require_once PATH_THIRD . 'photo_frame/libraries/ImageEditor.php';
}

class Photo_frame_resizer {
	
	public function crop($path, $x, $y, $width, $height, $sourceWidth, $sourceHeight, $mode = 'crop')
	{
		$obj = ImageEditor::init($path);

		if($mode == 'crop')
		{
			$resizeWidth  = FALSE;
			$resizeHeight = FALSE;

			$x = $x - ($width / 2);
			$y = $y - ($height / 2);

			if(($max_width = $x + $width) && $max_width > $obj->getWidth())
			{
				$x -= $max_width - $obj->getWidth();
			}

			if(($max_height = $y + $height) && $max_height > $obj->getHeight())
			{
				$y -= $max_height - $obj->getHeight();
			}

			if($x <= 0)
			{
				$x = 0;
				$resizeWidth = $width;
				$width = $obj->getWidth();
			}

			if($y <= 0)
			{
				$y = 0;
				$resizeHeight = $height;
				$height = $obj->getHeight();
			}

			$obj->crop($width, $height, $x, $y, 0, 0, $width, $height);

			if($resizeWidth && !$resizeHeight) {
				$obj->resizeToWidth($resizeWidth);
			}

			if($resizeHeight && !$resizeWidth) {
				$obj->resizeToHeight($resizeHeight);
			}

			if($resizeHeight && $resizeWidth) {
				$this->resize($resizeHeight, $resizeWidth);
			}

		}
		elseif($mode == 'fit')
		{
			if($width >= $height)
			{
				if($width > $obj->getWidth() || $obj->getWidth() > $obj->getHeight()) {
					$obj->resizeToWidth($width);
				}
				else if($height > $obj->getHeight() || $obj->getHeight() > $obj->getWidth()) {
					$obj->resizeToHeight($height);
				}
			}
			else
			{
				if($height > $obj->getHeight() || $obj->getHeight() > $obj->getWidth()) {
					$obj->resizeToHeight($height);
				}
				else if($width > $obj->getWidth() || $obj->getWidth() > $obj->getHeight()) {
					$obj->resizeToWidth($width);
				}
			}
		}
		elseif($mode == 'stretch')
		{
			$obj->resize($width, $height);
		}
	}

	public function cache($path, $cache_path = FALSE, $cache_leng = FALSE)
	{
		if(!$cache_path)
		{
			$cache_path = config_item('photo_frame_front_end_cache_path');
		}

		$cache_path = rtrim($cache_path, '/') . '/';
		$filename   = basename($path);

		if(!$cache_path)
		{
			show_error('The Photo Frame cache path has not been set. You must open the photo_frame_config.php file and set config path.');
		}

		if(!is_dir($cache_path))
		{
			show_error('The following directory does not exist: <b>'.$cache_path.'</b>. Make sure the directory exists and has read and write permissions.');
		}

		if(!is_writable($cache_path))
		{
			show_error('The following directory is not writable: <b>'.$cache_path.'</b>. Make sure the directory exists and has read and write permissions.');
		}

		if(!file_exists($path) || $this->is_expired($path))
		{
			copy($path, $cache_path . $filename);
		}

		return $cache_path . $filename;
	}

	public function is_expired($path, $cache_leng = FALSE)
	{
		if(!$cache_leng)
		{
			$cache_leng = config_item('photo_frame_front_end_cache_length');
		}

		if(time() - filemtime($path) > $cache_leng)
		{
			return TRUE;
		}

		return FALSE;
	}
}
