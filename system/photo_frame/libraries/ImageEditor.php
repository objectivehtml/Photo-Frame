<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

require_once PATH_THIRD . 'photo_frame/libraries/BaseClass.php';

class ImageEditor extends BaseClass {
 
	protected $image = FALSE;
	
	protected $meta;
	
	protected $type;
	
	protected $filename;
	
	protected $compression = 100; // JPEG only
	
	protected $bgd_color = 0;
	
	/* -----------------------------------------
		Static Functions
	----------------------------------------- */
	
	/**
	 * Return ImageEditor object
	 *
	 * @access	public
	 * @param	string 	Valid image filepath
	 * @return	object
	 */
	public static function init($file)
	{
		return new ImageEditor($file);
	}
	
	/**
	 * Return Image Height
	 *
	 * @access	public
	 * @param	string 	Valid image filepath
	 * @return	object
	 */
	public static function height($file)
	{
		return ImageEditor::init($file)->getHeight();
	}
	
	/**
	 * Return Image Object
	 *
	 * @access	public
	 * @param	string 	Valid image filepath
	 * @return	object
	 */			
	public static function image($file)
	{
		return ImageEditor::init($file)->getImage();
	}
	
	/**
	 * Return Image Type
	 *
	 * @access	public
	 * @param	string 	Valid image filepath
	 * @return	object
	 */
	public static function type($file)
	{
		return ImageEditor::init($file)->getType();
	}
	
	/**
	 * Return Image Width
	 *
	 * @access	public
	 * @param	string 	Valid image filepath
	 * @return	object
	 */
	public static function width($file)
	{
		return ImageEditor::init($file)->getWidth();
	}
	
	/**
	 * Convert hex to rgb
	 *
	 * @access	public
	 * @param	string 	Hexcode
	 * @return	object
	 */	
	public static function hex2rgb($hex)
	{
		$hex = str_replace("#", "", $hex);
		
		if(strlen($hex) == 3) {
			$r = hexdec(substr($hex,0,1).substr($hex,0,1));
			$g = hexdec(substr($hex,1,1).substr($hex,1,1));
			$b = hexdec(substr($hex,2,1).substr($hex,2,1));
		} else {
			$r = hexdec(substr($hex,0,2));
			$g = hexdec(substr($hex,2,2));
			$b = hexdec(substr($hex,4,2));
		}
		
		$rgb = array($r, $g, $b);
		
		return implode(",", $rgb); // returns the rgb values separated by commas
	}
	
	/**
	 * Convert rgb to hex
	 *
	 * @access	public
	 * @param	string 	Rgb string
	 * @return	object
	 */	
	public static function rgb2hex($rgb)
	{
		$spr = str_replace(array(',',' ','.'), ':', $rgb); 
		$e   = explode(":", $spr); 
		$out = '#';
		
		if(count($e) != 3) return false; 
		 
		for($i = 0; $i<3; $i++) 
			$e[$i] = dechex(($e[$i] <= 0)?0:(($e[$i] >= 255)?255:$e[$i])); 
		
		for($i = 0; $i<3; $i++) 
			$out .= ((strlen($e[$i]) < 2)?'0':'').$e[$i]; 
		  
		return strtoupper($out); 
	}
	
	/*---------------------------------------------------------------------------*/
	
	/**
	 * Construct
	 *
	 * @access	public
	 * @param	string 	Valid image filepath
	 * @param 	array	An associative array of properties to set
	 * @return	
	 */
	
