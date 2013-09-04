<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

/**
 * Photo Frame
 * 
 * @package		Photo Frame
 * @author		Justin Kimbr
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
	
	/**
	 * The photo id
	 */

	public $id = FALSE;

	/**
	 * The file path of the photo to resize
	 */

	public $path;

	/**
	 * The url of the photo to resize
	 */

	public $url;

	/**
	 * The filename of the cached image. FALSE if not set yet.
	 */

	public $filename = FALSE;

	/**
	 * The base file path for the cache directory
	 */

	public $cache_path;

	/**
	 * The base url for the cache directory
	 */

	public $cache_url;

	/**
	 * The height of the resized photo
	 */

	public $height;

	/**
	 * The width of the resized photo
	 */

	public $width;

	/**
	 * The x coordinate of the focal point
	 */

	public $x;

	/**
	 * The y coordinate of the focal point
	 */

	public $y;

	/**
	 * Resize the cropped photo?
	 */

	public $resize = TRUE;

	/**
	 * Crop Mode (crop|fit|stretch)
	 */

	public $mode = 'crop';


	public function __construct($params = array())
	{
		$this->set_params($params);
	}


	public function set_params($params = array())
	{
		foreach($params as $param => $value)
		{
			$this->set_param($param, $value);
		}
	}

	public function set_param($param, $value)
	{
		if(property_exists($this, $param))
		{
			$this->$param = $value;
		}
	}

	public function get_param($param, $value)
	{
		if(property_exists($this, $param))
		{
			return $this->$param;
		}

		return NULL;
	}

	public function crop()
	{
		$obj = ImageEditor::init($this->path);

		$actualWidth = $obj->getWidth();
		$actualHeight = $obj->getHeight();

		if($this->mode == 'crop')
		{
			$resizeWidth  = FALSE;
			$resizeHeight = FALSE;

			$x = $this->x - ($this->width / 2);
			$y = $this->y - ($this->height / 2);

			if(($max_width = $x + $this->width) && $max_width > $actualWidth)
			{
				$x -= $max_width - $actualWidth;
			}

			if(($max_height = $y + $this->height) && $max_height > $actualHeight)
			{
				$y -= $max_height - $actualHeight;
			}

			if($x <= 0)
			{
				$x = 0;

				if($actualWidth <= $this->height) {
					$resizeWidth = $this->width;
					$this->width = $actualWidth;
				}
			}
			
			if($y <= 0)
			{
				$y = 0;

				if($actualHeight <= $this->height) {
					$resizeHeight = $this->height;
					$this->height = $actualHeight;
				}
			}

			if($this->width > $actualWidth)
			{
				$resizeWidth = $this->width;
				$this->width = $actualWidth;
			}

			if($this->height > $actualHeight)
			{
				$resizeHeight = $this->height;
				$this->height = $actualHeight;
			}

			$obj->crop($this->width, $this->height, $x, $y, 0, 0, $this->width, $this->height);

			if($this->resize)
			{	
				if($resizeWidth && !$resizeHeight) {
					$obj->resizeToWidth($resizeWidth);
				}

				if($resizeHeight && !$resizeWidth) {
					$obj->resizeToHeight($resizeHeight);
				}

				if($resizeHeight && $resizeWidth) {
					$obj->resize($resizeWidth, $resizeHeight);
				}
			}
		}
		elseif($this->mode == 'fit' && $this->resize)
		{
			if($this->width >= $this->height)
			{
				if($this->width > $obj->getWidth() || $obj->getWidth() > $obj->getHeight()) {
					$obj->resizeToWidth($this->width);
				}
				else if($this->height > $obj->getHeight() || $obj->getHeight() > $obj->getWidth()) {
					$obj->resizeToHeight($this->height);
				}
			}
			else
			{
				if($this->height > $obj->getHeight() || $obj->getHeight() > $obj->getWidth()) {
					$obj->resizeToHeight($this->height);
				}
				else if($this->width > $obj->getWidth() || $obj->getWidth() > $obj->getHeight()) {
					$obj->resizeToWidth($this->width);
				}
			}
		}
		elseif($this->mode == 'stretch' && $this->resize)
		{
			$obj->resize($this->width, $this->height);
		}
	}

	public function cache()
	{
		if(!$this->cache_path)
		{
			$this->cache_path = config_item('photo_frame_front_end_cache_path');
		}

		if(!$this->cache_url)
		{
			$this->cache_url = config_item('photo_frame_front_end_cache_url');
		}

		$this->cache_path = rtrim($this->cache_path, '/') . '/';
		$this->filename   = ($this->id ? $this->id . '--' : '') . basename($this->path);

		if(!$this->cache_path)
		{
			show_error('The Photo Frame cache path has not been set. You must open the photo_frame_config.php file and set config path.');
		}

		if(!is_dir($this->cache_path))
		{
			show_error('The following directory does not exist: <b>'.$cache_path.'</b>. Make sure the directory exists and has read and write permissions.');
		}

		if(!is_writable($this->cache_path))
		{
			show_error('The following directory is not writable: <b>'.$cache_path.'</b>. Make sure the directory exists and has read and write permissions.');
		}

		if(!file_exists($this->path) || $this->is_expired($this->path))
		{
			copy($this->path, $this->cache_path . $this->filename);
		}

		$this->path = $this->cache_path . $this->filename;
		$this->url  = $this->cache_url  . $this->filename;
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