	public function __construct($filename, $params = array())
	{		
		parent::__construct($params);
		
		$this->filename = $filename = trim($filename);
		
		$meta = @getimagesize($filename);
		
		$this->meta = $meta;
		$this->type = $meta[2];
		
		switch($this->type) {
			case IMAGETYPE_JPEG:
				$this->image = imagecreatefromjpeg($filename);
				break;
			case IMAGETYPE_GIF:
				$this->image = imagecreatefromgif($filename);
				break;
			case IMAGETYPE_PNG:
				$this->image = imagecreatefrompng($filename);
				break;
		}
		
		if(!$this->image)
		{
			return FALSE;
		}
	}
	
	
	/**
	 * Save an image object to a file
	 *
	 * @access	public
	 * @param	mixed 	Valid image filepath. If FALSE, filename property is used.
	 * @param	mixed 	File permissions. If NULL, permissions will be writable
	 * @return	object
	 */
	public function save($filename = FALSE, $permissions = DIR_WRITE_MODE)
	{
		//header('Content-Type: image/'.$this->type);
		
		if(!$filename)
		{
			$filename = $this->filename;
		}
		
		switch($this->type) {
			case IMAGETYPE_JPEG:
				imagejpeg($this->image, $filename, $this->compression);
				break;
			case IMAGETYPE_GIF:
				imagegif($this->image, $filename);
				break;
			case IMAGETYPE_PNG:
			    // need this for transparent png to work          
			    imagealphablending($this->image, false);
			    imagesavealpha($this->image,true);
			    imagepng($this->image,$filename);
			    break;
		}
		  
		if( $permissions != null)
		{
			chmod($this->filename, $permissions);
		}
	}
	
	
	/**
	 * Get the image object
	 *
	 * @access	public
	 * @return	object
	 */
	public function getImage()
	{
		return $this->image;
	}
	
	
	/**
	 * Get the image tyoe
	 *
	 * @access	public
	 * @return	object
	 */
	public function getType($return_int = FALSE)
	{
		if($return_int)
		{
			return $this->type;	
		}
		
		switch($this->type) {
			case IMAGETYPE_JPEG:
				return 'jpeg';
			case IMAGETYPE_GIF:
				return 'gif';
			case IMAGETYPE_PNG:
				return 'png';
		}
	}
	
	
	/**
	 * Get the image width
	 *
	 * @access	public
	 * @return	object
	 */
	public function getWidth()
	{
      return imagesx($this->image);
	}
	
	
	/**
	 * Get the image height
	 *
	 * @access	public
	 * @return	object
	 */
	public function getHeight()
	{
      return imagesy($this->image);
	}
	
	
	/**
	 * Get the image size
	 *
	 * @access	public
	 * @return	object
	 */
	public function getSize()
	{
      return filesize($this->filename);
	}
	
	
	/**
	 * Resize the image to specified height
	 *
	 * @access	public
	 * @param   int		The height of the image
	 * @return	object
	 */
	public function resizeToHeight($height)
	{	
		$ratio = $height / $this->getHeight();
		$width = $this->getWidth() * $ratio;
		
		$this->resize($width,$height);
	}
	
	
	/**
	 * Resize the image to specified width
	 *
	 * @access	public
	 * @param   int		The width of the image
	 * @return	object
	 */
	public function resizeToWidth($width)
	{
		$ratio  = $width / $this->getWidth();
		$height = $this->getHeight() * $ratio;
		
		$this->resize($width,$height);
	}
	
	
	/**
	 * Resize the image to specified scale
	 *
	 * @access	public
	 * @param   int		The scale of the image
	 * @return	object
	 */
	public function scale($scale)
	{
		$width  = $this->getWidth()  * $scale / 100;
		$height = $this->getHeight() * $scale / 100;
		$this->resize($width,$height);
	}
	
	
	/**
	 * Rotate an image to a specified angle
	 *
	 * @access	public
	 * @param   int		The rotation degree
	 * @param   int		Ignore the image transparency 
	 * @return	object
	 */
	public function rotate($angle = 0, $ignore_transparent = 0)
	{
		$this->image = imagerotate($this->image, $angle, $this->bgd_color, $ignore_transparent);
		
		$this->save();
	}
	
	
	/**
	 * Rename an image
	 *
	 * @access	public
	 * @param   string	A valid filepath with a filename included
	 * @return	object
	 */
	public function rename($filename)
	{
		if(file_exists($this->filename))
		{
			rename($this->filename, $filename);	
		}
	}
	
	
	/**
	 * Duplcate an image
	 *
	 * @access	public
	 * @param   string	A valid filepath with a filename included
	 * @param   int 	A new image width
	 * @param   int 	A new image height
	 * @param   int 	Resize an image to specified X coordinate
	 * @param   int 	Resize an image to specified Y coordinate
	 * @param   int 	Resize an image to specified X2 coordinate
	 * @param   int 	Resize an image to specified Y2 coordinate
	 * @return	object
	 */
	public function duplicate($filename, $width = FALSE, $height = FALSE, $x = 0, $y = 0, $x2 = 0, $y2 = 0)
	{	
		if(!file_exists($this->filename))
		{
			return;	
		}
		
		copy($this->filename, $filename);	
			
		$image = ImageEditor::init($filename);	
		
		if(!$width && $height)
		{
			$image->resizeToHeight($height);
		}
		else if($width && !$height)
		{
			$image->resizeToWidth($width);	
		}
		else if($width && $height)
		{
			$image->resize($width, $height, $x = 0, $y = 0, $x2 = 0, $y2 = 0);			
		}			
	}
	
	
	/**
	 * Resize an image
	 *
	 * @access	public
	 * @param   int 	A new image width
	 * @param   int 	A new image height
	 * @param   int 	Resize an image to specified X coordinate
	 * @param   int 	Resize an image to specified Y coordinate
	 * @param   int 	Resize an image to specified X2 coordinate
	 * @param   int 	Resize an image to specified Y2 coordinate
	 * @return	object
	 */
	public function resize($width, $height, $x = 0, $y = 0, $x2 = 0, $y2 = 0)
	{
		$resized_image = imagecreatetruecolor($width, $height);
		
		/* Check if this image is PNG or GIF, then set if Transparent*/  
		
		$resized_image = $this->preserve_transparency($resized_image, $width, $height);
		
		imagecopyresampled($resized_image, $this->image, $x2, $y2, $x, $y, $width, $height, $this->getWidth(), $this->getHeight());
		
		$this->image = $resized_image;
		
		$this->save();
	}
	
	
	/**
	 * Preserve image Transparancy
	 *
	 * @access	public
	 * @param   string	A image object
	 * @param   int 	A new image width
	 * @param   int 	A new image height
	 * @return	object
	 */
	public function preserve_transparency($image = FALSE, $width = FALSE, $height = FALSE)
	{
		$return = TRUE;
		
		if(!$image)
		{	
			$return = FALSE;
			$image = $this->image;	
		}
		
		if(!$height)
		{
			$height = $this->getHeight();	
		}
		
		if(!$width)
		{
			$width = $this->getWidth();	
		}
		
		if(($this->type == IMAGETYPE_GIF) || ($this->type==IMAGETYPE_PNG)){
			imagealphablending($image, false);
			imagesavealpha($image,true);
			$transparent = imagecolorallocatealpha($image, 255, 255, 255, 127);
			imagefilledrectangle($image, 0, 0, $width, $height, $transparent);
		}
		
		if($return)
		{
			return $image;
		}
		else
		{
			$this->image = $image;
		}
	}
	
	
	/**
	 * Crop Image
	 *
	 * @access	public
	 * @param   int 	A new image width
	 * @param   int 	A new image height
	 * @param   int 	Resize an image to specified X coordinate
	 * @param   int 	Resize an image to specified Y coordinate
	 * @param   int 	Resize an image to specified X2 coordinate
	 * @param   int 	Resize an image to specified Y2 coordinate
	 * @return	object
	 */
	public function crop($width, $height, $x = 0, $y = 0, $x2 = 0, $y2 = 0)
	{
		$resized_image = imagecreatetruecolor($width, $height);
		
		/* Check if this image is PNG or GIF, then set if Transparent*/  
		
		$this->preserve_transparency($resized_image, $width, $height);
		
		imagecopyresampled($resized_image, $this->image, $x2, $y2, $x, $y, $width, $height, $width, $height);
		
		$this->image = $resized_image;
		
		$this->save();
	}
	
	function averageColor($numColors = 8, $granularity = 10)
	{
		$r = 0;
		$g = 0;
		$b = 0;
		
		if(!$numColors)
		{
			$numColors = 8;
		}
		
		$colors = $this->getColorPalette($numColors, $granularity);
		$total  = count($colors);
		
		foreach($colors as $index => $color)
		{
			$r += (int) $color->r;
			$b += (int) $color->b;
			$g += (int) $color->g;
		}
		
		if($total > 0)
		{
			$r = (int) ($r / $total);
			$g = (int) ($g / $total);
			$b = (int) ($b / $total);
		}
		
		return (object) array(
			'r' => $r,
			'g' => $g,
			'b' => $b,
		);
	}
	
	function getColorPalette($numColors = 8, $granularity = 10) 
	{ 
		if($this->image === false) 
		{ 
			return false; 
		} 
		
		$imageFile   = $this->filename;
		$granularity = max(1, abs((int)$granularity)); 
		$colors      = array(); 
		$size        = getimagesize($imageFile); 
		
		// $img = @imagecreatefromjpeg($imageFile);
		// Andres mentioned in the comments the above line only loads jpegs, 
		// and suggests that to load any file type you can use this:
		
		$img = @imagecreatefromstring(file_get_contents($imageFile)); 
		
		if(!$img) 
		{ 
			user_error("Unable to open image file"); 
			return false; 
		} 
		
		for($x = 0; $x < $size[0]; $x += $granularity) 
		{ 
			for($y = 0; $y < $size[1]; $y += $granularity) 
			{ 
				$thisColor = imagecolorat($img, $x, $y); 
				$rgb       = imagecolorsforindex($img, $thisColor); 
				$red       = round(round(($rgb['red'] / 0x33)) * 0x33); 
				$green     = round(round(($rgb['green'] / 0x33)) * 0x33); 
				$blue      = round(round(($rgb['blue'] / 0x33)) * 0x33); 
				$thisRGB   = $red.','.$green.','.$blue; 
				
				if(array_key_exists($thisRGB, $colors)) 
				{ 
					$colors[$thisRGB]++; 
				} 
				else 
				{ 
					$colors[$thisRGB] = 1; 
				} 
			} 
		} 
		
		arsort($colors);
		
		$colors = array_slice(array_keys($colors), 0, $numColors); 
		$return = array();
		
		foreach($colors as $color)
		{
			$color = explode(',', $color);
			
			$return[] = (object) array(
				'r' => $color[0],
				'g' => $color[1],
				'b' => $color[2]
			);	
		}
		
		return $return;
	}
	
	public function filter($type)
	{
		imagefilter($this->image, $type);
		
		$this->save();
	}
	
	public function rgba($r, $g, $b, $a = 1)
	{
		imagefilter($this->image, IMG_FILTER_COLORIZE, $r, $g, $b, $a);
		
		$this->save();
	}
	
	public function contrast($level)
	{
		imagefilter($this->image, IMG_FILTER_CONTRAST, $level);
		
		$this->save();
	}
	
	public function brightness($level)
	{
		imagefilter($this->image, IMG_FILTER_BRIGHTNESS, $level);
		
		$this->save();
	}
	
	public function smoothness($level)
	{
		imagefilter($this->image, IMG_FILTER_SMOOTH, $level);
		
		$this->save();
	}
	
	public function sharpness($level = FALSE, $offset = 0)
	{	
		$sharpen = array(
			array(0.0, -1.0, 0.0),
			array(-1.0, 5.0, -1.0),
			array(0.0, -1.0, 0.0)
		);
		
		$this->convolution($sharpen, $level, $offset);
	}
	
	public function pixelate($level, $advanced = FALSE)
	{
		imagefilter($this->image, IMG_FILTER_PIXELATE, $level, $advanced);
		
		$this->save();
	}
	
	public function grayscale()
	{		
		imagefilter($this->image, IMG_FILTER_GRAYSCALE);
		
		$this->save();
	}
	
	public function sepia()
	{
		$this->grayscale();
		$this->brightness(-30);
		$this->rgba(90, 55, 30);
	}
	
	public function negative()
	{		
		imagefilter($this->image, IMG_FILTER_NEGATE);
		
		$this->save();
	}
	
	public function detectEdge()
	{		
		imagefilter($this->image, IMG_FILTER_EDGEDETECT);
		
		$this->save();
	}
	
	public function emboss()
	{		
		imagefilter($this->image, IMG_FILTER_EMBOSS);
		
		$this->save();
	}
	
	public function simpleBlur($type = 'gaussian')
	{		
		if($type == 'selective')
		{
			$type = IMG_FILTER_SELECTIVE_BLUR;	
		}
		else
		{
			$type = IMG_FILTER_GAUSSIAN_BLUR;
		}
		
		imagefilter($this->image, $type);
		
		$this->save();
	}
	
	public function removeMean()
	{		
		imagefilter($this->image, IMG_FILTER_MEAN_REMOVAL);
		
		$this->save();
	}
	
	public function flip($dir)
	{
		if(function_exists('imageflip'))
		{
			imageflip($this->image, 'IMG_FLIP_'.strtoupper($dir));
		}
		else
		{
			$this->_imageflip($dir);
		}
		
		$this->save();
	}
	
	public function convolution($matrix, $divisor = FALSE, $offset = 0)
	{
		if($divisor === FALSE)
		{
			$divisor = array_sum(array_map('array_sum', $matrix));
		}
		
		imageconvolution($this->image, $matrix, $divisor, $offset);
		
		$this->save();
	}
	
	public function vignette($sharp = .4, $level = .7)
	{
	    $width  = $this->getWidth();
	    $height = $this->getHeight();
		
	    for($x = 0; $x < $width; $x++)
	    {
	        for($y = 0; $y < $height; $y++)
	        {   
	            $index = imagecolorat($this->image, $x, $y);
	            $rgb   = imagecolorsforindex($this->image, $index);
	            $rgb   = $this->_vignette_effect($sharp, $level, $x, $y, $rgb);
	            $color = imagecolorallocate($this->image, $rgb['red'], $rgb['green'], $rgb['blue']);
	            imagesetpixel($this->image, $x, $y, $color);   
	        }
	    }
	    
	    $this->save();
	}
	
	public function border($thickness = 1, $r = 0, $g = 0, $b = 0, $usePixels = FALSE)
	{
		$color     = imagecolorallocate($this->image, $r, $g, $b);
		$x         = 0; 
	    $y         = 0; 
	    $x2        = $this->getWidth() - 1; 
	    $y2        = $this->getHeight() - 1;
	    
	    if(!$usePixels)
	    {
	    	$thickness = $this->getWidth() * ($thickness / 100);
	    }
	    
	    for($i = 0; $i < $thickness; $i++) 
	    { 
	        imagerectangle($this->image, $x++, $y++, $x2--, $y2--, $color); 
	    }
	    
	    $this->save();
	}
	
	public function storybook()
	{
	    $this->contrast(-15); 
	    $this->rgba(20, 0, 0);
	    $this->rgba(50, 50, 0); 
	    $this->rgba(0, 0, 30); 
	    $this->brightness(-25); 
	    $this->sharpness(.5); 
	}
	
	public function vintage()
	{
	    $this->contrast(-15);
	    $this->brightness(-15); 
	    $this->rgba(28, 0, 0);
	    $this->rgba(20, 10, 0);
	    $this->vignette(.5, .4);
	    $this->rgba(0, 0, 45);
	    $this->rgba(15, 15, 0);
	    $this->contrast(-15);
	}
	
	public function gamma($input = 1.0, $output = 1.0)
	{
		imagegammacorrect($this->image, $input, $output);
		
		$this->save();
	}
	
	public function noise($level = 42, $r = 200, $g = 200, $b = 200, $a = 90)
	{
		$width  = $this->getWidth();
	    $height = $this->getHeight();
		
	    for($x = 0; $x < $width; $x++)
	    {
	        for($y = 0; $y < $height; $y++)
	        {   
	            if(rand(0, 100) <= $level)
	            {
	            	$color = imagecolorallocatealpha($this->image, $r, $g, $b, $a);
	            	
	            	imagesetpixel($this->image, $x, $y, $color);   
	            }
	        }
	    }
	    
	    $this->save();
	}
	
	public function newspaper()
	{
		$this->grayscale();
		$this->contrast(-110);
	}
	
	public function highlightColor($r, $g, $b, $level = 9500)
	{
		$width  = $this->getWidth();
	    $height = $this->getHeight();
		
	    for($x = 0; $x < $width; $x++)
	    {
	        for($y = 0; $y < $height; $y++)
	        {  
            	$rgb   = imagecolorsforindex($this->image, imagecolorat($this->image, $x, $y));
            	$diff  = pow($r - $rgb['red'], 2) + pow($g - $rgb['green'], 2) + pow($b - $rgb['blue'], 2);
            	
            	if($diff <= $level)
            	{
            		$color = imagecolorallocate($this->image, $rgb['red'], $rgb['green'], $rgb['blue']);
            	}
            	else
            	{
            		$color = $this->_yiq($rgb['red'], $rgb['green'], $rgb['blue']);		            	
            	}
            	
            	imagesetpixel($this->image, $x, $y, $color); 
	        }
	    }
	    
	    $this->save();
	}
	
	public function agedPaper()
	{
		$this->grayscale();
		$this->rgba(15, 7, 0);
		$this->contrast(-110);
	}
	
	private function _vignette_effect($sharp, $level, $x, $y, $rgb)
	{
	    $width  = $this->getWidth();
	    $height = $this->getHeight();
        $l      = sin(M_PI / $width * $x) * sin(M_PI / $height * $y);
        $l      = pow($l, $sharp);
        $l      = 1 - $level * (1 - $l);
        
        $rgb['red']   *= $l;
        $rgb['green'] *= $l;
        $rgb['blue']  *= $l;
        
        return $rgb;
    }
	
	private function _yiq($r, $g, $b) 
	{ 	
		$c = (max($r, $g, $b) + min($r, $g, $b)) / 2;
		
		return imagecolorallocate($this->image, $c, $c, $c);
	} 
	
	/**
	 * Flip the image (fallback for PHP < 5.5)
	 *
	 * @access	private
	 * @param	string  The direction of the flip (horizon|vertical|both)
	 * @return	void
	 */
	private function _imageflip($mode)
	{
		$width      = $this->getWidth();
	    $height     = $this->getHeight();
	    $src_x      = 0;
	    $src_y      = 0;
	    $src_width  = $width;
	    $src_height = $height;
			
	    switch ($mode)
	    {
	        case 'vertical': //vertical
	            $src_y      = $height -1;
	            $src_height = -$height;
	        break;
	
	        case 'horizontal': //horizontal
	            $src_x      = $width -1;
	            $src_width  = -$width;
	        break;
	
	        case 'both': //both
	            $src_x      = $width -1;
	            $src_y      = $height -1;
	            $src_width  = -$width;
	            $src_height = -$height;
	        break;
	    }
	    
	    $imgdest = imagecreatetruecolor($width, $height);
	
	    imagecopyresampled($imgdest, $this->image, 0, 0, $src_x, $src_y , $width, $height, $src_width, $src_height);
	    
	    $this->image = $imgdest;
	}
}


